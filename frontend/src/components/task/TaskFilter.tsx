import clsx from "clsx";

interface Props {
  value: string;
  onChange: (v: any) => void;
}

const FILTERS = [
  { id: "all", label: "All Tasks" },
  { id: "this-week", label: "This Week" },
  { id: "high-priority", label: "High Priority" },
  { id: "overdue", label: "Overdue" },
];

export default function TaskFilters({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={clsx(
            "px-3 py-1.5 rounded-full text-xs border transition text-base-content/80 font-medium",
            value === f.id
              ? "bg-primary text-primary-content border-primary"
              : "bg-base-100 border-primary hover:bg-white/50"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
