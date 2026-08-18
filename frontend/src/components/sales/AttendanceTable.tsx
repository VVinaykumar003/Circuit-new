import { useState } from "react";
import { ArrowUpDown, Eye, Download, Inbox, AlertTriangle, RefreshCw } from "lucide-react";
import type { Attendance } from "@/type/attendance";
import AttendanceStatusBadge from "./AttendanceStatusBadge";
import AttendanceCard from "./AttendanceCard";


type SortKey = keyof Pick<Attendance, "date" | "totalHours" | "lateMinutes" | "overtimeHours">;

interface Props {
  records: Attendance[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onView: (record: Attendance) => void;
  onDownloadSlip?: (record: Attendance) => void;
  showEmployeeColumn?: boolean;
  /** Admin-only extra columns */
  showAdminColumns?: boolean;
  onResetFilters?: () => void;
 
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: { key: SortKey; dir: "asc" | "desc" } | null;
  onSort: (key: SortKey) => void;
}) {
  const active = currentSort?.key === sortKey;
  return (
    <th
      className="cursor-pointer select-none hover:bg-base-200 transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${active ? "text-primary" : "text-base-content/30"}`} />
      </span>
    </th>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function AttendanceTable({
  records,
  loading,
  error,
  onRetry,
  onView,
  onDownloadSlip,
  showEmployeeColumn,
  showAdminColumns,
  onResetFilters,


}: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);

  function handleSort(key: SortKey) {
    setSort((prev) => {
      if (prev?.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { key, dir: "desc" };
    });
  }

  const safeRecords = Array.isArray(records) ? records : [];

  const sorted = sort
    ? [...safeRecords].sort((a, b) => {
        const diff = Number(a[sort.key]) - Number(b[sort.key]) || a.date.localeCompare(b.date);
        return sort.dir === "asc" ? diff : -diff;
      })
    : safeRecords;


  if (loading) return <TableSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="w-10 h-10 text-error mb-3" />
        <p className="font-medium text-base-content">{error}</p>
        <p className="text-sm text-base-content/60 mt-1">Something went wrong while loading records.</p>
        {onRetry && (
          <button className="btn btn-sm btn-outline mt-4 gap-2" onClick={onRetry}>
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>
    );
  }

  if (safeRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="w-10 h-10 text-base-content/30 mb-3" />
        <p className="font-medium text-base-content">No attendance records found.</p>
        <p className="text-sm text-base-content/60 mt-1">Try adjusting your filters or date range.</p>
        {onResetFilters && (
          <button className="btn btn-sm btn-outline mt-4" onClick={onResetFilters}>
            Reset Filters
          </button>
        )}
      </div>
    );
  }


  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
        <table className="table table-sm">
          <thead className="sticky top-0 bg-base-200 z-[1] text-sm">
            <tr>
              {/* <th onToggle={toggleSelected}><MdCheckBox/></th> */}
              {showEmployeeColumn && <th>Employee</th>}
              {showAdminColumns && <th>Department</th>}
              <SortableHeader label="Date" sortKey="date" currentSort={sort} onSort={handleSort} />
              <th>Day</th>
              <th>Check In</th>
              <th>Check Out</th>
              <SortableHeader label="Hours" sortKey="totalHours" currentSort={sort} onSort={handleSort} />
              <th>Break</th>
              <SortableHeader label="Late" sortKey="lateMinutes" currentSort={sort} onSort={handleSort} />
              <SortableHeader label="OT" sortKey="overtimeHours" currentSort={sort} onSort={handleSort} />
              <th>Shift</th>
              <th>Status</th>
              {showAdminColumns && <th>Location</th>}
              <th>Remarks</th>
              <th className="text-right ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r._id} className="hover">
               {showEmployeeColumn && (
  <td>
    <div className="flex items-center gap-2">
      {r.employee ? (
        <>
          <img
            src={
              r.employee.imageUrl ||
              `https://i.pravatar.cc/40?u=${r.employee._id}`
            }
            alt={r.employee.name || "Employee"}
            className="w-7 h-7 rounded-full object-cover"
          />

          <div>
            <p className="font-medium leading-tight">
              {r.employee.name || "Unknown Employee"}
            </p>

            <p className="text-[11px] text-base-content/50">
              {r.employee.designation || "--"}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="w-7 h-7 rounded-full bg-base-300 flex items-center justify-center">
            <span className="text-[10px] text-base-content/50">
              N/A
            </span>
          </div>

          <div>
            <p className="font-medium leading-tight">
              Unknown Employee
            </p>

            <p className="text-[11px] text-base-content/50">
              --
            </p>
          </div>
        </>
      )}
    </div>
  </td>
)}
                {showAdminColumns && <td className="text-base-content/70">{r.department ?? "--"}</td>}
                <td className="font-medium">{new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
                <td className="text-base-content/60">{new Date(r.date).toLocaleDateString("en-US", { weekday: "short" })}</td>
                <td>
                  {r.checkIn
                    ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                    : '--:--'}
                </td>
                <td>
                  {r.checkOut
                    ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                    : '--:--'}
                </td>
                <td>{r.totalHours || '00:00' }h</td>
                <td className="text-base-content/60">{r.breakHours || '00:00' }h</td>
                <td className={r.lateMinutes > 0 ? "text-warning font-medium" : "text-base-content/40"}>
                  {r.lateMinutes > 0 ? `${r.lateMinutes}m` : "--"}
                </td>
                <td className={r.overtimeHours > 0 ? "text-success font-medium" : "text-base-content/40"}>
                  {r.overtimeHours > 0 ? `${r.overtimeHours}h` : "--"}
                </td>
                <td className="text-base-content/60 whitespace-nowrap">{r.shift}</td>
                <td>
                  <AttendanceStatusBadge status={r.status?.toUpperCase()} />
                </td>
                {showAdminColumns && <td className="text-base-content/60">{r.location ?? "--"}</td>}
                <td className="text-base-content/60 max-w-[140px] truncate">{r.remarks ?? "--"}</td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button className="btn btn-ghost btn-xs" title="View Details" onClick={() => onView(r)}>
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {onDownloadSlip && (
                      <button className="btn btn-ghost btn-xs" title="Download Slip" onClick={() => onDownloadSlip(r)}>
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {sorted.map((r) => (
          <AttendanceCard key={r.id} record={r} onView={onView} showEmployee={showEmployeeColumn} />
        ))}
      </div>
    </>
  );
}
