import React, { type ReactNode } from "react";

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthClasses: Record<string, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

export default function PageContainer({
  children,
  className = "",
  maxWidth = "full",
}: PageContainerProps) {
  return (
    <div className={`w-full mx-auto p-3 md:p-4 lg:p-6 animate-fade-in ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  );
}
