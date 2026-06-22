import React, { useState, useMemo, useCallback } from "react";
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
  MdViewModule,
  MdBarChart,
  MdClose,
  MdEdit,
  MdDelete,
  MdWarning,
  MdCheckCircle,
  MdPeople,
  MdAssignmentInd,
  MdEmail,
  MdPhone,
  MdTimeline,
} from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { toast } from "react-toastify";
import { useAuth } from "@/auth/AuthContext";
import { getSalesReps, updateSalesRep, deleteSalesRep, createSalesRep, type SalesRep } from "@/services/salesRepServices";
import ImportExportActions from "@/components/import-export/ImportExportActions";
import type { ColumnConfig } from "@/type/importExport.types";

const salesRepColumns: ColumnConfig[] = [
  { key: "employeeCode", label: "Employee Code", required: true, type: "string" },
  { key: "name", label: "Full Name", required: true, type: "string" },
  { key: "email", label: "Email", required: true, type: "email" },
  { key: "phone", label: "Phone", required: true, type: "string" },
  { key: "designation", label: "Designation", type: "string" },
  { key: "team", label: "Team", type: "string" },
  { key: "territory", label: "Territory", type: "string" },
  { key: "status", label: "Status", type: "string" },
  { key: "monthlyTarget", label: "Monthly Target", type: "number" },
];

export default function AllSalesReps() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [view, setView] = useState<"table" | "card" | "analytics">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDesignation, setFilterDesignation] = useState("All");
  const [filterTeam, setFilterTeam] = useState("All");

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [repToDelete, setRepToDelete] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<SalesRep["status"]>("Active");
  const [bulkTeamModalOpen, setBulkTeamModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState("");
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [targetUpdateAmount, setTargetUpdateAmount] = useState<number | "">("");
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Data Fetching
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["salesReps", auth.slug],
    queryFn: () => getSalesReps(auth.slug || "default-tenant"),
  });
  console.log(data)
  const reps = useMemo(() => {
    return (data?.data || []).map((r: any) => ({
      ...r,
      id: r._id || r.id,
      name:r.memberId?.name,
      email:r.memberId?.email,
      phone:r.memberId?.phone,
      joiningDate:r.memberId?.joiningDate,
      status: r.status || r.employmentStatus || "Active",
      achievement: r.achievement || r.monthlyAchievement || 0,
      monthlyTarget: r.monthlyTarget || 0,
      revenueGenerated: r.revenueGenerated || 0,
    }));
  }, [data]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; payload: Partial<SalesRep> }) => updateSalesRep(vars.id, vars.payload, auth.slug || "default-tenant"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesReps"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSalesRep(id, auth.slug || "default-tenant"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesReps"] }),
  });

  // Handlers
  const getSelectedReps = () => Object.keys(rowSelection).map(Number).map(index => filteredReps[index]);

  const initiateDelete = useCallback((id: string) => {
    setRepToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!repToDelete) return;
    try {
      await deleteMutation.mutateAsync(repToDelete);
      setDeleteModalOpen(false);
      setRepToDelete(null);
      if (selectedRep?.id === repToDelete) setSelectedRep(null);
      setSuccessMessage("Representative deleted successfully!");
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to delete representative.");
    }
  };

  const confirmBulkDelete = async () => {
    const selected = getSelectedReps();
    try {
      await Promise.all(selected.map(r => deleteMutation.mutateAsync(r.id)));
      setBulkDeleteModalOpen(false);
      setRowSelection({});
      if (selectedRep && selected.some(so => so.id === selectedRep.id)) {
        setSelectedRep(null);
      }
      setSuccessMessage(`Deleted ${selected.length} representative(s) successfully!`);
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to delete some representatives.");
      console.error(error);
    }
  };

  const handleBulkStatusUpdate = async () => {
    const selected = getSelectedReps();
    try {
      await Promise.all(selected.map(r => updateMutation.mutateAsync({ id: r.id, payload: { status: newStatus, employmentStatus: newStatus } as any })));
      setBulkStatusModalOpen(false);
      setRowSelection({});
      setSuccessMessage(`Status updated to ${newStatus} for selected reps!`);
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to update status.");
      console.error(error);
    }
  };

  const handleImportSubmit = async (validRows: any[]) => {
    await Promise.all(validRows.map(row => createSalesRep(auth.slug || "default-tenant", row as Partial<SalesRep>)));
    queryClient.invalidateQueries({ queryKey: ["salesReps"] });
  };

  const handleBulkTeamUpdate = async () => {
    const selected = getSelectedReps();
    if (!newTeam) return;
    try {
      await Promise.all(selected.map(r => updateMutation.mutateAsync({ id: r.id, payload: { team: newTeam } })));
      setBulkTeamModalOpen(false);
      setRowSelection({});
      setSuccessMessage(`Team updated to ${newTeam} for selected reps!`);
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to update team.");
      console.error(error);
    }
  };

  // Analytics & Stats
  const stats = useMemo(() => {
    return {
      total: reps.length,
      active: reps.filter(r => r.status === "Active").length,
      inactive: reps.filter(r => r.status === "Inactive").length,
      onLeave: reps.filter(r => r.status === "On Leave").length,
      totalTarget: reps.reduce((sum, r) => sum + r.monthlyTarget, 0),
      totalAchievement: reps.reduce((sum, r) => sum + r.achievement, 0),
      totalRevenue: reps.reduce((sum, r) => sum + r.revenueGenerated, 0),
      avgConv: reps.length ? (reps.reduce((sum, r) => sum + (r.achievement / r.monthlyTarget), 0) / reps.length) * 100 : 0,
    };
  }, [reps]);

  const performanceData = useMemo(() => reps.map(r => ({
    name: r.fullName,
    target: r.monthlyTarget,
    achieved: r.achievement,
    revenue: r.revenueGenerated
  })).sort((a,b) => b.achieved - a.achieved).slice(0, 5), [reps]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Filtering
  const filteredReps = useMemo(() => {
    let result = reps;
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(r => 
        r.fullName.toLowerCase().includes(lowerSearch) || 
        r.employeeCode.toLowerCase().includes(lowerSearch) ||
        r.email.toLowerCase().includes(lowerSearch) ||
        r.team.toLowerCase().includes(lowerSearch)
      );
    }
    if (filterStatus !== "All") result = result.filter(r => r.status === filterStatus);
    if (filterDesignation !== "All") result = result.filter(r => r.designation === filterDesignation);
    if (filterTeam !== "All") result = result.filter(r => r.team === filterTeam);
    return result;
  }, [reps, search, filterStatus, filterDesignation, filterTeam]);

  // Table Definition
  const columnHelper = createColumnHelper<SalesRep>();
  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />
      ),
      cell: ({ row }) => (
        <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} onClick={(e) => e.stopPropagation()} />
      ),
    }),
    columnHelper.accessor("name", {
      header: "Representative",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10 h-10 border border-primary/20 flex items-center justify-center font-bold">
            
              {info.row.original.avatarUrl ? (
    <img
      src={info.row.original.avatarUrl}
      alt="Avatar"
      className="w-full h-full object-cover"
    />
  ) : (
    <span>
      {info.row.original.name?.charAt(0).toUpperCase()}
    </span>
  )}
            </div>
          </div>
          <div>
            <div className="font-bold text-base-content hover:text-primary cursor-pointer hover:underline transition-colors flex items-center gap-2">
              {info.getValue()}
              {info.row.original.isTopPerformer && <span className="badge badge-xs badge-warning">Top</span>}
            </div>
            <div className="text-xs text-base-content/60">{info.row.original.email}</div>
          </div>
        </div>
      ),
    }),
    // columnHelper.accessor("employeeCode", {
    //   header: "Code",
    //   cell: (info) => <span className="font-mono text-xs font-semibold">{info.getValue()}</span>,
    // }),
    columnHelper.accessor("designation", {
      header: "Role",
      cell: (info) => <span className="badge badge-sm badge-ghost font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("team", {
      header: "Team & Territory",
      cell: (info) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{info.getValue()}</span>
          <span className="text-xs text-base-content/60">{info.row.original.territory}</span>
        </div>
      ),
    }),
    columnHelper.accessor("achievement", {
      header: "Target Achievement",
      cell: (info) => {
        const target = info.row.original.monthlyTarget;
        const achieved = info.getValue();
        const pct = target > 0 ? (achieved / target) * 100 : 0;
        return (
          <div className="flex flex-col gap-1 w-32">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-success">₹{achieved.toLocaleString()}</span>
              <span className="text-base-content/50">₹{target.toLocaleString()}</span>
            </div>
            <progress className={`progress w-full ${pct >= 100 ? 'progress-success' : pct > 50 ? 'progress-primary' : 'progress-error'}`} value={pct} max="100"></progress>
          </div>
        );
      },
    }),
    columnHelper.accessor("revenueGenerated", {
      header: "Revenue",
      cell: (info) => <span className="font-bold text-success">₹{info.getValue().toLocaleString()}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const val = info.getValue();
        const colors: Record<string, string> = {
          "Active": "badge-success text-white",
          "Inactive": "badge-ghost",
          "On Leave": "badge-warning",
          "Suspended": "badge-error text-white",
        };
        return <span className={`badge badge-sm border-none shadow-sm ${colors[val] || 'badge-neutral'}`}>{val}</span>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
          <button tabIndex={0} className="btn btn-ghost btn-xs btn-square">
            <MdMoreVert size={18} />
          </button>
          <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-200">
            <li><a onClick={() => setSelectedRep(row.original)}><MdAssignmentInd size={16} /> View Details</a></li>
            <li><a onClick={() => navigate(`/sales/representatives/edit/${row.original.id}`)}><MdEdit size={16} /> Edit Rep</a></li>
            <li><a onClick={() => { setSelectedRep(row.original); setTargetUpdateAmount(row.original.monthlyTarget || ""); setTargetModalOpen(true); }}><MdBarChart size={16} /> Update Targets</a></li>
            <div className="divider my-1"></div>
            <li><a className="text-error hover:bg-error/10" onClick={() => initiateDelete(row.original.id)}><MdDelete size={16} /> Delete</a></li>
          </ul>
        </div>
      ),
    }),
  ], [navigate, initiateDelete]);

  const table = useReactTable({
    data: filteredReps,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans flex flex-col h-full overflow-hidden relative">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Sales Representatives</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1 font-medium">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li className="text-primary">Representatives</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportExportActions
            moduleName="Sales Representatives"
            columns={salesRepColumns}
            data={filteredReps}
            selectedData={getSelectedReps()}
            onImportSubmit={handleImportSubmit}
          />
          <button onClick={() => refetch()} className="btn btn-outline btn-sm btn-square bg-base-100"><MdRefresh size={16} /></button>
          <button onClick={() => navigate("/sales/representatives/new")} className="btn btn-primary btn-sm gap-2 shadow-sm"><MdAdd size={16} /> Add Rep</button>
        </div>
      </div>

      {/* ── Dashboard Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {[
          { label: "Total Reps", value: stats.total, color: "text-base-content" },
          { label: "Active", value: stats.active, color: "text-primary" },
          { label: "On Leave / Inactive", value: stats.onLeave + stats.inactive, color: "text-warning" },
          { label: "Total Target", value: `₹${(stats.totalTarget/1000).toFixed(1)}k`, color: "text-info" },
          { label: "Total Achieved", value: `₹${(stats.totalAchievement/1000).toFixed(1)}k`, color: "text-success" },
          { label: "Avg Conversion", value: `${stats.avgConv.toFixed(1)}%`, color: "text-secondary" },
          { label: "Total Revenue", value: `₹${(stats.totalRevenue/1000).toFixed(1)}k`, color: "text-success" },
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
            <input
              type="text"
              placeholder="Search reps by name, code, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 focus:outline-none focus:border-primary"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn btn-sm ${showFilters ? "btn-primary" : "btn-outline bg-base-100"} gap-2`}>
            <MdFilterList size={16} /> Filters
          </button>
        </div>
        
        <div className="flex bg-base-200 p-1 rounded-lg border border-base-300">
          <button onClick={() => setView("table")} className={`btn btn-sm btn-ghost px-3 ${view === "table" ? "bg-base-100 shadow-sm" : ""}`}><MdViewList size={18} /> Table</button>
          <button onClick={() => setView("card")} className={`btn btn-sm btn-ghost px-3 ${view === "card" ? "bg-base-100 shadow-sm" : ""}`}><MdViewModule size={18} /> Cards</button>
          <button onClick={() => setView("analytics")} className={`btn btn-sm btn-ghost px-3 ${view === "analytics" ? "bg-base-100 shadow-sm" : ""}`}><MdBarChart size={18} /> Analytics</button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 shadow-sm animate-fade-in-down">
          <div>
            <label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">Status</label>
            <select className="select select-sm select-bordered w-full" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="On Leave">On Leave</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">Designation</label>
            <select className="select select-sm select-bordered w-full" value={filterDesignation} onChange={(e) => setFilterDesignation(e.target.value)}>
              <option value="All">All Roles</option><option value="Sales Executive">Sales Executive</option><option value="Senior Sales Executive">Senior Sales Executive</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">Team</label>
            <select className="select select-sm select-bordered w-full" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
              <option value="All">All Teams</option><option value="Alpha Squad">Alpha Squad</option><option value="Beta Force">Beta Force</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button className="btn btn-sm btn-ghost flex-1" onClick={() => { setFilterStatus("All"); setFilterDesignation("All"); setFilterTeam("All"); }}>Reset</button>
            <button className="btn btn-sm btn-primary flex-1" onClick={() => setShowFilters(false)}>Apply</button>
          </div>
        </div>
      )}

      {/* ── Bulk Actions ── */}
      {Object.keys(rowSelection).length > 0 && view === "table" && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between shadow-sm animate-fade-in-up">
          <span className="text-sm font-semibold text-primary">{Object.keys(rowSelection).length} reps selected</span>
          <div className="flex gap-2">
            <button className="btn btn-xs btn-primary" onClick={() => setBulkStatusModalOpen(true)}>Update Status</button>
            <button className="btn btn-xs btn-outline bg-base-100" onClick={() => setBulkTeamModalOpen(true)}>Assign Team</button>
            <button className="btn btn-xs btn-error text-white" onClick={() => setBulkDeleteModalOpen(true)}>Delete</button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      {isLoading ? (
        <div className="flex-1 flex flex-col justify-center items-center h-full space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p>Loading Sales Representatives...</p>
        </div>
      ) : (
      <div className="flex-1 bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
        
        {/* View 1: TABLE */}
        {view === "table" && (
          <>
            <div className="flex-1 overflow-auto">
              <table className="table table-pin-rows w-full text-sm">
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
                      onClick={() => setSelectedRep(row.original)}
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
                      <td colSpan={columns.length} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <MdPeople size={48} className="text-base-content/20" />
                          <p className="text-base-content/50 font-medium">No sales representatives found.</p>
                          <button onClick={() => navigate("/sales/representatives/new")} className="btn btn-outline btn-sm mt-2">Add New Rep</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="border-t border-base-300 p-3 bg-base-100 flex items-center justify-between text-sm">
              <span className="text-base-content/60 font-medium">
                Showing {table.getRowModel().rows.length} of {filteredReps.length} reps
              </span>
              <div className="flex items-center gap-3">
                <select 
                  className="select select-sm select-bordered bg-base-200"
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                >
                  {[10, 25, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>Show {pageSize}</option>
                  ))}
                </select>
                <div className="join">
                  <button className="join-item btn btn-sm bg-base-200" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>«</button>
                  <button className="join-item btn btn-sm bg-base-200">Page {table.getState().pagination.pageIndex + 1}</button>
                  <button className="join-item btn btn-sm bg-base-200" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>»</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* View 2: CARD */}
        {view === "card" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredReps.map(rep => {
                const pct = rep.monthlyTarget > 0 ? (rep.achievement / rep.monthlyTarget) * 100 : 0;
                return (
                  <div 
                    key={rep.id} 
                    onClick={() => setSelectedRep(rep)}
                    className="card bg-base-100 shadow-sm border border-base-300 hover:border-primary cursor-pointer transition-colors relative overflow-hidden"
                  >
                    {rep.isTopPerformer && <div className="absolute top-0 right-0 bg-warning text-warning-content text-[10px] font-bold px-2 py-1 rounded-bl-lg">TOP</div>}
                    <div className="p-5 flex flex-col items-center text-center">
                      <div className="avatar mb-3">
                        <div className="w-16 h-16 rounded-full border border-base-200 shadow-sm">
                          {rep.avatarUrl ? <img src={rep.avatarUrl} alt="avatar" /> : <span className="text-xl bg-primary text-white w-full h-full flex items-center justify-center font-bold">{rep.fullName.charAt(0)}</span>}
                        </div>
                      </div>
                      <h3 className="font-bold text-base-content">{rep.fullName}</h3>
                      <p className="text-xs text-primary font-mono font-semibold mt-0.5">{rep.employeeCode}</p>
                      <p className="text-xs text-base-content/60 mt-1">{rep.designation}</p>
                      
                      <div className="w-full mt-4 bg-base-200/50 p-3 rounded-lg border border-base-200 text-left">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-base-content/60">Achievement</span>
                          <span className="text-success">₹{rep.achievement.toLocaleString()}</span>
                        </div>
                        <progress className={`progress w-full ${pct >= 100 ? 'progress-success' : 'progress-primary'}`} value={pct} max="100"></progress>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 3: ANALYTICS */}
        {view === "analytics" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200/30 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Target Achievement */}
              <div className="bg-base-100 border border-base-300 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-base-content mb-4 text-sm uppercase tracking-wider">Top Performers vs Targets</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--b3))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none" }} />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                      <Bar dataKey="target" fill="#9ca3af" name="Target" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="achieved" fill="#10b981" name="Achieved" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue by Team/Territory Mock */}
              <div className="bg-base-100 border border-base-300 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-base-content mb-4 text-sm uppercase tracking-wider">Revenue Contribution</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={performanceData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} label>
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      )}

      {/* ── Representative Details Drawer ── */}
      <div className={`fixed inset-0 bg-black/40 z-[100] transition-opacity ${selectedRep ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setSelectedRep(null)}>
        <div className={`absolute right-0 top-0 h-full w-full md:w-[600px] bg-base-100 shadow-2xl transition-transform duration-300 transform ${selectedRep ? "translate-x-0" : "translate-x-full"} flex flex-col`} onClick={(e) => e.stopPropagation()}>
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-base-300 bg-base-200/50 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-14 h-14 text-xl font-bold shadow-sm">
                    {selectedRep?.avatarUrl ? <img src={selectedRep.avatarUrl} alt="Profile" /> : <span className="flex items-center justify-center mt-2.5">{selectedRep?.name?.[0]}</span>}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-base-content leading-tight flex items-center gap-2">
                    {selectedRep?.name}
                    {selectedRep?.isTopPerformer && <MdCheckCircle className="text-success" title="Top Performer" />}
                  </h2>
                  <p className="text-sm font-medium text-base-content/60 mt-0.5">{selectedRep?.designation} • {selectedRep?.team}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRep(null)} className="btn btn-ghost btn-circle btn-sm bg-base-200">
                <MdClose size={20} />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm flex-1" onClick={() => navigate(`/sales/representatives/${selectedRep?.id}`)}><MdAssignmentInd /> Full Profile</button>
              <button className="btn btn-outline btn-sm flex-1 bg-base-100"><MdEmail /> Email</button>
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-outline btn-sm btn-square bg-base-100"><MdMoreVert size={18}/></button>
                <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-48 mt-1 border border-base-200">
                  <li><a onClick={() => navigate(`/sales/representatives/edit/${selectedRep?.id}`)}>Edit Representative</a></li>
                  <li><a onClick={() => { setTargetUpdateAmount(selectedRep?.monthlyTarget || ""); setTargetModalOpen(true); }}>Update Target</a></li>
                  <div className="divider my-1"></div>
                  <li><a className="text-error" onClick={() => { if(selectedRep) initiateDelete(selectedRep.id); }}><MdDelete size={16} className="mr-2" /> Delete</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-base-100 space-y-8">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-base-200/50 border border-base-200 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-base-content/60 uppercase mb-1">Target Achievement</p>
                <p className="text-2xl font-black text-success">{selectedRep && selectedRep.monthlyTarget > 0 ? ((selectedRep.achievement / selectedRep.monthlyTarget) * 100).toFixed(1) : 0}%</p>
              </div>
              <div className="bg-base-200/50 border border-base-200 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-base-content/60 uppercase mb-1">Revenue Gen</p>
                <p className="text-2xl font-black text-primary">₹{selectedRep?.revenueGenerated.toLocaleString()}</p>
              </div>
            </div>
            
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-4 flex items-center gap-2"><MdAssignmentInd /> Employee Information</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                {/* <div><p className="text-base-content/50 mb-1">Employee Code</p><span className="font-mono font-semibold text-primary">{selectedRep?.employeeCode}</span></div> */}
                <div><p className="text-base-content/50 mb-1">Status</p><span className="badge badge-sm badge-success text-white font-medium">{selectedRep?.status}</span></div>
                <div><p className="text-base-content/50 mb-1">Territory</p><p className="font-medium">{selectedRep?.territory}</p></div>
                {/* <div><p className="text-base-content/50 mb-1">Manager</p><p className="font-medium">{selectedRep?.reportingManager}</p></div> */}
                <div><p className="text-base-content/50 mb-1">Joined Date</p><p className="font-medium">{selectedRep?.joiningDate ? selectedRep.joiningDate.split('T')[0] : "—"}</p></div>
              </div>
            </section>
            
            <div className="divider my-0"></div>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-4 flex items-center gap-2"><MdPhone /> Contact Details</h3>
              <div className="grid grid-cols-1 gap-y-4 text-sm bg-base-200/50 p-4 rounded-xl border border-base-200">
                <div className="flex items-center gap-3"><MdEmail className="text-base-content/40" size={18}/> <a href={`mailto:${selectedRep?.email}`} className="text-primary hover:underline">{selectedRep?.email}</a></div>
                <div className="flex items-center gap-3"><MdPhone className="text-base-content/40" size={18}/> <a href={`tel:${selectedRep?.phone}`} className="text-primary hover:underline">{selectedRep?.phone}</a></div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-4 flex items-center gap-2"><MdPeople /> Pipeline Stats</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-base-200 rounded-lg p-3 text-center">
                  <span className="block text-xl font-bold">{selectedRep?.customersAssigned}</span>
                  <span className="text-[10px] text-base-content/60 uppercase">Customers</span>
                </div>
                <div className="border border-base-200 rounded-lg p-3 text-center">
                  <span className="block text-xl font-bold">{selectedRep?.leadsAssigned}</span>
                  <span className="text-[10px] text-base-content/60 uppercase">Leads</span>
                </div>
                <div className="border border-base-200 rounded-lg p-3 text-center">
                  <span className="block text-xl font-bold text-success">{selectedRep?.ordersHandled}</span>
                  <span className="text-[10px] text-base-content/60 uppercase">Orders</span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <dialog className={`modal ${deleteModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Delete Representative</h3>
          <p className="py-4 text-base-content/80">Are you sure you want to remove this sales representative? Their assigned customers, leads, and orders will need to be re-assigned.</p>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={confirmDelete}>Yes, Delete</button>
          </div>
        </div>
      </dialog>

      {/* ── Bulk Delete Confirmation Modal ── */}
      <dialog className={`modal ${bulkDeleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Confirm Bulk Delete</h3>
          <p className="py-4 text-base-content/80">Are you sure you want to delete {Object.keys(rowSelection).length} selected representative(s)? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setBulkDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={confirmBulkDelete}>Yes, Delete All</button>
          </div>
        </div>
      </dialog>

      {/* ── Bulk Status Update Modal ── */}
      <dialog className={`modal ${bulkStatusModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Update Status</h3>
          <select className="select select-bordered w-full" value={newStatus} onChange={(e) => setNewStatus(e.target.value as SalesRep["status"])}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
          </select>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => setBulkStatusModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkStatusUpdate}>Update Status</button>
          </div>
        </div>
      </dialog>

      {/* ── Update Target Modal ── */}
      <dialog className={`modal ${targetModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Update Monthly Target</h3>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">New Target Amount (₹)</span></label>
            <input type="number" className="input input-bordered w-full" value={targetUpdateAmount} onChange={(e) => setTargetUpdateAmount(e.target.value ? Number(e.target.value) : "")} />
          </div>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => setTargetModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={async () => {
              if(selectedRep && typeof targetUpdateAmount === 'number') {
                try {
                  await updateMutation.mutateAsync({ id: selectedRep.id, payload: { monthlyTarget: targetUpdateAmount }});
                  setSuccessMessage("Target updated successfully!");
                  setSuccessModalOpen(true);
                  setTargetModalOpen(false);
                } catch(err) { toast.error("Failed to update target."); }
              }
            }}>Save Target</button>
          </div>
        </div>
      </dialog>

      {/* ── Bulk Team Update Modal ── */}
      <dialog className={`modal ${bulkTeamModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Assign Team</h3>
          <select className="select select-bordered w-full" value={newTeam} onChange={(e) => setNewTeam(e.target.value)}>
            <option value="">-Select Team-</option>
            <option value="Alpha Squad">Alpha Squad</option>
            <option value="Beta Force">Beta Force</option>
            <option value="Retail Sales Team">Retail Sales Team</option>
            <option value="Enterprise Sales">Enterprise Sales</option>
          </select>
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={() => setBulkTeamModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkTeamUpdate} disabled={!newTeam}>Update Team</button>
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

    </div>
  );
}