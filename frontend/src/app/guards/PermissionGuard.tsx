import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { hasPermission, type PermissionString } from "@/config/permissions";

interface PermissionGuardProps {
  permission: PermissionString;
  children: ReactNode;
  fallbackPath?: string;
}

export default function PermissionGuard({
  permission,
  children,
  fallbackPath = "/unauthorized",
}: PermissionGuardProps) {
  const { auth } = useAuth();
  const userRole = auth.user?.role;

  if (!hasPermission(userRole, permission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
