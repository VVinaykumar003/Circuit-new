import React from "react";
import { MdDownload, MdRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export interface PageHeaderAction {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  size?: "xs" | "sm" | "md";
  square?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface BreadcrumbItem {
  label: string;
  active?: boolean;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: PageHeaderAction[];

  // Cancel button
  cancel?: boolean;

  showImport?: boolean;
  onImport?: () => void;

  showExport?: boolean;
  onExport?: () => void;

  showRefresh?: boolean;
  onRefresh?: () => void;

  className?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs = [],
  actions = [],
  cancel = false,

  showImport = false,
  onImport,

  showExport = false,
  onExport,

  showRefresh = false,
  onRefresh,

  className = "",
  children,
}) => {
  const navigate = useNavigate();

  const getButtonClass = (action: PageHeaderAction) => {
    const variantClass = {
      primary: "btn-primary",
      outline: "btn-outline",
      ghost: "btn-ghost",
    }[action.variant || "outline"];

    const sizeClass = {
      xs: "btn-xs",
      sm: "btn-sm",
      md: "btn-md",
    }[action.size || "sm"];

    return [
      "btn",
      variantClass,
      sizeClass,
      action.square ? "btn-square" : "gap-2",
      action.className || "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div
      className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3 bg-base-100 p-2.5 sm:p-3 rounded-lg border border-base-300 shadow-sm ${className}`}
    >
      {/* Title + Breadcrumbs */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-base-content tracking-tight">
          {title}
        </h1>

        {breadcrumbs.length > 0 && (
          <div className="text-xs text-base-content/60 breadcrumbs mt-1 font-medium">
            <ul>
              {breadcrumbs.map((item, index) => (
                <li
                  key={`${item.label}-${index}`}
                  className={item.active ? "text-primary" : ""}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Cancel */}
        {cancel && (
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2 bg-base-100"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        )}

        {/* Import */}
        {showImport && (
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2 bg-base-100"
            onClick={onImport}
          >
            <MdDownload size={16} />
            Import CSV
          </button>
        )}

        {/* Export */}
        {showExport && (
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2 bg-base-100"
            onClick={onExport}
          >
            <MdDownload size={16} />
            Export CSV
          </button>
        )}

        {/* Refresh */}
        {showRefresh && (
          <button
            type="button"
            className="btn btn-outline btn-sm btn-square bg-base-100"
            onClick={onRefresh}
          >
            <MdRefresh size={16} />
          </button>
        )}

        {/* Custom Actions */}
        {actions.map((action, index) => (
          <button
            key={index}
            type="button"
            className={getButtonClass(action)}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon}
            {action.label}
          </button>
        ))}

        {/* Custom React elements */}
        {children}
      </div>
    </div>
  );
};

export default PageHeader;