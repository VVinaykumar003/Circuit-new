import { useEffect, useState, type JSX } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
} from "react-icons/md";
import { FolderKanban, UserPlus } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useActivities } from "@/hooks/useActivities";

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

export default function ERPSidebar({ isOpen, onClose }: Props) {
  const { auth } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const { activities } = useActivities();
  const lastVisitedProjects = localStorage.getItem("lastVisited_projects");
  const lastVisitedWorkUpdates = localStorage.getItem(
    "lastVisited_workUpdates",
  );
  const lastVisitedTasks = localStorage.getItem("lastVisited_tasks");
  const lastVisitedLeaves = localStorage.getItem("lastVisited_leaves");
  const lastVisitedMembers = localStorage.getItem("lastVisited_members");
  const projectCreatedDot = (activities || []).some(
    (a) =>
      a.referenceModel === "Project" &&
      a.action === "Project Created" &&
      (!lastVisitedProjects ||
        new Date(a.createdAt) > new Date(lastVisitedProjects)),
  );
  // console.log("Activities for Projects:", projectCreatedDot);
  const workUpdateDot = (activities || []).some(
    (a) =>
      a.referenceModel === "WorkUpdateModel" &&
      (!lastVisitedWorkUpdates ||
        new Date(a.createdAt) > new Date(lastVisitedWorkUpdates)),
  );
  const taskDot = (activities || []).some(
    (a) =>
      a.referenceModel === "Task" &&
      (!lastVisitedTasks || new Date(a.createdAt) > new Date(lastVisitedTasks)),
  );

  const leaveDot = (activities || []).some(
    (a) =>
      a.referenceModel === "Leave" &&
      (!lastVisitedLeaves ||
        new Date(a.createdAt) > new Date(lastVisitedLeaves)),
  );

  const memberDot = (activities || []).some(
    (a) =>
      a.referenceModel === "User" && // ya "Member" (backend check karna)
      a.action?.toLowerCase().includes("add") &&
      (!lastVisitedMembers ||
        new Date(a.createdAt) > new Date(lastVisitedMembers)),
  );
  const projectDot = projectCreatedDot || workUpdateDot;
  // console.log("Activities for Work Updates:", workUpdateDot);
  // console.log("Activities:", activities);
  const user = auth?.user;
  const isManagement = ["admin", "owner", "manager"].includes(user?.role || "");
  const location = useLocation();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
      isActive
        ? "bg-base-300 font-semibold text-base-content"
        : "text-primary-content hover:bg-base-300 hover:text-base-content",
    ].join(" ");

  const isPayrollActive = location.pathname.startsWith("/payroll");
  const isTeamActive =
    location.pathname.startsWith("/members") ||
    location.pathname.startsWith("/addMember");
  const isProjectsActive =
    location.pathname.startsWith("/projects") ||
    location.pathname.startsWith("/createProject");
  

  /* ================= FIX 2: RESET WHEN SIDEBAR CLOSES ================= */
  useEffect(() => {
    if (!isOpen) {
      setPayrollOpen(false);
      setTeamOpen(false);
      setProjectsOpen(false);
    }
  }, [isOpen]);
  return (
    <>
      <div
        onClick={onClose}
        className={`
            fixed inset-0 bg-black/40 z-40 lg:hidden
            transition-opacity duration-300
            ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
          `}
      />
      {/* <aside
        className={`
    h-screen bg-base-200 border-r border-base-300 flex flex-col
    transition-all duration-300 ease-in-out
    ${collapsed ? "w-25" : "w-64"}
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      > */}

      <aside
        className={`
            fixed lg:static
            top-0 left-0
            z-50
            h-screen bg-primary border-r border-base-300 flex flex-col
            transition-all duration-300 ease-in-out
            ${collapsed ? "w-20" : "w-64"}
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
             overflow-hidden   
          `}
      >
        {/* HEADER */}
        {/* <div className="flex items-center gap-3 px-4 py-4 border border-base-300 text-base-content border-b-white"> */}
        <div className="flex items-center w-full px-1.5 py-3 border-b border-base-300">
          <div className="flex items-center w-full">
            {/* LEFT */}
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

            {/* RIGHT */}
            <div className="ml-auto flex items-center gap-2">
              {/* CLOSE (mobile) */}
              <button
                className="btn btn-ghost btn-xs lg:hidden text-base-100"
                onClick={onClose}
              >
                <MdClose />
              </button>

              {/* COLLAPSE */}
              <button
                className="btn btn-ghost btn-xs border border-primary-content/40 rounded-md p-1 hidden lg:flex text-primary-content hover:bg-primary-content/10"
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
          {/* <div
            className={`w-9 p-1 h-9 rounded-lg bg-base-100 text-primary flex items-center justify-center font-bold text-lg transition-all duration-300 ease-in-out ${collapsed ? "w-9" : "w-12"}`}
          >
            C
          </div>

          <div
            className={`
            flex-1 overflow-hidden transition-all duration-300 ease-in-out text-base-100
            ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
          `}
          >
            <p className="font-semibold text-base-100 whitespace-nowrap">
              Circuit
            </p>
            <p className="text-xs text-base-100 whitespace-nowrap">
              Office ERP
            </p>
          </div>

          <button
            className="text-lg btn btn-ghost btn-xs border-2  rounded-ee-none flex items-center justify-center lg:hidden  border-base-content"
            onClick={onClose}
          >
            <MdClose
              className={`transition-transform 
              `}
            />
          </button>

          <button
            className="btn btn-ghost btn-xs border-2 rounded-md p-1 hidden lg:flex border-primary-content text-primary-content shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            <MdChevronLeft
              className={`transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button> */}
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6 text-base-content">
          {/* CORE */}
          <div>
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase text-primary-content">
                Core
              </p>
            )}

            <div className="space-y-1 ">
              {coreMenu.map((item) => (
                <NavLink key={item.id} to={item.path}   onClick={onClose} className={linkClass}>
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}

              {/* PROJECTS DROPDOWN */}
              {user?.role === "admin" || user?.role === "owner" ? (
                <>
                  <button
                    onClick={() => {
                      setProjectsOpen(!projectsOpen);
                    }}
                    className={`relative flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-all ${
                      isProjectsActive
                        ? "bg-base-300 font-semibold text-base-content"
                        : "text-primary-content hover:bg-base-300 hover:text-base-content"
                    }`}
                  >
                    <MdWorkspaces size={20} />
                    {projectDot && !projectsOpen && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-red-500 rounded-full z-50" />
                    )}
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">Projects</span>
                        <MdExpandMore
                          className={`transition-transform duration-300 ${
                            projectsOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>
<div
  className={`
    transition-all duration-300 ease-in-out
    ${projectsOpen ? "block mt-1" : "hidden"}
  `}
>
                    {/* <div className="ml-8 space-y-1 pb-1"> */}
                    <div
                      className={`space-y-1 pb-1 ${
                        collapsed ? "ml-0 flex flex-col items-center" : "ml-8"
                      }`}
                    >
                      {projectsSubMenu.map((item) => (
                        <NavLink
                        
                          key={item.id}
                          to={item.path}
                          className={(props) => `${linkClass(props)} relative`}
                          onClick={() => {
                            if (item.id === "projects") {
                              localStorage.setItem(
                                "lastVisited_projects",
                                new Date().toISOString(),
                              );
                            }
                            if (item.id === "workUpdates") {
                              localStorage.setItem(
                                "lastVisited_workUpdates",
                                new Date().toISOString(),
                              );
                            }
                              onClose()
                          }
                        }
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
                  {/* <NavLink to="/projects"  className={`${linkClass} relative`}>
                    <MdWorkspaces size={20} />
                    {!collapsed && <span>Projects</span>}
                      {projectCreatedDot && <span className="absolute top-1 right-2 h-2 w-2 bg-red-500 rounded-full" />}
                  </NavLink> */}

                  <NavLink
                    to="/projects"
                    onClick={() => {
                      localStorage.setItem(
                        "lastVisited_projects",
                        new Date().toISOString(),
                      );
                        onClose()
                    }

                  }
                    className={(props) => `${linkClass(props)} relative`}
                  >
                    <MdWorkspaces size={20} />
                    {!collapsed && <span>Projects</span>}

                    {projectCreatedDot && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-red-500 rounded-full z-50" />
                    )}
                  </NavLink>
                  <NavLink
                    onClick={() => {
                      localStorage.setItem(
                        "lastVisited_workUpdates",
                        new Date().toISOString(),
                      );
                        onClose()
                    }}
                    to="/work-updates"
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
                      className={`relative flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-all ${
                        isTeamActive
                          ? "bg-base-300 font-semibold text-base-content"
                          : "text-primary-content hover:bg-base-300 hover:text-base-content"
                      }`}
                    >
                      <MdPeople size={20} />
                      {memberDot && !teamOpen && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-red-500 rounded-full" />
                      )}

                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">Team</span>
                          <MdExpandMore
                            className={`transition-transform duration-300 ${
                              teamOpen ? "rotate-180" : ""
                            }`}
                          />
                        </>
                      )}
                    </button>

                    <div
                      className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${
                        teamOpen
                          ? "max-h-40 opacity-100 mt-1"
                          : "max-h-0 opacity-0"
                      }
                    `}
                    >
                      {/* <div className="ml-8 space-y-1 pb-1"> */}
                      <div
                        className={`space-y-1 pb-1 ${
                          collapsed ? "ml-0 flex flex-col items-center" : "ml-8"
                        }`}
                      >
                        {teamSubMenu.map((item) => (
                          <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={() => {
                              if (item.id === "members") {
                                localStorage.setItem(
                                  "lastVisited_members",
                                  new Date().toISOString(),
                                );
                              }
                                onClose()
                            }}
                            className={(props) =>
                              `${linkClass(props)} relative`
                            }
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
                      localStorage.setItem(
                        "lastVisited_members",
                        new Date().toISOString(),
                      );
                      onClose()
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
                    if (item.id === "tasks") {
                      localStorage.setItem(
                        "lastVisited_tasks",
                        new Date().toISOString(),
                      );
                    }
                    if (item.id === "leaves") {
                      localStorage.setItem(
                        "lastVisited_leaves",
                        new Date().toISOString(),
                      );
                    }
                    onClose()
                  }}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}

                  {/* DOTS */}
                  {item.id === "tasks" && taskDot && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full" />
                  )}

                  {item.id === "leaves" && leaveDot && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </NavLink>
              ))}

              {/* PAYROLL / MY SALARY SECTION */}
              {isManagement ? (
                <>
                  {/* PAYROLL PARENT */}
                  <button
                    onClick={() => setPayrollOpen(!payrollOpen)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-all  ${
                      isPayrollActive
                        ? "bg-base-300 font-semibold text-base-content"
                        : "text-primary-content hover:bg-base-300 hover:text-base-content"
                    }`}
                  >
                    <MdPayments size={20} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">Payroll</span>
                        <MdExpandMore
                          className={`transition-transform duration-300 ${
                            payrollOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {/* PAYROLL SUBMENU */}
                  <div
                    className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${
                        payrollOpen
                          ? "max-h-40 opacity-100 mt-1"
                          : "max-h-0 opacity-0"
                      }
                    `}
                  >
                    {/* <div className="ml-8 space-y-1 pb-1"> */}
                    <div
                      className={`space-y-1 pb-1 ${
                        collapsed ? "ml-0 flex flex-col items-center" : "ml-8"
                      }`}
                    >
                      {payrollSubMenu.map((item) => (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          className={linkClass}
                          onClick={()=>{
                            onClose();
                          }}
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
        </nav>

        {/* FOOTER */}
        <div className="border-t border-base-300 p-3">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-9 flex items-center justify-center">
                <img
                  src={user?.imageUrl || "https://i.pravatar.cc/100?img=12"}
                  alt="User"
                />
                {/* {
                 user?.name ? user.name.charAt(0).toUpperCase() : "U"
               } */}
              </div>
            </div>

            {!collapsed && (
              <div>
                <p className="text-sm font-semibold text-base-100">
                  {" "}
                  {user?.name || "User Name"}
                </p>
                <p className="text-xs text-base-100 capitalize ">
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
