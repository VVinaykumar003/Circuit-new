
// interface StatCardProps {
//   title: string;
//   value: string | number;
//   text?: "success" | "warning" | "info" | "error";
//   icon?: React.ReactNode;
//   helperText?: string;
//   variant?: "success" | "warning" | "info" | "error";
// }

// export default function StatCard({
//   title,
//   value,
//   icon,
//   helperText,
//   text,
//   variant,
// }: StatCardProps) {
  
//   const variantClass = variant
//     ? `border-${variant} bg-white/80 text-${variant}`
//     : "border-primary";

//   const textClass = text
//     ? "text-base-content/70"
//     : `text-${variant ? variant : "base-content"}`;

//   return (
//     <div
//       className={`
//         group
//         w-full
//         min-w-0
//         bg-white/80
//         border
//         ${variantClass}
//         rounded-xl
//         p-1 sm:p-2
//         shadow-sm
//         hover:shadow-md
//         transition-all
//         duration-300
//       `}
//     >
//       {/* TOP */}
//       <div className="flex items-start justify-between ">
//         <p className="text-xs sm:text-sm font-bold text-black tracking-wide break-words">
//           {title}
//         </p>

//         {icon && (
//           <div
//             className="
//               shrink-0
//               p-1
//               rounded-lg
//               bg-primary/50
//               text-white
//               group-hover:scale-105
//               transition
//             "
//           >
//             {icon}
//           </div>
//         )}
//       </div>

//       {/* VALUE */}
//       <p
//         className={`
//           text-lg text-black sm:text-xl
//           font-semibold
//           mt-2 sm:mt-3
//           break-words
//           ${textClass}
//         `}
//       >
//         {value}
//       </p>

//       {/* HELPER */}
//       {helperText && (
//         <p className="text-[11px] sm:text-xs text-black/50 mt-1 break-words">
//           {helperText}
//         </p>
//       )}
//     </div>
//   );
// }

interface StatCardProps {
  title: string;
  value: string | number;
  text?: "success" | "warning" | "info" | "error";
  icon?: React.ReactNode;
  helperText?: string;
  variant?: "success" | "warning" | "info" | "error";
}

const variantStyles = {
  success: "border-success text-success bg-success/5",
  warning: "border-warning text-warning bg-warning/5",
  info: "border-info text-info bg-info/5",
  error: "border-error text-error bg-error/5",
};

export default function StatCard({
  title,
  value,
  icon,
  helperText,
  text,
  variant,
}: StatCardProps) {

  const variantStyles = {
    success: "border-success text-success",
    warning: "border-warning text-warning",
    info: "border-info text-info",
    error: "border-error text-error",
  };

  return (
    <div
      className={`
        w-full min-w-0
        bg-base-100
        border rounded-lg
        p-2 sm:p-3
        shadow-sm hover:shadow
        transition-all duration-200
        ${variant ? variantStyles[variant] : "border-base-300"}
      `}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] sm:text-xs font-medium text-base-content/70 truncate">
          {title}
        </p>

        {icon && (
          <div className="shrink-0 text-base-content/60">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <p
        className={`
          mt-1
          text-base sm:text-lg font-bold
          ${text ? `text-${text}` : "text-base-content"}
        `}
      >
        {value}
      </p>

      {/* helper (optional, super small) */}
      {helperText && (
        <p className="text-[10px] text-base-content/40 mt-0.5 truncate">
          {helperText}
        </p>
      )}
    </div>
  );
}