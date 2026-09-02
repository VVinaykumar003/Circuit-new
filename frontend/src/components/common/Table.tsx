import React, { type ReactNode } from "react";

export interface TableProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  stickyHeader?: boolean;
}

export default function Table({
  children,
  className = "",
  containerClassName = "",
  stickyHeader = true,
}: TableProps) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-xs ${containerClassName}`}
    >
      <table
        className={`table w-full text-sm ${stickyHeader ? "table-pin-rows" : ""} ${className}`}
      >
        {children}
      </table>
    </div>
  );
}
