import { createContext, useContext } from "react";
import type { OrganizationMember } from "@/type/User";

export type AuthState = {
  user: OrganizationMember | null;
  slug: string | null;
};

export type AuthContextType = {
  auth: AuthState;

  /**
   * Department currently being viewed.
   *
   * For employees:
   * - Always equals user.department.
   *
   * For admins/owners:
   * - Can be changed from the sidebar.
   */
  activeDepartment: string | null;

  /**
   * Change the department being viewed.
   *
   * Admin/owner:
   * - Can switch departments.
   *
   * Employee:
   * - Cannot switch away from their assigned department.
   */
  setActiveDepartment: (department: string) => void;

  login: (data: {
    user: OrganizationMember;
    slug: string;
  }) => void;

  logout: () => void;

  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};