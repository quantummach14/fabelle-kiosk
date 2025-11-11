import { useMutation } from "@tanstack/react-query";
import {
  cartPaymentOrderApi,
  createOrderApi,
  paymentLinkSendApi,
  productsListDataApi,
  updateVinculumInvApi
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

export const useupdateVinculumInvApi = (successHandler) => {
  return useMutation({
    mutationFn: (data) => updateVinculumInvApi(data),
    onSuccess: (data) => {
      message.success("Inventory updated successfully!");
      if (successHandler) successHandler(data);
    },
    onError: (error) => {
      successHandler();
      message.error(error?.message || "Something went wrong");
    },
  });
};



export const useCartPaymentOrder = (successHandler) => {
  return useMutation({
    mutationFn: (data) => cartPaymentOrderApi(data),
    onSuccess: (data, record) => {
      successHandler(record.orderId);
    },
    onError: (error) => {
      message.error(error?.message || "Something went wrong");
    },
  });
};
