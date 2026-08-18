import { useState, useEffect } from "react";
import {
  MdDownload,
  MdVisibility,
  MdFilterList,
} from "react-icons/md";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import StatusBadge from "../ui/StatusBadge";
import { useAuth } from "@/auth/AuthContext";
import { getAllSalarySlips, downloadSalarySlipPDF } from "@/services/salarySlipService";
import { toast } from "react-toastify";

/* ---------------- COMPONENT ---------------- */

const AdminPayslipTable = () => {
    const { auth } = useAuth();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthFilter, setMonthFilter] = useState("");
    const [search, setSearch] = useState("");
  
    useEffect(() => {
      if (auth.slug) {
        setLoading(true);
        // Extract year and month from the filter if selected (e.g., "2026-01")
        let params: any = {};
        if (monthFilter) {
          const [year, month] = monthFilter.split("-");
          params.year = Number(year);
          params.month = Number(month);
        }

        getAllSalarySlips(auth.slug, params)
          .then((res) => {
            setRecords(res.data?.data?.slips || []);
          })
          .catch((err) => {
            console.error("Failed to fetch salary slips", err);
            toast.error("Failed to fetch salary slips.");
          })
          .finally(() => setLoading(false));
      }
    }, [auth.slug, monthFilter]);

    const handleDownload = async (id: string) => {
      if (!auth?.slug) return;
      try {
        toast.info("Downloading payslip...");
        const response = await downloadSalarySlipPDF(auth.slug, id);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payslip-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Payslip downloaded successfully!");
      } catch (error) {
        console.error("Download failed", error);
        toast.error("Failed to download payslip.");
      }
    };

    const filtered = records.filter((r) => {
      if (!search) return true;
      return r.employeeName?.toLowerCase().includes(search.toLowerCase());
    });

  return (
     <div className="space-y-6">
   
         {/* HEADER */}
        
   
         {/* FILTER BAR */}
         <div className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
   
         
             <Input
               placeholder="Search employee..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-48"
             />
   
             <Select
               value={monthFilter}
               onChange={(e) => setMonthFilter(e.target.value)}
             >
               <option value="">All Months</option>
               <option value="2026-01">Jan 2026</option>
               <option value="2026-02">Feb 2026</option>
             </Select>
   
           <Button variant="outline">
             <MdFilterList className="mr-1" size={18} />
             Advanced Filter
           </Button>
         </div>
   
         {/* TABLE */}
         <div className="bg-base-100 border border-base-300 rounded-xl overflow-hidden">
   
           <table className="table w-full">
             <thead>
               <tr>
                 <th>Employee</th>
                 <th>Month</th>
                 <th>Gross</th>
                 <th>Deductions</th>
                 <th>Net Pay</th>
                 <th>Status</th>
                 <th>Actions</th>
               </tr>
             </thead>
   
             <tbody>
               {loading ? (
                 <tr>
                   <td colSpan={7} className="text-center py-8">Loading payrolls...</td>
                 </tr>
               ) : (
               {filtered.map((record) => (
                 <tr key={record._id} className="hover:bg-base-200">
   
                   <td>
                     <div>
                       <p className="font-medium">
                         {record.employeeName || "Unknown"}
                       </p>
                       <p className="text-xs text-base-content/60">
                         {record.designation || "Employee"}
                       </p>
                     </div>
                   </td>
   
                   <td>{record.month} {record.year}</td>
   
                   <td>₹ {(record.netSalary + (record.deductions || 0)).toLocaleString()}</td>
                   <td className="text-error">
                     ₹ {(record.deductions || 0).toLocaleString()}
                   </td>
   
                   <td className="font-semibold text-primary">
                     ₹ {(record.netSalary || 0).toLocaleString()}
                   </td>
   
                   <td>
                    
                     <StatusBadge status={record.status?.toLowerCase() || "pending"} />
                   </td>
   
                   <td>
                     <div className="flex gap-2">
   
                       <button className="btn btn-sm btn-ghost">
                         <MdVisibility size={18} />
                       </button>
   
                       <button className="btn btn-sm btn-ghost" title="Download PDF" onClick={() => handleDownload(record._id)}>
                         <MdDownload size={18} />
                       </button>
   
                     </div>
                   </td>
   
                 </tr>
               )))}
             </tbody>
           </table>
   
           {!loading && filtered.length === 0 && (
             <div className="p-6 text-center text-sm text-base-content/60">
               No payroll records found.
             </div>
           )}
         </div>
       </div>
  )
}

export default AdminPayslipTable
