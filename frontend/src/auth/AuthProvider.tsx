import API from "@/api/axios";
import { useEffect, useState, type ReactNode } from "react";
import type { User, AuthState } from "@/type/UserAuth";
import { AuthContext } from "./auth-context";


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    slug: null,
  });

  const [loading, setLoading] = useState(true);


  //  Check login on refresh using cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
       const res = await API.get("/auth/me");

        // Update AuthContext
        setAuth({
          user: res.data.user,
          slug: res.data.slug,
        });
      } catch (err) {
        console.error("Authentication check failed", err);
        setAuth({
          user: null,
          slug: null,
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (data: { user: User; slug: string }) => {
    const newAuth = {
      user: data.user,
      slug: data.slug,
    };

    setAuth(newAuth);
    console.log("Logged in user:", newAuth.user);
    
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

    setAuth({
      user: null,
      slug: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};