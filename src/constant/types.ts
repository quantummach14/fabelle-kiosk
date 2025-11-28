export interface Product {
  id: number;
  skuCode: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

export interface GrnProduct {
  id: number;
  name: string;
  sku: string;
  mrp: number;
  image: string;
  category: string;
  description: string;
  bin: string,
  manufacturingDate: string,
  expiryDate: string,
}

export interface CartItem extends Product {
  quantity: number;
}

export interface GrnCartItem extends GrnProduct {
  quantity: number;
}

export interface UserInfo {
  name: string;
  mobile: string;
}

export type PaymentMethod = "card" | "upi" | "cash" | null;
export type AppStep = "products" | "userInfo" | "payment" | "confirmation" | "grnPage" | "grnfinal";
