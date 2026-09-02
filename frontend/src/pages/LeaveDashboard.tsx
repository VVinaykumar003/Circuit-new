import AdminLeaveDashboard from "../components/Leave/AdminDashboard";
import EmployeeLeaveDashboard from "../components/Leave/EmployeeLeaveDashboard";
import { useAuth } from "@/auth/useAuth";
import { PageHeader } from "@/components/common";

export default function LeavePage() {
  const { auth } = useAuth();
  const role = auth?.user?.role;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        title="Leave Management"
        breadcrumbs={[
          { label: "Dashboard" },
          { label: "Leave", active: true },
        ]}
      />
      {role === "admin" || role === "owner" ? (
        <AdminLeaveDashboard />
      ) : (
        <EmployeeLeaveDashboard />
      )}
    </div>
  );
}
