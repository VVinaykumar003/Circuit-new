// services/authService.js
import API from "../api/axios";

// Corrected to match the backend route in auth.routes.js
export const register = (data) => API.post("/auth/register-company", data);

export const login = (data) => API.post("/auth/login", data);
export const logout = () => API.post("/auth/logout");

// Corrected to match the backend route in routes/index.js
export const getProfile = () => API.get("/me");