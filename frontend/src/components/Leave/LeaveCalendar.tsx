
// import type { LeaveRequest } from "@/type/leave";
// import { useMemo, useState } from "react";
// interface Props {
//   requests: LeaveRequest[];
//   teamLeaves?: LeaveRequest[];
//   officeHolidays?: { date: string; title: string }[];
//   wfhDays?: string[];
//   isAdmin?: boolean;
//   onDateClick?: (dateStr: string) => void;
// }

// export default function LeaveCalendar({
//   requests,
//   teamLeaves = [],
//   officeHolidays = [],
//   wfhDays = [],
//   isAdmin = false,
//   onDateClick,
// }: Props) {
//   const today = new Date();

// const [selectedYear, setSelectedYear] = useState(
//   today.getFullYear()
// );

// const [selectedMonth, setSelectedMonth] = useState(
//   today.getMonth()
// );
// const months = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];
//   /* ================= GENERATE DAYS ================= */

//   const daysInMonth = new Date(
//     selectedYear,
//     selectedMonth + 1,
//     0
//   ).getDate();

//   const firstDay = new Date(
//     selectedYear,
//     selectedMonth,
//     1
//   ).getDay();

//   const daysArray = useMemo(() => {
//     const days: (number | null)[] = [];

//     // Empty cells before month starts
//     for (let i = 0; i < firstDay; i++) {
//       days.push(null);
//     }

//     // Actual days
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }

//     return days;
//   }, [selectedMonth, selectedYear]);

//   /* ================= HELPER ================= */

//   const getDateStr = (day: number) => {
//     const d = new Date(selectedYear, selectedMonth, day);
//     const y = d.getFullYear();
//     const m = String(d.getMonth() + 1).padStart(2, "0");
//     const dd = String(d.getDate()).padStart(2, "0");
//     return `${y}-${m}-${dd}`;
//   };

//   const isLeaveDay = (
//     day: number,
//     type: "self" | "team"
//   ) => {
//     const dateStr = getDateStr(day);

//     const source =
//       type === "self" ? requests : teamLeaves;

//     return source.filter(
//       (leave) =>
//         leave.status === "approved" &&
//         dateStr >= leave.fromDate &&
//         dateStr <=
//           (leave.toDate || leave.fromDate)
//     );
//   };

//   /* ================= CONFLICT CHECK ================= */

//   const hasConflict = (day: number) => {
//     const selfLeaves = isLeaveDay(day, "self");
//     const teamLeaves = isLeaveDay(day, "team");

//     return selfLeaves.length > 0 && teamLeaves.length > 0;
//   };

//   return (
//     <div className="bg-base-100 border border-primary/60  rounded-xl p-6 text-base-content">

//       <h3 className="text-lg font-semibold mb-4">
//         Leave Calendar
//       </h3>
// <div className="flex justify-between gap-1  mb-6 bg-primary p-1.5 rounded-lg  w-[600px] ">

//   {/* Month Dropdown */}
//   <select
//     value={selectedMonth}
//     onChange={(e) =>
//       setSelectedMonth(Number(e.target.value))
//     }
//     className="select select-bordered border border-primary"
//   >
//     {months.map((month, index) => (
//       <option key={month} value={index}>
//         {month}
//       </option>
//     ))}
//   </select>

//   {/* Year Dropdown */}
//   <select
//     value={selectedYear}
//     onChange={(e) =>
//       setSelectedYear(Number(e.target.value))
//     }
//     className="select select-bordered border border-primary"
//   >
//     {Array.from({ length: 10 }, (_, i) => {
//       const year =
//         today.getFullYear() - 5 + i;

//       return (
//         <option key={year} value={year}>
//           {year}
//         </option>
//       );
//     })}
//   </select>
// </div>
//       {/* Week Days */}
//       <div className="grid grid-cols-7 gap-2 mb-2 text-sm font-medium text-base-content">
//         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
//           (day) => (
//             <div key={day} className="text-center">
//               {day}
//             </div>
//           )
//         )}
//       </div>

//       {/* Calendar Grid */}
//       <div className="grid grid-cols-7 gap-2">
//         {daysArray.map((day, index) => {
//           if (!day)
//             return (
//               <div key={index} className="h-20" />
//             );

//           const dateStr = getDateStr(day);
//           const selfLeaves = isLeaveDay(day, "self");
//           const teamLeavesForDay = isLeaveDay(day, "team");
//           const conflict = hasConflict(day);
//           const holiday = officeHolidays.find((h) => h.date === dateStr);
//           const isWfh = wfhDays.includes(dateStr);

//           const isSelf = selfLeaves.length > 0;
//           const isTeam = teamLeavesForDay.length > 0;

//           return (
//             <div
//               key={index}
//               onClick={() => onDateClick?.(dateStr)}
//               className={`h-20 rounded-lg border p-2 text-sm relative
//                 ${onDateClick ? "cursor-pointer hover:border-primary transition-colors" : ""}
//                 ${
//                   holiday
//                     ? "bg-info/20 border-info"
//                     : conflict
//                     ? "bg-error/20 border-error"
//                     : isSelf
//                     ? "bg-primary/20 border-primary"
//                     : isTeam
//                     ? "bg-warning/20 border-warning"
//                     : isWfh
//                     ? "bg-success/20 border-success"
//                     : "bg-base-200"
//                 }`}
//             >
//               <div className="font-medium">
//                 {day}
//               </div>

//               {holiday && (
//                 <div className="absolute top-1 right-1 text-xs text-info font-semibold truncate max-w-[80%]">
//                   {holiday.title}
//                 </div>
//               )}

//               {isSelf && (
//                 <div className="absolute bottom-1 left-1 text-[10px] sm:text-xs font-semibold text-primary truncate max-w-[90%]">
//                   {isAdmin 
//                     ? selfLeaves.length === 1 
//                       ? selfLeaves[0].employee 
//                       : `${selfLeaves.length} on leave`
//                     : "You"}
//                 </div>
//               )}

//               {isTeam && (
//                 <div className="absolute bottom-1 right-1 text-xs text-warning">
//                   Team
//                 </div>
//               )}

//               {isWfh && !isSelf && !holiday && (
//                 <div className="absolute bottom-1 left-1 text-xs text-success font-medium">
//                   WFH
//                 </div>
//               )}

//               {conflict && !holiday && (
//                 <div className="absolute top-1 right-1 text-xs text-error">
//                   ⚠
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Legend */}
//       <div className="flex gap-4 mt-6 text-xs font-bold flex-wrap">
//         <div className="flex items-center gap-2">
//           <span className="w-3 h-3 bg-primary/50 rounded" />
//           {isAdmin ? "Employee Leave" : "Your Leave"}
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-3 h-3 bg-warning/50 rounded" />
//           Team Leave
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-3 h-3 bg-error/50 rounded" />
//           Conflict
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-3 h-3 bg-info/50 rounded" />
//           Office Holiday
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-3 h-3 bg-success/50 rounded" />
//           WFH
//         </div>
//       </div>
//     </div>
//   );
// }



import type { LeaveRequest } from "@/type/leave";
import { useMemo, useState } from "react";

interface Props {
  requests: LeaveRequest[];
  teamLeaves?: LeaveRequest[];
  officeHolidays?: { date: string; title: string }[];
  wfhDays?: string[];
  isAdmin?: boolean;
  onDateClick?: (dateStr: string) => void;
}

export default function LeaveCalendar({
  requests,
  teamLeaves = [],
  officeHolidays = [],
  wfhDays = [],
  isAdmin = false,
  onDateClick,
}: Props) {
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear()
  );

  const [selectedMonth, setSelectedMonth] = useState(
    today.getMonth()
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  /* ================= GENERATE DAYS ================= */

  const daysInMonth = new Date(
    selectedYear,
    selectedMonth + 1,
    0
  ).getDate();

  const firstDay = new Date(
    selectedYear,
    selectedMonth,
    1
  ).getDay();

  const daysArray = useMemo(() => {
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [selectedMonth, selectedYear]);

  /* ================= HELPERS ================= */

  const getDateStr = (day: number) => {
    const d = new Date(selectedYear, selectedMonth, day);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${dd}`;
  };

  const isLeaveDay = (
    day: number,
    type: "self" | "team"
  ) => {
    const dateStr = getDateStr(day);

    const source =
      type === "self" ? requests : teamLeaves;

    return source.filter(
      (leave) =>
        leave.status === "approved" &&
        dateStr >= leave.fromDate &&
        dateStr <=
          (leave.toDate || leave.fromDate)
    );
  };

  const hasConflict = (day: number) => {
    const selfLeaves = isLeaveDay(day, "self");
    const teamLeaves = isLeaveDay(day, "team");

    return (
      selfLeaves.length > 0 &&
      teamLeaves.length > 0
    );
  };

  return (
    // <div className="bg-base-100 border border-primary/60 rounded-xl p-3 sm:p-5 lg:p-6 text-base-content overflow-hidden">
    <div className="bg-base-100 border border-primary/40 rounded-2xl p-2 sm:p-5 lg:p-6 text-base-content overflow-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        
        <h3 className="text-base sm:text-lg font-semibold">
          Leave Calendar
        </h3>

        {/* FILTERS */}
        <div
          className="
            flex flex-col
            sm:flex-row
            gap-2
            bg-primary
            p-2
            rounded-lg
            w-full
            sm:w-auto
          "
        >
          {/* Month */}
          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(Number(e.target.value))
            }
            className="
              select
              select-bordered
              border
              border-primary
              w-full
              sm:w-auto
              text-sm
            "
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(Number(e.target.value))
            }
            className="
              select
              select-bordered
              border
              border-primary
              w-full
              sm:w-auto
              text-sm
            "
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year =
                today.getFullYear() - 5 + i;

              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* WEEK DAYS */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-[10px] sm:text-sm font-medium text-base-content">
        {[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ].map((day) => (
          <div
            key={day}
            className="text-center truncate"
          >
            {day}
          </div>
        ))}
      </div>

      {/* CALENDAR */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {daysArray.map((day, index) => {
          if (!day)
            return (
              <div
                key={index}
                className="h-16 sm:h-20"
              />
            );

          const dateStr = getDateStr(day);

          const selfLeaves = isLeaveDay(
            day,
            "self"
          );

          const teamLeavesForDay = isLeaveDay(
            day,
            "team"
          );

          const conflict = hasConflict(day);

          const holiday = officeHolidays.find(
            (h) => h.date === dateStr
          );

          const isWfh = wfhDays.includes(dateStr);

          const isSelf = selfLeaves.length > 0;
          const isTeam =
            teamLeavesForDay.length > 0;

          return (
            <div
              key={index}
              onClick={() =>
                onDateClick?.(dateStr)
              }
              className={`
                min-h-[70px]
                sm:h-20
                rounded-lg
                border
                p-1.5
                sm:p-2
                text-[10px]
                sm:text-sm
                relative
                overflow-hidden
                transition-colors

                ${
                  onDateClick
                    ? "cursor-pointer hover:border-primary"
                    : ""
                }

                ${
                  holiday
                    ? "bg-info/20 border-info"
                    : conflict
                    ? "bg-error/20 border-error"
                    : isSelf
                    ? "bg-primary/20 border-primary"
                    : isTeam
                    ? "bg-warning/20 border-warning"
                    : isWfh
                    ? "bg-success/20 border-success"
                    : "bg-base-200"
                }
              `}
            >
              {/* DATE */}
              <div className="font-semibold text-xs sm:text-sm">
                {day}
              </div>

              {/* HOLIDAY */}
              {holiday && (
                <div className="absolute top-1 right-1 text-[9px] sm:text-[10px] text-info font-semibold truncate max-w-[70%]">
                  {holiday.title}
                </div>
              )}

              {/* SELF */}
              {isSelf && (
                <div className="absolute bottom-1 left-1 text-[9px] sm:text-[10px] font-semibold text-primary truncate max-w-[75%]">
                  {isAdmin
                    ? selfLeaves.length === 1
                      ? selfLeaves[0].employee
                      : `${selfLeaves.length} leave`
                    : "You"}
                </div>
              )}

              {/* TEAM */}
              {isTeam && (
                <div className="absolute bottom-1 right-1 text-[9px] sm:text-[10px] text-warning font-semibold">
                  Team
                </div>
              )}

              {/* WFH */}
              {isWfh && !isSelf && !holiday && (
                <div className="absolute bottom-1 left-1 text-[9px] sm:text-[10px] text-success font-medium">
                  WFH
                </div>
              )}

              {/* CONFLICT */}
              {conflict && !holiday && (
                <div className="absolute top-1 right-1 text-[10px] sm:text-xs text-error">
                  ⚠
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mt-5 text-[10px] sm:text-xs font-bold">
        
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-primary/50 rounded shrink-0" />
          {isAdmin
            ? "Employee Leave"
            : "Your Leave"}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-warning/50 rounded shrink-0" />
          Team Leave
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-error/50 rounded shrink-0" />
          Conflict
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-info/50 rounded shrink-0" />
          Office Holiday
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-success/50 rounded shrink-0" />
          WFH
        </div>
      </div>
    </div>
  );
}