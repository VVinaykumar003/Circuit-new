import React, { useState, useEffect } from "react";
import type { EmployeeDetails, AttendanceStatus } from "@/type/index";

interface Props {
  employee: EmployeeDetails;
  todayStatus: AttendanceStatus;
}

const statusStyles: { [key in AttendanceStatus]?: { bg: string; text: string } } = {
    Present: { bg: 'bg-success/10', text: 'text-success' },
    Late: { bg: 'bg-warning/10', text: 'text-warning' },
    Absent: { bg: 'bg-error/10', text: 'text-error' },
    'On Break': { bg: 'bg-blue-500/10', text: 'text-blue-500' },
};

const EmployeeHeader: React.FC<Props> = ({ employee, todayStatus }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const statusStyle = statusStyles[todayStatus] || { bg: 'bg-base-300', text: 'text-base-content' };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-lg rounded-2xl">
      <div className="card-body flex-col sm:flex-row items-center gap-6 p-6">
        <div className="avatar">
          <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={employee.profileImageUrl || `https://i.pravatar.cc/100?u=${employee.id}`} alt={employee.name} />
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold">{employee.name}</h2>
          <p className="text-base-content/70">
            {employee.designation} ({employee.id})
          </p>
          <p className="text-base-content/70">{employee.department} Department</p>
        </div>
        <div className="divider sm:divider-horizontal"></div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-center sm:text-left">
            <div className="font-medium text-base-content/60">Date</div>
            <div className="font-semibold">{currentTime.toLocaleDateString('en-CA')}</div>

            <div className="font-medium text-base-content/60">Time</div>
            <div className="font-semibold">{currentTime.toLocaleTimeString()}</div>

            <div className="font-medium text-base-content/60">Status</div>
            <div className={`badge ${statusStyle.bg} ${statusStyle.text} font-semibold p-3`}>
                {todayStatus}
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHeader;