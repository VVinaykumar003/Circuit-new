import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";

export interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
  icon: ReactNode;
  to?: string;
  onClick?: () => void;
  color?: string;
}

export interface QuickActionProps {
  title?: string;
  actions: QuickActionItem[];
  className?: string;
}

export default function QuickAction({
  title = "Quick Actions",
  actions,
  className = "",
}: QuickActionProps) {
  return (
    <div
      className={`p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex flex-col ${className}`}
    >
      {title && (
        <h3 className="text-base font-bold text-base-content tracking-tight mb-4 pb-2 border-b border-base-200">
          {title}
        </h3>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const content = (
            <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-base-200 bg-base-200/40 hover:bg-primary/5 hover:border-primary/30 transition-all text-center group cursor-pointer h-full">
              <div className="w-10 h-10 rounded-xl bg-base-100 flex items-center justify-center text-primary text-xl shadow-xs group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-content transition-all mb-2">
                {action.icon}
              </div>
              <span className="text-xs font-bold text-base-content group-hover:text-primary transition-colors line-clamp-1">
                {action.label}
              </span>
              {action.description && (
                <span className="text-[10px] text-base-content/50 line-clamp-1 mt-0.5">
                  {action.description}
                </span>
              )}
            </div>
          );

          if (action.to) {
            return (
              <Link key={action.id} to={action.to} className="block h-full">
                {content}
              </Link>
            );
          }

          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className="text-left w-full h-full"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
