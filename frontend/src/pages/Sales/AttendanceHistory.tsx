import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Plus,
  Upload,
  Users,
  UserCheck,
  UserX,
  Clock3,
  Plane,
  TrendingUp,
  Timer,
  Percent,
  Trash2,
  Check,
  X as XIcon,
} from "lucide-react";
import AttendanceStats from "../../components/sales/AttendanceStats";
import AttendanceFilters from "../../components/sales/AttendanceFilters";
import AttendanceTable from "../../components/sales/AttendanceTable";
import AttendanceDetailsDrawer from "../../components/sales/AttendanceDetailsDrawer";
import { useAllAttendance, useApproveAttendance, useRejectAttendance } from "../../hooks/useAttendance";
import { defaultAttendanceFilters } from "../../type/attendance";
import type { Attendance, AttendanceFilters as Filters } from "../../type/attendance";

const DEPARTMENTS = ["Engineering", "Sales", "HR", "Finance", "Support"];

export default function AdminAttendanceHistory() {
  const [filters, setFilters] = useState<Filters>(defaultAttendanceFilters);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Attendance | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pageSize = 10;

  const { data, isLoading, isError, refetch } = useAllAttendance(filters, page, pageSize);
  const { data: stats, isLoading: statsLoading } = useAdminStats(filters.month ?? undefined);
  const deleteMutation = useDeleteAttendance();
  const approveMutation = useApproveAttendance();
  const rejectMutation = useRejectAttendance();

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;
  const records = data?.data ?? [];
  const allSelected = records.length > 0 && records.every((r) => selectedIds.has(r.id));

  function handleFiltersChange(next: Filters) {
    setFilters(next);
    setPage(1);
    setSelectedIds(new Set());
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (allSelected) return new Set();
      return new Set(records.map((r) => r.id));
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    selectedIds.forEach((id) => deleteMutation.mutate(id));
    setSelectedIds(new Set());
  }

  function handleBulkApprove() {
    selectedIds.forEach((id) => approveMutation.mutate(id));
    setSelectedIds(new Set());
  }

  function handleBulkReject() {
    selectedIds.forEach((id) => rejectMutation.mutate(id));
    setSelectedIds(new Set());
  }

  return (
    <div className="min-h-screen bg-base-200/40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Attendance History</h1>
            <p className="text-sm text-base-content/60 mt-0.5">Organization-wide attendance records</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-sm btn-primary gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Attendance
            </button>
            <button className="btn btn-sm btn-outline gap-2">
              <Upload className="w-3.5 h-3.5" /> Bulk Upload
            </button>
            <button className="btn btn-sm btn-outline gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
            </button>
            <button className="btn btn-sm btn-outline gap-2">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button className="btn btn-sm btn-outline gap-2">
              <FileText className="w-3.5 h-3.5" /> PDF
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
            { key: "total", label: "Total Employees", value: stats?.totalEmployees ?? 0, icon: Users, accent: "primary" },
            { key: "present", label: "Present Today", value: stats?.presentToday ?? 0, icon: UserCheck, accent: "success" },
            { key: "absent", label: "Absent Today", value: stats?.absentToday ?? 0, icon: UserX, accent: "error" },
            { key: "late", label: "Late Employees", value: stats?.lateEmployees ?? 0, icon: Clock3, accent: "warning" },
            { key: "leave", label: "On Leave", value: stats?.onLeave ?? 0, icon: Plane, accent: "info" },
            { key: "avg", label: "Avg. Working Hours", value: `${stats?.avgWorkingHours ?? 0}h`, icon: TrendingUp, accent: "primary" },
            { key: "ot", label: "Total Overtime", value: `${stats?.totalOvertime ?? 0}h`, icon: Timer, accent: "primary" },
            { key: "pct", label: "Attendance %", value: `${stats?.attendancePercentage ?? 0}%`, icon: Percent, accent: "success" },
          ]}
        />

        {/* Filters */}
        <AttendanceFilters
          filters={filters}
          onChange={handleFiltersChange}
          showAdvanced
          departmentOptions={DEPARTMENTS}
        />

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="checkbox checkbox-sm" checked={allSelected} onChange={toggleSelectAll} />
              {selectedIds.size} selected
            </label>
            <div className="flex gap-2">
              <button className="btn btn-xs btn-success gap-1" onClick={handleBulkApprove}>
                <Check className="w-3 h-3" /> Approve
              </button>
              <button className="btn btn-xs btn-warning gap-1" onClick={handleBulkReject}>
                <XIcon className="w-3 h-3" /> Reject
              </button>
              <button className="btn btn-xs btn-outline gap-1">
                <Download className="w-3 h-3" /> Export Selected
              </button>
              <button className="btn btn-xs btn-error gap-1" onClick={handleBulkDelete}>
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        )}

        {!selectedIds.size && records.length > 0 && (
          <label className="flex items-center gap-2 text-xs text-base-content/60 px-1">
            <input type="checkbox" className="checkbox checkbox-xs" checked={allSelected} onChange={toggleSelectAll} />
            Select all on this page
          </label>
        )}

        {/* Table */}
        <AttendanceTable
          records={records}
          loading={isLoading}
          error={isError ? "Failed to load attendance records." : null}
          onRetry={() => refetch()}
          onView={setSelected}
          onDownloadSlip={() => {}}
          showEmployeeColumn
          showAdminColumns
          onResetFilters={() => handleFiltersChange(defaultAttendanceFilters)}
        />

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-base-content/50">
              Page {page} of {totalPages} · {data.total} records
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