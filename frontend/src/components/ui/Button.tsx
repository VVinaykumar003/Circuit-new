import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "error" | "success";
  size?: "xs" | "sm" | "md" | "lg";
  children: ReactNode;
}

const variantClasses = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline border-base-300",
  ghost: "btn-ghost",
  error: "btn-error",
  success: "btn-success",
};

const sizeClasses = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export default function Button({ 
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} rounded-xl font-medium text-xs tracking-wide transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 ${className} cursor-pointer`}
      {...props}
    >
      {children}
    </button>
  );
}
