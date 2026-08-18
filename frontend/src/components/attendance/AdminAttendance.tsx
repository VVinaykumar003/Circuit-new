import React, { useState, useMemo, Suspense, useEffect } from "react";
const AttendanceFilters = React.lazy(() => import("./AttendanceFilter"));
const EmptyState = React.lazy(() => import("../ui/EmptyState"));
const AttendanceSummaryCards = React.lazy(
  () => import("../attendance/AttendanceSummaryCards"),
);
// const AttendanceFilterDrawer = React.lazy(()=> import("../attendance/AttendanceFilterDrawer"))
import AttendanceFilterDrawer from "../attendance/AttendanceFilterDrawer";

const StatusPills = React.lazy(() => import("./FilertByStatus"));
//  import AttendanceMobileTopBar from "../attendance/AttendanceFilterDrawer"
import AttendanceTable from "../attendance/AttendanceTable";

import useAttendanceFilters from "../attendance/UseAttendanceFilter";
import type {
  AttendanceRecord,
  UserRole,
  AttendanceStatus,
} from "@/type/attendance";
import { Clock, NotepadText } from "lucide-react";
import MobileTabs from "../attendance/MobileTabs";
import AttendanceMobileTopBar from "./AttendanceMobileTopBar";
import { useAuth } from "@/auth/useAuth"; 
import { getAttendance } from "@/services/sales/attendanceService";

import AttendanceGrid from "./AttendanceGrid";

type AttendanceTab = "records" | "summary" | "mark";
type Status = "all" | "approved" | "pending" | "absent";

const AdminAttendance = () => {
  const getLocalISODate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  const { auth } = useAuth();
  const user = auth?.user;

  const slug = auth?.slug;
  const role: UserRole = user?.role || "admin";

  const [activeTab, setActiveTab] = useState<AttendanceTab>("mark");
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const todayISO = getLocalISODate();
  const todayDate = new Date();

  const [summaryFilters, setSummaryFilters] = useState({
    month: todayDate.getMonth(),
    year: todayDate.getFullYear(),
    name: "",
  });

  const { month, year } = summaryFilters;

  const [filters, setFilters] = useState<{
    name?: string;
    fromDate?: string;
    toDate?: string;
  }>({
    fromDate: todayISO,
    toDate: todayISO,
  });
  // console.log("Current filters state:", filters);
  // console.log(todayISO);
  // console.log(filters);
  const [records, setRecords] = useState<
    (AttendanceRecord & {
      attendanceDocId: string;
      employeeId: string;
      mode?: string;
    })[]
  >([]);
  // console.log("Fetched attendance records:", records);
  const [loading, setLoading] = useState(true);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = () => setRefetchIndex((prev) => prev + 1);

  // Listen for real-time notifications (e.g. attendanceMarked) and auto-refresh the table
  const getMonthDateRange = (month: number, year: number) => {
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(year, month + 1, 0);

    return {
      fromDate: fromDate.toISOString().split("T")[0],
      toDate: toDate.toISOString().split("T")[0],
    };
  };
  

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    // 🔹 Records API (unchanged)
    getAttendance(slug, filters)
      .then((res) => {
        // console.log("API RESPONSE", res.data);
        const responseData = res.data?.data || res.data || [];

        const arr = Array.isArray(responseData) ? responseData : [];

        const formattedRecords = [];

        arr.forEach((doc: any) => {
          const formattedDate = new Date(doc.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          (doc.records || []).forEach((record: any) => {
            if (!record.employee?._id) return;

            formattedRecords.push({
              id: record._id,
              attendanceDocId: doc._id,
              employeeId: record.employee._id,
              employee: record.employee.name || "Unknown",
              date: formattedDate,
              rawDate: new Date(doc.date).toISOString(),
              checkIn: record.checkIn
                ? new Date(record.checkIn).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              status:
                record.status === "PRESENT" || record.status === "HALF_DAY"
                  ? "approved"
                  : record.status === "ABSENT" || record.status === "REJECTED"
                    ? "absent"
                    : "pending",
              mode: record.mode || "office",
            });
          });
        });

        setRecords(formattedRecords);
      })
      .finally(() => setLoading(false));

    // 🔹 Summary API (debounced 🔥)
    const { fromDate, toDate } = getMonthDateRange(month, year);

    getAttendance(slug, {
      fromDate,
      toDate,
    }).then((res) => {
      setAttendanceData(res.data?.data || []);
    });
  }, [slug, filters, refetchIndex, month, year]);

  const employees = useMemo(() => {
    const map = new Map();

    attendanceData.forEach((day: any) => {
      day.records?.forEach((r: any) => {
        if (!r.employee?._id) return;

        map.set(r.employee._id, {
          id: r.employee._id,
          name: r.employee.name,
          code: r.employee.employeeId || "EMP",
        });
      });
    });

    return Array.from(map.values());
  }, [attendanceData]);

  const filteredEmployees = useMemo(() => {
    if (!summaryFilters.name) return employees;

    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(summaryFilters.name.toLowerCase()),
    );
  }, [employees, summaryFilters.name]);
 

  const monthlySummary = useMemo(() => {
    let present = 0,
      absent = 0,
      pending = 0;

    attendanceData.forEach((day: any) => {
      day.records?.forEach((r: any) => {
        if (r.status === "PRESENT") present++;
        else if (r.status === "ABSENT") absent++;
        else pending++;
      });
    });

    const total = present + absent + pending;

    return {
      totalDays: total,
      present,
      absent,
      pending,
      wfh: 0,
      halfDay: 0,
      attendancePercentage: total ? Math.round((present / total) * 100) : 0,
      rejected: 0,
    };
  }, [attendanceData]);

  const filteredRecords = useAttendanceFilters(records, filters, statusFilter);
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const todayRecords = records.filter((record) => {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return record.date === today;
  });
 

  if (loading) {
    return <div className="p-6 text-center">Loading attendance...</div>;
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center h-screen bg-base-100">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg font-medium text-base-content/70">
            Loading...
          </p>
        </div>
      }
    >
     
      <>
        {/* TABS */}
        <div className="mb-5 mt-4">
          <div className="bg-base-200 p-1 rounded-lg hidden md:inline-flex gap-1">
            {/* MARK */}
            <button
              onClick={() => setActiveTab("mark")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        ${
          activeTab === "mark"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }`}
            >
              <Clock size={16} />
              Mark Attendance
            </button>

            {/* RECORDS */}
            <button
              onClick={() => setActiveTab("records")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
              ${
                activeTab === "records"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/60 hover:bg-base-100"
              }`}
            >
              <NotepadText size={16} />
              Records
            </button>

            {/* SUMMARY */}
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        ${
          activeTab === "summary"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }`}
            >
              <Clock size={16} />
              Attendance Summary
            </button>
          </div>
        </div>
        {activeTab === "records" && (
          <>
            <AttendanceFilterDrawer
              open={showFilters}
              onClose={() => setShowFilters(false)}
              filters={filters}
              status={statusFilter}
              onFilterChange={setFilters}
              onStatusChange={setStatusFilter}
              isAdmin={role === "admin"}
            />

           
            <div className="hidden md:flex flex-col gap-3  border border-primary/20 shadow-sm rounded-xl p-3 bg-primary/10">
              <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">
                Filter Records
              </h3>

              <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-end w-full">
                <div className="flex-1 w-full">
                  <AttendanceFilters
                    isAdmin={role === "admin"}
                    name={filters.name}
                    fromDate={filters.fromDate}
                    toDate={filters.toDate}
                    onChange={setFilters}
                  />
                </div>

                <div className="w-full xl:w-auto flex-shrink-0">
                  <label className="text-xs text-base-content/60 font-medium block mb-1">
                    Status
                  </label>
                  <div className="scale-[0.95] origin-left">
                    <StatusPills
                      value={statusFilter}
                      onChange={setStatusFilter}
                    />
                  </div>
                </div>
              </div>
            </div>
            <AttendanceMobileTopBar
              isAdmin={role === "admin"}
              name={filters.name}
              fromDate={filters.fromDate}
              toDate={filters.toDate}
              onChange={setFilters}
              onOpenFilters={() => setShowFilters(true)}
            />

            <div className="mt-4">
              <AttendanceTable
                records={filteredRecords}
                role={role}
                onUpdate={refetch}
                showActions={false}
              />
            </div>
          </>
        )}

        {activeTab === "summary" && (
          <div className="space-y-4">
            {/* 🔽 SUMMARY CARDS */}
            <AttendanceSummaryCards summary={monthlySummary} />
            {/* 🔽 FILTER BAR */}
            <div className="flex flex-wrap gap-3 items-end bg-primary/70 border border-base-300 p-4 rounded-xl text-base-content">
              {/* Month */}
              <select
                className="select select-bordered border-2 border-base-300"
                value={summaryFilters.month}
                onChange={(e) =>
                  setSummaryFilters((prev) => ({
                    ...prev,
                    month: Number(e.target.value),
                  }))
                }
              >
                {[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ].map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Year */}
              <select
                className="select select-bordered border-2 border-base-300"
                value={summaryFilters.year}
                onChange={(e) =>
                  setSummaryFilters((prev) => ({
                    ...prev,
                    year: Number(e.target.value),
                  }))
                }
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* Employee Search */}
              <input
                type="text"
                placeholder="Search employee..."
                value={summaryFilters.name}
                onChange={(e) =>
                  setSummaryFilters((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="input input-bordered border-2 border-base-300 flex-1"
              />
            </div>

            {/* 🔽 GRID */}
            <AttendanceGrid
              employees={filteredEmployees}
              attendanceData={attendanceData}
              month={summaryFilters.month}
              year={summaryFilters.year}
            />
          </div>
        )}
        {activeTab === "mark" && (
          <div className="mt-4">
            <AttendanceTable
              records={todayRecords}
              role={role}
              onUpdate={refetch}
              showActions={true}
            />
          </div>
        )}
      </>

      <MobileTabs active={activeTab} onChange={setActiveTab} />
      {/* </div> */}
    </Suspense>
  );
};

export default AdminAttendance;
