// 📄 src/context/AuthProvider.tsx
import API from "@/api/axios";
import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type AuthState } from "./useAuth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    slug: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/auth/me");
        setAuth({
          user: res.data.user,
          slug: res.data.slug,
        });
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setAuth({ user: null, slug: null });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (data: { user: any; slug: string }) => {
    const newAuth = { user: data.user, slug: data.slug };
    setAuth(newAuth);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    }
    setAuth({ user: null, slug: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
