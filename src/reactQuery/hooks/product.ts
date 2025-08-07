import { useMutation } from "@tanstack/react-query";
import { paymentLinkSendApi, productsListDataApi } from "../api";
import { message } from "antd";

export const useProductListData = () => {
  return useMutation({
    mutationFn: (data) => productsListDataApi(data),
    onError: (error) => {
      message.error(error?.message || "Something went wrong");
    },
  });
};

export const usePaymentLinkSend = (setPaymentLoader) => {
  return useMutation({
    mutationFn: (data) => paymentLinkSendApi(data),
    onError: (error) => {
      setPaymentLoader(false);
      message.error(error?.message || "Something went wrong");
    },
  });
};
