// import {Clock ,NotepadText } from "lucide-react"

// type AttendanceTab = "records" | "mark";

// interface Props {
//   value: AttendanceTab;
//   onChange: (tab: AttendanceTab) => void;
// }

// export default function AttendanceTabs({ value, onChange }: Props) {
//   return (
//     <div className="mb-4 flex justify-center md:justify-start">
//       <div
//         className="
//           flex gap-1 p-1 rounded-xl
//           bg-base-200
//           shadow-inner
//         "
//       >
//         <button
//           onClick={() => onChange("mark")}
//           className={`
//            flex gap-2 px-4 py-2 rounded-lg text-sm font-medium
//             transition-all
//             ${
//               value === "mark"
//                 ? "bg-base-100 shadow text-primary"
//                 : "text-base-content/70 hover:bg-base-100/60"
//             }
//           `}
//         >
//           <Clock/> Mark Attendance
//         </button>

//         <button
//           onClick={() => onChange("records")}
//           className={`
//             flex gap-2 px-4 py-2 rounded-lg text-sm font-medium
//             transition-all
//             ${
//               value === "records"
//                 ? "bg-base-100 shadow text-primary"
//                 : "text-base-content/70 hover:bg-base-100/60"
//             }
//           `}
//         >
//           <NotepadText/> Records
//         </button>

        
//       </div>
//     </div>
//   );
// }


import { Clock, NotepadText } from "lucide-react";

type AttendanceTab = "records" | "mark";

interface Props {
  value: AttendanceTab;
  onChange: (tab: AttendanceTab) => void;
}

export default function AttendanceTabs({ value, onChange }: Props) {
  return (
    <div className="mb-5 mt-4 flex justify-center md:justify-start">
      <div className="bg-base-200 p-1 rounded-lg inline-flex gap-1">

        {/* MARK */}
        <button
          onClick={() => onChange("mark")}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200
            ${
              value === "mark"
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/60 hover:bg-base-100"
            }
          `}
        >
          <Clock size={16} />
          Mark Attendance
        </button>

        {/* RECORDS */}
        <button
          onClick={() => onChange("records")}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200
            ${
              value === "records"
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/60 hover:bg-base-100"
            }
          `}
        >
          <NotepadText size={16} />
          Records
        </button>

      </div>
    </div>
  );
}