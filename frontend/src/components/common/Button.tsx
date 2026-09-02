import React, { type ButtonHTMLAttributes, type ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "error" | "success" | "warning" | "info";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: "btn-primary shadow-sm",
  secondary: "btn-secondary shadow-sm",
  outline: "btn-outline border-base-300 hover:border-primary",
  ghost: "btn-ghost",
  error: "btn-error text-white",
  success: "btn-success text-white",
  warning: "btn-warning text-white",
  info: "btn-info text-white",
};

const sizeClasses: Record<string, string> = {
  xs: "btn-xs text-xs px-2.5",
  sm: "btn-sm text-xs px-3",
  md: "text-sm px-4",
  lg: "btn-lg text-base px-6",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`btn ${variantClasses[variant] || "btn-primary"} ${sizeClasses[size] || ""} rounded-xl font-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
      {...props}
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs mr-1"></span>
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
}
