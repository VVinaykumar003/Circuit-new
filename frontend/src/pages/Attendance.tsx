import React, { Suspense } from "react";
import type { UserRole } from "../type/attendance";
import { useAuth } from "@/auth/AuthContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const EmployeeAttendanceView = React.lazy(()=> import("../components/attendance/EmployeeAttendance"));
const AdminAttendanceView = React.lazy(()=> import("../components/attendance/AdminAttendance"));

// type Status = "all" | "approved" | "pending" | "rejected";
export default function Attendance() {
  const { auth } = useAuth();
  const user = auth?.user;
  const role: UserRole = user?.role || "employee";

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <Breadcrumbs />
      <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
        {role === "admin" || role === "owner" ? (
          <AdminAttendanceView />
        ) : (
          <EmployeeAttendanceView />
        )}
      </Suspense>
    </div>
  );
}
