import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSalesRepById } from "@/services/salesRepServices";
import { useAuth } from "@/auth/AuthContext";
import {
  MdEdit,
  MdPictureAsPdf,
  MdPrint,
  MdDelete,
  MdPhone,
  MdEmail,
  MdBusinessCenter,
  MdCloudDownload,
  MdAdd,
  MdOutlineAssignmentTurnedIn,
  MdPeople,
  MdMoreVert,
  MdCheckCircle,
  MdAssignment,
} from "react-icons/md";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─────────────────────────── Mock Data & Types ─────────────────────────── */
const MOCK_REP = {
  id: "1",
  employeeCode: "EMP-2024-001",
  firstName: "V VINAY",
  lastName: "Kumar",
  designation: "Senior Sales Executive",
  status: "Active",
  team: "Alpha Squad",
  territory: "North America",
  joiningDate: "2022-01-15",
  reportingManager: "Sarah Connor",
  phone: "+91 8319145613",
  alternatePhone: "+91 9876543210",
  email: "vvinaykumar3000@gmail.com",
  alternateEmail: "vinay@example.com",
  gender: "Male",
  dob: "1990-05-20",
  addressLine1: "A15 Shivam Complex",
  addressLine2: "Koni Bilaspur",
  city: "Bilaspur",
  state: "Chhattisgarh",
  country: "India",
  postalCode: "495001",
  employmentType: "Full-Time",
  bankName: "HDFC Bank",
  accountHolderName: "V Vinay Kumar",
  accountNumber: "501002003004",
  ifscCode: "HDFC0001234",
  upiId: "vinay@hdfc",
  avatarUrl: "https://i.pravatar.cc/150?u=vinay",

  monthlyTarget: 100000,
  monthlyAchievement: 85000,
  totalCustomers: 45,
  totalLeads: 120,
  conversionRate: 25,
  ordersThisMonth: 12,
  revenueThisMonth: 85000,

  totalRevenue: 1250000,
  totalOrders: 150,
  averageOrderValue: 8333,
  closedDeals: 30,
  openLeads: 15,
  lostLeads: 5,
  customerRetention: 88,
};

const MOCK_CUSTOMERS = [
  { id: "C1", name: "Alice Johnson", company: "Zager Digital", phone: "1234567890", email: "alice@zager.com", territory: "North America", revenue: 50000, status: "Active" },
  { id: "C2", name: "Bob Smith", company: "Acme Corp", phone: "0987654321", email: "bob@acme.com", territory: "North America", revenue: 20000, status: "Inactive" },
];

const MOCK_LEADS = [
  { id: "L1", name: "Charlie Brown", company: "TechFlow", source: "Website", status: "Qualified", expectedValue: 15000, date: "2026-06-01" },
];

const MOCK_ORDERS = [
  { id: "O1", orderNo: "SO-1001", customer: "Zager Digital", date: "2026-05-20", amount: 25000, status: "Delivered" },
  { id: "O2", orderNo: "SO-1002", customer: "Acme Corp", date: "2026-05-22", amount: 15000, status: "Processing" },
];

const MOCK_DOCS = [
  { id: "D1", name: "Aadhaar Card.pdf", date: "2022-01-10", size: "1.2 MB" },
  { id: "D2", name: "Offer Letter.pdf", date: "2022-01-12", size: "0.8 MB" },
];

const MOCK_ACTIVITY = [
  { id: "A1", action: "Order SO-1002 Created", user: "V VINAY Kumar", time: "2026-05-22 11:45 AM" },
  { id: "A2", action: "Order SO-1001 Created", user: "V VINAY Kumar", time: "2026-05-20 10:30 AM" },
  { id: "A3", action: "Lead TechFlow Assigned", user: "Sarah Connor", time: "2026-05-18 02:15 PM" },
  { id: "A4", action: "Profile Updated", user: "Admin", time: "2026-01-10 09:00 AM" },
];

const MOCK_MONTHLY_PERFORMANCE = [
  { name: "Jan", target: 80000, achieved: 85000 },
  { name: "Feb", target: 80000, achieved: 78000 },
  { name: "Mar", target: 90000, achieved: 95000 },
  { name: "Apr", target: 90000, achieved: 92000 },
  { name: "May", target: 100000, achieved: 85000 },
];

/* ─────────────────────────── Sub-Components ─────────────────────────── */
const StatCard = ({ title, value, progress = false, progressValue = 0 }: { title: string; value: string | number; progress?: boolean; progressValue?: number }) => (
  <div className="bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm flex flex-col justify-center">
    <span className="text-xs text-base-content/60 uppercase font-semibold">{title}</span>
    <span className="text-xl font-bold mt-1 text-base-content truncate">{value}</span>
    {progress && <progress className="progress progress-primary w-full mt-2" value={progressValue} max="100"></progress>}
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div>
    <p className="text-xs text-base-content/60 font-medium mb-1 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold">{value || "—"}</p>
  </div>
);

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function SalesRepProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const { data: response, isLoading } = useQuery({
    queryKey: ["salesRep", id, auth?.slug],
    queryFn: () => getSalesRepById(id!, auth?.slug || "default-tenant"),
    enabled: !!id && !!auth?.slug,
  });

  const [activeTab, setActiveTab] = useState("Overview");

  const repData = response?.data;
  const rep = repData ? {
    ...MOCK_REP,
    ...repData,
    id: repData.id || repData._id || MOCK_REP.id,
    firstName: repData.fullName?.split(" ")[0] || repData.firstName || MOCK_REP.firstName,
    lastName: repData.fullName?.split(" ").slice(1).join(" ") || repData.lastName || MOCK_REP.lastName,
    phone: repData.phone || repData.mobileNumber || MOCK_REP.phone,
    email: repData.email || MOCK_REP.email,
    employeeCode: repData.employeeCode || repData.employeeId || MOCK_REP.employeeCode,
    designation: repData.designation || MOCK_REP.designation,
    team: repData.team || MOCK_REP.team,
    territory: repData.territory || repData.salesTerritory || MOCK_REP.territory,
    status: repData.status || repData.employmentStatus || MOCK_REP.status,
    avatarUrl: repData.avatarUrl || MOCK_REP.avatarUrl,
    monthlyTarget: repData.monthlyTarget || MOCK_REP.monthlyTarget,
    monthlyAchievement: repData.achievement || repData.monthlyAchievement || MOCK_REP.monthlyAchievement,
    revenueThisMonth: repData.revenueGenerated || MOCK_REP.revenueThisMonth,
    gender: repData.gender || MOCK_REP.gender,
    addressLine1: repData.addressLine1 || MOCK_REP.addressLine1,
    addressLine2: repData.addressLine2 || MOCK_REP.addressLine2,
    city: repData.city || MOCK_REP.city,
    state: repData.state || MOCK_REP.state,
    country: repData.country || MOCK_REP.country,
    postalCode: repData.postalCode || MOCK_REP.postalCode,
  } : MOCK_REP;

  const TABS = ["Overview", "Customers", "Leads", "Orders", "Performance", "Documents", "Activity Log"];

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-base-200 animate-pulse">
        <div className="w-full lg:w-80 h-[600px] bg-base-100 rounded-xl shadow-sm border border-base-300"></div>
        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-base-100 rounded-xl shadow-sm border border-base-300"></div>
            ))}
          </div>
          <div className="flex-1 bg-base-100 rounded-xl shadow-sm border border-base-300 h-[400px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 font-sans flex flex-col">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 bg-base-100 border-b border-base-300 sticky top-0 z-20 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-base-content tracking-tight">Sales Representative Details</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Representatives</li>
              <li className="font-semibold text-primary">Details</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-outline btn-sm gap-1" onClick={() => navigate(`/sales/representatives/edit/${rep.id}`)}><MdEdit size={16} /> Edit</button>
          <button className="btn btn-outline btn-sm gap-1" onClick={() => (document.getElementById('modal_assign_customer') as HTMLDialogElement)?.showModal()}><MdPeople size={16} /> Customers</button>
          <button className="btn btn-outline btn-sm gap-1" onClick={() => (document.getElementById('modal_assign_lead') as HTMLDialogElement)?.showModal()}><MdOutlineAssignmentTurnedIn size={16} /> Leads</button>
          
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-outline btn-sm gap-1">More <MdMoreVert size={16} /></button>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 z-50 border border-base-200 mt-1">
              <li><a><MdPictureAsPdf size={16} /> Export PDF</a></li>
              <li><a><MdPrint size={16} /> Print Profile</a></li>
              <div className="divider my-1"></div>
              <li><a className="text-error"><MdDelete size={16} /> Delete Rep</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-col lg:flex-row gap-6 p-6 flex-1">
        
        {/* ── Left Sidebar (Profile Summary) ── */}
        <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-6">
          
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6 flex flex-col items-center text-center">
            <div className="avatar mb-4">
              <div className="w-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={rep.avatarUrl} alt="Avatar" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-base-content">{rep.firstName} {rep.lastName}</h2>
            <p className="text-sm font-mono text-base-content/60 mt-1 font-bold">{rep.employeeCode}</p>
            
            <div className="flex gap-2 mt-3">
              <div className="badge badge-primary badge-outline font-medium">{rep.designation}</div>
              <div className={`badge ${rep.status === 'Active' ? 'badge-success text-white' : 'badge-warning'} font-medium`}>{rep.status}</div>
            </div>

            <div className="divider w-full my-4"></div>

            <div className="w-full space-y-3 text-sm text-left">
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1"><MdPeople size={16}/> Team</span> <span className="font-medium">{rep.team}</span></div>
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1"><MdBusinessCenter size={16}/> Territory</span> <span className="font-medium">{rep.territory}</span></div>
              <div className="flex justify-between items-center"><span className="text-base-content/60">Joined</span> <span className="font-medium">{rep.joiningDate}</span></div>
              <div className="flex justify-between items-center"><span className="text-base-content/60">Manager</span> <span className="font-medium">{rep.reportingManager}</span></div>
            </div>

            <div className="divider w-full my-4"></div>

            <div className="w-full space-y-3 text-sm text-left">
              <div className="flex items-center gap-3"><MdPhone size={18} className="text-base-content/40" /> <span className="font-medium">{rep.phone}</span></div>
              <div className="flex items-center gap-3"><MdEmail size={18} className="text-base-content/40" /> <span className="font-medium break-all">{rep.email}</span></div>
            </div>
          </div>

          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-5">
            <h3 className="font-bold mb-4 text-base-content border-b border-base-200 pb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn btn-sm btn-outline justify-start text-xs font-medium h-10 px-2" onClick={() => navigate("/sales/orders/new")}>Create Order</button>
              <button className="btn btn-sm btn-outline justify-start text-xs font-medium h-10 px-2" onClick={() => navigate("/sales/leads/new")}>Create Lead</button>
              <button className="btn btn-sm btn-outline justify-start text-xs font-medium h-10 px-2" onClick={() => navigate("/sales/accounts/new")}>Add Customer</button>
              <button className="btn btn-sm btn-outline justify-start text-xs font-medium h-10 px-2" onClick={() => (document.getElementById('modal_assign_customer') as HTMLDialogElement)?.showModal()}>Assign Customer</button>
              <button className="btn btn-sm btn-outline justify-start text-xs font-medium h-10 px-2" onClick={() => (document.getElementById('modal_assign_lead') as HTMLDialogElement)?.showModal()}>Assign Lead</button>
              <button className="btn btn-sm btn-outline justify-start text-xs font-medium h-10 px-2" onClick={() => (document.getElementById('modal_update_target') as HTMLDialogElement)?.showModal()}>Update Target</button>
            </div>
          </div>

        </div>

        {/* ── Right Content ── */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Monthly Target" value={`₹${rep.monthlyTarget.toLocaleString()}`} />
            <StatCard title="Monthly Achievement" value={`₹${rep.monthlyAchievement.toLocaleString()}`} />
            <StatCard title="Target Completion" value={`${((rep.monthlyAchievement/rep.monthlyTarget)*100).toFixed(1)}%`} progress={true} progressValue={(rep.monthlyAchievement/rep.monthlyTarget)*100} />
            <StatCard title="Orders This Month" value={rep.ordersThisMonth} />
            <StatCard title="Total Customers" value={rep.totalCustomers} />
            <StatCard title="Total Leads" value={rep.totalLeads} />
            <StatCard title="Conversion Rate" value={`${rep.conversionRate}%`} />
            <StatCard title="Revenue This Month" value={`₹${rep.revenueThisMonth.toLocaleString()}`} />
          </div>

          {/* Tabs Section */}
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 flex-1 flex flex-col overflow-hidden min-h-[500px]">
            <div className="tabs tabs-bordered pt-2 px-4 border-b border-base-200 overflow-x-auto flex-nowrap whitespace-nowrap">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`tab tab-bordered h-12 font-medium ${activeTab === tab ? "tab-active text-primary border-primary" : "text-base-content/60"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-base-100">
              
              {/* TAB: OVERVIEW */}
              {activeTab === "Overview" && (
                <div className="space-y-8 animate-fade-in">
                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-4 text-primary">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Full Name" value={`${rep.firstName} ${rep.lastName}`} />
                      <InfoItem label="Employee Code" value={rep.employeeCode} />
                      <InfoItem label="Gender" value={rep.gender} />
                      <InfoItem label="Date Of Birth" value={rep.dob} />
                      <InfoItem label="Joining Date" value={rep.joiningDate} />
                    </div>
                  </section>
                  
                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-4 text-primary">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Mobile Number" value={rep.phone} />
                      <InfoItem label="Alternate Mobile" value={rep.alternatePhone} />
                      <InfoItem label="Email" value={rep.email} />
                      <InfoItem label="Alternate Email" value={rep.alternateEmail} />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-4 text-primary">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Address Line 1" value={rep.addressLine1} />
                      <InfoItem label="Address Line 2" value={rep.addressLine2} />
                      <InfoItem label="City" value={rep.city} />
                      <InfoItem label="State" value={rep.state} />
                      <InfoItem label="Country" value={rep.country} />
                      <InfoItem label="Postal Code" value={rep.postalCode} />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-4 text-primary">Employment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Designation" value={rep.designation} />
                      <InfoItem label="Team" value={rep.team} />
                      <InfoItem label="Territory" value={rep.territory} />
                      <InfoItem label="Employment Type" value={rep.employmentType} />
                      <InfoItem label="Status" value={
                        <span className={`badge badge-sm ${rep.status === 'Active' ? 'badge-success text-white' : 'badge-ghost'}`}>{rep.status}</span>
                      } />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-4 text-primary">Banking Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Bank Name" value={rep.bankName} />
                      <InfoItem label="Account Holder" value={rep.accountHolderName} />
                      <InfoItem label="Account Number" value={<span className="font-mono">{rep.accountNumber}</span>} />
                      <InfoItem label="IFSC Code" value={<span className="font-mono">{rep.ifscCode}</span>} />
                      <InfoItem label="UPI ID" value={rep.upiId} />
                    </div>
                  </section>
                </div>
              )}

              {/* TAB: CUSTOMERS */}
              {activeTab === "Customers" && (
                <div className="animate-fade-in overflow-x-auto border border-base-200 rounded-lg">
                  <table className="table table-sm w-full">
                    <thead className="bg-base-200/50">
                      <tr>
                        <th>Customer Name</th>
                        <th>Company</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Territory</th>
                        <th className="text-right">Total Revenue</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_CUSTOMERS.length > 0 ? MOCK_CUSTOMERS.map(c => (
                        <tr key={c.id} className="hover:bg-base-200/20">
                          <td className="font-semibold">{c.name}</td>
                          <td>{c.company}</td>
                          <td>{c.phone}</td>
                          <td>{c.email}</td>
                          <td>{c.territory}</td>
                          <td className="text-right font-medium text-success">₹{c.revenue.toLocaleString()}</td>
                          <td><span className={`badge badge-sm ${c.status === 'Active' ? 'badge-success text-white' : 'badge-ghost'}`}>{c.status}</span></td>
                          <td className="text-right">
                            <button className="btn btn-ghost btn-xs text-primary">View</button>
                            <button className="btn btn-ghost btn-xs text-error">Remove</button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={8} className="text-center py-10 text-base-content/40">No Customers Assigned</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB: LEADS */}
              {activeTab === "Leads" && (
                <div className="animate-fade-in overflow-x-auto border border-base-200 rounded-lg">
                  <table className="table table-sm w-full">
                    <thead className="bg-base-200/50">
                      <tr>
                        <th>Lead Name</th>
                        <th>Company</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th className="text-right">Expected Value</th>
                        <th>Created Date</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_LEADS.length > 0 ? MOCK_LEADS.map(l => (
                        <tr key={l.id} className="hover:bg-base-200/20">
                          <td className="font-semibold">{l.name}</td>
                          <td>{l.company}</td>
                          <td>{l.source}</td>
                          <td><span className="badge badge-sm badge-info">{l.status}</span></td>
                          <td className="text-right font-medium">₹{l.expectedValue.toLocaleString()}</td>
                          <td>{l.date}</td>
                          <td className="text-right">
                            <button className="btn btn-ghost btn-xs text-primary">View</button>
                            <button className="btn btn-ghost btn-xs">Reassign</button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={7} className="text-center py-10 text-base-content/40">No Leads Assigned</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB: ORDERS */}
              {activeTab === "Orders" && (
                <div className="animate-fade-in overflow-x-auto border border-base-200 rounded-lg">
                  <table className="table table-sm w-full">
                    <thead className="bg-base-200/50">
                      <tr>
                        <th>Order Number</th>
                        <th>Customer</th>
                        <th>Order Date</th>
                        <th className="text-right">Amount</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ORDERS.length > 0 ? MOCK_ORDERS.map(o => (
                        <tr key={o.id} className="hover:bg-base-200/20">
                          <td className="font-mono font-bold text-primary">{o.orderNo}</td>
                          <td className="font-semibold">{o.customer}</td>
                          <td>{o.date}</td>
                          <td className="text-right font-bold text-success">₹{o.amount.toLocaleString()}</td>
                          <td><span className={`badge badge-sm ${o.status === 'Delivered' ? 'badge-success text-white' : 'badge-warning'}`}>{o.status}</span></td>
                          <td className="text-right">
                            <button className="btn btn-ghost btn-xs text-primary">View</button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} className="text-center py-10 text-base-content/40">No Orders Available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB: PERFORMANCE */}
              {activeTab === "Performance" && (
                <div className="animate-fade-in space-y-8">
                  {/* Metrics Section */}
                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-4 text-primary">Sales Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard title="Total Revenue" value={`₹${rep.totalRevenue.toLocaleString()}`} />
                      <StatCard title="Total Orders" value={rep.totalOrders} />
                      <StatCard title="Avg Order Value" value={`₹${rep.averageOrderValue.toLocaleString()}`} />
                      <StatCard title="Closed Deals" value={rep.closedDeals} />
                      <StatCard title="Open Leads" value={rep.openLeads} />
                      <StatCard title="Lost Leads" value={rep.lostLeads} />
                      <StatCard title="Customer Retention" value={`${rep.customerRetention}%`} />
                      <StatCard title="Lead Conversion" value={`${rep.conversionRate}%`} />
                    </div>
                  </section>

                  {/* Charts */}
                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-4 text-primary">Target Achievement Trend</h3>
                    <div className="bg-base-200/30 p-4 rounded-xl border border-base-200 h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_MONTHLY_PERFORMANCE} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--b3))" />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} />
                          <YAxis tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} />
                          <Tooltip contentStyle={{ background: "oklch(var(--b1))", border: "1px solid oklch(var(--b3))", borderRadius: "8px", fontSize: "12px" }} />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                          <Line type="monotone" dataKey="target" stroke="#a855f7" strokeWidth={2} name="Target" />
                          <Line type="monotone" dataKey="achieved" stroke="#22c55e" strokeWidth={2} name="Achieved" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </div>
              )}

              {/* TAB: DOCUMENTS */}
              {activeTab === "Documents" && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-primary">Uploaded Documents</h3>
                    <button className="btn btn-sm btn-primary gap-1"><MdAdd /> Upload Document</button>
                  </div>
                  {MOCK_DOCS.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {MOCK_DOCS.map(d => (
                        <div key={d.id} className="border border-base-300 rounded-xl p-4 flex items-center justify-between bg-base-200/20 hover:border-primary transition-colors">
                          <div className="flex items-center gap-3">
                            <MdPictureAsPdf size={32} className="text-error" />
                            <div>
                              <p className="font-semibold text-sm truncate max-w-[150px]" title={d.name}>{d.name}</p>
                              <p className="text-xs text-base-content/50">{d.size} • {d.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button className="btn btn-ghost btn-square btn-sm"><MdCloudDownload size={18} /></button>
                            <button className="btn btn-ghost btn-square btn-sm text-error"><MdDelete size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-base-content/40 border-2 border-dashed border-base-300 rounded-xl">No Documents Uploaded</div>
                  )}
                </div>
              )}

              {/* TAB: ACTIVITY LOG */}
              {activeTab === "Activity Log" && (
                <div className="animate-fade-in max-w-3xl mx-auto">
                  <ul className="timeline timeline-vertical timeline-compact">
                    {MOCK_ACTIVITY.map((a, idx) => (
                      <li key={a.id}>
                        {idx !== 0 && <hr className="bg-base-300" />}
                        <div className="timeline-middle text-primary">
                          <MdCheckCircle size={18} />
                        </div>
                        <div className="timeline-end timeline-box border-none shadow-none bg-transparent py-2">
                          <p className="font-medium text-sm text-base-content">{a.action}</p>
                          <p className="text-xs text-base-content/50 mt-0.5">{a.user} - {a.time}</p>
                        </div>
                        {idx !== MOCK_ACTIVITY.length - 1 && <hr className="bg-base-300" />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      
      {/* Assign Customer Modal */}
      <dialog id="modal_assign_customer" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg border-b pb-2 mb-4">Assign Customers</h3>
          <input type="text" className="input input-bordered w-full input-sm mb-4" placeholder="Search customers..." />
          <div className="h-48 bg-base-200/50 rounded-lg flex items-center justify-center text-sm text-base-content/50 border border-base-300 overflow-y-auto p-4">
            <div className="w-full h-full flex flex-col gap-2">
               <label className="cursor-pointer label justify-start gap-3 bg-base-100 p-2 rounded-md border border-base-200">
                 <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                 <span className="label-text font-medium">Stark Industries</span>
               </label>
               <label className="cursor-pointer label justify-start gap-3 bg-base-100 p-2 rounded-md border border-base-200">
                 <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                 <span className="label-text font-medium">Wayne Enterprises</span>
               </label>
            </div>
          </div>
          <div className="modal-action mt-6">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Assign Selected</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Assign Lead Modal */}
      <dialog id="modal_assign_lead" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg border-b pb-2 mb-4">Assign Leads</h3>
          <input type="text" className="input input-bordered w-full input-sm mb-4" placeholder="Search open leads..." />
          <div className="h-48 bg-base-200/50 rounded-lg flex items-center justify-center text-sm text-base-content/50 border border-base-300 overflow-y-auto p-4">
             <div className="w-full h-full flex flex-col gap-2">
               <label className="cursor-pointer label justify-start gap-3 bg-base-100 p-2 rounded-md border border-base-200">
                 <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                 <span className="label-text font-medium">ERP Upgrade Proposal</span>
               </label>
            </div>
          </div>
          <div className="modal-action mt-6">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Assign Selected</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Update Target Modal */}
      <dialog id="modal_update_target" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg border-b pb-2 mb-4">Update Monthly Target</h3>
          <div className="form-control mb-4">
            <label className="label"><span className="label-text font-medium">New Target Amount (₹)</span></label>
            <input type="number" className="input input-bordered w-full" defaultValue={rep.monthlyTarget} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Reason for Update</span></label>
            <textarea className="textarea textarea-bordered w-full" rows={2} placeholder="Optional notes..."></textarea>
          </div>
          <div className="modal-action mt-6">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Save Target</button>
            </form>
          </div>
        </div>
      </dialog>

    </div>
  );
}