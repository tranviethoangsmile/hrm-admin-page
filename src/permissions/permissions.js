/**
 * RBAC — Permission catalog.
 *
 * Quy ước permission: `<resource>.<action>` với action thuộc
 * view | create | update | delete | approve | confirm | manage.
 *
 * Role chỉ là tập hợp permission. FE dùng permission để ẩn/hiện UI,
 * bảo mật thực sự do backend enforce (JWT) — không coi ẩn button là security.
 */

export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SUPERVISOR: "SUPERVISOR",
  LEADER: "LEADER",
  STAFF: "STAFF",
};

export const ALL_PERMISSIONS = "*";

/* ── Helper builders ─────────────────────────────── */

const read = (res) => [`${res}.view`, `${res}.detail`];
const write = (res) => [
  ...read(res),
  `${res}.create`,
  `${res}.update`,
  `${res}.delete`,
];
const manage = (res) => [...write(res), `${res}.manage`];

/* ── Modules bao phủ toàn bộ admin nav ───────────── */

const PEOPLE = ["employees", "departments", "attendance", "dayOffs"];
const APPROVALS = [
  "paidLeave",
  "overtime",
  "safetyReports",
  "taxDependents",
  "dependentSupport",
];
const PAYROLL = ["payroll"];
const PRODUCTION = ["planProduction", "dailyReports", "reportErrors", "inventory"];
const INTERNAL = [
  "events",
  "eventChecks",
  "safetyChecks",
  "information",
  "notifications",
  "chat",
  "auditLogs",
];
const SERVICES = ["orders", "meals", "food", "canteen", "uniformOrders"];

const fullAdminPermissions = () => [
  "dashboard.view",
  ...PEOPLE.flatMap(write),
  ...APPROVALS.flatMap(manage),
  ...PAYROLL.flatMap(manage),
  ...PRODUCTION.flatMap(manage),
  ...INTERNAL.flatMap(manage),
  ...SERVICES.flatMap(write),
  "fcmTokens.manage",
  "settings.view",
  "settings.manage",
  "employee.import",
  "report.export",
];

const managerPermissions = () => [
  "dashboard.view",
  ...PEOPLE.flatMap((res) => [...write(res)]),
  ...APPROVALS.flatMap((res) => [...manage(res)]),
  ...PAYROLL.flatMap(manage),
  ...PRODUCTION.flatMap(write),
  ...INTERNAL.flatMap(manage),
  ...SERVICES.flatMap(write),
  "fcmTokens.manage",
  "settings.view",
  "report.export",
];

const supervisorPermissions = () => [
  "dashboard.view",
  ...PEOPLE.flatMap((res) => [...read(res), `${res}.update`]),
  ...APPROVALS.flatMap((res) => [...manage(res)]),
  ...PAYROLL.flatMap((res) => [...read(res)]),
  ...PRODUCTION.flatMap((res) => [...write(res)]),
  ...INTERNAL.flatMap((res) => [...manage(res)]),
  ...SERVICES.flatMap(write),
  "settings.view",
  "report.export",
];

const leaderPermissions = () => [
  "dashboard.view",
  "employees.view",
  "employees.detail",
  "attendance.view",
  "attendance.detail",
  "dayOffs.view",
  "paidLeave.view",
  "paidLeave.detail",
  "paidLeave.approve",
  "overtime.view",
  "overtime.confirm",
  "safetyReports.view",
  "safetyReports.confirm",
  "planProduction.view",
  "dailyReports.view",
  "dailyReports.create",
  "reportErrors.view",
  "inventory.view",
  "inventory.update",
  "eventChecks.view",
  "safetyChecks.view",
  "information.view",
  "information.detail",
  "events.view",
  "orders.view",
  "orders.update",
  "chat.view",
  "chat.send",
  "chat.manage",
  "settings.view",
];

const staffPermissions = () => [
  "dashboard.mine",
  "overtimeRequest.create",
  "attendance.mine",
  "report.mine",
  "order.create",
];

/* ── Role → permissions ──────────────────────────── */

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: fullAdminPermissions(),
  [ROLES.MANAGER]: managerPermissions(),
  [ROLES.SUPERVISOR]: supervisorPermissions(),
  [ROLES.LEADER]: leaderPermissions(),
  [ROLES.STAFF]: staffPermissions(),
};

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.LEADER];

export const hasRolePermission = (role) =>
  Array.isArray(ROLE_PERMISSIONS[role]) ? ROLE_PERMISSIONS[role] : [];

export const canRole = (role, permission) => {
  if (role === ROLES.ADMIN && permission) return true;
  const list = hasRolePermission(role);
  if (list.includes(ALL_PERMISSIONS)) return true;
  if (Array.isArray(permission)) {
    return permission.some((value) => list.includes(value));
  }
  return list.includes(permission) || list.includes(ALL_PERMISSIONS);
};

export default canRole;