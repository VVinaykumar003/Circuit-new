import axios from "axios";

const getBaseUrl = () => {
  const isProd =
    import.meta.env.PROD ||
    import.meta.env.MODE === "production" ||
    import.meta.env.VITE_NODE_ENV === "production";

  const explicitUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_PRODUCTION_URL;

  if (explicitUrl && typeof explicitUrl === "string" && explicitUrl.trim() !== "") {
    let clean = explicitUrl.trim().replace(/\/+$/, "");
    if (!clean.endsWith("/api")) {
      clean = `${clean}/api`;
    }
    return clean;
  }

  // In production builds without explicit URL, default to /api for same-origin Vercel rewrites
  if (isProd) {
    return "/api";
  }

  const devUrl =
    import.meta.env.VITE_DEVELOPMENT_URL || "http://localhost:5000";
  let cleanDev = typeof devUrl === "string" ? devUrl.trim().replace(/\/+$/, "") : "http://localhost:5000";
  if (!cleanDev.endsWith("/api")) {
    cleanDev = `${cleanDev}/api`;
  }
  return cleanDev;
};

const API_BASE_URL = getBaseUrl();

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
