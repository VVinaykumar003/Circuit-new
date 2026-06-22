import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  MdRefresh,
  MdClose,
  MdEdit,
  MdDelete,
  MdPhone,
  MdEmail,
  MdBusiness,
  MdTimeline,
  MdNotes,
  MdPerson,
} from "react-icons/md";
import { deleteLead, getLeads, updateLead, convertLeadToCustomer } from "@/services/leadServices";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "react-toastify";

/* ─────────────────────────── types ─────────────────────────── */
export interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  leadOwner:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  leadSource: string;
  industry: string;
  leadStatus:
    | "New"
    | "Contacted"
    | "Qualified"
    | "Proposal Sent"
    | "Negotiation"
    | "Won"
    | "Lost";
  priority: "Low" | "Medium" | "High" | "Urgent";
  createdAt: string;
  lastContacted: string;
  value?: number;
}

/* ─────────────────────────── mock data ──────────────────────── */
// const SAMPLE: Lead[] = [
//   {
//     id: "LD-1001",
//     firstName: "Sarah",
//     lastName: "Connor",
//     companyName: "Cyberdyne Systems",
//     email: "sarah.connor@cyberdyne.com",
//     phoneNumber: "+1 555-0198",
//     leadOwner: "V VINAY Kumar",
//     leadSource: "Website",
//     industry: "Technology",
//     leadStatus: "New",
//     priority: "High",
//     createdDate: "2026-06-01",
//     lastContacted: "2026-06-02",
//     value: 15000,
//   },
//   {
//     id: "LD-1002",
//     firstName: "Bruce",
//     lastName: "Wayne",
//     companyName: "Wayne Enterprises",
//     email: "bruce@wayne.com",
//     phoneNumber: "+1 555-0199",
//     leadOwner: "Riya Sharma",
//     source: "Referral",
//     industry: "Manufacturing",
//     status: "Qualified",
//     priority: "Urgent",
//     createdDate: "2026-05-15",
//     lastContacted: "2026-06-01",
//     value: 120000,
//   },
//   {
//     id: "LD-1003",
//     firstName: "Clark",
//     lastName: "Kent",
//     companyName: "Daily Planet",
//     email: "ckent@dailyplanet.com",
//     phoneNumber: "+1 555-0200",
//     leadOwner: "V VINAY Kumar",
//     source: "Trade Show",
//     industry: "Media",
//     status: "Negotiation",
//     priority: "Medium",
//     createdDate: "2026-05-20",
//     lastContacted: "2026-05-28",
//     value: 8500,
//   },
//   {
//     id: "LD-1004",
//     firstName: "Tony",
//     lastName: "Stark",
//     companyName: "Stark Industries",
//     email: "tony@stark.com",
//     phoneNumber: "+1 555-0201",
//     leadOwner: "Arjun Mehta",
//     source: "Cold Call",
//     industry: "Defense",
//     status: "Won",
//     priority: "High",
//     createdDate: "2026-04-10",
//     lastContacted: "2026-05-10",
//     value: 250000,
//   },
// ];

/* ─────────────────────────── component ─────────────────────── */
export default function AllLeads() {
  const navigate = useNavigate();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "notes">(
    "overview",
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { auth } = useAuth();
  const slug = auth?.slug;
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await getLeads(slug || "");
        
        setLeads(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (slug) {
      fetchLeads();
    }
  }, [slug]);
  console.log(leads);
  useEffect(() => {
    if (selectedLead) {
      setEditData(selectedLead);
    }
  }, [selectedLead]);


  const handleDelete = async (leadId: string) => {
    try {
      await deleteLead(leadId, slug || "");

      toast.success("Lead deleted successfully");

      // UI update
      setLeads((prev) => prev.filter((lead) => lead._id !== leadId));
    } catch (error) {
      toast.error("Failed to delete lead");
      console.error(error);
    }
  };

  const handleUpdateLead = async () => {
    try {
      if (!selectedLead?._id) return;

      const res = await updateLead(selectedLead._id, editData as any, slug || "");

      const updatedLead = res.data as unknown as Lead;

      setLeads((prev) =>
        prev.map((lead) => (lead._id === updatedLead._id ? updatedLead : lead)),
      );

      setSelectedLead(updatedLead);
      setIsEditing(false);

      toast.success("Lead updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update lead");
    }
  };

  const handleConvertToCustomer = async (leadToConvert: Lead | null) => {
    if (!leadToConvert?._id) return;
    try {
      const data = await convertLeadToCustomer(slug || ""  ,leadToConvert._id );
      if (!data?.success) {
        throw new Error(data.message || "Failed to convert lead");
      }

      setLeads((prev) =>
        prev.map((lead) => (lead._id === leadToConvert._id ? { ...lead, leadStatus: "Won" } : lead))
      );
      
      toast.success("Lead successfully converted to Customer!");
      setSelectedLead(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to convert lead");
    }
  };

  // Stats Calculation
  const stats = useMemo(() => {
    return {
      total: leads.length || 0,
      new: leads.filter((l) => l.leadStatus === "New").length,
      qualified: leads.filter((l) => l.leadStatus === "Qualified").length,
      won: leads.filter((l) => l.leadStatus === "Won").length,
      totalValue: leads
        .filter((l) => l.leadStatus !== "Lost")
        .reduce((sum, l) => sum + (l.value || 0), 0),
    };
  }, [leads]);

  // TanStack Table Setup
  const columnHelper = createColumnHelper<Lead>();
  const columns = useMemo(
    () => [
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
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: "name",
        header: "Lead Name",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-8 h-8">
                <span className="text-xs items-center flex justify-center p-1.5">
                  {info.row.original.firstName[0]}
                  {info.row.original.lastName[0]}
                </span>
              </div>
            </div>
            <div>
              <div className="font-bold text-base-content hover:text-primary cursor-pointer hover:underline transition-colors">
                {info.getValue()}
              </div>
              <div className="text-xs text-base-content/60">
                {info.row.original.email}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("companyName", {
        header: "Company",
        cell: (info) => (
          <span className="font-medium text-base-content/80">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("leadStatus", {
        header: "Status",
        cell: (info) => {
          const val = info.getValue();

          const colors: Record<string, string> = {
            New: "badge-info text-info-content",
            Contacted: "badge-primary text-primary-content",
            Qualified: "badge-secondary text-secondary-content",
            "Proposal Sent": "badge-accent text-accent-content",
            Negotiation: "badge-warning text-warning-content",
            Won: "badge-success text-success-content",
            Lost: "badge-error text-error-content",
          };
          return (
            <span
              className={`badge badge-sm font-medium border-none shadow-sm ${colors[val] || "badge-neutral"}`}
            >
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => {
          const val = info.getValue();
          const colors: Record<string, string> = {
            Low: "text-base-content/50",
            Medium: "text-info",
            High: "text-warning",
            Urgent: "text-error font-bold",
          };
          return (
            <span className={`text-xs uppercase font-semibold ${colors[val]}`}>
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor("leadOwner", {
        header: "Owner",

        cell: (info) => (
          <span className="text-sm">{info.getValue()?.name || "N/A"}</span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => (
          <span className="text-sm text-base-content/70">
            {" "}
            {new Date(info.getValue() as string).toLocaleDateString("en-GH")}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div
            className="dropdown dropdown-end"
            onClick={(e) => e.stopPropagation()}
          >
            <button tabIndex={0} className="btn btn-ghost btn-xs btn-square">
              <MdMoreVert size={18} />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-40 border border-base-200"
            >
              <li>
                <a onClick={() => setSelectedLead(row.original)}>
                  <MdPerson size={16} /> View Details
                </a>
              </li>
              <li>
                <a
  onClick={() => {
    setSelectedLead(row.original);
    setEditData(row.original);
    setIsEditing(true);
  }}
>
  <MdEdit size={16} /> Edit Lead
</a>
              </li>
              <div className="divider my-1"></div>
              <li>
                <a
                  className="text-error hover:bg-error/10"
                  onClick={() => {
                    setSelectedLead(row.original);
                    setDeleteModalOpen(true);
                  }}
                >
                  <MdDelete size={16} /> Delete
                </a>
              </li>
            </ul>
          </div>
        ),
      }),
    ],
    [navigate],
  );

  const filteredLeads = useMemo(() => {
    return leads.filter(
      (l) =>
        l.firstName.toLowerCase().includes(search.toLowerCase()) ||
        l.lastName.toLowerCase().includes(search.toLowerCase()) ||
        l.companyName.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [leads, search]);

  const table = useReactTable({
    data: filteredLeads,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportCSV = () => {
    console.log("Exporting CSV...");
    // Implementation for CSV export
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans flex flex-col h-full overflow-hidden relative">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">
            Leads Management
          </h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1 font-medium">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li className="text-primary">Leads</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-outline btn-sm gap-2 bg-base-100"
            onClick={exportCSV}
          >
            <MdDownload size={16} /> Export CSV
          </button>
          <button className="btn btn-outline btn-sm btn-square bg-base-100">
            <MdRefresh size={16} />
          </button>
          <button
            onClick={() => navigate("/sales/leads/new")}
            className="btn btn-primary btn-sm gap-2 shadow-sm"
          >
            <MdAdd size={16} /> Create Lead
          </button>
        </div>
      </div>

      {/* ── Dashboard Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Leads",
            value: stats.total,
            color: "text-base-content",
          },
          { label: "New Leads", value: stats.new, color: "text-info" },
          {
            label: "Qualified",
            value: stats.qualified,
            color: "text-secondary",
          },
          {
            label: "Pipeline Value",
            value: `₹${stats.totalValue.toLocaleString()}`,
            color: "text-success",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-base-100 border border-base-300 rounded-xl p-5 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-base-300"></div>
            <span className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
              {stat.label}
            </span>
            <span className={`text-3xl font-black mt-1 ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-base-100 p-3 rounded-xl border border-base-300 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
              size={18}
            />
            <input
              type="text"
              placeholder="Search leads by name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-sm ${showFilters ? "btn-primary" : "btn-outline bg-base-100"} gap-2`}
          >
            <MdFilterList size={16} /> Filters
          </button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 shadow-sm animate-fade-in-down">
          <div>
            <label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">
              Lead Status
            </label>
            <select className="select select-sm select-bordered w-full">
              <option>All</option>
              <option>New</option>
              <option>Qualified</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">
              Lead Source
            </label>
            <select className="select select-sm select-bordered w-full">
              <option>All</option>
              <option>Website</option>
              <option>Referral</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">
              Lead Owner
            </label>
            <select className="select select-sm select-bordered w-full">
              <option>All</option>
              <option>V VINAY Kumar</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button className="btn btn-sm btn-primary flex-1">Apply</button>
            <button className="btn btn-sm btn-ghost flex-1">Reset</button>
          </div>
        </div>
      )}

      {/* ── Bulk Actions ── */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between shadow-sm animate-fade-in-up">
          <span className="text-sm font-semibold text-primary">
            {Object.keys(rowSelection).length} leads selected
          </span>
          <div className="flex gap-2">
            <button className="btn btn-xs btn-primary">Update Status</button>
            <button className="btn btn-xs btn-outline bg-base-100">
              Assign Owner
            </button>
            <button className="btn btn-xs btn-error text-white">Delete</button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
        <div className="flex-1 overflow-auto">
          <table className="table table-pin-rows w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-base-200/50 text-base-content/70"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="font-semibold py-3 cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{ asc: " 🔼", desc: " 🔽" }[
                        header.column.getIsSorted() as string
                      ] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-base-200/50 transition-colors cursor-pointer border-b border-base-200"
                  onClick={() => setSelectedLead(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <MdPerson size={48} className="text-base-content/20" />
                      <p className="text-base-content/50 font-medium">
                        No leads found matching your criteria.
                      </p>
                      <button
                        onClick={() => navigate("/sales/leads/new")}
                        className="btn btn-outline btn-sm mt-2"
                      >
                        Create New Lead
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="border-t border-base-300 p-3 bg-base-100 flex items-center justify-between text-sm">
          <span className="text-base-content/60 font-medium">
            Showing {table.getRowModel().rows.length} of {filteredLeads.length}{" "}
            leads
          </span>
          <div className="flex items-center gap-3">
            <select
              className="select select-sm select-bordered bg-base-200"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[10, 25, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            <div className="join">
              <button
                className="join-item btn btn-sm bg-base-200"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                «
              </button>
              <button className="join-item btn btn-sm bg-base-200">
                Page {table.getState().pagination.pageIndex + 1}
              </button>
              <button
                className="join-item btn btn-sm bg-base-200"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lead Details Drawer ── */}
      <div
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity ${selectedLead ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSelectedLead(null)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-full md:w-[600px] bg-base-100 shadow-2xl transition-transform duration-300 transform ${selectedLead ? "translate-x-0" : "translate-x-full"} flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-base-300 bg-base-200/50 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-14 h-14 text-xl font-bold shadow-sm">
                    <span className="flex items-center justify-center p-3.5">
                      {selectedLead?.firstName[0]}
                      {selectedLead?.lastName[0]}
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-base-content leading-tight">
                    {selectedLead?.firstName} {selectedLead?.lastName}
                  </h2>
                  <p className="text-sm font-medium text-base-content/60 mt-0.5">
                    {selectedLead?.companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="btn btn-ghost btn-circle btn-sm bg-base-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm flex-1">
                <MdPhone /> Call
              </button>
              <button className="btn btn-outline btn-sm flex-1 bg-base-100">
                <MdEmail /> Email
              </button>
              <div className="dropdown dropdown-end">
                <button
                  tabIndex={0}
                  className="btn btn-outline btn-sm btn-square bg-base-100"
                >
                  <MdMoreVert size={18} />
                </button>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-40 mt-1 border border-base-200"
                >
                  <li>
                   <a
  onClick={() => {
    setEditData(selectedLead || {});
    setIsEditing(true);
  }}
>
  Edit Lead
</a>
                  </li>
                  <li>
                <a onClick={() => handleConvertToCustomer(selectedLead)}>
                  Convert to Customer
                </a>
                  </li>
                  <div className="divider my-1"></div>
                  <li>
                    <a
                      className="text-error"
                      onClick={() => setDeleteModalOpen(true)}
                    >
                      Delete Lead
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Drawer Tabs */}
            <div className="tabs tabs-bordered w-full border-b border-base-300 mt-2">
              <a
                className={`tab font-medium ${activeTab === "overview" ? "tab-active text-primary" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </a>
              <a
                className={`tab font-medium ${activeTab === "timeline" ? "tab-active text-primary" : ""}`}
                onClick={() => setActiveTab("timeline")}
              >
                Timeline
              </a>
              <a
                className={`tab font-medium ${activeTab === "notes" ? "tab-active text-primary" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                Notes
              </a>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-base-100">
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  {/* First Name */}
                  <div>
                    <p className="text-base-content/50 mb-1">First Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full"
                        value={editData.firstName || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <p className="font-medium">{selectedLead?.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <p className="text-base-content/50 mb-1">Last Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full"
                        value={editData.lastName || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <p className="font-medium">{selectedLead?.lastName}</p>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <p className="text-base-content/50 mb-1">Company</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full overflow-hidden"
                        value={editData.companyName || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            companyName: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <p className="font-medium">{selectedLead?.companyName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-base-content/50 mb-1">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        className="input input-bordered input-sm w-full"
                        value={editData.email || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <p className="font-medium">{selectedLead?.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <p className="text-base-content/50 mb-1">Phone</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full"
                        value={editData.phoneNumber || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            phoneNumber: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <p className="font-medium">{selectedLead?.phoneNumber}</p>
                    )}
                  </div>

                  {/* Lead Source */}
                  <div>
                    <p className="text-base-content/50 mb-1">Lead Source</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full"
                        value={editData.leadSource || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            leadSource: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <p className="font-medium">{selectedLead?.leadSource}</p>
                    )}
                  </div>

                  {/* Industry */}
                  <div>
                    <p className="text-base-content/50 mb-1">Industry</p>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full"
                        value={editData.industry || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            industry: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <p className="font-medium">{selectedLead?.industry}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-base-content/50 mb-1">Status</p>
                    {isEditing ? (
                      <select
                        className="select select-bordered select-sm w-full"
                        value={editData.leadStatus || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            leadStatus: e.target.value as Lead["leadStatus"],
                          }))
                        }
                      >
                        <option>New</option>
                        <option>Contacted</option>
                        <option>Qualified</option>
                        <option>Proposal Sent</option>
                        <option>Negotiation</option>
                        <option>Won</option>
                        <option>Lost</option>
                      </select>
                    ) : (
                      <p className="font-medium">{selectedLead?.leadStatus}</p>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <p className="text-base-content/50 mb-1">Priority</p>
                    {isEditing ? (
                      <select
                        className="select select-bordered select-sm w-full"
                        value={editData.priority || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            priority: e.target.value as Lead["priority"],
                          }))
                        }
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    ) : (
                      <p className="font-medium">{selectedLead?.priority}</p>
                    )}
                  </div>
                </div>

                <div className="divider my-0"></div>

          <section>
  <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-4 flex items-center gap-2">
    <MdBusiness /> Contact Details
  </h3>

  <div className="grid grid-cols-1 gap-y-4 text-sm bg-base-200/50 p-4 rounded-xl border border-base-200">

    <div>
      <p className="text-base-content/50 mb-1">Email</p>
      {isEditing ? (
        <input
          type="email"
          className="input input-bordered input-sm w-full"
          value={editData.email || ""}
          onChange={(e) =>
            setEditData((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
        />
      ) : (
        <div className="flex items-center gap-3">
          <MdEmail className="text-base-content/40" size={18} />
          <a
            href={`mailto:${selectedLead?.email}`}
            className="text-primary hover:underline"
          >
            {selectedLead?.email}
          </a>
        </div>
      )}
    </div>

    <div>
      <p className="text-base-content/50 mb-1">Phone Number</p>
      {isEditing ? (
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          value={editData.phoneNumber || ""}
          onChange={(e) =>
            setEditData((prev) => ({
              ...prev,
              phoneNumber: e.target.value,
            }))
          }
        />
      ) : (
        <div className="flex items-center gap-3">
          <MdPhone className="text-base-content/40" size={18} />
          <a
            href={`tel:${selectedLead?.phoneNumber}`}
            className="text-primary hover:underline"
          >
            {selectedLead?.phoneNumber}
          </a>
        </div>
      )}
    </div>

  </div>
</section>

                <section className="bg-base-200/30 p-4 rounded-xl border border-base-200 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-base-content/60">
                    <p>
                      Created:{" "}
                      {selectedLead?.createdAt &&
                        new Date(selectedLead?.createdAt).toLocaleDateString(
                          "en-GH",
                        )}
                    </p>
                    {/* <p>Last Contact: {selectedLead?.lastContacted}</p> */}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="animate-fade-in">
                <ul className="timeline timeline-vertical timeline-compact">
                  <li>
                    <hr className="bg-primary" />
                    <div className="timeline-middle text-primary">
                      <MdTimeline />
                    </div>
                    <div className="timeline-end timeline-box border-none shadow-none bg-transparent py-2">
                      <div className="text-xs text-base-content/50">
                        {selectedLead?.lastContacted}
                      </div>
                      <div className="text-sm font-medium">
                        Status changed to {selectedLead?.leadStatus}
                      </div>
                    </div>
                    <hr className="bg-base-300" />
                  </li>
                  <li>
                    <hr className="bg-base-300" />
                    <div className="timeline-middle text-base-300">
                      <MdTimeline />
                    </div>
                    <div className="timeline-end timeline-box border-none shadow-none bg-transparent py-2">
                      <div className="text-xs text-base-content/50">
                        {selectedLead?.createdAt &&
                          new Date(selectedLead?.createdAt).toLocaleDateString(
                            "en-GH",
                          )}
                      </div>
                      <div className="text-sm font-medium">
                        Lead Created by System
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="animate-fade-in flex flex-col h-full">
                <textarea
                  className="textarea textarea-bordered w-full flex-1 min-h-[200px]"
                  placeholder="Add a note about this lead..."
                ></textarea>
                <button className="btn btn-primary mt-4 self-end gap-2">
                  <MdNotes /> Save Note
                </button>
              </div>
            )}
              {isEditing && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setIsEditing(false);
                setEditData(selectedLead || {});
              }}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleUpdateLead}
            >
              Save Changes
            </button>
          </div>
        )}
          </div>
        </div>
      
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <dialog className={`modal ${deleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Delete Lead</h3>
          <p className="py-4 text-base-content/80">
            Are you sure you want to delete{" "}
            <strong>
              {selectedLead?.firstName} {selectedLead?.lastName}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="modal-action mt-6">
            <button
              className="btn btn-ghost"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-error text-white"
              onClick={async () => {
                if (!selectedLead?._id) return;

                await handleDelete(selectedLead._id);

                setDeleteModalOpen(false);
                setSelectedLead(null);
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
