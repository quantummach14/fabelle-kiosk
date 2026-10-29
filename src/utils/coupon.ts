import { CartItem } from "../constant/types";

export interface AppliedCoupon {
  code: string;
  discountType: "flat" | "percentage";
  discountValue: number;
  description?: string;
  applicableSkus?: string[] | null;
  minOrderValue?: number | null;
}

export interface LineDiscount {
  id?: number;
  skuCode: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export interface CouponBreakdown {
  lines: LineDiscount[];
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

const round2 = (value: number) => parseFloat(value.toFixed(2));

const normalizeSku = (sku: string) => (sku || "").trim().toUpperCase();

export const couponAppliesToItem = (
  item: Pick<CartItem, "skuCode">,
  coupon: AppliedCoupon | null
) => {
  if (!coupon?.applicableSkus?.length) return true;
  const allowed = new Set(coupon.applicableSkus.map(normalizeSku));
  return allowed.has(normalizeSku(item.skuCode));
};

export const cartHasEligibleItem = (
  cart: CartItem[],
  coupon: AppliedCoupon | null
) => cart.some((item) => couponAppliesToItem(item, coupon));

export const getLineSubtotal = (item: Pick<CartItem, "price" | "quantity">) =>
  item.price * item.quantity;

export const getCouponBasisAmount = (
  cart: CartItem[],
  coupon: AppliedCoupon | null
) =>
  round2(
    cart.reduce(
      (total, item) =>
        total + (couponAppliesToItem(item, coupon) ? getLineSubtotal(item) : 0),
      0
    )
  );

export const couponMeetsMinimum = (
  cart: CartItem[],
  coupon: AppliedCoupon | null
) => {
  if (!coupon) return false;
  const minimum = parseFloat(String(coupon.minOrderValue ?? 0)) || 0;
  if (minimum <= 0) return true;
  return getCouponBasisAmount(cart, coupon) >= minimum;
};

const undiscountedBreakdown = (cart: CartItem[]): CouponBreakdown => {
  const lines = cart.map((item) => {
    const lineOriginal = round2(getLineSubtotal(item));
    return {
      id: item.id,
      skuCode: item.skuCode,
      originalAmount: lineOriginal,
      discountAmount: 0,
      finalAmount: lineOriginal,
    };
  });
  const originalAmount = round2(
    lines.reduce((total, line) => total + line.originalAmount, 0)
  );
  return {
    lines,
    originalAmount,
    discountAmount: 0,
    finalAmount: originalAmount,
  };
};

export const calculateCouponBreakdown = (
  cart: CartItem[],
  coupon: AppliedCoupon | null
): CouponBreakdown => {
  if (!coupon || cart.length === 0 || !cartHasEligibleItem(cart, coupon)) {
    return undiscountedBreakdown(cart);
  }

  const originalAmount = round2(
    cart.reduce((total, item) => total + getLineSubtotal(item), 0)
  );
  const eligibleAmount = round2(
    cart.reduce(
      (total, item) =>
        total + (couponAppliesToItem(item, coupon) ? getLineSubtotal(item) : 0),
      0
    )
  );

  if (originalAmount === 0 || eligibleAmount === 0) {
    return undiscountedBreakdown(cart);
  }

  const totalDiscount =
    coupon.discountType === "percentage"
      ? round2((eligibleAmount * coupon.discountValue) / 100)
      : round2(Math.min(coupon.discountValue, eligibleAmount));

  const lastEligibleIndex = cart.reduce(
    (found, item, index) => (couponAppliesToItem(item, coupon) ? index : found),
    -1
  );

  const lines: LineDiscount[] = [];
  let allocatedDiscount = 0;

  cart.forEach((item, index) => {
    const lineOriginal = round2(getLineSubtotal(item));
    if (!couponAppliesToItem(item, coupon)) {
      lines.push({
        id: item.id,
        skuCode: item.skuCode,
        originalAmount: lineOriginal,
        discountAmount: 0,
        finalAmount: lineOriginal,
      });
      return;
    }

    let lineDiscount: number;
    if (index === lastEligibleIndex) {
      lineDiscount = round2(totalDiscount - allocatedDiscount);
    } else if (coupon.discountType === "percentage") {
      lineDiscount = round2((lineOriginal * coupon.discountValue) / 100);
    } else {
      lineDiscount = round2((lineOriginal / eligibleAmount) * totalDiscount);
    }

    allocatedDiscount = round2(allocatedDiscount + lineDiscount);

    lines.push({
      id: item.id,
      skuCode: item.skuCode,
      originalAmount: lineOriginal,
      discountAmount: lineDiscount,
      finalAmount: round2(lineOriginal - lineDiscount),
    });
  });

  const discountAmount = round2(
    lines.reduce((total, line) => total + line.discountAmount, 0)
  );

  return {
    lines,
    originalAmount,
    discountAmount,
    finalAmount: round2(originalAmount - discountAmount),
  };
};

export const getLineDiscountForItem = (
  breakdown: CouponBreakdown,
  itemId: number,
  skuCode?: string
): LineDiscount | undefined =>
  breakdown.lines.find((line) => line.id === itemId) ||
  breakdown.lines.find((line) => line.skuCode === skuCode);
