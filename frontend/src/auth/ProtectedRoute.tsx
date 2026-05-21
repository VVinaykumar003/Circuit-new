import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AppLayout from "@/components/layout/AppLayout";

function LayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export const ProtectedRoute = () => {
  const { auth, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // or a spinner
  if (!auth.user) return <Navigate to="/login" replace />;

  return <LayoutWrapper />;
};