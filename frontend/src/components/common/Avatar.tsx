import React from "react";

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  statusIndicator?: "online" | "offline" | "busy" | "away";
}

const sizeClasses: Record<string, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const statusClasses: Record<string, string> = {
  online: "bg-success",
  offline: "bg-base-content/30",
  busy: "bg-error",
  away: "bg-warning",
};

export default function Avatar({
  src,
  name = "User",
  size = "md",
  className = "",
  statusIndicator,
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`avatar ${src ? "" : "placeholder"} rounded-full overflow-hidden shrink-0 border border-base-300 shadow-xs`}
      >
        {src ? (
          <div className={`${sizeClasses[size]}`}>
            <img src={src} alt={name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className={`bg-gradient-to-tr from-primary/20 to-secondary/20 text-primary font-bold flex items-center justify-center ${sizeClasses[size]}`}
          >
            <span>{initials}</span>
          </div>
        )}
      </div>
      {statusIndicator && (
        <span
          className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-base-100 ${statusClasses[statusIndicator]}`}
        />
      )}
    </div>
  );
}
