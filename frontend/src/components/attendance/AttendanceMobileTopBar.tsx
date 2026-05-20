import Input from "../ui/Input";
import Button from "../ui/Button";
import { ListFilter } from "lucide-react";

interface Props {
  isAdmin: boolean;
  name?: string;
  fromDate?: string;
  toDate?: string;
  onChange: (filters: {
    name?: string;
    fromDate?: string;
    toDate?: string;
  }) => void;
  onOpenFilters: () => void;
}

export default function AttendanceMobileTopBar({
  isAdmin,
  name,
  fromDate,
  toDate,
  onChange,
  onOpenFilters,
}: Props) {
  return (
    <div className="md:hidden flex items-end gap-3 mb-3">
      {/* 🔍 Search (Admin only) */}
      {isAdmin && (
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-base-content/60">
            Employee
          </label>

          <Input
            type="text"
            value={name}
            placeholder="Search by name"
            iconLeft="🔍"
            onChange={(e) =>
              onChange({
                name: e.target.value,
                fromDate,
                toDate,
              })
            }
          />
        </div>
      )}

      {/* FILTER BUTTON */}
      <Button
        variant="outline"
        size="sm"
        className="whitespace-nowrap border-base-content text-base-content "
        onClick={onOpenFilters}
      >
        <ListFilter className="w-4 h-4 mr-1" />
        Filters
      </Button>
    </div>
  );
}
