import axios from "axios";
export const serverURL = "https://fabelle-stage.pep1.in/fabelle_backend";
const baseURL = `${serverURL}/api`;
export const imgURL = `${serverURL}/`;

// Create Axios instance
export const APIKit = axios.create({
  baseURL,
  timeout: 600000,
});

// Request Interceptor - Encrypting data before sending
APIKit.interceptors.request.use(async (config) => {
  const token = localStorage?.token || window?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
