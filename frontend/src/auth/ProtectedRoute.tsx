import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import AppLayout from "@/components/layout/AppLayout";

function LayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export const ProtectedRoute = () => {
  const { auth } = useAuth();

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  
  return <LayoutWrapper />;
};