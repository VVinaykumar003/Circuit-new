import { useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import type { AttendanceFilters as Filters } from "../../type/attendance";
import { defaultAttendanceFilters } from "../../type/attendance";

const STATUS_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Half Day", value: "HALF_DAY" },
  { label: "Leave", value: "ON_LEAVE" },
];


interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  /** Extra fields for the admin view (department, designation, location, device) */
  showAdvanced?: boolean;
  departmentOptions?: string[];
}

export default function AttendanceFilters({ filters, onChange, showAdvanced, departmentOptions = [] }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function reset() {
    onChange(defaultAttendanceFilters);
  }

  const activeCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "search") return false;
    return v && v !== "All";
  }).length;

  const body = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="form-control w-full sm:w-56">
        <span className="label-text text-xs mb-1">Search</span>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search by name or date…"
            className="input input-bordered input-sm w-full pl-9"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
          />
        </div>
      </label>

      <label className="form-control w-full sm:w-40">
        <span className="label-text text-xs mb-1">Month</span>
        <input
          type="month"
          className="input input-bordered input-sm w-full"
          value={filters.month ?? ""}
          onChange={(e) => set("month", e.target.value || null)}
        />
      </label>

      <label className="form-control w-full sm:w-36">
        <span className="label-text text-xs mb-1">Status</span>
       <select
  className="select select-bordered select-sm w-full"
  value={filters.status}
  onChange={(e) =>
    set(
      "status",
      e.target.value as Filters["status"]
    )
  }
>
  {STATUS_OPTIONS.map((status) => (
    <option
      key={status.value}
      value={status.value}
    >
      {status.label}
    </option>
  ))}
</select>
      </label>

     

      {showAdvanced && (
        <label className="form-control w-full sm:w-40">
          <span className="label-text text-xs mb-1">Department</span>
          <select
            className="select select-bordered select-sm w-full"
            value={filters.department ?? "All"}
            onChange={(e) => set("department", e.target.value)}
          >
            <option value="All">All</option>
            {departmentOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex gap-2 sm:ml-auto">
        <button className="btn btn-sm btn-ghost gap-1" onClick={reset} type="button">
          <X className="w-3.5 h-3.5" />
          Reset
        </button>
        {/* <button className="btn btn-sm btn-primary" type="button" onClick={() => setMobileOpen(false)}>
          Apply Filters
        </button> */}
      </div>
    </div>
  );

  return (
    <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-base-200/80 backdrop-blur">
      {/* Desktop */}
      <div className="hidden md:block rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
        {body}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <button
          className="btn btn-sm btn-outline w-full justify-between"
          onClick={() => setMobileOpen((o) => !o)}
          type="button"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeCount > 0 && <span className="badge badge-primary badge-xs">{activeCount}</span>}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
        {mobileOpen && (
          <div className="mt-2 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">{body}</div>
        )}
      </div>
    </div>
  );
}
