import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import ApplyLeaveModal from "@/components/Leave/ApplyLeaveModal";
import LeaveCards from "@/components/Leave/LeaveCards";
import LeaveDrawer from "@/components/Leave/LeaveDrawer";
import LeaveStats from "@/components/Leave/LeaveStats";
import LeaveBalanceDashboard from "@/components/Leave/LeaveBalanceDashboard";
import type { LeaveRequest } from "@/type/leave";
import LeaveCalendar from "./LeaveCalendar";
import LeavePolicy from "./LeavePolicy";
import MobileLeaveTabs from "@/components/Leave/MobileLeaveTabs";
import { useNotifications } from "@/context/NotificationContext";
import {
  MdDashboard,
  MdAssignment,
  MdAccountBalanceWallet,
  MdCalendarMonth,
  MdMenuBook,
} from "react-icons/md";
import { applyLeave, getMyLeaves, deleteLeave, updateLeave } from "@/services/leaveService";
import { getHolidays } from "@/services/holidayService";
import { getLeavePolicy } from "@/services/leavePolicyService";
import { toast } from "react-toastify";
// import { getOrganizationSlug } from "@/utils/auth";
// import { getUser } from "@/utils/getUser";
import { useAuth } from "@/auth/AuthContext";
import { socket } from "@/socket";
import Pagination from "@/components/ui/Pagination"
import Swal from "sweetalert2";


export default function EmployeeLeaveDashboard() {
  const { auth } = useAuth();
   const user = auth.user;
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [policy, setPolicy] = useState<any>(null);
  const [holidays, setHolidays] = useState<{ _id?: string; date: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [selectedLeave, setSelectedLeave] =
    useState<LeaveRequest | null>(null);

    const { addNotification } = useNotifications();


  const [active, setActive] =
    useState<"overview" | "my-leaves" | "balance" | "calendar" | "policy">(
      "overview"
    );

  useEffect(() => {
    const fetchData = async () => {
      try {
        
       if (!auth.slug) {
         toast.error("User data not found. Please log in again.");
         return;
       }

      
       if (!user) {
         toast.error("User data not found. Please log in again.");
         return;
       }

        
  
        const [response, holidaysRes, policyRes] = await Promise.all([
          getMyLeaves(auth.slug),
          getHolidays(auth.slug),
          getLeavePolicy(auth.slug)
        ]);
        // if (response.status !== 200) {
        //   throw new Error("Failed to fetch leave requests");
        // }

        if (response.status === 304) return; // keep old data
        console.log(response.data)
        
        const fetchedLeaves: LeaveRequest[] = response.data.leaves.map((leave: any) => ({
          id: leave._id,
          employee: leave.name || user.name || "Employee",
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
        toast.error("Failed to load leave requests");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, auth.slug, user]);

  // Real-time socket listener to refresh dashboard
  useEffect(() => {
    if (auth?.user) {
      const onNotification = (data: any) => {
        if (data?.action?.toLowerCase().includes("leave")) {
          // console.log("🔄 Real-time leave update received. Refreshing dashboard...");
          setRefreshTrigger((prev) => prev + 1);
        }
      };

      socket.on("new_notification", onNotification);

      return () => {
        socket.off("new_notification", onNotification);
      };
    }
  }, [auth?.user]);

  const handleApplyLeave = async (leave: any) => {
    try {
      // 1. Get Organization ID and User context from Session Storage
     
      // const slug = getOrganizationSlug();
       if (!auth.slug) {
         toast.error("User data not found. Please log in again.");
         return;
       }

     

      const payload = { ...leave, name: auth.user?.name };

      // 2. Call the backend API via leaveService
      const response = await applyLeave(auth.slug, payload);
      const savedLeave = response.data.leave;

      // 3. Update local state with the new response from DB
      const newLeave: LeaveRequest = {
        id: savedLeave._id,
        employee: auth.user?.name || "Employee",
        type: savedLeave.leaveType,
        fromDate: savedLeave.startDate ? savedLeave.startDate.split("T")[0] : leave.fromDate,
        toDate: savedLeave.endDate ? savedLeave.endDate.split("T")[0] : leave.toDate,
        reason: savedLeave.reason,
        status: savedLeave.status,
      };

      setRequests((prev) => [newLeave, ...prev]);

      // 4. Trigger Success Notification & Close Modal
      toast.success(`Your ${leave.type} leave has been submitted successfully.`);
      addNotification({
        title: "Leave Applied",
        message: `Your ${leave.type} leave has been submitted successfully.`,
        type: "info",
      });

      // 🟢 Emit real-time notification to Admins
      if (socket) {
        socket.emit("notifyAdmins", {
          title: "New Leave Request",
          message: `${auth.user?.name} has requested a ${leave.type} leave.`,
          type: "leave",
        });
        console.log(`${auth.user?.name} has requested a ${leave.type} leave. Notification sent to admins.`);
      }

      setOpen(false);
    } catch (error: any) {
      console.error("Apply leave failed:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit leave request.";
      
      toast.error(errorMessage);
      addNotification({
        title: "Application Failed",
        message: errorMessage,
        type: "error",
      });
    }
  };

  const handleDeleteLeave = async (id: string) => {
   const confirmDelete = await Swal.fire({
  title: "Are you sure?",
  text: "You want to delete this leave request?",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#d33",
  cancelButtonColor: "#6b7280",
  confirmButtonText: "Yes, delete it",
  cancelButtonText: "Cancel",
});

if (!confirmDelete.isConfirmed) return;

    try {
      if (!user) return;
      
      await deleteLeave(auth.slug, id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Leave deleted successfully");
    } catch (error: any) {
      console.error("Delete leave failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete leave");
    }
  };

  const handleUpdateLeave = async (updatedLeave: any) => {
    try {
     
        if (!auth.slug) {
          toast.error("User data not found. Please log in again.");
          return;
        }

      
      const response = await updateLeave(auth.slug, updatedLeave.id, updatedLeave);
      const savedLeave = response.data.leave;
      
      setRequests((prev) =>
        prev.map((r) =>
          r.id === updatedLeave.id ? {
            ...r,
            type: savedLeave.leaveType,
            fromDate: savedLeave.startDate ? savedLeave.startDate.split("T")[0] : updatedLeave.fromDate,
            toDate: savedLeave.endDate ? savedLeave.endDate.split("T")[0] : updatedLeave.toDate,
            reason: savedLeave.reason,
          } : r
        )
      );
      toast.success("Leave updated successfully");
    } catch (error: any) {
      console.error("Update leave failed:", error);
      toast.error(error.response?.data?.message || "Failed to update leave");
    }
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE) || 1;
  const paginatedRequests = requests.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
   

  return (
    <div className="space-y-6 pb-20 md:pb-0">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
       

        <Button
          variant="primary"
          onClick={() => setOpen(true)}
        >
          Apply Leave
        </Button>
      </div>

      {/* ================= TABS ================= */}
   

<div className="hidden md:flex mb-5 mt-2">
  <div className="bg-base-200 p-1 rounded-lg inline-flex gap-1 flex-wrap">

    {/* OVERVIEW */}
    <button
      onClick={() => setActive("overview")}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
        transition-all duration-200
        ${
          active === "overview"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }
      `}
    >
      <MdDashboard size={16} />
      Overview
    </button>

    {/* MY LEAVES */}
    <button
      onClick={() => setActive("my-leaves")}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
        transition-all duration-200
        ${
          active === "my-leaves"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }
      `}
    >
      <MdAssignment size={16} />
      My Leaves
    </button>

    {/* BALANCE */}
    <button
      onClick={() => setActive("balance")}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
        transition-all duration-200
        ${
          active === "balance"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }
      `}
    >
      <MdAccountBalanceWallet size={16} />
      Leave Balance
    </button>

    {/* CALENDAR */}
    <button
      onClick={() => setActive("calendar")}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
        transition-all duration-200
        ${
          active === "calendar"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }
      `}
    >
      <MdCalendarMonth size={16} />
      Leave Calendar
    </button>

    {/* POLICY */}
    <button
      onClick={() => setActive("policy")}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
        transition-all duration-200
        ${
          active === "policy"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }
      `}
    >
      <MdMenuBook size={16} />
      Leave Policy
    </button>

  </div>
</div>

      {/* ================= TAB CONTENT ================= */}

      {active === "overview" && (
        <>
          <LeaveBalanceDashboard
            requests={requests}
            policy={policy}
          />

          <LeaveStats requests={requests} />
        </>
      )}

      {active === "my-leaves" && (
        <>
        <LeaveCards
          requests={paginatedRequests}
          onView={(leave) =>
            setSelectedLeave(leave)
          }
          onDelete={handleDeleteLeave}
        />

        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage} />
        </>
      )}

      {active === "balance" && (
        <LeaveBalanceDashboard
          requests={requests}
          policy={policy}
        />
      )}
      {active === "calendar" && (
        <LeaveCalendar
          requests={requests}
          officeHolidays={holidays}
          wfhDays={[
            "2026-03-27",
            "2026-04-03"
          ]}
        />
      )}
      {active === "policy" && (
        <LeavePolicy
          policy={policy}
          isAdmin={false}
        />
      )}



      {/* ================= DRAWER ================= */}

      <LeaveDrawer
        leave={selectedLeave}
        onClose={() => setSelectedLeave(null)}
        onUpdate={handleUpdateLeave}
      />

      {/* ================= APPLY MODAL ================= */}

      <ApplyLeaveModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleApplyLeave}
      />

<MobileLeaveTabs
  active={active}
  onChange={setActive}
/>
    </div>
  );
}