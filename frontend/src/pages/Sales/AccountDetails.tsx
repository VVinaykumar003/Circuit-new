import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdEdit,
  MdBusiness,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdLanguage,
  MdAttachMoney,
  MdCheckCircle,
  MdWarning,
  MdAdd,
  MdMoreVert,
  MdDelete,
  MdPictureAsPdf,
  MdCloudDownload,
  MdAssignmentInd,
  MdArrowBack
} from "react-icons/md";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ─────────────────────────── Mock Data ─────────────────────────── */
const MOCK_ACCOUNT = {
  id: "ACC-1001",
  accountName: "Zager Digital Services",
  status: "VIP",
  accountType: "Enterprise",
  industry: "Technology",
  website: "https://zager.com",
  annualRevenue: 1250000,
  employeeCount: 250,
  accountOwner: "V VINAY Kumar",
  territory: "APAC",
  createdDate: "2024-01-15",
  lastActivity: "2026-06-02",

  contactPerson: "Alice Johnson",
  email: "alice@zager.com",
  phone: "+91 9876543210",
  altPhone: "+91 1234567890",

  billingAddress: "123 Tech Park, Tower A\nBangalore, Karnataka 560001\nIndia",
  shippingAddress: "123 Tech Park, Tower B\nBangalore, Karnataka 560001\nIndia",

  gstNumber: "29AABCZ1234E1Z5",
  panNumber: "AABCZ1234E",
  taxCategory: "Standard",

  totalOrders: 45,
  pendingPayments: 15000,
};

const MOCK_CONTACTS = [
  { id: "C1", name: "Alice Johnson", designation: "CEO", email: "alice@zager.com", phone: "+91 9876543210", dept: "Management", status: "Active" },
  { id: "C2", name: "David Chen", designation: "Procurement Head", email: "david@zager.com", phone: "+91 8765432109", dept: "Purchasing", status: "Active" },
];

const MOCK_ORDERS = [
  { id: "O1", orderNo: "SO-2026-0105", date: "2026-05-20", delivery: "2026-05-25", amount: 45000, payment: "Unpaid", status: "Delivered" },
  { id: "O2", orderNo: "SO-2026-0099", date: "2026-04-15", delivery: "2026-04-20", amount: 125000, payment: "Paid", status: "Delivered" },
];

const MOCK_TRANSACTIONS = [
  { id: "T1", invNo: "INV-2026-0080", date: "2026-04-20", amount: 125000, type: "Payment", status: "Completed" },
  { id: "T2", invNo: "INV-2026-0095", date: "2026-05-25", amount: 45000, type: "Invoice", status: "Pending" },
];

const MOCK_DOCS = [
  { id: "D1", name: "GST_Certificate.pdf", date: "2024-01-16", size: "1.2 MB", type: "Certificate" },
  { id: "D2", name: "Enterprise_SLA_2026.docx", date: "2026-01-05", size: "450 KB", type: "Agreement" },
];

const MOCK_TIMELINE = [
  { id: "TL1", action: "Order SO-2026-0105 Created", time: "2026-05-20 10:30 AM", user: "V VINAY Kumar" },
  { id: "TL2", action: "Payment of $125,000 Received", time: "2026-04-20 02:15 PM", user: "System" },
  { id: "TL3", action: "Contact David Chen Added", time: "2025-11-10 09:00 AM", user: "Riya Sharma" },
  { id: "TL4", action: "Account Created", time: "2024-01-15 11:20 AM", user: "Admin" },
];

const REVENUE_DATA = [
  { month: "Jan", revenue: 45000, orders: 4 },
  { month: "Feb", revenue: 52000, orders: 5 },
  { month: "Mar", revenue: 38000, orders: 3 },
  { month: "Apr", revenue: 125000, orders: 8 },
  { month: "May", revenue: 85000, orders: 6 },
  { month: "Jun", revenue: 45000, orders: 2 },
];

/* ─────────────────────────── Sub-Components ─────────────────────────── */
const StatCard = ({ title, value, alert }: { title: string; value: string | number; alert?: boolean }) => (
  <div className={`bg-base-100 p-5 rounded-xl border ${alert ? 'border-error shadow-error/20' : 'border-base-300'} shadow-sm flex flex-col justify-center`}>
    <span className="text-xs text-base-content/60 uppercase font-bold tracking-wider">{title}</span>
    <span className={`text-2xl font-bold mt-1 truncate ${alert ? 'text-error' : 'text-base-content'}`}>{value}</span>
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div>
    <p className="text-xs text-base-content/50 font-bold mb-1 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-base-content whitespace-pre-line leading-relaxed">{value || "—"}</p>
  </div>
);

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function AccountDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Overview");
  const [isLoading, setIsLoading] = useState(true);

  const acc = MOCK_ACCOUNT;
 
  const TABS = ["Overview", "Contacts", "Orders", "Transactions", "Notes", "Documents", "Activity Timeline", "Assigned Team"];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [id]);
 
  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-base-200 animate-pulse">
        <div className="w-full lg:w-80 h-[600px] bg-base-100 rounded-xl shadow-sm border border-base-300"></div>
        <div className="flex-1 flex flex-col gap-6">
          <div className="h-40 bg-base-100 rounded-xl shadow-sm border border-base-300"></div>
          <div className="flex-1 bg-base-100 rounded-xl shadow-sm border border-base-300 h-[400px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 font-sans flex flex-col pb-10">
      
      {/* ── Page Header ── */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:bg-base-200">
              <MdArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-base-content tracking-tight">{acc.accountName}</h1>
              <div className="text-xs text-base-content/60 breadcrumbs mt-0.5 font-medium">
                <ul>
                  <li>Dashboard</li>
                  <li>Sales</li>
                  <li><a onClick={() => navigate("/sales/accounts")}>Accounts</a></li>
                  <li className="text-primary">Account Details</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-outline btn-sm gap-2 bg-base-100"><MdEdit size={16} /> Edit Account</button>
            <button className="btn btn-primary btn-sm gap-2"><MdAdd size={16} /> Create Order</button>
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-outline btn-sm btn-square bg-base-100"><MdMoreVert size={16} /></button>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 z-50 border border-base-200 mt-1">
                <li><a><MdAssignmentInd size={16} /> Assign Rep</a></li>
                <li><a><MdAdd size={16} /> Add Contact</a></li>
                <div className="divider my-1"></div>
                <li><a className="text-error"><MdDelete size={16} /> Delete Account</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 px-6 pt-6 flex-1 max-w-[1600px] mx-auto w-full">
        
        {/* ── Left Sidebar (Profile Header & Sticky Info) ── */}
        <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
          
          {/* Profile Header Card */}
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-primary/10 to-info/10 border-b border-base-200"></div>
            
            <div className="avatar mb-3 mt-4 relative z-10">
              <div className="w-24 h-24 rounded-xl border-4 border-base-100 shadow-sm bg-base-200 flex items-center justify-center text-3xl font-bold text-primary">
                {acc.accountName.charAt(0)}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-base-content leading-tight">{acc.accountName}</h2>
            <p className="text-sm text-base-content/60 font-medium mt-1">{acc.accountType} • {acc.industry}</p>
            
            <div className="mt-3">
              <span className={`badge font-bold ${acc.status === 'VIP' ? 'badge-warning text-warning-content' : 'badge-success text-white'}`}>{acc.status}</span>
            </div>

            <div className="divider w-full my-4"></div>

            <div className="w-full space-y-3 text-sm text-left">
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1.5"><MdLanguage size={16}/> Website</span> <a href={acc.website} className="font-semibold text-primary truncate max-w-[120px]">{acc.website.replace('https://', '')}</a></div>
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1.5"><MdLocationOn size={16}/> Territory</span> <span className="font-semibold">{acc.territory}</span></div>
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1.5"><MdAssignmentInd size={16}/> Owner</span> <span className="font-semibold truncate max-w-[120px]">{acc.accountOwner}</span></div>
            </div>
          </div>

          {/* Quick Contact & Stats Sidebar */}
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-5 sticky top-24">
            <h3 className="font-bold text-base text-base-content mb-4 flex items-center gap-2"><MdPhone /> Primary Contact</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold">{acc.contactPerson}</p>
                <p className="text-xs text-base-content/60">Key Decision Maker</p>
              </div>
              <div className="flex items-center gap-3"><MdEmail className="text-base-content/40" size={16}/> <a href={`mailto:${acc.email}`} className="text-primary hover:underline truncate">{acc.email}</a></div>
              <div className="flex items-center gap-3"><MdPhone className="text-base-content/40" size={16}/> <span className="font-mono font-medium">{acc.phone}</span></div>
            </div>
            
            <div className="divider my-4"></div>
            
            <div className="space-y-3">
              <div className="bg-base-200/50 p-3 rounded-lg border border-base-200 text-center">
                <p className="text-xs font-bold text-base-content/50 uppercase mb-1">Total Revenue</p>
                <p className="text-xl font-black text-success">${acc.annualRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-error/10 p-3 rounded-lg border border-error/20 text-center">
                <p className="text-xs font-bold text-error uppercase mb-1">Pending Payments</p>
                <p className="text-xl font-black text-error">${acc.pendingPayments.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Content Area ── */}
        <div className="flex-1 flex flex-col min-w-0 gap-6">
          
          {/* Notifications / Alerts Section */}
          {acc.pendingPayments > 0 && (
            <div className="alert alert-error shadow-sm py-2 rounded-xl border border-error/30 text-white">
              <MdWarning size={20} />
              <span className="text-sm font-medium">Overdue Payment Alert: Account has an outstanding balance of ${acc.pendingPayments.toLocaleString()}.</span>
              <button className="btn btn-sm btn-ghost ml-auto">Send Reminder</button>
            </div>
          )}

          {/* Account Analytics (Top of content) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <StatCard title="Total Orders" value={acc.totalOrders} />
             <StatCard title="YTD Revenue" value={`$${(acc.annualRevenue/2).toLocaleString()}`} />
             <StatCard title="Account Age" value="2.5 Years" />
          </div>

          {/* Tabs Section */}
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 flex-1 flex flex-col overflow-hidden min-h-[600px]">
            <div className="tabs tabs-bordered pt-2 px-4 border-b border-base-200 overflow-x-auto flex-nowrap whitespace-nowrap bg-base-200/20">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`tab tab-bordered h-12 font-semibold transition-colors ${activeTab === tab ? "tab-active text-primary border-primary" : "text-base-content/60 hover:text-base-content"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "Overview" && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Analytics Chart embedded in overview */}
                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdAttachMoney /> Revenue Trend (Last 6 Months)</h3>
                    <div className="h-64 bg-base-200/30 rounded-xl border border-base-200 p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--b3))" />
                          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                          <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRev)" name="Revenue" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdBusiness /> Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Account Name" value={acc.accountName} />
                      <InfoItem label="Account Type" value={acc.accountType} />
                      <InfoItem label="Industry" value={acc.industry} />
                      <InfoItem label="Website" value={<a href={acc.website} className="text-primary hover:underline">{acc.website}</a>} />
                      <InfoItem label="Annual Revenue" value={`$${acc.annualRevenue.toLocaleString()}`} />
                      <InfoItem label="Employee Count" value={`${acc.employeeCount} Employees`} />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdLocationOn /> Addresses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
                      <InfoItem label="Billing Address" value={acc.billingAddress} />
                      <InfoItem label="Shipping Address" value={acc.shippingAddress} />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdAttachMoney /> Tax Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="GST Number" value={<span className="font-mono">{acc.gstNumber}</span>} />
                      <InfoItem label="PAN Number" value={<span className="font-mono">{acc.panNumber}</span>} />
                      <InfoItem label="Tax Category" value={acc.taxCategory} />
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 2: CONTACTS */}
              {activeTab === "Contacts" && (
                <div className="animate-fade-in flex flex-col h-full gap-4">
                  <div className="flex justify-between items-center">
                    <input type="text" placeholder="Search contacts..." className="input input-sm input-bordered w-72" />
                    <button className="btn btn-sm btn-primary gap-2"><MdAdd /> Add Contact</button>
                  </div>
                  <div className="overflow-x-auto border border-base-200 rounded-lg">
                    <table className="table table-sm w-full">
                      <thead className="bg-base-200 text-base-content/70">
                        <tr>
                          <th>Contact Name</th>
                          <th>Designation</th>
                          <th>Department</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_CONTACTS.map(c => (
                          <tr key={c.id} className="hover:bg-base-200/50 transition-colors">
                            <td className="font-bold">{c.name}</td>
                            <td>{c.designation}</td>
                            <td>{c.dept}</td>
                            <td className="text-primary">{c.email}</td>
                            <td className="font-mono">{c.phone}</td>
                            <td><span className="badge badge-sm badge-success text-white">{c.status}</span></td>
                            <td className="text-right">
                              <button className="btn btn-ghost btn-xs">Edit</button>
                              <button className="btn btn-ghost btn-xs text-error">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ORDERS */}
              {activeTab === "Orders" && (
                <div className="animate-fade-in flex flex-col h-full gap-4">
                  <div className="flex justify-between items-center bg-base-200/50 p-4 rounded-xl border border-base-200">
                    <div>
                      <p className="text-sm font-bold text-base-content/60 uppercase">Lifetime Order Value</p>
                      <p className="text-2xl font-black text-success mt-1">$450,000.00</p>
                    </div>
                    <button className="btn btn-sm btn-primary gap-2"><MdAdd /> Create Order</button>
                  </div>
                  
                  <div className="overflow-x-auto border border-base-200 rounded-lg">
                    <table className="table table-sm w-full">
                      <thead className="bg-base-200 text-base-content/70">
                        <tr>
                          <th>Order Number</th>
                          <th>Order Date</th>
                          <th>Delivery Date</th>
                          <th className="text-right">Total Amount</th>
                          <th>Payment</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_ORDERS.map(o => (
                          <tr key={o.id} className="hover:bg-base-200/50 transition-colors">
                            <td className="font-mono font-bold text-primary">{o.orderNo}</td>
                            <td>{o.date}</td>
                            <td>{o.delivery}</td>
                            <td className="text-right font-bold">${o.amount.toLocaleString()}</td>
                            <td><span className={`badge badge-sm ${o.payment === 'Paid' ? 'badge-success text-white' : 'badge-error text-white'}`}>{o.payment}</span></td>
                            <td><span className="badge badge-sm badge-ghost">{o.status}</span></td>
                            <td className="text-right">
                              <button className="btn btn-ghost btn-xs">View</button>
                              <button className="btn btn-ghost btn-xs"><MdCloudDownload size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TRANSACTIONS */}
              {activeTab === "Transactions" && (
                <div className="animate-fade-in flex flex-col h-full gap-4">
                   <div className="grid grid-cols-2 gap-4 mb-2">
                     <StatCard title="Credit Balance" value="$0.00" />
                     <StatCard title="Overdue Invoices" value="$15,000.00" alert={true} />
                   </div>
                   <div className="overflow-x-auto border border-base-200 rounded-lg">
                    <table className="table table-sm w-full">
                      <thead className="bg-base-200 text-base-content/70">
                        <tr>
                          <th>Type</th>
                          <th>Reference No.</th>
                          <th>Date</th>
                          <th className="text-right">Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_TRANSACTIONS.map(t => (
                          <tr key={t.id} className="hover:bg-base-200/50 transition-colors">
                            <td className="font-semibold">{t.type}</td>
                            <td className="font-mono">{t.invNo}</td>
                            <td>{t.date}</td>
                            <td className="text-right font-bold">${t.amount.toLocaleString()}</td>
                            <td><span className={`badge badge-sm ${t.status === 'Completed' ? 'badge-success text-white' : 'badge-warning'}`}>{t.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: NOTES */}
              {activeTab === "Notes" && (
                <div className="animate-fade-in flex flex-col h-full gap-6">
                  <div className="bg-base-200/30 p-4 rounded-xl border border-base-200">
                    <label className="text-sm font-bold mb-2 block">Add a Note</label>
                    <textarea className="textarea textarea-bordered w-full" rows={3} placeholder="Write sales note, follow-up, or meeting summary..."></textarea>
                    <div className="flex justify-end mt-2"><button className="btn btn-sm btn-primary">Save Note</button></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-base-100 border border-base-200 p-4 rounded-xl shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">Meeting Notes: Q3 Planning</span>
                        <span className="text-xs text-base-content/50">2 days ago • by V VINAY Kumar</span>
                      </div>
                      <p className="text-sm text-base-content/80 leading-relaxed">Discussed the upcoming ERP rollout. Client is ready to proceed pending final budget approval next week. Sent revised quotation.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: DOCUMENTS */}
              {activeTab === "Documents" && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-primary">Uploaded Documents</h3>
                    <button className="btn btn-sm btn-primary gap-1"><MdAdd /> Upload Document</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {MOCK_DOCS.map(d => (
                      <div key={d.id} className="border border-base-300 rounded-xl p-4 flex items-center justify-between bg-base-200/20 hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <MdPictureAsPdf size={32} className="text-error" />
                          <div>
                            <p className="font-semibold text-sm truncate max-w-[150px]" title={d.name}>{d.name}</p>
                            <p className="text-xs text-base-content/50">{d.type} • {d.size}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-square btn-sm"><MdCloudDownload size={18} /></button>
                          <button className="btn btn-ghost btn-square btn-sm text-error"><MdDelete size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: ACTIVITY TIMELINE */}
              {activeTab === "Activity Timeline" && (
                <div className="animate-fade-in max-w-3xl mx-auto py-4">
                  <ul className="timeline timeline-vertical timeline-compact">
                    {MOCK_TIMELINE.map((item, idx) => (
                      <li key={item.id}>
                        {idx !== 0 && <hr className="bg-base-300" />}
                        <div className={`timeline-middle w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${idx === 0 ? 'bg-primary' : 'bg-base-300 text-base-content'}`}>
                          <MdCheckCircle size={16} />
                        </div>
                        <div className="timeline-end timeline-box border-none shadow-none bg-transparent py-3 ml-2">
                          <p className={`font-semibold text-sm ${idx === 0 ? 'text-primary' : 'text-base-content'}`}>{item.action}</p>
                          <p className="text-xs font-mono text-base-content/50 mt-1">{item.user} • {item.time}</p>
                        </div>
                        {idx !== MOCK_TIMELINE.length - 1 && <hr className="bg-base-300" />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TAB 8: ASSIGNED TEAM */}
              {activeTab === "Assigned Team" && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-bold text-primary">Account Team</h3>
                    <button className="btn btn-sm btn-outline gap-2"><MdAssignmentInd /> Change Assignments</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-base-100 border border-base-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-16">
                          <span className="text-xl">V</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-lg">V VINAY Kumar</p>
                        <p className="text-sm text-base-content/60 mb-1">Primary Sales Representative</p>
                        <p className="text-xs font-mono text-primary">Assigned: Jan 15, 2024</p>
                      </div>
                    </div>
                    <div className="bg-base-100 border border-base-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-16">
                          <span className="text-xl">S</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-lg">Sarah Connor</p>
                        <p className="text-sm text-base-content/60 mb-1">Account Manager</p>
                        <p className="text-xs font-mono text-primary">Assigned: Jan 15, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}