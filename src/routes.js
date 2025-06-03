import React from "react";

const Dashboard = React.lazy(() => import("./views/dashboard/Dashboard"));
const Machining = React.lazy(() => import("./views/machining/Machining"));
const PaidLeave = React.lazy(() => import("./views/paidleave/PaidLeave"));
const Manufacturing = React.lazy(
  () => import("./views/manufacturing/Manufacturing")
);
const PayrollManagement = React.lazy(
  () => import("./views/payroll/PayrollManagement")
);
const AttendanceManagement = React.lazy(
  () => import("./views/attendance/AttendanceManagement")
);
const EmployeeManagement = React.lazy(
  () => import("./views/employees/EmployeeManagement")
);
const PurchaseManagement = React.lazy(
  () => import("./views/purchases/PurchaseManagement")
);
const LeaveManagement = React.lazy(
  () => import("./views/leave/LeaveManagement")
);
const DepartmentManagement = React.lazy(
  () => import("./views/departments/DepartmentManagement")
);
const AssetManagement = React.lazy(
  () => import("./views/assets/AssetManagement")
);
const ContractManagement = React.lazy(
  () => import("./views/contracts/ContractManagement")
);
const Settings = React.lazy(() => import("./views/settings/Settings"));
const MealManagement = React.lazy(() => import("./views/meals/MealManagement"));

const routes = [
  // { path: "/", exact: true, name: "Home" },
  { path: "/dashboard", name: "Dashboard", element: Dashboard },
  { path: "/machining", name: "Machining", element: Machining },
  { path: "/manufacturing", name: "Manufacturing", element: Manufacturing },
  { path: "/paidleave", name: "Paid Leave", element: PaidLeave },
  { path: "/payroll", name: "Payroll Management", element: PayrollManagement },
  {
    path: "/attendance",
    name: "Quản lý chấm công",
    element: AttendanceManagement,
  },
  {
    path: "/employees",
    name: "Quản lý nhân viên",
    element: EmployeeManagement,
  },
  { path: "/purchases", name: "Quản lý mua hàng", element: PurchaseManagement },
  { path: "/leave", name: "Quản lý nghỉ phép", element: LeaveManagement },
  {
    path: "/departments",
    name: "Quản lý phòng ban",
    element: DepartmentManagement,
  },
  { path: "/assets", name: "Quản lý tài sản", element: AssetManagement },
  { path: "/contracts", name: "Quản lý hợp đồng", element: ContractManagement },
  { path: "/settings", name: "Cài đặt hệ thống", element: Settings },
  { path: "/meals", name: "Quản lý suất ăn", element: MealManagement },
];

export default routes;
