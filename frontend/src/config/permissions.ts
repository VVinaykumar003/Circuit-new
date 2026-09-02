export type Action = "view" | "create" | "edit" | "delete" | "export" | "import" | "approve";

export type Module =
  | "dashboard"
  | "employees"
  | "attendance"
  | "teams"
  | "projects"
  | "work_updates"
  | "tasks"
  | "leaves"
  | "notifications"
  | "payroll"
  | "products"
  | "orders"
  | "sales_reps"
  | "leads"
  | "accounts"
  | "contacts"
  | "cases"
  | "forecasts"
  | "settings";

export type PermissionString = `${Module}:${Action}` | `${Module}:*` | "*";

export const ROLE_DEFAULT_PERMISSIONS: Record<string, PermissionString[]> = {
  owner: ["*"],
  admin: ["*"],
  manager: [
    "dashboard:view",
    "employees:view",
    "employees:create",
    "employees:edit",
    "attendance:*",
    "teams:*",
    "projects:*",
    "work_updates:*",
    "tasks:*",
    "leaves:*",
    "notifications:*",
    "payroll:view",
    "payroll:create",
    "payroll:edit",
    "products:*",
    "orders:*",
    "sales_reps:*",
    "leads:*",
    "accounts:*",
    "contacts:*",
    "cases:*",
    "forecasts:*",
    "settings:view",
  ],
  team_lead: [
    "dashboard:view",
    "employees:view",
    "attendance:view",
    "teams:view",
    "projects:view",
    "projects:create",
    "projects:edit",
    "work_updates:*",
    "tasks:*",
    "leaves:view",
    "leaves:create",
    "notifications:view",
    "products:view",
    "orders:view",
    "orders:create",
    "leads:*",
    "accounts:*",
    "contacts:*",
    "cases:*",
  ],
  employee: [
    "dashboard:view",
    "attendance:view",
    "attendance:create",
    "projects:view",
    "work_updates:view",
    "work_updates:create",
    "tasks:view",
    "tasks:create",
    "tasks:edit",
    "leaves:view",
    "leaves:create",
    "notifications:view",
    "payroll:view",
    "products:view",
    "orders:view",
    "orders:create",
    "leads:view",
    "leads:create",
    "accounts:view",
    "contacts:view",
    "cases:view",
    "cases:create",
  ],
};

export const hasPermission = (
  userRole?: string | null,
  requiredPermission?: PermissionString
): boolean => {
  if (!requiredPermission) return true;
  if (!userRole) return false;

  const roleKey = userRole.toLowerCase();
  const permissions = ROLE_DEFAULT_PERMISSIONS[roleKey] || [];

  if (permissions.includes("*")) return true;
  if (permissions.includes(requiredPermission)) return true;

  const [mod] = requiredPermission.split(":");
  if (permissions.includes(`${mod as Module}:*`)) return true;

  return false;
};
