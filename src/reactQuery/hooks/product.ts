import { useMutation } from "@tanstack/react-query";
import { productsListDataApi } from "../api";
import { message } from "antd";

export const useProductListData = () => {
  return useMutation({
    mutationFn: (data) => productsListDataApi(data),
    onError: (error) => {
      message.error(error?.message || "Something went wrong");
    },
  });
};
