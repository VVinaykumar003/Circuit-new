interface Props {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function LabeledInput({
  label,
  value,
  type = "text",
  onChange,
  placeholder,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-base-content/70">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input input-bordered w-full"
      />
    </div>
  );
}