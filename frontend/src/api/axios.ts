// api/axios.js
import axios from "axios";

// Use import.meta.env for Vite projects to access environment variables.
// Variables must start with VITE_ to be exposed to the client.
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is important for sending cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== Request Interceptor =====
// This will run before every request.
// It's useful for adding headers that are needed for every request, like an auth token.
API.interceptors.request.use(
  (config) => {
    // Get the token from wherever you store it (e.g., localStorage, Redux store, etc.)
    const token = localStorage.getItem("token");

    // If a token exists, add it to the Authorization header.
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// ===== Response Interceptor =====
// This will run for every response.
// It's useful for handling global errors.
API.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger.
    // You can do something with the response data here.
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger.
    const { response } = error;

    if (response && response.status === 401) {
      // Handle Unauthorized error (e.g., token expired).
      // You might want to redirect to the login page or try to refresh the token.
      console.error("Unauthorized. Redirecting to login...");
      // For example:
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;