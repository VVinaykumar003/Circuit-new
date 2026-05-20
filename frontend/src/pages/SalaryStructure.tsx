import { useState, useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import StatutorySettingsCard from "@/components/salary/StatutorySettingsCard";
import SalarySlipPreview from "@/components/salary/SalarySlipPreview";
import { useAuth } from "@/auth/AuthContext";
// import { getAllEmployees } from "@/services/attendanceService";
import {
  getPayrollConfig,
  setStructure,
  updatePayrollConfig,
} from "@/services/payrollService";
// import api from "@/services/api";
import { toast } from "react-toastify";
import { MdCurrencyRupee } from "react-icons/md";
import { getMembers } from "@/services/memberService";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GlobalPayoutConfig from "@/components/salary/GlobalPayoutConfiguration";

interface Employee {
  _id: string;
  name: string;
  email: string;
}

interface CustomRow {
  id: string;
  label: string;
  amount: number;
}

/* ---------- COMPONENT ---------- */

export default function SalaryStructureDashboard() {
  const { auth } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [monthlyGross, setMonthlyGross] = useState(0);
  const [limitPF, setLimitPF] = useState(true);

  const [salaryData, setSalaryData] = useState({
    basic: 0,
    // da: 0,
    // hra: 0,
    // special: 0,
    epf: 0,
    professionalTax: 0,
    customEarnings: [] as CustomRow[],
    customDeductions: [] as CustomRow[],
  });
  const [globalConfig, setGlobalConfig] = useState({
    basic: 0,
  });

  const handleGlobalChange = (key, value) => {
    setGlobalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleGlobalSave = async () => {
    try {
      const total = globalConfig.basic;

      if (total > 100) {
        toast.error("Total percentage cannot exceed 100%");
        return;
      }
      await updatePayrollConfig(auth.slug, {
        basicPercent: globalConfig.basic,
        // hraPercent: globalConfig.hra,
        // daPercent: globalConfig.da,
      });

      toast.success("Global payout config updated");
    } catch (error) {
      toast.error("Failed to update config");
      console.error(error);
    }
  };
  useEffect(() => {
    if (auth.slug) {
      setLoading(true);
      getMembers(auth.slug)
        .then((res) => {
          setEmployees(res.data?.members || []);
        })
        .catch((err) => {
          console.error("Failed to fetch employees", err);
          toast.error("Failed to fetch employees.");
        })
        .finally(() => setLoading(false));
    }
  }, [auth.slug]);

  // useEffect(() => {
  //   const gross = monthlyGross > 0 ? monthlyGross : 0;

  //   // Basic is 50% of Gross
  //   const basic = gross * 0.5;

  //   // HRA is 40% of Basic
  //   const hra = basic * 0.4;

  //   // Special Allowance is the remainder
  //   const special = gross - basic - hra;

  //   // EPF is 12% of Basic, capped at 15000 if limitPF is true
  //   let epfContribution = 0;
  //   if (limitPF && basic > 15000) {
  //     epfContribution = 15000 * 0.12;
  //   } else {
  //     epfContribution = basic * 0.12;
  //   }

  //   // Professional Tax (simple slab for example)
  //   const professionalTax = gross > 10000 ? 200 : 0;

  //   setSalaryData(prev => ({
  //     basic: Math.round(basic),
  //     da: 0, // For future use
  //     hra: Math.round(hra),
  //     special: Math.round(special),
  //     epf: Math.round(epfContribution),
  //     professionalTax: Math.round(professionalTax),
  //     customEarnings: prev.customEarnings || [],
  //     customDeductions: prev.customDeductions || [],
  //   }));
  // }, [monthlyGross, limitPF]);

  useEffect(() => {
    const gross = monthlyGross > 0 ? monthlyGross : 0;

    const basic = (gross * globalConfig.basic) / 100;

    // const hra =
    //   (gross * globalConfig.hra) / 100;

    // const da =
    //   (gross * globalConfig.da) / 100;

    const totalFixed = basic;

    // const special =
    //   gross - totalFixed;

    let epfContribution = 0;

    if (limitPF && basic > 15000) {
      epfContribution = 15000 * 0.12;
    } else {
      epfContribution = basic * 0.12;
    }

    const professionalTax = gross > 10000 ? 200 : 0;

    setSalaryData((prev) => ({
      ...prev,

      basic: Math.round(basic),

      // hra: Math.round(hra),

      // da: Math.round(da),

      // special: Math.round(special),

      epf: Math.round(epfContribution),

      professionalTax: Math.round(professionalTax),
    }));
  }, [monthlyGross, limitPF, globalConfig]);

  const handleSaveStructure = async () => {
    if (!selectedEmployeeId || monthlyGross <= 0) {
      toast.error("Please select an employee and enter a valid gross salary.");
      return;
    }

    setGenerating(true);
    const calculatedGross =
      salaryData.basic +
      // salaryData.da +
      // salaryData.hra +
      // salaryData.special +
      salaryData.customEarnings.reduce((sum, item) => sum + item.amount, 0);

    //   const calculatedGross =
    // salaryData.basic +
    // salaryData.customEarnings.reduce(
    //   (sum, item) => sum + item.amount,
    //   0
    // );
    // const payload = {
    //   employeeId: selectedEmployeeId,
    //   monthlyGross: calculatedGross > 0 ? calculatedGross : monthlyGross,
    //   taxRegime: "new",
    //   limitPF,
    //   ...salaryData
    // };
    if (calculatedGross > monthlyGross) {
      toast.error("Total earnings cannot exceed gross salary");

      setGenerating(false);

      return;
    }
    const payload = {
      employeeId: selectedEmployeeId,
      monthlyGross: calculatedGross,
      limitPF,

      basic: salaryData.basic,
      //   hra: salaryData.hra,
      // da: salaryData.da,
      // special: salaryData.special,
      epf: salaryData.epf,
      professionalTax: salaryData.professionalTax,

      customEarnings: salaryData.customEarnings,
      customDeductions: salaryData.customDeductions,
    };
    try {
      // Important: Ensure this endpoint matches your admin.payroll.routes.js exactly
      await setStructure(auth.slug, payload);
      toast.success("Salary structure saved successfully!");
      // Reset form
      setSelectedEmployeeId("");
      setMonthlyGross(0);
      setSalaryData((prev) => ({
        ...prev,
        customEarnings: [],
        customDeductions: [],
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to save salary structure.";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddCustomRow = (type: "earning" | "deduction") => {
    const key = type === "earning" ? "customEarnings" : "customDeductions";
    setSalaryData((prev) => ({
      ...prev,
      [key]: [...prev[key], { id: crypto.randomUUID(), label: "", amount: 0 }],
    }));
  };

  const handleChangeCustomRow = (
    type: "earning" | "deduction",
    id: string,
    field: "label" | "amount",
    value: string | number,
  ) => {
    const key = type === "earning" ? "customEarnings" : "customDeductions";
    setSalaryData((prev) => ({
      ...prev,
      [key]: prev[key].map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const handleRemoveCustomRow = (type: "earning" | "deduction", id: string) => {
    const key = type === "earning" ? "customEarnings" : "customDeductions";
    setSalaryData((prev) => ({
      ...prev,
      [key]: prev[key].filter((row) => row.id !== id),
    }));
  };
  useEffect(() => {
    if (!auth.slug) return;

    const fetchConfig = async () => {
      try {
        const res = await getPayrollConfig(auth.slug);

        if (res.data?.config) {
          setGlobalConfig({
            basic: res.data.config.basicPercent || 0,
            // hra: res.data.config.hraPercent || 0,
            // da: res.data.config.daPercent || 0,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchConfig();
  }, [auth.slug]);
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Breadcrumbs />
      {/* ✅ YAHI CALL KARNA HAI */}
      <GlobalPayoutConfig
        basic={globalConfig.basic}
        // hra={globalConfig.hra}
        // da={globalConfig.da}
        onChange={handleGlobalChange}
        onSave={handleGlobalSave}
      />
      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT SIDE - CONFIGURATION */}
        <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
          {/* <div className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm space-y-4 h-fit"> */}
          <div className="bg-base-100 border border-primary rounded-2xl p-6 shadow-sm space-y-4 h-fit">
            <h3 className="text-lg font-semibold text-base-content">
              Configure Salary
            </h3>

            <Select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className={`w-full transition-all duration-200 text-base-content ${
                selectedEmployeeId
                  ? "bg-primary/10 border-primary"
                  : "border-primary/30"
              }`}
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading..." : "Choose employee"}
              </option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </Select>

            <div className="relative">
              <MdCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60" />
              <Input
                type="number"
                placeholder="Enter Monthly Gross"
                value={monthlyGross || ""}
                onChange={(e) => setMonthlyGross(Number(e.target.value))}
                className="w-full placeholder:text-base-content/60 text-base-content border-primary/30 focus:ring-primary/50 "
              />
            </div>
          </div>
          <StatutorySettingsCard checked={limitPF} onChange={setLimitPF} />
        </div>

        {/* RIGHT SIDE - PREVIEW */}
        <div className="w-full md:w-2/3 lg:w-3/4  ">
          <SalarySlipPreview
            data={salaryData}
            editable={true}
            onChange={(key, value) =>
              setSalaryData((prev) => ({ ...prev, [key]: value }))
            }
            onAddCustomRow={handleAddCustomRow}
            onChangeCustomRow={handleChangeCustomRow}
            onRemoveCustomRow={handleRemoveCustomRow}
          />
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
            <Button
              variant="primary"
              onClick={handleSaveStructure}
              disabled={generating || !selectedEmployeeId || monthlyGross <= 0}
            >
              {generating && selectedEmployeeId
                ? "Saving..."
                : "Save Salary Structure"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
