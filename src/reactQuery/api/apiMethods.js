import { APIKit } from "./apiClient";
import { message } from "antd";

const handleAPIError = (error) => {
  if (error.response?.status === 403 || error.response?.status === 401) {
    localStorage.clear();
    message.error(error.response.data.message);
    throw {
      message: error.response.data.message,
    };
  }
  throw {
    message: error.response?.data?.message,
  };
};

export const apiMethods = {
  GET: async (url, params, headers) => {
    if (!navigator.onLine) {
      throw { message: "Please check your internet connection." };
    }
    try {
      const response = await APIKit.get(url, params, { headers });
      return response.data;
    } catch (error) {
      return handleAPIError(error);
    }
  },

  POST: async (url, params, headers) => {
    if (!navigator.onLine) {
      throw { message: "Please check your internet connection." };
    }
    try {
      const response = await APIKit.post(url, params, { headers });
      return response.data;
    } catch (error) {
      return handleAPIError(error);
    }
  },
  PATCH: async (url, params, headers) => {
    if (!navigator.onLine) {
      throw { message: "Please check your internet connection." };
    }
    try {
      const response = await APIKit.patch(url, params, { headers });
      return response.data;
    } catch (error) {
      return handleAPIError(error);
    }
  },
  DELETE: async (url, params, headers) => {
    if (!navigator.onLine) {
      throw { message: "Please check your internet connection." };
    }
    try {
      const response = await APIKit.delete(url, { headers });

      return response.data;
    } catch (error) {
      return handleAPIError(error);
    }
  },

  PUT: async (url, params, headers) => {
    if (!navigator.onLine) {
      throw { message: "Please check your internet connection." };
    }
    try {
      const response = await APIKit.put(url, params, { headers });
      return response.data;
    } catch (error) {
      return handleAPIError(error);
    }
  },
};
