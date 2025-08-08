import { useMutation } from "@tanstack/react-query";
import {
  createOrderApi,
  paymentLinkSendApi,
  productsListDataApi,
} from "../api";
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
    onSuccess: (data) => {
      setPaymentLoader(true);
      message.success(data?.message);
    },
    onError: (error) => {
      setPaymentLoader(false);
      message.error(error?.message || "Something went wrong");
    },
  });
};

export const useCreateOrder = (successHandler) => {
  return useMutation({
    mutationFn: (data) => createOrderApi(data),
    onSuccess: (data) => successHandler(),
    onError: (error) => {
      successHandler();
      message.error(error?.message || "Something went wrong");
    },
  });
};
