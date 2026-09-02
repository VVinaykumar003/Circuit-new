import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_NODE_ENV === "production"
    ? `${import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_PRODUCTION_URL || ""}/api`
    : `${import.meta.env.VITE_DEVELOPMENT_URL || "http://localhost:5000"}/api`;

export const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
      config.headers["Authorization"] = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      console.warn("Unauthorized request detected.");
    }
    return Promise.reject(error);
  }
);

export const api = API;
export default API;
