import  { useAdminAttendance } from '@/hooks/useAdminAttendance';
import AdminDashboardSkeleton from '@/components/shared/skeletons/AdminDashboardSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import AdminKpiCards from '@/components/sales/AdminKpiCards';
import ApprovalTable from '@/components/sales/ApprovalTable';

const AdminApproval = () => {
  const {
    data,
    isLoading,
    error,
    actionLoading,
    fetchData,
    handleApprove,
    handleReject,
  } = useAdminAttendance();

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorState
        message={error || "Could not load admin data."}
        onRetry={fetchData}
      />
    );
  }
//  console.log(`Attendance : ${JSON.stringify(data)}`);
  const { kpis, approvals } = data;
   
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <AdminKpiCards kpis={kpis} />

      {/* Add Filters and Search component here in the future */}
      
      <ApprovalTable 
        records={approvals}
        onApprove={handleApprove}
        onReject={handleReject}
        actionLoading={actionLoading}
      />
    </div>
  );
};

export default AdminApproval;