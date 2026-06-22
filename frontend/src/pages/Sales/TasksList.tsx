import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
type  SortingState,
} from "@tanstack/react-table";
import {
  MdSearch,
  MdFilterList,
  MdAdd,
  MdDownload,
  MdRefresh,
  MdViewList,
  MdViewKanban,
  MdCalendarMonth,
  MdMoreVert,
  MdClose,
  MdOutlineCheckCircle,
  MdEdit,
  MdDelete,
  MdAssignmentInd,
  MdEvent,
  MdCheckCircle,
} from "react-icons/md";
import { useAuth } from "@/auth/AuthContext";
import { getSalesTasks, updateSalesTask, deleteSalesTask, createSalesTask } from "@/services/salesTaskServices";
import { getSalesReps } from "@/services/salesRepServices";
import ImportExportActions from "@/components/import-export/ImportExportActions";
import type { ColumnConfig } from "@/type/importExport.types";

const taskColumns: ColumnConfig[] = [
  { key: "id", label: "Task ID", type: "string" },
  { key: "title", label: "Task Title", required: true, type: "string" },
  { key: "customer", label: "Customer", required: true, type: "string" },
  { key: "assignedTo", label: "Assigned To", type: "string" },
  { key: "type", label: "Task Type", type: "string" },
  { key: "priority", label: "Priority", type: "string" },
  { key: "status", label: "Status", type: "string" },
  { key: "dealValue", label: "Deal Value", type: "number" },
  { key: "stage", label: "Stage", type: "string" },
  { key: "startDate", label: "Start Date", type: "date" },
  { key: "dueDate", label: "Due Date", type: "date" },
  { key: "followUpDate", label: "Follow-up Date", type: "date" },
  { key: "progress", label: "Progress", type: "number" },
];

/* ─────────────────────────── Types ─────────────────────────── */
export interface SalesTask {
  id: string;
  title: string;
  customer: string;
  assignedTo: string;
  type: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  dealValue: number;
  stage: string;
  startDate: string;
  dueDate: string;
  followUpDate: string;
  progress: number;
  createdAt?: string;
  updatedAt?: string;
  completionNotes?: string;
}

/* ─────────────────────────── Component ─────────────────────────── */
export default function SalesTasksList() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  
  // State
  const [view, setView] = useState<"table" | "kanban" | "calendar">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<SalesTask | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [newComment, setNewComment] = useState("");

  // Modal States
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<SalesTask["status"]>("Pending");
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [newAssignee, setNewAssignee] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<SalesTask | null>(null);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [newFollowUpDate, setNewFollowUpDate] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Data Fetching
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["salesTasks", auth.slug],
    queryFn: () => getSalesTasks(auth.slug || "default-tenant"),
  });

  console.log("data : ",data);

  const { data: repsData } = useQuery({
    queryKey: ["salesReps", auth.slug],
    queryFn: () => getSalesReps(auth.slug || "default-tenant"),
  });

  const salesReps = useMemo(() => {
    return repsData?.data || [];
  }, [repsData]);

  const getRepName = useCallback((idOrName: string) => {
    if (!idOrName) return "Unassigned";
    const rep = salesReps.find((r: any) => r._id === idOrName || r.memberId?._id === idOrName);
    return rep ? (rep.fullName || rep.memberId?.name || idOrName) : idOrName;
  }, [salesReps]);

  const filteredReps = useMemo(() => {
    if (!assigneeSearch) return salesReps;
    return salesReps.filter((rep: any) => {
      const name = rep.fullName || rep.memberId?.name || "";
      return name.toLowerCase().includes(assigneeSearch.toLowerCase());
    });
  }, [salesReps, assigneeSearch]);

  const tasks = useMemo(() => {
    return (data?.data || []).map((t: any) => ({
      id: t._id || t.id,
      title: t.title,
      customer: t.customer || "Unknown",
      assignedTo: t.assignedTo || "Unassigned",
      type: t.type || "Other",
      priority: t.priority || "Medium",
      status: t.status || "Pending",
      dealValue: t.expectedDealValue || 0,
      stage: t.opportunityStage || "N/A",
      startDate: t.startDate ? new Date(t.startDate).toISOString().split("T")[0] : "",
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
      followUpDate: t.followUpDate ? new Date(t.followUpDate).toISOString().split("T")[0] : "",
      progress: t.progress || 0,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      completionNotes: t.completionNotes,
    }));
  }, [data]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; payload: Partial<any> }) => updateSalesTask(vars.id, vars.payload, auth.slug || "default-tenant"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesTasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSalesTask(id, auth.slug || "default-tenant"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesTasks"] }),
  });

  // Stats Calculation
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === "Pending").length,
      inProgress: tasks.filter(t => t.status === "In Progress").length,
      completed: tasks.filter(t => t.status === "Completed").length,
      overdue: tasks.filter(t => t.dueDate < today && t.status !== "Completed").length,
      todayFollowUps: tasks.filter(t => t.followUpDate === today).length,
      dealValue: tasks.reduce((sum, t) => sum + t.dealValue, 0),
      highPriority: tasks.filter(t => t.priority === "High" || t.priority === "Urgent").length,
    };
  }, [tasks]);

  // TanStack Table Setup
  const columnHelper = createColumnHelper<SalesTask>();
  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="checkbox checkbox-sm checkbox-primary"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="checkbox checkbox-sm checkbox-primary"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    }),
    columnHelper.accessor("id", {
      header: "Task ID",
      cell: (info) => <span className="text-xs font-mono font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("title", {
      header: "Task Title",
      cell: (info) => (
        <span className="font-semibold text-primary hover:underline cursor-pointer">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("customer", {
      header: "Customer",
    }),
    columnHelper.accessor("assignedTo", {
      header: "Assigned To",
      cell: (info) => {
        const name = getRepName(info.getValue());
        return (
          <div className="flex items-center gap-2">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-6">
                <span className="text-[10px]">{name.charAt(0)}</span>
              </div>
            </div>
            <span className="text-sm">{name}</span>
          </div>
      )},
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => {
        const val = info.getValue();
        const badgeClass =
          val === "Urgent" ? "badge-error" : val === "High" ? "badge-warning" : val === "Medium" ? "badge-info" : "badge-neutral";
        return <span className={`badge badge-sm font-semibold ${badgeClass}`}>{val}</span>;
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const val = info.getValue();
        const badgeClass =
          val === "Completed" ? "badge-success" : val === "In Progress" ? "badge-primary" : val === "On Hold" ? "badge-warning" : "badge-ghost";
        return <span className={`badge badge-sm badge-outline ${badgeClass}`}>{val}</span>;
      },
    }),
    columnHelper.accessor("dueDate", {
      header: "Due Date",
      cell: (info) => {
        const date = info.getValue();
        const isOverdue = date < new Date().toISOString().split("T")[0] && info.row.original.status !== "Completed";
        return <span className={isOverdue ? "text-error font-bold" : ""}>{date}</span>;
      },
    }),
    columnHelper.accessor("progress", {
      header: "Progress",
      cell: (info) => (
        <div className="flex items-center gap-2 w-24">
          <progress className="progress progress-success w-full" value={info.getValue()} max="100"></progress>
          <span className="text-xs text-base-content/70">{info.getValue()}%</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
          <button tabIndex={0} className="btn btn-ghost btn-xs btn-square">
            <MdMoreVert size={16} />
          </button>
          <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-40 border border-base-200">
            <li><a onClick={() => setSelectedTask(row.original)}><MdViewList size={16} /> View Details</a></li>
            <li><a onClick={(e) => { e.stopPropagation(); setTaskToEdit(row.original); setEditModalOpen(true); }}><MdEdit size={16} /> Edit Task</a></li>
            <div className="divider my-1"></div>
            <li><a className="text-error hover:bg-error/10" onClick={(e) => handleDelete(e, row.original.id)}><MdDelete size={16} /> Delete</a></li>
          </ul>
        </div>
      ),
    })
  ], [navigate]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase()) || 
      t.customer.toLowerCase().includes(search.toLowerCase())
    );
  }, [tasks, search]);

  const table = useReactTable({
    data: filteredTasks,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Action Handlers
  const getSelectedTasks = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    return selectedIndices.map(index => filteredTasks[index]);
  };

  const handleBulkStatusUpdate = async () => {
    const selected = getSelectedTasks();
    try {
      await Promise.all(selected.map(t => updateMutation.mutateAsync({ id: t.id, payload: { status: newStatus } })));
      setBulkStatusModalOpen(false);
      setRowSelection({});
      setSuccessMessage(`Status updated for ${selected.length} tasks!`);
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to update status for some tasks.");
    }
  };

  const handleBulkAssign = async () => {
    const selected = getSelectedTasks();
    if (!newAssignee) return;
    try {
      await Promise.all(selected.map(t => updateMutation.mutateAsync({ id: t.id, payload: { assignedTo: newAssignee } })));
      setBulkAssignModalOpen(false);
      setRowSelection({});
      setSuccessMessage(`Assigned ${selected.length} tasks to ${newAssignee}!`);
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to assign tasks.");
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    const selected = getSelectedTasks();
    if (window.confirm(`Are you sure you want to delete ${selected.length} selected tasks?`)) {
      try {
        await Promise.all(selected.map(t => deleteMutation.mutateAsync(t.id)));
        setBulkDeleteModalOpen(false);
        setRowSelection({});
        setSuccessMessage(`Deleted ${selected.length} tasks successfully!`);
        setSuccessModalOpen(true);
      } catch (error) {
        toast.error("Failed to delete some tasks.");
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToEdit) return;
    
    const payload = {
      title: taskToEdit.title,
      customer: taskToEdit.customer,
      assignedTo: taskToEdit.assignedTo,
      type: taskToEdit.type,
      priority: taskToEdit.priority,
      status: taskToEdit.status,
      expectedDealValue: taskToEdit.dealValue,
      opportunityStage: taskToEdit.stage,
      startDate: taskToEdit.startDate,
      dueDate: taskToEdit.dueDate,
      followUpDate: taskToEdit.followUpDate,
      progress: taskToEdit.progress,
    };

    await updateMutation.mutateAsync({ id: taskToEdit.id, payload });
    setEditModalOpen(false);
    setSuccessMessage("Task updated successfully!");
    setSuccessModalOpen(true);
  };

  const handleImportSubmit = async (validRows: any[]) => {
    await Promise.all(validRows.map(row => createSalesTask(auth.slug || "default-tenant", row as Partial<SalesTask>)));
    queryClient.invalidateQueries({ queryKey: ["salesTasks"] });
  };

  const handleDrop = async (e: React.DragEvent, status: SalesTask["status"]) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      try {
        await updateMutation.mutateAsync({ id: taskId, payload: { status } });
        setSuccessMessage("Task status updated!");
        setSuccessModalOpen(true);
      } catch (error) {
        toast.error("Failed to update task status.");
        console.error(error);
      }
    }
  };

  const handleStatusChange = async (id: string, status: SalesTask["status"]) => {
    try {
      await updateMutation.mutateAsync({ id, payload: { status } });
      if (selectedTask?.id === id) {
        setSelectedTask({ ...selectedTask, status });
      }
      setSuccessMessage(`Task marked as ${status}`);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update task status.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteMutation.mutateAsync(id);
        setSuccessMessage("Task deleted successfully!");
        setSuccessModalOpen(true);
        if (selectedTask?.id === id) setSelectedTask(null);
      } catch (err) {
        toast.error("Failed to delete task.");
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleFollowUpSubmit = async () => {
    if (!selectedTask || !newFollowUpDate) return;
    try {
      await updateMutation.mutateAsync({ id: selectedTask.id, payload: { followUpDate: newFollowUpDate } });
      setFollowUpModalOpen(false);
      setSuccessMessage("Follow-up date updated!");
      setSuccessModalOpen(true);
      if (selectedTask) {
        setSelectedTask({ ...selectedTask, followUpDate: newFollowUpDate });
      }
    } catch (error) {
      toast.error("Failed to update follow-up date.");
    }
  };

  const handlePostComment = async () => {
    if (!selectedTask || !newComment.trim()) return;
    try {
      const updatedNotes = selectedTask.completionNotes ? `${selectedTask.completionNotes}\n- ${newComment}` : `- ${newComment}`;
      await updateMutation.mutateAsync({ id: selectedTask.id, payload: { completionNotes: updatedNotes } });
      setSelectedTask({ ...selectedTask, completionNotes: updatedNotes });
      setNewComment("");
      setSuccessMessage("Note added!");
      setSuccessModalOpen(true);
    } catch (err) {
      toast.error("Failed to add note.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans flex flex-col h-full overflow-hidden relative">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Sales Tasks</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li className="font-semibold text-primary">Tasks</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-2">
          <ImportExportActions
            moduleName="Sales Tasks"
            columns={taskColumns}
            data={filteredTasks}
            selectedData={getSelectedTasks()}
            onImportSubmit={handleImportSubmit}
          />
          <button className="btn btn-outline btn-sm btn-square" onClick={() => refetch()}>
            <MdRefresh size={16} />
          </button>
          <button onClick={() => navigate("/sales/tasks/new")} className="btn btn-primary btn-sm gap-2">
            <MdAdd size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* ── Stats Dashboard ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {[
          { label: "Total Tasks", value: stats.total, color: "text-base-content" },
          { label: "Pending", value: stats.pending, color: "text-base-content" },
          { label: "In Progress", value: stats.inProgress, color: "text-primary" },
          { label: "Completed", value: stats.completed, color: "text-success" },
          { label: "Overdue", value: stats.overdue, color: "text-error" },
          { label: "Today's Follow-ups", value: stats.todayFollowUps, color: "text-warning" },
          { label: "High Priority", value: stats.highPriority, color: "text-error" },
          { label: "Deal Value", value: `₹${stats.dealValue.toLocaleString()}`, color: "text-success" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
            <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
            <span className="text-xs text-base-content/60 mt-1 text-center font-medium uppercase">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-base-100 p-3 rounded-xl border border-base-300 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={18} />
            <input
              type="text"
              placeholder="Search tasks, customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 focus:outline-none focus:border-primary"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn btn-sm ${showFilters ? "btn-primary" : "btn-outline"} gap-2`}>
            <MdFilterList size={16} /> Filters
          </button>
        </div>

        <div className="flex bg-base-200 p-1 rounded-lg border border-base-300">
          <button onClick={() => setView("table")} className={`btn btn-sm btn-ghost px-3 ${view === "table" ? "bg-base-100 shadow-sm" : ""}`}>
            <MdViewList size={18} /> Table
          </button>
          <button onClick={() => setView("kanban")} className={`btn btn-sm btn-ghost px-3 ${view === "kanban" ? "bg-base-100 shadow-sm" : ""}`}>
            <MdViewKanban size={18} /> Kanban
          </button>
          <button onClick={() => setView("calendar")} className={`btn btn-sm btn-ghost px-3 ${view === "calendar" ? "bg-base-100 shadow-sm" : ""}`}>
            <MdCalendarMonth size={18} /> Calendar
          </button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm animate-fade-in-down">
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Task Type</label>
            <select className="select select-sm select-bordered w-full"><option>All</option><option>Proposal</option><option>Meeting</option></select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Status</label>
            <select className="select select-sm select-bordered w-full"><option>All</option><option>Pending</option><option>Completed</option></select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Assigned To</label>
            <select className="select select-sm select-bordered w-full"><option>All</option><option>V VINAY Kumar</option></select>
          </div>
          <div className="flex items-end gap-2">
            <button className="btn btn-sm btn-primary flex-1">Apply Filters</button>
            <button className="btn btn-sm btn-ghost flex-1">Reset</button>
          </div>
        </div>
      )}

      {/* ── Bulk Actions (Visible when rows selected) ── */}
      {/* {Object.keys(rowSelection).length > 0 && view === "table" && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between shadow-sm animate-fade-in-up">
          <span className="text-sm font-semibold text-primary">{Object.keys(rowSelection).length} tasks selected</span>
          <div className="flex gap-2">
            <button className="btn btn-xs btn-primary">Assign Employee</button>
            <button className="btn btn-xs btn-outline">Change Status</button>
            <button className="btn btn-xs btn-error btn-outline">Delete</button>
          </div>
        </div>
      )} */}

      {/* ── Bulk Actions Bar ── */}
      {Object.keys(rowSelection).length > 0 && view === "table" && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between shadow-sm animate-fade-in-up">
          <span className="text-sm font-semibold text-primary">{Object.keys(rowSelection).length} tasks selected</span>
          <div className="flex gap-2">
            <button className="btn btn-xs btn-outline bg-base-100" onClick={() => setBulkAssignModalOpen(true)}><MdAssignmentInd /> Assign Employee</button>
            <button className="btn btn-xs btn-primary" onClick={() => setBulkStatusModalOpen(true)}>Change Status</button>
            <button className="btn btn-xs btn-error text-white" onClick={() => setBulkDeleteModalOpen(true)}><MdDelete /> Delete</button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      {isLoading ? (
        <div className="flex-1 flex flex-col justify-center items-center h-full space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p>Loading Sales Tasks...</p>
        </div>
      ) : (
      <div className="flex-1 bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
        
        {/* View 1: Table */}
        {view === "table" && (
          <div className="flex-1 overflow-auto">
            <table className="table table-pin-rows table-pin-cols w-full text-sm">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-base-200/50 text-base-content/70">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="font-semibold py-3 cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted() as string] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-base-200/50 transition-colors cursor-pointer border-b border-base-200"
                    onClick={() => setSelectedTask(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-base-content/50">
                      No tasks found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Kanban */}
        {view === "kanban" && (
          <div className="flex-1 flex overflow-x-auto p-4 gap-4 bg-base-200/30">
            {(["Pending", "In Progress", "On Hold", "Completed"] as const).map(status => (
              <div 
                key={status} 
                className="flex-1 min-w-[280px] bg-base-100 rounded-xl border border-base-300 flex flex-col shadow-sm"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="p-3 border-b border-base-200 font-bold flex justify-between items-center bg-base-200/50 rounded-t-xl">
                  {status}
                  <span className="badge badge-sm">{tasks.filter(t => t.status === status).length}</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {filteredTasks.filter(t => t.status === status).map(task => (
                    <div 
                      key={task.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => setSelectedTask(task)}
                      className="bg-base-100 border border-base-300 p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-primary transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-base-content/50">{task.id}</span>
                        <span className={`badge badge-xs ${task.priority === 'Urgent' ? 'badge-error' : task.priority === 'High' ? 'badge-warning' : 'badge-neutral'}`}>
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1 leading-tight">{task.title}</h4>
                      <p className="text-xs text-base-content/70 mb-3">{task.customer}</p>
                      <div className="flex justify-between items-center mt-2 border-t border-base-200 pt-2">
                        <div className="avatar placeholder" title={getRepName(task.assignedTo)}>
                          <div className="bg-neutral text-neutral-content rounded-full w-6">
                            <span className="text-[10px]">{getRepName(task.assignedTo).charAt(0)}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold ${task.dueDate < new Date().toISOString().split("T")[0] ? 'text-error' : 'text-base-content/60'}`}>
                          Due: {task.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View 3: Calendar (Mock Implementation) */}
        {view === "calendar" && (
          <div className="flex-1 p-6 flex items-center justify-center bg-base-200/30">
            <div className="text-center space-y-4">
              <MdCalendarMonth size={48} className="mx-auto text-base-content/20" />
              <h3 className="text-lg font-bold text-base-content/50">Calendar View</h3>
              <p className="text-sm text-base-content/40 max-w-sm">Full calendar integration requires a library like react-big-calendar. Tasks are mapped to due dates here.</p>
            </div>
          </div>
        )}

        {/* Table Pagination Footer */}
        {view === "table" && (
          <div className="border-t border-base-300 p-3 bg-base-100 flex items-center justify-between text-sm">
            <span className="text-base-content/60">
              Showing {table.getRowModel().rows.length} of {filteredTasks.length} tasks
            </span>
            <div className="flex items-center gap-2">
              <select 
                className="select select-sm select-bordered"
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map(pageSize => (
                  <option key={pageSize} value={pageSize}>Show {pageSize}</option>
                ))}
              </select>
              <div className="join">
                <button className="join-item btn btn-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>«</button>
                <button className="join-item btn btn-sm">Page {table.getState().pagination.pageIndex + 1}</button>
                <button className="join-item btn btn-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>»</button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ── Task Details Drawer ── */}
      <div className={`fixed inset-0 bg-black/40 z-50 transition-opacity ${selectedTask ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className={`absolute right-0 top-0 h-full w-full md:w-[600px] bg-base-100 shadow-2xl transition-transform duration-300 transform ${selectedTask ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-base-300 flex justify-between items-center bg-base-200/50">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xs font-bold text-base-content/50">{selectedTask?.id}</span>
                <span className={`badge badge-sm badge-outline ${selectedTask?.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>
                  {selectedTask?.status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-base-content leading-tight">{selectedTask?.title}</h2>
            </div>
            <button onClick={() => setSelectedTask(null)} className="btn btn-ghost btn-circle btn-sm">
              <MdClose size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-base-100">
            
            {/* Quick Actions */}
            <div className="flex gap-2 pb-6 border-b border-base-200">
              <button className="btn btn-sm btn-success text-white flex-1 gap-2" onClick={() => selectedTask && handleStatusChange(selectedTask.id, "Completed")}><MdOutlineCheckCircle /> Mark Complete</button>
              <button className="btn btn-sm btn-outline flex-1" onClick={() => setBulkAssignModalOpen(true)}>Reassign</button>
              <button className="btn btn-sm btn-outline flex-1" onClick={() => { setNewFollowUpDate(selectedTask?.followUpDate || ""); setFollowUpModalOpen(true); }}><MdEvent /> Follow-up</button>
            </div>

            {/* Basic Info */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div><p className="text-base-content/50 mb-1">Customer</p><p className="font-semibold">{selectedTask?.customer}</p></div>
                <div><p className="text-base-content/50 mb-1">Task Type</p><p className="font-semibold">{selectedTask?.type}</p></div>
                <div><p className="text-base-content/50 mb-1">Assigned To</p><p className="font-semibold">{getRepName(selectedTask?.assignedTo || "")}</p></div>
                <div><p className="text-base-content/50 mb-1">Priority</p>
                  <span className={`badge badge-sm font-semibold ${selectedTask?.priority === 'Urgent' ? 'badge-error' : 'badge-warning'}`}>{selectedTask?.priority}</span>
                </div>
              </div>
            </section>

            {/* Sales & Schedule */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Sales & Schedule</h3>
              <div className="bg-base-200/50 p-4 rounded-xl border border-base-200 grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-base-content/50 mb-1">Deal Value</p><p className="font-bold text-success text-lg">₹{selectedTask?.dealValue.toLocaleString()}</p></div>
                <div><p className="text-base-content/50 mb-1">Stage</p><p className="font-semibold">{selectedTask?.stage}</p></div>
                <div className="col-span-2 divider my-0"></div>
                <div><p className="text-base-content/50 mb-1">Start Date</p><p className="font-medium">{selectedTask?.startDate}</p></div>
                <div><p className="text-base-content/50 mb-1">Due Date</p><p className="font-medium">{selectedTask?.dueDate}</p></div>
                <div><p className="text-base-content/50 mb-1">Follow-up Date</p><p className="font-medium text-primary">{selectedTask?.followUpDate}</p></div>
                <div>
                  <p className="text-base-content/50 mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <progress className="progress progress-primary w-full" value={selectedTask?.progress} max="100"></progress>
                    <span className="text-xs font-bold">{selectedTask?.progress}%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Comments & Activity Timeline */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Activity & Comments</h3>
              <ul className="timeline timeline-vertical timeline-compact">
                {selectedTask?.updatedAt && selectedTask.updatedAt !== selectedTask.createdAt && (
                  <li>
                    <hr className="bg-primary" />
                    <div className="timeline-middle text-primary"><MdOutlineCheckCircle /></div>
                    <div className="timeline-end timeline-box border-none shadow-none bg-transparent px-2 py-1">
                      <div className="text-xs text-base-content/50">{new Date(selectedTask.updatedAt).toLocaleString()}</div>
                      <div className="text-sm font-medium">Task Updated</div>
                    </div>
                    <hr className="bg-base-300" />
                  </li>
                )}
                <li>
                  <hr className={selectedTask?.updatedAt !== selectedTask?.createdAt ? "bg-base-300" : "bg-primary"} />
                  <div className="timeline-middle text-base-300"><MdOutlineCheckCircle /></div>
                  <div className="timeline-end timeline-box border-none shadow-none bg-transparent px-2 py-1">
                    <div className="text-xs text-base-content/50">{selectedTask?.createdAt ? new Date(selectedTask.createdAt).toLocaleString() : "N/A"}</div>
                    <div className="text-sm font-medium">Task Created</div>
                  </div>
                </li>
              </ul>
              
              {selectedTask?.completionNotes && (
                <div className="mt-4 p-3 bg-base-200 rounded-lg text-sm whitespace-pre-wrap">
                  <span className="font-semibold block mb-1">Notes:</span>
                  {selectedTask.completionNotes}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <input type="text" className="input input-sm input-bordered w-full" placeholder="Add a note..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePostComment()} />
                <button className="btn btn-sm btn-primary" onClick={handlePostComment} disabled={!newComment.trim()}>Post</button>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <dialog className={`modal ${bulkStatusModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Update Status for Selected Tasks</h3>
          <select className="select select-bordered w-full" value={newStatus} onChange={(e) => setNewStatus(e.target.value as SalesTask["status"])}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => setBulkStatusModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkStatusUpdate}>Update Status</button>
          </div>
        </div>
      </dialog>

      <dialog className={`modal ${bulkAssignModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Assign Employee</h3>
          <div className="dropdown w-full">
            <label tabIndex={0} className="btn btn-outline bg-base-100 justify-start font-normal w-full border-base-300">
              {getRepName(newAssignee) || "-Select Employee-"}
            </label>
            <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full border border-base-300">
              <input 
                type="text" 
                placeholder="Search..." 
                className="input input-sm input-bordered w-full mb-2"
                value={assigneeSearch}
                onChange={e => setAssigneeSearch(e.target.value)}
              />
              <ul className="max-h-60 overflow-y-auto">
                {filteredReps.map((rep: any) => {
                  const name = rep.fullName || rep.memberId?.name || "Unknown";
                  const id = rep.memberId?._id || rep._id;
                  return (
                  <li key={id}>
                    <a onClick={() => { setNewAssignee(id); (document.activeElement as HTMLElement)?.blur(); }}>{name}</a>
                  </li>
                )})}
              </ul>
            </div>
          </div>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => { setBulkAssignModalOpen(false); setNewAssignee(""); setAssigneeSearch(""); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkAssign} disabled={!newAssignee}>Assign</button>
          </div>
        </div>
      </dialog>

      <dialog className={`modal ${bulkDeleteModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Bulk Delete</h3>
          <p className="py-4">Are you sure you want to delete {Object.keys(rowSelection).length} selected tasks? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setBulkDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error" onClick={handleBulkDelete}>Delete</button>
          </div>
        </div>
      </dialog> 

      <dialog className={`modal ${editModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-4xl">
          <h3 className="font-bold text-lg mb-4">Edit Task</h3>
          {taskToEdit && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Task Title</span></label>
                  <input type="text" className="input input-bordered w-full" value={taskToEdit.title} onChange={(e) => setTaskToEdit({...taskToEdit, title: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Customer</span></label>
                  <input type="text" className="input input-bordered w-full" value={taskToEdit.customer} onChange={(e) => setTaskToEdit({...taskToEdit, customer: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Assigned To</span></label>
                  <div className="dropdown w-full">
                    <input 
                      type="text" 
                      className="input input-bordered w-full" 
                      value={getRepName(taskToEdit.assignedTo)} 
                      readOnly
                      placeholder="-Select Employee-"
                      tabIndex={0}
                    />
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto z-50 border border-base-300">
                      {salesReps.map((rep: any) => {
                        const name = rep.fullName || rep.memberId?.name || "Unknown";
                        const id = rep.memberId?._id || rep._id;
                        return (
                        <li key={id}>
                          <a onClick={() => { setTaskToEdit({...taskToEdit, assignedTo: id}); (document.activeElement as HTMLElement)?.blur(); }}>{name}</a>
                        </li>
                      )})}
                    </ul>
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Task Type</span></label>
                  <select className="select select-bordered w-full" value={taskToEdit.type} onChange={(e) => setTaskToEdit({...taskToEdit, type: e.target.value})}>
                    <option value="Lead Follow-up">Lead Follow-up</option>
                    <option value="Client Meeting">Client Meeting</option>
                    <option value="Demo">Demo</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Proposal Submission">Proposal Submission</option>
                    <option value="Contract Negotiation">Contract Negotiation</option>
                    <option value="Payment Collection">Payment Collection</option>
                    <option value="Upselling">Upselling</option>
                    <option value="Customer Visit">Customer Visit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Status</span></label>
                  <select className="select select-bordered w-full" value={taskToEdit.status} onChange={(e) => setTaskToEdit({...taskToEdit, status: e.target.value as any})}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Opportunity Stage</span></label>
                  <select className="select select-bordered w-full" value={taskToEdit.stage} onChange={(e) => setTaskToEdit({...taskToEdit, stage: e.target.value})}>
                    <option value="N/A">N/A</option>
                    <option value="New Lead">New Lead</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Start Date</span></label>
                  <input type="date" className="input input-bordered w-full" value={taskToEdit.startDate} onChange={(e) => setTaskToEdit({...taskToEdit, startDate: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Due Date</span></label>
                  <input type="date" className="input input-bordered w-full" value={taskToEdit.dueDate} onChange={(e) => setTaskToEdit({...taskToEdit, dueDate: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Follow-up Date</span></label>
                  <input type="date" className="input input-bordered w-full" value={taskToEdit.followUpDate} onChange={(e) => setTaskToEdit({...taskToEdit, followUpDate: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Priority</span></label>
                  <select className="select select-bordered w-full" value={taskToEdit.priority} onChange={(e) => setTaskToEdit({...taskToEdit, priority: e.target.value as any})}>
                    <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Deal Value (₹)</span></label>
                  <input type="number" className="input input-bordered w-full" value={taskToEdit.dealValue} onChange={(e) => setTaskToEdit({...taskToEdit, dealValue: Number(e.target.value)})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Progress (%)</span></label>
                  <input type="number" min="0" max="100" className="input input-bordered w-full" value={taskToEdit.progress} onChange={(e) => setTaskToEdit({...taskToEdit, progress: Number(e.target.value)})} />
                </div>
              </div>
              <div className="modal-action mt-6">
                <button type="button" className="btn btn-ghost" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          )}
        </div>
      </dialog>

      <dialog className={`modal ${followUpModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Set Follow-up Date</h3>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Follow-up Date</span></label>
            <input 
              type="date" 
              className="input input-bordered w-full" 
              value={newFollowUpDate} 
              onChange={(e) => setNewFollowUpDate(e.target.value)} 
            />
          </div>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => setFollowUpModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleFollowUpSubmit} disabled={!newFollowUpDate}>Set Date</button>
          </div>
        </div>
      </dialog>

      {/* Success Modal */}
      <dialog className={`modal ${successModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box flex flex-col items-center justify-center p-8">
          <MdCheckCircle className="text-success w-16 h-16 mb-4" />
          <h3 className="font-bold text-xl text-center mb-2">Success!</h3>
          <p className="text-base-content/80 text-center">{successMessage}</p>
          <div className="modal-action mt-6 w-full justify-center">
            <button className="btn btn-primary px-8" onClick={() => setSuccessModalOpen(false)}>Close</button>
          </div>
        </div>
      </dialog>

    </div>
  );
}