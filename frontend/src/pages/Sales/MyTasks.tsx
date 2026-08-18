import React, { useState, useEffect } from "react";
import {
  MdCheckCircle,
  MdSchedule,
  MdWarning,
  MdFlag,
  MdSearch,
  MdFilterList,
  MdViewList,
  MdViewKanban,
  MdCalendarMonth,
  MdClose,
  MdVideoCall,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdArrowForward,
  MdMoreVert,
} from "react-icons/md";
import {
  Target,
  TrendingUp,
  Calendar as CalendarIcon,
  Briefcase,
} from "lucide-react";
import {
  getSalesTaskByEmpId,
  getSalesTaskById,
  updateSalesTask,
} from "@/services/salesTaskServices";
import { useAuth } from "@/auth/AuthContext";

/* ─────────────────────────────────────────────────────────────
   TYPES & INTERFACES
   ───────────────────────────────────────────────────────────── */
type TaskStatus =
  | "Pending"
  | "In Progress"
  | "On Hold"
  | "Completed"
  | "Cancelled";
type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
type TaskType = "Call" | "Meeting" | "Follow Up" | "Email" | "Preparation";

// interface Customer {
//   id: string;
//   name: string;
//   contactPerson: string;
//   phone: string;
//   email: string;
//   region: string;
// }

// interface Meeting {
//   mode: "Online" | "Offline";
//   location?: string;
//   link?: string;
//   startTime: string;
//   reminderTime: string;
// }

// interface Task {
//   id: string;
//   title: string;
//   description: string;
//   type: TaskType;
//   status: TaskStatus;
//   priority: TaskPriority;
//   progress: number;
//   dueDate: string;
//   assignedDate: string;
//   customer: string;
//   contactPerson: number;
//   phone: string;
//   email: string;
//   region: string;
//   expectedDealValue?: number;
//   opportunityStage?: string;
//   probability?: number;
//   meetingMode: "Online" | "Offline";
//   meetingLocation?: string;
//   meetingLink?: string;
//   tags: string[];
//   completedNotes?: string;
// }
interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  category:string;
  lead:string;
  startDate:string;
  closingDate:string;
  dueTime:string;
  communicationType:string;
  dueDate: string;
  outcome:string;
  reminderDateTime:string;
  assignedDate: string;

  customer: string;
  contactPerson: string;
  phone: string;
  email: string;
  region: string;

  expectedDealValue?: number;
  opportunityStage?: string;
  probability?: number;

  meetingMode?: "Online" | "Offline";
  meetingLocation?: string;
  meetingLink?: string;

  followUpDate?: string;
  reasonForDelay?: string;

  completedNotes?: string;
  tags: string[];
}

/* ─────────────────────────────────────────────────────────────
   MOCK DATA SERVICE
   ───────────────────────────────────────────────────────────── */
// const MOCK_CUSTOMERS: Customer[] = [
//   { id: "c1", name: "Acme Corp", contactPerson: "Jane Doe", phone: "+1 234 567 8900", email: "jane@acme.com", region: "North America" },
//   { id: "c2", name: "TechNova", contactPerson: "Mike Smith", phone: "+1 987 654 3210", email: "mike@technova.io", region: "Europe" },
//   { id: "c3", name: "Global Industries", contactPerson: "Sarah Lee", phone: "+44 20 7123 4567", email: "sarah@globalind.co.uk", region: "UK" },
// ];

// const MOCK_TASKS: Task[] = [
//   {
//     id: "t1",
//     title: "Quarterly Review Presentation",
//     description: "Prepare and present the Q3 sales performance review for Acme Corp.",
//     type: "Meeting",
//     status: "Pending",
//     priority: "High",
//     progress: 0,
//     dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
//     assignedDate: new Date(Date.now() - 86400000 * 2).toISOString(),
//     customer: MOCK_CUSTOMERS[0],
//     expectedDealValue: 50000,
//     opportunityStage: "Negotiation",
//     probability: 75,
//     meeting: { mode: "Online", link: "https://zoom.us/j/123456789", startTime: "10:00 AM", reminderTime: "15 mins before" },
//     tags: ["Important", "Q3"],
//   },
//   {
//     id: "t2",
//     title: "Follow up on Enterprise Proposal",
//     description: "Call Mike to discuss the pricing details sent last week.",
//     type: "Call",
//     status: "In Progress",
//     priority: "Urgent",
//     progress: 50,
//     dueDate: new Date().toISOString(), // Today
//     assignedDate: new Date(Date.now() - 86400000 * 5).toISOString(),
//     customer: MOCK_CUSTOMERS[1],
//     expectedDealValue: 120000,
//     opportunityStage: "Closing",
//     probability: 90,
//     tags: ["Follow Up", "Closing"],
//   },
//   {
//     id: "t3",
//     title: "Send Onboarding Documentation",
//     description: "Email the technical integration docs to the engineering team.",
//     type: "Email",
//     status: "Completed",
//     priority: "Medium",
//     progress: 100,
//     dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
//     assignedDate: new Date(Date.now() - 86400000 * 10).toISOString(),
//     customer: MOCK_CUSTOMERS[2],
//     tags: ["Docs", "Onboarding"],
//     completedNotes: "Docs sent successfully. They confirmed receipt.",
//   },
//   {
//     id: "t4",
//     title: "On-site Facility Inspection",
//     description: "Visit the new warehouse to assess deployment requirements.",
//     type: "Meeting",
//     status: "Pending",
//     priority: "Medium",
//     progress: 0,
//     dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
//     assignedDate: new Date().toISOString(),
//     customer: MOCK_CUSTOMERS[0],
//     meeting: { mode: "Offline", location: "123 Industrial Parkway, NY", startTime: "02:00 PM", reminderTime: "1 hour before" },
//     tags: ["Field Visit"],
//   },
//   {
//     id: "t5",
//     title: "Draft Initial Contract",
//     description: "Prepare the MSA for Global Industries.",
//     type: "Preparation",
//     status: "On Hold",
//     priority: "Low",
//     progress: 25,
//     dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
//     assignedDate: new Date().toISOString(),
//     customer: MOCK_CUSTOMERS[2],
//     tags: ["Legal"],
//   },
// ];

/* ─────────────────────────────────────────────────────────────
   UTILITY COMPONENTS & FORMATTERS
   ───────────────────────────────────────────────────────────── */
const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case "Urgent":
      return "text-error bg-error/10 border-error/20";
    case "High":
      return "text-warning bg-warning/10 border-warning/20";
    case "Medium":
      return "text-info bg-info/10 border-info/20";
    case "Low":
      return "text-base-content/60 bg-base-200 border-base-300";
  }
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case "Completed":
      return "text-success bg-success/10 border-success/20";
    case "In Progress":
      return "text-primary bg-primary/10 border-primary/20";
    case "On Hold":
      return "text-warning bg-warning/10 border-warning/20";
    case "Cancelled":
      return "text-error bg-error/10 border-error/20";
    default:
      return "text-base-content/70 bg-base-200 border-base-300";
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatCurrency = (amount?: number) => {
  if (amount === undefined) return "--";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<"List" | "Board" | "Calendar">(
    "List",
  );
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState("All Tasks");
  // Modals state
  const [isCompleteModalOpen, setCompleteModalOpen] = useState(false);
  const [isDelayModalOpen, setDelayModalOpen] = useState(false);

  // Filter logic
  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase()),
  );

  // Stats
  const todayTasks = tasks.filter(
    (t) => new Date(t.dueDate).toDateString() === new Date().toDateString(),
  );
  const overdueTasks = tasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "Completed",
  );
  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const completionRate = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  /* ── Actions ── */
const handleStatusChange = async (
  taskId: string,
  newStatus: TaskStatus
) => {
  try {
    await updateSalesTask(
      taskId,
      {
        status: newStatus,
        progress: newStatus === "Completed" ? 100 : undefined,
      },
      slug
    );

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              progress:
                newStatus === "Completed" ? 100 : t.progress,
            }
          : t
      )
    );
  } catch (err) {
    console.error(err);
  }
};
  const { auth } = useAuth();
  const slug = auth?.slug;
  console.log(auth);
  const fetchTasks = async (filter = "All Tasks") => {
    if (!slug) return;
    try {
      let params = {};

      switch (filter) {
        case "Today":
          params = { filter: "today" };
          break;

        case "High Priority":
          params = { priority: "High" };
          break;

        case "Pending":
          params = { status: "Pending" };
          break;

        default:
          params = {};
      }

      const response = await getSalesTaskByEmpId(slug, params);
      console.log(response);
      // const normalizedTasks = response.tasks.map((t: any) => ({
      //   id: t._id, // IMPORTANT FIX
      //   title: t.title,
      //   description: t.description,
      //   type: t.type,
      //   status: t.status,
      //   priority: t.priority,
      //   progress: t.progress || 0,
      //   dueDate: t.dueDate,
      //   assignedDate: t.createdAt,
      //   customer: t.customer || { name: "Unknown Customer" },
      //   expectedDealValue: t.expectedDealValue,
      //   opportunityStage: t.opportunityStage,
      //   probability: t.probability,
      //   meeting: t.meeting,
      //   tags: t.tags || [],
      //   completedNotes: t.completedNotes,
      // }));
const normalizedTasks = response.tasks.map((t: any) => ({
  id: t._id,
  title: t.title,
  description: t.description,
  type: t.type,
  status: t.status,
  priority: t.priority,
  progress: t.progress ?? 0,

  dueDate: t.dueDate,
  assignedDate: t.startDate,

  customer: t.customer,
  contactPerson: t.contactPerson,
  phone: t.phone,
  email: t.email,
  region: t.region,

  expectedDealValue: t.expectedDealValue,
  opportunityStage: t.opportunityStage,
  probability: t.probability,

  meetingMode: t.meetingMode,
  meetingLocation: t.meetingLocation,
  meetingLink: t.meetingLink,

  followUpDate: t.followUpDate,
  reasonForDelay: t.reasonForDelay,

  completionNotes: t.completionNotes,
  tags: t.tags ?? [],
}));
      setTasks(normalizedTasks);

      // setTasks(response.tasks);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchTasks();
    }
  }, [slug]);
  const handleProgressChange = (taskId: string, progress: number) => {
    // setTasks(tasks.map(t => {
    //   if (t.id === taskId) {
    //     return { ...t, progress, status: progress === 100 ? "Completed" : (t.status === "Pending" && progress > 0 ? "In Progress" : t.status) };
    //   }
    //   return t;
    // }));

    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              progress,
              status:
                progress === 100
                  ? "Completed"
                  : t.status === "Pending" && progress > 0
                    ? "In Progress"
                    : t.status,
            }
          : t,
      );

      // sync drawer
      if (selectedTask?.id === taskId) {
        const updatedTask = updated.find((t) => t.id === taskId);
        if (updatedTask) setSelectedTask(updatedTask);
      }

      return updated;
    });
  };

  /* ─────────────────────────────────────────────────────────────
     SUB-COMPONENTS
     ───────────────────────────────────────────────────────────── */

  // 1. STATS KPI HEADER
  const KPIHeader = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="card-body p-4 flex flex-row items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <MdSchedule size={24} />
          </div>
          <div>
            <p className="text-base-content/60 text-xs font-semibold uppercase tracking-wider">
              Today's Tasks
            </p>
            <p className="text-2xl font-bold text-base-content">
              {todayTasks.length}
            </p>
          </div>
        </div>
      </div>
      <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="card-body p-4 flex flex-row items-center gap-4">
          <div className="p-3 bg-warning/10 text-warning rounded-xl">
            <MdWarning size={24} />
          </div>
          <div>
            <p className="text-base-content/60 text-xs font-semibold uppercase tracking-wider">
              Due Soon
            </p>
            <p className="text-2xl font-bold text-base-content">
              {
                tasks.filter(
                  (t) => t.status !== "Completed" && t.status !== "Cancelled",
                ).length
              }
            </p>
          </div>
        </div>
      </div>
      <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="card-body p-4 flex flex-row items-center gap-4">
          <div className="p-3 bg-error/10 text-error rounded-xl">
            <MdFlag size={24} />
          </div>
          <div>
            <p className="text-base-content/60 text-xs font-semibold uppercase tracking-wider">
              Overdue
            </p>
            <p className="text-2xl font-bold text-base-content">
              {overdueTasks.length}
            </p>
          </div>
        </div>
      </div>
      <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="card-body p-4 flex flex-row items-center gap-4">
          <div className="p-3 bg-success/10 text-success rounded-xl">
            <MdCheckCircle size={24} />
          </div>
          <div>
            <p className="text-base-content/60 text-xs font-semibold uppercase tracking-wider">
              Completion
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-base-content">
                {completionRate}%
              </p>
              <progress
                className="progress progress-success w-16"
                value={completionRate}
                max="100"
              ></progress>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. LIST VIEW
  const ListView = () => (
    <div className="space-y-3">
      {filteredTasks.length === 0 ? (
        <EmptyState />
      ) : (
        filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className={`group bg-base-100 border border-base-200 hover:border-primary/30 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4 ${task.status === "Completed" ? "opacity-70" : ""}`}
          >
            {/* Checkbox area */}
            <div
              className="flex items-center gap-3 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={task.status === "Completed"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTask(task);
                    setCompleteModalOpen(true);
                  } else {
                    handleStatusChange(task.id, "Pending");
                  }
                }}
                className="checkbox checkbox-primary checkbox-sm rounded-full transition-all"
              />
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold text-base-content truncate ${task.status === "Completed" ? "line-through text-base-content/50" : ""}`}
                >
                  {task.title}
                </h3>
                {task.meeting && (
                  <MdVideoCall
                    className="text-info shrink-0"
                    size={18}
                    title="Meeting"
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60">
                <span className="flex items-center gap-1">
                  <Briefcase size={12} /> {task.customer}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <CalendarIcon size={12} /> {formatDate(task.dueDate)}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="font-medium text-base-content/80">
                  {formatCurrency(task.expectedDealValue)}
                </span>
              </div>
            </div>

            {/* Badges & Progress */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0 mt-3 sm:mt-0">
              <div className="hidden md:flex flex-col items-end gap-1 w-24">
                <div className="flex justify-between w-full text-[10px] font-medium text-base-content/50">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <progress
                  className={`progress w-full h-1.5 ${task.progress === 100 ? "progress-success" : "progress-primary"}`}
                  value={task.progress}
                  max="100"
                ></progress>
              </div>
              <span
                className={`badge badge-sm border font-medium px-2.5 py-3 ${getPriorityColor(task.priority)}`}
              >
                {task.priority}
              </span>
              <span
                className={`badge badge-sm border font-medium px-2.5 py-3 ${getStatusColor(task.status)}`}
              >
                {task.status}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // 3. KANBAN BOARD VIEW (Native HTML5 Drag & Drop)
  const BoardView = () => {
    const columns: TaskStatus[] = [
      "Pending",
      "In Progress",
      "On Hold",
      "Completed",
    ];

    const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("taskId");
      handleStatusChange(taskId, status);
    };

    return (
      <div className="flex gap-6 overflow-x-auto pb-4 h-[65vh] items-start snap-x">
        {columns.map((status) => (
          <div
            key={status}
            className="bg-base-200/50 rounded-2xl p-4 w-80 shrink-0 border border-base-200 flex flex-col max-h-full snap-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-base-content text-sm flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status).split(" ")[0].replace("text-", "bg-")}`}
                ></span>
                {status}
              </h3>
              <span className="badge badge-sm bg-base-300 border-none font-semibold">
                {filteredTasks.filter((t) => t.status === status).length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {filteredTasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("taskId", task.id)
                    }
                    onClick={() => setSelectedTask(task)}
                    className="bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm hover:shadow-md hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority).split(" ")[0]}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] font-medium text-base-content/50 bg-base-200 px-2 py-0.5 rounded-md">
                        {task.type}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-base-content mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {task.title}
                    </h4>
                    <p className="text-xs text-base-content/60 mb-3 line-clamp-1">
                      {task.customer}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-base-200/60">
                      <span className="text-xs font-medium text-base-content/70 flex items-center gap-1.5">
                        <CalendarIcon size={12} />
                        {formatDate(task.dueDate)}
                      </span>
                      {task.progress > 0 && task.progress < 100 && (
                        <div
                          className="radial-progress text-primary text-[10px] font-bold bg-base-200 border-none"
                          style={
                            {
                              "--value": task.progress,
                              "--size": "1.5rem",
                              "--thickness": "2px",
                            } as any
                          }
                        ></div>
                      )}
                    </div>
                  </div>
                ))}
              {filteredTasks.filter((t) => t.status === status).length ===
                0 && (
                <div className="h-24 border-2 border-dashed border-base-300 rounded-xl flex items-center justify-center text-xs font-medium text-base-content/40">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 4. CALENDAR VIEW (Simplified upcoming agenda list)
  const CalendarView = () => (
    <div className="bg-base-100 border border-base-200 shadow-sm rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6 border-b border-base-200 pb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-base-content">
          <MdCalendarMonth className="text-primary" size={24} />
          Upcoming Agenda
        </h2>
      </div>
      <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-base-200">
        {[...filteredTasks]
          .sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
          )
          .map((task) => (
            <div key={task.id} className="relative pl-10">
              <div
                className={`absolute left-2.5 w-3.5 h-3.5 rounded-full border-4 border-base-100 top-1.5 ${task.status === "Completed" ? "bg-success" : "bg-primary"}`}
              ></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-base-content/80">
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h4
                    className="font-semibold text-base-content text-base mt-0.5 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setSelectedTask(task)}
                  >
                    {task.title}
                  </h4>
                  <p className="text-xs text-base-content/60 mt-1">
                    {task.customer} • {task.type}
                  </p>
                </div>
                {/* {task.meeting && (
                <div className="bg-info/10 text-info border border-info/20 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 w-fit">
                  <MdSchedule size={16} />
                  {task.meeting.startTime}
                </div>
              )} */}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  // 5. EMPTY STATE
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-base-100 rounded-3xl border border-base-200 border-dashed">
      <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Target size={48} />
      </div>
      <h3 className="text-xl font-bold text-base-content mb-2">
        No tasks found
      </h3>
      <p className="text-base-content/60 text-center max-w-sm mb-6">
        You're all caught up! Enjoy your day or check back later for new
        assignments.
      </p>
      <button className="btn btn-primary rounded-xl px-8 shadow-sm hover:shadow-md transition-all">
        Refresh Tasks
      </button>
    </div>
  );

  // 6. TASK DETAILS SIDE DRAWER
  const TaskDrawer = () => {
    if (!selectedTask) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-base-300/60 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => setSelectedTask(null)}
        ></div>

        {/* Drawer Panel */}
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-base-100 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 border-l border-base-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span
                className={`badge font-semibold ${getStatusColor(selectedTask.status)} border-none`}
              >
                {selectedTask.status}
              </span>
              <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                {selectedTask.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-base-content">
                <MdMoreVert size={20} />
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="btn btn-ghost btn-sm btn-circle bg-base-200/50 hover:bg-base-300"
              >
                <MdClose size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Title & Desc */}
            <div>
              <h2 className="text-2xl font-bold text-base-content leading-tight mb-3">
                {selectedTask.title}
              </h2>
              <p className="text-sm text-base-content/70 leading-relaxed bg-base-200/30 p-4 rounded-2xl border border-base-200/50">
                {selectedTask.description}
              </p>
            </div>

            {/* Quick Actions (Complete/Delay) */}
            {selectedTask.status !== "Completed" && (
              <div className="flex gap-3">
                <button
                  onClick={() => setCompleteModalOpen(true)}
                  className="btn btn-primary flex-1 rounded-xl shadow-sm hover:shadow-md"
                >
                  <MdCheckCircle size={18} /> Mark Complete
                </button>
                <button
                  onClick={() => setDelayModalOpen(true)}
                  className="btn btn-outline border-base-300 hover:bg-warning hover:border-warning hover:text-warning-content flex-1 rounded-xl"
                >
                  <MdSchedule size={18} /> Delay Task
                </button>
              </div>
            )}
           <div>
  <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">
    Task Details
  </h3>

  <div className="grid grid-cols-2 gap-3">
    {selectedTask.category && (  <div className="bg-base-200/40 p-3 rounded-xl border border-base-200">
      <p className="text-[10px] font-bold uppercase text-base-content/50">
        Category
      </p>
      <p className="font-medium">{selectedTask.category || "-"}</p>
    </div>)}

  {selectedTask.lead &&(  <div className="bg-base-200/40 p-3 rounded-xl border border-base-200">
      <p className="text-[10px] font-bold uppercase text-base-content/50">
        Lead
      </p>
      <p className="font-medium">{selectedTask.lead || "-"}</p>
    </div>)}

  {selectedTask.contactPerson && (    <div className="bg-base-200/40 p-3 rounded-xl border border-base-200">
      <p className="text-[10px] font-bold uppercase text-base-content/50">
        Contact Person
      </p>
      <p className="font-medium">{selectedTask.contactPerson || "-"}</p>
    </div>)}

   {selectedTask.priority && (   <div className="bg-base-200/40 p-3 rounded-xl border border-base-200">
      <p className="text-[10px] font-bold uppercase text-base-content/50">
        Priority
      </p>
      <p className="font-medium">{selectedTask.priority || "-"}</p>
    </div>)}

 {selectedTask.dueTime && (     <div className="bg-base-200/40 p-3 rounded-xl border border-base-200">
      <p className="text-[10px] font-bold uppercase text-base-content/50">
        Due Time
      </p>
      <p className="font-medium">{selectedTask.dueTime || "-"}</p>
    </div>)}

   {selectedTask.opportunityStage && (   <div className="bg-base-200/40 p-3 rounded-xl border border-base-200">
      <p className="text-[10px] font-bold uppercase text-base-content/50">
        Stage
      </p>
      <p className="font-medium">{selectedTask.opportunityStage || "-"}</p>
    </div>)}
  </div>
</div>
<div>
  <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">
    Schedule
  </h3>

  <div className="card bg-base-100 border border-base-200 shadow-sm">
    <div className="card-body p-4 space-y-3">

    {selectedTask.startDate && (    <div className="flex justify-between">
        <span className="text-base-content/60">Start Date</span>
        <span>
          {selectedTask.startDate
            ? new Date(selectedTask.startDate).toLocaleDateString()
            : "-"}
        </span>
      </div>)}

      <div className="flex justify-between">
        <span className="text-base-content/60">Due Date</span>
        <span>
          {selectedTask.dueDate
            ? new Date(selectedTask.dueDate).toLocaleDateString()
            : "-"}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-base-content/60">Follow Up</span>
        <span>
          {selectedTask.followUpDate
            ? new Date(selectedTask.followUpDate).toLocaleDateString()
            : "-"}
        </span>
      </div>

    </div>
  </div>
</div>

            {/* Progress Update */}
            {selectedTask.status !== "Completed" && (
              <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-base-content">
                    Update Progress
                  </span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                    {selectedTask.progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedTask.progress}
                  onChange={(e) =>
                    handleProgressChange(
                      selectedTask.id,
                      parseInt(e.target.value),
                    )
                  }
                  className="range range-primary range-sm w-full"
                />
                <div className="w-full flex justify-between text-[10px] px-1 mt-1 text-base-content/40 font-medium">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
           
            {/* Customer Quick Card */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">
                Customer Information
              </h3>
              <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-lg">
                        {selectedTask.customer.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-base-content">
                          {selectedTask?.customer || "No Customer"}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {selectedTask.region}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 bg-base-200/50 p-3 rounded-xl border border-base-200/50">
                    <div className="flex items-center gap-3 text-sm">
                      <MdPhone className="text-base-content/40" size={16} />
                      <a
                        href={`tel:${selectedTask.phone}`}
                        className="text-base-content/80 hover:text-primary transition-colors font-medium"
                      >
                        {selectedTask.phone || "No phone number provided"}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MdEmail className="text-base-content/40" size={16} />
                      <a
                        href={`mailto:${selectedTask.email}`}
                        className="text-base-content/80 hover:text-primary transition-colors font-medium"
                      >
                        {selectedTask.email || "No email provided"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Details Card */}
           
              {selectedTask.meetingMode && (
            <div className="bg-info/5 border border-info/20 rounded-2xl p-4">
              <h3 className="text-xs font-bold mb-2">Meeting</h3>
              <p>{selectedTask.meetingMode}</p>
              <p>{selectedTask.meetingLocation || selectedTask.meetingLink || "-"}</p>
            </div>
          )}

            {/* Opportunity Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-base-200/40 p-4 rounded-2xl border border-base-200">
                <p className="text-[10px] font-bold uppercase text-base-content/50 mb-1">
                  Expected Value
                </p>
                <p className="text-lg font-bold text-success">
                  {formatCurrency(selectedTask.expectedDealValue)}
                </p>
              </div>
              <div className="bg-base-200/40 p-4 rounded-2xl border border-base-200">
                <p className="text-[10px] font-bold uppercase text-base-content/50 mb-1">
                  Probability
                </p>
                <p className="text-lg font-bold text-primary">
                  {selectedTask.probability || 0}%
                </p>
              </div>
            </div>

             {selectedTask.reasonForDelay && (
            <div className="bg-warning/10 p-3 rounded-xl">
              <p className="text-xs font-bold">Delay Reason</p>
              <p>{selectedTask.reasonForDelay}</p>
            </div>
          )}

          {/* Outcome */}
          {selectedTask.outcome && (
            <div className="bg-success/10 p-3 rounded-xl">
              <p className="text-xs font-bold">Outcome</p>
              <p>{selectedTask.outcome}</p>
            </div>
          )}

            {/* Notes if completed */}
            {selectedTask.completedNotes && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3 flex items-center gap-2">
                  <MdCheckCircle className="text-success" /> Completion Notes
                </h3>
                <div className="bg-success/5 border border-success/20 p-4 rounded-2xl text-sm text-base-content/80 font-medium">
                  {selectedTask.completedNotes}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // 7. COMPLETION MODAL
  const CompletionModal = () => {
    if (!isCompleteModalOpen || !selectedTask) return null;

    const [notes, setNotes] = useState("");

    // const handleSubmit = () => {
    //   const updatedTasks = tasks.map(t => {
    //     if(t.id === selectedTask.id) return { ...t, status: "Completed" as TaskStatus, progress: 100, completedNotes: notes };
    //     return t;
    //   });
    //   setTasks(updatedTasks);
    //   setCompleteModalOpen(false);
    //   setSelectedTask(null);
    // };

    const handleSubmit = async () => {
      try {
        const res = await updateSalesTask(
          selectedTask.id,
          {
            status: "Completed",
            progress: 100,
            completionNotes: notes,
          },
          slug,
        );

        setTasks((prev) =>
          prev.map((t) =>
            t.id === selectedTask.id ? { ...t, ...res.data } : t,
          ),
        );

        setCompleteModalOpen(false);
        setSelectedTask(null);
      } catch (err) {
        console.error("Completion failed:", err);
      }
    };

    return (
      <div className="fixed inset-0 bg-base-300/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-200 w-full max-w-md overflow-hidden transform transition-all">
          <div className="bg-success/10 p-6 flex flex-col items-center border-b border-success/20">
            <div className="w-16 h-16 bg-success text-success-content rounded-full flex items-center justify-center mb-4 shadow-lg">
              <MdCheckCircle size={36} />
            </div>
            <h2 className="text-xl font-bold text-base-content">
              Complete Task
            </h2>
            <p className="text-sm font-medium text-success/80 text-center mt-1">
              "{selectedTask.title}"
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">
                  Completion Notes / Outcome
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24 rounded-xl focus:border-success focus:ring-1 focus:ring-success/30 transition-all text-base-content"
                placeholder="Summarize the outcome, next steps, or attach meeting minutes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCompleteModalOpen(false)}
                className="btn btn-ghost flex-1 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-success flex-1 rounded-xl shadow-md text-success-content hover:-translate-y-0.5 transition-transform"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 8. DELAY / HOLD MODAL
  const DelayModal = () => {
    const [delayReason, setDelayReason] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    if (!isDelayModalOpen || !selectedTask) return null;
    const handleDelay = async () => {
      try {
        const res = await updateSalesTask(
          selectedTask.id,
          {
            status: "On Hold",
            reasonForDelay: delayReason,
            followUpDate: followUpDate,
          },
          slug,
        );

        setTasks((prev) =>
          prev.map((t) =>
            t.id === selectedTask.id ? { ...t, ...res.data } : t,
          ),
        );

        setDelayModalOpen(false);
        setSelectedTask(null);
      } catch (err) {
        console.error("Delay update failed:", err);
      }
    };
    return (
      <div className="fixed inset-0 bg-base-300/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-200 w-full max-w-md overflow-hidden transform transition-all">
          <div className="p-6 border-b border-base-200 flex items-center gap-3">
            <div className="p-3 bg-warning/10 text-warning rounded-2xl">
              <MdSchedule size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content">
                Delay Task
              </h2>
              <p className="text-xs text-base-content/60 font-medium truncate max-w-[250px]">
                {selectedTask.title}
              </p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">
                  Reason for Delay
                </span>
              </label>
              <select
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                className="select select-bordered rounded-xl w-full"
              >
                <option>Client rescheduled</option>
                <option>Waiting for internal info</option>
                <option>Low priority shifted</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">
                  New Follow-up Date
                </span>
              </label>
              <input
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                type="date"
                className="input input-bordered rounded-xl w-full"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setDelayModalOpen(false)}
                className="btn btn-ghost flex-1 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelay}
                className="btn btn-warning flex-1 rounded-xl shadow-md hover:-translate-y-0.5 transition-transform text-warning-content"
              >
                Place On Hold
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER PAGE
     ───────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-base-200/30 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-base-content tracking-tight flex items-center gap-3">
            Good Morning {auth?.user?.name}
              <span className="animate-bounce origin-bottom-right inline-block">
                👋
              </span>
            </h1>
            <p className="text-base-content/60 text-sm font-medium mt-1.5">
              Track your assigned tasks, meetings, follow-ups, and sales
              activities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-primary rounded-xl shadow-sm hover:shadow-md transition-all px-6">
              + New Task
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        <KPIHeader />

        {/* WORKSPACE AREA */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* LEFT: MAIN TASK AREA */}
          <div className="flex-1 w-full space-y-6 min-w-0">
            {/* Filter & View Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-base-100 p-2 sm:p-3 rounded-2xl border border-base-200 shadow-sm">
              {/* Search */}
              <div className="relative flex-1 max-w-md group">
                <MdSearch
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search tasks, customers..."
                  className="input input-sm h-10 pl-10 w-full bg-base-200/50 border-transparent focus:border-primary focus:bg-base-100 rounded-xl transition-all font-medium text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filters & Views */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                <button className="btn btn-sm h-10 bg-base-200/50 hover:bg-base-200 border-none rounded-xl text-base-content/70 font-semibold gap-2 shrink-0">
                  <MdFilterList size={18} /> Filters
                </button>

                <div className="h-6 w-px bg-base-300 mx-1 shrink-0"></div>

                {/* View Switcher */}
                <div className="bg-base-200/70 p-1 rounded-xl flex gap-1 shrink-0">
                  <button
                    onClick={() => setViewMode("List")}
                    className={`btn btn-sm h-8 border-none rounded-lg px-3 gap-1.5 transition-all ${viewMode === "List" ? "bg-base-100 shadow-sm text-primary hover:bg-base-100" : "bg-transparent text-base-content/60 hover:bg-base-200"}`}
                  >
                    <MdViewList size={16} />{" "}
                    <span className="hidden sm:inline">List</span>
                  </button>
                  <button
                    onClick={() => setViewMode("Board")}
                    className={`btn btn-sm h-8 border-none rounded-lg px-3 gap-1.5 transition-all ${viewMode === "Board" ? "bg-base-100 shadow-sm text-primary hover:bg-base-100" : "bg-transparent text-base-content/60 hover:bg-base-200"}`}
                  >
                    <MdViewKanban size={16} />{" "}
                    <span className="hidden sm:inline">Board</span>
                  </button>
                  <button
                    onClick={() => setViewMode("Calendar")}
                    className={`btn btn-sm h-8 border-none rounded-lg px-3 gap-1.5 transition-all ${viewMode === "Calendar" ? "bg-base-100 shadow-sm text-primary hover:bg-base-100" : "bg-transparent text-base-content/60 hover:bg-base-200"}`}
                  >
                    <MdCalendarMonth size={16} />{" "}
                    <span className="hidden sm:inline">Calendar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {/* {["All Tasks", "Today", "High Priority", "Pending"].map((f, i) => (
                <span key={f} className={`badge badge-lg border-none px-4 py-3 cursor-pointer whitespace-nowrap text-xs font-bold transition-all ${i === 0 ? "bg-primary text-primary-content shadow-sm" : "bg-base-100 text-base-content/60 hover:bg-base-200 border border-base-200"}`}>
                  {f}
                </span>
              ))} */}

              {["All Tasks", "Today", "High Priority", "Pending"].map((f) => (
                <span
                  key={f}
                  onClick={() => {
                    setActiveFilter(f);
                    fetchTasks(f);
                  }}
                  className={`badge badge-lg cursor-pointer ${
                    activeFilter === f
                      ? "bg-primary text-primary-content"
                      : "bg-base-100"
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>

            {/* RENDER ACTIVE VIEW */}
            <div className="mt-4 animate-fade-in">
              {viewMode === "List" && <ListView />}
              {viewMode === "Board" && <BoardView />}
              {viewMode === "Calendar" && <CalendarView />}
            </div>
          </div>

          {/* RIGHT: AGENDA & ACTIVITY SIDEBAR (Desktop Only) */}
          <div className="hidden xl:block w-80 shrink-0 space-y-6">
            {/* Today's Agenda */}
            <div className="card bg-base-100 border border-base-200 shadow-sm">
              <div className="card-body p-5">
                <h3 className="font-bold text-base-content mb-4 flex items-center gap-2 border-b border-base-200 pb-3">
                  <div className="p-1.5 bg-secondary/10 text-secondary rounded-lg">
                    <MdSchedule size={18} />
                  </div>
                  Today's Agenda
                </h3>
                <div className="space-y-4">
                  {todayTasks.length > 0 ? (
                    todayTasks.map((t) => (
                      <div key={`agenda-${t.id}`} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-2.5 h-2.5 rounded-full mt-1.5 ${t.status === "Completed" ? "bg-success" : "bg-primary"}`}
                          ></div>
                          <div className="w-px h-full bg-base-200 my-1"></div>
                        </div>
                        <div className="pb-3">
                          <p
                            className={`text-sm font-semibold ${t.status === "Completed" ? "text-base-content/50 line-through" : "text-base-content"}`}
                          >
                            {t.title}
                          </p>
                          {/* <p className="text-xs text-base-content/50 mt-0.5">{t.meeting ? t.meeting.startTime : "Anytime today"}</p> */}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-base-content/50 italic">
                      No tasks scheduled for today.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Productivity Stats */}
            <div className="card bg-primary text-primary-content shadow-md overflow-hidden relative">
              <div className="absolute -right-6 -top-6 text-primary-content/10">
                <TrendingUp size={120} />
              </div>
              <div className="card-body p-6 relative z-10">
                <h3 className="font-bold text-lg mb-1 opacity-90">
                  Productivity Score
                </h3>
                <p className="text-4xl font-extrabold mb-4">
                  92<span className="text-xl font-medium opacity-70">/100</span>
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium opacity-90">
                    <span>Weekly Goal</span>
                    <span>14/15 Tasks</span>
                  </div>
                  <progress
                    className="progress progress-success bg-primary-content/20 w-full"
                    value="90"
                    max="100"
                  ></progress>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <TaskDrawer />
      <CompletionModal />
      <DelayModal />
    </div>
  );
}
