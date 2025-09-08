import axios from "axios";

// S T A G E
const stage = "https://fabelle-stage.pep1.in/fabelle_backend";
// P R O D U C T I O N
const production = "fabelle.retailconnect.co.in/fabelle_backend";

export const serverURL = production;
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
