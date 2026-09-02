import React, { type ReactNode } from "react";
import { MdRefresh } from "react-icons/md";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onRefresh?: () => void;
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  action,
  onRefresh,
  isLoading,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex flex-col ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-base-200">
        <div>
          <h3 className="text-base font-bold text-base-content tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-base-content/60 mt-0.5 font-normal">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {action}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content"
              title="Refresh data"
            >
              <MdRefresh size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[260px] relative flex flex-col justify-center">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-base-100/60 backdrop-blur-2xs z-10">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
