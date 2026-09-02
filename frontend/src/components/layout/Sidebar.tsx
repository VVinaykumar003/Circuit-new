import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { getDepartmentNavigation, type NavItem, type NavSection } from "@/config/navigation";
import Logo from "../common/Logo";
import DepartmentSwitcher from "./DepartmentSwitcher";
import {
  MdDashboard,
  MdEventAvailable,
  MdWorkspaces,
  MdAdd,
  MdAssignment,
  MdPeople,
  MdPersonAdd,
  MdTask,
  MdFlightTakeoff,
  MdPayments,
  MdAccountBalanceWallet,
  MdReceiptLong,
  MdHistory,
  MdNotifications,
  MdSettings,
  MdStorefront,
  MdShoppingCart,
  MdHourglassEmpty,
  MdBusiness,
  MdContactPage,
  MdSupportAgent,
  MdTrendingUp,
  MdSend,
  MdExpandMore,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { LuTarget } from "react-icons/lu";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  MdDashboard: <MdDashboard size={15} />,
  MdEventAvailable: <MdEventAvailable size={15} />,
  MdWorkspaces: <MdWorkspaces size={15} />,
  MdAdd: <MdAdd size={13} />,
  MdAssignment: <MdAssignment size={15} />,
  MdPeople: <MdPeople size={15} />,
  MdPersonAdd: <MdPersonAdd size={13} />,
  MdTask: <MdTask size={15} />,
  MdFlightTakeoff: <MdFlightTakeoff size={15} />,
  MdPayments: <MdPayments size={15} />,
  MdWallet: <MdAccountBalanceWallet size={15} />,
  MdReceiptLong: <MdReceiptLong size={15} />,
  MdHistory: <MdHistory size={15} />,
  MdNotifications: <MdNotifications size={15} />,
  MdSettings: <MdSettings size={15} />,
  MdStorefront: <MdStorefront size={15} />,
  MdShoppingCart: <MdShoppingCart size={15} />,
  MdHourglassEmpty: <MdHourglassEmpty size={15} />,
  MdBusiness: <MdBusiness size={15} />,
  MdContactPage: <MdContactPage size={15} />,
  MdSupportAgent: <MdSupportAgent size={15} />,
  MdTrendingUp: <MdTrendingUp size={15} />,
  MdSend: <MdSend size={15} />,
  Target: <LuTarget size={15} />,
};

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const { auth, activeDepartment } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const userRole = auth.user?.role;
  const sections: NavSection[] = getDepartmentNavigation(
    activeDepartment || "erp",
    userRole
  );

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isItemActive = (item: NavItem): boolean => {
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return false;
  };

  return (
    <aside
      className={`h-screen bg-base-100 border-r border-base-300 flex flex-col transition-all duration-300 select-none z-30 ${
        collapsed ? "w-16" : "w-52"
      }`}
    >
      {/* ── Sidebar Top Header ── */}
      <div className="h-12 px-3 flex items-center justify-between border-b border-base-200 shrink-0">
        <Logo collapsed={collapsed} />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content hidden lg:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <MdChevronRight size={16} /> : <MdChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* ── Department Switcher ── */}
      <div className="border-b border-base-200 shrink-0">
        <DepartmentSwitcher collapsed={collapsed} />
      </div>

      {/* ── Navigation Items List ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 scrollbar-thin">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            {!collapsed && section.title && (
              <div className="text-[9px] font-bold text-base-content/40 uppercase tracking-wider px-2 py-0.5">
                {section.title}
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const active = isItemActive(item);
                const isExpanded = openGroups[item.id] ?? active;

                if (hasChildren && !collapsed) {
                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 text-base">
                            {ICON_MAP[item.icon] || <MdDashboard size={15} />}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        <MdExpandMore
                          size={13}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="pl-4 pr-1 space-y-0.5 border-l-2 border-base-200 ml-3.5 my-0.5">
                          {item.children!.map((child) => (
                            <NavLink
                              key={child.id}
                              to={child.path}
                              onClick={onCloseMobile}
                              className={({ isActive }) =>
                                `flex items-center gap-2 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                                  isActive
                                    ? "bg-primary text-primary-content font-bold shadow-xs"
                                    : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                                }`
                              }
                            >
                              <span className="shrink-0 text-xs">
                                {ICON_MAP[child.icon] || <MdChevronRight size={11} />}
                              </span>
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${
                        collapsed ? "justify-center px-0 py-1.5" : "gap-2 px-2.5 py-1.5"
                      } rounded-lg text-[11px] font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-primary-content font-bold shadow-xs shadow-primary/20"
                          : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                      }`
                    }
                  >
                    <span className="shrink-0 text-base">
                      {ICON_MAP[item.icon] || <MdDashboard size={15} />}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Sidebar Footer User Mini Card ── */}
      <div className="p-2 border-t border-base-200 shrink-0 bg-base-200/30">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} p-1`}>
          <div className="avatar placeholder shrink-0">
            <div className="bg-primary/15 text-primary rounded-lg w-6 h-6 font-bold text-[10px] flex items-center justify-center border border-primary/20">
              <span>{auth.user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-bold text-base-content truncate">
                {auth.user?.name || "User"}
              </span>
              <span className="text-[9px] text-base-content/50 truncate capitalize font-medium">
                {auth.user?.role || "Employee"} • {auth.user?.department || "General"}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}