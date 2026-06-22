

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,

  MdShoppingCart,
  MdPeople,
  MdPerson,

  MdContacts,
  MdTask,
 
  MdChevronLeft,
  MdClose,
  MdNotifications,
  MdEventAvailable,
} from "react-icons/md";
import { useAuth } from "../../auth/AuthContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SalesSidebar({ isOpen, onClose }: Props) {
  const { auth } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const user = auth?.user;

  const isAdmin = ["admin", "owner"].includes(
    user?.role || ""
  );

  const adminMenu = [
    {
      label: "Dashboard",
      path: "/sales/dashboard",
      icon: <MdDashboard size={20} />,
    },
    {
      label: "Leads",
      path: "/sales/leads",
      icon: <MdPerson size={20} />,
    },
    {
      label: "Employees",
      path: "/sales/employees",
      icon: <MdPeople size={20} />,
    },
    {
      label: "Deals",
      path: "/sales/deals",
      icon: <MdShoppingCart size={20} />,
    },
    {
      label: "Customers",
      path: "/sales/customers",
      icon: <MdPeople size={20} />,
    },
    {
      label: "Notifications",
      path: "/sales/notifications",
      icon: <MdNotifications size={20} />,
    }
   
    
  ];

  const userMenu = [
    {
      label: "Dashboard",
      path: "/sales/dashboard",
      icon: <MdDashboard size={20} />,
    },
     {
       
        label: "Attendance",
        path: "/attendance",
        icon: <MdEventAvailable size={20} />,
      },
    
    {
      label: "My Leads",
      path: "/sales/leads",
      icon: <MdPerson size={20} />,
    },
    
     {
      label: "My Deals",
      path: "/sales/tasks",
      icon: <MdTask size={20} />,
    },
    {
      label: "Follow-ups",
      path: "/sales/follow-ups",
      icon: <MdContacts size={20} />,
    },
    {
      label: "Customers",
      path: "/sales/customers",
      icon: <MdPerson size={20} />,
    },
     {
      label: "Notifications",
      path: "/sales/notifications",
      icon: <MdNotifications size={20} />,
    }
  ];
useEffect(() => {
  if (isOpen && window.innerWidth < 1024) {
    setCollapsed(false);
  }
}, [isOpen]);
  const menuItems = isAdmin ? adminMenu : userMenu;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
      isActive
        ? "bg-base-300 font-semibold text-base-content"
        : "text-primary-content hover:bg-base-300 hover:text-base-content",
    ].join(" ");

  return (
    <>
      {/* Mobile Overlay */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/40 z-40 lg:hidden
          transition-opacity duration-300
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0
          z-50
          h-screen
          bg-primary
          border-r border-base-300
          flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          overflow-hidden
        `}
      >
        {/* Header */}
        <div className="flex items-center px-3 py-3 border-b border-base-300">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-base-100 text-primary flex items-center justify-center font-bold">
              C
            </div>

            {!collapsed && (
              <div>
                <p className="font-semibold text-base-100">
               Circuit 
                </p>
                {/* <p className="text-xs text-base-100">
                  Management
                </p> */}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Mobile Close */}
            <button
              onClick={onClose}
              className="btn btn-ghost btn-xs lg:hidden text-base-100"
            >
              <MdClose />
            </button>

            {/* Collapse */}
           <button
                className="btn btn-ghost btn-xs border border-primary-content/40 rounded-md p-1 hidden lg:flex text-primary-content ml-1 hover:bg-primary-content/10"
                onClick={() => setCollapsed(!collapsed)}
              >
                <MdChevronLeft
                  className={`transition-transform ${
                    collapsed ? "rotate-180" : ""
                  }`}
                />
              </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={linkClass}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {/* <div className="border-t border-base-300 p-3">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-9 rounded-full">
                <img
                  src={
                    user?.imageUrl ||
                    "https://i.pravatar.cc/100"
                  }
                  alt="user"
                />
              </div>
            </div>

            {!collapsed && (
              <div>
                <p className="text-sm font-semibold text-base-100">
                  {user?.name}
                </p>
                <p className="text-xs text-base-100 capitalize">
                  {user?.role}
                </p>
              </div>
            )}
          </div>
        </div> */}
      </aside>
    </>
  );
}