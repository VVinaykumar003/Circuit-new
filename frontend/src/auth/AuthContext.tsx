import API from "@/api/axios";
import {
  createContext, useContext, useEffect,
  useState, type ReactNode
} from "react";

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

type MeResponse = {
  user: User;
  slug: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({ user: null, slug: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const publicRoutes = ["/login", "/register","/"];

  if (publicRoutes.includes(window.location.pathname)) {
    setLoading(false);
    return;
  }

  const checkAuth = async () => {
    try {
      const res = await API.get<MeResponse>("/auth/me");

      setAuth({
        user: res.data.user,
        slug: res.data.slug,
      });

    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error("Auth error:", err);
      }

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
    setAuth({ user: data.user, slug: data.slug });
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err: any) {
  console.error("Auth check failed", err?.response?.data);

  setAuth({ user: null, slug: null });
}finally {
      setAuth({ user: null, slug: null });
    }
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