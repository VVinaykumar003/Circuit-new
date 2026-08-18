import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyAttendance,
  getAttendance,
  getEmployeeAttendanceSummary,
  approveAttendance,
  getAdminDashboard,
} from "../services/sales/attendanceService";
import type { AttendanceFilters } from "../type/attendance";
import { useAuth } from "@/auth/AuthContext";

export function useMyAttendance(filters: Partial<AttendanceFilters>, page: number, pageSize = 10) {
  const { auth } = useAuth();
  const slug = auth?.slug || "";
  return useQuery({
    queryKey: ["attendance", "me", filters, page, pageSize],
    queryFn: () => getMyAttendance(slug, { ...filters, page, pageSize }),
    placeholderData: (prev) => prev, // keep previous page visible while next loads
    enabled: !!slug,
  });
}

export function useAllAttendance(filters: Partial<AttendanceFilters>, page: number, pageSize = 10) {
  const { auth } = useAuth();
  const slug = auth?.slug || "";
  return useQuery({
    queryKey: ["attendance", "all", filters, page, pageSize],
    queryFn: () => getAttendance(slug, { ...filters, page, pageSize }),
    placeholderData: (prev) => prev,
    enabled: !!slug,
  });
}

export function useMyStats(params: { employeeId: string, startDate?: string, endDate?: string }) {
  const { auth } = useAuth();
  const slug = auth?.slug || "";
  return useQuery({
    queryKey: ["attendance", "summary", "me", params],
    queryFn: () => getEmployeeAttendanceSummary(slug, params),
    enabled: !!slug && !!params.employeeId,
    select: (data) => data.data.data, // Select the nested data object
  });
}

export function useAdminDashboardStats() {
  const { auth } = useAuth();
  const slug = auth?.slug || "";
  return useQuery({
    queryKey: ["dashboard", "admin", slug],
    queryFn: () => getAdminDashboard(slug),
    enabled: !!slug,
    select: (data) => data.data, // Assuming the stats are in the `data` property of the response
  });
}

// There is no deleteAttendanceRecord in attendanceService.ts
// export function useDeleteAttendance() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: deleteAttendanceRecord, // This function does not exist
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
//   });
// }

export function useApproveAttendance() {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const slug = auth?.slug || "";
  return useMutation({
    mutationFn: ({ attendanceId, employeeId }: { attendanceId: string, employeeId: string }) =>
      approveAttendance(slug, attendanceId, { employeeId, status: 'PRESENT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useRejectAttendance() {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const slug = auth?.slug || "";
  return useMutation({
    mutationFn: ({ attendanceId, employeeId }: { attendanceId: string, employeeId: string }) =>
      approveAttendance(slug, attendanceId, { employeeId, status: 'ABSENT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  });
}
