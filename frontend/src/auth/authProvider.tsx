import API from "@/api/axios";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  AuthContext,
  type AuthState,
} from "./useAuth";

import type { OrganizationMember } from "@/type/User";

const SELECTED_DEPARTMENT_KEY = "selected_department";

const ADMIN_ROLES = [
  "admin",
  "owner",
  "super_admin",
];

const normalizeDepartment = (
  department?: string | null
): string | null => {
  if (!department) {
    return null;
  }

  return department.trim().toLowerCase();
};

const isAdminRole = (
  role?: string | null
): boolean => {
  if (!role) {
    return false;
  }

  return ADMIN_ROLES.includes(
    role.trim().toLowerCase()
  );
};

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    slug: null,
  });

  const [activeDepartment, setActiveDepartmentState] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  /**
   * Resolve the department that should be active.
   *
   * Admin/Owner:
   * - Restore selected department from localStorage.
   *
   * Employee:
   * - Always use the employee's assigned department.
   */
  const resolveActiveDepartment = useCallback(
    (user: OrganizationMember): string | null => {
      const userDepartment = normalizeDepartment(
        user.department
      );

      const isAdmin = isAdminRole(user.role);

      /**
       * Employees must NEVER inherit the admin's
       * previously selected department.
       */
      if (!isAdmin) {
        return userDepartment;
      }

      /**
       * Admin / Owner can switch departments.
       */
      const storedDepartment =
        localStorage.getItem(
          SELECTED_DEPARTMENT_KEY
        );

      if (storedDepartment) {
        return normalizeDepartment(
          storedDepartment
        );
      }

      /**
       * If no department has been selected yet,
       * use the user's own department if available.
       */
      return userDepartment;
    },
    []
  );

  /**
   * Set active department.
   *
   * Admin:
   * - Can change department.
   *
   * Employee:
   * - Department is locked to user.department.
   */
  const setActiveDepartment = useCallback(
    (department: string) => {
      if (!auth.user) {
        return;
      }

      const normalizedDepartment =
        normalizeDepartment(department);

      if (!normalizedDepartment) {
        return;
      }

      const isAdmin = isAdminRole(
        auth.user.role
      );

      /**
       * Employee department is locked.
       */
      if (!isAdmin) {
        const employeeDepartment =
          normalizeDepartment(
            auth.user.department
          );

        setActiveDepartmentState(
          employeeDepartment
        );

        return;
      }

      /**
       * Admin / Owner can switch.
       */
      setActiveDepartmentState(
        normalizedDepartment
      );

      localStorage.setItem(
        SELECTED_DEPARTMENT_KEY,
        normalizedDepartment
      );
    },
    [auth.user]
  );

  /**
   * Load authenticated user.
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/auth/me");

        const user =
          res.data.user as OrganizationMember;

        const slug =
          res.data.slug ?? null;

        setAuth({
          user,
          slug,
        });

        /**
         * Resolve department after authentication.
         */
        const department =
          resolveActiveDepartment(user);

        setActiveDepartmentState(
          department
        );

        /**
         * If employee logs in, remove any
         * previously selected admin department.
         *
         * This prevents:
         *
         * Admin → Sales
         * Logout
         * Employee → Sales
         *
         * when employee actually belongs to HR.
         */
        if (!isAdminRole(user.role)) {
          localStorage.removeItem(
            SELECTED_DEPARTMENT_KEY
          );
        }
      } catch (err) {
        console.error(
          "Failed to fetch user data:",
          err
        );

        setAuth({
          user: null,
          slug: null,
        });

        setActiveDepartmentState(null);

        /**
         * Remove department selection when
         * authentication fails.
         */
        localStorage.removeItem(
          SELECTED_DEPARTMENT_KEY
        );
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [resolveActiveDepartment]);

  /**
   * Login.
   */
  const login = useCallback(
    (data: {
      user: OrganizationMember;
      slug: string;
    }) => {
      const user = data.user;

      const newAuth: AuthState = {
        user,
        slug: data.slug,
      };

      setAuth(newAuth);

      const isAdmin = isAdminRole(
        user.role
      );

      /**
       * Employee:
       *
       * Always use assigned department.
       */
      if (!isAdmin) {
        const department =
          normalizeDepartment(
            user.department
          );

        setActiveDepartmentState(
          department
        );

        /**
         * Prevent previous admin selection
         * from affecting employee.
         */
        localStorage.removeItem(
          SELECTED_DEPARTMENT_KEY
        );

        return;
      }

      /**
       * Admin / Owner:
       *
       * Restore previously selected department
       * if available.
       */
      const storedDepartment =
        localStorage.getItem(
          SELECTED_DEPARTMENT_KEY
        );

      if (storedDepartment) {
        setActiveDepartmentState(
          normalizeDepartment(
            storedDepartment
          )
        );

        return;
      }

      /**
       * Otherwise start with admin's department.
       */
      const department =
        normalizeDepartment(
          user.department
        );

      setActiveDepartmentState(
        department
      );
    },
    []
  );

  /**
   * Logout.
   */
  const logout = useCallback(async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error(
        "Logout failed",
        err
      );
    }

    /**
     * Completely clear authentication.
     */
    setAuth({
      user: null,
      slug: null,
    });

    setActiveDepartmentState(null);

    /**
     * Remove department selection.
     *
     * A new admin can select their own department
     * after logging in.
     */
    localStorage.removeItem(
      SELECTED_DEPARTMENT_KEY
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        activeDepartment,
        setActiveDepartment,
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};