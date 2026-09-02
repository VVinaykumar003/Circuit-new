import React, { useState, useEffect } from "react";
// const EmptyState = React.lazy(() => import("../ui/EmptyState"));
const AttendanceFilters = React.lazy(() => import("./AttendanceFilter"));
const StatusPills = React.lazy(() => import("./FilertByStatus"));
const AttendanceTable = React.lazy(
  () => import("../attendance/AttendanceTable"),
);
const MarkAttendanceCard = React.lazy(
  () => import("../attendance/MarkAttendanceCard"),
);
// const CenteredContainer = React.lazy(
//   () => import("@/components/ui/CenteredContainer"),
// );
const AttendanceTabs = React.lazy(() => import("../attendance/AttendanceTab"));
import useAttendanceFilters from "../attendance/UseAttendanceFilter";
import type {
  AttendanceRecord,
  AttendanceStatus,
  UserRole,
} from "../../type/attendance";
import { useAuth } from "@/auth/useAuth";
import { getMyAttendance } from "@/services/attendanceService";
import { useNotificationSocket } from "@/hooks/notifiaction";
import type { Status } from "./FilertByStatus";

type AttendanceTab = "records" | "mark";

interface MyAttendanceItem {
  attendanceId?: string;
  _id?: string;
  date: string;
  status?: string;
  mode?: string;
  checkIn?: string;
  checkOut?: string;
  employee?: string | { _id?: string; name?: string };
  record?: {
    _id?: string;
    status?: string;
    mode?: string;
    checkIn?: string;
    checkOut?: string;
    employee?: string | { _id?: string; name?: string };
  };
}

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
  }>({});

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

  useNotificationSocket(user?.userId || user?._id, refetch);

  useEffect(() => {
    if (!slug) return;

    const fetchAttendance = (isSilent = false) => {
      if (!isSilent) setLoading(true);
      getMyAttendance(slug, {
        ...filters,
        startDate: filters.fromDate,
        endDate: filters.toDate,
      })
        .then((res) => {
          const responseData = res.data?.data || res.data || [];
          const arr: MyAttendanceItem[] = Array.isArray(responseData)
            ? responseData
            : [];

          const formattedRecords: (AttendanceRecord & {
            attendanceDocId: string;
            employeeId: string;
            mode?: string;
            rawDate: string;
          })[] = [];
          arr.forEach((doc: MyAttendanceItem) => {
            const record = doc.record || doc;
            if (!record) return;

            const formattedDate = new Date(doc.date).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              },
            );

            const checkInTime = record.checkIn
              ? new Date(record.checkIn).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : new Date(doc.date).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

            let mappedStatus: AttendanceStatus = "pending";
            const backendStatus = (record.status || "").toUpperCase();
            if (
              backendStatus === "PRESENT" ||
              backendStatus === "HALF_DAY"
            ) {
              mappedStatus = "approved";
            } else if (
              backendStatus === "REJECTED" ||
              backendStatus === "ABSENT"
            ) {
              mappedStatus = "rejected";
            } // PENDING is the default

            const employeeObj =
              typeof record.employee === "object" && record.employee !== null
                ? record.employee
                : null;
            const employeeStr =
              typeof record.employee === "string" ? record.employee : undefined;

            const empId =
              employeeObj?._id || employeeStr || user?.userId || user?._id || "";
            const empName = employeeObj?.name || user?.name || "Unknown";

            formattedRecords.push({
              id: record._id || doc.attendanceId || "",
              attendanceDocId: doc.attendanceId || doc._id || "",
              employeeId: empId,
              employee: empName,
              date: formattedDate,

              // filtering ke liye
              rawDate: doc.date,
              checkIn: checkInTime,
              status: mappedStatus,
              mode: record.mode || "office",
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

  const filteredRecords = useAttendanceFilters(records, filters, statusFilter);

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
        <div className="min-h-[60vh]  ">
          <MarkAttendanceCard />
        </div>
      )}

      {activeTab === "records" &&
        (
          <>
            {/* FILTER BAR */}
            <div className="flex flex-col gap-3 bg-primary/10 border border-primary/50 shadow-sm rounded-xl p-4">
              <h3 className="text-xs font-semibold text-base-content/80 uppercase tracking-wider">
                Filter Records
              </h3>

              <div className="flex flex-col xl:flex-row gap-5 items-start xl:items-end w-full">
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
