import { apiMethods } from "./apiMethods";

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

//// Auth Api //////////
export const signInApi = (data) => apiMethods.POST("auth/login", data, headers);

// P R O D U C T

export const productsListDataApi = (data) =>
  apiMethods.POST(`kiosk/get-catalog`, data, headers);

export const updateVinculumInvApi = (data) =>
  apiMethods.POST(`kiosk/update/vinculum-inventory`, data, headers);

export const paymentLinkSendApi = (data) =>
  apiMethods.POST(`kiosk/send/payment-link`, data, headers);

export const createOrderApi = (data) =>
  apiMethods.POST(`kiosk/create-order`, data, headers);

export const downloadInvoiceApi = (data) =>
  apiMethods.POST(`kiosk/download-invoice`, data, headers);

export const cartPaymentOrderApi = (data) =>
  apiMethods.POST(`kiosk/payment/process-pos-payment`, data, headers);

export const validateCouponApi = (data) =>
  apiMethods.POST(`coupon/validate-coupon`, data, headers);

export const getCouponsApi = () => apiMethods.GET(`coupon/list`, {}, headers);

export const createCouponApi = (data) =>
  apiMethods.POST(`coupon/create`, data, headers);

export const toggleCouponApi = (data) =>
  apiMethods.POST(`coupon/toggle`, data, headers);
