// 📄 src/context/useAuth.ts
import { createContext, useContext } from "react";
import type { OrganizationMember } from "@/type/User";

export type AuthState = {
  user: OrganizationMember | null;
  slug: string | null;
};

export type AuthContextType = {
  auth: AuthState;
  login: (data: { user: OrganizationMember; slug: string }) => void;
  logout: () => void;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
