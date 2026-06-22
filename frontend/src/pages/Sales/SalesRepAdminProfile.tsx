import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSalesRepById } from "@/services/salesRepServices";
import { useAuth } from "@/auth/AuthContext";
import {
  MdEdit,
  MdPeople,
  MdOutlineAssignmentTurnedIn,
  MdBarChart,
  MdBlock,
  MdEmail,
  MdPhone,
  MdBusinessCenter,
  MdLocationOn,
  MdLockReset,
  MdFileDownload,
  MdDelete,
  MdCheckCircle,
  MdWarning,
  MdArrowBack,
  MdVisibility,
  MdLogin,
} from "react-icons/md";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

/* ─────────────────────────── Mock Data & Types ─────────────────────────── */
const MOCK_ADMIN_REP = {
  id: "REP-2026-00001",
  firstName: "V Vinay",
  lastName: "Kumar",
  employeeCode: "REP-2026-00001",
  designation: "Sales Executive",
  department: "Sales",
  team: "Retail Sales Team",
  territory: "Central Zone",
  status: "Active",
  joiningDate: "2024-01-15",
  reportingManager: "Sarah Connor",
  phone: "+91 8319145613",
  alternatePhone: "+91 9876543210",
  email: "vvinaykumar3000@gmail.com",
  alternateEmail: "vinay.personal@example.com",
  gender: "Male",
  addressLine1: "A15 Shivam Complex",
  addressLine2: "Koni",
  city: "Bilaspur",
  state: "Chhattisgarh",
  country: "India",
  postalCode: "495001",
  employmentType: "Full-Time",
  bankName: "HDFC Bank",
  accountHolderName: "V Vinay Kumar",
  accountNumber: "XXXXXXXX3004",
  ifscCode: "HDFC0001234",
  upiId: "vinay@hdfc",
  avatarUrl: "https://i.pravatar.cc/150?u=vinayadmin",

  monthlyTarget: 150000,
  monthlyAchievement: 125000,
  conversionRate: 28.5,
  totalCustomers: 45,
  activeLeads: 24,
  ordersThisMonth: 18,
  revenueGenerated: 125000,
  commissionEarned: 6250,

  loginEnabled: true,
  username: "vinay.kumar",
  userRole: "Sales Executive",
  lastLogin: "2026-06-02 09:14 AM",
  loginStatus: "Online",
  permissions: ["View Customers", "Create Customers", "Edit Customers", "View Orders", "Create Orders", "View Own Reports"],
};

const MOCK_CUSTOMERS = [
  { id: "CUST-001", name: "Alice Johnson", type: "Corporate", city: "Bangalore", contactPerson: "Alice", phone: "+91 9876543210", revenue: 45000, status: "Active" },
  { id: "CUST-002", name: "Acme Corp", type: "Enterprise", city: "Mumbai", contactPerson: "Bob Smith", phone: "+91 8765432109", revenue: 120000, status: "Active" },
  { id: "CUST-003", name: "Zager Digital", type: "SME", city: "Delhi", contactPerson: "Charlie", phone: "+91 7654321098", revenue: 15000, status: "Inactive" },
];

const MOCK_LEADS = [
  { id: "L-101", name: "ERP Implementation", company: "TechFlow", contact: "David", source: "Website", stage: "Proposal Sent", value: 25000, status: "Hot" },
  { id: "L-102", name: "Cloud Migration", company: "InnoSoft", contact: "Eve", source: "Referral", stage: "Qualified", value: 18000, status: "Warm" },
];

const MOCK_ORDERS = [
  { id: "ORD-501", orderNo: "SO-2026-0101", customer: "Acme Corp", orderDate: "2026-05-15", deliveryDate: "2026-05-20", value: 35000, status: "Delivered" },
  { id: "ORD-502", orderNo: "SO-2026-0105", customer: "Alice Johnson", orderDate: "2026-05-28", deliveryDate: "2026-06-05", value: 12000, status: "Processing" },
];

const MOCK_PERFORMANCE_DATA = [
  { month: "Jan", target: 100000, achieved: 105000, leads: 40, won: 12 },
  { month: "Feb", target: 100000, achieved: 95000, leads: 45, won: 10 },
  { month: "Mar", target: 120000, achieved: 125000, leads: 50, won: 15 },
  { month: "Apr", target: 120000, achieved: 110000, leads: 42, won: 11 },
  { month: "May", target: 150000, achieved: 125000, leads: 60, won: 18 },
];

const MOCK_DOCS = [
  { id: "D1", name: "Aadhaar_Card_Vinay.pdf", date: "2024-01-10", size: "1.4 MB", type: "Aadhaar Card" },
  { id: "D2", name: "PAN_Card.pdf", date: "2024-01-10", size: "800 KB", type: "PAN Card" },
  { id: "D3", name: "Offer_Letter_Signed.pdf", date: "2024-01-12", size: "2.1 MB", type: "Offer Letter" },
];

const MOCK_TIMELINE = [
  { id: "T1", action: "Logged into ERP System", time: "Today, 09:14 AM", icon: <MdLogin /> },
  { id: "T2", action: "Target Updated to ₹150,000", time: "2026-05-01 10:00 AM", icon: <MdEdit /> },
  { id: "T3", action: "Order SO-2026-0105 Created", time: "2026-05-28 03:45 PM", icon: <MdOutlineAssignmentTurnedIn /> },
  { id: "T4", action: "Customer Acme Corp Assigned", time: "2026-02-15 11:20 AM", icon: <MdPeople /> },
  { id: "T5", action: "Profile Created by Admin", time: "2024-01-10 09:00 AM", icon: <MdCheckCircle /> },
];

/* ─────────────────────────── Sub-Components ─────────────────────────── */
const StatCard = ({ title, value, subtitle, alert }: { title: string; value: string | number; subtitle?: string; alert?: boolean }) => (
  <div className={`bg-base-100 p-5 rounded-xl border ${alert ? 'border-error shadow-error/20' : 'border-base-300'} shadow-sm flex flex-col justify-center`}>
    <span className="text-xs text-base-content/60 uppercase font-bold tracking-wider">{title}</span>
    <span className={`text-2xl font-bold mt-1 truncate ${alert ? 'text-error' : 'text-base-content'}`}>{value}</span>
    {subtitle && <span className="text-xs text-base-content/50 mt-1 font-medium">{subtitle}</span>}
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div>
    <p className="text-xs text-base-content/50 font-bold mb-1 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-base-content">{value || "—"}</p>
  </div>
);

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function SalesRepAdminProfile() {
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
    ...MOCK_ADMIN_REP,
    ...repData,
    id: repData.id || repData._id || MOCK_ADMIN_REP.id,
    firstName: repData.fullName?.split(" ")[0] || repData.firstName || MOCK_ADMIN_REP.firstName,
    lastName: repData.fullName?.split(" ").slice(1).join(" ") || repData.lastName || MOCK_ADMIN_REP.lastName,
    phone: repData.phone || repData.mobileNumber || MOCK_ADMIN_REP.phone,
    email: repData.email || MOCK_ADMIN_REP.email,
    employeeCode: repData.employeeCode || repData.employeeId || MOCK_ADMIN_REP.employeeCode,
    designation: repData.designation || MOCK_ADMIN_REP.designation,
    team: repData.team || MOCK_ADMIN_REP.team,
    territory: repData.territory || repData.salesTerritory || MOCK_ADMIN_REP.territory,
    status: repData.status || repData.employmentStatus || MOCK_ADMIN_REP.status,
    avatarUrl: repData.avatarUrl || MOCK_ADMIN_REP.avatarUrl,
    monthlyTarget: repData.monthlyTarget || MOCK_ADMIN_REP.monthlyTarget,
    monthlyAchievement: repData.achievement || repData.monthlyAchievement || MOCK_ADMIN_REP.monthlyAchievement,
    revenueGenerated: repData.revenueGenerated || MOCK_ADMIN_REP.revenueGenerated,
    gender: repData.gender || MOCK_ADMIN_REP.gender,
    addressLine1: repData.addressLine1 || MOCK_ADMIN_REP.addressLine1,
    addressLine2: repData.addressLine2 || MOCK_ADMIN_REP.addressLine2,
    city: repData.city || MOCK_ADMIN_REP.city,
    state: repData.state || MOCK_ADMIN_REP.state,
    country: repData.country || MOCK_ADMIN_REP.country,
    postalCode: repData.postalCode || MOCK_ADMIN_REP.postalCode,
  } : MOCK_ADMIN_REP;

  const TABS = ["Overview", "Customers", "Leads", "Orders", "Performance", "Documents", "Activity Timeline", "Login & Access"];

  // Mock Pagination state for Customers
  const [custPage, setCustPage] = useState(1);

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-base-200 animate-pulse">
        <div className="w-full lg:w-[320px] h-[600px] bg-base-100 rounded-xl shadow-sm border border-base-300"></div>
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
    <div className="min-h-screen bg-base-200 font-sans flex flex-col pb-10">
      
      {/* ── Page Header ── */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:bg-base-200">
              <MdArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-base-content tracking-tight">{rep.firstName} {rep.lastName}</h1>
              <div className="text-xs text-base-content/60 breadcrumbs mt-0.5 font-medium">
                <ul>
                  <li>Dashboard</li>
                  <li>Sales</li>
                  <li><a onClick={() => navigate("/sales/representatives")}>Representatives</a></li>
                  <li className="text-primary">Representative Details</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-outline btn-sm gap-2 bg-base-100" onClick={() => navigate(`/sales/representatives/edit/${rep.id}`)}><MdEdit size={16} /> Edit Profile</button>
            <button className="btn btn-outline btn-sm gap-2 bg-base-100" onClick={() => (document.getElementById('modal_assign_customer') as HTMLDialogElement)?.showModal()}><MdPeople size={16} /> Assign Customers</button>
            <button className="btn btn-outline btn-sm gap-2 bg-base-100" onClick={() => (document.getElementById('modal_assign_lead') as HTMLDialogElement)?.showModal()}><MdOutlineAssignmentTurnedIn size={16} /> Assign Leads</button>
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-primary btn-sm gap-2">Actions <MdVisibility size={16} /></button>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 z-50 border border-base-200 mt-1">
                <li><a onClick={() => setActiveTab("Performance")}><MdBarChart size={18} /> View Performance</a></li>
                <li><a onClick={() => (document.getElementById('modal_reset_pwd') as HTMLDialogElement)?.showModal()}><MdLockReset size={18} /> Reset Password</a></li>
                <div className="divider my-1"></div>
                <li><a className="text-error" onClick={() => (document.getElementById('modal_disable') as HTMLDialogElement)?.showModal()}><MdBlock size={18} /> Disable Representative</a></li>
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
            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
            
            <div className="avatar mb-3 mt-4 relative z-10">
              <div className="w-24 h-24 rounded-full ring-4 ring-base-100 shadow-md">
                <img src={rep.avatarUrl} alt="Avatar" />
              </div>
              <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-base-100 ${rep.loginStatus === 'Online' ? 'bg-success' : 'bg-base-300'}`} title={rep.loginStatus}></span>
            </div>
            
            <h2 className="text-xl font-bold text-base-content">{rep.firstName} {rep.lastName}</h2>
            <p className="text-sm font-mono text-primary font-bold mt-0.5">{rep.employeeCode}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <div className="badge badge-ghost font-semibold">{rep.designation}</div>
              <div className={`badge ${rep.status === 'Active' ? 'badge-success text-white' : 'badge-error text-white'} font-bold`}>{rep.status}</div>
            </div>

            <div className="divider w-full my-4"></div>

            <div className="w-full space-y-3 text-sm text-left">
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1.5"><MdBusinessCenter size={16}/> Department</span> <span className="font-semibold">{rep.department}</span></div>
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1.5"><MdPeople size={16}/> Team</span> <span className="font-semibold">{rep.team}</span></div>
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1.5"><MdLocationOn size={16}/> Territory</span> <span className="font-semibold">{rep.territory}</span></div>
            </div>
          </div>

          {/* Quick Contact & Sticky Info */}
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-5 sticky top-24">
            <h3 className="font-bold text-base text-base-content mb-4 flex items-center gap-2"><MdPhone /> Contact Info</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-base-content/50 font-bold uppercase mb-1">Mobile</p>
                <p className="font-medium">{rep.phone}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/50 font-bold uppercase mb-1">Email</p>
                <p className="font-medium break-all">{rep.email}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/50 font-bold uppercase mb-1">Reporting Manager</p>
                <p className="font-medium flex items-center gap-2">
                  <div className="avatar placeholder"><div className="bg-neutral text-neutral-content rounded-full w-5"><span className="text-[10px]">{rep.reportingManager.charAt(0)}</span></div></div>
                  {rep.reportingManager}
                </p>
              </div>
            </div>
            
            <div className="divider my-4"></div>
            
            <button onClick={() => (document.getElementById('modal_update_target') as HTMLDialogElement)?.showModal()} className="btn btn-primary btn-outline btn-sm w-full gap-2">
              <MdEdit /> Update Targets
            </button>
          </div>

        </div>

        {/* ── Right Content Area ── */}
        <div className="flex-1 flex flex-col min-w-0 gap-6">
          
          {/* Notifications / Alerts Section */}
          <div className="flex flex-col gap-2">
            {rep.monthlyAchievement < rep.monthlyTarget && (
              <div className="alert alert-warning shadow-sm py-2 rounded-xl border border-warning/30">
                <MdWarning size={20} />
                <span className="text-sm font-medium">Target Not Achieved: Current achievement is {((rep.monthlyAchievement/rep.monthlyTarget)*100).toFixed(1)}% of the monthly goal.</span>
              </div>
            )}
            {rep.activeLeads > 20 && (
              <div className="alert alert-info bg-info/10 text-info shadow-sm py-2 rounded-xl border border-info/30">
                <MdWarning size={20} />
                <span className="text-sm font-medium">High Lead Volume: Representative currently has {rep.activeLeads} active leads pending follow-up.</span>
              </div>
            )}
          </div>

          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Monthly Target" value={`₹${rep.monthlyTarget.toLocaleString()}`} />
            <StatCard title="Monthly Achievement" value={`₹${rep.monthlyAchievement.toLocaleString()}`} alert={rep.monthlyAchievement < rep.monthlyTarget} subtitle={`${((rep.monthlyAchievement/rep.monthlyTarget)*100).toFixed(1)}% Completed`} />
            <StatCard title="Conversion Rate" value={`${rep.conversionRate}%`} />
            <StatCard title="Commission Earned" value={`₹${rep.commissionEarned.toLocaleString()}`} />
            <StatCard title="Total Customers" value={rep.totalCustomers} />
            <StatCard title="Active Leads" value={rep.activeLeads} />
            <StatCard title="Orders This Month" value={rep.ordersThisMonth} />
            <StatCard title="Revenue Generated" value={`₹${rep.revenueGenerated.toLocaleString()}`} />
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
                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdPeople /> Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Full Name" value={`${rep.firstName} ${rep.lastName}`} />
                      <InfoItem label="Employee Code" value={<span className="font-mono bg-base-200 px-2 py-0.5 rounded">{rep.employeeCode}</span>} />
                      <InfoItem label="Gender" value={rep.gender} />
                      <InfoItem label="Mobile Number" value={rep.phone} />
                      <InfoItem label="Alternate Mobile" value={rep.alternatePhone} />
                      <InfoItem label="Email" value={rep.email} />
                      <InfoItem label="Alternate Email" value={rep.alternateEmail} />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdLocationOn /> Address Information</h3>
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
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdBusinessCenter /> Employment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Joining Date" value={rep.joiningDate} />
                      <InfoItem label="Employment Type" value={rep.employmentType} />
                      <InfoItem label="Team" value={rep.team} />
                      <InfoItem label="Territory" value={rep.territory} />
                      <InfoItem label="Reporting Manager" value={rep.reportingManager} />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdOutlineAssignmentTurnedIn /> Banking Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Bank Name" value={rep.bankName} />
                      <InfoItem label="Account Holder Name" value={rep.accountHolderName} />
                      <InfoItem label="Account Number" value={<span className="font-mono text-base-content/80">{rep.accountNumber}</span>} />
                      <InfoItem label="IFSC Code" value={<span className="font-mono text-base-content/80">{rep.ifscCode}</span>} />
                      <InfoItem label="UPI ID" value={rep.upiId} />
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 2: CUSTOMERS */}
              {activeTab === "Customers" && (
                <div className="animate-fade-in flex flex-col h-full gap-4">
                  <div className="flex justify-between items-center">
                    <input type="text" placeholder="Search assigned customers..." className="input input-sm input-bordered w-72" />
                    <button className="btn btn-sm btn-primary gap-2" onClick={() => (document.getElementById('modal_assign_customer') as HTMLDialogElement)?.showModal()}><MdAdd /> Assign Customer</button>
                  </div>
                  <div className="overflow-x-auto border border-base-200 rounded-lg">
                    <table className="table table-sm w-full">
                      <thead className="bg-base-200 text-base-content/70">
                        <tr>
                          <th>Customer Name</th>
                          <th>Customer Type</th>
                          <th>City</th>
                          <th>Contact Person</th>
                          <th>Phone</th>
                          <th className="text-right">Revenue Generated</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_CUSTOMERS.map(c => (
                          <tr key={c.id} className="hover:bg-base-200/50 transition-colors">
                            <td className="font-bold text-primary">{c.name}</td>
                            <td>{c.type}</td>
                            <td>{c.city}</td>
                            <td>{c.contactPerson}</td>
                            <td className="font-mono">{c.phone}</td>
                            <td className="text-right font-bold text-success">₹{c.revenue.toLocaleString()}</td>
                            <td><span className={`badge badge-sm ${c.status === 'Active' ? 'badge-success text-white' : 'badge-ghost'}`}>{c.status}</span></td>
                            <td className="text-right">
                              <button className="btn btn-ghost btn-xs">View</button>
                              <button className="btn btn-ghost btn-xs text-error">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex justify-between items-center text-sm text-base-content/60 mt-auto pt-4">
                    <span>Showing 1 to {MOCK_CUSTOMERS.length} of 45 Customers</span>
                    <div className="join">
                      <button className="join-item btn btn-sm" disabled>«</button>
                      <button className="join-item btn btn-sm bg-base-200">Page {custPage}</button>
                      <button className="join-item btn btn-sm">»</button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LEADS */}
              {activeTab === "Leads" && (
                <div className="animate-fade-in flex flex-col h-full gap-4">
                  <div className="flex justify-between items-center">
                    <input type="text" placeholder="Search assigned leads..." className="input input-sm input-bordered w-72" />
                    <button className="btn btn-sm btn-primary gap-2" onClick={() => (document.getElementById('modal_assign_lead') as HTMLDialogElement)?.showModal()}><MdAdd /> Assign Lead</button>
                  </div>
                  <div className="overflow-x-auto border border-base-200 rounded-lg">
                    <table className="table table-sm w-full">
                      <thead className="bg-base-200 text-base-content/70">
                        <tr>
                          <th>Lead Name</th>
                          <th>Company</th>
                          <th>Contact Person</th>
                          <th>Lead Source</th>
                          <th>Stage</th>
                          <th className="text-right">Estimated Value</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_LEADS.map(l => (
                          <tr key={l.id} className="hover:bg-base-200/50 transition-colors">
                            <td className="font-bold text-primary">{l.name}</td>
                            <td>{l.company}</td>
                            <td>{l.contact}</td>
                            <td>{l.source}</td>
                            <td><span className="badge badge-sm badge-info badge-outline font-semibold">{l.stage}</span></td>
                            <td className="text-right font-bold">₹{l.value.toLocaleString()}</td>
                            <td><span className={`badge badge-sm ${l.status === 'Hot' ? 'badge-error text-white' : 'badge-warning'}`}>{l.status}</span></td>
                            <td className="text-right">
                              <button className="btn btn-ghost btn-xs">View</button>
                              <button className="btn btn-ghost btn-xs text-secondary">Reassign</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: ORDERS */}
              {activeTab === "Orders" && (
                <div className="animate-fade-in flex flex-col h-full gap-4">
                  <div className="flex justify-between items-center bg-success/10 p-4 rounded-xl border border-success/20">
                    <div>
                      <p className="text-sm font-bold text-success/80 uppercase tracking-wide">Total Order Value Processed</p>
                      <p className="text-3xl font-black text-success mt-1">₹47,000.00</p>
                    </div>
                    <div className="text-right text-sm font-semibold text-base-content/60">
                      <p>Total Orders: {rep.totalOrders}</p>
                      <p>Avg Order Value: ₹{rep.revenueGenerated / rep.totalOrders | 0}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto border border-base-200 rounded-lg mt-2">
                    <table className="table table-sm w-full">
                      <thead className="bg-base-200 text-base-content/70">
                        <tr>
                          <th>Order Number</th>
                          <th>Customer</th>
                          <th>Order Date</th>
                          <th>Delivery Date</th>
                          <th className="text-right">Order Value</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_ORDERS.map(o => (
                          <tr key={o.id} className="hover:bg-base-200/50 transition-colors">
                            <td className="font-mono font-bold text-primary">{o.orderNo}</td>
                            <td className="font-semibold">{o.customer}</td>
                            <td>{o.orderDate}</td>
                            <td className={o.deliveryDate < "2026-06-01" ? "text-error font-bold" : ""}>{o.deliveryDate}</td>
                            <td className="text-right font-bold text-success">₹{o.value.toLocaleString()}</td>
                            <td><span className={`badge badge-sm ${o.status === 'Delivered' ? 'badge-success text-white' : 'badge-warning'}`}>{o.status}</span></td>
                            <td className="text-right">
                              <button className="btn btn-ghost btn-xs text-primary">View</button>
                              <button className="btn btn-ghost btn-xs"><MdFileDownload size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: PERFORMANCE */}
              {activeTab === "Performance" && (
                <div className="animate-fade-in space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard title="YTD Revenue" value="₹425,000" />
                    <StatCard title="YTD Orders" value="65" />
                    <StatCard title="YTD Leads" value="210" />
                    <StatCard title="Avg Conv. Rate" value="28.5%" />
                    <StatCard title="Avg Order Value" value="₹6,538" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Target vs Achievement Comparison */}
                    <div className="bg-base-100 border border-base-200 p-5 rounded-xl shadow-sm">
                      <h3 className="font-bold text-base-content mb-4 text-sm uppercase tracking-wider">Target vs Achievement (Last 5 Months)</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={MOCK_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--b3))" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                            <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} iconType="circle" />
                            <Bar dataKey="target" fill="#9ca3af" name="Target" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="achieved" fill="#22c55e" name="Achieved" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Lead Conversion Trend */}
                    <div className="bg-base-100 border border-base-200 p-5 rounded-xl shadow-sm">
                      <h3 className="font-bold text-base-content mb-4 text-sm uppercase tracking-wider">Lead Conversion Funnel Trend</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={MOCK_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--b3))" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} iconType="circle" />
                            <Area type="monotone" dataKey="leads" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLeads)" name="Total Leads Assigned" strokeWidth={2} />
                            <Area type="monotone" dataKey="won" stroke="#a855f7" fillOpacity={1} fill="url(#colorWon)" name="Deals Won" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}

              {/* TAB 6: DOCUMENTS */}
              {activeTab === "Documents" && (
                <div className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOCK_DOCS.map(doc => (
                      <div key={doc.id} className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="card-body p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0 text-error">
                              <MdFileDownload size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm truncate" title={doc.name}>{doc.name}</h4>
                              <p className="text-xs text-base-content/50 mt-0.5">{doc.type}</p>
                              <p className="text-xs text-base-content/40 mt-1">{doc.size} • Uploaded: {doc.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 justify-end">
                            <button className="btn btn-xs btn-outline">Preview</button>
                            <button className="btn btn-xs btn-primary btn-outline">Download</button>
                            <button className="btn btn-xs btn-error btn-outline"><MdDelete size={14}/></button>
                          </div>
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
                          {item.icon}
                        </div>
                        <div className="timeline-end timeline-box border-none shadow-none bg-transparent py-3 ml-2">
                          <p className={`font-semibold text-sm ${idx === 0 ? 'text-primary' : 'text-base-content'}`}>{item.action}</p>
                          <p className="text-xs font-mono text-base-content/50 mt-1">{item.time}</p>
                        </div>
                        {idx !== MOCK_TIMELINE.length - 1 && <hr className="bg-base-300" />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TAB 8: LOGIN & ACCESS */}
              {activeTab === "Login & Access" && (
                <div className="animate-fade-in space-y-8 max-w-4xl">
                  <section className="bg-base-200/50 p-6 rounded-xl border border-base-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-base-content flex items-center gap-2"><MdLogin /> ERP Access Configuration</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">ERP Login Enabled</span>
                        <input type="checkbox" className="toggle toggle-success" checked={rep.loginEnabled} readOnly />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                      <div>
                        <p className="text-xs text-base-content/50 font-bold uppercase mb-1">Username</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-base-100 border border-base-300 px-3 py-1.5 rounded-lg text-sm flex-1">{rep.username}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 font-bold uppercase mb-1">User Role</p>
                        <select className="select select-sm select-bordered w-full" disabled>
                          <option selected>{rep.userRole}</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 font-bold uppercase mb-1">Last Login</p>
                        <p className="font-medium text-sm">{rep.lastLogin}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 font-bold uppercase mb-1">Current Login Status</p>
                        <p className="font-bold text-success text-sm">{rep.loginStatus}</p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <p className="text-xs text-base-content/50 font-bold uppercase mb-3">Effective Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {rep.permissions.map((p, i) => (
                          <span key={i} className="badge badge-primary badge-outline font-medium px-3 py-3 rounded-lg bg-base-100">{p}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="divider my-6"></div>
                    
                    <div className="flex gap-3">
                      <button className="btn btn-sm btn-outline gap-2" onClick={() => (document.getElementById('modal_reset_pwd') as HTMLDialogElement)?.showModal()}><MdLockReset /> Reset Password</button>
                      <button className="btn btn-sm btn-error btn-outline gap-2" onClick={() => (document.getElementById('modal_disable') as HTMLDialogElement)?.showModal()}><MdBlock /> Suspend Access</button>
                    </div>
                  </section>
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
          <h3 className="font-bold text-lg border-b border-base-200 pb-3 mb-4">Assign Customers to {rep.firstName}</h3>
          <input type="text" className="input input-bordered w-full input-sm mb-4" placeholder="Search unassigned customers..." />
          <div className="h-48 bg-base-200/50 rounded-lg flex items-center justify-center text-sm text-base-content/50 border border-base-300 overflow-y-auto p-2">
             <ul className="w-full space-y-1">
               <li className="flex items-center gap-3 p-2 hover:bg-base-100 rounded-md cursor-pointer border border-transparent hover:border-base-300 transition-colors">
                 <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                 <span className="font-medium">Stark Industries (New York)</span>
               </li>
               <li className="flex items-center gap-3 p-2 hover:bg-base-100 rounded-md cursor-pointer border border-transparent hover:border-base-300 transition-colors">
                 <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                 <span className="font-medium">Wayne Enterprises (Gotham)</span>
               </li>
             </ul>
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
          <h3 className="font-bold text-lg border-b border-base-200 pb-3 mb-4">Assign Leads to {rep.firstName}</h3>
          <input type="text" className="input input-bordered w-full input-sm mb-4" placeholder="Search open leads..." />
          <div className="h-48 bg-base-200/50 rounded-lg flex items-center justify-center text-sm text-base-content/50 border border-base-300 overflow-y-auto p-2">
             <ul className="w-full space-y-1">
               <li className="flex items-center gap-3 p-2 hover:bg-base-100 rounded-md cursor-pointer border border-transparent hover:border-base-300 transition-colors">
                 <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" />
                 <div className="flex flex-col">
                   <span className="font-medium">ERP Upgrade Proposal</span>
                   <span className="text-[10px] text-base-content/50">Tech Corp Inc. • ₹15,000</span>
                 </div>
               </li>
             </ul>
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
          <h3 className="font-bold text-lg border-b border-base-200 pb-3 mb-4">Update Monthly Target</h3>
          <div className="form-control mb-4">
            <label className="label"><span className="label-text font-semibold">New Revenue Target (₹)</span></label>
            <input type="number" className="input input-bordered w-full" defaultValue={rep.monthlyTarget} />
          </div>
          <div className="form-control mb-4">
            <label className="label"><span className="label-text font-semibold">Effective From</span></label>
            <input type="month" className="input input-bordered w-full" defaultValue="2026-06" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-semibold">Notes / Justification</span></label>
            <textarea className="textarea textarea-bordered w-full" rows={2} placeholder="Reason for target change..."></textarea>
          </div>
          <div className="modal-action mt-6">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Save Target</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Reset Password Modal */}
      <dialog id="modal_reset_pwd" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg border-b border-base-200 pb-3 mb-4 text-error flex items-center gap-2"><MdLockReset /> Reset User Password</h3>
          <p className="text-sm text-base-content/70 mb-4">You are about to reset the login password for <strong>{rep.username}</strong>.</p>
          <div className="form-control mb-4">
            <label className="label cursor-pointer justify-start gap-4">
              <input type="radio" name="pwd_reset" className="radio radio-primary" defaultChecked />
              <span className="label-text">Auto-generate and email new password</span>
            </label>
            <label className="label cursor-pointer justify-start gap-4 mt-2">
              <input type="radio" name="pwd_reset" className="radio radio-primary" />
              <span className="label-text">Set manual password</span>
            </label>
          </div>
          <div className="modal-action mt-6">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-error text-white">Confirm Reset</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Disable Account Modal */}
      <dialog id="modal_disable" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg border-b border-base-200 pb-3 mb-4 text-error flex items-center gap-2"><MdBlock /> Disable Representative Account</h3>
          <p className="text-sm text-base-content/70 mb-4">Are you sure you want to disable <strong>{rep.firstName} {rep.lastName}</strong>? They will immediately lose access to the ERP system.</p>
          <div className="bg-error/10 p-4 rounded-lg border border-error/20 mb-4">
            <p className="text-xs font-bold text-error uppercase mb-2">Reassignment Required</p>
            <p className="text-sm">They currently hold {rep.totalCustomers} Customers and {rep.activeLeads} Leads. You should reassign them before disabling.</p>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input type="checkbox" className="checkbox checkbox-sm checkbox-error" />
              <span className="label-text font-bold text-error">I understand the consequences of this action.</span>
            </label>
          </div>
          <div className="modal-action mt-6">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-error text-white" disabled>Disable Account</button>
            </form>
          </div>
        </div>
      </dialog>

    </div>
  );
}