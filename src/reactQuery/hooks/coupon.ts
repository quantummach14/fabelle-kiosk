import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { createCouponApi, getCouponsApi, toggleCouponApi } from "../api";

export const useCoupons = () => {
  return useMutation({
    mutationFn: () => getCouponsApi(),
    onError: (error) => {
      message.error(error?.message || "Could not fetch coupons");
    },
  });
};

export const useCreateCoupon = (onSuccessCb) => {
  return useMutation({
    mutationFn: (data) => createCouponApi(data),
    onSuccess: (data) => {
      message.success(data?.message || "Coupon created successfully");
      onSuccessCb?.(data);
    },
    onError: (error) => {
      message.error(error?.message || "Could not create coupon");
    },
  });
};

export const useToggleCoupon = (onSuccessCb) => {
  return useMutation({
    mutationFn: (data) => toggleCouponApi(data),
    onSuccess: (data) => {
      message.success(data?.message || "Coupon updated successfully");
      onSuccessCb?.(data);
    },
    onError: (error) => {
      message.error(error?.message || "Could not update coupon");
    },
  });
};
