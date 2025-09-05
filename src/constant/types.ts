export interface Product {
  id: number;
  skuCode: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserInfo {
  name: string;
  mobile: string;
}

export type PaymentMethod = "card" | "upi" | "cash" | null;
export type AppStep = "products" | "userInfo" | "payment" | "confirmation";
