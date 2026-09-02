import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: ReactNode;
  user?: {
    name: string;
    avatar?: string;
  };
  link?: string;
  badge?: ReactNode;
}

export interface ActivityCardProps {
  title?: string;
  activities: ActivityItem[];
  viewAllLink?: string;
  className?: string;
}

export default function ActivityCard({
  title = "Recent Activity",
  activities,
  viewAllLink,
  className = "",
}: ActivityCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-base-200">
        <h3 className="text-base font-bold text-base-content tracking-tight">{title}</h3>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-primary hover:underline"
          >
            View All
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 divide-y divide-base-200">
        {activities.length === 0 ? (
          <div className="text-xs text-base-content/50 py-8 text-center">
            No recent activity recorded
          </div>
        ) : (
          activities.map((item, idx) => (
            <div key={item.id || idx} className="pt-3 first:pt-0 flex items-start gap-3">
              {item.icon ? (
                <div className="w-8 h-8 rounded-xl bg-base-200 flex items-center justify-center text-primary shrink-0 text-sm mt-0.5">
                  {item.icon}
                </div>
              ) : item.user?.avatar ? (
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {item.user?.name?.charAt(0) || "A"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-base-content truncate">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-base-content/50 shrink-0 font-medium">
                    {item.timestamp}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-base-content/70 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
                {item.badge && <div className="mt-1.5">{item.badge}</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
