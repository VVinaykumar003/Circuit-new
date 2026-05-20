

function SalaryRow({
  label,
  amount,
  editable,
  onChange,
  isCustom,
  onLabelChange,
  onRemove,
}: {
  label: string;
  amount: number;
  editable?: boolean;
  onChange?: (val: number) => void;
  isCustom?: boolean;
  onLabelChange?: (val: string) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex justify-between items-center text-base-content py-1">
      {isCustom && editable ? (
        <div className="flex items-center gap-2">
          {onRemove && (
            <button onClick={onRemove} className="text-error/70 hover:text-error transition-colors font-bold text-sm" title="Remove Component">
              ✕
            </button>
          )}
          <input
            type="text"
            value={label}
            placeholder="Component Name..."
            onChange={(e) => onLabelChange?.(e.target.value)}
            className="input input-sm input-bordered w-32 bg-base-100"
          />
        </div>
      ) : (
        <span>{label}</span>
      )}
      {editable ? (
        <div className="flex items-center gap-2">
          <span className="text-base-content/60 font-medium">₹</span>
          <input
            type="number"
            value={amount === 0 ? "" : amount}
            onChange={(e) => onChange?.(Number(e.target.value) || 0)}
            className="input input-sm input-bordered w-24 text-right bg-base-100 font-mono"
          />
        </div>
      ) : (
        <span className="font-mono">₹ {amount.toLocaleString()}</span>
      )}
    </div>
  );
}

export default SalaryRow;