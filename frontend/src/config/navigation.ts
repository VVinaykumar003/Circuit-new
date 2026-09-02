export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badgeKey?: "unreadNotifications" | "pendingLeaves" | "pendingOrders" | "overdueTasks";
  roles?: string[];
  permissions?: string[];
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const DEPARTMENT_NAVIGATION: Record<string, NavSection[]> = {
  erp: [
    {
      title: "Core",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          path: "/",
          icon: "MdDashboard",
        },
        {
          id: "attendance",
          label: "Attendance",
          path: "/attendance",
          icon: "MdEventAvailable",
        },
        {
          id: "projects",
          label: "Projects",
          path: "/projects",
          icon: "MdWorkspaces",
          children: [
            {
              id: "all-projects",
              label: "All Projects",
              path: "/projects",
              icon: "MdWorkspaces",
            },
            {
              id: "create-project",
              label: "Create Project",
              path: "/projects/create",
              icon: "MdAdd",
              roles: ["admin", "owner", "manager"],
            },
            {
              id: "work-updates",
              label: "Work Updates",
              path: "/work-updates",
              icon: "MdAssignment",
            },
          ],
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          id: "team",
          label: "Team",
          path: "/employees",
          icon: "MdPeople",
          roles: ["admin", "owner", "manager"],
          children: [
            {
              id: "employees-list",
              label: "Directory",
              path: "/employees",
              icon: "MdPeople",
            },
            {
              id: "add-employee",
              label: "Add Member",
              path: "/employees/add",
              icon: "MdPersonAdd",
              roles: ["admin", "owner"],
            },
          ],
        },
        {
          id: "tasks",
          label: "Tasks",
          path: "/tasks",
          icon: "MdTask",
        },
        {
          id: "leaves",
          label: "Leaves",
          path: "/leaves",
          icon: "MdFlightTakeoff",
        },
        {
          id: "payroll",
          label: "Payroll",
          path: "/payroll",
          icon: "MdPayments",
          roles: ["admin", "owner", "manager"],
          children: [
            {
              id: "payroll-dashboard",
              label: "Dashboard",
              path: "/payroll",
              icon: "MdWallet",
            },
            {
              id: "salary-structure",
              label: "Salary Structure",
              path: "/payroll/salary-structure",
              icon: "MdPayments",
            },
            {
              id: "generate-payslips",
              label: "Generate Payslips",
              path: "/payroll/generate",
              icon: "MdReceiptLong",
            },
            {
              id: "payroll-history",
              label: "History",
              path: "/payroll/history",
              icon: "MdHistory",
            },
          ],
        },
        {
          id: "my-salary",
          label: "My Payslips",
          path: "/my-salary",
          icon: "MdReceiptLong",
          roles: ["employee"],
        },
        {
          id: "notifications",
          label: "Notifications",
          path: "/notifications",
          icon: "MdNotifications",
          badgeKey: "unreadNotifications",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "settings",
          label: "Settings",
          path: "/settings",
          icon: "MdSettings",
          roles: ["admin", "owner"],
        },
      ],
    },
  ],

  sales: [
    {
      title: "Overview",
      items: [
        {
          id: "sales-dashboard",
          label: "Sales Dashboard",
          path: "/sales",
          icon: "MdDashboard",
        },
        {
          id: "sales-attendance",
          label: "Attendance",
          path: "/sales/attendance",
          icon: "MdEventAvailable",
        },
      ],
    },
    {
      title: "Catalog & Orders",
      items: [
        {
          id: "products",
          label: "Products",
          path: "/sales/products",
          icon: "MdStorefront",
          children: [
            {
              id: "all-products",
              label: "All Products",
              path: "/sales/products",
              icon: "MdStorefront",
            },
            {
              id: "add-product",
              label: "Add Product",
              path: "/sales/products/new",
              icon: "MdAdd",
              roles: ["admin", "owner", "manager"],
            },
          ],
        },
        {
          id: "orders",
          label: "Orders",
          path: "/sales/orders",
          icon: "MdShoppingCart",
          children: [
            {
              id: "all-orders",
              label: "All Orders",
              path: "/sales/orders",
              icon: "MdShoppingCart",
            },
            {
              id: "pending-orders",
              label: "Pending Orders",
              path: "/sales/orders/pending",
              icon: "MdHourglassEmpty",
            },
            {
              id: "new-order",
              label: "New Order",
              path: "/sales/orders/new",
              icon: "MdAdd",
            },
          ],
        },
        {
          id: "sales-reps",
          label: "Sales Reps",
          path: "/sales/representatives",
          icon: "MdPeople",
          roles: ["admin", "owner", "manager"],
          children: [
            {
              id: "all-reps",
              label: "All Representatives",
              path: "/sales/representatives/all",
              icon: "MdPeople",
            },
            {
              id: "add-rep",
              label: "Add Representative",
              path: "/sales/representatives/new",
              icon: "MdPersonAdd",
            },
          ],
        },
      ],
    },
    {
      title: "CRM & Pipeline",
      items: [
        {
          id: "leads",
          label: "Leads",
          path: "/sales/leads",
          icon: "Target",
          children: [
            {
              id: "all-leads",
              label: "All Leads",
              path: "/sales/leads",
              icon: "Target",
            },
            {
              id: "new-lead",
              label: "New Lead",
              path: "/sales/leads/new",
              icon: "MdAdd",
            },
            {
              id: "my-leads",
              label: "My Leads",
              path: "/sales/employee/leads",
              icon: "Target",
              roles: ["employee"],
            },
          ],
        },
        {
          id: "accounts",
          label: "Accounts",
          path: "/sales/accounts",
          icon: "MdBusiness",
          children: [
            {
              id: "all-accounts",
              label: "All Accounts",
              path: "/sales/accounts",
              icon: "MdBusiness",
            },
            {
              id: "new-account",
              label: "New Account",
              path: "/sales/accounts/new",
              icon: "MdAdd",
            },
          ],
        },
        {
          id: "contacts",
          label: "Contacts",
          path: "/sales/contacts",
          icon: "MdContactPage",
          children: [
            {
              id: "all-contacts",
              label: "All Contacts",
              path: "/sales/contacts",
              icon: "MdContactPage",
            },
            {
              id: "new-contact",
              label: "New Contact",
              path: "/sales/contacts/new",
              icon: "MdAdd",
            },
          ],
        },
        {
          id: "sales-tasks",
          label: "Sales Tasks",
          path: "/sales/tasks",
          icon: "MdTask",
          children: [
            {
              id: "all-sales-tasks",
              label: "All Tasks",
              path: "/sales/tasks",
              icon: "MdTask",
            },
            {
              id: "new-sales-task",
              label: "New Task",
              path: "/sales/tasks/new",
              icon: "MdAdd",
            },
            {
              id: "my-sales-tasks",
              label: "My Tasks",
              path: "/sales/employee/tasks",
              icon: "MdAssignment",
            },
          ],
        },
        {
          id: "cases",
          label: "Cases",
          path: "/sales/cases",
          icon: "MdSupportAgent",
          children: [
            {
              id: "all-cases",
              label: "All Cases",
              path: "/sales/cases",
              icon: "MdSupportAgent",
            },
            {
              id: "new-case",
              label: "New Case",
              path: "/sales/cases/new",
              icon: "MdAdd",
            },
          ],
        },
        {
          id: "forecast",
          label: "Forecasts",
          path: "/sales/forecast",
          icon: "MdTrendingUp",
          children: [
            {
              id: "forecast-overview",
              label: "Overview",
              path: "/sales/forecast",
              icon: "MdTrendingUp",
            },
            {
              id: "add-forecast",
              label: "New Forecast",
              path: "/sales/forecast/new",
              icon: "MdAdd",
              roles: ["admin", "owner", "manager"],
            },
          ],
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          id: "sales-notifications",
          label: "Notifications",
          path: "/sales/notifications",
          icon: "MdNotifications",
          badgeKey: "unreadNotifications",
        },
        {
          id: "broadcast-notifications",
          label: "Broadcast Center",
          path: "/sales/notifications/admin",
          icon: "MdSend",
          roles: ["admin", "owner", "manager"],
        },
      ],
    },
  ],
};

export const getDepartmentNavigation = (
  department: string,
  userRole?: string
): NavSection[] => {
  const sections = DEPARTMENT_NAVIGATION[department.toLowerCase()] || DEPARTMENT_NAVIGATION["erp"];

  return sections
    .map((section) => ({
      ...section,
      items: filterNavItems(section.items, userRole),
    }))
    .filter((section) => section.items.length > 0);
};

const filterNavItems = (items: NavItem[], userRole?: string): NavItem[] => {
  return items
    .filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      if (!userRole) return false;
      return item.roles.map((r) => r.toLowerCase()).includes(userRole.toLowerCase());
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: filterNavItems(item.children, userRole),
        };
      }
      return item;
    });
};
