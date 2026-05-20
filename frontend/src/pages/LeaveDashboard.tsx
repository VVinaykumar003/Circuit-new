import AdminLeaveDashboard from "../components/Leave/AdminDashboard";
import EmployeeLeaveDashboard from "../components/Leave/EmployeeLeaveDashboard";
import { useAuth } from "@/auth/AuthContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function LeavePage() {
  const { auth } = useAuth();
  const role = auth?.user?.role;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <Breadcrumbs />
      {(role === "admin" || role === "owner") ? <AdminLeaveDashboard /> : <EmployeeLeaveDashboard />}
    </div>
  );
}
