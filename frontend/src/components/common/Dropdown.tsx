import React, { useState, useRef, useEffect, type ReactNode } from "react";

export interface DropdownItem {
  id?: string;
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: "default" | "error" | "warning";
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export default function Dropdown({
  trigger,
  items,
  align = "right",
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-48 bg-base-100 rounded-xl shadow-xl border border-base-300 py-1.5 z-50 animate-fade-in`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="my-1 border-t border-base-200" />;
            }

            return (
              <button
                key={index}
                disabled={item.disabled}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                  item.variant === "error"
                    ? "text-error hover:bg-error/10"
                    : item.variant === "warning"
                    ? "text-warning hover:bg-warning/10"
                    : "text-base-content/80 hover:text-base-content hover:bg-base-200/60"
                }`}
              >
                {item.icon && <span className="text-base shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
