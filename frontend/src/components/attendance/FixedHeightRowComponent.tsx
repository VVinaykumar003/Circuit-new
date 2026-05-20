// import { type ListChildComponentProps } from "react-window";
// import StatusBadge from "../ui/StatusBadge";

// export type AttendanceRecord = {
//   id: string;
//   employee: string;
//   date: string;
//   checkIn: string;
//   status: "pending" | "approved" | "rejected";
// };

// type RowData = {
//   records: AttendanceRecord[];
// };

// export function FixedHeightRowComponent({
//   index,
//   style,
//   data,
// }: ListChildComponentProps<RowData>) {
//   const record = data.records[index];

//   return (
//     <div
//       style={style}
//       className="grid grid-cols-5 items-center px-4 py-2 border-b border-base-300 text-base-content"
//     >
//       <span>{record.employee}</span>
//       <span>{record.date}</span>
//       <span>{record.checkIn}</span>
//       <StatusBadge status={record.status} />

//       <div className="flex justify-end gap-2">
//         {record.status !== "approved" && (
//           <button className="btn btn-xs btn-success">
//             Approve
//           </button>
//         )}
//         {record.status !== "rejected" && (
//           <button className="btn btn-xs btn-error">
//             Reject
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
