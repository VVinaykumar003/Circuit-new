import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAdminDashboard,
  approveAttendance as apiApprove,
  // We will reuse apiApprove for rejections
} from "@/services/sales/attendanceService";
import type { AdminDashboardData } from '@/type/index';
import { useAuth } from "@/auth/AuthContext";

// import {dummyAdminDashboardData} from '@/data/dummyData'

export const useAdminAttendance = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const slug = useAuth().auth?.slug || "";



  const fetchData = useCallback(async (showToast = false) => {
    if (!showToast) setIsLoading(true);
    setError(null);
    try {
      const response = await getAdminDashboard(slug);
      console.log(response.data.data);
      setData(response.data.data);
      if (showToast) toast.success("Admin data refreshed!");
    } catch (err) {
      console.error(err);
      setError("Unable to load admin attendance data.");
      if (showToast) toast.error("Failed to refresh admin data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (
    actionFn: () => Promise<void>,
    id: string,
    successMessage: string
  ) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await actionFn();
      toast.success(successMessage);
      // Refetch data to show the updated status
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleApprove = (attendanceDocId: string, employeeId: string) => {
    console.log(employeeId)
    const actionFn = () => apiApprove(slug, attendanceDocId, { employeeId, status: 'PRESENT' });
    handleAction(actionFn as any, attendanceDocId, "Attendance approved.");
  };

  const handleReject = (attendanceId: string, employeeId: string) => {
    // Assuming reject just updates the status to 'ABSENT' or similar
    const actionFn = () => apiApprove(slug, attendanceId, { employeeId, status: 'ABSENT' }); // Reusing the same API
    handleAction(actionFn as any, attendanceId, "Attendance rejected.");
  };

  return {
    data,
    isLoading,
    error,
    actionLoading,
    fetchData: () => fetchData(true),
    handleApprove,
    handleReject,
  };
};