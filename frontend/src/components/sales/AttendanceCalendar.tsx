import React, { useState } from "react";
import type { AttendanceRecord, AttendanceStatus } from "@/type/index";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
  records: AttendanceRecord[];
}

const statusIcons: { [key in AttendanceStatus]?: string } = {
  Present: "✔",
  Late: "✔",
  Absent: "❌",
  "Work From Home": "🏠",
  Leave: "🌴",
  "Half Day": "🟡",
  Holiday: "🎉",
};

const statusColors: { [key in AttendanceStatus]?: string } = {
    Present: "text-success",
    Late: "text-warning",
    Absent: "text-error",
    "Work From Home": "text-primary",
    Leave: "text-info",
    "Half Day": "text-yellow-500",
    Holiday: "text-purple-500",
};

const AttendanceCalendar: React.FC<Props> = ({ records }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const recordsMap = new Map(records.map((r) => [r.date, r]));

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-lg rounded-2xl">
      <div className="card-body p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title text-lg font-semibold text-base-content">
            Monthly Overview
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="btn btn-ghost btn-sm btn-circle"><FaChevronLeft /></button>
            <span className="font-semibold w-32 text-center">
              {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
            <button onClick={() => changeMonth(1)} className="btn btn-ghost btn-sm btn-circle"><FaChevronRight /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-base-content/60 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, i) => <div key={`empty-${i}`} className="h-16 rounded-lg"></div>)}
          {days.map((day) => {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = recordsMap.get(dateStr);
            const icon = record ? statusIcons[record.status] : null;
            const color = record ? statusColors[record.status] : '';
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div 
                key={day} 
                className={`h-16 border border-base-300 rounded-lg p-1 flex flex-col items-center justify-center text-center hover:bg-base-200 cursor-pointer transition-colors duration-200 ${isToday ? 'bg-primary/10 border-primary' : ''}`}
              >
                <span className={`font-medium ${isToday ? 'text-primary font-bold' : ''}`}>{day}</span>
                {icon && <span className={`text-xl ${color}`}>{icon}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;