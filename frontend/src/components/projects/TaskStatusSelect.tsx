import type { TaskStatus } from "../../type/task";

const statusOptions: TaskStatus[] = [
  "pending",
  "in-progress",
  "completed",
];

export default function TaskStatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className="select select-xs select-bordered border"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
    >
      {statusOptions.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
