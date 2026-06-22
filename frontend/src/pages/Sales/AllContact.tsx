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
  MdAdd,
  MdMoreVert,
  MdFilterList,
  MdDownload,
  MdRefresh,
  MdPerson,
  MdEmail,
  MdPhone,
  MdEdit,
  MdDelete,
  MdAssignmentInd,
} from "react-icons/md";
import { deleteContact, getAllContacts } from "@/services/salesService";
import { useAuth } from "@/auth/AuthContext";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import EntityDrawer from "@/components/sales/EntityDrawer";

/* ─────────────────────────── types ─────────────────────────── */
export interface Contact {
  id: string;
  name: string;
  designation: string;
  email: string;
  phoneNumber: string;
  company: string;
  lead: string;
  city: string;
  status: "Active" | "Inactive" | "Prospect" | "Customer" | "VIP" | "Blocked";
  assignedRep: string;
  lastActivity: string;
  createdDate: string;
  avatarUrl?: string;
}

/* ─────────────────────────── mock data ──────────────────────── */
const SAMPLE: Contact[] = [
  {
    id: "CON-1001",
    name: "Alice Johnson",
    designation: "CEO",
    email: "alice@zager.com",
    phoneNumber: "+91 9876543210",
    company: "Zager Digital Services",
    lead: "ERP Implementation",
    city: "Bangalore",
    status: "VIP",
    assignedRep: "V VINAY Kumar",
    lastActivity: "2026-06-02",
    createdDate: "2024-01-15",
  },
  {
    id: "CON-1002",
    name: "Bob Smith",
    designation: "Procurement Head",
    email: "bob@acme.com",
    phoneNumber: "+1 555-0198",
    company: "Acme Corp",
    lead: "-",
    city: "New York",
    status: "Customer",
    assignedRep: "Riya Sharma",
    lastActivity: "2026-05-28",
    createdDate: "2025-11-20",
  },
  {
    id: "CON-1003",
    name: "Tony Stark",
    designation: "Founder",
    email: "tony@stark.com",
    phoneNumber: "+1 555-0200",
    company: "Stark Industries",
    lead: "Defense Contract",
    city: "Malibu",
    status: "Active",
    assignedRep: "Arjun Mehta",
    lastActivity: "2026-06-01",
    createdDate: "2023-08-10",
  },
  {
    id: "CON-1004",
    name: "Sarah Connor",
    designation: "Operations Manager",
    email: "sarah.c@cyberdyne.com",
    phoneNumber: "+44 20 7123 4567",
    company: "Cyberdyne Systems",
    lead: "Security AI Upgrade",
    city: "London",
    status: "Prospect",
    assignedRep: "V VINAY Kumar",
    lastActivity: "2026-05-30",
    createdDate: "2026-05-01",
  },
];

/* ─────────────────────────── component ─────────────────────── */
export default function ContactsDashboard() {
  const navigate = useNavigate();

  // State
const [rawContacts, setRawContacts] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [drawerType] = useState("contact");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
    const { auth } = useAuth();
  const slug = auth?.slug;
  useEffect(() => {
    fetchContacts();
  }, [slug]);

  if (!slug) {
    return null; // or a loading state
  }
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getAllContacts(slug);
      setRawContacts(response.data.data);
      // console.log("Fetched contacts:", response.data.data);
      const mapped = response.data.data.map((c: any) => ({
        id: c._id,

        name: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
        designation: c.designation ?? "",
        email: c.email ?? "",
        phoneNumber: c.phone?.number ?? "",
        company: c.company || "-",
        leadSource: c.leadSource ?? "-",
        city: c.address?.city ?? "",
        status: c.status ?? "Active",
        assignedRep: c.assignedRep?.name ?? "",
        lastActivity: c.updatedAt ?? "",
        createdDate: c.createdAt ?? "",
      }));

      setContacts(mapped);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This contact will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteContact(slug, id);

      setContacts((prev) => prev.filter((c) => c.id !== id));

      toast.success("Contact deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete contact. Please try again.");
    }
  };
const handleRowClick = (row: any) => {
  const raw = rawContacts.find((c) => c._id === row.original.id);

  setSelectedContact(raw);
  setDrawerMode("view");
  setDrawerOpen(true);
};



  const handleBulkDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: "Delete selected contacts?",
      text: `You are deleting ${selectedIds.length} contacts`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
    });

    if (!result.isConfirmed) return;

    try {
      // Option A: loop delete (safe if no bulk API)
      await Promise.all(selectedIds.map((id) => deleteContact(slug, id)));

      setContacts((prev) => prev.filter((c) => !selectedIds.includes(c.id)));

      setRowSelection({}); // clear selection

      toast.success("Contacts deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed");
    }
  };
  // Stats Calculation
  const stats = useMemo(() => {
    return {
      total: contacts.length,
      active: contacts.filter(
        (c) =>
          c.status === "Active" ||
          c.status === "VIP" ||
          c.status === "Customer",
      ).length,
      prospects: contacts.filter((c) => c.status === "Prospect").length,
      linkedLeads: contacts.filter((c) => c.lead && c.lead !== "-").length,
    };
  }, [contacts]);

  // TanStack Table Setup
  const columnHelper = createColumnHelper<Contact>();
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
      columnHelper.accessor("name", {
        header: "Contact Name",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-sm">
                <span>{info.getValue().charAt(0)}</span>
              </div>
            </div>
            <div>
              <div className="font-bold text-base-content hover:text-primary cursor-pointer hover:underline transition-colors">
                {info.getValue()}
              </div>
              <div className="text-xs text-base-content/60">
                {info.row.original.designation}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("email", {
        header: "Contact Details",
        cell: (info) => (
          <div className="flex flex-col gap-0.5">
            <a
              href={`mailto:${info.getValue()}`}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              <MdEmail size={14} /> {info.getValue()}
            </a>
            <span className="text-xs text-base-content/70 flex items-center gap-1">
              <MdPhone size={14} /> {info.row.original.phoneNumber}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("company", {
        header: "Company / Account",
        cell: (info) => (
          <span className="font-semibold text-base-content/90">
            {info.getValue()}
          </span>
        ),
      }),
      // columnHelper.accessor("leadSource", {
      //   header: "Linked Lead",
      //   cell: (info) => <span className="text-sm truncate max-w-[150px] inline-block">{info.getValue()}</span>,
      // }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const val = info.getValue();
          const colors: Record<string, string> = {
            Active: "badge-success text-white",
            Customer: "badge-primary text-white",
            VIP: "badge-warning text-warning-content font-bold",
            Prospect: "badge-info text-info-content",
            Inactive: "badge-ghost",
            Blocked: "badge-error text-white",
          };
          return (
            <span
              className={`badge badge-sm border-none shadow-sm ${colors[val]}`}
            >
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor("assignedRep", {
        header: "Assigned Rep",
        cell: (info) => (
          <span className="text-sm font-medium">{info.getValue()}</span>
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
            <button  onClick={(e) => e.stopPropagation()} tabIndex={0} className="btn btn-ghost btn-xs btn-square">
              <MdMoreVert size={18} />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-200"
            >
              {/* <li>
                <a
                  onClick={() => navigate(`/sales/contacts/${row.original.id}`)}
                >
                  <MdPerson size={16} /> View Profile
                </a>
              </li> */}
              <li>
                <a
                  onClick={() => {
      const raw = rawContacts.find(
        (c) => c._id === row.original.id
      );

      setSelectedContact(raw);
      setDrawerMode("edit");
      setDrawerOpen(true);
    }}
                >
                  <MdEdit size={16} /> Edit Contact
                </a>
              </li>
              <li>
                <a>
                  <MdAssignmentInd size={16} /> Assign Rep
                </a>
              </li>
              <li>
                <a>
                  <MdEmail size={16} /> Send Email
                </a>
              </li>
              <div className="divider my-1"></div>
              <li>
                <a
                  className="text-error hover:bg-error/10"
                  onClick={() => handleDelete(row.original.id)}
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
 

  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.assignedRep.toLowerCase().includes(search.toLowerCase()),
    );
  }, [contacts, search]);

  const table = useReactTable({
    data: filteredContacts,
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
          <h1 className="text-2xl font-bold text-base-content tracking-tight">
            Contacts Management
          </h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1 font-medium">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li className="text-primary">Contacts</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-outline btn-sm gap-2 bg-base-100">
            <MdDownload size={16} /> Export CSV
          </button>
          <button className="btn btn-outline btn-sm btn-square bg-base-100">
            <MdRefresh size={16} />
          </button>
          <button
            onClick={() => navigate("/sales/contacts/new")}
            className="btn btn-primary btn-sm gap-2 shadow-sm"
          >
            <MdAdd size={16} /> Add Contact
          </button>
        </div>
      </div>

      {/* ── Dashboard Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Contacts",
            value: stats.total,
            color: "text-base-content",
          },
          { label: "Active & VIP", value: stats.active, color: "text-primary" },
          {
            label: "New Prospects",
            value: stats.prospects,
            color: "text-info",
          },
          {
            label: "Linked Leads",
            value: stats.linkedLeads,
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
              placeholder="Search contacts, emails, companies..."
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
              Status
            </label>
            <select className="select select-sm select-bordered w-full">
              <option>All</option>
              <option>Active</option>
              <option>VIP</option>
              <option>Prospect</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">
              Contact Source
            </label>
            <select className="select select-sm select-bordered w-full">
              <option>All</option>
              <option>Website</option>
              <option>Cold Call</option>
              <option>Referral</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-base-content/70 mb-1 block uppercase">
              Assigned Rep
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
            {Object.keys(rowSelection).length} contacts selected
          </span>
          <div className="flex gap-2">
            <button className="btn btn-xs btn-primary">Assign Owner</button>
            <button className="btn btn-xs btn-outline bg-base-100">
              Update Status
            </button>
            <button className="btn btn-xs btn-outline bg-base-100">
              Send Email
            </button>
            <button
              onClick={handleBulkDelete}
              className="btn btn-xs btn-error text-white"
            >
              Delete
            </button>
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
                  onClick={() => handleRowClick(row)}
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
                        No contacts found matching your criteria.
                      </p>
                      <button
                        onClick={() => navigate("/sales/contacts/new")}
                        className="btn btn-outline btn-sm mt-2"
                      >
                        Create New Contact
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
            Showing {table.getRowModel().rows.length} of{" "}
            {filteredContacts.length} contacts
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
      <EntityDrawer
  open={drawerOpen}
  mode={drawerMode}
  type={drawerType}
  data={selectedContact}
  onClose={() => setDrawerOpen(false)}
  onSave={(updated: any) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === updated._id ? {
        ...c,
        name: updated.firstName + " " + updated.lastName,
        email: updated.email,
        phoneNumber: updated.phone?.number,
        company: updated.company,
        designation: updated.designation ?? "",
        leadSource: updated.leadSource ?? "-",
        city: updated.address?.city ?? "",
        status: updated.status ?? "Active",
        assignedRep: updated.assignedRep?.name ?? updated.assignedRep ?? "",
      } : c))
    );

    setDrawerOpen(false);
  }}

/>
    </div>
    
  );
}
