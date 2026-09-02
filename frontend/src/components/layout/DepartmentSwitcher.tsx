import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/auth/useAuth";
import { getEnabledDepartments, getDepartmentById } from "@/config/departments";
import { isManagementRole } from "@/config/roles";
import { MdCheck, MdExpandMore, MdDashboard, MdTrendingUp, MdPeople, MdPayments, MdSupportAgent, MdInventory } from "react-icons/md";

const DEPT_ICONS: Record<string, React.ReactNode> = {
  MdDashboard: <MdDashboard size={15} />,
  MdTrendingUp: <MdTrendingUp size={15} />,
  MdPeople: <MdPeople size={15} />,
  MdPayments: <MdPayments size={15} />,
  MdSupportAgent: <MdSupportAgent size={15} />,
  MdInventory: <MdInventory size={15} />,
};

interface DepartmentSwitcherProps {
  collapsed?: boolean;
}

export default function DepartmentSwitcher({ collapsed = false }: DepartmentSwitcherProps) {
  const { auth, activeDepartment, setActiveDepartment } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userRole = auth.user?.role;
  const canSwitch = isManagementRole(userRole);
  const currentDept = getDepartmentById(activeDepartment);
  const enabledDepts = getEnabledDepartments();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (collapsed) {
    return (
      <div className="flex justify-center p-1.5">
        <div
          title={currentDept.name}
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${currentDept.badgeBg} ${currentDept.badgeText} border border-base-300 shadow-xs cursor-pointer`}
        >
          {currentDept.code}
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-2 py-1.5" ref={dropdownRef}>
      <button
        type="button"
        disabled={!canSwitch}
        onClick={() => canSwitch && setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between p-2 rounded-lg border border-base-300 bg-base-200/50 hover:bg-base-200 transition-all text-left group ${
          canSwitch ? "cursor-pointer" : "cursor-default opacity-90"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${currentDept.badgeBg} ${currentDept.badgeText}`}
          >
            {DEPT_ICONS[currentDept.icon] || currentDept.code}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-base-content truncate tracking-tight">
              {currentDept.name}
            </span>
            <span className="text-[9px] text-base-content/50 truncate font-medium">
              {canSwitch ? "Switch Department" : "Assigned Department"}
            </span>
          </div>
        </div>

        {canSwitch && (
          <MdExpandMore
            size={15}
            className={`text-base-content/50 transition-transform shrink-0 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {open && canSwitch && (
        <div className="absolute left-2 right-2 mt-1 bg-base-100 rounded-lg shadow-xl border border-base-300 p-1 z-50 animate-fade-in">
          <div className="text-[9px] font-bold text-base-content/40 uppercase tracking-wider px-2 py-0.5">
            Available Departments
          </div>
          {enabledDepts.map((dept) => {
            const isSelected = activeDepartment?.toLowerCase() === dept.id.toLowerCase();
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => {
                  setActiveDepartment(dept.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between p-1.5 rounded-md text-[11px] font-medium transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-base-content/80 hover:bg-base-200 hover:text-base-content"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] ${dept.badgeBg} ${dept.badgeText}`}
                  >
                    {dept.code}
                  </div>
                  <span className="truncate">{dept.name}</span>
                </div>
                {isSelected && <MdCheck size={13} className="text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
