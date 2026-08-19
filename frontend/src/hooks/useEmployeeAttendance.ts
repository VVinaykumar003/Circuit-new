import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getEmployeeDashboard,
  checkIn as apiCheckIn,
  checkOut as apiCheckOut,
  startBreak as apiStartBreak,
  endBreak as apiEndBreak,
} from "@/services/attendanceService";
import type { EmployeeDashboardData, TodayAttendance } from "@/type/index";
import { useAuth } from "@/auth/useAuth";

export const useEmployeeAttendance = () => {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const slug = useAuth().auth?.slug || "";


  const fetchData = useCallback(async (showToast = false) => {
    if (!showToast) setIsLoading(true);
    setError(null);
    try {
       const response = await getEmployeeDashboard(slug);
       setData(response.data.data); // Correctly access the nested data object
      if (showToast) toast.success("Data refreshed!");
    } catch (err) {
      console.error(err);
      setError("Unable to load attendance data. Please try again.");
      if (showToast) toast.error("Failed to refresh data.");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (
    actionFn: (slug: string, params?: any) => Promise<TodayAttendance>,
    params?: any,
    successMessage?: string
  ) => {
    setIsActionLoading(true);
    try {
      const response = await actionFn(slug, params);
      setData((prevData) =>
        prevData
          ? {
              ...prevData,
              today: response.data.data, // Access the nested data from the action response
              // You might want to update summary data here as well
            }
          : null
      );
      if (successMessage) toast.success(successMessage);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "An error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCheckIn = () => {
    // In a real app, you'd get this from the browser's Geolocation API
    const location = { lat: 19.076, lng: 72.877 };
    handleAction(apiCheckIn as any, location, "Checked in successfully!");
  };

  const handleCheckOut = () => handleAction(apiCheckOut as any, undefined, "Checked out successfully!");
  const handleStartBreak = (type: string) => handleAction(apiStartBreak as any, { breakType: type }, `${type} break started.`);
  const handleEndBreak = () => handleAction(apiEndBreak as any, undefined, "Break ended.");

  return {
    data,
    isLoading,
    error,
    isActionLoading,
    fetchData: () => fetchData(true),
    handleCheckIn,
    handleCheckOut,
    handleStartBreak,
    handleEndBreak,
  };
};