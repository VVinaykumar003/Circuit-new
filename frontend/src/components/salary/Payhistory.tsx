import React, { useEffect, useState } from "react";
import { getMonthlyList, markSlipPaid, downloadSlipPdf } from "@/services/payrollService";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination"
import PageHeader from "../ui/PageHeader";

export default function Payhistory() {
  const { auth } = useAuth();
  const [slips, setSlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getMonthlyList(auth.slug, { month, year });
      setSlips(res.data?.data || []);
      setCurrentPage(1); // Reset to page 1 whenever we fetch new data
    } catch (error : any) {
      toast.error(`Failed to fetch payroll history: ${error?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.slug) fetchHistory();
  }, [auth.slug, month, year]);

  // const handleMarkPaid = async (slipId: string) => {
  //   const transactionId = window.prompt("Enter Transaction/UTR Number:");
  //   if (!transactionId) return;

  //   try {
  //     await markSlipPaid(auth.slug, slipId, { transactionId, paymentMode: "NEFT" });
  //     toast.success("Marked as PAID");
  //     fetchHistory();
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.message || "Failed to update status.");
  //   }
  // };

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
    } catch (error) {
      toast.error("Failed to download payslip.");
    }
  };

  const totalPages = Math.ceil(slips.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentSlips = slips.slice(startIndex, startIndex + pageSize);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // return (
  //   <div className="space-y-6 text-base-content">
      
  //      <div>
  //      <h1 className="text-base-content text-2xl font-medium">Payroll History</h1>
  //      <h3 className="text-md">Overview</h3>
  //      </div>
  //     <div className="flex gap-4 mb-4 items-center bg-base-100 p-4 rounded-xl shadow-sm border border-base-300">
  //       <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-48">
  //         {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
  //       </Select>
  //       <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-32">
  //         {years.map(y => <option key={y} value={y}>{y}</option>)}
  //       </Select>
  //       <Button variant="primary" onClick={fetchHistory} disabled={loading}>
  //         {loading ? "Loading..." : "Filter Results"}
  //       </Button>
  //     </div>

  //     <div className="bg-base-100 rounded-xl shadow-sm border border-primary/30 overflow-hidden">
  //       <table className="w-full text-left ">
  //         <thead className="bg-primary text-primary-content ">
  //           <tr >
  //             <th className="p-4">Employee</th>
  //             <th className="p-4">Net Salary</th>
  //             <th className="p-4">Status</th>
  //             {/* <th className="p-4">Actions</th> */}
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {currentSlips.map((slip) => (
  //             <tr key={slip._id} className="border-t border-base-300 hover:bg-base-50">
  //               <td className="p-4">{slip.employeeName || slip.employeeId}</td>
  //               <td className="p-4 font-semibold">₹{slip.netSalary}</td>
  //               <td className="p-4">
  //                 <span className={`px-2 py-1 rounded text-xs font-bold ${slip.paymentStatus === 'PAID' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>{slip.paymentStatus}</span>
  //               </td>
  //               {/* <td className="p-4 flex gap-2">
  //                 {slip.paymentStatus === "PENDING" && <Button variant="primary" size="sm" onClick={() => handleMarkPaid(slip._id)}>Mark Paid</Button>}
  //                  {slip.paymentStatus === "PAID" && <Button variant="primary" size="sm" className="btn-disabled" onClick={() => handleMarkPaid(slip._id)}>Mark Paid</Button>}  
  //                 <Button variant="outline" size="sm" className="border border-base-content" onClick={() => handleDownload(slip._id, slip.employeeName || 'Employee')}>Download</Button>
  //               </td> */}
  //             </tr>
  //           ))}
  //           {slips.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-base-content/60">No records found for this month.</td></tr>}
  //         </tbody>
  //       </table>

  //       {/* <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} /> */}

  //       {totalPages > 1 && (
  //         <div className="flex justify-between items-center p-4 bg-base-100 border-t border-base-300">
  //           <span className="text-sm text-base-content/70">
  //             Showing {startIndex + 1} to {Math.min(startIndex + pageSize, slips.length)} of {slips.length} entries
  //           </span>
  //           <div className="flex gap-2 items-center">
  //             <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
  //             <span className="px-3 text-sm font-medium">Page {currentPage} of {totalPages}</span>
  //             <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );


return (
  <div className="space-y-4 sm:space-y-6 text-base-content p-3 sm:p-0">
    
    {/* HEADER */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-base-content">
          Payroll History
        </h1>
        <h3 className="text-sm sm:text-base text-base-content/70">
          Overview
        </h3>
      </div>
    </div>

    {/* FILTERS */}
    <div
      className="
        flex
        flex-col
        sm:flex-row
        gap-3
        sm:gap-4
        sm:items-center
        bg-base-100
        p-4
        rounded-xl
        shadow-sm
        border
        border-base-300
      "
    >
      <Select
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
        className="w-full "
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.name}
          </option>
        ))}
      </Select>

      <Select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="w-full "
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Select>

      <Button
        variant="primary"
        onClick={fetchHistory}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? "Loading..." : "Filter Results"}
      </Button>
    </div>

    {/* TABLE CARD */}
    <div className="bg-base-100 rounded-xl shadow-sm border border-primary/30 overflow-hidden">
      
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-primary text-primary-content">
            <tr>
              <th className="p-4 whitespace-nowrap">Employee</th>
              <th className="p-4 whitespace-nowrap">Net Salary</th>
              <th className="p-4 whitespace-nowrap">Status</th>
            </tr>
          </thead>

          <tbody>
            {currentSlips.map((slip) => (
              <tr
                key={slip._id}
                className="border-t border-base-300 hover:bg-base-50"
              >
                <td className="p-4 font-medium">
                  {slip.employeeName || slip.employeeId}
                </td>

                <td className="p-4 font-semibold text-success">
                  ₹{Number(slip.netSalary).toLocaleString()}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      slip.paymentStatus === "PAID"
                        ? "bg-success/20 text-success"
                        : "bg-warning/20 text-warning"
                    }`}
                  >
                    {slip.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}

            {slips.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-base-content/60"
                >
                  No records found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden divide-y divide-base-300">
        {currentSlips.length > 0 ? (
          currentSlips.map((slip) => (
            <div
              key={slip._id}
              className="p-4 space-y-3 hover:bg-base-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-base-content">
                    {slip.employeeName || slip.employeeId}
                  </p>

                  <p className="text-sm text-base-content/60 mt-1">
                    Net Salary
                  </p>

                  <p className="font-bold text-success text-lg">
                    ₹{Number(slip.netSalary).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                    slip.paymentStatus === "PAID"
                      ? "bg-success/20 text-success"
                      : "bg-warning/20 text-warning"
                  }`}
                >
                  {slip.paymentStatus}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-base-content/60">
            No records found for this month.
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-3
            sm:gap-4
            justify-between
            items-center
            p-4
            bg-base-100
            border-t
            border-base-300
          "
        >
          <span className="text-xs sm:text-sm text-base-content/70 text-center sm:text-left">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, slips.length)} of {slips.length}{" "}
            entries
          </span>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <span className="px-2 text-sm font-medium whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  </div>
);
}