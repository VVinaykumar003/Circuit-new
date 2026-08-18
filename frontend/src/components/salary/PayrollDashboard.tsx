import { useState, useEffect } from 'react';
import Table  from "../ui/Table"
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { getAllPayroll } from '@/services/payrollService';
import { getAllEmployees } from '@/services/attendanceService';

const PayrollDashboard = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const isAdmin = auth?.user?.role === 'admin' || auth?.user?.role === 'owner';
    
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
      thisMonthTotal: 0,
      pendingAmount: 0,
      pendingCount: 0,
      activeStaff: 0
    });

    useEffect(() => {
      if (auth.slug) {
        setLoading(true);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        Promise.all([
          getAllPayroll(auth.slug, { month: currentMonth, year: currentYear }),
          getAllEmployees(auth.slug)
        ])
          .then(([payrollRes, employeesRes]) => {
            const fetchedPayrolls = payrollRes.data?.data?.payrolls || [];
            const fetchedEmployees = employeesRes.data?.data || [];

            setPayrolls(fetchedPayrolls);

            let totalPayroll = 0;
            let pendingAmt = 0;
            let pendingCnt = 0;

            fetchedPayrolls.forEach((p: any) => {
              const amount = p.netSalary || 0;
              totalPayroll += amount;
              if (p.status !== 'PAID') {
                pendingAmt += amount;
                pendingCnt += 1;
              }
            });

            setStats({
              thisMonthTotal: totalPayroll,
              pendingAmount: pendingAmt,
              pendingCount: pendingCnt,
              activeStaff: fetchedEmployees.length
            });
          })
          .catch(err => console.error("Failed to fetch dashboard data", err))
          .finally(() => setLoading(false));
      }
    }, [auth.slug]);

    const getProgressValue = () => {
      if (payrolls.length === 0) return 0;
      const paidCount = payrolls.filter(p => p.status === 'PAID').length;
      return Math.round((paidCount / payrolls.length) * 100);
    };

    if (loading) {
      return <div className="flex flex-col justify-center items-center h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-lg font-medium text-base-content/70">Loading...</p>
      </div>;
    }

  return (
    <div>
       <div className="stats stats-vertical sm:stats-horizontal bg-base-200 border border-base-content/10 shadow-md w-full mb-6">
  {/* This Month Payroll */}
  <div className="stat">
    <div className="stat-figure text-primary/90">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8">
        <path stroke="currentColor" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <div className="stat-title">This Month Payroll</div>
    <div className="stat-value text-primary">₹ {stats.thisMonthTotal.toLocaleString()}</div>
    <div className="stat-desc">Total net salary generated</div>
  </div>

  {/* Pending Disbursement */}
  <div className="stat">
    <div className="stat-figure text-warning">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8">
        <path stroke="currentColor" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <div className="stat-title">Pending Disbursement</div>
    <div className="stat-value text-primary">₹ {stats.pendingAmount.toLocaleString()}</div>
    <div className="stat-desc text-warning">{stats.pendingCount} payroll(s)</div>
  </div>

  {/* Active Staff */}
  <div className="stat">
    <div className="stat-figure text-success">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8">
        <path stroke="currentColor" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
    </div>
    <div className="stat-title">Active Staff</div>
    <div className="stat-value text-primary">{stats.activeStaff}</div>
    <div className="stat-desc">Currently employed</div>
  </div>
</div>


<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 bg-base-100 border border-base-content/10 rounded-xl mb-6 shadow-sm">
  {/* Title Section */}
  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 p-3 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-300 shadow-md">
    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Payroll Dashboard</h1>
      <p className="text-sm text-base-content/60">Manage employee payments & track disbursements</p>
    </div>
  </div>

  {/* Progress Chip */}
  <div className="flex items-center gap-3 p-3 bg-base-200 border border-base-content/10 shadow-md hover:shadow-lg transition-all duration-200 group">
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-base-content/80 group-hover:text-base-content transition-colors">Overall Progress</span>
      <div className="flex items-center gap-1.5">
        <progress 
          className="progress progress-primary w-20 h-1.5 shadow-inner" 
          value={getProgressValue()} 
          max="100"
        />
        <span className="text-xs font-mono text-primary font-semibold">
          {getProgressValue()}%
        </span>
      </div>
    </div>
    <div className="w-2 h-2 bg-success/50 rounded-full animate-pulse" />
  </div>
</div>

{/* Desktop Table */}
<div className="hidden md:block">
  <div className="overflow-x-auto">
    <Table headers={["Employee", "Month", "Salary", "Status", "Quick Action"]}>
      {payrolls.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-6 text-base-content/60">
            No payrolls generated for this month.
          </td>
        </tr>
      ) : (
        payrolls.slice(0, 5).map((r) => (
          <tr key={r._id}>
            <td className="text-base-content">{r.employee?.name || 'Unknown'}</td>
            <td className="text-base-content">{r.month}/{r.year}</td>
            <td className="text-base-content">₹ {r.netSalary?.toLocaleString() || 0}</td>
            <td><StatusBadge status={r.status?.toLowerCase() || 'pending'} /></td>
            {isAdmin && (
              <td>
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => navigate(`/payroll/history`)}
                >
                  Manage
                </Button>
              </td>
            )}
          </tr>
        ))
      )}
    </Table>
  </div>
</div>

{/* Mobile Card Layout */}
<div className="md:hidden space-y-4">
  {payrolls.length === 0 ? (
    <div className="text-center py-4 text-base-content/60">No payrolls generated for this month.</div>
  ) : (
    payrolls.slice(0, 5).map((r) => (
    <div
      key={r._id}
      className="bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{r.employee?.name || 'Unknown'}</h3>
        <StatusBadge status={r.status?.toLowerCase() || 'pending'} />
      </div>

      <div className="text-sm text-base-content/60 space-y-1">
        <p><span className="font-medium">Month:</span> {r.month}/{r.year}</p>
        <p><span className="font-medium">Salary:</span> ₹ {r.netSalary?.toLocaleString() || 0}</p>
      </div>

      {isAdmin && (
        <div className="mt-3">
          <Button
            size="sm"
            variant="primary"
            className="w-full"
            onClick={() => navigate(`/payroll/history`)}
          >
            Manage Payroll
          </Button>
        </div>
      )}
    </div>
    ))
  )}
</div>
      
    </div>
  )
}

export default PayrollDashboard
