import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

import { useAuth } from "@/auth/AuthContext";

interface Props {
  basic: number;
  // hra: number;
  // da: number;
  onChange: (key: "basic" , value: number) => void;
  onSave: () => void;
}

export default function GlobalPayoutConfig({
  basic,
 
  onChange,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const { auth } = useAuth();
 
  return (
    <div className="bg-primary text-primary-content rounded-2xl p-4 shadow-lg transition-all">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold tracking-wide text-sm flex items-center gap-2">
           GLOBAL PAYOUT CONFIGURATION
        </h2>

        <button
          onClick={() => setOpen(!open)}
          className="btn btn-sm rounded-full bg-base-100 text-primary hover:bg-base-200"
        >
          {open ? "Close" : "Modify Default %"}
        </button>
      </div>

      {/* EXPAND CONTENT */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-[400px] mt-4 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs mb-1 opacity-70">BASIC %</p>
            <input
              type="number"
              value={basic}
              onChange={(e) => onChange("basic", Number(e.target.value))}
              className="input w-full bg-base-200 text-base-content"
            />
          </div>

          {/* <div>
            <p className="text-xs mb-1 opacity-70">HRA %</p>
            <input
              type="number"
              value={hra}
              onChange={(e) => onChange("hra", Number(e.target.value))}
              className="input w-full bg-base-200 text-base-content"
            />
          </div>

          <div>
            <p className="text-xs mb-1 opacity-70">DA %</p>
            <input
              type="number"
              value={da}
              onChange={(e) => onChange("da", Number(e.target.value))}
              className="input w-full bg-base-200 text-base-content"
            />
          </div> */}
        </div>

        {/* SAVE BUTTON */}
        <div className="mt-4">
          <Button
            variant="primary"
            className="w-full !bg-white hover:!bg-gray-200 text-black"
            onClick={onSave}
          >
            SAVE CHANGES FOR ALL EMPLOYEES
          </Button>
        </div>
      </div>
    </div>
  );
}