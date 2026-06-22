import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdEdit,
  MdBusiness,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdCheckCircle,
  MdWarning,
  MdAdd,
  MdMoreVert,
  MdDelete,
  MdPictureAsPdf,
  MdCloudDownload,
  MdAssignmentInd,
  MdArrowBack,
  MdEvent,
  MdTrendingUp
} from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─────────────────────────── Mock Data ─────────────────────────── */
const MOCK_CONTACT = {
  id: "CON-1001",
  firstName: "Alice",
  lastName: "Johnson",
  status: "VIP",
  designation: "CEO",
  company: "Zager Digital Services",
  department: "Management",
  email: "alice@zager.com",
  altEmail: "alice.personal@example.com",
  phone: "+91 9876543210",
  altPhone: "+91 1234567890",
  gender: "Female",
  dob: "1985-04-12",
  leadSource: "Referral",
  assignedRep: "V VINAY Kumar",
  territory: "APAC",
  createdDate: "2024-01-15",
  lastActivity: "2026-06-02",

  addressLine1: "123 Tech Park, Tower A",
  addressLine2: "Cyber City",
  city: "Bangalore",
  state: "Karnataka",
  country: "India",
  postalCode: "560001",

  communicationScore: 85,
  meetingsScheduled: 4,
  followupsPending: 1,
};

const MOCK_ACCOUNTS = [
  { id: "A1", name: "Zager Digital Services", industry: "Technology", revenue: 1250000, territory: "APAC", status: "VIP" },
];

const MOCK_LEADS = [
  { id: "L1", name: "ERP Implementation", company: "Zager Digital Services", source: "Website", expectedValue: 45000, status: "Negotiation" },
];

const MOCK_MEETINGS = [
  { id: "M1", title: "Q3 Planning & ERP Review", date: "2026-06-10", time: "10:00 AM", type: "Online", status: "Scheduled", rep: "V VINAY Kumar" },
  { id: "M2", title: "Initial Introductory Call", date: "2026-05-15", time: "02:30 PM", type: "Call", status: "Completed", rep: "V VINAY Kumar" },
];

const MOCK_DOCS = [
  { id: "D1", name: "Alice_Business_Card.pdf", date: "2024-01-16", size: "450 KB", type: "Business Card" },
  { id: "D2", name: "NDA_Signed_2026.docx", date: "2026-01-05", size: "1.2 MB", type: "Agreement" },
];

const MOCK_TIMELINE = [
  { id: "TL1", action: "Meeting 'Q3 Planning' Scheduled", time: "2026-06-02 10:30 AM", user: "V VINAY Kumar", type: "meeting" },
  { id: "TL2", action: "Lead 'ERP Implementation' Linked", time: "2026-05-10 02:15 PM", user: "System", type: "link" },
  { id: "TL3", action: "Contact Created", time: "2024-01-15 11:20 AM", user: "Admin", type: "create" },
];

const COMM_DATA = [
  { month: "Jan", calls: 4, emails: 12, meetings: 1 },
  { month: "Feb", calls: 5, emails: 15, meetings: 2 },
  { month: "Mar", calls: 3, emails: 8, meetings: 0 },
  { month: "Apr", calls: 8, emails: 20, meetings: 3 },
  { month: "May", calls: 6, emails: 18, meetings: 1 },
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
export default function ContactDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Overview");
  const [isLoading, setIsLoading] = useState(true);

  const con = MOCK_CONTACT;

  const TABS = ["Overview", "Linked Accounts", "Linked Leads", "Meetings", "Notes", "Documents", "Activity Timeline", "Communication Stats"];

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
              <h1 className="text-xl font-bold text-base-content tracking-tight">{con.firstName} {con.lastName}</h1>
              <div className="text-xs text-base-content/60 breadcrumbs mt-0.5 font-medium">
                <ul>
                  <li>Dashboard</li>
                  <li>Sales</li>
                  <li><a onClick={() => navigate("/sales/contacts")}>Contacts</a></li>
                  <li className="text-primary">Contact Details</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-outline btn-sm gap-2 bg-base-100"><MdEdit size={16} /> Edit Contact</button>
            <button className="btn btn-primary btn-sm gap-2"><MdEvent size={16} /> Add Meeting</button>
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-outline btn-sm btn-square bg-base-100"><MdMoreVert size={16} /></button>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 z-50 border border-base-200 mt-1">
                <li><a><MdEmail size={16} /> Send Email</a></li>
                <li><a><MdTrendingUp size={16} /> Create Deal</a></li>
                <div className="divider my-1"></div>
                <li><a className="text-error"><MdDelete size={16} /> Delete Contact</a></li>
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
              <div className="w-24 h-24 rounded-full border-4 border-base-100 shadow-sm bg-primary text-white flex items-center justify-center text-3xl font-bold">
                {con.firstName.charAt(0)}{con.lastName.charAt(0)}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-base-content leading-tight">{con.firstName} {con.lastName}</h2>
            <p className="text-sm text-base-content/60 font-medium mt-1">{con.designation} at <span className="font-bold text-base-content">{con.company}</span></p>
            
            <div className="mt-3">
              <span className={`badge font-bold ${con.status === 'VIP' ? 'badge-warning text-warning-content' : 'badge-success text-white'}`}>{con.status}</span>
            </div>

            <div className="divider w-full my-4"></div>

            <div className="w-full space-y-3 text-sm text-left">
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1.5"><MdEmail size={16}/> Email</span> <a href={`mailto:${con.email}`} className="font-semibold text-primary truncate max-w-[140px]">{con.email}</a></div>
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1.5"><MdPhone size={16}/> Phone</span> <span className="font-mono font-semibold">{con.phone}</span></div>
              <div className="flex justify-between items-center"><span className="text-base-content/60 flex items-center gap-1.5"><MdLocationOn size={16}/> Territory</span> <span className="font-semibold">{con.territory}</span></div>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-5 sticky top-24">
            <h3 className="font-bold text-base text-base-content mb-4 flex items-center gap-2"><MdAssignmentInd /> Assignment</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-base-content/60 uppercase font-semibold">Sales Representative</p>
                <p className="font-bold mt-1 text-primary">{con.assignedRep}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/60 uppercase font-semibold">Linked Lead</p>
                <p className="font-medium mt-1">{MOCK_LEADS[0].name}</p>
              </div>
            </div>
            
            <div className="divider my-4"></div>
            
            <div className="space-y-3">
              <div className="bg-base-200/50 p-3 rounded-lg border border-base-200 text-center">
                <p className="text-xs font-bold text-base-content/50 uppercase mb-1">Communication Score</p>
                <div className="flex items-center justify-center gap-2">
                  <progress className="progress progress-success w-16" value={con.communicationScore} max="100"></progress>
                  <p className="text-xl font-black text-success">{con.communicationScore}%</p>
                </div>
              </div>
              <div className="bg-warning/10 p-3 rounded-lg border border-warning/20 text-center">
                <p className="text-xs font-bold text-warning uppercase mb-1">Next Follow-Up</p>
                <p className="text-sm font-bold">Tommorow, 10:00 AM</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Content Area ── */}
        <div className="flex-1 flex flex-col min-w-0 gap-6">
          
          {/* Notifications / Alerts Section */}
          {con.followupsPending > 0 && (
            <div className="alert alert-warning shadow-sm py-2 rounded-xl border border-warning/30 text-warning-content">
              <MdWarning size={20} />
              <span className="text-sm font-medium">Follow-up Pending: You have a scheduled follow-up pending with {con.firstName}.</span>
              <button className="btn btn-sm btn-ghost ml-auto">Complete Now</button>
            </div>
          )}

          {/* Analytics (Top of content) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <StatCard title="Meetings Scheduled" value={con.meetingsScheduled} />
             <StatCard title="Active Deals" value={MOCK_LEADS.length} />
             <StatCard title="Account Revenue" value={`₹${MOCK_ACCOUNTS[0].revenue.toLocaleString()}`} />
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
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdBusiness /> Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Company / Account" value={<span className="font-bold text-base-content">{con.company}</span>} />
                      <InfoItem label="Department" value={con.department} />
                      <InfoItem label="Job Title" value={con.designation} />
                      <InfoItem label="Lead Source" value={con.leadSource} />
                      <InfoItem label="Assigned Sales Rep" value={con.assignedRep} />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdEmail /> Personal & Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="First Name" value={con.firstName} />
                      <InfoItem label="Last Name" value={con.lastName} />
                      <InfoItem label="Gender" value={con.gender} />
                      <InfoItem label="Date of Birth" value={con.dob} />
                      <InfoItem label="Email" value={<a href={`mailto:${con.email}`} className="text-primary hover:underline">{con.email}</a>} />
                      <InfoItem label="Alternate Email" value={con.altEmail} />
                      <InfoItem label="Phone Number" value={<span className="font-mono">{con.phone}</span>} />
                      <InfoItem label="Alternate Phone" value={<span className="font-mono">{con.altPhone}</span>} />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold border-b border-base-200 pb-2 mb-5 text-primary flex items-center gap-2"><MdLocationOn /> Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                      <InfoItem label="Address Line 1" value={con.addressLine1} />
                      <InfoItem label="Address Line 2" value={con.addressLine2} />
                      <InfoItem label="City" value={con.city} />
                      <InfoItem label="State" value={con.state} />
                      <InfoItem label="Country" value={con.country} />
                      <InfoItem label="Postal Code" value={con.postalCode} />
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 2: LINKED ACCOUNTS */}
              {activeTab === "Linked Accounts" && (
                <div className="animate-fade-in flex flex-col h-full gap-4">
                  <div className="flex justify-end">
                    <button className="btn btn-sm btn-primary gap-2"><MdAdd /> Link Account</button>
                  </div>
                  <div className="overflow-x-auto border border-base-200 rounded-lg">
                    <table className="table table-sm w-full">
                      <thead className="bg-base-200 text-base-content/70">
                        <tr>
                          <th>Account Name</th>
                          <th>Industry</th>
                          <th>Territory</th>
                          <th className="text-right">Revenue</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_ACCOUNTS.map(a => (
                          <tr key={a.id} className="hover:bg-base-200/50 transition-colors">
                            <td className="font-bold">{a.name}</td>
                            <td>{a.industry}</td>
                            <td>{a.territory}</td>
                            <td className="text-right font-bold text-success">₹{a.revenue.toLocaleString()}</td>
                            <td><span className="badge badge-sm badge-warning font-bold">{a.status}</span></td>
                            <td className="text-right">
                              <button className="btn btn-ghost btn-xs text-primary" onClick={() => navigate(`/sales/accounts/${a.id}`)}>View</button>
                              <button className="btn btn-ghost btn-xs text-error">Unlink</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: LINKED LEADS */}
              {activeTab === "Linked Leads" && (
                <div className="animate-fade-in flex flex-col h-full gap-4">
                  <div className="flex justify-end">
                    <button className="btn btn-sm btn-primary gap-2"><MdAdd /> Link Lead</button>
                  </div>
                  <div className="overflow-x-auto border border-base-200 rounded-lg">
                    <table className="table table-sm w-full">
                      <thead className="bg-base-200 text-base-content/70">
                        <tr>
                          <th>Lead Name</th>
                          <th>Company</th>
                          <th>Lead Source</th>
                          <th className="text-right">Expected Value</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_LEADS.map(l => (
                          <tr key={l.id} className="hover:bg-base-200/50 transition-colors">
                            <td className="font-bold text-primary">{l.name}</td>
                            <td>{l.company}</td>
                            <td>{l.source}</td>
                            <td className="text-right font-bold">₹{l.expectedValue.toLocaleString()}</td>
                            <td><span className="badge badge-sm badge-warning">{l.status}</span></td>
                            <td className="text-right">
                              <button className="btn btn-ghost btn-xs" onClick={() => navigate('/sales/leads')}>View</button>
                              <button className="btn btn-ghost btn-xs text-success">Convert</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: MEETINGS */}
              {activeTab === "Meetings" && (
                <div className="animate-fade-in flex flex-col h-full gap-4">
                  <div className="flex justify-between items-center bg-base-200/50 p-4 rounded-xl border border-base-200">
                    <div>
                      <p className="text-sm font-bold text-base-content/60 uppercase">Total Meetings</p>
                      <p className="text-2xl font-black mt-1">6</p>
                    </div>
                    <button className="btn btn-sm btn-primary gap-2"><MdEvent /> Schedule Meeting</button>
                  </div>
                  
                  <div className="overflow-x-auto border border-base-200 rounded-lg">
                    <table className="table table-sm w-full">
                      <thead className="bg-base-200 text-base-content/70">
                        <tr>
                          <th>Meeting Title</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Type</th>
                          <th>Assigned Rep</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_MEETINGS.map(m => (
                          <tr key={m.id} className="hover:bg-base-200/50 transition-colors">
                            <td className="font-bold">{m.title}</td>
                            <td>{m.date}</td>
                            <td>{m.time}</td>
                            <td>{m.type}</td>
                            <td>{m.rep}</td>
                            <td><span className={`badge badge-sm ${m.status === 'Completed' ? 'badge-success text-white' : 'badge-info text-white'}`}>{m.status}</span></td>
                            <td className="text-right">
                              <button className="btn btn-ghost btn-xs">Edit</button>
                              <button className="btn btn-ghost btn-xs text-error">Delete</button>
                            </td>
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
                    <textarea className="textarea textarea-bordered w-full" rows={3} placeholder="Write sales note, follow-up, or customer requirements..."></textarea>
                    <div className="flex justify-end mt-2"><button className="btn btn-sm btn-primary">Save Note</button></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-base-100 border border-base-200 p-4 rounded-xl shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">Customer Requirements Updated</span>
                        <span className="text-xs text-base-content/50">2 days ago • by V VINAY Kumar</span>
                      </div>
                      <p className="text-sm text-base-content/80 leading-relaxed">Alice requires the ERP implementation to be completed before Q4. They need multi-currency support and detailed inventory tracking features.</p>
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
                        <div className={`timeline-middle w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${item.type === 'meeting' ? 'bg-info' : item.type === 'link' ? 'bg-secondary' : 'bg-primary'}`}>
                          {item.type === 'meeting' ? <MdEvent size={14} /> : <MdCheckCircle size={14} />}
                        </div>
                        <div className="timeline-end timeline-box border-none shadow-none bg-transparent py-3 ml-2">
                          <p className="font-semibold text-sm text-base-content">{item.action}</p>
                          <p className="text-xs font-mono text-base-content/50 mt-1">{item.user} • {item.time}</p>
                        </div>
                        {idx !== MOCK_TIMELINE.length - 1 && <hr className="bg-base-300" />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TAB 8: COMMUNICATION STATS */}
              {activeTab === "Communication Stats" && (
                <div className="animate-fade-in space-y-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                     <StatCard title="Total Calls" value={26} />
                     <StatCard title="Total Emails" value={73} />
                     <StatCard title="Meetings Held" value={5} />
                  </div>
                  <div className="bg-base-100 border border-base-200 p-5 rounded-xl shadow-sm">
                    <h3 className="font-bold text-base-content mb-4 text-sm uppercase tracking-wider">Communication Activity (Last 5 Months)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={COMM_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--b3))" />
                          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "oklch(var(--bc)/0.6)" }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                          <Bar dataKey="emails" stackId="a" fill="#3b82f6" name="Emails" radius={[0, 0, 4, 4]} maxBarSize={40} />
                          <Bar dataKey="calls" stackId="a" fill="#22c55e" name="Calls" maxBarSize={40} />
                          <Bar dataKey="meetings" stackId="a" fill="#a855f7" name="Meetings" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
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
