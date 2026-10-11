import CIcon from "@coreui/icons-react";
import {
  cilBell,
  cilBriefcase,
  cilBuilding,
  cilCalendar,
  cilCalendarCheck,
  cilCart,
  cilChatBubble,
  cilClock,
  cilCloud,
  cilDescription,
  cilFactory,
  cilFastfood,
  cilFingerprint,
  cilGroup,
  cilHistory,
  cilLibrary,
  cilList,
  cilMoney,
  cilNewspaper,
  cilPeople,
  cilSettings,
  cilShieldAlt,
  cilSpeedometer,
  cilStorage,
  cilText,
  cilMoon,
  cilUser,
} from "@coreui/icons";
import { CNavGroup, CNavItem } from "@coreui/react";

const iconColor = { color: "currentColor" };
const icon = (value) => (
  <CIcon icon={value} customClassName="nav-icon" style={iconColor} />
);

const getRole = () => {
  try {
    const user =
      JSON.parse(sessionStorage.getItem("currentUser")) ||
      JSON.parse(sessionStorage.getItem("userIF"));
    return user?.role || "";
  } catch {
    return "";
  }
};

const item = (name, to, iconValue, permission) => ({
  component: CNavItem,
  name,
  to,
  icon: icon(iconValue),
  permission,
});

const group = (name, iconValue, items) => ({
  component: CNavGroup,
  name,
  icon: icon(iconValue),
  items,
});

const filterItem = (value, can) => {
  if (!value.permission) return true;
  if (Array.isArray(value.permission)) {
    return value.permission.some(can);
  }
  return can(value.permission);
};

export const filterNavigation = (items, can) => {
  const filtered = [];
  for (const value of items) {
    if (value.items?.length) {
      const children = value.items.filter((child) => filterItem(child, can));
      if (children.length > 0) filtered.push({ ...value, items: children });
    } else if (filterItem(value, can)) {
      filtered.push(value);
    }
  }
  return filtered;
};

const adminNavigation = [
  item("dashboard", "/dashboard", cilSpeedometer, "dashboard.view"),
  group("nav_people", cilGroup, [
    item("employees", "/employees", cilUser, "employees.view"),
    item("departments", "/departments", cilBuilding, "departments.view"),
    item("attendance", "/attendance", cilFingerprint, "attendance.view"),
    item("dayOffs", "/day-offs", cilCalendar, "dayOffs.view"),
  ]),
  group("nav_approvals", cilShieldAlt, [
    item("approvalsHub", "/approvals", cilShieldAlt, "paidLeave.view"),
    item("paidLeave", "/paidleave", cilCalendarCheck, "paidLeave.view"),
    item("leave", "/leave", cilCalendar, "paidLeave.view"),
    item("overtime", "/overtime", cilClock, "overtime.view"),
    item("safetyReports", "/safety-reports", cilShieldAlt, "safetyReports.view"),
    item("taxDependents", "/tax-dependents", cilPeople, "taxDependents.view"),
    item("dependentSupport", "/dependent-support", cilBriefcase, "dependentSupport.view"),
  ]),
  group("nav_payroll", cilMoney, [
    item("payroll", "/payroll", cilMoney, "payroll.view"),
  ]),
  group("nav_production", cilFactory, [
    item("planProduction", "/plan-production", cilFactory, "planProduction.view"),
    item("dailyReports", "/daily-reports", cilDescription, "dailyReports.view"),
    item("reportErrors", "/report-errors", cilList, "reportErrors.view"),
    item("inventory", "/inventory", cilStorage, "inventory.view"),
  ]),
  group("nav_internal", cilNewspaper, [
    item("events", "/events", cilCalendar, "events.view"),
    item("eventChecks", "/event-checks", cilCalendarCheck, "eventChecks.view"),
    item("safetyChecks", "/safety-checks", cilShieldAlt, "safetyChecks.view"),
    item("information", "/information", cilBell, "information.view"),
    item("notifications", "/notifications", cilBell, "notifications.view"),
    item("chat", "/chat", cilChatBubble, "chat.view"),
    item("auditLogs", "/audit-logs", cilHistory, "auditLogs.view"),
  ]),
  group("nav_employee_services", cilFastfood, [
    item("order", "/orders", cilCart, "orders.view"),
    item("purchases", "/purchases", cilCart, "orders.view"),
    item("meals", "/meals", cilFastfood, "meals.view"),
    item("food", "/food", cilFastfood, "food.view"),
    item("canteen", "/canteen", cilBuilding, "canteen.view"),
    item("uniformOrders", "/uniform-orders", cilLibrary, "uniformOrders.view"),
  ]),
  group("settings", cilSettings, [
    item("fcmTokens", "/fcm-tokens", cilCloud, "fcmTokens.view"),
    item("darkMode", "/settings/dark-mode", cilMoon, "settings.view"),
    item("fontSize", "/settings/font-size", cilText, "settings.view"),
  ]),
];

const leaderNavigation = [
  item("dashboard", "/dashboard", cilSpeedometer, "dashboard.view"),
  group("nav_people", cilGroup, [
    item("attendance", "/attendance", cilFingerprint, "attendance.view"),
    item("employees", "/employees", cilUser, "employees.view"),
  ]),
  group("nav_approvals", cilShieldAlt, [
    item("approvalsHub", "/approvals", cilShieldAlt, "paidLeave.view"),
    item("paidLeave", "/paidleave", cilCalendarCheck, "paidLeave.view"),
    item("overtimeRequest", "/overtime-request", cilClock, "overtime.view"),
    item("safetyReports", "/safety-reports", cilShieldAlt, "safetyReports.view"),
  ]),
  group("nav_production", cilFactory, [
    item("dailyReports", "/daily-reports", cilDescription, "dailyReports.view"),
    item("reportErrors", "/report-errors", cilList, "reportErrors.view"),
  ]),
  group("nav_internal", cilNewspaper, [
    item("events", "/events", cilCalendar, "events.view"),
    item("eventChecks", "/event-checks", cilCalendarCheck, "eventChecks.view"),
    item("safetyChecks", "/safety-checks", cilShieldAlt, "safetyChecks.view"),
    item("information", "/information", cilBell, "information.view"),
    item("chat", "/chat", cilChatBubble, "chat.view"),
  ]),
  group("settings", cilSettings, [
    item("darkMode", "/settings/dark-mode", cilMoon, "settings.view"),
    item("fontSize", "/settings/font-size", cilText, "settings.view"),
  ]),
];

const staffNavigation = [
  item("inventory", "/inventory", cilStorage, "inventory.view"),
  item("overtimeRequest", "/overtime-request", cilClock, "overtime.view"),
  item("reports", "/reports", cilList, "report.mine"),
  item("reportErrors", "/report-errors", cilList, "reportErrors.view"),
];

const role = getRole();

export const navigationByRole = {
  admin: ({ can }) => filterNavigation(adminNavigation, can),
  leader: ({ can }) => filterNavigation(leaderNavigation, can),
  staff: ({ can }) => filterNavigation(staffNavigation, can),
};

const navigation =
  role === "ADMIN" || role === "MANAGER" || role === "SUPERVISOR"
    ? adminNavigation
    : role === "LEADER"
      ? leaderNavigation
      : role === "STAFF"
        ? staffNavigation
        : [];

export default navigation;
