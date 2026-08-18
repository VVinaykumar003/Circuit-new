
import { useEmployeeAttendance } from '../../hooks/useEmployeeAttendance';
import DashboardSkeleton from "@/components/shared/skeletons/DashboardSkeleton";
import ErrorState from "@/components/shared/ErrorState";
import TodayStatusCard from "@/components/sales/TodayStatusCard";
import CheckInActions from "@/components/sales/CheckInActions";
import TodaySummary from "@/components/sales/TodaySummary";
import LocationInfo from "@/components/sales/LocationInfo";
import AttendanceCalendar from "@/components/sales/AttendanceCalendar";
import EmployeeHeader from "@/components/sales/EmployeeHeader";


const EmployeeAttendance = () => {
  const {
    data,
    isLoading,
    error,
    isActionLoading,
    fetchData,
    handleCheckIn,
    handleCheckOut,
    handleStartBreak,
    handleEndBreak,
  } = useEmployeeAttendance();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorState
        message={error || "Could not load attendance data."}
        onRetry={fetchData}
      />
    );
  }

  const {
    employeeDetails,
    today,
    summary ={
      lateBy: 0,
      overtime: 0,
      totalBreak: 0,
      workingHours: 0,
      status: "Not Checked In",
    },
    monthlyRecords = [],
  } = data;
  // console.log(`Attendance : ${JSON.stringify(data)}`);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <EmployeeHeader employee={employeeDetails} todayStatus={today.status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 space-y-8">
          <TodayStatusCard todayData={today} />
          <TodaySummary summary={summary } />
          <AttendanceCalendar records={monthlyRecords} />
        </main>

        <aside className="space-y-8">
          <CheckInActions
            todayData={today}
            isLoading={isActionLoading}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onStartBreak={handleStartBreak}
            onEndBreak={handleEndBreak}
          />
          <LocationInfo todayData={today} />
        </aside>
      </div>
    </div>
  );
};

export default EmployeeAttendance;