import React, { useState, useMemo, useEffect } from "react";
const EmptyState = React.lazy(() => import("../ui/EmptyState"));
const AttendanceFilters = React.lazy(() => import("./AttendanceFilter"));
const StatusPills = React.lazy(() => import("./FilertByStatus"));
const AttendanceTable = React.lazy(
  () => import("../attendance/AttendanceTable"),
);
const MarkAttendanceCard = React.lazy(
  () => import("../attendance/MarkAttendanceCard"),
);
const CenteredContainer = React.lazy(
  () => import("@/components/ui/CenteredContainer"),
);
const AttendanceTabs = React.lazy(() => import("../attendance/AttendanceTab"));
import useAttendanceFilters from "../attendance/UseAttendanceFilter";
import type {
  AttendanceRecord,
  AttendanceStatus,
  UserRole,
} from "../../type/attendance";
import { useAuth } from "@/auth/AuthContext";
import { getMyAttendance } from "@/services/attendanceService";
import { useNotificationSocket } from "@/hooks/notifiaction";
import { usePagination } from "@/hooks/usePagination";

type AttendanceTab = "records" | "mark";
type Status = "all" | "approved" | "pending" | "rejected";

const EmployeeAttendance = () => {
  const { auth } = useAuth();
  const user = auth?.user;
  const slug = auth?.slug;
  const role: UserRole = "employee"; // change to "employee"

  const [activeTab, setActiveTab] = useState<AttendanceTab>("mark");
  const [statusFilter, setStatusFilter] = useState<Status>("all");

  const [filters, setFilters] = useState<{
    name?: string;
    fromDate?: string;
    toDate?: string;
  }>({fromDate: new Date().toISOString().split("T")[0],
  toDate: new Date().toISOString().split("T")[0],
});

  const [records, setRecords] = useState<
    (AttendanceRecord & {
      attendanceDocId: string;
      employeeId: string;
      mode?: string;
      rawDate: string;
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = () => setRefetchIndex((prev) => prev + 1);

  useNotificationSocket(user?._id || user?.userId, refetch);

  useEffect(() => {
    if (!slug) return;

    const fetchAttendance = (isSilent = false) => {
      if (!isSilent) setLoading(true);
      getMyAttendance(slug, filters)
        .then((res) => {
          const responseData = res.data?.data || res.data || [];
          const arr = Array.isArray(responseData) ? responseData : [];

          const formattedRecords: (AttendanceRecord & {
            attendanceDocId: string;
            employeeId: string;
            mode?: string;
            rawDate: string;
          })[] = [];
          arr.forEach((doc: any) => {
            if (!doc.record) return;

            const formattedDate = new Date(doc.date).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              },
            );

            const checkInTime = doc.record.checkIn
              ? new Date(doc.record.checkIn).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : new Date(doc.date).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

            let mappedStatus: AttendanceStatus = "pending";
            const backendStatus = (doc.record.status || "").toUpperCase();
            if (backendStatus === "PRESENT" || backendStatus === "HALF_DAY") {
              mappedStatus = "approved";
            } else if (
              backendStatus === "REJECTED" ||
              backendStatus === "ABSENT"
            ) {
              mappedStatus = "rejected";
            } // PENDING is the default

            formattedRecords.push({
              id: doc.record._id,
              attendanceDocId: doc.attendanceId,
              employeeId: doc.record.employee,
              employee: user?.name || "Unknown",
              date: formattedDate,

              // filtering ke liye
              rawDate: doc.date,
              checkIn: checkInTime,
              status: mappedStatus,
              mode: doc.record.mode || "office",
            });
          });

          setRecords(formattedRecords);
        })
        .catch((error) => {
          console.error("Failed to fetch my attendance records", error);
          setRecords([]);
        })
        .finally(() => {
          if (!isSilent) setLoading(false);
        });
    };

    fetchAttendance();
    // Auto-refresh every 30 seconds to show admin approvals
    const intervalId = setInterval(() => fetchAttendance(true), 30000);
    return () => clearInterval(intervalId);
  }, [slug, filters, user?.name, refetchIndex]);

  const monthlySummary = useMemo(() => {
    const present = records.filter((r) => r.status === "approved").length;
    const pending = records.filter((r) => r.status === "pending").length;
    const rejected = records.filter((r) => r.status === "rejected").length;

    return {
      totalDays: records.length,
      present,
      pending,
      rejected,
      wfh: Math.floor(records.length * 0.2),
      halfDay: Math.floor(records.length * 0.1),
      attendancePercentage:
        records.length > 0 ? Math.round((present / records.length) * 100) : 0,
    };
  }, [records]);

  const filteredRecords = useAttendanceFilters(records, filters, statusFilter);

  const { page, setPage, totalPages, paginatedData } = usePagination(
    filteredRecords,
    10,
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-lg font-medium text-base-content/70">
          Loading your attendance...
        </p>
      </div>
    );
  }

  return (
    <>
      <AttendanceTabs value={activeTab} onChange={setActiveTab} />

      {/* TAB CONTENT */}
      {activeTab === "mark" && (
        <div className="min-h-[60vh]  pt-8">
          <MarkAttendanceCard />
        </div>
      )}

      {activeTab === "records" &&
        (
          <>
            {/* FILTER BAR */}
            <div className="flex flex-col gap-4 bg-primary/10 border border-primary/50 shadow-sm rounded-xl p-5">
              <h3 className="text-sm font-semibold text-base-content/80 uppercase tracking-wider">
                Filter Records
              </h3>

              <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-end w-full">
                <div className="flex-1 w-full">
                  <AttendanceFilters
                    isAdmin={false}
                    name={filters.name}
                    fromDate={filters.fromDate}
                    toDate={filters.toDate}
                    onChange={setFilters}
                  />
                </div>

                <div className="w-full xl:w-auto flex-shrink-0">
                  <label className="text-xs text-base-content/60 block mb-1.5">
                    Status
                  </label>
                  <StatusPills
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <AttendanceTable
                records={filteredRecords}
                role={role}
                onUpdate={refetch}
              />
            </div>
          </>
        )}
    </>
  );
};

export default EmployeeAttendance;
