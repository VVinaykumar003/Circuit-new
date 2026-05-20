import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "outline";
  children: ReactNode;
}

export default function Badge({
  variant = "info",
  children,
}: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
