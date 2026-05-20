import SalaryRow from "./salaryRow";
import { useMemo } from "react";

export interface CustomRow {
  id: string;
  label: string;
  amount: number;
}

interface SalaryBreakdown {
  basic: number;
  
  epf: number;
  professionalTax: number;
  customEarnings?: CustomRow[];
  customDeductions?: CustomRow[];
}

interface Props {
  data: SalaryBreakdown;
  isEstimate?: boolean;
  editable?: boolean;
  onChange?: (key: keyof SalaryBreakdown, value: number) => void;
  onAddCustomRow?: (type: "earning" | "deduction") => void;
  onChangeCustomRow?: (type: "earning" | "deduction", id: string, key: "label" | "amount", value: string | number) => void;
  onRemoveCustomRow?: (type: "earning" | "deduction", id: string) => void;
}




export default function SalarySlipPreview({
  data,
  isEstimate = true,
  editable = false,
  onChange,
  onAddCustomRow,
  onChangeCustomRow,
  onRemoveCustomRow,
}: Props) {
  const parse = (value: any) => Number(value) || 0;

  const salarySummary = useMemo(() => {
   const gross =
    parse(data.basic) +
    (data.customEarnings || []).reduce(
      (sum, item) => sum + parse(item.amount),
      0
    );

    const totalDeductions =
      parse(data.epf) +
      parse(data.professionalTax) +
      (data.customDeductions || []).reduce((sum, item) => sum + parse(item.amount), 0);

    return {
      gross,
      totalDeductions,
      netPay: gross - totalDeductions,
    };
  }, [data]);

  return (
    <div className="bg-white/40 text-base-content border border-gray-500 rounded-2xl p-6 shadow-md space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-base-600">
        <div>
          <h2 className="text-lg font-semibold text-base-content">
            Pro-forma Salary Slip
          </h2>
          <p className="text-xs text-base-content">
            Salary breakdown preview
          </p>
        </div>

        {isEstimate && (
          <span className="badge badge-outline text-accent text-xs">
            ESTIMATE
          </span>
        )}
      </div>

      {/* ================= EARNINGS ================= */}
      <div>
        <h3 className="text-sm font-semibold text-base-content mb-3">
          Earnings
        </h3>

        <div className="text-sm divide-y divide-base-300">
          <div className="py-2">
            <SalaryRow label="Basic Salary" amount={data.basic} editable={editable} onChange={(v) => onChange?.("basic", v)} />
          </div>

          {/* <div className="py-2">
            <SalaryRow label="Dearness Allowance" amount={data.da} editable={editable} onChange={(v) => onChange?.("da", v)} />
          </div>

          <div className="py-2">
            <SalaryRow label="House Rent Allowance" amount={data.hra} editable={editable} onChange={(v) => onChange?.("hra", v)} />
          </div>

          <div className="py-2">
            <SalaryRow label="Special Allowance" amount={data.special} editable={editable} onChange={(v) => onChange?.("special", v)} />
          </div> */}

          {data.customEarnings?.map(row => (
            <div className="py-2" key={row.id}>
              <SalaryRow 
                label={row.label} 
                amount={row.amount} 
                editable={editable} 
                isCustom 
                onLabelChange={(val) => onChangeCustomRow?.("earning", row.id, "label", val)}
                onChange={(val) => onChangeCustomRow?.("earning", row.id, "amount", val)}
                onRemove={() => onRemoveCustomRow?.("earning", row.id)}
              />
            </div>
          ))}
        </div>

        {editable && (
          <button onClick={() => onAddCustomRow?.("earning")} className="text-xs  text-blue-900 font-medium hover:underline mt-2 inline-block">
            + Add Earning Component
          </button>
        )}

        <div className="mt-4 pt-3 border-t border-base-300 flex justify-between items-center font-semibold text-base-content">
          <span>Gross Earnings</span>
          <span>₹ {salarySummary.gross.toLocaleString()}</span>
        </div>
      </div>

      {/* ================= DEDUCTIONS ================= */}
      <div>
        <h3 className="text-sm font-semibold text-base-content mb-3">
          Deductions
        </h3>

        <div className="text-sm divide-y divide-base-300">
          <div className="py-2">
            <SalaryRow
              label="EPF Employee Share"
              amount={data.epf}
              editable={editable}
              onChange={(v) => onChange?.("epf", v)}
            />
          </div>

          <div className="py-2">
            <SalaryRow
              label="Professional Tax"
              amount={data.professionalTax}
              editable={editable}
              onChange={(v) => onChange?.("professionalTax", v)}
            />
          </div>

          {data.customDeductions?.map(row => (
            <div className="py-2" key={row.id}>
              <SalaryRow 
                label={row.label} 
                amount={row.amount} 
                editable={editable} 
                isCustom 
                onLabelChange={(val) => onChangeCustomRow?.("deduction", row.id, "label", val)}
                onChange={(val) => onChangeCustomRow?.("deduction", row.id, "amount", val)}
                onRemove={() => onRemoveCustomRow?.("deduction", row.id)}
              />
            </div>
          ))}
        </div>

        {editable && (
          <button onClick={() => onAddCustomRow?.("deduction")} className="text-xs text-red-600 font-medium hover:underline mt-2 inline-block">
            + Add Deduction Component
          </button>
        )}

        <div className="mt-4 pt-3 border-t border-base-300 flex justify-between items-center font-semibold text-base-content">
          <span>Total Deductions</span>
          <span>₹ {salarySummary.totalDeductions.toLocaleString()}</span>
        </div>
      </div>

      {/* ================= NET PAY ================= */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
        <span className="text-sm font-semibold text-base-content">
          Net Pay
        </span>
        <span className="text-lg font-bold text-primary">
          ₹ {salarySummary.netPay.toLocaleString()}
        </span>
      </div>
    </div>
  );
}