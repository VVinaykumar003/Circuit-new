import  { useState } from "react";
import EmployeeAttendance from "../../components/sales/EmployeeAttendance";
import AdminApproval from "./AdminApproval";
import EmployeeAttendanceHistory from "./Employee/EmployeeAttendanceHistory";
import AdminAttendanceHistory from "./AdminAttendanceHistory";

const tabs = [
  "Employee Attendance",
  "Admin Approval",
  "Attendance History",
  "Team Attendance",
  "Leave & Regularization",
  "Attendance Reports",
];

const AttendanceManagementPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <EmployeeAttendance />;
      case 1:
        return <AdminApproval />;
        // Add cases for other tabs here
      case 2:
        return <EmployeeAttendanceHistory />;
      case 3:
        return <AdminAttendanceHistory />;
      // Add cases for other tabs here
      default:
        return (
          <div className="p-8 text-center text-base-content/60">
            This section is under construction.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-base-200/40">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content tracking-tight">
            Attendance Management
          </h1>
          <p className="text-base-content/60 mt-1">
            Track attendance, approvals, and analytics for the sales team.
          </p>
        </div>

        {/* Sticky Tabs */}
        <div className="sticky top-0 z-30 bg-base-200/60 backdrop-blur-md rounded-t-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-2">
          <div role="tablist" className="tabs tabs-bordered tabs-lg">
            {tabs.map((tab, index) => (
              <a
                key={tab}
                role="tab"
                className={`tab ${activeTab === index ? "tab-active" : ""}`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-base-100 rounded-b-2xl shadow-lg">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default AttendanceManagementPage;