import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MdRefresh, MdBarChart, MdShare, MdSort, MdError } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthContext";
import { getSalesDashboardData } from "@/services/salesService";

/* ─────────────────────────── types ─────────────────────────── */
interface StatCard {
  label: string;
  value: string;
}

interface SalesDashboardProps {
  /** Optional: inject real data from your API/store */
  stats?: StatCard[];
  salesByProduct?: { name: string; value: number }[];
  salesByEmployee?: { name: string; value: number }[];
  salesByRegion?: { name: string; value: number }[];
  weeklySales?: { day: string; sales: number }[];
  detailedForecast?: { month: string; forecast: number; actual: number }[];
  briefForecast?: { month: string; forecast: number; actual: number }[];
}

/* ─────────────────────────── defaults (empty state) ─────────── */
const defaultStats: StatCard[] = [
  { label: "My This Month Sales", value: "₹ 0.00" },
  { label: "My Today's Sales", value: "₹ 0" },
  { label: "My Orders", value: "0" },
  { label: "Pending Quotes", value: "0" },
  { label: "Pending Orders", value: "0" },
];

/* ─────────────────────────── sub-components ─────────────────── */

/** Reusable empty-state placeholder for charts */
function EmptyChart({ height = 220 }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center w-full rounded-md bg-base-200 text-base-content/40 text-sm"
      style={{ height }}
    >
      No Data
    </div>
  );
}

/** Chart action bar (Refresh / chart icon / share / Split Axis / Sort) */
function ChartActions({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={onRefresh}
        className="btn btn-xs btn-outline gap-1 text-xs normal-case"
      >
        <MdRefresh size={13} />
        Refresh
      </button>
      <button className="btn btn-xs btn-outline px-2">
        <MdBarChart size={14} />
      </button>
      <button className="btn btn-xs btn-outline px-2">
        <MdShare size={13} />
      </button>
      <button className="btn btn-xs btn-outline gap-1 text-xs normal-case">
        Split Axis
      </button>
      <button className="btn btn-xs btn-outline gap-1 text-xs normal-case">
        <MdSort size={13} />
        Sort
      </button>
    </div>
  );
}

/** Forecast panel (Detailed or Brief) */
function ForecastPanel({
  title,
  data,
}: {
  title: string;
  data?: { month: string; forecast: number; actual: number }[];
}) {
  const [key, setKey] = useState(0);
  const hasData = data && data.length > 0;

  return (
    <div className="border border-base-300 rounded-xl bg-base-100 flex flex-col overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
        <span className="font-semibold text-sm text-base-content">{title}</span>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="btn btn-xs btn-outline normal-case text-xs"
        >
          Regenerate
        </button>
      </div>

      {/* chart toolbar */}
      <div className="px-4 pt-3">
        <ChartActions onRefresh={() => setKey((k) => k + 1)} />
      </div>

      {/* chart body */}
      <div className="flex-1 p-4">
        {hasData ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart key={key} data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--b3))" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "oklch(var(--bc)/0.6)" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "oklch(var(--bc)/0.6)" }} />
              <Tooltip
                contentStyle={{
                  background: "oklch(var(--b1))",
                  border: "1px solid oklch(var(--b3))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="forecast" fill="#a855f7" radius={[3, 3, 0, 0]} name="Forecast" />
              <Bar dataKey="actual" fill="#22c55e" radius={[3, 3, 0, 0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48">
            <span className="text-error font-semibold text-sm">No Data Available</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Generic bar/line chart section used for Product / Employee / Region / Weekly */
function SalesChartCard({
  title,
  data,
  dataKey = "value",
  color = "#a855f7",
  type = "bar",
  height = 220,
}: {
  title: string;
  data?: { name: string; [key: string]: number | string }[];
  dataKey?: string;
  color?: string;
  type?: "bar" | "line";
  height?: number;
}) {
  const hasData = data && data.length > 0;

  return (
    <div className="border border-base-300 rounded-xl bg-base-100 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-base-300">
        <span className="font-semibold text-sm text-base-content">{title}</span>
      </div>
      <div className="p-4 flex-1">
        {hasData ? (
          <ResponsiveContainer width="100%" height={height}>
            {type === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--b3))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(var(--bc)/0.6)" }} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(var(--bc)/0.6)" }} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(var(--b1))",
                    border: "1px solid oklch(var(--b3))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--b3))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(var(--bc)/0.6)" }} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(var(--bc)/0.6)" }} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(var(--b1))",
                    border: "1px solid oklch(var(--b3))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: color }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <EmptyChart height={height} />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── main component ────────────────── */
export default function SalesDashboard({
  stats: propStats,
  salesByProduct: propSalesByProduct,
  salesByEmployee: propSalesByEmployee,
  salesByRegion: propSalesByRegion,
  weeklySales: propWeeklySales,
  detailedForecast: propDetailedForecast,
  briefForecast: propBriefForecast,
}: SalesDashboardProps) {
  const { auth } = useAuth();
  const slug = auth?.slug;

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ["salesDashboard", slug],
    queryFn: () => getSalesDashboardData(slug!),
    enabled: !!slug,
  });

  const dashboardData = response?.data?.data || response?.data || {};

  const stats = propStats || dashboardData.stats || defaultStats;
  const salesByProduct = propSalesByProduct || dashboardData.salesByProduct;
  const salesByEmployee = propSalesByEmployee || dashboardData.salesByEmployee;
  const salesByRegion = propSalesByRegion || dashboardData.salesByRegion;
  const weeklySales = propWeeklySales || dashboardData.weeklySales;
  const detailedForecast = propDetailedForecast || dashboardData.detailedForecast;
  const briefForecast = propBriefForecast || dashboardData.briefForecast;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-100px)] bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-base-content/60 font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-100px)] bg-base-200">
        <MdError size={48} className="text-error mb-4" />
        <p className="text-base-content/60 font-medium">Failed to load dashboard data.</p>
        <button onClick={() => refetch()} className="btn btn-outline btn-sm mt-4">Try Again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* ── top padding spacer (topbar is fixed in your layout) ── */}
      <div className="p-5 space-y-6 max-w-[1600px] mx-auto">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((card) => (
            <div
              key={card.label}
              className="bg-base-100 border border-base-300 rounded-xl px-4 py-5 flex flex-col items-center gap-1 shadow-sm"
            >
              <span className="text-2xl font-bold text-primary">{card.value}</span>
              <span className="text-xs text-base-content/60 text-center leading-tight">
                {card.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── SALES BY PRODUCT / EMPLOYEE / REGION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SalesChartCard
            title="Sales By Product"
            data={salesByProduct}
            color="#a855f7"
          />
          <SalesChartCard
            title="Sales By Employee"
            data={salesByEmployee}
            color="#6366f1"
          />
          <SalesChartCard
            title="Sales By Region"
            data={salesByRegion}
            color="#22c55e"
          />
        </div>

        {/* ── WEEKLY SALES ── */}
        <SalesChartCard
          title="Weekly Sales"
          data={weeklySales?.map((d) => ({ name: d.day, value: d.sales }))}
          dataKey="value"
          color="#a855f7"
          type="line"
          height={260}
        />

        {/* ── FORECAST PANELS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ForecastPanel title="Detailed Forecast vs Actual" data={detailedForecast} />
          <ForecastPanel title="Brief Forecast Vs Actual" data={briefForecast} />
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────── usage example ─────────────────── 

import SalesDashboard from "./SalesDashboard";

// Empty state (matches screenshots — all "No Data"):
<SalesDashboard />

// With real data:
<SalesDashboard
  stats={[
    { label: "My This Month Sales", value: "₹ 1,24,500" },
    { label: "My Today's Sales",    value: "₹ 8,200"    },
    { label: "My Orders",           value: "34"          },
    { label: "Pending Quotes",      value: "7"           },
    { label: "Pending Orders",      value: "12"          },
  ]}
  salesByProduct={[
    { name: "Product A", value: 4200 },
    { name: "Product B", value: 3100 },
    { name: "Product C", value: 2800 },
  ]}
  salesByEmployee={[
    { name: "Riya",  value: 5100 },
    { name: "Arjun", value: 3700 },
    { name: "Sneha", value: 2900 },
  ]}
  salesByRegion={[
    { name: "North", value: 6200 },
    { name: "South", value: 4100 },
    { name: "West",  value: 3300 },
  ]}
  weeklySales={[
    { day: "Mon", sales: 1200 },
    { day: "Tue", sales: 1800 },
    { day: "Wed", sales: 900  },
    { day: "Thu", sales: 2200 },
    { day: "Fri", sales: 1600 },
    { day: "Sat", sales: 800  },
    { day: "Sun", sales: 400  },
  ]}
  detailedForecast={[
    { month: "Jan", forecast: 50000, actual: 43000 },
    { month: "Feb", forecast: 55000, actual: 58000 },
    { month: "Mar", forecast: 60000, actual: 57000 },
  ]}
  briefForecast={[
    { month: "Q1", forecast: 165000, actual: 158000 },
    { month: "Q2", forecast: 180000, actual: 172000 },
  ]}
/>

─────────────────────────────────────────────────────────────── */
