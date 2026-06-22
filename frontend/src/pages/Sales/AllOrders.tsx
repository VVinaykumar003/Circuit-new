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
  MdClose,
  MdEdit,
  MdContentCopy,
  MdDelete,
  MdWarning,
  MdCheckCircle,
  MdViewKanban,
  MdPictureAsPdf,
  MdEmail,
  MdPrint,
  MdReceipt,
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

export default function AllOrders() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [view, setView] = useState<"table" | "card" | "kanban">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Order["orderStatus"]>("Pending");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

  // Data Fetching
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["orders", auth.slug],
    queryFn: () => getOrders(auth.slug || "default-tenant"),
  });

  console.log("data : ", data);

  const { data: repsData } = useQuery({
    queryKey: ["salesReps", auth.slug],
    queryFn: () => getSalesReps(auth.slug || "default-tenant"),
    enabled: editModalOpen,
  });

  const salesReps = useMemo(() => {
    return repsData?.data?.map((r: any) => r.memberId?.name || r.name || r.fullName).filter(Boolean) || [];
  }, [repsData]);
  
  const orders = data?.data || [];

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

  // Action Helpers
  const getSelectedOrders = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    return selectedIndices.map(index => filteredOrders[index]);
  };

  // Actions
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
      toast.success("Order deleted successfully!");
    } catch (error :unknown) {
      toast.error("Failed to delete order.");
      console.error("Error deleting order:", error);
    }
  };

  const handleImportSubmit = async (validRows: any[]) => {
    await Promise.all(validRows.map(row => createOrder(auth.slug || "default-tenant", row as Partial<Order>)));
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const handleStatusChange = async (orderId: string, newStatus: Order["orderStatus"]) => {
    try {
      await updateMutation.mutateAsync({ id: orderId, payload: { orderStatus: newStatus } });
      toast.success(`Order marked as ${newStatus}`);
    } catch (e :unknown) {
      toast.error("Failed to update status");
      console.error("Error updating order status:", e);

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
    } catch (error: unknown) {
      toast.error("Failed to update order.");
    }
  };

  const handleBulkStatusUpdate = async () => {
    const selected = getSelectedOrders();
    try {
      await Promise.all(selected.map(o => updateMutation.mutateAsync({ id: o.id, payload: { orderStatus: newStatus } })));
      setBulkStatusModalOpen(false);
      setRowSelection({});
      setSuccessMessage(`Status updated to ${newStatus} for selected orders!`);
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      toast.error("Failed to update status for some orders.");
    }
  };

  const handleBulkDelete = async () => {
    const selected = getSelectedOrders();
    try {
      await Promise.all(selected.map(o => deleteMutation.mutateAsync(o.id)));
      setBulkDeleteModalOpen(false);
      setRowSelection({});
      if (selectedOrder && selected.find(so => so.id === selectedOrder.id)) {
        setSelectedOrder(null);
      }
      setSuccessMessage(`${selected.length} orders deleted successfully!`);
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      toast.error("Failed to delete some orders.");
    }
  };

  const triggerSuccess = (message: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSuccessMessage(message);
    setSuccessModalOpen(true);
  };

  const handleSendEmail = (e: React.MouseEvent, id: string) => {
    if (e) e.stopPropagation();
    toast.info("Sending email...");
    emailMutation.mutate(id);
  };

  // Kanban Drag & Drop
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData("orderId", orderId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Order["orderStatus"]) => {
    const orderId = e.dataTransfer.getData("orderId");
    if (orderId) {
      handleStatusChange(orderId, newStatus);
    }
  };

  // Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.salesRep.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: orders.length,
      revenue: orders.reduce((sum, o) => sum + o.orderValue, 0),
      draft: orders.filter(o => o.orderStatus === "Draft").length,
      pending: orders.filter(o => o.orderStatus === "Pending").length,
      processing: orders.filter(o => o.orderStatus === "Processing").length,
      delivered: orders.filter(o => o.orderStatus === "Delivered").length,
      cancelled: orders.filter(o => o.orderStatus === "Cancelled").length,
      aov: orders.length > 0 ? orders.reduce((sum, o) => sum + o.orderValue, 0) / orders.length : 0,
    };
  }, [orders]);

  const overDueCount = orders.filter(o => new Date(o.deliveryDate) < new Date() && o.deliveryStatus !== "Delivered").length;

  // Table Definition
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
      header: "Order #",
      cell: (info) => <span className="font-semibold text-primary hover:underline cursor-pointer">{info.getValue()}</span>,
    }),
    columnHelper.accessor("customerName", {
      header: "Customer",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("salesRep", {
      header: "Sales Rep",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <img src={info.row.original.salesRepAvatar || `https://ui-avatars.com/api/?name=${info.getValue()}`} alt="rep" className="w-6 h-6 rounded-full" />
          <span className="text-xs">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("orderDate", {
      header: "Order Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("orderValue", {
      header: "Total",
      cell: (info) => <span className="font-semibold text-success">₹{info.getValue()?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>,
    }),
    columnHelper.accessor("paymentStatus", {
      header: "Payment",
      cell: (info) => {
        const val = info.getValue();
        return <span className={`badge badge-sm font-semibold border-none ${val === "Paid" ? "badge-success text-white" : val === "Unpaid" ? "badge-error text-white" : "badge-warning"}`}>{val}</span>;
      },
    }),
    columnHelper.accessor("orderStatus", {
      header: "Status",
      cell: (info) => {
        const val = info.getValue();
        return <span className={`badge badge-sm badge-outline ${val === "Completed" || val === "Delivered" ? "badge-primary" : val === "Cancelled" ? "badge-error" : "badge-neutral"}`}>{val}</span>;
      },
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => <span className={`badge badge-sm ${info.getValue() === "Urgent" || info.getValue() === "High" ? "badge-error text-white" : "badge-ghost"}`}>{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
          <button tabIndex={0} className="btn btn-ghost btn-xs btn-square">
            <MdMoreVert size={16} />
          </button>
          <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-44 border border-base-200">
            <li><a onClick={(e) => { e.stopPropagation(); setSelectedOrder(row.original); }}><MdViewList /> View Details</a></li>
            <li><a onClick={(e) => { e.stopPropagation(); setOrderToEdit(row.original); setEditModalOpen(true); }}><MdEdit /> Edit Order</a></li>
            <li><a onClick={(e) => triggerSuccess("Invoice generated successfully!", e)}><MdReceipt /> Generate Invoice</a></li>
            <li><a onClick={(e) => triggerSuccess("PDF downloaded successfully!", e)}><MdPictureAsPdf /> Download PDF</a></li>
            <div className="divider my-1"></div>
            <li><a className="text-error" onClick={(e) => { e.stopPropagation(); initiateDelete(row.original.id); }}><MdDelete /> Delete Order</a></li>
          </ul>
        </div>
      ),
    }),
  ], [initiateDelete]);

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

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full space-y-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p>Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans flex flex-col h-full overflow-hidden relative">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">All Orders</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Orders</li>
              <li className="font-semibold text-primary">All Orders</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportExportActions
            moduleName="Orders"
            columns={orderColumns}
            data={filteredOrders}
            selectedData={getSelectedOrders()}
            onImportSubmit={handleImportSubmit}
          />
          <button onClick={() => refetch()} className="btn btn-outline btn-sm btn-square"><MdRefresh size={16} /></button>
          <button onClick={() => navigate("/sales/orders/new")} className="btn btn-primary btn-sm gap-2 shadow-sm"><MdAdd size={16} /> Create Order</button>
        </div>
      </div>

      {/* ── Alerts ── */}
      {overDueCount > 0 && (
        <div className="alert alert-warning shadow-sm mb-4 py-2 text-sm rounded-xl">
          <MdWarning size={20} />
          <span>Warning: You have {overDueCount} overdue deliveries.</span>
          <button className="btn btn-sm btn-ghost">View</button>
        </div>
      )}

      {/* ── Stats Dashboard ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
        {[
          { label: "Total Orders", value: stats.total, color: "text-base-content" },
          { label: "Revenue", value: `₹${(stats.revenue/1000).toFixed(1)}k`, color: "text-success" },
          { label: "Draft", value: stats.draft, color: "text-base-content/50" },
          { label: "Pending", value: stats.pending, color: "text-warning" },
          { label: "Processing", value: stats.processing, color: "text-info" },
          { label: "Delivered", value: stats.delivered, color: "text-primary" },
          { label: "Cancelled", value: stats.cancelled, color: "text-error" },
          { label: "Avg Value", value: `₹${stats.aov.toFixed(0)}`, color: "text-base-content" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col justify-center items-center shadow-sm">
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
            <input type="text" placeholder="Search by Order #, Customer..." value={search} onChange={e => setSearch(e.target.value)} className="input input-sm input-bordered w-full pl-9" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn btn-sm ${showFilters ? "btn-primary" : "btn-outline"} gap-2`}>
            <MdFilterList size={16} /> Filters
          </button>
        </div>

        <div className="flex bg-base-200 p-1 rounded-lg border border-base-300">
          <button onClick={() => setView("table")} className={`btn btn-sm btn-ghost px-3 ${view === "table" ? "bg-base-100 shadow-sm" : ""}`}><MdViewList size={18} /> Table</button>
          <button onClick={() => setView("card")} className={`btn btn-sm btn-ghost px-3 ${view === "card" ? "bg-base-100 shadow-sm" : ""}`}><MdViewModule size={18} /> Card</button>
          <button onClick={() => setView("kanban")} className={`btn btn-sm btn-ghost px-3 ${view === "kanban" ? "bg-base-100 shadow-sm" : ""}`}><MdViewKanban size={18} /> Kanban</button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm">
          <div><label className="text-xs font-semibold mb-1 block">Order Status</label><select className="select select-sm select-bordered w-full"><option>All</option><option>Pending</option><option>Processing</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">Payment Status</label><select className="select select-sm select-bordered w-full"><option>All</option><option>Paid</option><option>Unpaid</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">Delivery Status</label><select className="select select-sm select-bordered w-full"><option>All</option><option>Pending</option><option>Shipped</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">Priority</label><select className="select select-sm select-bordered w-full"><option>All</option><option>Urgent</option><option>High</option></select></div>
          <div className="col-span-full flex justify-end gap-2 mt-2">
            <button className="btn btn-sm btn-ghost">Reset Filters</button>
            <button className="btn btn-sm btn-primary">Apply Filters</button>
          </div>
        </div>
      )}

      {/* ── Bulk Actions ── */}
      {Object.keys(rowSelection).length > 0 && view === "table" && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between shadow-sm animate-fade-in-up">
          <span className="text-sm font-semibold text-primary">{Object.keys(rowSelection).length} orders selected</span>
          <div className="flex gap-2">
            <button onClick={() => setBulkStatusModalOpen(true)} className="btn btn-xs btn-primary">Change Status</button>
            <button onClick={() => toast.info("Assign Rep function not fully implemented")} className="btn btn-xs btn-outline bg-base-100">Assign Rep</button>
            <button onClick={() => setBulkDeleteModalOpen(true)} className="btn btn-xs btn-error btn-outline">Delete</button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
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
                  <tr key={row.id} className="hover:bg-base-200/50 transition-colors cursor-pointer border-b border-base-200" onClick={() => setSelectedOrder(row.original)}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr><td colSpan={columns.length} className="text-center py-12 text-base-content/50">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Card Grid */}
        {view === "card" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredOrders.map(order => (
              <div key={order.id} onClick={() => setSelectedOrder(order)} className="card bg-base-100 shadow-sm border border-base-300 hover:border-primary cursor-pointer transition-colors p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-primary">{order.orderNumber}</span>
                  <span className={`badge badge-sm ${order.orderStatus === 'Processing' ? 'badge-info' : 'badge-ghost'}`}>{order.orderStatus}</span>
                </div>
                <p className="text-sm font-semibold mb-1">{order.customerName}</p>
                <p className="text-xs text-base-content/60 mb-4">{new Date(order.orderDate).toLocaleDateString()}</p>
                <div className="flex justify-between items-end border-t border-base-200 pt-3">
                  <div className="flex items-center gap-2">
                    <img src={order.salesRepAvatar || `https://ui-avatars.com/api/?name=${order.salesRep}`} alt="rep" className="w-6 h-6 rounded-full" />
                    <span className="text-xs font-medium">{order.salesRep}</span>
                  </div>
                  <span className="font-bold text-success">₹{order.orderValue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View 3: Kanban Board */}
        {view === "kanban" && (
          <div className="flex-1 overflow-x-auto p-4 flex gap-4 bg-base-200/50 min-h-[500px]">
            {["Draft", "Pending", "Processing", "Shipped", "Delivered", "Completed"].map((status) => (
              <div 
                key={status} 
                className="flex-none w-72 bg-base-100 rounded-xl border border-base-300 flex flex-col max-h-full"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, status as Order["orderStatus"])}
              >
                <div className="p-3 border-b border-base-200 font-bold flex justify-between items-center bg-base-200/30 rounded-t-xl">
                  <span className="text-base-content/80">{status}</span>
                  <span className="badge badge-sm">{orders.filter(o => o.orderStatus === status).length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-3">
                  {orders.filter(o => o.orderStatus === status).map(order => (
                    <div 
                      key={order.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, order.id)}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-base-100 p-3 rounded-lg border border-base-300 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary"
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-primary">{order.orderNumber}</span>
                        <span className={`badge badge-xs ${order.priority === 'Urgent' ? 'badge-error' : 'badge-ghost'}`}>{order.priority}</span>
                      </div>
                      <p className="text-sm font-semibold truncate">{order.customerName}</p>
                      <div className="mt-3 flex justify-between items-center text-xs text-base-content/60">
                        <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                        <span className="font-bold text-success">₹{order.orderValue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table Pagination Footer */}
        {view === "table" && (
          <div className="border-t border-base-300 p-3 bg-base-100 flex items-center justify-between text-sm">
            <span className="text-base-content/60">
              Showing {table.getRowModel().rows.length} of {filteredOrders.length} orders
            </span>
            <div className="flex items-center gap-2">
              <select className="select select-sm select-bordered" value={table.getState().pagination.pageSize} onChange={e => table.setPageSize(Number(e.target.value))}>
                {[10, 25, 50, 100].map(pageSize => <option key={pageSize} value={pageSize}>Show {pageSize}</option>)}
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

      {/* ── Order Details Drawer ── */}
      <div className={`fixed inset-0 bg-black/40 z-[100] transition-opacity ${selectedOrder ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setSelectedOrder(null)}>
        <div 
          className={`absolute right-0 top-0 h-full w-full md:w-[700px] bg-base-100 shadow-2xl transition-transform duration-300 transform ${selectedOrder ? "translate-x-0" : "translate-x-full"} flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-base-300 flex justify-between items-center bg-base-200/50">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-lg font-bold text-primary">{selectedOrder?.orderNumber}</span>
                <span className={`badge badge-sm ${selectedOrder?.orderStatus === 'Completed' ? 'badge-primary' : 'badge-ghost'}`}>{selectedOrder?.orderStatus}</span>
              </div>
              <p className="text-sm text-base-content/60">Placed on {selectedOrder && new Date(selectedOrder.orderDate).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm btn-square"><MdPrint size={18} /></button>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-ghost btn-circle btn-sm"><MdClose size={20} /></button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-base-100">
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pb-6 border-b border-base-200">
              {selectedOrder?.orderStatus === 'Pending' && <button onClick={() => handleStatusChange(selectedOrder.id, "Approved")} className="btn btn-sm btn-success text-white">Approve Order</button>}
              {selectedOrder?.orderStatus === 'Approved' && <button onClick={() => handleStatusChange(selectedOrder.id, "Processing")} className="btn btn-sm btn-info text-white">Mark Processing</button>}
              <button onClick={(e) => triggerSuccess("Invoice generated successfully!", e)} className="btn btn-sm btn-outline"><MdReceipt /> Generate Invoice</button>
              <button onClick={(e) => { if (selectedOrder) handleSendEmail(e, selectedOrder.id); }} className="btn btn-sm btn-outline"><MdEmail /> Email Customer</button>
              <button onClick={(e) => { e.stopPropagation(); if (selectedOrder) { setOrderToEdit(selectedOrder); setEditModalOpen(true); } }} className="btn btn-sm btn-outline"><MdEdit /> Edit Order</button>
              <button className="btn btn-sm btn-outline btn-error ml-auto" onClick={(e) => { e.stopPropagation(); if(selectedOrder) initiateDelete(selectedOrder.id); }}><MdDelete /> Delete Order</button>
            </div>

            {/* 2-Col Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <section>
                <h3 className="font-bold uppercase tracking-wider text-base-content/50 mb-3 text-xs">Customer Details</h3>
                <div className="space-y-2">
                  <p><span className="font-semibold block">{selectedOrder?.customerName}</span></p>
                  <p className="text-base-content/70">{selectedOrder?.contactPerson}</p>
                  <p className="text-base-content/70">{selectedOrder?.email}</p>
                  <p className="text-base-content/70">{selectedOrder?.phone}</p>
                </div>
              </section>
              <section>
                <h3 className="font-bold uppercase tracking-wider text-base-content/50 mb-3 text-xs">Delivery & Rep</h3>
                <div className="space-y-2">
                  <p><span className="text-base-content/50">Est. Delivery:</span> <span className="font-medium">{selectedOrder?.deliveryDate}</span></p>
                  <p><span className="text-base-content/50">Delivery Status:</span> <span className="font-medium">{selectedOrder?.deliveryStatus}</span></p>
                  <p><span className="text-base-content/50">Sales Rep:</span> <span className="font-medium">{selectedOrder?.salesRep}</span></p>
                  <p><span className="text-base-content/50">Payment:</span> <span className="font-medium text-success">{selectedOrder?.paymentStatus}</span></p>
                </div>
              </section>
            </div>

            {/* Ordered Products Table */}
            <section>
              <h3 className="font-bold uppercase tracking-wider text-base-content/50 mb-3 text-xs">Order Items</h3>
              <div className="bg-base-200/30 rounded-xl border border-base-200 overflow-hidden">
                <table className="table table-sm w-full">
                  <thead className="bg-base-200/50">
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder?.products?.map((p, idx) => (
                      <tr key={idx}>
                        <td>
                          <p className="font-semibold">{p.productName || (p as any).name}</p>
                          <p className="text-[10px] text-base-content/50 font-mono">{p.sku}</p>
                        </td>
                        <td>₹{p.price?.toLocaleString()}</td>
                        <td>{p.quantity || (p as any).qty}</td>
                        <td className="text-right font-medium">₹{p.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-base-200/30">
                      <td colSpan={3} className="text-right font-bold text-base-content/70">Grand Total</td>
                      <td className="text-right font-bold text-lg text-success">₹{selectedOrder?.orderValue?.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* Notes */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
                <h4 className="text-xs font-bold text-warning-content mb-1">Internal Notes</h4>
                <p className="text-sm">{selectedOrder?.notes?.internal || (selectedOrder as any)?.internalNotes || "No internal notes."}</p>
              </div>
              <div className="bg-info/10 p-3 rounded-lg border border-info/20">
                <h4 className="text-xs font-bold text-info-content mb-1">Customer Notes</h4>
                <p className="text-sm">{selectedOrder?.notes?.customer || (selectedOrder as any)?.customerNotes || "No notes from customer."}</p>
              </div>
            </section>

            {/* Activity Timeline */}
            <section>
              <h3 className="font-bold uppercase tracking-wider text-base-content/50 mb-4 text-xs">Activity Timeline</h3>
              <ul className="timeline timeline-vertical timeline-compact max-md:timeline-compact">
                <li>
                  <div className="timeline-middle"><MdCheckCircle className="text-primary" /></div>
                  <div className="timeline-end timeline-box bg-base-200 border-none shadow-sm text-sm">
                    <span className="font-semibold">Order Created</span>
                    <p className="text-xs text-base-content/50">{selectedOrder && new Date(selectedOrder.orderDate).toLocaleString()}</p>
                  </div>
                  <hr className="bg-primary" />
                </li>
                {selectedOrder?.orderStatus !== "Draft" && selectedOrder?.orderStatus !== "Pending" && (
                  <li>
                    <hr className="bg-primary" />
                    <div className="timeline-middle"><MdCheckCircle className="text-primary" /></div>
                    <div className="timeline-end timeline-box bg-base-200 border-none shadow-sm text-sm">
                      <span className="font-semibold">Order Approved</span>
                      <p className="text-xs text-base-content/50">By Sales Manager</p>
                    </div>
                    {selectedOrder?.orderStatus === "Completed" && <hr className="bg-primary" />}
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <dialog className={`modal ${deleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Confirm Deletion</h3>
          <p className="py-4">Are you sure you want to delete this order? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={confirmDelete}>Yes, Delete</button>
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
                  <label className="label"><span className="label-text">Order Number</span></label>
                  <input type="text" className="input input-bordered w-full bg-base-200" value={orderToEdit.orderNumber} readOnly />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Customer Name</span></label>
                  <input type="text" className="input input-bordered w-full" value={orderToEdit.customerName} onChange={(e) => setOrderToEdit({...orderToEdit, customerName: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Contact Person</span></label>
                  <input type="text" className="input input-bordered w-full" value={orderToEdit.contactPerson || ""} onChange={(e) => setOrderToEdit({...orderToEdit, contactPerson: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Email</span></label>
                  <input type="email" className="input input-bordered w-full" value={orderToEdit.email || ""} onChange={(e) => setOrderToEdit({...orderToEdit, email: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Phone</span></label>
                  <input type="text" className="input input-bordered w-full" value={orderToEdit.phone || ""} onChange={(e) => setOrderToEdit({...orderToEdit, phone: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Sales Rep</span></label>
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
                  <label className="label"><span className="label-text">Order Date</span></label>
                  <input type="date" className="input input-bordered w-full" value={orderToEdit.orderDate ? new Date(orderToEdit.orderDate).toISOString().split('T')[0] : ""} onChange={(e) => setOrderToEdit({...orderToEdit, orderDate: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Delivery Date</span></label>
                  <input type="date" className="input input-bordered w-full" value={orderToEdit.deliveryDate ? new Date(orderToEdit.deliveryDate).toISOString().split('T')[0] : ""} onChange={(e) => setOrderToEdit({...orderToEdit, deliveryDate: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Order Status</span></label>
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
                  <label className="label"><span className="label-text">Payment Status</span></label>
                  <select className="select select-bordered w-full" value={orderToEdit.paymentStatus} onChange={(e) => setOrderToEdit({...orderToEdit, paymentStatus: e.target.value as any})}>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Priority</span></label>
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
                  <label className="label"><span className="label-text">Billing Address</span></label>
                  <textarea className="textarea textarea-bordered w-full" value={orderToEdit.billingAddress || ""} onChange={(e) => setOrderToEdit({...orderToEdit, billingAddress: e.target.value})}></textarea>
                </div>
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label"><span className="label-text">Shipping Address</span></label>
                  <textarea className="textarea textarea-bordered w-full" value={orderToEdit.shippingAddress || ""} onChange={(e) => setOrderToEdit({...orderToEdit, shippingAddress: e.target.value})}></textarea>
                </div>
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label"><span className="label-text">Internal Notes</span></label>
                  <textarea className="textarea textarea-bordered w-full" value={orderToEdit.notes?.internal || ""} onChange={(e) => setOrderToEdit({...orderToEdit, notes: {...(orderToEdit.notes || {internal: "", customer: ""}), internal: e.target.value}} as Order)}></textarea>
                </div>
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label"><span className="label-text">Customer Notes</span></label>
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

      <dialog className={`modal ${bulkDeleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Confirm Bulk Delete</h3>
          <p className="py-4">Are you sure you want to delete {Object.keys(rowSelection).length} selected orders? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setBulkDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={handleBulkDelete}>Yes, Delete All</button>
          </div>
        </div>
      </dialog>

      <dialog className={`modal ${bulkStatusModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Update Status for Selected Orders</h3>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-semibold">New Status</span></label>
            <select className="select select-bordered ml-3" value={newStatus} onChange={(e) => setNewStatus(e.target.value as Order["orderStatus"])}>
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
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setBulkStatusModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkStatusUpdate}>Update Status</button>
          </div>
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
