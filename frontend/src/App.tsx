import React, { useState, Suspense, useEffect } from "react";
import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { socket } from "./socket";
import ProjectChat from "./components/projects/ProjectChat";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/Settings";
import { useAuth } from "./auth/AuthContext";
import WorkUpdates from "./pages/WorkUpdate";
import NewProduct from "./pages/Sales/Products";
import AllProducts from "./pages/Sales/AllProducts";
import Leads from "./pages/Sales/Leads";
import AllLeads from "./pages/Sales/AllLeads";
import NewContact from "./pages/Sales/NewContacts";
import AllContacts from "./pages/Sales/AllContact";
import SalesRepDetails from "./pages/Sales/SalesRepDetails";
import AddSalesRep from "./pages/Sales/AddSalesRep";
import NewOrderForm from "./pages/Sales/Orders";
import AllOrders from "./pages/Sales/AllOrders";
import SalesLeads from "./pages/Sales/Employee/SalesLeads";
import SalesMemberProfile from "./pages/Sales/Employee/SalesMemberProfile";
import Accounts from "./pages/Sales/Accounts";
import AllAccountDetails from "./pages/Sales/Accounts";
import NewAccounts from "./pages/Sales/NewAccounts";
import NewTask from "./pages/Sales/NewTask";
import SalesTasksList from "./pages/Sales/TasksList";
import PendingOrders from "./pages/Sales/PendingOrders";
import SalesRepProfile from "./pages/Sales/SalesRepProfile";
import SalesRepAdminProfile from "./pages/Sales/SalesRepAdminProfile";
import ContactDetails from "./pages/Sales/ContactDetails";
import AllSalesReps from "./pages/Sales/AllSalesReps";
import AllCase from "./pages/Sales/AllCase";
import AddCases from "./pages/Sales/AddCases";
import MyTasks from "./pages/Sales/MyTasks";
import SalesForecastDashboard from "./pages/Sales/SalesForecastDashboard";
import AddSalesForecast from "./pages/Sales/AddSalesForecast";
import AllNotifications from "./pages/Sales/AllNotifications";
import AdminNotificationCenter from "./pages/Sales/AdminNotificationCenter";
import NotificationDetails from "./pages/Sales/NotificaitionDetails";

/* Pages (lazy) */
const AppLayout = React.lazy(() => import("./components/layout/AppLayout"));
const PageContainer = React.lazy(
  () => import("./components/layout/PageContainer"),
);
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Attendance = React.lazy(() => import("./pages/Attendance"));
const Projects = React.lazy(() => import("./pages/Projects"));
const ProjectWorkspace = React.lazy(() => import("./pages/ProjectWorkspace"));
const TaskDashboard = React.lazy(() => import("./pages/Tasks"));
const LeaveDashboard = React.lazy(() => import("./pages/LeaveDashboard"));

const SalaryStructure = React.lazy(() => import("./pages/SalaryStructure"));
const PayrollDashboard = React.lazy(() => import("./pages/PayrollDashboard"));
const GeneratePaySlip = React.lazy(
  () => import("./components/salary/GeneratePaySlip"),
);
const PayHistory = React.lazy(() => import("./components/salary/Payhistory"));
const EmployeePayslip = React.lazy(
  () => import("./components/salary/EmployeePayslip"),
);
const PayrollPolicySetup = React.lazy(
  () => import("./components/salary/PayrollPolicySetup"),
);

const Members = React.lazy(() => import("./pages/Members"));
const MemberDetails = React.lazy(() => import("./pages/MemberDetails"));
const AdminProfile = React.lazy(() => import("./pages/AdminProfile"));
const AddMember = React.lazy(() => import("./pages/AddMember"));
const CreateProject = React.lazy(() => import("./pages/CreateProject"));
const Login = React.lazy(() => import("./pages/Login"));
const AddMemberPage = React.lazy(() => import("./pages/AddMembers"));
const OrganizationRegistrationPage = React.lazy(() => import("./pages/Organization/OrganizationRegistrationPage"));
const ERPLandingPage = React.lazy(() => import("./pages/ERPLandingPage"));
const SalesDashboard = React.lazy(() => import("./pages/Sales/SalesDashboard"));


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
  const isManagement = ["admin", "owner", "manager"].includes(
    auth?.user?.role || "",
  );

  useEffect(() => {
    if (!auth?.user) return;

    const isAdmin = auth.user.role === "admin" || auth.user.role === "owner";

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
              element={(localStorage.getItem("selected_department") || auth?.user?.department) === "sales" ? <Navigate to="/sales" replace /> : <Dashboard />} 
            />
            
            <Route path="/sales" element={<SalesDashboard />} />
            <Route path="/sales/dashboard" element={<Navigate to="/sales" replace />} />
            <Route path="/sales/products" element={<AllProducts />} />
            <Route path="/sales/products/new" element={<NewProduct />} />

            <Route path="/sales/leads" element={<AllLeads />} />
            <Route path="/sales/leads/new" element={<Leads />} />
            <Route path="/sales/employee-leads" element={<Leads />} />
            
            <Route path="/sales/profile/:id" element={<SalesMemberProfile />} />
            <Route path="/sales/contacts" element={<AllContacts />} />
            <Route path="/sales/contacts/:id" element={<ContactDetails />} />
            <Route path="/sales/contacts/new" element={<NewContact />} />

            <Route path="/sales/representatives/all" element={<AllSalesReps />} />
            <Route path="/sales/contacts/contactDetails" element={<ContactDetails />} />
            <Route path="/sales/contacts/new" element={<NewContact />} />
            <Route path="/sales/representatives" element={<SalesRepAdminProfile />} />
            <Route path="/sales/representatives/new" element={<AddSalesRep />} />
            <Route path="/sales/representatives/edit/:id" element={<AddSalesRep />} />
            <Route path="/sales/representatives/:id" element={<SalesRepAdminProfile />} />

            <Route path="/sales/orders" element={<AllOrders />} />
            <Route path="/sales/orders/pending" element={<PendingOrders />} />
            <Route path="/sales/orders/new" element={<NewOrderForm />} />

            <Route path="/sales/accounts" element={<AllAccountDetails />} />
            <Route path="/sales/accounts/new" element={<NewAccounts />} />

            <Route path="/sales/tasks/new" element={<NewTask />} />
            <Route path="/sales/tasks" element={<SalesTasksList />} />
            <Route path="/sales/employee/tasks" element={<MyTasks />} />

            <Route path="/sales/cases" element={<AllCase />} />
            <Route path="/sales/cases/new" element={<AddCases/>} />


            <Route path="/sales/forecast" element={<AllNotifications />} />
            <Route path="/sales/forecast/new" element={<AdminNotificationCenter />} />

            {/* <Route path="/sales/notifications/:id" element={<NotificationDetails />} /> */}



            <Route path="/attendance" element={<Attendance />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/work-updates" element={<WorkUpdates />} />
            <Route path="/tasks" element={<TaskDashboard />} />
            <Route path="/leaves" element={<LeaveDashboard />} />
            <Route path="/my-salary" element={<PageContainer title="My Salary"><EmployeePayslip /></PageContainer>} />

                {/* Payroll - Restricted to Admin, Owner, and Manager */}
                {isManagement && (
                  <>
                <Route path="/payroll/dashboard" element={<PayrollDashboard />} />
                <Route path="/payroll/salary-structure" element={<SalaryStructure />} />
                <Route path="/payroll/generate" element={<GeneratePaySlip />} />
                <Route path="/payroll/history" element={<PayHistory />} />
                <Route path="/payroll/policy" element={<PayrollPolicySetup />} />
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
