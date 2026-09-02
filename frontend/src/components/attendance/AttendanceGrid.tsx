import  { useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { AttendanceDocItem } from "./AdminAttendance";

interface Employee {
  id: string;
  name: string;
  code: string;
}

interface Props {
  employees: Employee[];
  attendanceData: AttendanceDocItem[];
  month: number;
  year: number;
}



export default function AttendanceGrid({
  employees,
  attendanceData,
  month,
  year,
}: Props) {
  const today = new Date();

  // console.log(employees,attendanceData,month,year)

  const formatLocalDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const todayISO = formatLocalDate(today);
  const exportToExcel = () => {
  const sheetData: any[] = [];

  employees.forEach((emp) => {
    const row: any = {
      Name: emp.name,
      Code: emp.code,
    };

    days.forEach((d) => {
      const status = attendanceMap[`${emp.id}_${d.fullDate}`];
      row[`${d.date}-${d.day}`] = getLabel(status);
    });

    sheetData.push(row);
  });

  const worksheet = XLSX.utils.json_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const data = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(data, `attendance_${month + 1}_${year}.xlsx`);
};

  /* ================= DAYS ================= */
  const days = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: totalDays }, (_, i) => {
      const date = i + 1;
      const fullDateObj = new Date(year, month, date);

      return {
        date,
        fullDate: formatLocalDate(fullDateObj),
        day: fullDateObj.toLocaleDateString("en-US", {
          weekday: "short",
        }),
      };
    });
  }, [month, year]);

  /* ================= MAP ================= */
  const attendanceMap = useMemo(() => {
    const map: Record<string, string> = {};

    attendanceData.forEach((day: AttendanceDocItem) => {
      const formattedDate = formatLocalDate(new Date(day.date));

      if (day.records && Array.isArray(day.records)) {
        day.records.forEach((r) => {
          const empObj =
            typeof r.employee === "object" && r.employee !== null
              ? r.employee
              : null;
          const empId =
            empObj?._id ||
            (typeof r.employee === "string" ? r.employee : undefined);
          if (empId) {
            map[`${empId}_${formattedDate}`] = r.status || "";
          }
        });
      } else {
        const empObj =
          typeof day.employee === "object" && day.employee !== null
            ? day.employee
            : null;
        const empId =
          empObj?._id ||
          (typeof day.employee === "string" ? day.employee : undefined);
        if (empId) {
          map[`${empId}_${formattedDate}`] = day.status || "";
        }
      }
    });

    return map;
  }, [attendanceData]);

  /* ================= STYLE ================= */
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "PRESENT":
        return " text-green-600";
      case "ABSENT":
        return " text-red-600";
      case "HALF_DAY":
        return "bg-orange-50 text-orange-600";
      case "ON_LEAVE":
        return "bg-yellow-50 text-yellow-600";
      case "WFH":
        return "bg-blue-50 text-blue-600";
      default:
        return "text-base-content/30";
    }
  };

  const getLabel = (status?: string) => {
    if (!status) return "-";
    if (status === "PRESENT") return "P";
    if (status === "ABSENT") return "A";
    if (status === "HALF_DAY") return "H";
    if (status === "ON_LEAVE") return "L";
    if (status === "WFH") return "W";
  };
return (
  <div className="w-full space-y-2">
    {/* TOP SECTION */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
      <h2 className="text-md font-semibold">Attendance Sheet</h2>

      <button
        onClick={exportToExcel}
        className="btn btn-primary btn-xs sm:btn-sm w-full sm:w-auto"
      >
        Export Excel
      </button>
    </div>

    {/* TABLE WRAPPER */}
   <div
  className="
    w-full overflow-x-auto
    rounded-lg border border-primary/50
    bg-base-100
    [-webkit-overflow-scrolling:touch]
  "
>
      <table className="min-w-max  border-collapse ">
        {/* HEADER */}
        <thead>
          <tr className="bg-primary text-primary-content">
            <th
              className="
                sticky left-0 z-20 bg-primary
                px-2 sm:px-3 py-4
                text-left align-middle
            w-[140px] min-w-[140px] sm:w-[220px] sm:min-w-[220px]
              "
            >
              <div className="flex items-center h-full">
       <span className="font-semibold text-sm whitespace-nowrap">
                  STAFF MEMBER
                </span>
              </div>
            </th>

            {days.map((d) => {
              const isToday = d.fullDate === todayISO;

              return (
                <th
                  key={d.date}
                  className={`
                    text-center min-w-[48px] py-2
                    ${isToday ? "bg-red-500 text-white" : ""}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-xs sm:text-sm font-semibold">
                      {d.date}
                    </span>

                    <span className="text-[10px] sm:text-xs opacity-80">
                      {d.day}
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className="hover:bg-base-200/30 transition-colors duration-200"
            >
              {/* LEFT COLUMN */}
              <td
                className="
                  sticky left-0 z-10
                  bg-base-100
                  border border-base-200
                  px-2 sm:px-4 py-3
                 w-[150px]
min-w-[150px]
sm:w-[180px]
sm:min-w-[180px]
                  shadow-sm
                "
              >
                <div className="flex items-center gap-1.5 ">
                  <div
                    className="
                      w-6 h-6 sm:w-7 sm:h-7
                      rounded-full
                      bg-primary/10 text-primary
                      flex items-center justify-center
                      font-semibold text-sm
                    "
                  >
                    {emp.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-primary text-[13px] truncate">
                      {emp.name}
                    </p>

                    <p className="hidden sm:block  sm:text-xs text-base-content/60 truncate">
                      {emp.code}
                    </p>
                  </div>
                </div>
              </td>

              {/* CELLS */}
              {days.map((d) => {
                const status = attendanceMap[`${emp.id}_${d.fullDate}`];

                const isToday = d.fullDate === todayISO;

                return (
                  <td
                    key={d.date}
                    className={`
                   w-7 h-7 sm:w-8 sm:h-8
                      text-center text-[11px] sm:text-sm
                      border border-base-300
                      ${isToday ? "border-2 border-red-400 font-semibold" : ""}
                      ${getStatusStyle(status)}
                    `}
                  >
                    {getLabel(status)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

}
