import React, { type ReactNode } from "react";

export interface TooltipProps {
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
  className?: string;
}

const positionClasses: Record<string, string> = {
  top: "tooltip-top",
  bottom: "tooltip-bottom",
  left: "tooltip-left",
  right: "tooltip-right",
};

export default function Tooltip({
  content,
  position = "top",
  children,
  className = "",
}: TooltipProps) {
  return (
    <div
      className={`tooltip ${positionClasses[position]} ${className}`}
      data-tip={typeof content === "string" ? content : undefined}
    >
      {children}
    </div>
  );
}
