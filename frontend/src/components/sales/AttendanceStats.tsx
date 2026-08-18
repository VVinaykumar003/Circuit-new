import type { LucideIcon } from "lucide-react";

export interface StatCardData {
  key: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  accent?: "primary" | "success" | "error" | "warning" | "info";
}

const ACCENT_STYLES: Record<NonNullable<StatCardData["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="skeleton h-10 w-10 rounded-xl mb-4" />
      <div className="skeleton h-7 w-16 mb-2" />
      <div className="skeleton h-3 w-24" />
    </div>
  );
}

export default function AttendanceStats({
  cards,
  loading,
}: {
  cards: StatCardData[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const accent = ACCENT_STYLES[card.accent ?? "primary"];
        return (
          <div
            key={card.key}
            className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${accent} mb-4 transition-transform duration-300 group-hover:scale-110`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-base-content leading-none">{card.value}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-base-content/60">{card.label}</p>
              {card.trend && (
                <span
                  className={`text-[11px] font-semibold ${
                    card.trend.positive ? "text-success" : "text-error"
                  }`}
                >
                  {card.trend.positive ? "+" : ""}
                  {card.trend.value}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
