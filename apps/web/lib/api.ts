import { useAuthStore } from "@/store/use-auth-store";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// request interceptor: injecting anon or auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // if (error.response?.status === 401) {
    //   localStorage.removeItem("auth_token");
    //   window.location.href = "/auth";
    // }
    return Promise.reject(error);
  },
);

export default api;
