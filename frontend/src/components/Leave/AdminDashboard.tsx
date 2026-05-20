
import { useEffect, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import LeaveRequestTable from "@/components/Leave/LeaveRequestTable";
// import LeaveFilters from "@/components/Leave/LeaveFilters";
import {
  MdBeachAccess,
  MdPendingActions,
  MdCancel,
  MdCheckCircle,
  MdCalendarMonth,
  MdAssignment,
  MdMenuBook,
  MdHistory,
} from "react-icons/md";
import { toast } from "react-toastify";

import { getAllLeaves, updateLeaveStatus, bulkUpdateLeaveStatus } from "@/services/leaveService";
import { getHolidays, addHoliday, updateHoliday, deleteHoliday } from "@/services/holidayService";
import { getLeavePolicy, updateLeavePolicy } from "@/services/leavePolicyService";
import type { LeaveRequest } from "@/type/leave";
import LeaveCalendar from "./LeaveCalendar";
import AddHolidayDrawer from "./AddHolidayDrawer";
import LeavePolicy from "./LeavePolicy";
import MobileLeaveTabs from "./MobileLeaveTabs";
// import { getOrganizationSlug } from "@/utils/auth";
import { useAuth } from "@/auth/AuthContext";
import { data } from "react-router-dom";
import LeaveDrawer from "./LeaveDrawer";



export default function AdminLeaveDashboard() {
  const {auth } = useAuth();
   const slug = auth.slug;
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<{ _id?: string; date: string; title: string; description?: string }[]>([]);
  const [policy, setPolicy] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"requests"| "history" | "calendar" | "policy">("requests");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHoliday, setSelectedHoliday] = useState<{ _id?: string; date: string; title: string; description?: string } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);


    useEffect(() => {
      const fetchData = async () => {
        try {
         
          
                 if (!slug) {
                   toast.error("User data not found. Please log in again.");
                   return;
                 }
          
          const [leavesRes, holidaysRes, policyRes] = await Promise.all([
            getAllLeaves(slug),
            getHolidays(slug),
            getLeavePolicy(slug)
          ]);

         
          
          const fetchedLeaves: LeaveRequest[] = leavesRes.data.leaves.map((leave: any) => ({
            id: leave._id,
            employee: leave.name || leave.user?.name || "Employee",
            type: leave.leaveType,
            fromDate: leave.startDate ? leave.startDate.split("T")[0] : "",
            toDate: leave.endDate ? leave.endDate.split("T")[0] : "",
            reason: leave.reason,
            status: leave.status,
          }));
          
          setRequests(fetchedLeaves);
          setHolidays(holidaysRes.data.holidays || []);
          setPolicy(policyRes.data.policy || null);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      };
    
      fetchData();
    }, []);


  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
   
       if (!slug) {
         toast.error("User data not found. Please log in again.");
         return;
       }
       console.log("id",id)

      await updateLeaveStatus(slug, id, { status });
      
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Leave ${status} successfully`);
    } catch (error: any) {
      console.error(`Failed to ${status} leave:`, error); 
      toast.error(error.response?.data?.message || `Failed to update leave status`);
    }
  };

  const approve = (id: string) => handleStatusUpdate(id, "approved");
  const reject = (id: string) => handleStatusUpdate(id, "rejected");

  const handleBulkStatusUpdate = async (ids: string[], status: "approved" | "rejected") => {
    try {
    
       if (!slug) {
         toast.error("User data not found. Please log in again.");
         return;
       }

      await bulkUpdateLeaveStatus(slug, { leaveIds: ids, status });
      
      setRequests((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status } : r)));
      toast.success(`Selected leaves ${status} successfully`);
    } catch (error: any) {
      console.error(`Failed to ${status} selected leaves:`, error);
      toast.error(error.response?.data?.message || `Failed to update selected leave statuses`);
    }
  };

  const bulkApprove = (ids: string[]) => handleBulkStatusUpdate(ids, "approved");
  const bulkReject = (ids: string[]) => handleBulkStatusUpdate(ids, "rejected");

  const total = requests.length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  const handleDateClick = (dateStr: string) => {
    const existingHoliday = holidays.find((h) => h.date === dateStr);
    setSelectedDate(dateStr);
    setSelectedHoliday(existingHoliday || null);
    setIsDrawerOpen(true);
  };

  const handleAddOrUpdateHoliday = async (data: { date: string; title: string; description: string }) => {
    try {
     
      
      if (selectedHoliday?._id) {
        const response = await updateHoliday(slug , selectedHoliday._id, data);
        setHolidays((prev) => prev.map((h) => h._id === selectedHoliday._id ? response.data.holiday : h));
        toast.success("Holiday updated successfully");
      } else {
        const response = await addHoliday(slug, data);
        setHolidays((prev) => [...prev, response.data.holiday]);
        toast.success("Holiday published to calendar successfully");
      }
      
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error("Failed to save holiday");
      console.error(error);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
     
      await deleteHoliday(slug , id);
      setHolidays((prev) => prev.filter((h) => h._id !== id));
      toast.success("Holiday deleted successfully");
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error("Failed to delete holiday");
      console.error(error)
    }
  };

  const handleSavePolicy = async (policyData: any) => {
    try {
   
   
       if (!slug) {
         toast.error("User data not found. Please log in again.");
         return;
       }
      
      const response = await updateLeavePolicy(slug, policyData);
      setPolicy(response.data.policy);
      toast.success("Leave policy updated successfully!");
    } catch (error) {
      toast.error("Failed to update leave policy.");
      console.error(error)
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={total} icon={<MdBeachAccess />} />
        <StatCard title="Pending" value={pending} variant="warning" icon={<MdPendingActions />} />
        <StatCard title="Approved" value={approved} variant="success" icon={<MdCheckCircle />} />
        <StatCard title="Rejected" value={rejected} variant="error" icon={<MdCancel />} />
      </section>

      {/* FILTERS */}
      {/* <LeaveFilters /> */}

      {/* TABS */}
      <div className="hidden md:block mb-5 mt-4">
  <div className="bg-base-200 p-1 rounded-lg inline-flex gap-1">

    {/* REQUESTS */}
    <button
      onClick={() => setActiveTab("requests")}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        ${
          activeTab === "requests"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }`}
    >
      <MdAssignment size={16} />
      Leave Requests
    </button>

    {/* HISTORY */}
    <button
      onClick={() => setActiveTab("history")}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        ${
          activeTab === "history"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }`}
    >
      <MdAssignment size={16} />
      Leave History
    </button>

    {/* CALENDAR */}
    <button
      onClick={() => setActiveTab("calendar")}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        ${
          activeTab === "calendar"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }`}
    >
      <MdCalendarMonth size={16} />
      Calendar
    </button>

    {/* POLICY */}
    <button
      onClick={() => setActiveTab("policy")}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        ${
          activeTab === "policy"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }`}
    >
      <MdMenuBook size={16} />
      Policy Configuration
    </button>

  </div>
</div>

      {/* TAB CONTENT */}
      {activeTab === "requests" && (
        <LeaveRequestTable
          requests={requests}
          onApprove={approve}
          onReject={reject}
          onBulkApprove={bulkApprove}
          onBulkReject={bulkReject}
          mode="action"
          onRowClick={(leave) => setSelectedLeave(leave)}
        />
      )}

        {activeTab === "history" && (
        <LeaveRequestTable
          requests={requests}
          mode="history"
          onRowClick={(leave) => setSelectedLeave(leave)}
        />
      )}

      {activeTab === "calendar" && (
        <LeaveCalendar
          requests={requests}
          isAdmin={true}
          officeHolidays={holidays}
          onDateClick={handleDateClick}
        />
      )}

      {activeTab === "policy" && (
        <LeavePolicy
          policy={policy}
          isAdmin={true}
          onSave={handleSavePolicy}
        />
      )}

      <AddHolidayDrawer
        open={isDrawerOpen}
        date={selectedDate}
        holiday={selectedHoliday}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleAddOrUpdateHoliday}
        onDelete={handleDeleteHoliday}
      />

      <MobileLeaveTabs
        active={activeTab}
        onChange={(tab) => setActiveTab(tab)}
        tabs={[
          { key: "requests", icon: MdAssignment },
          { key: "history", icon: MdHistory },
          { key: "calendar", icon: MdCalendarMonth },
          { key: "policy", icon: MdMenuBook },
        ]}
      />
      <LeaveDrawer
  leave={selectedLeave}
  onClose={() => setSelectedLeave(null)}
  mode="view"
/>
    </div>
  );
}
