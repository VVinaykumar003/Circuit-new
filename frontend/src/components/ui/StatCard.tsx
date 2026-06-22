// // interface StatCardProps {
// //   title: string;
// //   value: string | number;
// //  text?: "success" | "warning" | "info" | "error";
// //   icon?: React.ReactNode;
// //   helperText?: string;
// //   variant?: "success" | "warning" | "info" | "error";
// // }

// // export default function StatCard({
// //   title,
// //   value,
// //   icon,
// //   helperText,
// //   text,
// //    variant,
// // }: StatCardProps) {


// //   const variantClass = variant
// //     ? `border-${variant} text-${variant}`
// //     : "border-base-300";

// //     const textClass = text ? `text-${text}` : "text-base-content";
// //   return (
// //     <div className={`bg-base-100 border ${variantClass} rounded-lg p-4`}>
// //       <div className="flex items-center justify-between">
// //         <p className="text-sm font-semibold text-base-content/100">{title}</p>
// //         {icon && <div className="text-primary">{icon}</div>}
// //       </div>

// //       <p className={`text-2xl font-semibold ${textClass} mt-2`}>
// //         {value}
// //       </p>

// //       {helperText && (
// //         <p className="text-xs text-base-content/50 mt-1">
// //           {helperText}
// //         </p>
// //       )}
// //     </div>
// //   );
// // }



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

//   const textClass = text ? "text-base-content/70" : `text-${variant ? variant : "base-content"}`;

//   return (
//     <div
//       className={`group bg-white/80 border ${variantClass} rounded-xl p-4 
//       shadow-sm hover:shadow-md transition-all duration-300`}
//     >
//       {/* TOP */}
//       <div className="flex items-center justify-between">
//         <p className="text-sm font-bold  tracking-wide">
//           {title}
//         </p>

//         {icon && (
//           <div
//             className={`p-2 rounded-lg bg-primary/50 text-white
//             group-hover:scale-105 transition`}
//           >
//             {icon}
//           </div>
//         )}
//       </div>

//       {/* VALUE */}
//       <p className={`text-2xl font-semibold ${textClass} mt-3`}>
//         {value}
//       </p>

//       {/* HELPER */}
//       {helperText && (
//         <p className="text-xs text-base-content/50 mt-1">
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

export default function StatCard({
  title,
  value,
  icon,
  helperText,
  text,
  variant,
}: StatCardProps) {
  
  const variantClass = variant
    ? `border-${variant} bg-white/80 text-${variant}`
    : "border-primary";

  const textClass = text
    ? "text-base-content/70"
    : `text-${variant ? variant : "base-content"}`;

  return (
    <div
      className={`
        group
        w-full
        min-w-0
        bg-white/80
        border
        ${variantClass}
        rounded-xl
        p-3 sm:p-4
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
      `}
    >
      {/* TOP */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs sm:text-sm font-bold text-black tracking-wide break-words">
          {title}
        </p>

        {icon && (
          <div
            className="
              shrink-0
              p-2
              rounded-lg
              bg-primary/50
              text-white
              group-hover:scale-105
              transition
            "
          >
            {icon}
          </div>
        )}
      </div>

      {/* VALUE */}
      <p
        className={`
          text-lg text-black sm:text-2xl
          font-semibold
          mt-2 sm:mt-3
          break-words
          ${textClass}
        `}
      >
        {value}
      </p>

      {/* HELPER */}
      {helperText && (
        <p className="text-[11px] sm:text-xs text-black/50 mt-1 break-words">
          {helperText}
        </p>
      )}
    </div>
  );
}