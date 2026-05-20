import {
  MdEdit,
  MdDelete,
  MdCurrencyRupee,
  MdAccountBalanceWallet,
} from "react-icons/md";
import Button from "@/components/ui/Button";
import type { CustomRow } from "./SalarySlipPreview";

export interface SalaryStructure {
  id: string;
  name: string;
  role: string;
  basic: number;
  // hra: number;
  // allowances: number;
  // bonus: number;
  
  deductions: number;
  customEarnings?:CustomRow[];
  customDeductions?:CustomRow[];
}

interface Props {
  structure: SalaryStructure;
  onEdit: (structure: SalaryStructure) => void;
  onDelete: (id: string) => void;
}

export default function SalaryStructureCard({
  structure,
  onEdit,
  onDelete,
}: Props) {
  const earningTotal =
  (structure.customEarnings || []).reduce(
    (sum, item) => sum + item.amount,
    0
  );

const deductionTotal =
  structure.deductions +
  (structure.customDeductions || []).reduce(
    (sum, item) => sum + item.amount,
    0
  );

const netSalary =
  structure.basic +
  earningTotal -
  deductionTotal;
  // const netSalary = structure.basic + structure.hra + structure.allowances + 
  //                  structure.bonus - structure.deductions;

  return (
    <div className="group bg-base-100 border border-base-300 hover:border-primary/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ">
      
      {/* TARGET INFO SECTION */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <h3 className="text-xl font-bold text-base-content group-hover:text-primary">
              {structure.name}
            </h3>
          </div>
          <p className="text-sm text-base-content/70 mb-1">Role: <span className="font-medium">{structure.role}</span></p>
          <div className="flex items-center gap-2 text-xs text-base-content/60 bg-base-200/50 px-3 py-1 rounded-full w-fit">
            <MdAccountBalanceWallet size={14} />
            Salary Structure
          </div>
        </div>
      </div>

      {/* SALARY BREAKDOWN */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between text-base-content/70">
              <span>Basic Sal</span>
              <span className="font-mono">₹{structure.basic.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base-content/70">
              <span>HRA</span>
              <span className="font-mono">₹{structure.hra.toLocaleString()}</span>
            </div>
          </div>
          {/* <div className="space-y-1">
            <div className="flex justify-between text-base-content/70">
              <span>Allowances</span>
              <span className="font-mono">₹{structure.allowances.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base-content/70">
              <span>Bonus</span>
              <span className="font-mono">₹{structure.bonus.toLocaleString()}</span>
            </div>
          </div> */}

          <div className="space-y-2 text-sm">

  {/* Basic Salary */}
  <div className="flex justify-between text-base-content/70">
    <span>Basic Salary</span>
    <span className="font-mono">
      ₹{structure.basic.toLocaleString()}
    </span>
  </div>

  {/* Dynamic Earnings */}
  {structure.customEarnings?.map((item) => (
    <div
      key={item.id}
      className="flex justify-between text-base-content/70"
    >
      <span>{item.label}</span>
      <span className="font-mono">
        ₹{item.amount.toLocaleString()}
      </span>
    </div>
  ))}
</div>
        </div>
        <div className="pt-3 border-t border-base-300">
          <div className="flex justify-between items-center text-sm text-error font-medium">
            <span>Deductions</span>
            <span>₹{structure.deductions.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* NET SALARY HIGHLIGHT */}
      <div className="bg-gradient-to-r from-primary/5 to-success/5 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-base-content/80">Net Salary</span>
          <div className="flex items-center gap-2">
            <MdCurrencyRupee className="text-primary" size={20} />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              {netSalary.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 pt-4 border-t border-base-300">
        <Button
          variant="outline"
          className="flex-1 h-11 text-sm"
          onClick={() => onEdit(structure)}
        >
          <MdEdit className="mr-1.5" size={16} />
          Edit 
        </Button>
        <Button
          variant="error"
          className="flex-1 h-11 text-sm"
          onClick={() => onDelete(structure.id)}
        >
          <MdDelete className="mr-1.5" size={16} />
          Delete
        </Button>
      </div>
    </div>
  );
}

