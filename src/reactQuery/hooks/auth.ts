import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signInApi } from "../api";
import { message } from "antd";

export const useSignIn = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => signInApi(data),
    onSuccess: (data) => {
      localStorage.setItem("token", data?.token);
      localStorage.setItem("userInfo", JSON.stringify(data?.user));
      // const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      queryClient.invalidateQueries({ queryKey: ["AUTH-ME"] });
      message.success("You have successfully logged in.");
      navigate("/home");
    },
    onError: (error) => {
      message.error(error.message);
    },
  });
};
