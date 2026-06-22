import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  MdSearch,
  MdFilterList,
  MdAdd,
  MdMoreVert,
  MdDownload,
  MdUpload,
  MdRefresh,
  MdViewList,
  MdViewKanban,
  MdClose,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdWarning,
  MdSupportAgent,
  MdAssignmentInd,
  MdTimeline,
  MdNotes,
  MdAttachment,
  MdHistory,
  MdBarChart,
  MdTrendingUp
} from "react-icons/md";
import { toast } from "react-toastify";
import { useAuth } from "@/auth/AuthContext";
import { getCases, updateCase, deleteCase, createCase, type Case } from "@/services/caseServices";
import { getSalesReps } from "@/services/salesRepServices";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import ImportExportActions from "@/components/import-export/ImportExportActions";
import type { ColumnConfig } from "@/type/importExport.types";

const caseColumns: ColumnConfig[] = [
  { key: "caseNumber", label: "Case Number", type: "string" },
  { key: "subject", label: "Subject", required: true, type: "string" },
  { key: "description", label: "Description", required: true, type: "string" },
  { key: "customer", label: "Customer", required: true, type: "string" },
  { key: "product", label: "Product", type: "string" },
  { key: "type", label: "Case Type", type: "string" },
  { key: "priority", label: "Priority", type: "string" },
  { key: "status", label: "Status", type: "string" },
  { key: "assignedRep", label: "Assigned Rep", type: "string" },
  { key: "dueDate", label: "Due Date", type: "date" },
];

/* ─────────────────────────── Component ─────────────────────────── */
export default function AllCase() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [view, setView] = useState<"table" | "kanban" | "analytics">("table");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modal & Drawer State
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "comments" | "attachments" | "resolution">("overview");
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Case["status"]>("Open");
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [newAssignee, setNewAssignee] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<"Internal" | "Customer">("Internal");
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<Case | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [caseToAssign, setCaseToAssign] = useState<Case | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Data Fetching
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cases", auth.slug],
    queryFn: () => getCases(auth.slug || "default-tenant"),
  });

  const { data: repsData } = useQuery({
    queryKey: ["salesReps", auth.slug],
    queryFn: () => getSalesReps(auth.slug || "default-tenant"),
  });

  const salesReps = useMemo(() => repsData?.data?.map((r: any) => r.memberId?.name || r.name || r.fullName).filter(Boolean) || [], [repsData]);
  const cases: Case[] = useMemo(() => {
    return (data?.data || []).map((c: any) => ({
      ...c,
      id: c._id || c.id,
    }));
  }, [data]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; payload: Partial<Case> }) => updateCase(vars.id, vars.payload, auth.slug || "default-tenant"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cases"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCase(id, auth.slug || "default-tenant"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cases"] }),
  });

  // Helpers
  const filteredCases = useMemo(() => {
    return cases.filter(c => 
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) || 
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.customer.toLowerCase().includes(search.toLowerCase()) ||
      c.product?.toLowerCase().includes(search.toLowerCase())
    );
  }, [cases, search]);

  const getSelectedCases = () => Object.keys(rowSelection).map(Number).map(index => filteredCases[index]);

  // Action Handlers
  const handleBulkStatusUpdate = async () => {
    const selected = getSelectedCases();
    try {
      await Promise.all(selected.map(c => updateMutation.mutateAsync({ id: c.id, payload: { status: newStatus } })));
      setBulkStatusModalOpen(false);
      setRowSelection({});
      setSuccessMessage(`Status updated to ${newStatus} for selected cases!`);
      setSuccessModalOpen(true);
    } catch (err) { toast.error("Failed to update status."); 
      console.error(err);
    }

  };

  const handleBulkAssign = async () => {
    const selected = getSelectedCases();
    if (!newAssignee) return;
    try {
      await Promise.all(selected.map(c => updateMutation.mutateAsync({ id: c.id, payload: { assignedRep: newAssignee } })));
      setBulkAssignModalOpen(false);
      setRowSelection({});
      setSuccessMessage(`Assigned ${selected.length} cases to ${newAssignee}!`);
      setSuccessModalOpen(true);
    } catch (err) { toast.error("Failed to assign cases."); 
      console.error(err);
    }
  };

  const handleBulkEscalate = async () => {
    const selected = getSelectedCases();
    try {
      await Promise.all(selected.map(c => updateMutation.mutateAsync({ id: c.id, payload: { status: "Escalated" } })));
      setRowSelection({});
      setSuccessMessage(`Escalated ${selected.length} cases!`);
      setSuccessModalOpen(true);
      if (selectedCase && selected.some(c => c.id === selectedCase.id)) {
        setSelectedCase({ ...selectedCase, status: "Escalated" });
      }
    } catch (err) { toast.error("Failed to escalate cases."); 
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    const selected = getSelectedCases();
    try {
      await Promise.all(selected.map(c => deleteMutation.mutateAsync(c.id)));
      setBulkDeleteModalOpen(false);
      setRowSelection({});
      setSuccessMessage(`Deleted ${selected.length} cases!`);
      setSuccessModalOpen(true);
      if (selectedCase && selected.some(c => c.id === selectedCase.id)) setSelectedCase(null);
    } catch (err) {
      toast.error("Failed to delete some cases.");
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!caseToDelete) return;
    try {
      await deleteMutation.mutateAsync(caseToDelete);
      setDeleteModalOpen(false);
      if (selectedCase?.id === caseToDelete) {
        setSelectedCase(null);
      }
      setCaseToDelete(null);
      setSuccessMessage("Case deleted successfully!");
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to delete case.");
      console.error(error);
    }
  };

  const initiateDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCaseToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseToEdit) return;
    try {
      await updateMutation.mutateAsync({ id: caseToEdit.id, payload: caseToEdit });
      setEditModalOpen(false);
      setSuccessMessage("Case updated successfully!");
      setSuccessModalOpen(true);
      if (selectedCase?.id === caseToEdit.id) {
        setSelectedCase(caseToEdit);
      }
    } catch (error) {
      toast.error("Failed to update case.");
    }
  };

  const handleStatusChange = async (id: string, status: Case["status"]) => {
    try {
      await updateMutation.mutateAsync({ id, payload: { status } });
      setSuccessMessage(`Case status updated to ${status}!`);
      setSuccessModalOpen(true);
      if (selectedCase?.id === id) setSelectedCase({ ...selectedCase, status });
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleAddComment = async () => {
    if (!selectedCase || !newComment.trim()) return;
    const updatedComments = [
      ...(selectedCase.comments || []), 
      { id: Date.now().toString(), type: commentType, user: "Current Admin", text: newComment, timestamp: new Date().toISOString() }
    ];
    try {
      await updateMutation.mutateAsync({ id: selectedCase.id, payload: { comments: updatedComments }});
      setSelectedCase({ ...selectedCase, comments: updatedComments });
      setNewComment("");
      setSuccessMessage("Comment added.");
      setSuccessModalOpen(true);
    } catch(err) { toast.error("Failed to add comment."); }
  };

  const handleDrop = async (e: React.DragEvent, status: Case["status"]) => {
    const caseId = e.dataTransfer.getData("caseId");
    if (caseId) {
      try {
        await updateMutation.mutateAsync({ id: caseId, payload: { status } });
        setSuccessMessage(`Case moved to ${status}`);
        setSuccessModalOpen(true);
      } catch(err) { toast.error("Failed to move case."); }
    }
  };

  const handleAssign = async () => {
    if (!caseToAssign || !newAssignee) return;
    try {
      await updateMutation.mutateAsync({ id: caseToAssign.id, payload: { assignedRep: newAssignee } });
      setAssignModalOpen(false);
      setCaseToAssign(null);
      setSuccessMessage(`Case assigned to ${newAssignee}!`);
      setSuccessModalOpen(true);
      if (selectedCase?.id === caseToAssign.id) setSelectedCase({ ...selectedCase, assignedRep: newAssignee });
    } catch (err) { toast.error("Failed to assign case."); }
  };

  const handleReplyToCustomer = () => {
    setActiveTab("comments");
    setCommentType("Customer");
  };

  const handleImportSubmit = async (validRows: any[]) => {
    await Promise.all(validRows.map(row => createCase(auth.slug || "default-tenant", row as Partial<Case>)));
    queryClient.invalidateQueries({ queryKey: ["cases"] });
  };
  
  // Stats & Analytics Data
  const stats = useMemo(() => ({
    total: cases.length,
    open: cases.filter(c => c.status === "Open" || c.status === "Assigned").length,
    inProgress: cases.filter(c => c.status === "In Progress" || c.status === "Waiting For Customer").length,
    resolved: cases.filter(c => c.status === "Resolved").length,
    closed: cases.filter(c => c.status === "Closed").length,
    escalated: cases.filter(c => c.status === "Escalated").length,
    highPriority: cases.filter(c => c.priority === "High" || c.priority === "Critical").length,
    avgResolution: "4.2 Hrs", // Mock
  }), [cases]);

  const statusData = [
    { name: 'Open', value: stats.open, color: '#3b82f6' },
    { name: 'In Progress', value: stats.inProgress, color: '#8b5cf6' },
    { name: 'Resolved/Closed', value: stats.resolved + stats.closed, color: '#10b981' },
    { name: 'Escalated', value: stats.escalated, color: '#ef4444' },
  ];

  // TanStack Table
  const columnHelper = createColumnHelper<Case>();
  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />,
      cell: ({ row }) => <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} onClick={e => e.stopPropagation()} />,
    }),
    columnHelper.accessor("caseNumber", {
      header: "Case Number",
      cell: (info) => <span className="font-mono font-bold text-primary hover:underline cursor-pointer">{info.getValue()}</span>,
    }),
    columnHelper.accessor("subject", {
      header: "Subject",
      cell: (info) => <span className="font-medium truncate max-w-[200px] block" title={info.getValue()}>{info.getValue()}</span>,
    }),
    columnHelper.accessor("customer", { header: "Customer", cell: info => <span className="font-medium">{info.getValue()}</span> }),
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => {
        const val = info.getValue();
        const colors: Record<string, string> = { "Critical": "badge-error text-white", "High": "badge-warning", "Medium": "badge-info", "Low": "badge-ghost" };
        return <span className={`badge badge-sm font-semibold border-none ${colors[val]}`}>{val}</span>;
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const val = info.getValue();
        const colors: Record<string, string> = {
          "Open": "badge-primary", "Assigned": "badge-secondary", "In Progress": "badge-info",
          "Waiting For Customer": "badge-warning", "Resolved": "badge-success text-white", "Closed": "badge-neutral", "Escalated": "badge-error text-white"
        };
        return <span className={`badge badge-sm border-none shadow-sm ${colors[val]}`}>{val}</span>;
      },
    }),
    columnHelper.accessor("slaStatus", {
      header: "SLA",
      cell: (info) => {
        const val = info.getValue();
        const color = val === "On Track" ? "text-success" : val === "Near Breach" ? "text-warning" : "text-error font-bold";
        return <span className={`text-xs ${color} flex items-center gap-1`}>{val === "Breached" && <MdWarning/>}{val}</span>;
      }
    }),
    columnHelper.accessor("assignedRep", { header: "Assigned To" }),
    columnHelper.accessor("dueDate", { header: "Due Date", cell: info => <span className="text-xs">{info.getValue() ? new Date(info.getValue() as string).toLocaleDateString() : "—"}</span> }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="dropdown dropdown-end" onClick={e => e.stopPropagation()}>
          <button tabIndex={0} className="btn btn-ghost btn-xs btn-square"><MdMoreVert size={18} /></button>
          <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-40 border border-base-200">
            <li><a onClick={() => setSelectedCase(row.original)}><MdSupportAgent size={16} /> View Details</a></li>
            <li><a onClick={(e) => { e.stopPropagation(); setCaseToEdit(row.original); setEditModalOpen(true); }}><MdEdit size={16} /> Edit Case</a></li>
            <div className="divider my-1"></div>
            <li><a className="text-warning" onClick={() => handleStatusChange(row.original.id, "Escalated")}><MdTrendingUp size={16} /> Escalate</a></li>
            <li><a className="text-error" onClick={(e) => initiateDelete(e, row.original.id)}><MdDelete size={16} /> Delete</a></li>
          </ul>
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: filteredCases, columns, state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans flex flex-col h-full overflow-hidden relative">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Cases Management</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1 font-medium">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li className="text-primary">Cases</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
        <ImportExportActions
          moduleName="Cases"
          columns={caseColumns}
          data={filteredCases}
          selectedData={getSelectedCases()}
          onImportSubmit={handleImportSubmit}
        />
          <button onClick={() => refetch()} className="btn btn-outline btn-sm btn-square bg-base-100"><MdRefresh size={16} /></button>
          <button onClick={() => navigate("/sales/cases/new")} className="btn btn-primary btn-sm gap-2 shadow-sm"><MdAdd size={16} /> Create Case</button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {[
          { label: "Total Cases", value: stats.total, color: "text-base-content" },
          { label: "Open", value: stats.open, color: "text-primary" },
          { label: "In Progress", value: stats.inProgress, color: "text-info" },
          { label: "Resolved", value: stats.resolved, color: "text-success" },
          { label: "Closed", value: stats.closed, color: "text-base-content/50" },
          { label: "Escalated", value: stats.escalated, color: "text-error" },
          { label: "High Priority", value: stats.highPriority, color: "text-warning" },
          { label: "Avg Resolution", value: stats.avgResolution, color: "text-secondary" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <span className={`text-xl font-black mt-1 ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-base-content/60 font-bold uppercase tracking-wider text-center mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-base-100 p-3 rounded-xl border border-base-300 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={18} />
            <input type="text" placeholder="Search cases, customers, products..." value={search} onChange={(e) => setSearch(e.target.value)} className="input input-sm input-bordered w-full pl-9 focus:outline-none focus:border-primary" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn btn-sm ${showFilters ? "btn-primary" : "btn-outline bg-base-100"} gap-2`}><MdFilterList size={16} /> Filters</button>
        </div>
        <div className="flex bg-base-200 p-1 rounded-lg border border-base-300">
          <button onClick={() => setView("table")} className={`btn btn-sm btn-ghost px-3 ${view === "table" ? "bg-base-100 shadow-sm" : ""}`}><MdViewList size={18} /> Table</button>
          <button onClick={() => setView("kanban")} className={`btn btn-sm btn-ghost px-3 ${view === "kanban" ? "bg-base-100 shadow-sm" : ""}`}><MdViewKanban size={18} /> Kanban</button>
          <button onClick={() => setView("analytics")} className={`btn btn-sm btn-ghost px-3 ${view === "analytics" ? "bg-base-100 shadow-sm" : ""}`}><MdBarChart size={18} /> Analytics</button>
        </div>
      </div>

      {/* ── Advanced Filters Panel ── */}
      {showFilters && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 shadow-sm animate-fade-in-down">
          <div><label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">Status</label><select className="select select-sm select-bordered w-full"><option>All</option><option>Open</option><option>Resolved</option></select></div>
          <div><label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">Priority</label><select className="select select-sm select-bordered w-full"><option>All</option><option>High</option><option>Critical</option></select></div>
          <div><label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">Case Type</label><select className="select select-sm select-bordered w-full"><option>All</option><option>Complaint</option><option>Support Request</option></select></div>
          <div><label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">Assigned Rep</label><select className="select select-sm select-bordered w-full"><option>All</option>{salesReps.map(r => <option key={r}>{r}</option>)}</select></div>
          <div className="col-span-full flex justify-end gap-2 mt-2 pt-4 border-t border-base-200">
            <button className="btn btn-sm btn-ghost">Reset Filters</button>
            <button className="btn btn-sm btn-primary">Apply Filters</button>
          </div>
        </div>
      )}

      {/* ── Bulk Actions ── */}
      {Object.keys(rowSelection).length > 0 && view === "table" && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between shadow-sm animate-fade-in-up">
          <span className="text-sm font-semibold text-primary">{Object.keys(rowSelection).length} cases selected</span>
          <div className="flex gap-2">
            <button className="btn btn-xs btn-primary" onClick={() => setBulkStatusModalOpen(true)}>Change Status</button>
            <button className="btn btn-xs btn-outline bg-base-100" onClick={() => setBulkAssignModalOpen(true)}>Assign Cases</button>
            <button className="btn btn-xs btn-warning text-white" onClick={handleBulkEscalate}>Escalate</button>
            <button className="btn btn-xs btn-error btn-outline" onClick={() => setBulkDeleteModalOpen(true)}>Delete</button>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      {isLoading ? (
        <div className="flex-1 flex flex-col justify-center items-center h-full"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : (
        <div className="flex-1 bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
          
          {/* VIEW: TABLE */}
          {view === "table" && (
            <div className="flex-1 overflow-auto flex flex-col">
              <div className="flex-1">
                <table className="table table-pin-rows w-full text-sm">
                  <thead>
                    {table.getHeaderGroups().map(hg => (
                      <tr key={hg.id} className="bg-base-200/50 text-base-content/70">
                        {hg.headers.map(h => (
                          <th key={h.id} className="font-semibold py-3 cursor-pointer" onClick={h.column.getToggleSortingHandler()}>
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {{ asc: " 🔼", desc: " 🔽" }[h.column.getIsSorted() as string] ?? null}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-base-200/50 transition-colors cursor-pointer border-b border-base-200" onClick={() => setSelectedCase(row.original)}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))}
                    {table.getRowModel().rows.length === 0 && (
                      <tr><td colSpan={columns.length} className="text-center py-16 text-base-content/50">No cases found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Footer */}
              <div className="border-t border-base-300 p-3 bg-base-100 flex items-center justify-between text-sm mt-auto">
                <span className="text-base-content/60 font-medium">Showing {table.getRowModel().rows.length} of {filteredCases.length} cases</span>
                <div className="flex items-center gap-3">
                  <select className="select select-sm select-bordered bg-base-200" value={table.getState().pagination.pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))}>
                    {[10, 25, 50, 100].map(sz => <option key={sz} value={sz}>Show {sz}</option>)}
                  </select>
                  <div className="join">
                    <button className="join-item btn btn-sm bg-base-200" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>«</button>
                    <button className="join-item btn btn-sm bg-base-200">Page {table.getState().pagination.pageIndex + 1}</button>
                    <button className="join-item btn btn-sm bg-base-200" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>»</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: KANBAN */}
          {view === "kanban" && (
            <div className="flex-1 overflow-x-auto p-4 flex gap-4 bg-base-200/30">
              {(["Open", "Assigned", "In Progress", "Waiting For Customer", "Resolved", "Closed"] as const).map(status => (
                <div key={status} className="flex-none w-72 bg-base-100 rounded-xl border border-base-300 flex flex-col max-h-full" onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, status)}>
                  <div className="p-3 border-b border-base-200 font-bold flex justify-between items-center bg-base-200/30 rounded-t-xl">
                    <span className="text-sm">{status}</span>
                    <span className="badge badge-sm">{filteredCases.filter(c => c.status === status).length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-3">
                    {filteredCases.filter(c => c.status === status).map(c => (
                      <div key={c.id} draggable onDragStart={e => e.dataTransfer.setData("caseId", c.id)} onClick={() => setSelectedCase(c)} className="bg-base-100 p-3 rounded-lg border border-base-300 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold font-mono text-primary">{c.caseNumber}</span>
                          <span className={`badge badge-xs ${c.priority === 'Critical' ? 'badge-error' : c.priority === 'High' ? 'badge-warning' : 'badge-ghost'}`}>{c.priority}</span>
                        </div>
                        <h4 className="text-sm font-semibold leading-tight mb-2 truncate" title={c.subject}>{c.subject}</h4>
                        <p className="text-xs text-base-content/60 truncate">{c.customer}</p>
                        <div className="mt-3 flex justify-between items-center text-xs text-base-content/50 border-t border-base-200 pt-2">
                          <span>{c.assignedRep.split(" ")[0]}</span>
                          <span className={c.slaStatus === 'Breached' ? 'text-error font-bold' : ''}>{c.dueDate ? new Date(c.dueDate).toLocaleDateString() : "No Due Date"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW: ANALYTICS */}
          {view === "analytics" && (
            <div className="flex-1 overflow-y-auto p-6 bg-base-200/30 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-base-100 border border-base-300 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-base-content mb-4 text-sm uppercase tracking-wider">Cases by Status</h3>
                  <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>{statusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><RechartsTooltip /><Legend /></PieChart></ResponsiveContainer></div>
                </div>
                <div className="bg-base-100 border border-base-300 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-base-content mb-4 text-sm uppercase tracking-wider">Representative Performance (Resolved Cases)</h3>
                  <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{name: 'Vinay', cases: 45}, {name: 'Riya', cases: 38}, {name: 'Arjun', cases: 29}]}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--b3))"/><XAxis dataKey="name" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><RechartsTooltip cursor={{fill: 'transparent'}}/><Bar dataKey="cases" fill="#8b5cf6" radius={[4,4,0,0]} barSize={40}/></BarChart></ResponsiveContainer></div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Case Details Drawer ── */}
      <div className={`fixed inset-0 bg-black/40 z-[100] transition-opacity ${selectedCase ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setSelectedCase(null)}>
        <div className={`absolute right-0 top-0 h-full w-full md:w-[750px] bg-base-100 shadow-2xl transition-transform duration-300 transform ${selectedCase ? "translate-x-0" : "translate-x-full"} flex flex-col`} onClick={e => e.stopPropagation()}>
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-base-300 bg-base-200/50 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-lg font-bold text-primary">{selectedCase?.caseNumber}</span>
                  <span className="badge badge-sm badge-outline">{selectedCase?.type}</span>
                  <span className={`badge badge-sm ${selectedCase?.status === 'Resolved' ? 'badge-success text-white' : selectedCase?.status === 'Escalated' ? 'badge-error text-white' : 'badge-primary'}`}>{selectedCase?.status}</span>
                </div>
                <h2 className="text-xl font-bold text-base-content leading-tight mt-2">{selectedCase?.subject}</h2>
                <p className="text-sm font-medium text-base-content/60 mt-1">Customer: <span className="text-base-content font-bold">{selectedCase?.customer}</span></p>
              </div>
              <button onClick={() => setSelectedCase(null)} className="btn btn-ghost btn-circle btn-sm bg-base-200"><MdClose size={20} /></button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary btn-sm" onClick={handleReplyToCustomer}><MdSupportAgent /> Reply to Customer</button>
              <button className="btn btn-outline btn-sm bg-base-100" onClick={() => { setCaseToEdit(selectedCase); setEditModalOpen(true); }}><MdEdit /> Edit Case</button>
              <button className="btn btn-outline btn-sm bg-base-100" onClick={() => { setCaseToAssign(selectedCase); setAssignModalOpen(true); }}><MdAssignmentInd /> Reassign</button>
              <button className="btn btn-outline btn-sm btn-error bg-base-100" onClick={() => selectedCase && handleStatusChange(selectedCase.id, "Escalated")}><MdTrendingUp /> Escalate</button>
              <div className="dropdown dropdown-end ml-auto">
                <button tabIndex={0} className="btn btn-outline btn-sm btn-square bg-base-100"><MdMoreVert size={18}/></button>
                <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-40 mt-1 border border-base-200">
                  <li><a className="text-success" onClick={() => selectedCase && handleStatusChange(selectedCase.id, "Resolved")}><MdCheckCircle /> Resolve</a></li>
                  <li><a onClick={() => selectedCase && handleStatusChange(selectedCase.id, "Closed")}><MdClose /> Close</a></li>
                  <div className="divider my-1"></div>
                  <li><a className="text-error" onClick={(e) => selectedCase && initiateDelete(e, selectedCase.id)}><MdDelete /> Delete</a></li>
                </ul>
              </div>
            </div>

            <div className="tabs tabs-bordered w-full border-b border-base-300 mt-2">
              <a className={`tab font-medium ${activeTab === 'overview' ? 'tab-active text-primary' : ''}`} onClick={() => setActiveTab("overview")}>Overview</a>
              <a className={`tab font-medium ${activeTab === 'timeline' ? 'tab-active text-primary' : ''}`} onClick={() => setActiveTab("timeline")}>Timeline</a>
              <a className={`tab font-medium flex items-center gap-1 ${activeTab === 'comments' ? 'tab-active text-primary' : ''}`} onClick={() => setActiveTab("comments")}>Comments <span className="badge badge-xs">{selectedCase?.comments?.length || 0}</span></a>
              <a className={`tab font-medium ${activeTab === 'attachments' ? 'tab-active text-primary' : ''}`} onClick={() => setActiveTab("attachments")}>Attachments</a>
              <a className={`tab font-medium ${activeTab === 'resolution' ? 'tab-active text-primary' : ''}`} onClick={() => setActiveTab("resolution")}>Resolution</a>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-base-100">
            
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in">
                
                {selectedCase?.slaStatus === "Breached" && (
                  <div className="alert alert-error shadow-sm py-2 rounded-xl text-white">
                    <MdWarning size={20} />
                    <span className="text-sm font-bold">SLA Breached! Resolution time exceeded the target.</span>
                  </div>
                )}

                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-4 flex items-center gap-2"><MdSupportAgent /> Case Details</h3>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm">
                    <div className="col-span-2 bg-base-200/50 p-4 rounded-lg border border-base-200">
                      <p className="text-base-content/50 mb-1 font-semibold uppercase text-xs">Description</p>
                      <p className="text-base-content whitespace-pre-line">{selectedCase?.description}</p>
                    </div>
                    <div><p className="text-base-content/50 mb-1 text-xs uppercase font-semibold">Priority</p><span className="font-bold text-warning">{selectedCase?.priority}</span></div>
                    <div><p className="text-base-content/50 mb-1 text-xs uppercase font-semibold">Assigned Rep</p><p className="font-medium">{selectedCase?.assignedRep}</p></div>
                    <div><p className="text-base-content/50 mb-1 text-xs uppercase font-semibold">Product</p><p className="font-medium">{selectedCase?.product || "—"}</p></div>
                    <div><p className="text-base-content/50 mb-1 text-xs uppercase font-semibold">Related Order</p><p className="font-mono text-primary cursor-pointer hover:underline">{selectedCase?.relatedOrder || "—"}</p></div>
                  </div>
                </section>
                
                <div className="divider my-0"></div>

                <section className="grid grid-cols-2 gap-4">
                  <div className="bg-base-200/30 p-4 rounded-xl border border-base-200 text-xs space-y-2">
                    <p className="text-base-content/50 font-bold uppercase mb-2 border-b border-base-200 pb-1">Dates & Deadlines</p>
                    <p className="flex justify-between"><span className="text-base-content/60">Created:</span> <span className="font-medium">{selectedCase?.createdDate ? new Date(selectedCase.createdDate).toLocaleString() : (selectedCase as any)?.createdAt ? new Date((selectedCase as any).createdAt).toLocaleString() : "N/A"}</span></p>
                    <p className="flex justify-between"><span className="text-base-content/60">Due Date:</span> <span className="font-medium">{selectedCase?.dueDate ? new Date(selectedCase.dueDate).toLocaleDateString() : "N/A"}</span></p>
                    <p className="flex justify-between"><span className="text-base-content/60">Last Updated:</span> <span className="font-medium">{selectedCase?.lastUpdated ? new Date(selectedCase.lastUpdated).toLocaleString() : (selectedCase as any)?.updatedAt ? new Date((selectedCase as any).updatedAt).toLocaleString() : "N/A"}</span></p>
                  </div>
                  <div className="bg-base-200/30 p-4 rounded-xl border border-base-200 text-xs space-y-2">
                    <p className="text-base-content/50 font-bold uppercase mb-2 border-b border-base-200 pb-1">SLA Tracking</p>
                    <p className="flex justify-between"><span className="text-base-content/60">SLA Status:</span> <span className={`font-bold ${selectedCase?.slaStatus === 'On Track' ? 'text-success' : 'text-error'}`}>{selectedCase?.slaStatus}</span></p>
                    <p className="flex justify-between"><span className="text-base-content/60">Response Target:</span> <span className="font-medium">2 Hours</span></p>
                    <p className="flex justify-between"><span className="text-base-content/60">Resolution Target:</span> <span className="font-medium">48 Hours</span></p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="animate-fade-in max-w-2xl mx-auto py-4">
                <ul className="timeline timeline-vertical timeline-compact max-md:timeline-compact">
                  {selectedCase?.timeline?.map((t, idx) => (
                    <li key={t.id}>
                      {idx !== 0 && <hr className="bg-primary" />}
                      <div className="timeline-middle">
                        <MdCheckCircle className="text-primary" />
                      </div>
                      <div className="timeline-end timeline-box bg-base-200/50 border-none shadow-sm text-sm py-2 ml-2">
                        <span className="font-semibold block">{t.action}</span>
                        <span className="text-xs text-base-content/50">{t.user} • {t.timestamp ? new Date(t.timestamp).toLocaleString() : "Unknown Time"}</span>
                      </div>
                      {idx !== (selectedCase?.timeline?.length || 0) - 1 && <hr className="bg-primary" />}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="animate-fade-in flex flex-col h-full gap-4">
                <div className="flex-1 space-y-4 overflow-y-auto mb-4 bg-base-200/20 p-4 rounded-xl border border-base-200">
                  {!selectedCase?.comments || selectedCase.comments.length === 0 ? (
                    <p className="text-center text-sm text-base-content/40 py-8">No comments yet.</p>
                  ) : (
                    selectedCase.comments.map(c => (
                      <div key={c.id} className={`chat ${c.type === 'Internal' ? 'chat-end' : 'chat-start'}`}>
                        <div className="chat-header text-xs mb-1">
                          {c.user} <time className="text-xs opacity-50 ml-1">{c.timestamp ? new Date(c.timestamp).toLocaleString() : "Unknown Time"}</time>
                        </div>
                        <div className={`chat-bubble text-sm ${c.type === 'Internal' ? 'chat-bubble-primary' : 'bg-base-300 text-base-content'}`}>
                          {c.type === 'Internal' && <span className="block text-[10px] font-bold uppercase mb-1 opacity-70">Internal Note</span>}
                          {c.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="bg-base-200 p-4 rounded-xl border border-base-300">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold">Add Comment</label>
                    <div className="flex gap-2">
                      <label className="cursor-pointer label p-0 gap-2"><input type="radio" name="ctype" className="radio radio-xs radio-primary" checked={commentType==='Internal'} onChange={()=>setCommentType('Internal')} /><span className="text-xs font-semibold">Internal Note</span></label>
                      <label className="cursor-pointer label p-0 gap-2"><input type="radio" name="ctype" className="radio radio-xs radio-primary" checked={commentType==='Customer'} onChange={()=>setCommentType('Customer')} /><span className="text-xs font-semibold">Customer Reply</span></label>
                    </div>
                  </div>
                  <textarea className={`textarea textarea-bordered w-full text-sm ${commentType==='Internal' ? 'bg-primary/5 border-primary/30' : ''}`} rows={3} placeholder={commentType==='Internal' ? "Write an internal note..." : "Reply to customer (Type @ to mention)..."} value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}></textarea>
                  <div className="flex justify-between items-center mt-2">
                    <button className="btn btn-xs btn-ghost gap-1"><MdAttachment/> Attach File</button>
                    <button className="btn btn-sm btn-primary gap-2" onClick={handleAddComment} disabled={!newComment.trim()}>Post Comment</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attachments" && (
              <div className="animate-fade-in text-center py-12">
                <MdAttachment size={48} className="mx-auto text-base-content/20 mb-4" />
                <h3 className="font-bold text-base-content/70">No attachments</h3>
                <p className="text-sm text-base-content/50 mb-4">Upload files related to this case.</p>
                <button className="btn btn-sm btn-outline">Upload File</button>
              </div>
            )}

            {activeTab === "resolution" && (
              <div className="animate-fade-in">
                {selectedCase?.status === "Resolved" || selectedCase?.status === "Closed" ? (
                  <div className="bg-success/10 border border-success/20 rounded-xl p-5">
                    <h3 className="font-bold text-success flex items-center gap-2 mb-4"><MdHistory /> Resolution Details</h3>
                    <div className="space-y-4 text-sm">
                      <p><span className="font-semibold block text-xs uppercase text-success/70 mb-1">Resolution Notes</span>{selectedCase.resolutionNotes || "No specific notes provided."}</p>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-success/20">
                        <p><span className="font-semibold block text-xs uppercase text-success/70 mb-1">Resolved By</span>{selectedCase.assignedRep}</p>
                        <p><span className="font-semibold block text-xs uppercase text-success/70 mb-1">Date & Time</span>{selectedCase.resolutionDate ? new Date(selectedCase.resolutionDate).toLocaleString() : "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-base-200/50 border border-base-200 rounded-xl p-5 text-center py-10">
                    <MdCheckCircle size={48} className="mx-auto text-base-content/20 mb-4" />
                    <h3 className="font-bold text-base-content/70 mb-2">Case is currently open</h3>
                    <p className="text-sm text-base-content/50 mb-6">Resolution details will appear here once the case is resolved.</p>
                    <button className="btn btn-success text-white">Resolve Case Now</button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Bulk Modals ── */}
      <dialog className={`modal ${bulkStatusModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Update Status for Selected Cases</h3>
          <select className="select select-bordered w-full" value={newStatus} onChange={(e) => setNewStatus(e.target.value as Case["status"])}>
            <option>Open</option><option>Assigned</option><option>In Progress</option><option>Waiting For Customer</option><option>Resolved</option><option>Closed</option>
          </select>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => setBulkStatusModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkStatusUpdate}>Update Status</button>
          </div>
        </div>
      </dialog>

      <dialog className={`modal ${bulkAssignModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Assign Cases</h3>
          <div className="dropdown w-full">
            <label tabIndex={0} className="btn btn-outline bg-base-100 justify-start font-normal w-full border-base-300">{newAssignee || "-Select Representative-"}</label>
            <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full border border-base-300">
              <input type="text" placeholder="Search..." className="input input-sm input-bordered w-full mb-2" value={assigneeSearch} onChange={e => setAssigneeSearch(e.target.value)} />
              <ul className="max-h-60 overflow-y-auto">
                {salesReps.filter((r:string) => r.toLowerCase().includes(assigneeSearch.toLowerCase())).map((rep: string) => (
                  <li key={rep}><a onClick={() => { setNewAssignee(rep); (document.activeElement as HTMLElement)?.blur(); }}>{rep}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => {setBulkAssignModalOpen(false); setNewAssignee("");}}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkAssign} disabled={!newAssignee}>Assign</button>
          </div>
        </div>
      </dialog>

      {/* ── Bulk Delete Confirmation Modal ── */}
      <dialog className={`modal ${bulkDeleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Confirm Bulk Deletion</h3>
          <p className="py-4">Are you sure you want to delete {Object.keys(rowSelection).length} selected case(s)? This action cannot be undone.</p>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => setBulkDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={handleBulkDelete}>Yes, Delete All</button>
          </div>
        </div>
      </dialog>

      {/* ── Assign Modal for Single Case ── */}
      <dialog className={`modal ${assignModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Assign Case</h3>
          <div className="dropdown w-full">
            <label tabIndex={0} className="btn btn-outline bg-base-100 justify-start font-normal w-full border-base-300">{newAssignee || "-Select Representative-"}</label>
            <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full border border-base-300">
              <input type="text" placeholder="Search..." className="input input-sm input-bordered w-full mb-2" value={assigneeSearch} onChange={e => setAssigneeSearch(e.target.value)} />
              <ul className="max-h-60 overflow-y-auto">
                {salesReps.filter((r:string) => r.toLowerCase().includes(assigneeSearch.toLowerCase())).map((rep: string) => (
                  <li key={rep}><a onClick={() => { setNewAssignee(rep); (document.activeElement as HTMLElement)?.blur(); }}>{rep}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => {setAssignModalOpen(false); setNewAssignee("");}}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAssign} disabled={!newAssignee}>Assign</button>
          </div>
        </div>
      </dialog>

      {/* ── Delete Confirmation Modal ── */}
      <dialog className={`modal ${deleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Confirm Deletion</h3>
          <p className="py-4">Are you sure you want to delete this case? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={confirmDelete}>Yes, Delete</button>
          </div>
        </div>
      </dialog>

      {/* ── Success Modal ── */}
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

      {/* ── Edit Case Modal ── */}
      <dialog className={`modal ${editModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg mb-4">Edit Case</h3>
          {caseToEdit && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Subject</span></label>
                  <input type="text" className="input input-bordered w-full" value={caseToEdit.subject} onChange={(e) => setCaseToEdit({...caseToEdit, subject: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Customer</span></label>
                  <input type="text" className="input input-bordered w-full" value={caseToEdit.customer} onChange={(e) => setCaseToEdit({...caseToEdit, customer: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Product</span></label>
                  <input type="text" className="input input-bordered w-full" value={caseToEdit.product || ""} onChange={(e) => setCaseToEdit({...caseToEdit, product: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Status</span></label>
                  <select className="select select-bordered w-full" value={caseToEdit.status} onChange={(e) => setCaseToEdit({...caseToEdit, status: e.target.value as Case["status"]})}>
                    <option value="Open">Open</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting For Customer">Waiting For Customer</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Priority</span></label>
                  <select className="select select-bordered w-full" value={caseToEdit.priority} onChange={(e) => setCaseToEdit({...caseToEdit, priority: e.target.value as Case["priority"]})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Type</span></label>
                  <select className="select select-bordered w-full" value={caseToEdit.type} onChange={(e) => setCaseToEdit({...caseToEdit, type: e.target.value})}>
                    <option value="Complaint">Complaint</option>
                    <option value="Support Request">Support Request</option>
                    <option value="Product Issue">Product Issue</option>
                    <option value="Refund Request">Refund Request</option>
                    <option value="Warranty Claim">Warranty Claim</option>
                    <option value="Escalation">Escalation</option>
                    <option value="Service Request">Service Request</option>
                  </select>
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text">Description</span></label>
                  <textarea className="textarea textarea-bordered w-full" rows={3} value={caseToEdit.description} onChange={(e) => setCaseToEdit({...caseToEdit, description: e.target.value})}></textarea>
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

    </div>
  )
}
