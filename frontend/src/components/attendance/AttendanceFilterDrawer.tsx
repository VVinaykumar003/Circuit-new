import Button from "../ui/Button";
import AttendanceFilters from "./AttendanceFilter";
import  StatusPills  from "./FilertByStatus";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: {
    name?: string;
    fromDate?: string;
    toDate?: string;
  };
  status: "all" | "approved" | "pending" | "absent";
  onFilterChange: (v: any) => void;
  onStatusChange: (v: any) => void;
  isAdmin: boolean;
}

export default function AttendanceFilterDrawer({
  open,
  onClose,
  filters,
  status,
  onFilterChange,
  onStatusChange,
  isAdmin,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
     <div className="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto pb-8">
      <div className="flex justify-center mb-2">
    <div className="w-10 h-1 bg-base-300 rounded-full"></div>
  </div>
        <div className="flex justify-between items-center ">
          <h3 className="font-semibold text-base-content ">
            Filters
          </h3>
          <Button variant="ghost" onClick={onClose} className="text-base-content/70">
            ✕
          </Button>
        </div>

        <AttendanceFilters
          isAdmin={isAdmin}
          name={filters.name}
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          onChange={onFilterChange}
        />

        <StatusPills
          value={status}
          onChange={onStatusChange}
        />

        <Button
          className="w-full border-base-content"
          variant="primary"
          onClick={onClose}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
