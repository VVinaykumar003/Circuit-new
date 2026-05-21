// api/axios.js
import axios from "axios";
import { toast } from "react-toastify";

// Use import.meta.env for Vite projects to access environment variables.
// Variables must start with VITE_ to be exposed to the client.
const API_BASE_URL =
  import.meta.env.VITE_NODE_ENV === "production"
    ? `${import.meta.env.VITE_API_URL}/api`
    : `${import.meta.env.VITE_DEVELOPMENT_URL || "http://localhost:5001"}/api`;

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is important for sending cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API_BASE_URL : ", API_BASE_URL);



// ===== Request Interceptor =====
// This will run before every request.
// It's useful for adding headers that are needed for every request, like an auth token.
API.interceptors.request.use(
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

// ===== Response Interceptor =====
// This will run for every response.
// It's useful for handling global errors.
API.interceptors.response.use(
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

export default API;