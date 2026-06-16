import { CartItem } from "../constant/types";

export interface AppliedCoupon {
  code: string;
  discountType: "flat" | "percentage";
  discountValue: number;
  description?: string;
}

export interface LineDiscount {
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

export const getLineSubtotal = (item: Pick<CartItem, "price" | "quantity">) =>
  item.price * item.quantity;

export const calculateCouponBreakdown = (
  cart: CartItem[],
  coupon: AppliedCoupon | null
): CouponBreakdown => {
  const originalAmount = round2(
    cart.reduce((total, item) => total + getLineSubtotal(item), 0)
  );

  if (!coupon || cart.length === 0 || originalAmount === 0) {
    return {
      lines: cart.map((item) => {
        const lineOriginal = round2(getLineSubtotal(item));
        return {
          skuCode: item.skuCode,
          originalAmount: lineOriginal,
          discountAmount: 0,
          finalAmount: lineOriginal,
        };
      }),
      originalAmount,
      discountAmount: 0,
      finalAmount: originalAmount,
    };
  }

  const totalDiscount =
    coupon.discountType === "percentage"
      ? round2((originalAmount * coupon.discountValue) / 100)
      : round2(Math.min(coupon.discountValue, originalAmount));

  const lines: LineDiscount[] = [];
  let allocatedDiscount = 0;

  cart.forEach((item, index) => {
    const lineOriginal = round2(getLineSubtotal(item));
    let lineDiscount: number;

    if (index === cart.length - 1) {
      lineDiscount = round2(totalDiscount - allocatedDiscount);
    } else if (coupon.discountType === "percentage") {
      lineDiscount = round2((lineOriginal * coupon.discountValue) / 100);
    } else {
      lineDiscount = round2((lineOriginal / originalAmount) * totalDiscount);
    }

    allocatedDiscount = round2(allocatedDiscount + lineDiscount);

    lines.push({
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
  skuCode: string
): LineDiscount | undefined =>
  breakdown.lines.find((line) => line.skuCode === skuCode);
