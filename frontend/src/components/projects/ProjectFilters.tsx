// type Filter = "all" | "active" | "completed" | "on hold";

// interface Props {
//   value: Filter;
//   onChange: (v: Filter) => void;
// }

// export default function ProjectFilters({ value, onChange }: Props) {
//   return (
//     <div className="tabs tabs-boxed bg- w-fit mb-4 text-base-content">
//       {(["all", "active", "completed", "on hold"] as Filter[]).map(
//         (f) => (
//           <button
//             key={f}
//             className={`tab ${value === f ? "tab-active" : ""}`}
//             onClick={() => onChange(f)}
//           >
//             {f.replace("-", " ")}
//           </button>
//         )
//       )}
//     </div>
//   );
// }
type Filter = "all" | "active" | "completed" | "on hold";

interface Props {
  value: Filter;
  onChange: (v: Filter) => void;
}

export default function ProjectFilters({ value, onChange }: Props) {
  return (
    <div className="tabs tabs-boxed bg-base-200 p-1 rounded-lg w-fit mb-4">
      {(["all", "active", "completed", "on hold"] as Filter[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`tab px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
            ${
              value === f
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content hover:bg-base-100"
            }`}
        >
        {f.split(" ").map(word => 
  word.charAt(0).toUpperCase() + word.slice(1)
).join(" ")}
        </button>
      ))}
    </div>
  );
}