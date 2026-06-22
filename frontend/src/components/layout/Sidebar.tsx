import { useEffect, useState, type JSX } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdEventAvailable,
  MdWorkspaces,
  MdPeople,
  MdTask,
  MdChevronLeft,
  MdExpandMore,
  MdPayments,
  MdReceiptLong,
  MdHistory,
  MdNotifications,
  MdClose,
  MdWallet,
  MdStorefront,
  MdShoppingCart,
  MdTrendingUp,
  MdContactPage,
  MdBusiness,
  MdSupportAgent,
  MdAdminPanelSettings,
} from "react-icons/md";
import { FolderKanban, UserPlus, Target, PhoneCall } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useActivities } from "@/hooks/useActivities";

/* ─────────────────────────── types ─────────────────────────── */
type Department = "erp" | "sales";

type MenuItem = {
  id: string;
  label: string;
  path: string;
  icon: JSX.Element;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/* ─────────────────────────── ERP menus ─────────────────────── */
const coreMenu: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: <MdDashboard size={20} />,
  },
  {
    id: "attendance",
    label: "Attendance",
    path: "/attendance",
    icon: <MdEventAvailable size={20} />,
  },
];

const managementMenu: MenuItem[] = [
  { id: "tasks", label: "Tasks", path: "/tasks", icon: <MdTask size={20} /> },
  {
    id: "leaves",
    label: "Leaves",
    path: "/leaves",
    icon: <MdTask size={20} />,
  },
  {
    id: "notifications",
    label: "Notifications",
    path: "/notifications",
    icon: <MdNotifications size={20} />,
  },
];

const teamSubMenu: MenuItem[] = [
  {
    id: "members",
    label: "Members",
    path: "/members",
    icon: <MdPeople size={18} />,
  },
  {
    id: "addMember",
    label: "Add Member",
    path: "/addMember",
    icon: <UserPlus size={18} />,
  },
];

const projectsSubMenu: MenuItem[] = [
  {
    id: "projects",
    label: "Projects",
    path: "/projects",
    icon: <MdWorkspaces size={18} />,
  },
  {
    id: "createProject",
    label: "Create Project",
    path: "/createProject",
    icon: <FolderKanban size={18} />,
  },
  {
    id: "workUpdates",
    label: "Work Updates",
    path: "/work-updates",
    icon: <MdWorkspaces size={20} />,
  },
];

const payrollSubMenu: MenuItem[] = [
  {
    id: "payroll-dashboard",
    label: "Payroll Dashboard",
    path: "/payroll/dashboard",
    icon: <MdWallet size={18} />,
  },
  {
    id: "salary-structure",
    label: "Salary Structure",
    path: "/payroll/salary-structure",
    icon: <MdPayments size={18} />,
  },
  {
    id: "generate-payslips",
    label: "Generate Payslips",
    path: "/payroll/generate",
    icon: <MdReceiptLong size={18} />,
  },
  {
    id: "payroll-history",
    label: "Payroll History",
    path: "/payroll/history",
    icon: <MdHistory size={18} />,
  },
];

/* ─────────────────────────── Sales menus ───────────────────── */
const salesCoreMenu: MenuItem[] = [
  {
    id: "sales-dashboard",
    label: "Dashboard",
    path: "/sales",
    icon: <MdDashboard size={20} />,
  },
];

const salesProductsSubMenu: MenuItem[] = [
  {
    id: "sales-products",
    label: "Products",
    path: "/sales/products",
    icon: <MdStorefront size={18} />,
  },
  {
    id: "sales-add-product",
    label: "Add Product",
    path: "/sales/products/new",
    icon: <MdStorefront size={18} />,
  },
];

const salesOrdersSubMenu: MenuItem[] = [
  {
    id: "sales-orders-all",
    label: "All Orders",
    path: "/sales/orders",
    icon: <MdShoppingCart size={18} />,
  },
  {
    id: "sales-orders-pending",
    label: "Pending Orders",
    path: "/sales/orders/pending",
    icon: <MdShoppingCart size={18} />,
  },
  {
    id: "sales-orders-new",
    label: "New Order",
    path: "/sales/orders/new",
    icon: <MdShoppingCart size={18} />,
  },
];

const salesRepsSubMenu: MenuItem[] = [
  {
    id: "sales-reps-all",
    label: "All Reps",
    path: "/sales/representatives/all",
    icon: <MdPeople size={18} />,
  },
  {
    id: "sales-reps-add",
    label: "Add Rep",
    path: "/sales/representatives/new",
    icon: <UserPlus size={18} />,
  },
];

const salesLeadSubMenu: MenuItem[] = [
  {
    id: "sales-leads-all",
    label: "All Leads",
    path: "/sales/leads",
    icon: <Target size={18} />,
  },
  {
    id: "sales-leads-new",
    label: "New Lead",
    path: "/sales/leads/new",
    icon: <Target size={18} />,
  },
];

const salesAccountSubMenu: MenuItem[] = [
  {
    id: "sales-accounts-all",
    label: "All Accounts",
    path: "/sales/accounts",
    icon: <MdBusiness size={18} />,
  },
  {
    id: "sales-accounts-new",
    label: "New Account",
    path: "/sales/accounts/new",
    icon: <MdBusiness size={18} />,
  },
];

const salesContactSubMenu: MenuItem[] = [
  {
    id: "sales-contacts-all",
    label: "All Contacts",
    path: "/sales/contacts",
    icon: <MdContactPage size={18} />,
  },
  {
    id: "sales-contacts-new",
    label: "New Contact",
    path: "/sales/contacts/new",
    icon: <PhoneCall size={18} />,
  },
];

const salesTaskSubMenu: MenuItem[] = [
  {
    id: "sales-tasks-all",
    label: "All Tasks",
    path: "/sales/tasks",
    icon: <MdTask size={18} />,
  },
  {
    id: "sales-tasks-new",
    label: "New Task",
    path: "/sales/tasks/new",
    icon: <MdTask size={18} />,
  },
];

const salesCaseSubMenu: MenuItem[] = [
  {
    id: "sales-cases-all",
    label: "All Cases",
    path: "/sales/cases",
    icon: <MdSupportAgent size={18} />,
  },
  {
    id: "sales-cases-new",
    label: "New Case",
    path: "/sales/cases/new",
    icon: <MdSupportAgent size={18} />,
  },
];

const salesForecastSubMenu: MenuItem[] = [
  {
    id: "sales-forecast-overview",
    label: "Overview",
    path: "/sales/forecast",
    icon: <MdTrendingUp size={18} />,
  },
  {
    id: "sales-forecast-add",
    label: "Add Forecast",
    path: "/sales/forecast/new",
    icon: <MdTrendingUp size={18} />,
  },
];

const salesAdminSubMenu: MenuItem[] = [
  {
    id: "sales-admin-panel",
    label: "Panel",
    path: "/sales/admin",
    icon: <MdAdminPanelSettings size={18} />,
  },
  {
    id: "sales-admin-settings",
    label: "Settings",
    path: "/sales/admin/settings",
    icon: <MdAdminPanelSettings size={18} />,
  },
];

/* ─────────────────────────── component ─────────────────────── */
export default function ERPSidebar({ isOpen, onClose }: Props) {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Department state — persisted so page refresh keeps the selection
  const [department, setDepartment] = useState<Department>(() => {
    return (localStorage.getItem("selected_department") as Department) || "erp";
  });

  // ERP submenus
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);

  // Sales submenus
  const [salesProductsOpen, setSalesProductsOpen] = useState(false);
  const [salesOrdersOpen, setSalesOrdersOpen] = useState(false);
  const [salesRepsOpen, setSalesRepsOpen] = useState(false);
  const [salesLeadOpen, setSalesLeadOpen] = useState(false);
  const [salesAccountOpen, setSalesAccountOpen] = useState(false);
  const [salesContactOpen, setSalesContactOpen] = useState(false);
  const [salesTaskOpen, setSalesTaskOpen] = useState(false);
  const [salesCaseOpen, setSalesCaseOpen] = useState(false);
  const [salesForecastOpen, setSalesForecastOpen] = useState(false);
  const [salesAdminOpen, setSalesAdminOpen] = useState(false);

  const { activities } = useActivities();

  /* ── activity dot logic (unchanged from original) ── */
  const lastVisitedProjects = localStorage.getItem("lastVisited_projects");
  const lastVisitedWorkUpdates = localStorage.getItem("lastVisited_workUpdates");
  const lastVisitedTasks = localStorage.getItem("lastVisited_tasks");
  const lastVisitedLeaves = localStorage.getItem("lastVisited_leaves");
  const lastVisitedMembers = localStorage.getItem("lastVisited_members");

  const projectCreatedDot = (activities || []).some(
    (a) =>
      a.referenceModel === "Project" &&
      a.action === "Project Created" &&
      (!lastVisitedProjects || new Date(a.createdAt) > new Date(lastVisitedProjects))
  );
  const workUpdateDot = (activities || []).some(
    (a) =>
      a.referenceModel === "WorkUpdateModel" &&
      (!lastVisitedWorkUpdates || new Date(a.createdAt) > new Date(lastVisitedWorkUpdates))
  );
  const taskDot = (activities || []).some(
    (a) =>
      a.referenceModel === "Task" &&
      (!lastVisitedTasks || new Date(a.createdAt) > new Date(lastVisitedTasks))
  );
  const leaveDot = (activities || []).some(
    (a) =>
      a.referenceModel === "Leave" &&
      (!lastVisitedLeaves || new Date(a.createdAt) > new Date(lastVisitedLeaves))
  );
  const memberDot = (activities || []).some(
    (a) =>
      a.referenceModel === "User" &&
      a.action?.toLowerCase().includes("add") &&
      (!lastVisitedMembers || new Date(a.createdAt) > new Date(lastVisitedMembers))
  );
  const projectDot = projectCreatedDot || workUpdateDot;

  const user = auth?.user;
  const isManagement = ["admin", "owner", "manager"].includes(user?.role || "");
  const location = useLocation();

  /* ── enforce department for non-management employees ── */
  useEffect(() => {
    if (user && !isManagement) {
      const userDept = (user.department === "sales" ? "sales" : "erp") as Department;
      if (department !== userDept) {
        setDepartment(userDept);
        localStorage.setItem("selected_department", userDept);
      }
    }
  }, [user, isManagement, department]);

  /* ── nav link class helper ── */
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
      isActive
        ? "bg-base-300 font-semibold text-base-content"
        : "text-primary-content hover:bg-base-300 hover:text-base-content",
    ].join(" ");

  /* ── active route checks ── */
  const isPayrollActive = location.pathname.startsWith("/payroll");
  const isTeamActive =
    location.pathname.startsWith("/members") ||
    location.pathname.startsWith("/addMember");
  const isProjectsActive =
    location.pathname.startsWith("/projects") ||
    location.pathname.startsWith("/createProject");

  /* ── reset submenus when sidebar closes ── */
  useEffect(() => {
    if (!isOpen) {
      setPayrollOpen(false);
      setTeamOpen(false);
      setProjectsOpen(false);
      setSalesProductsOpen(false);
      setSalesOrdersOpen(false);
      setSalesRepsOpen(false);
      setSalesLeadOpen(false);
      setSalesAccountOpen(false);
      setSalesContactOpen(false);
      setSalesTaskOpen(false);
      setSalesCaseOpen(false);
      setSalesForecastOpen(false);
      setSalesAdminOpen(false);
    }
  }, [isOpen]);

  /* ── department switch ── */
  const handleDeptSwitch = (dept: Department) => {
    setDepartment(dept);
    localStorage.setItem("selected_department", dept);
    navigate(dept === "sales" ? "/sales" : "/");
    onClose();
  };

  /* ── shared submenu button styles ── */
  const dropdownBtnClass = (isActive: boolean) =>
    `relative flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-all ${
      isActive
        ? "bg-base-300 font-semibold text-base-content"
        : "text-primary-content hover:bg-base-300 hover:text-base-content"
    }`;

  const submenuWrapClass = (open: boolean) =>
    `overflow-hidden transition-all duration-300 ease-in-out ${
      open ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"
    }`;

  const submenuInnerClass = (collapsed: boolean) =>
    `space-y-1 pb-1 ${collapsed ? "ml-0 flex flex-col items-center" : "ml-8"}`;

  /* ── reusable sub-item renderer ── */
  const renderSubMenu = (
    items: MenuItem[],
    open: boolean,
    onItemClick?: (id: string) => void
  ) => (
    <div className={submenuWrapClass(open)}>
      <div className={submenuInnerClass(collapsed)}>
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={(props) => `${linkClass(props)} relative`}
            onClick={() => {
              onItemClick?.(item.id);
              onClose();
            }}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );

  /* ────────────────────────── render ────────────────────────── */
  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen bg-primary border-r border-base-300 flex flex-col
          transition-all duration-300 ease-in-out overflow-hidden
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center w-full px-1.5 py-3 border-b border-base-300">
          <div className="flex items-center w-full">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-base-100 text-primary flex items-center justify-center font-bold">
                C
              </div>
              {!collapsed && (
                <div className="text-base-100">
                  <p className="font-semibold">Circuit</p>
                  <p className="text-xs">Office ERP</p>
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                className="btn btn-ghost btn-xs lg:hidden text-base-100"
                onClick={onClose}
              >
                <MdClose />
              </button>
              <button
                className="btn btn-ghost btn-xs border border-primary-content/40 rounded-md p-1 hidden lg:flex text-primary-content hover:bg-primary-content/10"
                onClick={() => setCollapsed(!collapsed)}
              >
                <MdChevronLeft
                  className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── DEPARTMENT SWITCHER ── */}
        {!collapsed && isManagement && (
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold uppercase text-primary-content/50 mb-2 px-1">
              Department
            </p>
            <div className="flex gap-2">
              {/* ERP pill */}
              <button
                onClick={() => handleDeptSwitch("erp")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  department === "erp"
                    ? "bg-blue-500/20 border-blue-400/50 text-blue-300"
                    : "bg-white/5 border-white/10 text-primary-content/50 hover:bg-white/10 hover:text-primary-content"
                }`}
              >
                <MdDashboard size={13} />
                ERP
              </button>
              {/* Sales pill */}
              <button
                onClick={() => handleDeptSwitch("sales")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  department === "sales"
                    ? "bg-violet-500/20 border-violet-400/50 text-violet-300"
                    : "bg-white/5 border-white/10 text-primary-content/50 hover:bg-white/10 hover:text-primary-content"
                }`}
              >
                <MdTrendingUp size={13} />
                Sales
              </button>
            </div>
          </div>
        )}

        {/* ── NAV ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6 text-base-content">

          {/* ════════════ ERP NAV ════════════ */}
          {department === "erp" && (
            <>
              {/* CORE */}
              <div>
                {!collapsed && (
                  <p className="px-3 mb-2 text-xs font-semibold uppercase text-primary-content">
                    Core
                  </p>
                )}
                <div className="space-y-1">
                  {coreMenu.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={onClose}
                      className={linkClass}
                    >
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  ))}

                  {/* PROJECTS DROPDOWN */}
                  {user?.role === "admin" || user?.role === "owner" ? (
                    <>
                      <button
                        onClick={() => setProjectsOpen(!projectsOpen)}
                        className={dropdownBtnClass(isProjectsActive)}
                      >
                        <MdWorkspaces size={20} />
                        {projectDot && !projectsOpen && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-red-500 rounded-full z-50" />
                        )}
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Projects</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${projectsOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      <div className={projectsOpen ? "block mt-1" : "hidden"}>
                        <div className={submenuInnerClass(collapsed)}>
                          {projectsSubMenu.map((item) => (
                            <NavLink
                              key={item.id}
                              to={item.path}
                              className={(props) => `${linkClass(props)} relative`}
                              onClick={() => {
                                if (item.id === "projects")
                                  localStorage.setItem("lastVisited_projects", new Date().toISOString());
                                if (item.id === "workUpdates")
                                  localStorage.setItem("lastVisited_workUpdates", new Date().toISOString());
                                onClose();
                              }}
                            >
                              {item.icon}
                              {!collapsed && <span>{item.label}</span>}
                              {item.id === "projects" && projectCreatedDot && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full" />
                              )}
                              {item.id === "workUpdates" && workUpdateDot && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full" />
                              )}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/projects"
                        onClick={() => {
                          localStorage.setItem("lastVisited_projects", new Date().toISOString());
                          onClose();
                        }}
                        className={(props) => `${linkClass(props)} relative`}
                      >
                        <MdWorkspaces size={20} />
                        {!collapsed && <span>Projects</span>}
                        {projectCreatedDot && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-red-500 rounded-full z-50" />
                        )}
                      </NavLink>
                      <NavLink
                        to="/work-updates"
                        onClick={() => {
                          localStorage.setItem("lastVisited_workUpdates", new Date().toISOString());
                          onClose();
                        }}
                        className={linkClass}
                      >
                        <MdWorkspaces size={20} />
                        {!collapsed && <span>Work Updates</span>}
                        {workUpdateDot && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-red-500 rounded-full z-50" />
                        )}
                      </NavLink>
                    </>
                  )}
                </div>
              </div>

              {/* MANAGEMENT */}
              <div>
                {!collapsed && (
                  <p className="px-3 mb-2 text-xs font-semibold uppercase text-primary-content">
                    Management
                  </p>
                )}
                <div className="space-y-1">
                  {/* TEAM DROPDOWN */}
                  {isManagement &&
                    (user?.role === "admin" || user?.role === "owner" ? (
                      <>
                        <button
                          onClick={() => setTeamOpen(!teamOpen)}
                          className={dropdownBtnClass(isTeamActive)}
                        >
                          <MdPeople size={20} />
                          {memberDot && !teamOpen && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-red-500 rounded-full" />
                          )}
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">Team</span>
                              <MdExpandMore
                                className={`transition-transform duration-300 ${teamOpen ? "rotate-180" : ""}`}
                              />
                            </>
                          )}
                        </button>
                        <div className={submenuWrapClass(teamOpen)}>
                          <div className={submenuInnerClass(collapsed)}>
                            {teamSubMenu.map((item) => (
                              <NavLink
                                key={item.id}
                                to={item.path}
                                onClick={() => {
                                  if (item.id === "members")
                                    localStorage.setItem("lastVisited_members", new Date().toISOString());
                                  onClose();
                                }}
                                className={(props) => `${linkClass(props)} relative`}
                              >
                                {item.icon}
                                {!collapsed && <span>{item.label}</span>}
                                {item.id === "members" && memberDot && (
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full" />
                                )}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <NavLink
                        to="/members"
                        className={(props) => `${linkClass(props)} relative`}
                        onClick={() => {
                          localStorage.setItem("lastVisited_members", new Date().toISOString());
                          onClose();
                        }}
                      >
                        <MdPeople size={20} />
                        {!collapsed && <span>Team</span>}
                        {memberDot && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full" />
                        )}
                      </NavLink>
                    ))}

                  {managementMenu.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={(props) => `${linkClass(props)} relative`}
                      onClick={() => {
                        if (item.id === "tasks")
                          localStorage.setItem("lastVisited_tasks", new Date().toISOString());
                        if (item.id === "leaves")
                          localStorage.setItem("lastVisited_leaves", new Date().toISOString());
                        onClose();
                      }}
                    >
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                      {item.id === "tasks" && taskDot && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full" />
                      )}
                      {item.id === "leaves" && leaveDot && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full" />
                      )}
                    </NavLink>
                  ))}

                  {/* PAYROLL */}
                  {isManagement ? (
                    <>
                      <button
                        onClick={() => setPayrollOpen(!payrollOpen)}
                        className={dropdownBtnClass(isPayrollActive)}
                      >
                        <MdPayments size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Payroll</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${payrollOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      <div className={submenuWrapClass(payrollOpen)}>
                        <div className={submenuInnerClass(collapsed)}>
                          {payrollSubMenu.map((item) => (
                            <NavLink
                              key={item.id}
                              to={item.path}
                              className={linkClass}
                              onClick={onClose}
                            >
                              {item.icon}
                              {!collapsed && <span>{item.label}</span>}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <NavLink to="/my-salary" className={linkClass}>
                      <MdReceiptLong size={20} />
                      {!collapsed && <span>My Salary</span>}
                    </NavLink>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ════════════ SALES NAV ════════════ */}
          {department === "sales" && (
            <>
              {isManagement ? (
                <>
                  {/* OVERVIEW */}
                  <div>
                    {!collapsed && (
                      <p className="px-3 mb-2 text-xs font-semibold uppercase text-primary-content">
                        Overview
                      </p>
                    )}
                    <div className="space-y-1">
                      {salesCoreMenu.map((item) => (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          onClick={onClose}
                          className={linkClass}
                        >
                          {item.icon}
                          {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                      ))}
                    </div>
                  </div>

                  {/* CATALOG */}
                  <div>
                    {!collapsed && (
                      <p className="px-3 mb-2 text-xs font-semibold uppercase text-primary-content">
                        Catalog
                      </p>
                    )}
                    <div className="space-y-1">
                      {/* Products */}
                      <button
                        onClick={() => setSalesProductsOpen(!salesProductsOpen)}
                        className={dropdownBtnClass(location.pathname.startsWith("/sales/products"))}
                      >
                        <MdStorefront size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Products</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${salesProductsOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      {renderSubMenu(salesProductsSubMenu, salesProductsOpen)}
                    </div>
                  </div>

                  {/* ORDERS */}
                  <div>
                    {!collapsed && (
                      <p className="px-3 mb-2 text-xs font-semibold uppercase text-primary-content">
                        Orders
                      </p>
                    )}
                    <div className="space-y-1">
                      {/* Sales Orders */}
                      <button
                        onClick={() => setSalesOrdersOpen(!salesOrdersOpen)}
                        className={dropdownBtnClass(location.pathname.startsWith("/sales/orders"))}
                      >
                        <MdShoppingCart size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Sales Orders</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${salesOrdersOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      {renderSubMenu(salesOrdersSubMenu, salesOrdersOpen)}

                      {/* Sales Reps */}
                      <button
                        onClick={() => setSalesRepsOpen(!salesRepsOpen)}
                        className={dropdownBtnClass(location.pathname.startsWith("/sales/representatives"))}
                      >
                        <MdPeople size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Sales Reps</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${salesRepsOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      {renderSubMenu(salesRepsSubMenu, salesRepsOpen)}
                    </div>
                  </div>

                  {/* CRM */}
                  <div>
                    {!collapsed && (
                      <p className="px-3 mb-2 text-xs font-semibold uppercase text-primary-content">
                        CRM
                      </p>
                    )}
                    <div className="space-y-1">
                      {/* Lead */}
                      <button
                        onClick={() => setSalesLeadOpen(!salesLeadOpen)}
                        className={dropdownBtnClass(location.pathname.startsWith("/sales/leads"))}
                      >
                        <Target size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Lead</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${salesLeadOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      {renderSubMenu(salesLeadSubMenu, salesLeadOpen)}

                      {/* Account */}
                      <button
                        onClick={() => setSalesAccountOpen(!salesAccountOpen)}
                        className={dropdownBtnClass(location.pathname.startsWith("/sales/accounts"))}
                      >
                        <MdBusiness size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Account</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${salesAccountOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      {renderSubMenu(salesAccountSubMenu, salesAccountOpen)}

                      {/* Contact */}
                      <button
                        onClick={() => setSalesContactOpen(!salesContactOpen)}
                        className={dropdownBtnClass(location.pathname.startsWith("/sales/contacts"))}
                      >
                        <MdContactPage size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Contact</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${salesContactOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      {renderSubMenu(salesContactSubMenu, salesContactOpen)}
                    </div>
                  </div>

                  {/* PIPELINE */}
                  <div>
                    {!collapsed && (
                      <p className="px-3 mb-2 text-xs font-semibold uppercase text-primary-content">
                        Pipeline
                      </p>
                    )}
                    <div className="space-y-1">
                      {/* Task */}
                      <button
                        onClick={() => setSalesTaskOpen(!salesTaskOpen)}
                        className={dropdownBtnClass(location.pathname.startsWith("/sales/tasks"))}
                      >
                        <MdTask size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Task</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${salesTaskOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      {renderSubMenu(salesTaskSubMenu, salesTaskOpen)}

                      {/* Case */}
                      <button
                        onClick={() => setSalesCaseOpen(!salesCaseOpen)}
                        className={dropdownBtnClass(location.pathname.startsWith("/sales/cases"))}
                      >
                        <MdSupportAgent size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Case</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${salesCaseOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      {renderSubMenu(salesCaseSubMenu, salesCaseOpen)}

                      {/* Forecast */}
                      <button
                        onClick={() => setSalesForecastOpen(!salesForecastOpen)}
                        className={dropdownBtnClass(location.pathname.startsWith("/sales/forecast"))}
                      >
                        <MdTrendingUp size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Forecast</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${salesForecastOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      {renderSubMenu(salesForecastSubMenu, salesForecastOpen)}
                    </div>
                  </div>

                  {/* SETTINGS 
                  <div>
                    {!collapsed && (
                      <p className="px-3 mb-2 text-xs font-semibold uppercase text-primary-content">
                        Settings
                      </p>
                    )}
                    <div className="space-y-1">
                      <button
                        onClick={() => setSalesAdminOpen(!salesAdminOpen)}
                        className={dropdownBtnClass(location.pathname.startsWith("/sales/admin"))}
                      >
                        <MdAdminPanelSettings size={20} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">Admin</span>
                            <MdExpandMore
                              className={`transition-transform duration-300 ${salesAdminOpen ? "rotate-180" : ""}`}
                          />
                        </>
                      )}
                      </button>
                      {renderSubMenu(salesAdminSubMenu, salesAdminOpen)}
                    </div>
                  </div>*/}
                </>
              ) : (
                /* EMPLOYEE SALES MENU */
                <div>
                  {!collapsed && (
                    <p className="px-3 mb-2 text-xs font-semibold uppercase text-primary-content">
                      My Sales
                    </p>
                  )}
                  <div className="space-y-1">
                    <NavLink to="/sales" onClick={onClose} className={linkClass}>
                      <MdDashboard size={20} />
                      {!collapsed && <span>Dashboard</span>}
                    </NavLink>
                    <NavLink to="/sales/employee-leads" onClick={onClose} className={linkClass}>
                      <Target size={20} />
                      {!collapsed && <span>My Leads</span>}
                    </NavLink>
                    <NavLink to={`/sales/profile/${user?.userId || ""}`} onClick={onClose} className={linkClass}>
                      <MdPeople size={20} />
                      {!collapsed && <span>My Profile</span>}
                    </NavLink>
                    <NavLink to="/sales/contacts" onClick={onClose} className={linkClass}>
                      <MdContactPage size={20} />
                      {!collapsed && <span>Contacts</span>}
                    </NavLink>
                  <NavLink to="/sales/employee/tasks" onClick={onClose} className={linkClass}>
                    <MdTask size={20} />
                    {!collapsed && <span>Tasks</span>}
                  </NavLink>
                  </div>
                </div>
              )}
            </>
          )}
        </nav>

        {/* ── FOOTER ── */}
        <div className="border-t border-base-300 p-3">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-9 flex items-center justify-center">
                <img
                  src={user?.imageUrl || "https://i.pravatar.cc/100?img=12"}
                  alt="User"
                />
              </div>
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-semibold text-base-100">
                  {user?.name || "User Name"}
                </p>
                <p className="text-xs text-base-100 capitalize">
                  {user?.role || "Administrator"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}