import { API } from "./axios";

export const loginApi = (credentials: { email?: string; password?: string }) => {
  return API.post("/auth/login", credentials);
};

export const logoutApi = () => {
  return API.post("/auth/logout");
};

export const getCurrentUserApi = () => {
  return API.get("/auth/me");
};
