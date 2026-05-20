import axios from "axios";
import { toast } from "react-toastify";

const API_URL =
  import.meta.env.VITE_NODE_ENV === "production"
    ? `${import.meta.env.VITE_PRODUCTION_URL}/api`
    : `${import.meta.env.VITE_DEVELOPMENT_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem("auth");

    if (auth) {
      const token = JSON.parse(auth).token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Network error! Please check your connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401) {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("auth");
      window.location.href = "/login";
    } else if (status === 403) {
      toast.error("You don't have permission.");
    } else if (status === 404) {
      toast.error("Resource not found.");
    } else if (status >= 500) {
      toast.error("Server error! Try again later.");
    } else {
      toast.error(data?.message || "Something went wrong.");
    }

    return Promise.reject(error);
  }
);

export default api;