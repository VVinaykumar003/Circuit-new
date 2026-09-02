import React, { type ReactNode } from "react";

export interface DashboardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const columnClasses: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export default function DashboardGrid({
  children,
  columns = 4,
  className = "",
}: DashboardGridProps) {
  return (
    <div className={`grid gap-4 md:gap-6 ${columnClasses[columns]} ${className}`}>
      {children}
    </div>
  );
}
