import { useMutation } from "@tanstack/react-query";
import {
  cartPaymentOrderApi,
  createOrderApi,
  paymentLinkSendApi,
  productsListDataApi,
  updateVinculumInvApi,
  downloadInvoiceApi,
  validateCouponApi
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

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: (data) => downloadInvoiceApi(data),

    onSuccess: (data) => {
      console.log("Invoice fetched:", data);
    },

    onError: (error) => {
      console.error("Download invoice error:", error);
    },
  });
};


export const useCreateOrder = (successHandler) => {
  return useMutation({
    mutationFn: (data) => createOrderApi(data),

    onSuccess: (response) => {
      // 👈 response pass kar diya main page me
      successHandler(response);
    },

    onError: (error) => {
      successHandler(null); 
      message.error(error?.message || "Something went wrong");
    },
  });
};


// export const useupdateVinculumInvApi = (successHandler) => {
//   return useMutation({
//     mutationFn: (data) => updateVinculumInvApi(data),
//     onSuccess: (data) => {
//       message.success("Grn created successfully!");
//       if (successHandler) successHandler(data);
//     },
//     onError: (error) => {
//       successHandler();
//       message.error(error?.message || "Something went wrong");
//     },
//   });
// };

export const useupdateVinculumInvApi = (onSuccessCb, onErrorCb) => {
  return useMutation({
    mutationFn: (data) => updateVinculumInvApi(data),
    onSuccess: (data) => {
      message.success("GRN created successfully!");
      onSuccessCb?.(data);
    },
    onError: (error) => {
      message.error(error?.message || "Something went wrong");
      onErrorCb?.(error);
    },
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: (data) => validateCouponApi(data),
    onError: (error) => {
      message.error(error?.message || "Invalid coupon code");
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
