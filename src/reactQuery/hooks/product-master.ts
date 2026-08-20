import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { createProductApi } from "../api";

export const useCreateProduct = (onSuccessCb) => {
  return useMutation({
    mutationFn: (data) => createProductApi(data),
    onSuccess: (data) => {
      message.success(data?.message || "Product created successfully");
      onSuccessCb?.(data);
    },
    onError: (error) => {
      message.error(error?.message || "Could not create product");
    },
  });
};
