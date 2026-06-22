import React, { useState, useEffect } from "react";
import { getEmployees, runMonthly } from "@/services/payrollService";
// import { getMembers } from "@/services/memberService";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import PageHeader from "../ui/PageHeader";
import { 
  MdReceipt, 
  MdDateRange, 
  MdAttachMoney, 
  MdPeople, 
  MdSearch 
} from "react-icons/md";

export default function GeneratePaySlip() {
  const { auth } = useAuth();
  // console.log(auth.user)
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [manualAmount, setManualAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    if (auth.slug) {
      getEmployees(auth.slug)
        .then(res => setEmployees(res.data?.data || []))
        .catch(() => toast.error("Failed to load employees"));
    }
  }, [auth.slug]);

  const handleGenerate = async () => {
    if (selectedEmployees.length === 0) return toast.warning("Please select at least one employee.");

    setLoading(true);
    const payload = {
      month,
      year,
      employeeIds: selectedEmployees,
      manualAmount: manualAmount ? Number(manualAmount) : undefined
    };

    try {
      const res = await runMonthly(auth.slug, payload);
      
      const failed = res.data?.data?.failed || [];
      const success = res.data?.data?.success || [];
      
      if (failed.length > 0) {
        let reason = failed[0].reason;
        if (reason.includes("E11000") || reason.toLowerCase().includes("duplicate")) {
          reason = "Payslips for this month already exist.";
        }
        toast.warning(`${success.length} generated, ${failed.length} failed: ${reason}`);
      } else {
        toast.success(res.data?.message || "Payroll generated successfully!");
      }

      setSelectedEmployees([]);
      setManualAmount("");
    } catch (error: any) {
      const details = error.response?.data?.details;
      if (details && details.length > 0) {
        let reason = details[0].reason;
        if (reason.includes("E11000") || reason.toLowerCase().includes("duplicate")) {
          reason = "Payslips for this month already exist.";
        }
        toast.error(`Failed: ${reason}`);
      } else {
        const msg = error.response?.data?.message || "Failed to generate payroll";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.department || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectAll = () => {
    const filteredIds = filteredEmployees.map(e => e._id);
    setSelectedEmployees(Array.from(new Set([...selectedEmployees, ...filteredIds])));
  };

  const deselectAll = () => {
    const filteredIds = new Set(filteredEmployees.map(e => e._id));
    setSelectedEmployees(selectedEmployees.filter(id => !filteredIds.has(id)));
  };

  return (
    <div className="p-4 sm:p-6 bg-base-50 min-h-screen space-y-6">
      
      {/* <div className="flex items-center gap-3 mb-2"> */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
        <div className="sm:block hidden p-3 bg-primary/10 text-primary rounded-xl">
          <MdReceipt size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-medium text-base-content">Generate Payslips</h1>
          <p className="text-md text-base-content">Process monthly payroll for your organization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Configuration */}
        {/* <div className="lg:col-span-4 space-y-6 h-fit sticky top-6"> */}
          <div
  className="
    lg:col-span-4
    space-y-6
    h-fit

    static
    lg:sticky
    lg:top-6
  "
>
          {/* Box 1: Period Selection */}
          <div className="bg-primary mt-2 text-primary-content p-6 rounded-2xl border border-primary/20 shadow-sm">
            <h3 className="text-sm font-bold  uppercase tracking-wider mb-4 flex items-center gap-2">
              <MdDateRange size={18} /> Payroll Period
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold  mb-1">Month</label>
                <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full bg-base-200 border-none">
                  {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold  mb-1">Year</label>
                <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full bg-base-200 border-none">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </Select>
              </div>
            </div>
          </div>

          {/* Box 2: Manual Override */}
          <div className="bg-base-100 p-6 rounded-2xl border border-primary shadow-sm">
            <h3 className="text-sm font-bold text-base-content/80 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MdAttachMoney size={18} /> Salary Override
            </h3>
            <p className="text-xs text-base-content mb-4 leading-relaxed">
              Leave blank to automatically use each employee's configured salary structure.
            </p>
            <Input
              type="number"
              placeholder="₹ Enter manual gross amount"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              className="w-full bg-base-200 border-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Box 3: Action Summary */}
          <div className="bg-primary/10 p-6 rounded-2xl border border-primary shadow-sm flex flex-col items-center text-center">
            <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider mb-2">Ready to Process</h3>
            <div className="text-4xl font-black text-primary mb-1">{selectedEmployees.length}</div>
            <p className="text-sm text-base-content mb-6">Employees Selected</p>
            
            <Button variant="primary" className="w-full py-3 h-auto text-sm font-bold shadow-md hover:shadow-lg transition-all" onClick={handleGenerate} disabled={loading || selectedEmployees.length === 0}>
              {loading ? "Generating..." : "Run Payroll Batch"}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Employee Selection */}
        {/* <div className="lg:col-span-8 mt-2 bg-base-100 rounded-2xl border border-primary shadow-sm flex flex-col h-[calc(100vh-8rem)] min-h-[600px]"> */}
          <div
  className="
    lg:col-span-8
    mt-2
    bg-base-100
    rounded-2xl
    border
    border-primary
    shadow-sm
    flex
    flex-col

    h-auto
    lg:h-[calc(100vh-8rem)]

    min-h-[500px]
    overflow-hidden
  "
>
          {/* Header & Search */}
          <div className="p-5 border-b   border-base-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-base-100 rounded-t-2xl z-10">
            <h3 className="text-base font-bold text-base-content flex items-center gap-2">
              <MdPeople size={20} className="text-primary" /> Select Employees
            </h3>
            
            <div className="flex w-full sm:w-auto items-center gap-3 ">
              <div className="relative flex-1 sm:w-64 ">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-base-200 border border-primary/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="btn btn-sm  text-primary border hover:bg-primary/10" onClick={selectAll}>Select All</button>
                <button className="btn btn-sm border text-base-content/60" onClick={deselectAll}>Clear</button>
              </div>
            </div>
          </div>

          {/* Grid Area */}
          {/* <div className="flex-1 overflow-y-auto p-5 bg-base-50/30"> */}
          <div
  className="
    flex-1
    overflow-y-auto
    overflow-x-hidden
    p-3 sm:p-5
    bg-base-50/30

    max-h-[500px]
    lg:max-h-none
  "
>
            {filteredEmployees.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-base-content/40 space-y-3">
                <MdPeople size={48} className="opacity-20" />
                <p>No employees match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredEmployees.map(emp => {
            const isSelected = selectedEmployees.includes(emp._id);
            return (
              <label
                key={emp._id}
                      className={`relative flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 select-none group ${
                  isSelected
                          ? "bg-primary/5 border-primary shadow-sm scale-[0.98]"
                          : "bg-base-100 border-primary/20 hover:border-primary/40 hover:shadow-sm hover:bg-base-50"
                }`}
              >
                      <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleEmployee(emp._id)} />
                
                {/* Custom Checkmark Indicator */}
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "bg-primary border-primary" : "border-base-300 group-hover:border-primary/40"
                }`}>
                  {isSelected && <svg className="w-3 h-3 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                  isSelected ? "bg-primary text-primary-content shadow-md" : "bg-base-200 text-base-content/60"
                }`}>
                  {emp.name?.charAt(0).toUpperCase() || "?"}
                </div>
                
                <div className="flex flex-col pr-6">
                  <span className="font-bold text-base-content line-clamp-1">{emp.name}</span>
                        <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider mt-0.5 line-clamp-1">
                    {emp.department || "Staff"}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}