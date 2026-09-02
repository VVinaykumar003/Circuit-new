interface StatCardProps {
  title: string;
  value:  number;
  text?: "success" | "warning" | "info" | "error";
  icon?: React.ReactNode;
  helperText?: string;
  variant?: "success" | "warning" | "info" | "error";
}



export default function StatCard({
  title,
  value,
  icon,
  helperText,
  text,
  variant,
}: StatCardProps) {

const variantStyles = {
  success: "border-success text-success bg-success/5",
  warning: "border-warning text-warning bg-warning/5",
  info: "border-info text-info bg-info/5",
  error: "border-error text-error bg-error/5",
};

  return (
    <div
      className={`
        w-full min-w-0
        bg-base-100
        border rounded-lg
        p-1.5 sm:p-2
        shadow-sm hover:shadow
        transition-all duration-200
        ${variant ? variantStyles[variant] : "border-base-300"}
      `}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-1.5">
        <p className="text-[9px] sm:text-[10px] font-medium text-base-content/70 truncate">
          {title}
        </p>

        {icon && (
          <div className="shrink-0 text-base-content/60 scale-90">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <p
        className={`
          mt-0.5
          text-xs sm:text-base font-bold
          ${text ? `text-${text}` : "text-base-content"}
        `}
      >
        {value}
      </p>

      {/* helper (optional, super small) */}
      {helperText && (
        <p className="text-[8px] text-base-content/40 mt-0.5 truncate">
          {helperText}
        </p>
      )}
    </div>
  );
}