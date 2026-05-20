// import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import confetti from "canvas-confetti";
import { Link, useNavigate } from "react-router-dom";
import {
  MdPeople,
  MdEventAvailable,
  MdWorkspaces,
  MdPendingActions,
  MdAssignment,
  MdPersonAdd,
  MdFlightTakeoff,
  MdReceiptLong,
} from "react-icons/md";
import { isBirthdayToday } from "@/utils/dateUtils";
import { useEffect, useState, useMemo } from "react";
import SingleBirthdayCard from "@/components/members/SingleBirthdayCard";

import BirthdayCarousel from "@/components/members/BirthdayCarousel";
import type { Member } from "@/type/member";
import { useAuth } from "@/auth/AuthContext";
import { getMembers } from "@/services/memberService";
import { getAttendance, getMyAttendance } from "@/services/attendanceService";
import { getProject } from "@/services/projectServices";
import api from "@/services/api";
import { getAllLeaves } from "@/services/leaveService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Pagination from "@/components/ui/Pagination";

// Helper to format MongoDB timestamps to "x mins ago"
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `Just now`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const getActivityLink = (activity: any) => {
  const combined = `${activity.action || activity.title || ""} ${activity.message || ""}`.toLowerCase();
  if (combined.includes("leave")) return "/leaves";
  if (combined.includes("task")) return "/tasks";
  if (combined.includes("project")) return "/projects";
  if (combined.includes("member") || combined.includes("user")) return "/members";
  if (combined.includes("attendance")) return "/attendance";
  return "#";
};

const attendanceTrendData = [
  { name: 'Mon', present: 5, absent: 1 },
  { name: 'Tue', present: 6, absent: 0 },
  { name: 'Wed', present: 4, absent: 2 },
  { name: 'Thu', present: 5, absent: 1 },
  { name: 'Fri', present: 6, absent: 0 },
    { name: 'Sat', present: 3, absent: 2 },
];

export default function Dashboard() {
  const { auth } = useAuth();
  const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "owner";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Member[]>([]);
  const [statsData, setStatsData] = useState({
    totalEmployees: 0,
    presentToday: 0,
    activeProjects: 0,
    pendingLeaves: 0,
    myAttendanceStatus: "Not Marked",
  });

  const [activities, setActivities] = useState<any[]>([]);

  // Pagination for activities
  const [activityPage, setActivityPage] = useState(1);
  const ACTIVITIES_PER_PAGE = 5; // Adjust this number as needed


  useEffect(() => {
    if (!auth.slug) return;

    const fetchDashboardData = async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const todayISO = new Date().toISOString().split("T")[0];

        // Fetch primary data concurrently
        const [membersRes, attendanceRes, projectsRes] = await Promise.allSettled(
          isAdmin 
            ? [
                getMembers(auth.slug),
                getAttendance(auth.slug, { date: todayISO }),
                getProject(auth.slug)
              ]
            : [
                getMembers(auth.slug),
                getMyAttendance(auth.slug, { date: todayISO }),
                getProject(auth.slug)
              ]
        );

        let fetchedMembers: Member[] = [];
        if (membersRes.status === "fulfilled") {
          fetchedMembers = membersRes.value.data?.members || [];
          setEmployees(fetchedMembers);
        }

        let presentCount = 0;
        let myStatus = "Not Marked";
        
        if (attendanceRes.status === "fulfilled" && isAdmin) {
          const attendanceDocs = attendanceRes.value.data?.data || attendanceRes.value.data || [];
          attendanceDocs.forEach((doc: any) => {
            (doc.records || []).forEach((r: any) => {
              const status = (r.status || "").toUpperCase();
              if (status === "PRESENT" || status === "HALF_DAY") presentCount++;
            });
          });
        } else if (attendanceRes.status === "fulfilled" && !isAdmin) {
          const myDocs = attendanceRes.value.data?.data || [];
          if (myDocs.length > 0 && myDocs[0].record) {
            myStatus = myDocs[0].record.status || "Not Marked";
          }
        }

        let activeProjectsCount = 0;
        if (projectsRes.status === "fulfilled") {
          const projectsList = projectsRes.value.data?.projects || [];
          activeProjectsCount = projectsList.filter(
            (p: any) => (p.projectState || "active").toLowerCase() === "active"
          ).length;
        }

        // Fetch leaves (best effort depending on route configuration)
        let pendingLeavesCount = 0;
        // TODO: Uncomment and update the endpoint once the backend route for leaves is ready
        if (isAdmin) {
          try {
            const leavesRes = await getAllLeaves(auth.slug);
            const leavesList = leavesRes.data?.leaves || leavesRes.data?.data || [];
            pendingLeavesCount = leavesList.filter((l: any) => (l.status || "").toLowerCase() === "pending").length;
          } catch (e) {
            console.error("Could not fetch leaves", e);
          }
        }

        // Fetch recent activities from backend
        try {
          const activityEndpoint = isAdmin
            ? `/activity/${auth.slug}`
            : `/activity/${auth.slug}?userId=${(auth.user as any)?.userId || (auth.user as any)?._id}`;
            
          const activityRes = await api.get(activityEndpoint);
          setActivities(activityRes.data?.activities || activityRes.data?.data || []);
        } catch (e) {
          console.error("Could not fetch activities", e);
        }

        setStatsData({
          totalEmployees: fetchedMembers.length,
          presentToday: presentCount,
          activeProjects: activeProjectsCount,
          pendingLeaves: pendingLeavesCount,
          myAttendanceStatus: myStatus,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        if (!isSilent) setLoading(false);
      }
    };

    fetchDashboardData();

    // Auto-refresh every 30 seconds to catch admin changes (silent refresh)
    const intervalId = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(intervalId);
  }, [auth.slug, isAdmin]);

  const adminStats = [
    {
      title: "Employees",
      value: statsData.totalEmployees,
      icon: <MdPeople size={20} />,
      helperText: (
        <span className="flex items-center gap-1 text-base-content/60 mt-1">
          <span className="text-xs font-medium text-primary/80">Active workforce</span>
        </span>
      ),
    },
    {
      title: "Present Today",
      value: statsData.presentToday,
      icon: <MdEventAvailable size={20} />,
      helperText: (
        <span className="flex items-center gap-1 text-base-content/60 mt-1">
          <span className="text-xs font-medium text-primary/80">
            {statsData.totalEmployees > 0 
              ? `${Math.round((statsData.presentToday / statsData.totalEmployees) * 100)}% attendance rate` 
              : "No data"}
          </span>
        </span>
      ),
    },
    {
      title: "Active Projects",
      value: statsData.activeProjects,
      icon: <MdWorkspaces size={20} />,
      helperText: (
        <span className="flex items-center gap-1 text-base-content/60 mt-1">
          <span className="text-xs font-medium text-primary/80">Stable</span>
        </span>
      ),
    },
    {
      title: "Pending Leaves",
      value: statsData.pendingLeaves,
      icon: <MdPendingActions size={20} />,
      helperText: (
        <span className="flex items-center gap-1 text-base-content/60 mt-1">
          <span className="text-xs font-medium text-primary/80">Awaiting review</span>
        </span>
      ),
    },
  ];

  const employeeStats = [
    {
      title: "My Active Projects",
      value: (
        <span className="inline-block text-left w-full">
          {statsData.activeProjects}
        </span>
      ),
      icon: <MdWorkspaces size={20} />,
      helperText: (
        <span className="flex items-center justify-start gap-1 text-base-content/60 mt-1 w-full text-left">
          <span className="text-xs font-medium">Projects you are assigned to</span>
        </span>
      ),
    },
    {
      title: "Today's Attendance",
      value: (
        <span className="inline-block text-left w-full">
          <StatusBadge status={statsData.myAttendanceStatus.replace('_', ' ').toLowerCase()} size="md" />
        </span>
      ),
      icon: <MdEventAvailable size={20} />,
      helperText: statsData.myAttendanceStatus === "PRESENT" ? (
        <span className="flex items-center justify-start gap-1 text-success mt-1 font-medium text-xs w-full text-left">On time</span>
      ) : (
        <span className="flex items-center justify-start gap-1 text-base-content/60 mt-1 font-medium text-xs w-full text-left">Your current status</span>
      ),
    },
  ];

  const statsToRender = isAdmin ? adminStats : employeeStats;

  const birthdayEmployees = employees.filter((emp) => emp.dateOfBirth && isBirthdayToday(emp.dateOfBirth));

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (birthdayEmployees.length > 0) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  }, [birthdayEmployees]);
 useEffect(() => {
  if (birthdayEmployees.length <= 1) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) =>
      prev === birthdayEmployees.length - 1 ? 0 : prev + 1
    );
  }, 4000); 

  return () => clearInterval(interval);
}, [birthdayEmployees.length]);
 
  // Group consecutive identical activities
  const groupedActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    
    const grouped = [];
    let currentGroup = { ...activities[0], count: 1 };

    for (let i = 1; i < activities.length; i++) {
      const act = activities[i];
      const sameUser = act.user && currentGroup.user && (act.user._id === currentGroup.user._id || act.user.name === currentGroup.user.name);
      const sameAction = act.action && currentGroup.action && act.action === currentGroup.action;

      if (sameUser && sameAction) {
        currentGroup.count += 1;
      } else {
        grouped.push(currentGroup);
        currentGroup = { ...act, count: 1 };
      }
    }
    grouped.push(currentGroup);
    return grouped;
  }, [activities]);

  // Activity pagination logic
  const totalActivityPages = Math.ceil(groupedActivities.length / ACTIVITIES_PER_PAGE);
  const paginatedActivities = groupedActivities.slice(
    (activityPage - 1) * ACTIVITIES_PER_PAGE,
    activityPage * ACTIVITIES_PER_PAGE
  );

  const primaryBtnClass = "btn btn-primary btn-sm shadow-sm transition-all hover:shadow-md  text-sm";
  const secondaryBtnClass = "btn btn-sm bg-base-100 border border-base-300 text-base-content/80 hover:bg-base-200 hover:border-base-300 shadow-sm transition-all  text-sm";

  return (
    <div className="p-6 space-y-6">
      {/* <PageHeader
        title="Dashboard"
        subtitle="Overview of your organization"
      /> */}
      <Breadcrumbs/>
     {/* STATS */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {statsToRender.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            helperText={stat.helperText}
          />
        ))}
      </div>
      
      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-lg font-semibold text-base-content mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {isAdmin ? (
            <>
              <Link to="/tasks" className={primaryBtnClass}><MdAssignment size={16} /> Assign Task</Link>
              <Link to="/createProject" className={secondaryBtnClass}><MdWorkspaces size={16} /> Create Project</Link>
              <Link to="/addMember" className={secondaryBtnClass}><MdPersonAdd size={16} /> Add Member</Link>
              <Link to="/members" className={secondaryBtnClass}><MdPeople size={16} /> Team Directory</Link>
              <Link to="/leaves" className={secondaryBtnClass}><MdPeople size={16} /> Leave</Link>
            </>
          ) : (
            <>
              <Link to="/attendance" className={primaryBtnClass}><MdEventAvailable size={16} /> Attendance</Link>
              <Link to="/tasks" className={secondaryBtnClass}><MdAssignment size={16} /> My Tasks</Link>
              <Link to="/leaves" className={secondaryBtnClass}><MdFlightTakeoff size={16} /> Log Leave</Link>
              <Link to="/my-salary" className={secondaryBtnClass}><MdReceiptLong size={16} /> Download Payslips</Link>
              <Link to="/members" className={secondaryBtnClass}><MdPeople size={16} /> Team Directory</Link>
            </>
          )}
        </div>
      </div>

  {/* BIRTHDAY SECTION */}
{birthdayEmployees.length > 0 && (
  <div className="mb-6">
  {birthdayEmployees.length === 1 && (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">
        🎂 Birthday Today
      </h2>
    </div>

    <SingleBirthdayCard employee={birthdayEmployees[0]} />
  </div>
)}

   {birthdayEmployees.length === 2 && (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4">
      🎂 Birthdays Today
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {birthdayEmployees.map((emp) => (
        <SingleBirthdayCard key={emp.id} employee={emp} />
      ))}
    </div>
  </div>
)}
    {birthdayEmployees.length > 2 && (
      <BirthdayCarousel
        employees={birthdayEmployees}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
    )}
  </div>
)}

      {/* ATTENDANCE TREND GRAPH */}
      {isAdmin && (
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6 mb-6">
          <h2 className="text-lg font-semibold text-base-content mb-4">Attendance Trend (This Week)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  allowDecimals={false}
                  domain={[0, Math.max(10, statsData.totalEmployees)]}
                />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar barSize={40} dataKey="present" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Present" />
                <Bar barSize={40} dataKey="absent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    
      {/* RECENT ACTIVITY (EMPTY STATE FOR NOW) */}
      {/* <div>
        <h2 className="text-lg font-semibold text-base-content mb-3">
          Recent Activity
        </h2>

      {groupedActivities.length > 0 ? (
          <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6">
            <ul className="space-y-4">
              {paginatedActivities.map((activity) => {
                const link = getActivityLink(activity);
                const isClickable = link !== "#";
                
                return (
                <li 
                  key={activity._id || activity.id} 
                  onClick={() => isClickable && navigate(link)}
                  className={`flex justify-between items-start sm:items-center text-sm border-b border-base-200 pb-3 last:border-0 last:pb-0 ${
                    isClickable ? "cursor-pointer hover:opacity-70 transition-opacity" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {activity.user && (
                      <div className="w-9 h-9 rounded-full bg-base-200 border border-base-300 flex items-center justify-center overflow-hidden shrink-0">
                        {activity.user.imageUrl ? (
                          <img src={activity.user.imageUrl} alt={activity.user.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-base-content/60">
                            {(activity.user?.name || "?")
                              .trim()
                              .split(" ")
                              .map((n: string) => n[0])
                              .filter(Boolean)
                              .slice(0, 2)
                              .join("")
                              .toUpperCase() || "?"}
                          </span>
                        )} 
                      </div>
                    )}
                    <div className="flex flex-col">
                  <span className="text-base-content font-medium">
                    {activity.action || "Activity"}
                    {activity.count > 1 && <span className="text-primary ml-1 text-xs">({activity.count})</span>}
                  </span>
                      <span className="text-base-content/70 text-xs">{activity.message || activity.title}</span>
                    </div>
                  </div>
                  <span className="text-base-content/50 text-xs whitespace-nowrap shrink-0 mt-1 sm:mt-0">
                    {activity.time || (activity.createdAt ? timeAgo(activity.createdAt) : "")}
                  </span>
                </li>
              )})}
            </ul>

            <div className="mt-6">
              <Pagination
                currentPage={activityPage}
                totalPages={totalActivityPages}
                onPageChange={setActivityPage}
              />
            </div>
          </div>
        ) : (
          <EmptyState
            title="No activity yet"
            description="Recent attendance, tasks, and project updates will appear here."
          />
        )}
      </div> */}


      <div className="bg-primary/10 rounded-2xl shadow-sm border border-base-300 p-6">
  <ul className="space-y-3">
    {paginatedActivities.map((activity) => {
      const link = getActivityLink(activity);
      const isClickable = link !== "#";

      return (
        <li
          key={activity._id || activity.id}
          onClick={() => isClickable && navigate(link)}
          className={`flex justify-between items-start sm:items-center text-sm 
          p-3 rounded-xl border border-base-200 bg-base-100
          transition-all duration-200
          ${isClickable ? "cursor-pointer hover:bg-base-200 hover:shadow-sm" : ""}
          `}
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {activity.user && (
              <div className="w-9 h-9 rounded-full bg-base-200 border border-base-300 flex items-center justify-center overflow-hidden shrink-0">
                {activity.user.imageUrl ? (
                  <img
                    src={activity.user.imageUrl}
                    alt={activity.user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-base-content/60">
                    {(activity.user?.name || "?")
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-base-content font-medium">
                {activity.action || "Activity"}
                {activity.count > 1 && (
                  <span className="text-primary ml-1 text-xs">
                    ({activity.count})
                  </span>
                )}
              </span>

              <span className="text-base-content text-xs">
                {activity.message || activity.title}
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <span className="text-base-content text-xs whitespace-nowrap shrink-0 mt-1 sm:mt-0">
            {activity.time ||
              (activity.createdAt ? timeAgo(activity.createdAt) : "")}
          </span>
        </li>
      );
    })}
  </ul>

  <div className="mt-6">
    <Pagination
      currentPage={activityPage}
      totalPages={totalActivityPages}
      onPageChange={setActivityPage}
    />
  </div>
</div>

    </div>
  );
}
