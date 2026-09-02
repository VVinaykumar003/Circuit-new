export type Role = "owner" | "admin" | "manager" | "team_lead" | "employee";

export const ROLES: Record<string, Role> = {
  OWNER: "owner",
  ADMIN: "admin",
  MANAGER: "manager",
  TEAM_LEAD: "team_lead",
  EMPLOYEE: "employee",
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 100,
  admin: 80,
  manager: 60,
  team_lead: 40,
  employee: 20,
};

export const isAdminRole = (role?: string | null): boolean => {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return normalized === "admin" || normalized === "owner";
};

export const isManagementRole = (role?: string | null): boolean => {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return normalized === "admin" || normalized === "owner" || normalized === "manager";
};

export const hasRequiredRole = (userRole?: string | null, allowedRoles?: string[]): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  return allowedRoles.map((r) => r.toLowerCase()).includes(userRole.toLowerCase());
};
