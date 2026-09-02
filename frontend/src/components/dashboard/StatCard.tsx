import React, { type ReactNode } from "react";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  growth?: string;
  trend?: "up" | "down" | "neutral";
  helperText?: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<
  string,
  { border: string; bg: string; iconBg: string; text: string }
> = {
  primary: {
    border: "border-primary/20",
    bg: "bg-base-100",
    iconBg: "bg-primary/10 text-primary",
    text: "text-primary",
  },
  secondary: {
    border: "border-secondary/20",
    bg: "bg-base-100",
    iconBg: "bg-secondary/10 text-secondary",
    text: "text-secondary",
  },
  success: {
    border: "border-success/20",
    bg: "bg-base-100",
    iconBg: "bg-success/10 text-success",
    text: "text-success",
  },
  warning: {
    border: "border-warning/20",
    bg: "bg-base-100",
    iconBg: "bg-warning/10 text-warning",
    text: "text-warning",
  },
  error: {
    border: "border-error/20",
    bg: "bg-base-100",
    iconBg: "bg-error/10 text-error",
    text: "text-error",
  },
  info: {
    border: "border-info/20",
    bg: "bg-base-100",
    iconBg: "bg-info/10 text-info",
    text: "text-info",
  },
  neutral: {
    border: "border-base-300",
    bg: "bg-base-100",
    iconBg: "bg-base-200 text-base-content/70",
    text: "text-base-content",
  },
};

export default function StatCard({
  title,
  value,
  icon,
  growth,
  trend,
  helperText,
  variant = "neutral",
  className = "",
  onClick,
}: StatCardProps) {
  const styles = variantStyles[variant] || variantStyles.neutral;

  return (
    <div
      onClick={onClick}
      className={`
        p-4 sm:p-5 rounded-2xl border ${styles.border} ${styles.bg}
        shadow-xs hover:shadow-md transition-all duration-200
        flex flex-col justify-between
        ${onClick ? "cursor-pointer hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-base-content/60 truncate">
          {title}
        </span>
        {icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${styles.iconBg}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
          {value}
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {growth && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                trend === "down" ? "text-error" : "text-success"
              }`}
            >
              {trend === "down" ? <MdTrendingDown size={15} /> : <MdTrendingUp size={15} />}
              {growth}
            </span>
          )}
          {helperText && (
            <span className="text-xs text-base-content/50 truncate font-medium">
              {helperText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
