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
  MdDownload,
  MdRefresh,
  MdViewList,
  MdViewKanban,
  MdCalendarMonth,
  MdMoreVert,
  MdClose,
  MdWarning,
  MdCheckCircle,
  MdLocalShipping,
  MdPayment,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import { toast } from "react-toastify";
import { useAuth } from "@/auth/AuthContext";
import { getOrders, updateOrder, deleteOrder, emailCustomerOrder, createOrder, type Order } from "@/services/orderServices";
import { getSalesReps } from "@/services/salesRepServices";
import ImportExportActions from "@/components/import-export/ImportExportActions";
import type { ColumnConfig } from "@/type/importExport.types";

const orderColumns: ColumnConfig[] = [
  { key: "orderNumber", label: "Order Number", required: true, type: "string" },
  { key: "customerName", label: "Customer Name", required: true, type: "string" },
  { key: "salesRep", label: "Sales Rep", type: "string" },
  { key: "orderDate", label: "Order Date", type: "date" },
  { key: "deliveryDate", label: "Delivery Date", type: "date" },
  { key: "orderValue", label: "Order Value", type: "number" },
  { key: "paymentStatus", label: "Payment Status", type: "string" },
  { key: "orderStatus", label: "Order Status", type: "string" },
  { key: "priority", label: "Priority", type: "string" },
];

/* ─────────────────────────── Component ─────────────────────────── */
export default function PendingOrders() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [view, setView] = useState<"table" | "kanban" | "calendar">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modals State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Filters State
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const [filterSalesRep, setFilterSalesRep] = useState("All Reps");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [filterDueToday, setFilterDueToday] = useState(false);

  // Data Fetching
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["orders", auth.slug],
    queryFn: () => getOrders(auth.slug || "default-tenant"),
  });

  const { data: repsData } = useQuery({
    queryKey: ["salesReps", auth.slug],
    queryFn: () => getSalesReps(auth.slug || "default-tenant"),
    enabled: editModalOpen,
  });

  const salesReps = useMemo(() => {
    return repsData?.data?.map((r: any) => r.memberId?.name || r.name || r.fullName).filter(Boolean) || [];
  }, [repsData]);
  
  const orders = useMemo(() => {
    const allOrders = data?.data || [];
    return allOrders.filter(o => !["Completed", "Delivered", "Cancelled"].includes(o.orderStatus));
  }, [data]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; payload: Partial<Order> }) => updateOrder(vars.id, vars.payload, auth.slug || "default-tenant"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id, auth.slug || "default-tenant"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
  
  const emailMutation = useMutation({
    mutationFn: (id: string) => emailCustomerOrder(id, auth.slug || "default-tenant"),
    onSuccess: (data) => {
      setSuccessMessage(data.message || "Email sent to customer successfully!");
      setSuccessModalOpen(true);
    },
    onError: () => toast.error("Failed to send email.")
  });

  const initiateDelete = useCallback((id: string) => {
    setOrderToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await deleteMutation.mutateAsync(orderToDelete);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
      if (selectedOrder?.id === orderToDelete) setSelectedOrder(null);
      setSuccessMessage("Order deleted successfully!");
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to delete order.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToEdit) return;
    try {
      await updateMutation.mutateAsync({ id: orderToEdit.id, payload: orderToEdit });
      setEditModalOpen(false);
      if (selectedOrder?.id === orderToEdit.id) {
         setSelectedOrder(orderToEdit);
      }
      setSuccessMessage("Order updated successfully!");
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to update order.");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order["orderStatus"]) => {
    try {
      await updateMutation.mutateAsync({ id: orderId, payload: { orderStatus: newStatus } });
      setSuccessMessage(`Order marked as ${newStatus}`);
      setSuccessModalOpen(true);
      if (selectedOrder?.id === orderId) {
         setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus } : null);
      }
    } catch (e: unknown) {
      toast.error("Failed to update status");
      console.error("Error updating order status:", e);
    }
  };

  const handleSendEmail = (e: React.MouseEvent, id: string) => {
    if (e) e.stopPropagation();
    toast.info("Sending email...");
    emailMutation.mutate(id);
  };

  const getSelectedOrders = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    return selectedIndices.map(index => filteredOrders[index]);
  };

  const handleImportSubmit = async (validRows: any[]) => {
    await Promise.all(validRows.map(row => createOrder(auth.slug || "default-tenant", row as Partial<Order>)));
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const handleBulkApprove = async () => {
    const selected = getSelectedOrders();
    try {
      await Promise.all(selected.map(o => updateMutation.mutateAsync({ id: o.id, payload: { orderStatus: "Approved" } })));
      setRowSelection({});
      setSuccessMessage(`Approved ${selected.length} order(s) successfully!`);
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to approve some orders.");
    }
  };

  const confirmBulkDelete = async () => {
    const selected = getSelectedOrders();
    try {
      await Promise.all(selected.map(o => deleteMutation.mutateAsync(o.id)));
      setRowSelection({});
      if (selectedOrder && selected.some(so => so.id === selectedOrder.id)) {
        setSelectedOrder(null);
      }
      setSuccessMessage(`Deleted ${selected.length} order(s) successfully!`);
      setSuccessModalOpen(true);
      setBulkDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete some orders.");
    }
  };

  // Stats & Alerts Calculation
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      total: orders.length,
      value: orders.reduce((sum, o) => sum + o.orderValue, 0),
      dueToday: orders.filter(o => o.deliveryDate?.startsWith(today)).length,
      overdue: orders.filter(o => o.deliveryDate && o.deliveryDate < today).length,
      awaitingApproval: orders.filter(o => o.orderStatus === "Pending").length,
      awaitingPayment: orders.filter(o => o.paymentStatus === "Unpaid" || o.paymentStatus === "Partially Paid").length,
      awaitingDispatch: orders.filter(o => o.orderStatus === "Approved" || o.orderStatus === "Processing").length,
      highPriority: orders.filter(o => o.priority === "High" || o.priority === "Urgent").length,
    };
  }, [orders]);

  const uniqueSalesReps = useMemo(() => Array.from(new Set(orders.map(o => o.salesRep).filter(Boolean))), [orders]);

  // TanStack Table Setup
  const columnHelper = createColumnHelper<Order>();
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
    columnHelper.accessor("orderNumber", {
      header: "Order Number",
      cell: (info) => (
        <span className="font-mono font-bold text-primary hover:underline cursor-pointer">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("customerName", {
      header: "Customer",
      cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("salesRep", {
      header: "Sales Owner",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-6">
              <span className="text-[10px]">{info.getValue().charAt(0)}</span>
            </div>
          </div>
          <span className="text-xs">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("orderDate", {
      header: "Order Date",
      cell: (info) => <span className="text-base-content/70">{info.getValue() ? new Date(info.getValue()).toLocaleDateString() : ""}</span>,
    }),
    columnHelper.accessor("deliveryDate", {
      header: "Delivery Date",
      cell: (info) => {
        const date = info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "";
        const today = new Date().toISOString().split("T")[0];
        const isOverdue = info.getValue() && info.getValue() < today;
        const isToday = info.getValue() && info.getValue().startsWith(today);
        return (
          <span className={`font-semibold ${isOverdue ? 'text-error' : isToday ? 'text-warning' : ''}`}>
            {date}
            {isOverdue && <MdWarning className="inline ml-1 mb-0.5" size={14} />}
          </span>
        );
      },
    }),
    columnHelper.accessor("orderValue", {
      header: "Order Value",
      cell: (info) => <span className="font-bold text-success">₹{info.getValue().toLocaleString()}</span>,
    }),
    columnHelper.accessor("paymentStatus", {
      header: "Payment",
      cell: (info) => {
        const val = info.getValue();
        const color = val === "Paid" ? "badge-success text-white" : val === "Partially Paid" ? "badge-warning" : "badge-error text-white";
        return <span className={`badge badge-sm border-none ${color}`}>{val}</span>;
      },
    }),
    columnHelper.accessor((row) => row as any, {
      id: "approvalStatus",
      header: "Approval",
      cell: (info) => {
        const val = info.row.original.orderStatus;
        const mappedVal = val === "Approved" ? "Approved" : val === "Pending" ? "Pending" : "N/A";
        const color = mappedVal === "Approved" ? "text-success" : mappedVal === "Pending" ? "text-warning" : "text-base-content/40";
        return <span className={`font-medium text-xs uppercase ${color}`}>{mappedVal}</span>;
      },
    }),
    columnHelper.accessor("orderStatus", {
      header: "Order Status",
      cell: (info) => {
        const val = info.getValue();
        const colors: Record<string, string> = {
          "Draft": "badge-ghost",
          "Pending Approval": "badge-warning",
          "Approved": "badge-success",
          "Processing": "badge-info",
          "Awaiting Payment": "badge-error text-white",
          "Awaiting Dispatch": "badge-secondary",
        };
        return <span className={`badge badge-sm ${colors[val] || 'badge-neutral'}`}>{val}</span>;
      },
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => {
        const val = info.getValue();
        const colors: Record<string, string> = { "Low": "text-base-content/50", "Medium": "text-info", "High": "text-warning", "Urgent": "text-error font-bold" };
        return <span className={`text-xs uppercase ${colors[val]}`}>{val}</span>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
          <button tabIndex={0} className="btn btn-ghost btn-xs btn-square">
            <MdMoreVert size={16} />
          </button>
          <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-48 border border-base-200">
            <li><a onClick={() => setSelectedOrder(row.original)}><MdViewList /> View Details</a></li>
            <li><a onClick={(e) => { e.stopPropagation(); setOrderToEdit(row.original); setEditModalOpen(true); }}><MdEdit /> Edit Order</a></li>
            <div className="divider my-1"></div>
            {row.original.orderStatus === "Pending" && <li><a className="text-success" onClick={() => handleStatusChange(row.original.id, "Approved")}><MdCheckCircle /> Approve Order</a></li>}
            {row.original.orderStatus === "Approved" && <li><a className="text-primary" onClick={() => handleStatusChange(row.original.id, "Shipped")}><MdLocalShipping /> Mark Dispatched</a></li>}
            <li><a className="text-error" onClick={() => handleStatusChange(row.original.id, "Cancelled")}>Cancel Order</a></li>
            <li><a className="text-error hover:bg-error/10" onClick={(e) => { e.stopPropagation(); initiateDelete(row.original.id); }}><MdDelete /> Delete Order</a></li>
          </ul>
        </div>
      ),
    }),
  ], [handleStatusChange, navigate]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(o => 
        o.orderNumber.toLowerCase().includes(lowerSearch) || 
        o.customerName?.toLowerCase().includes(lowerSearch) ||
        o.salesRep?.toLowerCase().includes(lowerSearch)
      );
    }

    if (filterStatus !== "All Statuses") {
      result = result.filter(o => o.orderStatus === filterStatus);
    }

    if (filterSalesRep !== "All Reps") {
      result = result.filter(o => o.salesRep === filterSalesRep);
    }

    if (filterPriority !== "All") {
      result = result.filter(o => o.priority === filterPriority);
    }

    const today = new Date().toISOString().split("T")[0];
    
    if (filterOverdue) {
      result = result.filter(o => o.deliveryDate && o.deliveryDate < today);
    }
    
    if (filterDueToday) {
      result = result.filter(o => o.deliveryDate && o.deliveryDate.startsWith(today));
    }

    return result;
  }, [orders, search, filterStatus, filterSalesRep, filterPriority, filterOverdue, filterDueToday]);

  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Kanban Handlers
  const handleDrop = (e: React.DragEvent, status: Order["orderStatus"]) => {
    const orderId = e.dataTransfer.getData("orderId");
    if (orderId) {
      handleStatusChange(orderId, status);
    }
  };

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData("orderId", orderId);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans flex flex-col h-full overflow-hidden relative">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Pending Orders</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Orders</li>
              <li className="font-semibold text-primary">Pending Orders</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportExportActions
            moduleName="Pending Orders"
            columns={orderColumns}
            data={filteredOrders}
            selectedData={getSelectedOrders()}
            onImportSubmit={handleImportSubmit}
          />
          <button onClick={() => refetch()} className="btn btn-outline btn-sm btn-square">
            <MdRefresh size={16} />
          </button>
          <button onClick={() => navigate("/sales/orders")} className="btn btn-primary btn-sm gap-2">
            <MdAdd size={16} /> Create New Order
          </button>
        </div>
      </div>

      {/* ── Active Alerts ── */}
      <div className="flex flex-col gap-2 mb-4">
        {stats.overdue > 0 && (
          <div className="alert alert-error shadow-sm py-2">
            <MdWarning size={20} />
            <span className="text-sm font-medium">You have {stats.overdue} overdue order(s) requiring immediate attention!</span>
            <button className="btn btn-sm btn-ghost">Review Overdue</button>
          </div>
        )}
        {stats.awaitingApproval > 0 && (
          <div className="alert alert-warning shadow-sm py-2">
            <MdWarning size={20} />
            <span className="text-sm font-medium">{stats.awaitingApproval} order(s) are waiting for management approval.</span>
            <button className="btn btn-sm btn-ghost">Review Approvals</button>
          </div>
        )}
      </div>

      {/* ── Stats Dashboard ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {[
          { label: "Total Pending", value: stats.total, color: "text-base-content" },
          { label: "Pending Value", value: `₹${(stats.value/1000).toFixed(1)}k`, color: "text-primary" },
          { label: "Due Today", value: stats.dueToday, color: "text-warning" },
          { label: "Overdue", value: stats.overdue, color: "text-error" },
          { label: "Needs Approval", value: stats.awaitingApproval, color: "text-warning" },
          { label: "Needs Payment", value: stats.awaitingPayment, color: "text-error" },
          { label: "To Dispatch", value: stats.awaitingDispatch, color: "text-secondary" },
          { label: "High Priority", value: stats.highPriority, color: "text-error" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
            <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-base-content/60 mt-1 text-center font-medium uppercase tracking-wider leading-tight">{stat.label}</span>
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
              placeholder="Search orders, customers..."
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

      {/* ── Advanced Filters Panel ── */}
      {showFilters && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 shadow-sm animate-fade-in-down">
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Order Status</label>
            <select className="select select-sm select-bordered w-full" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All Statuses">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Sales Owner</label>
            <select className="select select-sm select-bordered w-full" value={filterSalesRep} onChange={(e) => setFilterSalesRep(e.target.value)}>
              <option value="All Reps">All Reps</option>
              {uniqueSalesReps.map(rep => <option key={rep} value={rep}>{rep}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Priority</label>
            <select className="select select-sm select-bordered w-full" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="All">All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Quick Toggles</label>
            <div className="flex gap-4 items-center h-8">
              <label className="cursor-pointer label gap-2 p-0"><input type="checkbox" className="checkbox checkbox-xs" checked={filterOverdue} onChange={(e) => setFilterOverdue(e.target.checked)} /><span className="label-text text-xs">Overdue</span></label>
              <label className="cursor-pointer label gap-2 p-0"><input type="checkbox" className="checkbox checkbox-xs" checked={filterDueToday} onChange={(e) => setFilterDueToday(e.target.checked)} /><span className="label-text text-xs">Due Today</span></label>
            </div>
          </div>
          <div className="col-span-1 md:col-span-3 lg:col-span-4 flex justify-end gap-2 mt-2 border-t border-base-200 pt-4">
            <button className="btn btn-sm btn-ghost" onClick={() => {
              setFilterStatus("All Statuses");
              setFilterSalesRep("All Reps");
              setFilterPriority("All");
              setFilterOverdue(false);
              setFilterDueToday(false);
            }}>Reset Filters</button>
            <button className="btn btn-sm btn-primary" onClick={() => setShowFilters(false)}>Apply Filters</button>
          </div>
        </div>
      )}

      {/* ── Bulk Actions (Visible when rows selected) ── */}
      {Object.keys(rowSelection).length > 0 && view === "table" && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between shadow-sm animate-fade-in-up">
          <span className="text-sm font-semibold text-primary">{Object.keys(rowSelection).length} order(s) selected</span>
          <div className="flex gap-2">
            <button className="btn btn-xs btn-primary" onClick={handleBulkApprove}>Approve Selected</button>
            <button className="btn btn-xs btn-error btn-outline" onClick={() => setBulkDeleteModalOpen(true)}>Delete</button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      {isLoading ? (
        <div className="flex-1 flex flex-col justify-center items-center h-full space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p>Loading Pending Orders...</p>
        </div>
      ) : (
      <div className="flex-1 bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
        
        {/* View 1: Table */}
        {view === "table" && (
          <div className="flex-1 overflow-auto">
            {filteredOrders.length > 0 ? (
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
                      onClick={() => setSelectedOrder(row.original)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center text-base-content/50">
                <MdLocalShipping size={64} className="mb-4 text-base-content/20" />
                <h3 className="text-lg font-bold">No Pending Orders Found</h3>
                <p className="text-sm mt-1 mb-4">All orders are up to date or do not match your filters.</p>
                <button onClick={() => navigate("/sales/orders")} className="btn btn-primary btn-sm">Create New Order</button>
              </div>
            )}
          </div>
        )}

        {/* View 2: Kanban Board */}
        {view === "kanban" && (
          <div className="flex-1 flex overflow-x-auto p-4 gap-4 bg-base-200/30">
            {(["Draft", "Pending", "Approved", "Processing", "Shipped"] as const).map(status => (
              <div 
                key={status} 
                className="flex-1 min-w-[280px] bg-base-100 rounded-xl border border-base-300 flex flex-col shadow-sm"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, status as Order["orderStatus"])}
              >
                <div className="p-3 border-b border-base-200 font-bold text-sm flex justify-between items-center bg-base-200/50 rounded-t-xl">
                  {status}
                  <span className="badge badge-sm">{orders.filter(o => o.orderStatus === status).length}</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {filteredOrders.filter(o => o.orderStatus === status).map(order => {
                    const isOverdue = order.deliveryDate ? new Date(order.deliveryDate) < new Date() : false;
                    return (
                      <div 
                        key={order.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        onClick={() => setSelectedOrder(order)}
                        className={`bg-base-100 border p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-colors hover:border-primary ${isOverdue ? 'border-error/50 bg-error/5' : 'border-base-300'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-mono font-bold text-primary">{order.orderNumber}</span>
                          <span className={`badge badge-xs ${order.priority === 'Urgent' ? 'badge-error' : order.priority === 'High' ? 'badge-warning' : 'badge-ghost'}`}>
                            {order.priority}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm mb-1 leading-tight">{order.customerName}</h4>
                        <p className="text-xs font-bold text-success mt-2 mb-3">₹{order.orderValue.toLocaleString()}</p>
                        <div className="flex justify-between items-center mt-2 border-t border-base-200 pt-2">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-6">
                              <span className="text-[10px]">{order.salesRep?.charAt(0) || "U"}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold ${isOverdue ? 'text-error' : 'text-base-content/60'}`}>
                            Due: {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View 3: Calendar */}
        {view === "calendar" && (
          <div className="flex-1 p-6 flex items-center justify-center bg-base-200/30">
            <div className="text-center space-y-4">
              <MdCalendarMonth size={48} className="mx-auto text-base-content/20" />
              <h3 className="text-lg font-bold text-base-content/50">Calendar View</h3>
              <p className="text-sm text-base-content/40 max-w-sm">Full calendar integration maps pending orders to their Delivery Dates here.</p>
            </div>
          </div>
        )}

        {/* Table Pagination Footer */}
        {view === "table" && filteredOrders.length > 0 && (
          <div className="border-t border-base-300 p-3 bg-base-100 flex items-center justify-between text-sm">
            <span className="text-base-content/60">
              Showing {table.getRowModel().rows.length} of {filteredOrders.length} pending orders
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

      {/* ── Order Details Drawer ── */}
      <div className={`fixed inset-0 bg-black/40 z-[100] transition-opacity ${selectedOrder ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className={`absolute right-0 top-0 h-full w-full md:w-[700px] bg-base-100 shadow-2xl transition-transform duration-300 transform ${selectedOrder ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-base-300 flex justify-between items-center bg-base-200/50">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm font-bold text-primary">{selectedOrder?.orderNumber}</span>
                <span className={`badge badge-sm badge-outline ${selectedOrder?.orderStatus === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                  {selectedOrder?.orderStatus}
                </span>
              </div>
              <h2 className="text-xl font-bold text-base-content leading-tight">{selectedOrder?.customerName}</h2>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm gap-2"><MdDownload /> PDF</button>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-ghost btn-circle btn-sm">
                <MdClose size={20} />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-base-100">
            
            {/* Quick Actions Toolbar */}
            <div className="flex flex-wrap gap-2 pb-6 border-b border-base-200">
              {selectedOrder?.orderStatus === "Pending" && (
                <>
                  <button className="btn btn-sm btn-success text-white gap-2" onClick={() => {if(selectedOrder) handleStatusChange(selectedOrder.id, "Approved");}}><MdCheckCircle /> Approve</button>
                  <button className="btn btn-sm btn-error text-white gap-2" onClick={() => {if(selectedOrder) handleStatusChange(selectedOrder.id, "Cancelled");}}><MdClose /> Reject</button>
                </>
              )}
              {selectedOrder?.orderStatus === "Approved" && (
                <button className="btn btn-sm btn-info text-white gap-2" onClick={() => {if(selectedOrder) handleStatusChange(selectedOrder.id, "Processing");}}>Mark Processing</button>
              )}
              {(selectedOrder?.orderStatus === "Processing" || selectedOrder?.orderStatus === "Approved") && (
                <button className="btn btn-sm btn-primary gap-2" onClick={() => {if(selectedOrder) handleStatusChange(selectedOrder.id, "Shipped");}}><MdLocalShipping /> Mark Dispatched</button>
              )}
              {selectedOrder?.paymentStatus === "Unpaid" && (
                <button className="btn btn-sm btn-outline btn-warning gap-2" onClick={(e) => { if (selectedOrder) handleSendEmail(e, selectedOrder.id); }}><MdPayment /> Send Reminder</button>
              )}
              <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); if (selectedOrder) { setOrderToEdit(selectedOrder); setEditModalOpen(true); } }}><MdEdit /> Edit Order</button>
              <button className="btn btn-sm btn-outline btn-error ml-auto" onClick={(e) => { e.stopPropagation(); if(selectedOrder) initiateDelete(selectedOrder.id); }}><MdDelete /> Delete Order</button>
            </div>

            {/* Basic Info */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Order Information</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div><p className="text-base-content/50 mb-1">Sales Owner</p><p className="font-semibold">{selectedOrder?.salesRep}</p></div>
                <div><p className="text-base-content/50 mb-1">Priority</p>
                  <span className={`badge badge-sm ${selectedOrder?.priority === 'Urgent' ? 'badge-error' : 'badge-ghost'}`}>{selectedOrder?.priority}</span>
                </div>
                <div><p className="text-base-content/50 mb-1">Order Date</p><p className="font-medium">{selectedOrder?.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : ""}</p></div>
                <div>
                  <p className="text-base-content/50 mb-1">Delivery Date</p>
                  <p className={`font-bold ${selectedOrder && selectedOrder.deliveryDate && new Date(selectedOrder.deliveryDate) < new Date() ? 'text-error' : 'text-base-content'}`}>
                    {selectedOrder?.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : ""} {selectedOrder && selectedOrder.deliveryDate && new Date(selectedOrder.deliveryDate) < new Date() && '(Overdue)'}
                  </p>
                </div>
              </div>
            </section>

            {/* Products Table */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Order Items ({selectedOrder?.products?.length || 0})</h3>
              <div className="overflow-x-auto border border-base-200 rounded-lg">
                <table className="table table-sm w-full">
                  <thead className="bg-base-200">
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder?.products?.map((p, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="font-semibold">{p.productName}</div>
                          <div className="text-[10px] font-mono text-base-content/60">{p.sku}</div>
                        </td>
                        <td>{p.quantity}</td>
                        <td>₹{p.price.toLocaleString()}</td>
                        <td className="text-right font-bold text-success">₹{p.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-base-100 font-bold text-base">
                      <td colSpan={3} className="text-right">Grand Total:</td>
                      <td className="text-right text-success">₹{selectedOrder?.orderValue?.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* Payment & Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Payment Info</h3>
                <div className="space-y-3 text-sm p-4 bg-base-200/40 rounded-xl border border-base-200">
                  <div className="flex justify-between"><span className="text-base-content/60">Status</span><span className="font-bold">{selectedOrder?.paymentStatus}</span></div>
                  <div className="flex justify-between"><span className="text-base-content/60">Terms</span><span className="font-medium">{selectedOrder?.paymentTerms}</span></div>
                </div>
              </section>
              
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Delivery Info</h3>
                <div className="space-y-3 text-sm p-4 bg-base-200/40 rounded-xl border border-base-200">
                  <div className="flex flex-col"><span className="text-base-content/60 mb-1">Shipping Address</span><span className="font-medium leading-relaxed">{selectedOrder?.shippingAddress}</span></div>
                </div>
              </section>
            </div>

            {/* Activity Timeline */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Activity Timeline</h3>
              <ul className="timeline timeline-vertical timeline-compact">
                <li>
                  <hr className="bg-primary" />
                  <div className="timeline-middle text-primary"><MdCheckCircle /></div>
                  <div className="timeline-end timeline-box border-none shadow-none bg-transparent px-2 py-1">
                    <div className="text-xs text-base-content/50">Recent Update</div>
                    <div className="text-sm font-medium">Status changed to {selectedOrder?.orderStatus}</div>
                  </div>
                  <hr className="bg-base-300" />
                </li>
                <li>
                  <hr className="bg-base-300" />
                  <div className="timeline-middle text-base-300"><MdCheckCircle /></div>
                  <div className="timeline-end timeline-box border-none shadow-none bg-transparent px-2 py-1">
                    <div className="text-xs text-base-content/50">{selectedOrder?.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : ""}</div>
                    <div className="text-sm font-medium">Order Created by {selectedOrder?.salesRep}</div>
                  </div>
                </li>
              </ul>
            </section>

          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <dialog className={`modal ${deleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Confirm Deletion</h3>
          <p className="py-4 text-base-content/80">Are you sure you want to delete this order? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={confirmDelete}>Yes, Delete</button>
          </div>
        </div>
      </dialog>

      <dialog className={`modal ${bulkDeleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Confirm Bulk Delete</h3>
          <p className="py-4 text-base-content/80">Are you sure you want to delete {Object.keys(rowSelection).length} selected order(s)? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setBulkDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={confirmBulkDelete}>Yes, Delete All</button>
          </div>
        </div>
      </dialog>

      <dialog className={`modal ${editModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg mb-4">Edit Order</h3>
          {orderToEdit && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Order Number</span></label>
                  <input type="text" className="input input-bordered w-full bg-base-200" value={orderToEdit.orderNumber} readOnly />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Customer Name</span></label>
                  <input type="text" className="input input-bordered w-full" value={orderToEdit.customerName} onChange={(e) => setOrderToEdit({...orderToEdit, customerName: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Contact Person</span></label>
                  <input type="text" className="input input-bordered w-full" value={orderToEdit.contactPerson || ""} onChange={(e) => setOrderToEdit({...orderToEdit, contactPerson: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Email</span></label>
                  <input type="email" className="input input-bordered w-full" value={orderToEdit.email || ""} onChange={(e) => setOrderToEdit({...orderToEdit, email: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Phone</span></label>
                  <input type="text" className="input input-bordered w-full" value={orderToEdit.phone || ""} onChange={(e) => setOrderToEdit({...orderToEdit, phone: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Sales Rep</span></label>
                  <div className="dropdown w-full">
                    <input 
                      type="text" 
                      className="input input-bordered w-full" 
                      value={orderToEdit.salesRep || ""} 
                      onChange={(e) => setOrderToEdit({...orderToEdit, salesRep: e.target.value})} 
                      placeholder="-Select Rep-"
                      tabIndex={0}
                    />
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto z-50 border border-base-300">
                      {salesReps.map(rep => (
                        <li key={rep}><a onClick={() => { setOrderToEdit({...orderToEdit, salesRep: rep}); (document.activeElement as HTMLElement)?.blur(); }}>{rep}</a></li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Order Date</span></label>
                  <input type="date" className="input input-bordered w-full" value={orderToEdit.orderDate ? new Date(orderToEdit.orderDate).toISOString().split('T')[0] : ""} onChange={(e) => setOrderToEdit({...orderToEdit, orderDate: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Delivery Date</span></label>
                  <input type="date" className="input input-bordered w-full" value={orderToEdit.deliveryDate ? new Date(orderToEdit.deliveryDate).toISOString().split('T')[0] : ""} onChange={(e) => setOrderToEdit({...orderToEdit, deliveryDate: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Order Status</span></label>
                  <select className="select select-bordered w-full" value={orderToEdit.orderStatus} onChange={(e) => setOrderToEdit({...orderToEdit, orderStatus: e.target.value as any})}>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Payment Status</span></label>
                  <select className="select select-bordered w-full" value={orderToEdit.paymentStatus} onChange={(e) => setOrderToEdit({...orderToEdit, paymentStatus: e.target.value as any})}>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Priority</span></label>
                  <select className="select select-bordered w-full" value={orderToEdit.priority} onChange={(e) => setOrderToEdit({...orderToEdit, priority: e.target.value as any})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Order Value (₹)</span></label>
                  <input type="number" className="input input-bordered w-full" value={orderToEdit.orderValue || 0} onChange={(e) => setOrderToEdit({...orderToEdit, orderValue: Number(e.target.value)})} required />
                </div>
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label"><span className="label-text font-semibold">Billing Address</span></label>
                  <textarea className="textarea textarea-bordered w-full" value={orderToEdit.billingAddress || ""} onChange={(e) => setOrderToEdit({...orderToEdit, billingAddress: e.target.value})}></textarea>
                </div>
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label"><span className="label-text font-semibold">Shipping Address</span></label>
                  <textarea className="textarea textarea-bordered w-full" value={orderToEdit.shippingAddress || ""} onChange={(e) => setOrderToEdit({...orderToEdit, shippingAddress: e.target.value})}></textarea>
                </div>
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label"><span className="label-text font-semibold">Internal Notes</span></label>
                  <textarea className="textarea textarea-bordered w-full bg-warning/5" value={orderToEdit.notes?.internal || ""} onChange={(e) => setOrderToEdit({...orderToEdit, notes: {...(orderToEdit.notes || {internal: "", customer: ""}), internal: e.target.value}} as Order)}></textarea>
                </div>
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label"><span className="label-text font-semibold">Customer Notes</span></label>
                  <textarea className="textarea textarea-bordered w-full" value={orderToEdit.notes?.customer || ""} onChange={(e) => setOrderToEdit({...orderToEdit, notes: {...(orderToEdit.notes || {internal: "", customer: ""}), customer: e.target.value}} as Order)}></textarea>
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
