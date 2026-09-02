import React, { useEffect, useState } from "react";
import { getSummary, getMonthlyList, markSlipPaid } from "@/services/payrollService";
import { useAuth } from "@/auth/useAuth";
import { toast } from "react-toastify";
import Pagination from "@/components/ui/Pagination";
import { PageHeader, StatsGrid } from "@/components/common";
import {
  MdPendingActions,
  MdCheckCircle,
  MdFilterList,
  MdVisibility,
  MdDownload,
  MdPayment,
  MdGroup,
  MdAccountBalanceWallet,
} from "react-icons/md";
import { downloadSlipPdf } from "@/services/payrollService";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import StatusBadge from "@/components/ui/StatusBadge";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import SalarySlipModal from "@/components/salary/SalarySlipModal";

interface PayrollSummary {
  paid: number;
  pending: number;
  totalStaff: number;
  processedCount: number;
}

export default function PayrollDashboard() {
  const { auth } = useAuth();
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [monthlySlips, setMonthlySlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of records per page

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [selectedSlips, setSelectedSlips] = useState<Set<string>>(new Set());

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, listRes] = await Promise.all([
        getSummary(auth.slug),
        getMonthlyList(auth.slug, { month, year })
      ]);
      setSummary(summaryRes.data?.data);
      setMonthlySlips(listRes.data?.data || []);
      setCurrentPage(1); // Reset to first page on data load
    } catch (error) {
      toast.error("Failed to load payroll dashboard data.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.slug) {
      fetchDashboardData();
    }
  }, [auth.slug, month, year]);

  const handleMarkPaid = async (slipId: string) => {
    const transactionId = window.prompt("Enter Transaction/UTR Number:");
    if (!transactionId) return;

    try {
      await markSlipPaid(auth.slug, slipId, { transactionId, paymentMode: "NEFT" });
      toast.success("Payroll marked as PAID!");
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to mark as paid");
    }
  };

  const handleBulkMarkPaid = async () => {
    if (selectedSlips.size === 0) return;
    const transactionId = window.prompt("Enter Transaction/UTR Number for Bulk Payment:");
    if (!transactionId) return;

    setLoading(true);
    try {
      const promises = Array.from(selectedSlips).map(id =>
        markSlipPaid(auth.slug, id, { transactionId, paymentMode: "NEFT" })
      );
      await Promise.all(promises);
      toast.success(`Successfully marked ${selectedSlips.size} slips as PAID!`);
      setSelectedSlips(new Set());
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process bulk payment");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedSlips.size === currentSlips.length) {
      setSelectedSlips(new Set());
    } else {
      setSelectedSlips(new Set(currentSlips.map(s => s._id)));
    }
  };

  const toggleSelectSlip = (id: string) => {
    const newSet = new Set(selectedSlips);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedSlips(newSet);
  };

    const handleDownload = async (slipId: string, empName: string) => {
      try {
        const blob = await downloadSlipPdf(auth.slug, slipId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Payslip_${empName.replace(/\s+/g, '_')}_${month}_${year}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || "Failed to download payslip.");
      }
    };

  const filteredSlips = monthlySlips.filter((slip) => {
    const matchSearch = (slip.employeeName || slip.employeeId || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || slip.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredSlips.length / pageSize) || 1;
  const currentSlips = filteredSlips.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const chartData = [
    { name: "Paid", value: monthlySlips.filter(s => s.paymentStatus === "PAID").length, color: "#10b981" },
    { name: "Pending", value: monthlySlips.filter(s => s.paymentStatus === "PENDING").length, color: "#f59e0b" },
    { name: "Failed", value: monthlySlips.filter(s => s.paymentStatus === "FAILED").length, color: "#ef4444" },
  ].filter(d => d.value > 0);

  if (loading) return <div>Loading Payroll Dashboard...</div>;

  return (
    <div className="p-4 sm:p-6 bg-base-50 min-h-screen flex flex-col gap-6">

      {/* Header Section */}
      <PageHeader
        title="Payroll Dashboard"
        breadcrumbs={[
          { label: "Dashboard" },
          { label: "Payroll", active: true },
        ]}
      />

      {/* Top Controls: Month/Year & Bulk Actions */}
      <div className="flex flex-col md:flex-row justify-between gap-3 items-start md:items-center bg-primary p-2.5 rounded-2xl shadow-sm border border-base-300">
        <div className="flex items-center gap-2">
          <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-40 select-sm md:select-md">
            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </Select>
          <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-32 select-sm md:select-md">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>

        {selectedSlips.size > 0 && (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="text-sm font-medium text-base-content/70 bg-base-200 px-3 py-1 rounded-full">
              {selectedSlips.size} selected
            </span>
            <button className="btn btn-success btn-sm text-success-content" onClick={handleBulkMarkPaid}>
              <MdPayment size={18} /> Mark Paid
            </button>
          </div>
        )}
      </div>

      {/* Bento Grid: Stats, Chart, and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Stats Box (Spans 2 columns) */}
        <div className="lg:col-span-2">
          <StatsGrid
            columns={{ default: 1, sm: 3, md: 3, lg: 3 }}
            className="mb-0 h-full"
            stats={[
              {
                label: "Total Staff",
                value: summary?.totalStaff || 0,
                icon: <MdGroup size={20} />,
                color: "text-info",
                description: "Eligible for payroll",
              },
              {
                label: "Pending Payout",
                value: `₹${(summary?.pending || 0).toLocaleString()}`,
                icon: <MdPendingActions size={20} />,
                color: "text-warning",
                description: "Needs disbursement",
              },
              {
                label: "Total Paid",
                value: `₹${(summary?.paid || 0).toLocaleString()}`,
                icon: <MdAccountBalanceWallet size={20} />,
                color: "text-success",
                description: "Successfully processed",
              },
            ]}
          />
        </div>

        {/* 2. Chart Box (Spans 1 col, 2 rows) */}
        <div className="lg:col-span-1 lg:row-span-2 self-start  bg-base-100 rounded-2xl border border-primary shadow-sm p-6 w-full flex flex-col min-h-[320px]">
          <h3 className="text-sm font-bold text-base-content/80 mb-4 uppercase tracking-wider">
            Payout Distribution
          </h3>
          {chartData.length > 0 ? (
            <div className="flex-1 w-full h-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={5}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }} />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-base-content/50 text-center m-auto">No data for this month</p>
          )}
        </div>

        {/* 3. Filters Box (Spans 2 columns) */}
        <div className="lg:col-span-2  md:flex-row   bg-primary/50 rounded-2xl border p-2 border-base-300 shadow-sm w-full ">
          <div className="flex  w-full gap-2">
            <div className="relative w-full max-w-xs">
              <Input placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-base-200 border-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40 bg-base-200 border-none focus:ring-2 focus:ring-primary/50">
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </Select>
          </div>
          {/* <button className="btn btn-outline btn-sm md:btn-md border-base-300 text-base-content/70 hover:bg-base-200 hover:text-base-content">
            <MdFilterList size={18} className="mr-2" /> Advanced Filters
          </button> */}
        </div>

      </div>

      {/* Monthly Slips Table */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-primary/40 overflow-x-auto">
        <table className="table table-zebra table-sm md:table-md w-full  border-primary/40">
          <thead className="bg-primary text-primary-content text-sm ">
            <tr>
              <th className="p-4 w-12">
                <label>
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-sm bg-white/60 rounded-md" 
                    checked={selectedSlips.size > 0 && selectedSlips.size === currentSlips.length}
                    onChange={toggleSelectAll} 
                  />
                </label>
              </th>
              <th className="p-4">Employee</th>
              <th className="p-4">Gross Salary</th>
              <th className="p-4">Net Salary</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentSlips.map((slip) => (
              <tr key={slip._id} className="hover:bg-base-200/50 transition-colors">
                <td className="p-4">
                  <label>
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-sm checkbox-primary rounded-md" 
                      checked={selectedSlips.has(slip._id)}
                      onChange={() => toggleSelectSlip(slip._id)}
                    />
                  </label>
                </td>
                <td className="p-4 font-medium">{slip.employeeName || slip.employeeId}</td>
                <td className="p-4 text-base-content">₹{slip.grossSalary.toLocaleString()}</td>
                <td className="p-4 font-bold text-primary">₹{slip.netSalary.toLocaleString()}</td>
                <td className="p-4">
                  <StatusBadge status={slip.paymentStatus.toLowerCase()} />
                </td>
                <td className="p-4 flex gap-2 justify-center">
                  <button className="btn btn-sm btn-circle btn-ghost text-primary" title="View Payslip" onClick={() => setSelectedSlip(slip)}>
                    <MdVisibility size={18} />
                  </button>
                  <button className="btn btn-sm btn-circle btn-ghost text-base-content" title="Download PDF" onClick={() => handleDownload(slip._id, slip.employeeName || 'Employee')}>
                    <MdDownload size={18} />
                  </button>
                  {slip.paymentStatus === "PENDING" ? (
                    <button className="btn btn-sm btn-circle btn-ghost text-success" title="Mark as Paid" onClick={() => handleMarkPaid(slip._id)}>
                      <MdPayment size={18} />
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-circle btn-ghost text-success" title="Already Paid" disabled>
                      <MdCheckCircle size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {currentSlips.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center text-base-content/50 space-y-3">
                    <MdFilterList size={48} className="opacity-20" />
                    <p className="text-lg font-medium">No payroll records found</p>
                    <p className="text-sm">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="p-4 flex justify-between items-center border-t border-base-300 bg-base-50">
            <span className="text-sm text-base-content/60 hidden sm:block">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredSlips.length)} of {filteredSlips.length} entries
            </span>
            <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {selectedSlip && (
        <SalarySlipModal slip={selectedSlip} onClose={() => setSelectedSlip(null)} />
      )}
    </div>
  );
}