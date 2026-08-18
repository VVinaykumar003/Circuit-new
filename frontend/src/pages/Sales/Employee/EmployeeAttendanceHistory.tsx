import { useState } from "react";
import { Download, FileText, Printer, CalendarCheck, CalendarX, Plane, Clock3, Timer, TrendingUp, List, GitBranch, Percent } from "lucide-react";
import AttendanceStats from "@/components/sales/AttendanceStats";
import AttendanceFilters from "@/components/sales/AttendanceFilters";
import AttendanceTable from "@/components/sales/AttendanceTable";
import AttendanceTimeline from "@/components/sales/AttendanceTimeline";
import AttendanceDetailsDrawer from "../../../components/sales/AttendanceDetailsDrawer";
import { useMyAttendance, useMyStats } from "../../../hooks/useAttendance";
import { defaultAttendanceFilters } from "../../../type/attendance";
import { useAuth } from "@/auth/AuthContext";
import type { Attendance, AttendanceFilters as Filters } from "../../../type/attendance";

type ViewMode = "table" | "timeline";

export default function EmployeeAttendanceHistory() {
  const [filters, setFilters] = useState<Filters>(defaultAttendanceFilters);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>("table");
  const [selected, setSelected] = useState<Attendance | null>(null);
  const pageSize = 10;
  const { auth } = useAuth();
  const employeeId = auth?.user?.userId;

  const { data, isLoading, isError, refetch } = useMyAttendance(filters, page, pageSize);
  const { data: stats, isLoading: statsLoading } = useMyStats({
    employeeId: employeeId || "",
    ...(filters.month && {
      startDate: `${filters.month}-01`,
      endDate: `${filters.month}-${new Date(
        Number(filters.month.split("-")[0]),
        Number(filters.month.split("-")[1]),
        0
      ).getDate()}`,
    }),
  });

  const records: Attendance[] =
    data?.data?.data?.map((item: any) => ({
      ...item.record, // Spread the nested record details
      id: item.record._id, // Ensure a unique ID for React keys
      date: item.date, // Use the parent date
    })) ?? [];


  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;


  function handleFiltersChange(next: Filters) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-base-200/40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Attendance History</h1>
            <p className="text-sm text-base-content/60 mt-0.5">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} summary
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-outline gap-2">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button className="btn btn-sm btn-outline gap-2">
              <FileText className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button className="btn btn-sm btn-ghost gap-2" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>

        {/* Stats */}
        <AttendanceStats
          loading={statsLoading}
          cards={[
            { key: "present", label: "Present Days", value: stats?.totalPresent ?? 0, icon: CalendarCheck, accent: "success" },
            { key: "absent", label: "Absent Days", value: stats?.totalAbsent ?? 0, icon: CalendarX, accent: "error" },
            { key: "leave", label: "Leave Days", value: stats?.totalLeaves ?? 0, icon: Plane, accent: "info" },
            { key: "halfDay", label: "Half Days", value: stats?.totalHalfDay ?? 0, icon: Clock3, accent: "warning" },
            { key: "working", label: "Working Days", value: stats?.totalWorkingDays ?? 0, icon: Timer, accent: "primary" },
            { key: "avg", label: "Attendance %", value: `${stats?.attendancePercentage ?? 0}%`, icon: Percent, accent: "primary" },
          ]}
        />

        {/* Filters */}
        <AttendanceFilters filters={filters} onChange={handleFiltersChange} />

        {/* View toggle */}
        <div className="flex items-center justify-between">
          <div className="join">
            <button
              className={`btn btn-sm join-item gap-1 ${view === "table" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setView("table")}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
            <button
              className={`btn btn-sm join-item gap-1 ${view === "timeline" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setView("timeline")}
            >
              <GitBranch className="w-3.5 h-3.5" /> Timeline
            </button>
          </div>
          {data && <p className="text-xs text-base-content/50">{data.total} records</p>}
        </div>

        {/* Content */}
        {view === "table" ? (
          <AttendanceTable
            records={records}
            loading={isLoading}
            error={isError ? "Failed to load attendance records." : null}
            onRetry={() => refetch()}
            onView={setSelected}
            onResetFilters={() => handleFiltersChange(defaultAttendanceFilters)}
          />
        ) : (
          <AttendanceTimeline records={records} onView={setSelected} />
        )}

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-base-content/50">
              Page {page} of {totalPages}
            </p>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                «
              </button>
              <button className="join-item btn btn-sm btn-disabled">{page}</button>
              <button
                className="join-item btn btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      <AttendanceDetailsDrawer record={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
