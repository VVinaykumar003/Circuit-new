import { MdClose } from "react-icons/md";
import SalarySlipPreview from "./SalarySlipPreview";

interface Props {
  slip: any;
  onClose: () => void;
}

export default function SalarySlipModal({ slip, onClose }: Props) {
  // Map the backend slip data to the format SalarySlipPreview expects
  const slipData = {
    basic: slip.basicSalary || 0,
    da: 0, 
    hra: slip.allowances || 0, 
    special: slip.bonus || 0, 
    epf: slip.deductions || 0,
    professionalTax: 0, 
  };

  const employeeName = slip.employee?.name || slip.employeeName || "Employee";

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-base-100 rounded-2xl shadow-xl border border-base-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-base-300">
          <div>
            <h3 className="text-lg font-bold text-base-content">
              Payslip Details
            </h3>
            <p className="text-sm text-base-content/70 mt-1">
              {employeeName} • {slip.month} {slip.year}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-sm btn-ghost btn-circle bg-base-200 hover:bg-base-300"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          <SalarySlipPreview data={slipData} isEstimate={false} />
        </div>
      </div>
    </div>
  );
}
