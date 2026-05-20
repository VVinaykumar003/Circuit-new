import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

import SalarySlipPreview from "../components/salary/SalarySlipPreview";
import GlobalPayoutConfiguration from "../components/salary/GlobalPayoutConfiguration";
import StatutorySettingsCard from "../components/salary/StatutorySettingsCard";

import { useAuth } from "@/auth/AuthContext";
import { getMembers } from "@/services/memberService";

import { MdCurrencyRupee } from "react-icons/md";

import type  { Employee } from "../type/payroll.types";
import {
  fetchSalaryStructure,
  saveSalaryStructure,
} from "../services/payrollAPI";

import { validateSalaryStructure } from "../validators/payrollValidator";

export default function SalaryStructureDashboard() {
  const { auth } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [monthlyGross, setMonthlyGross] = useState(0);
  const [limitPF, setLimitPF] = useState(true);
  const [autoCalculate, setAutoCalculate] = useState(false);

  const [globalConfig, setGlobalConfig] = useState({
    basic: 50,
    hra: 20,
    da: 10,
  });

  const [salaryData, setSalaryData] = useState({
    basic: 0,
    da: 0,
    hra: 0,
    special: 0,
    epf: 0,
    professionalTax: 0,
    customEarnings: [] as any[],
    customDeductions: [] as any[],
  });

  useEffect(() => {
    if (!autoCalculate) return;

    const gross = monthlyGross > 0 ? monthlyGross : 0;

    const basic = gross * (globalConfig.basic / 100);
    const hra = basic * (globalConfig.hra / 100);
    const da = basic * (globalConfig.da / 100);
    const special = gross - basic - hra - da;

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
      da: Math.round(da),
      hra: Math.round(hra),
      special: Math.round(special),
      epf: Math.round(epfContribution),
      professionalTax: Math.round(professionalTax),
    }));
  }, [monthlyGross, limitPF, autoCalculate, globalConfig]);

  useEffect(() => {
    if (!auth.slug) return;

    setLoading(true);

    getMembers(auth.slug)
      .then((res) => {
        setEmployees(res.data?.members || []);
      })
      .catch(() => {
        toast.error("Failed to fetch employees");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [auth.slug]);

  useEffect(() => {
    if (!selectedEmployeeId || !auth.slug) {
      setMonthlyGross(0);
      return;
    }

    async function loadStructure() {
      try {
        setAutoCalculate(false);
        const structure = await fetchSalaryStructure(auth.slug, selectedEmployeeId);

        if (!structure) return;

        setMonthlyGross(structure.monthlyGross || 0);
        setLimitPF(structure.limitPF ?? true);

        setSalaryData((prev) => ({
          ...prev,
          ...structure,
        }));
      } catch {
        setMonthlyGross(0);
        toast.info("No previous salary structure found");
      }
    }

    loadStructure();
  }, [selectedEmployeeId, auth.slug]);

  async function handleSave() {
    const validationError = validateSalaryStructure({
      employeeId: selectedEmployeeId,
      monthlyGross,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        employeeId: selectedEmployeeId,
        monthlyGross,
        limitPF,
        taxRegime: "new",
        ...salaryData,
      };

      await saveSalaryStructure(auth.slug, payload);

      toast.success("Salary structure saved successfully");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save salary structure"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Breadcrumbs />

        <GlobalPayoutConfiguration
          config={globalConfig}
          basic={globalConfig.basic}
          hra={globalConfig.hra}
          da={globalConfig.da}
          onChange={(key, value) =>
            setGlobalConfig((prev) => ({ ...prev, [key]: Number(value) }))
          }
          onSave={() => toast.success("Global payout configuration saved successfully!")}
        />
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Configuration Controls */}
        <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
          <div className="bg-base-200 border border-base-300 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
            <Select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              disabled={loading}
            >
              <option value="">
                Select Employee
              </option>

              {employees.map((employee) => (
                <option
                  key={employee._id}
                  value={employee._id}
                >
                  {employee.name}
                </option>
              ))}
            </Select>

            <div className="relative">
              <MdCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60" />

              <Input
                type="number"
                placeholder="Monthly Gross Salary"
                value={monthlyGross || ""}
                onChange={(e) => {
                  setMonthlyGross(Number(e.target.value));
                  setAutoCalculate(true);
                }}
                className="pl-8"
              />
            </div>
          </div>

          <StatutorySettingsCard
            checked={limitPF}
            onChange={setLimitPF}
          />
        </div>

        {/* Right Side: Preview */}
        <div className="w-full lg:w-3/4">
          <SalarySlipPreview
            data={salaryData}
            editable
            onChange={(key, value) =>
              setSalaryData((prev) => ({
                ...prev,
                [key]: value,
              }))
            }
            onAddCustomRow={(type) => {
              const key = type === 'earning' ? 'customEarnings' : 'customDeductions';
              setSalaryData(prev => ({
                ...prev,
                [key]: [...(prev[key] || []), { id: crypto.randomUUID(), label: '', amount: 0 }]
              }));
            }}
            onChangeCustomRow={(type, id, field, value) => {
              const key = type === 'earning' ? 'customEarnings' : 'customDeductions';
              setSalaryData(prev => ({
                ...prev,
                [key]: (prev[key] || []).map((row: any) => 
                  row.id === id ? { ...row, [field]: value } : row
                )
              }));
            }}
            onRemoveCustomRow={(type, id) => {
              const key = type === 'earning' ? 'customEarnings' : 'customDeductions';
              setSalaryData(prev => ({
                ...prev,
                [key]: (prev[key] || []).filter((row: any) => row.id !== id)
              }));
            }}
          />

          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Salary Structure"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}