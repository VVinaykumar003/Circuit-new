import React from "react";
import type { EmployeeDetails, AttendanceStatus} from "@/type/index";

// Define font sizes and line height based on ERP standards
const FONT_SIZES = {
  body: '14px', // 0.875rem
  dataTable: '13px', // 0.8125rem
  secondary: '12px', // 0.75rem
  metadata: '11px', // 0.6875rem
  h3: '16px', // 1rem
  h2: '18px', // 1.125rem
  h1: '20px', // 1.25rem
  pageTitle: '24px', // 1.5rem
};

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
  const statusStyle = statusStyles[todayStatus] || { bg: 'bg-base-300', text: 'text-base-content' };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-lg rounded-2xl">
      <div className="card-body flex-col sm:flex-row items-center gap-6 p-6">
        <div className="avatar">
          <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={employee.profileImageUrl || `https://i.pravatar.cc/100?u=${employee.id}`} alt={employee.name} />
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left" style={{ lineHeight: '1.3' }}>
          <h2 className="font-bold" style={{ fontSize: FONT_SIZES.h1 }}>{employee.name}</h2>
          <p className="text-base-content/70" style={{ fontSize: FONT_SIZES.body }}>
            {employee.designation} ({employee.id})
          </p>
          <p className="text-base-content/70" style={{ fontSize: FONT_SIZES.body }}>{employee.department} Department</p>
        </div>
        <div className="divider sm:divider-horizontal"></div>
        <div className="grid lg:grid-cols-1 gap-x-6 gap-y-2 text-center sm:text-left" style={{ lineHeight: '1.3' }}>
            <div className="font-medium text-base-content/60" style={{ fontSize: FONT_SIZES.body }}>Date :
            
            <span className="text-base-content/80" style={{ fontSize: FONT_SIZES.body }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            
             {/* This line was not changed, as it's not directly related to the currentTime state. */}
            

            <div className="font-medium text-base-content/60">Status : 
              <span className={`badge ${statusStyle.bg} ${statusStyle.text} font-medium p-3`}> 
                  {todayStatus}
              </span>
            </div>
          </div>
        </div>
     
    </div>
  );
};

export default EmployeeHeader;