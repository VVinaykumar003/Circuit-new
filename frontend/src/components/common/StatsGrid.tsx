import React from "react";

export interface StatItem {
  label: string;
  value: React.ReactNode;
  color?: string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = {
    default: 2,
    md: 4,
  },
  className = "",
}) => {
  const getColClass = (prefix: string, count?: number) => {
    if (!count) return "";
    const p = prefix ? `${prefix}:` : "";
    switch (count) {
      case 1:
        return `${p}grid-cols-1`;
      case 2:
        return `${p}grid-cols-2`;
      case 3:
        return `${p}grid-cols-3`;
      case 4:
        return `${p}grid-cols-4`;
      case 5:
        return `${p}grid-cols-5`;
      case 6:
        return `${p}grid-cols-6`;
      case 7:
        return `${p}grid-cols-7`;
      case 8:
        return `${p}grid-cols-8`;
      default:
        return `${p}grid-cols-${count}`;
    }
  };

  const gridColumns = [
    getColClass("", columns.default || 2),
    getColClass("sm", columns.sm),
    getColClass("md", columns.md || 4),
    getColClass("lg", columns.lg),
    getColClass("xl", columns.xl),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`grid ${gridColumns} gap-3 mb-4 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={`${stat.label}-${index}`}
          className={`bg-base-100 border border-base-300 rounded-lg p-3 sm:p-3.5 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${
            stat.className || ""
          }`}
        >
          {/* Left accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-base-300" />

          {/* Icon */}
          {stat.icon && (
            <div className="mb-1 text-base-content/60">{stat.icon}</div>
          )}

          {/* Label */}
          <span className="text-[11px] text-base-content/60 font-bold uppercase tracking-wider">
            {stat.label}
          </span>

          {/* Value */}
          <span
            className={`text-xl sm:text-2xl font-bold mt-0.5 ${
              stat.color || "text-base-content"
            }`}
          >
            {stat.value}
          </span>

          {/* Optional description */}
          {stat.description && (
            <span className="text-[11px] text-base-content/50 mt-0.5">
              {stat.description}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;