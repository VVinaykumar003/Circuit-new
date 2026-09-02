import React, { type ReactNode } from "react";

export interface BadgeProps {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "info" | "success" | "warning" | "error" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  accent: "badge-accent",
  ghost: "badge-ghost",
  info: "badge-info text-white",
  success: "badge-success text-white",
  warning: "badge-warning text-white",
  error: "badge-error text-white",
  outline: "badge-outline border-base-300",
};

const sizeClasses: Record<string, string> = {
  xs: "badge-xs text-[10px]",
  sm: "badge-sm text-xs",
  md: "text-xs px-2.5 py-1",
  lg: "badge-lg text-sm px-3 py-1.5",
};

export default function Badge({
  variant = "ghost",
  size = "sm",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span className={`badge ${variantClasses[variant] || "badge-ghost"} ${sizeClasses[size] || "badge-sm"} font-medium rounded-full ${className}`}>
      {children}
    </span>
  );
}
