export interface DepartmentConfig {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  defaultRoute: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  isEnabled: boolean;
}

export const DEPARTMENTS: Record<string, DepartmentConfig> = {
  erp: {
    id: "erp",
    name: "ERP & Operations",
    code: "ERP",
    description: "Core business management, projects, workforce, payroll",
    icon: "MdDashboard",
    defaultRoute: "/",
    color: "blue",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-600 dark:text-blue-400",
    isEnabled: true,
  },
  sales: {
    id: "sales",
    name: "Sales & CRM",
    code: "SALES",
    description: "Leads, customer accounts, orders, products & revenue forecast",
    icon: "MdTrendingUp",
    defaultRoute: "/sales",
    color: "purple",
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-600 dark:text-purple-400",
    isEnabled: true,
  },
  hr: {
    id: "hr",
    name: "Human Resources",
    code: "HR",
    description: "Employee lifecycle, recruiting, attendance & leaves",
    icon: "MdPeople",
    defaultRoute: "/hr",
    color: "emerald",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    isEnabled: false, // Ready to enable
  },
  finance: {
    id: "finance",
    name: "Finance & Accounting",
    code: "FIN",
    description: "Invoicing, expenses, general ledger & payroll accounting",
    icon: "MdPayments",
    defaultRoute: "/finance",
    color: "amber",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
    isEnabled: false,
  },
  support: {
    id: "support",
    name: "Customer Support",
    code: "SUPPORT",
    description: "Ticket tracking, customer cases, knowledge base & SLAs",
    icon: "MdSupportAgent",
    defaultRoute: "/support",
    color: "cyan",
    badgeBg: "bg-cyan-500/10",
    badgeText: "text-cyan-600 dark:text-cyan-400",
    isEnabled: false,
  },
  inventory: {
    id: "inventory",
    name: "Inventory & Warehouses",
    code: "INV",
    description: "Stock management, suppliers, purchase orders & logistics",
    icon: "MdInventory",
    defaultRoute: "/inventory",
    color: "indigo",
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-600 dark:text-indigo-400",
    isEnabled: false,
  },
};

export const DEFAULT_DEPARTMENT = "erp";

export const getEnabledDepartments = (): DepartmentConfig[] => {
  return Object.values(DEPARTMENTS).filter((dept) => dept.isEnabled);
};

export const getDepartmentById = (id?: string | null): DepartmentConfig => {
  if (!id) return DEPARTMENTS[DEFAULT_DEPARTMENT];
  const normalized = id.toLowerCase().trim();
  return DEPARTMENTS[normalized] || DEPARTMENTS[DEFAULT_DEPARTMENT];
};
