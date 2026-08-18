import React, { useState, useEffect } from "react";
import { getPolicy, updatePolicy } from "@/services/payrollService";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function PayrollPolicySetup() {
  const { auth } = useAuth();
  const [basicPercent, setBasicPercent] = useState(50);
  const [hraPercent, setHraPercent] = useState(20);
  const [daPercent, setDaPercent] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.slug) {
      getPolicy(auth.slug).then(res => {
        const settings = res.data?.data?.payrollSettings;
        if (settings) {
          setBasicPercent(settings.basicPercent || 50);
          setHraPercent(settings.hraPercent || 20);
          setDaPercent(settings.daPercent || 10);
        }
      }).catch(() => toast.error("Failed to load policy."));
    }
  }, [auth.slug]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePolicy(auth.slug, { basicPercent, hraPercent, daPercent });
      toast.success("Payroll global policy updated successfully!");
    } catch (error) {
      toast.error("Failed to update payroll policy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-100 p-8 rounded-xl shadow-sm border border-base-300 max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold border-b border-base-200 pb-4">Organization Payroll Policy</h2>
      <p className="text-sm text-base-content/70">Set the default percentages used to calculate statutory salary structure breakdowns directly from Gross pay amounts.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2">Basic Component (%)</label>
          <Input type="number" value={basicPercent} onChange={(e) => setBasicPercent(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">HRA Component (%)</label>
          <Input type="number" value={hraPercent} onChange={(e) => setHraPercent(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">DA Component (%)</label>
          <Input type="number" value={daPercent} onChange={(e) => setDaPercent(Number(e.target.value))} className="w-full" />
        </div>
      </div>

      <Button variant="primary" className="w-full mt-4 py-3" onClick={handleSave} disabled={loading}>
        {loading ? "Applying Settings..." : "Save Policy"}
      </Button>
    </div>
  );
}