// import type { AttendanceRecord } from "@/type/attendance";

import type { AttendanceRecord } from "@/type/attendance";

type Status = "all" | "approved" | "pending" | "rejected" | "absent";

//  function useAttendanceFilters(
//   records: AttendanceRecord[],
//   filters: {
//     name?: string;
//     fromDate?: string;
//     toDate?: string;
//   },
//   statusFilter: Status
// ) {
//   return records.filter((r) => {
//     if (filters.name) {
//       if (
//         !r.employee
//           .toLowerCase()
//           .includes(filters.name.toLowerCase())
//       ) {
//         return false;
//       }
//     }

//     if (statusFilter !== "all") {
//       if (r.status !== statusFilter) {
//         return false;
//       }
//     }

//     // const recordDate = new Date(r.date).getTime();
// const recordDate = new Date((r as any).rawDate).getTime();
//     if (filters.fromDate) {
//       const from = new Date(filters.fromDate).getTime();
//       if (recordDate < from) return false;
//     }

//     if (filters.toDate) {
//       const to = new Date(filters.toDate).getTime();
//       if (recordDate > to) return false;
//     }

//     return true;
//   });
// }

// export default useAttendanceFilters;
type AttendanceRecordWithRawDate = AttendanceRecord & {
  rawDate: string;
};
function useAttendanceFilters<T extends AttendanceRecord & { rawDate?: string }>(
  records: T[],
  filters: {
    name?: string;
    fromDate?: string;
    toDate?: string;
  },
  statusFilter: Status
): T[] {
  return records.filter((r) => {

    if (filters.name) {
      if (!r.employee.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
    }

    if (statusFilter !== "all") {
      if (r.status !== statusFilter) {
        return false;
      }
    }

    const recordDateObj = new Date(r.rawDate);
    const year = recordDateObj.getFullYear();
    const month = String(recordDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(recordDateObj.getDate()).padStart(2, "0");
    const recordDateStr = `${year}-${month}-${day}`;

    if (filters.fromDate && recordDateStr < filters.fromDate) {
      return false;
    }

    if (filters.toDate && recordDateStr > filters.toDate) {
      return false;
    }

    return true;
  });
}
export default useAttendanceFilters;