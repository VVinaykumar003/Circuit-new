import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  linkTo?: string;
}

export default function Logo({ collapsed = false, className = "", linkTo = "/" }: LogoProps) {
  return (
    <Link to={linkTo} className={`flex items-center gap-2 select-none ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-content font-black text-sm shadow-sm shadow-primary/20 shrink-0">
        C
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-base-content via-base-content to-primary bg-clip-text text-transparent leading-none">
            Circuit<span className="text-primary">ERP</span>
          </span>
          <span className="text-[9px] font-medium text-base-content/50 uppercase tracking-widest leading-none mt-0.5">
            Enterprise
          </span>
        </div>
      )}
    </Link>
  );
}
