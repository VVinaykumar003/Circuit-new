import { useContext } from "react";
import { AuthContext } from "@/auth/useAuth";

export function useAuth() {
  return useContext(AuthContext);
}