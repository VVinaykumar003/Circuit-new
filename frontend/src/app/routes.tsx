import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "./guards/AuthGuard";
import RoleGuard from "./guards/RoleGuard";
import { useAuth } from "@/auth/useAuth";
import Loader from "@/components/ui/Loader";
import NewProduct from "@/pages/Sales/Products";
import AllOrders from "@/pages/Sales/AllOrders";

// Lazy-loaded Public & Utility Pages
const Login = lazy(() => import("@/pages/Login"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ERPLandingPage = lazy(() => import("@/pages/ERPLandingPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const OrganizationRegistrationPage = lazy(
  () => import("@/pages/Organization/OrganizationRegistrationPage")
);
const UnauthorizedPage = lazy(() => import("@/pages/UnauthorizedPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Lazy-loaded Core ERP Pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Attendance = lazy(() => import("@/pages/Attendance"));
const Projects = lazy(() => import("@/pages/Projects"));
const CreateProject = lazy(() => import("@/pages/CreateProject"));
const ProjectWorkspace = lazy(() => import("@/pages/ProjectWorkspace"));
const WorkUpdatesPage = lazy(() => import("@/pages/WorkUpdate"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const LeaveDashboard = lazy(() => import("@/pages/LeaveDashboard"));
const Members = lazy(() => import("@/pages/Members"));
const MemberDetails = lazy(() => import("@/pages/MemberDetails"));
const AddMember = lazy(() => import("@/pages/AddMember"));
const AddMembers = lazy(() => import("@/pages/AddMembers"));
const AdminProfile = lazy(() => import("@/pages/AdminProfile"));
const PayrollDashboard = lazy(() => import("@/pages/PayrollDashboard"));
const SalaryStructure = lazy(() => import("@/pages/SalaryStructure"));
const SalaryStructureDashboard = lazy(() => import("@/pages/SalaryStructureDashboard"));
const GeneratePaySlip = lazy(() => import("@/components/salary/GeneratePaySlip"));
const PayHistory = lazy(() => import("@/components/salary/Payhistory"));
const MyPayslips = lazy(() => import("@/pages/MyPayslips"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Settings = lazy(() => import("@/pages/Settings"));


// Lazy-loaded Sales & CRM Pages
const SalesDashboard = lazy(() => import("@/pages/Sales/SalesDashboard"));
const AttendanceManagementPage = lazy(() => import("@/pages/Sales/AttendanceManagementPage"));
const AttendanceHistory = lazy(() => import("@/pages/Sales/AttendanceHistory"));
const AdminAttendanceHistory = lazy(() => import("@/pages/Sales/AdminAttendanceHistory"));
const EmployeeAttendanceList = lazy(() => import("@/pages/Sales/EmployeeAttendanceList"));
const AdminApproval = lazy(() => import("@/pages/Sales/AdminApproval"));
const EmployeeAttendanceHistory = lazy(() => import("@/pages/Sales/Employee/EmployeeAttendanceHistory"));
const AllProducts = lazy(() => import("@/pages/Sales/AllProducts"));
// const Orders = lazy(() => import("@/pages/Sales/Orders.updated"));
const PendingOrders = lazy(() => import("@/pages/Sales/PendingOrders"));
const NewOrderForm = lazy(() => import("@/pages/Sales/NewOrderForm"));
const AllSalesReps = lazy(() => import("@/pages/Sales/AllSalesReps"));
const AddSalesRep = lazy(() => import("@/pages/Sales/AddSalesRep"));
const SalesRepAdminProfile = lazy(() => import("@/pages/Sales/SalesRepAdminProfile"));
const SalesRepDetails = lazy(() => import("@/pages/Sales/SalesRepDetails"));
const AllLeads = lazy(() => import("@/pages/Sales/AllLeads"));
const Leads = lazy(() => import("@/pages/Sales/Leads"));
const SalesLeads = lazy(() => import("@/pages/Sales/Employee/SalesLeads"));
const Accounts = lazy(() => import("@/pages/Sales/Accounts"));
const NewAccounts = lazy(() => import("@/pages/Sales/NewAccounts"));
const AccountDetails = lazy(() => import("@/pages/Sales/AccountDetails"));
const AllContact = lazy(() => import("@/pages/Sales/AllContact"));
const NewContacts = lazy(() => import("@/pages/Sales/NewContacts"));
const ContactDetails = lazy(() => import("@/pages/Sales/ContactDetails"));
const TasksList = lazy(() => import("@/pages/Sales/TasksList"));
const NewTask = lazy(() => import("@/pages/Sales/NewTask"));
const MyTasks = lazy(() => import("@/pages/Sales/MyTasks"));
const AllCase = lazy(() => import("@/pages/Sales/AllCase"));
const AddCases = lazy(() => import("@/pages/Sales/AddCases"));
const SalesForecastDashboard = lazy(() => import("@/pages/Sales/SalesForecastDashboard"));
const AddSalesForecast = lazy(() => import("@/pages/Sales/AddSalesForecast"));
const AllNotifications = lazy(() => import("@/pages/Sales/AllNotifications"));
const AdminNotificationCenter = lazy(() => import("@/pages/Sales/AdminNotificationCenter"));
const SalesMemberProfile = lazy(() => import("@/pages/Sales/Employee/SalesMemberProfile"));

/**
 * Root dashboard that dynamically routes to the appropriate dashboard
 * based on the user's active department.
 */
function DynamicRootDashboard() {
  const { activeDepartment } = useAuth();
  if (activeDepartment?.toLowerCase() === "sales") {
    return <SalesDashboard />;
  }
  return <Dashboard />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/erp" element={<ERPLandingPage />} />
        <Route path="/landing-page" element={<HomePage />} />
        <Route path="/organization-register" element={<OrganizationRegistrationPage />} />

        {/* ── Protected Application Shell ── */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <AppLayout>
                <Suspense fallback={<Loader />}>
                  <Routes>
                    {/* Root Dashboard */}
                    <Route path="/" element={<DynamicRootDashboard />} />

                    {/* ── ERP Core Modules ── */}
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/attendance/today" element={<Attendance />} />

                    {/* Projects */}
                    <Route path="/projects" element={<Projects />} />
                    <Route
                      path="/projects/create"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <CreateProject />
                        </RoleGuard>
                      }
                    />
                    <Route path="/projects/:id" element={<ProjectWorkspace />} />
                    <Route path="/work-updates" element={<WorkUpdatesPage />} />

                    {/* Tasks */}
                    <Route path="/tasks" element={<Tasks />} />

                    {/* Leaves */}
                    
                    <Route path="/leaves" element={<LeaveDashboard />} />

                    {/* Employees / Members */}
                    <Route
                      path="/employees"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <Members />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/employees/add"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner"]}>
                          <AddMembers />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/employees/single/add"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner"]}>
                          <AddMember />
                        </RoleGuard>
                      }
                    />
                    <Route path="/members" element={<Navigate to="/employees" replace />} />
                    <Route path="/members/add" element={<Navigate to="/employees/add" replace />} />

                    {/* Payroll */}
                    <Route
                      path="/payroll"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <PayrollDashboard />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/payroll/salary-structure"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <SalaryStructure />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/payroll/salary-structure-dashboard"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <SalaryStructureDashboard />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/payroll/generate"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <GeneratePaySlip />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/payroll/history"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <PayHistory />
                        </RoleGuard>
                      }
                    />
                    <Route path="/my-salary" element={<MyPayslips />} />

                    {/* Notifications */}
                    <Route path="/notifications" element={<Notifications />} />

                    {/* Profile & Settings */}
                    <Route path="/profile/:id" element={<MemberDetails />} />
                    <Route path="/admin/profile/:userId" element={<AdminProfile />} />
                    <Route
                      path="/settings"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner"]}>
                          <Settings />
                        </RoleGuard>
                      }
                    />

                    {/* ── Sales & CRM Department ── */}
                    <Route path="/sales" element={<SalesDashboard />} />
                    <Route path="/sales/attendance" element={<AttendanceManagementPage />} />
                    <Route path="/sales/attendance/history" element={<AttendanceHistory />} />
                    <Route path="/sales/attendance/admin-history" element={<AdminAttendanceHistory />} />
                    <Route path="/sales/attendance/employees" element={<EmployeeAttendanceList />} />
                    <Route path="/sales/attendance/approvals" element={<AdminApproval />} />
                    <Route path="/sales/employee/attendance" element={<EmployeeAttendanceHistory />} />

                    {/* Products */}
                    <Route path="/sales/products" element={<AllProducts />} />
                    <Route
                      path="/sales/products/new"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <NewProduct />
                        </RoleGuard>
                      }
                    />

                    {/* Orders */}
                    <Route path="/sales/orders" element={<AllOrders />} />
                    <Route path="/sales/orders/pending" element={<PendingOrders />} />
                    <Route path="/sales/orders/new" element={<NewOrderForm />} />

                    {/* Sales Reps */}
                    <Route
                      path="/sales/representatives"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <AllSalesReps />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/sales/representatives/all"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <AllSalesReps />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/sales/representatives/new"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <AddSalesRep />
                        </RoleGuard>
                      }
                    />
                    <Route path="/sales/representatives/admin/:id" element={<SalesRepAdminProfile />} />
                    <Route path="/sales/representatives/:id" element={<SalesRepDetails />} />

                    {/* Leads */}
                    <Route path="/sales/leads" element={<AllLeads />} />
                    <Route path="/sales/leads/new" element={<Leads />} />
                    <Route path="/sales/employee/leads" element={<SalesLeads />} />

                    {/* Accounts */}
                    <Route path="/sales/accounts" element={<Accounts />} />
                    <Route path="/sales/accounts/new" element={<NewAccounts />} />
                    <Route path="/sales/accounts/:id" element={<AccountDetails />} />

                    {/* Contacts */}
                    <Route path="/sales/contacts" element={<AllContact />} />
                    <Route path="/sales/contacts/new" element={<NewContacts />} />
                    <Route path="/sales/contacts/:id" element={<ContactDetails />} />

                    {/* Sales Tasks */}
                    <Route path="/sales/tasks" element={<TasksList />} />
                    <Route path="/sales/tasks/new" element={<NewTask />} />
                    <Route path="/sales/employee/tasks" element={<MyTasks />} />

                    {/* Cases */}
                    <Route path="/sales/cases" element={<AllCase />} />
                    <Route path="/sales/cases/new" element={<AddCases />} />

                    {/* Forecasts */}
                    <Route path="/sales/forecast" element={<SalesForecastDashboard />} />
                    <Route
                      path="/sales/forecast/new"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <AddSalesForecast />
                        </RoleGuard>
                      }
                    />

                    {/* Sales Notifications */}
                    <Route path="/sales/notifications" element={<AllNotifications />} />
                    <Route
                      path="/sales/notifications/admin"
                      element={
                        <RoleGuard allowedRoles={["admin", "owner", "manager"]}>
                          <AdminNotificationCenter />
                        </RoleGuard>
                      }
                    />
                    <Route path="/sales/profile/:userId" element={<SalesMemberProfile />} />

                    {/* 404 Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </AppLayout>
            </AuthGuard>
          }
        />
      </Routes>
    </Suspense>
  );
}
