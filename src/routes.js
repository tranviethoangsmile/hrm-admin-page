import React from "react";

const Dashboard = React.lazy(() => import("./views/dashboard/Dashboard"));
const PayrollManagement = React.lazy(
  () => import("./views/admin/AdminModulePage")
);
const AttendanceManagement = React.lazy(
  () => import("./views/attendance/AttendanceManagement")
);
const EmployeeManagement = React.lazy(
  () => import("./views/employees/EmployeeManagement")
);
const DepartmentManagement = React.lazy(
  () => import("./views/departments/DepartmentManagement")
);
const Settings = React.lazy(() => import("./views/settings/Settings"));
const MealManagement = React.lazy(() => import("./views/meals/MealManagement"));
const InventoryManagement = React.lazy(
  () => import("./views/admin/AdminModulePage")
);
const OvertimeRequest = React.lazy(
  () => import("./views/admin/AdminModulePage")
);
const ReportManagement = React.lazy(
  () => import("./views/admin/AdminModulePage")
);
const OvertimeManagement = React.lazy(
  () => import("./views/admin/AdminModulePage")
);
const Unauthorized = React.lazy(() => import("./views/pages/Unauthorized"));
const DarkModeSettings = React.lazy(
  () => import("./views/settings/DarkModeSettings")
);
const FontSizeSettings = React.lazy(
  () => import("./views/settings/FontSizeSettings")
);
const AdminInformationManagement = React.lazy(
  () => import("./views/information/AdminInformationManagement")
);
const AdminEventManagement = React.lazy(
  () => import("./views/events/AdminEventManagement")
);
const Checkin = React.lazy(() => import("./views/pages/checkin/Checkin"));
const AdminModulePage = React.lazy(() => import("./views/admin/AdminModulePage"));
const ChatCenter = React.lazy(() => import("./views/chat/ChatCenter"));
const ApprovalsHub = React.lazy(() => import("./views/approvals/ApprovalsHub"));
const NotificationCenter = React.lazy(
  () => import("./views/admin/NotificationCenter")
);

const routes = [
  // { path: "/", exact: true, name: "Home" },
  { path: "/dashboard", name: "Dashboard", element: Dashboard, permission: "dashboard.view" },
  {
    path: "/day-offs",
    name: "Ngày nghỉ công ty",
    element: AdminModulePage,
    props: { moduleKey: "dayOffs" },
    permission: "dayOffs.view",
  },
  {
    path: "/paidleave",
    name: "Paid Leave",
    element: AdminModulePage,
    props: { moduleKey: "paidLeave" },
    permission: "paidLeave.view",
  },
  {
    path: "/approvals",
    name: "Approvals Hub",
    element: ApprovalsHub,
    permission: "paidLeave.view",
  },
  {
    path: "/payroll",
    name: "Payroll Management",
    element: PayrollManagement,
    props: { moduleKey: "payroll" },
    permission: "payroll.view",
  },
  {
    path: "/attendance",
    name: "Quản lý chấm công",
    element: AttendanceManagement,
    permission: "attendance.view",
  },
  {
    path: "/employees",
    name: "Quản lý nhân viên",
    element: EmployeeManagement,
    permission: "employees.view",
  },
  {
    path: "/departments",
    name: "Quản lý phòng ban",
    element: DepartmentManagement,
    permission: "departments.view",
  },
  { path: "/settings", name: "Cài đặt hệ thống", element: Settings, permission: "settings.view" },
  { path: "/meals", name: "Quản lý suất ăn", element: MealManagement, permission: "meals.view" },
  {
    path: "/inventory",
    name: "Quản lý tồn kho",
    element: InventoryManagement,
    props: { moduleKey: "inventory" },
    permission: "inventory.view",
  },
  {
    path: "/overtime-request",
    name: "Yêu cầu tăng ca",
    element: OvertimeRequest,
    props: { moduleKey: "overtimeRequest" },
    permission: "overtime.view",
  },
  {
    path: "/reports",
    name: "Quản lý báo cáo",
    element: ReportManagement,
    props: { moduleKey: "dailyReports" },
    permission: "dailyReports.view",
  },
  {
    path: "/overtime",
    name: "Quản lý tăng ca",
    element: OvertimeManagement,
    props: { moduleKey: "overtime" },
    permission: "overtime.view",
  },
  {
    path: "/safety-reports",
    name: "Báo cáo an toàn",
    element: AdminModulePage,
    props: { moduleKey: "safetyReports" },
    permission: "safetyReports.view",
  },
  {
    path: "/tax-dependents",
    name: "Người phụ thuộc thuế",
    element: AdminModulePage,
    props: { moduleKey: "taxDependents" },
    permission: "taxDependents.view",
  },
  {
    path: "/dependent-support",
    name: "Mức hỗ trợ người phụ thuộc",
    element: AdminModulePage,
    props: { moduleKey: "dependentSupport" },
    permission: "dependentSupport.view",
  },
  {
    path: "/plan-production",
    name: "Kế hoạch sản xuất",
    element: AdminModulePage,
    props: { moduleKey: "planProduction" },
    permission: "planProduction.view",
  },
  {
    path: "/daily-reports",
    name: "Báo cáo hằng ngày",
    element: AdminModulePage,
    props: { moduleKey: "dailyReports" },
    permission: "dailyReports.view",
  },
  {
    path: "/report-errors",
    name: "Lỗi báo cáo",
    element: AdminModulePage,
    props: { moduleKey: "reportErrors" },
    permission: "reportErrors.view",
  },
  {
    path: "/notifications",
    name: "Notification",
    element: NotificationCenter,
    permission: "notifications.view",
  },
  {
    path: "/chat",
    name: "Chat",
    element: ChatCenter,
    permission: "chat.view",
  },
  {
    path: "/event-checks",
    name: "Xác nhận sự kiện",
    element: AdminModulePage,
    props: { moduleKey: "eventChecks" },
    permission: "eventChecks.view",
  },
  {
    path: "/safety-checks",
    name: "Safety check",
    element: AdminModulePage,
    props: { moduleKey: "safetyChecks" },
    permission: "safetyChecks.view",
  },
  {
    path: "/uniform-orders",
    name: "Đồng phục",
    element: AdminModulePage,
    props: { moduleKey: "uniformOrders" },
    permission: "uniformOrders.view",
  },
  {
    path: "/fcm-tokens",
    name: "FCM Token",
    element: AdminModulePage,
    props: { moduleKey: "fcmTokens" },
    permission: "fcmTokens.view",
  },
  {
    path: "/food",
    name: "Món ăn",
    element: AdminModulePage,
    props: { moduleKey: "food" },
    permission: "food.view",
  },
  {
    path: "/canteen",
    name: "Canteen",
    element: AdminModulePage,
    props: { moduleKey: "canteen" },
    permission: "canteen.view",
  },
  {
    path: "/leave",
    name: "Quản lý nghỉ phép",
    element: AdminModulePage,
    props: { moduleKey: "leave" },
    permission: "paidLeave.view",
  },
  {
    path: "/purchases",
    name: "Quản lý mua hàng",
    element: AdminModulePage,
    props: { moduleKey: "purchases" },
    permission: "orders.view",
  },
  { path: "/unauthorized", name: "Unauthorized", element: Unauthorized },
  { path: "/settings/dark-mode", name: "Dark Mode", element: DarkModeSettings, permission: "settings.view" },
  { path: "/settings/font-size", name: "Font Size", element: FontSizeSettings, permission: "settings.view" },
  {
    path: "/information",
    name: "Quản lý thông tin",
    element: AdminInformationManagement,
    permission: "information.view",
  },
  { path: "/events", name: "Quản lý sự kiện", element: AdminEventManagement, permission: "events.view" },
  {
    path: "/events/safety",
    name: "Sự kiện an toàn",
    element: AdminEventManagement,
    permission: "events.view",
  },
  {
    path: "/events/normal",
    name: "Sự kiện thường",
    element: AdminEventManagement,
    permission: "events.view",
  },
  { path: "/checkin", name: "Checkin", element: Checkin },
  {
    path: "/audit-logs",
    name: "Audit Logs",
    element: AdminModulePage,
    props: { moduleKey: "auditLogs" },
    permission: "auditLogs.view",
  },
  {
    path: "/orders",
    name: "Order Management",
    element: AdminModulePage,
    props: { moduleKey: "orders" },
    permission: "orders.view",
  },
];

export default routes;
