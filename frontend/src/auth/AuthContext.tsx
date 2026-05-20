

import API from "@/api/axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type User = {
  userId: string;
  name: string;
  email: string;
  role: string;
  organization: string;
};

type AuthState = {
  user: User | null;
  slug: string | null;
};

type AuthContextType = {
  auth: AuthState;
  login: (data: { user: User; slug: string }) => void;
  logout: () => void;
  loading: boolean;
};

// const getInitialAuth = (): AuthState => {
//   const stored = localStorage.getItem("auth");
//   console.log("stored" ,stored );
//   if (stored) {
//     try {
//       return JSON.parse(stored);
//     } catch (e) {
//       console.warn("Failed to parse auth from localStorage:", e);
//     }
//   }
//   return { token: null, slug: null, role: null, userId: null };
// };

const AuthContext = createContext<AuthContextType | null>(null);

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

        //  console.log("User from /me:", res.data);
        //  console.log("User's slug:", res.data.slug);

        // Update AuthContext
        setAuth({
          user: res.data.user,
          slug: res.data.slug,
        });
      } catch (err) {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};