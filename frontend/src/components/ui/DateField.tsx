import { fieldSizeClasses } from "./sizes";
import type { FieldSize } from "./sizes";


interface DateFieldProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  disabled?: boolean;
  size?: FieldSize;
}

export default function DateField({
  value,
  onChange,
  label = "Due date",
  disabled = false,
  size = "md",
}: DateFieldProps) {
  return (
    <label
      className={`flex items-center gap-2 rounded-lg border border-base-300 
      bg-base-100 hover:bg-base-200 transition cursor-pointer
      ${fieldSizeClasses[size]}
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {/* <span className="text-base-content/60">📅</span> */}

      <span className="text-base-content/60 whitespace-nowrap">
        {label}
      </span>

      <input
        type="date"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none text-sm text-base-content 
        focus:outline-none cursor-pointer"
      />
    </label>
  );
}
