import React, { useState, Suspense, useEffect } from "react";
import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { socket } from "./socket";
// import Notifications from "./pages/Notifications";
import ProjectChat from "./components/projects/ProjectChat";
// import Members from "./pages/Members";
// import MemberDetails from "./pages/MemberDetails";
// import AdminProfile from "./pages/AdminProfile";
// import AddMember from "./pages/AddMember";
// import CreateProject from "./pages/CreateProject";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/Settings";
// import Settings from "./pages/Settings";
// import HomePage from "./pages/HomePage";
import OrganizationPage from "./pages/Organization/OrganizationRegistrationPage";
import { useAuth } from "./auth/AuthContext";
import WorkUpdates from "./pages/WorkUpdate";
import SalaryStructureDashboard from "./pages/SalaryStructureDashboard";


/* Pages (lazy) */
const AppLayout = React.lazy(() => import("./components/layout/AppLayout"));
const PageContainer = React.lazy(() => import("./components/layout/PageContainer"));
// const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Attendance = React.lazy(() => import("./pages/Attendance"));
const Projects = React.lazy(() => import("./pages/Projects"));
const ProjectWorkspace = React.lazy(() => import("./pages/ProjectWorkspace"));
const TaskDashboard = React.lazy(() => import("./pages/Tasks"));
const LeaveDashboard = React.lazy(() => import("./pages/LeaveDashboard"));

const SalaryStructure = React.lazy(() => import("./pages/SalaryStructure"));
const PayrollDashboard = React.lazy(
  () => import("./pages/PayrollDashboard"),
);
const GeneratePaySlip = React.lazy(
  () => import("./components/salary/GeneratePaySlip"),
);
const PayHistory = React.lazy(() => import("./components/salary/Payhistory"));
const EmployeePayslip = React.lazy(() => import("./components/salary/EmployeePayslip"));
const PayrollPolicySetup = React.lazy(() => import("./components/salary/PayrollPolicySetup"));

const Members = React.lazy(() => import("./pages/Members"));
const MemberDetails = React.lazy(() => import("./pages/MemberDetails"));
const AdminProfile = React.lazy(() => import("./pages/AdminProfile"));
const AddMember = React.lazy(() => import("./pages/AddMember"));
const CreateProject = React.lazy(() => import("./pages/CreateProject"));
const Login = React.lazy(() => import("./pages/Login"));
const AddMemberPage = React.lazy(() => import("./pages/AddMembers"));
const OrganizationRegistrationPage = React.lazy(() => import("./pages/Organization/OrganizationRegistrationPage"));
const ERPLandingPage = React.lazy(() => import("./pages/ERPLandingPage"));


/* ---------- Layout Wrapper ---------- */

function LayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  const { auth } = useAuth();
  const isManagement = ['admin', 'owner', 'manager'].includes(auth?.user?.role || '');

useEffect(() => {
  if (!auth?.user) return;

  const isAdmin =
    auth.user.role === "admin" || auth.user.role === "owner";

  socket.connect();

  const handleConnect = () => {
    console.log("🟢 Socket connected:", socket.id);

    if (isAdmin) {
      socket.emit("joinAdminRoom");
      console.log("👑 Sent joinAdminRoom");
    }

    socket.emit("joinUserRoom", auth.user?.userId);
  };

  const handleNotification = (data: any) => {
    console.log("🔔 Notification received:", data);

    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  socket.on("connect", handleConnect);
  socket.on("notification", handleNotification);

  return () => {
    socket.off("connect", handleConnect);
    socket.off("notification", handleNotification);
    socket.disconnect();
  };
}, [auth?.user]);

  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-lg font-medium text-base-content/70">Loading...</p>
      </div>
    }>
      <Routes>
        <Route path="/login" element={!auth.user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/organizationRegister" element={<OrganizationRegistrationPage />} />

        {!auth.user ? (
          <>
            <Route path="/" element={<ERPLandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (!auth?.slug && !auth?.user?.organization) ? (
          <Route path="*" element={<Navigate to="/organizationRegister" replace />} />
        ) : (
          /* Protected Layout Routes */
          <Route element={<LayoutWrapper />}>
            <Route
              path="/"
              element={
                  <Dashboard />
                // <PageContainer title="Dashboard" subtitle="Overview">
                // </PageContainer>
              }
            />
            <Route
              path="/attendance"
              element={
                  <Attendance />
                // <PageContainer title="Attendance" subtitle="Daily validation">
                // </PageContainer>
              }
            />
            <Route
              path="/projects"
              element={
                  <Projects />
                // <PageContainer title="Projects">
                // </PageContainer>
              }
            />
            <Route path="/work-updates" element={
              <WorkUpdates/>


            }
            />
            <Route
              path="/tasks"
              element={
                  <TaskDashboard />
                // <PageContainer title="Tasks">
                // </PageContainer>
              }
            />
            <Route
              path="/leaves"
              element={
                  <LeaveDashboard />
                // <PageContainer title="My Leaves" subtitle="Track your leave requests">
                // </PageContainer>
              }
            />

            {/* My Salary - For all employees to view their own payslips */}
            <Route
              path="/my-salary"
              element={
                <PageContainer title="My Salary">
                  <EmployeePayslip />
                </PageContainer>
              }
            />


            {/* Payroll - Restricted to Admin, Owner, and Manager */}
            {isManagement && (
              <>
                <Route
                  path="/payroll/dashboard"
                  element={
                      <PayrollDashboard />
                      // <SalaryStructureDashboard />
                    // <PageContainer title="Payroll Dashboard">
                    // </PageContainer>
                  }
                />
                <Route
                  path="/payroll/salary-structure"
                  element={
                      <SalaryStructure />
                    // <PageContainer title="Salary Structure">
                    // </PageContainer>
                  }
                />
                <Route
                  path="/payroll/generate"
                  element={
                      <GeneratePaySlip />
                    // <PageContainer title="Generate Pay Slip">
                    // </PageContainer>
                  }
                />
                <Route
                  path="/payroll/history"
                  element={
                      <PayHistory />
                    // <PageContainer title="Payroll History">
                    // </PageContainer>
                  }
                />
                <Route
                  path="/payroll/policy"
                  element={
                      <PayrollPolicySetup />
                    // <PageContainer title="Payroll Policy Setup">
                    // </PageContainer>
                  }
                />
              </>
            )}

            <Route path="/projects/:id" element={<ProjectWorkspace />}>
               <Route path="chat" element={<ProjectChat />} />
            </Route>
            <Route path="/members" element={<PageContainer title="Members"><Members /></PageContainer>} />
            <Route path="/members/:id" element={<PageContainer><MemberDetails /></PageContainer>} />
            <Route path="/profile/:id" element={<AdminProfile />} />
            <Route path="/addMember" element={<AddMember />} />
            <Route path="/createProject" element={<PageContainer><CreateProject /></PageContainer>} />
            <Route path="/notifications" element={<PageContainer><Notifications /></PageContainer>} />
            <Route path="/createMember" element={<PageContainer><AddMemberPage /></PageContainer>} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
      <ToastContainer />
    </Suspense>
  );
}