import axios from "axios";

const getBaseUrl = () => {
  const isProd =
    import.meta.env.PROD ||
    import.meta.env.MODE === "production" ||
    import.meta.env.VITE_NODE_ENV === "production";

  // In production builds, default to /api for same-origin Vercel rewrites
  // This completely eliminates third-party cross-origin cookie rejection in browsers
  if (isProd) {
    if (import.meta.env.VITE_DIRECT_BACKEND_URL) {
      let clean = String(import.meta.env.VITE_DIRECT_BACKEND_URL).trim().replace(/\/+$/, "");
      return clean.endsWith("/api") ? clean : `${clean}/api`;
    }
    return "/api";
  }

  const devUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_DEVELOPMENT_URL ||
    "http://localhost:5000";
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
    // For multipart FormData, let the browser/Axios compute the Content-Type boundary automatically
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }

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
    const { response, config } = error;
    if (import.meta.env.DEV) {
      const isFormData = config?.data instanceof FormData;
      console.warn(
        `[API Error] ${config?.method?.toUpperCase()} ${config?.url} -> ${response?.status || "Network Error"}:`,
        response?.data?.message || error.message,
        isFormData ? "[FormData Payload]" : ""
      );
    }
    if (response && response.status === 401) {
      console.warn("Unauthorized request detected.");
    }
    return Promise.reject(error);
  }
);

export const api = API;
export default API;
