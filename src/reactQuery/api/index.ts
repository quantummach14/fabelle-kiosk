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

export const paymentLinkSendApi = (data) =>
  apiMethods.POST(`kiosk/send/payment-link`, data, headers);
