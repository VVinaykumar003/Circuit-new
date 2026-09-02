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
import { getAttendance } from "@/services/attendanceService";

import AttendanceGrid from "./AttendanceGrid";
import type { Status } from "./FilertByStatus";

type AttendanceTab = "records" | "summary" | "mark";

export interface AttendanceRecordItem {
  _id?: string;
  employee?: string | {
    _id?: string;
    name?: string;
    employeeId?: string;
  };
  status?: string;
  checkIn?: string;
  checkOut?: string;
  mode?: string;
}

export interface AttendanceDocItem {
  _id?: string;
  attendanceDocId?: string;
  date: string;
  status?: string;
  mode?: string;
  checkIn?: string;
  checkOut?: string;
  employee?: string | {
    _id?: string;
    name?: string;
    employeeId?: string;
  };
  records?: AttendanceRecordItem[];
}

const AdminAttendance = () => {
  const { auth } = useAuth();
  const user = auth?.user;

  const slug = auth?.slug;
  const role: UserRole = user?.role || "admin";

  const [activeTab, setActiveTab] = useState<AttendanceTab>("records");
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceDocItem[]>([]);

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
  }>({});

  const [records, setRecords] = useState<
    (AttendanceRecord & {
      attendanceDocId: string;
      employeeId: string;
      mode?: string;
      rawDate: string;
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

    // 🔹 Records API
    getAttendance(slug, {
      ...filters,
      startDate: filters.fromDate,
      endDate: filters.toDate,
      search: filters.name,
    })
      .then((res) => {
        // console.log("API RESPONSE", res.data);
        const responseData = res.data?.data || res.data || [];

        const arr: AttendanceDocItem[] = Array.isArray(responseData)
          ? responseData
          : [];

        const formattedRecords: (AttendanceRecord & {
          attendanceDocId: string;
          employeeId: string;
          mode?: string;
          rawDate: string;
        })[] = [];

        arr.forEach((doc: AttendanceDocItem) => {
          const formattedDate = new Date(doc.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          if (doc.records && Array.isArray(doc.records)) {
            // Nested structure (legacy)
            doc.records.forEach((record: AttendanceRecordItem) => {
              const recordEmpObj =
                typeof record.employee === "object" && record.employee !== null
                  ? record.employee
                  : null;
              const recordEmpStr =
                typeof record.employee === "string" ? record.employee : "";
              const employeeId = recordEmpObj?._id || recordEmpStr || "";
              const employeeName = recordEmpObj?.name || recordEmpStr || "Unknown";

              const checkInTime = record.checkIn
                ? new Date(record.checkIn).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              const rawStatus = (record.status || "").toUpperCase();
              const mappedStatus: AttendanceStatus =
                rawStatus === "PRESENT" || rawStatus === "HALF_DAY"
                  ? "approved"
                  : rawStatus === "ABSENT" || rawStatus === "REJECTED"
                    ? "absent"
                    : "pending";

              formattedRecords.push({
                id: record._id || `${doc._id}_${employeeId}`,
                attendanceDocId: doc._id || "",
                employeeId,
                employee: employeeName,
                date: formattedDate,
                rawDate: new Date(doc.date).toISOString(),
                checkIn: checkInTime,
                status: mappedStatus,
                mode: record.mode || "office",
              });
            });
          } else {
            // Flat record structure (current backend aggregation)
            const docEmpObj =
              typeof doc.employee === "object" && doc.employee !== null
                ? doc.employee
                : null;
            const docEmpStr =
              typeof doc.employee === "string" ? doc.employee : "";
            const employeeId = docEmpObj?._id || docEmpStr || doc._id || "";
            const employeeName = docEmpObj?.name || docEmpStr || "Unknown";

            const checkInTime = doc.checkIn
              ? new Date(doc.checkIn).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            const rawStatus = (doc.status || "").toUpperCase();
            const mappedStatus: AttendanceStatus =
              rawStatus === "PRESENT" || rawStatus === "HALF_DAY"
                ? "approved"
                : rawStatus === "ABSENT" || rawStatus === "REJECTED"
                  ? "absent"
                  : "pending";

            formattedRecords.push({
              id: doc._id || doc.attendanceDocId || `${doc.date}_${employeeId}`,
              attendanceDocId: doc.attendanceDocId || doc._id || "",
              employeeId,
              employee: employeeName,
              date: formattedDate,
              rawDate: doc.date
                ? new Date(doc.date).toISOString()
                : new Date().toISOString(),
              checkIn: checkInTime,
              status: mappedStatus,
              mode: doc.mode || "office",
            });
          }
        });

        setRecords(formattedRecords);
      })
      .finally(() => setLoading(false));

    // 🔹 Summary API
    const { fromDate, toDate } = getMonthDateRange(month, year);

    getAttendance(slug, {
      fromDate,
      toDate,
      startDate: fromDate,
      endDate: toDate,
    }).then((res) => {
      setAttendanceData(res.data?.data || res.data || []);
    });
  }, [slug, filters, refetchIndex, month, year]);

  const employees = useMemo(() => {
    const map = new Map();

    attendanceData.forEach((day: AttendanceDocItem) => {
      if (day.records && Array.isArray(day.records)) {
        day.records.forEach((r: AttendanceRecordItem) => {
          const empObj =
            typeof r.employee === "object" && r.employee !== null
              ? r.employee
              : null;
          const empId =
            empObj?._id ||
            (typeof r.employee === "string" ? r.employee : undefined);
          if (!empId) return;
          map.set(empId, {
            id: empId,
            name: empObj?.name || "Unknown",
            code: empObj?.employeeId || "EMP",
          });
        });
      } else {
        const empObj =
          typeof day.employee === "object" && day.employee !== null
            ? day.employee
            : null;
        const empId =
          empObj?._id ||
          (typeof day.employee === "string" ? day.employee : undefined);
        if (empId) {
          map.set(empId, {
            id: empId,
            name: empObj?.name || "Unknown",
            code: empObj?.employeeId || "EMP",
          });
        }
      }
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

    attendanceData.forEach((day: AttendanceDocItem) => {
      if (day.records && Array.isArray(day.records)) {
        day.records.forEach((r: AttendanceRecordItem) => {
          const st = (r.status || "").toUpperCase();
          if (st === "PRESENT" || st === "HALF_DAY") present++;
          else if (st === "ABSENT" || st === "REJECTED") absent++;
          else pending++;
        });
      } else {
        const st = (day.status || "").toUpperCase();
        if (st === "PRESENT" || st === "HALF_DAY") present++;
        else if (st === "ABSENT" || st === "REJECTED") absent++;
        else pending++;
      }
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

  const todayRecords = records.filter((record) => {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return record.date === today;
  });
  // console.log("Records for today:", todayRecords);
  // console.log("TODAY:", formatDate(new Date()));
  // console.log(
  //   "RECORD DATES:",
  //   filteredRecords.map((r) => r.date),
  // );

  if (loading) {
    return <div className="p-6 text-center"> 
     <EmptyState
        title='Loading...'
        
        />   </div>;
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center h-screen bg-base-100">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg font-medium text-base-content/70">
        <EmptyState
        title='Loading...'
        
        />   
          </p>
        </div>
      }
    >
     
      <>
        {/* TABS */}
        <div className="mb-5 mt-4">
          <div className="bg-base-200 p-0.5 rounded-lg hidden md:inline-flex gap-1">
            {/* MARK */}
            <button
              onClick={() => setActiveTab("mark")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-all duration-200
        ${
          activeTab === "mark"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }`}
            >
              <Clock size={14} />
              Mark Attendance
            </button>

            {/* RECORDS */}
            <button
              onClick={() => setActiveTab("records")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-all duration-200
        ${
          activeTab === "records"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }`}
            >
              <NotepadText size={14} />
              Records
            </button>

            {/* SUMMARY */}
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-all duration-200
        ${
          activeTab === "summary"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:bg-base-100"
        }`}
            >
              <Clock size={14} />
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

            {/* DESKTOP FILTER BAR */}
            {/* <div className="hidden md:flex flex-col gap-4 bg-base-100 border border-base-200 shadow-sm rounded-xl p-5">
              <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wider">
                Filter Records
              </h3>

              <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-end w-full">
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
                  <label className="text-xs text-base-content/60 block mb-1.5">
                    Status
                  </label>
                  <StatusPills
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                </div>
              </div>
            </div> */}
            <div className="hidden md:flex flex-col gap-2  border border-primary/20 shadow-sm rounded-xl p-2.5 bg-primary/10">
              <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
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
            <div className="flex flex-wrap gap-2 items-end bg-primary/70 border border-base-300 p-1.5 rounded-md text-base-content">
              {/* Month */}
              <select
                className="select select-sm select-bordered border-2 border-base-300"
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
                className="select select-sm select-bordered border-2 border-base-300"
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
                className="input input-sm input-bordered border-2 border-base-300 flex-1"
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
          <div className="mt-3">
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
