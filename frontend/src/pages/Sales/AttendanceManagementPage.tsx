import  { useState } from "react";
import EmployeeAttendance from "../../components/sales/EmployeeAttendance";
import AdminApproval from "./AdminApproval";
import EmployeeAttendanceHistory from "./Employee/EmployeeAttendanceHistory";
import AdminAttendanceHistory from "./AdminAttendanceHistory";
// import TeamAttendance from "./TeamAttendance";
import { useAuth } from "@/auth/useAuth";

const allTabsConfig = [
  { id: 0, name: "Employee Attendance", component: <EmployeeAttendance />, roles: ["employee"] },
  { id: 1, name: "Admin Approval", component: <AdminApproval />, roles: ["admin", "owner"] },
  { id: 2, name: "Attendance History", component: <EmployeeAttendanceHistory />, roles: ["employee"] },
  { id: 3, name: "Team Attendance", component: <AdminAttendanceHistory />, roles: ["admin", "owner"] },
  // { id: 4, name: "Leave & Regularization", component: <div className="p-8 text-center text-base-content/60">This section is under construction.</div>, roles: ["employee", "admin", "owner"] },
  // { id: 5, name: "Attendance Reports", component: <div className="p-8 text-center text-base-content/60">This section is under construction.</div>, roles: ["admin", "owner"] },
];

const AttendanceManagementPage = () => {
  const { auth: { user } } = useAuth();
  const isAdmin = ["admin", "owner"].includes(user?.role || "");
  const [activeTab, setActiveTab] = useState(isAdmin ? 1 : 0); // Default to Admin Approval for admins, Employee Attendance for others

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return  <EmployeeAttendance />;
      case 1:
        return <AdminApproval />;
      case 2:
        return <EmployeeAttendanceHistory />;
      case 3: // This case now corresponds to Leave & Regularization in allTabsConfig
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

  const visibleTabs = allTabsConfig.filter(tab => {
    if (isAdmin) return tab.roles.includes("admin") || tab.roles.includes("owner");
    // For non-admin, only show tabs explicitly for 'employee' or common tabs
    return tab.roles.includes("employee");
  });

  return (
    <div className="min-h-screen bg-base-200/40">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content tracking-tight">
            Attendance Management
          </h1>
          <p className="text-base-content/60 mt-1 text-xs">
            Track attendance, approvals, and analytics for the sales team.
          </p>
        </div>

        {/* Sticky Tabs */}
        <div className=" top-0 z-30 bg-base-200/60 backdrop-blur-md rounded-t-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-2">
          <div role="tablist" className="tabs tabs-bordered tabs-lg">
            {visibleTabs.map((tab) => (
              <a
                key={tab.id}
                role="tab"
                className={`text-sm tab ${activeTab === tab.id ? "tab-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
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