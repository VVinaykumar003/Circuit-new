import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { hasRequiredRole } from "@/config/roles";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
  fallbackPath?: string;
}

export default function RoleGuard({
  allowedRoles,
  children,
  fallbackPath = "/unauthorized",
}: RoleGuardProps) {
  const { auth } = useAuth();
  const userRole = auth.user?.role;

  if (!hasRequiredRole(userRole, allowedRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
