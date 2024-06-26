import React from "react";

const Dashboard = React.lazy(() => import("./views/dashboard/Dashboard"));
const Machining = React.lazy(() => import("./views/machining/Machining"));
const PaidLeave = React.lazy(() => import("./views/paidleave/PaidLeave"));
const Manufacturing = React.lazy(
  () => import("./views/manufacturing/Manufacturing")
);
const routes = [
  // { path: "/", exact: true, name: "Home" },
  { path: "/dashboard", name: "Dashboard", element: Dashboard },
  { path: "/machining", name: "Machining", element: Machining },
  { path: "/manufacturing", name: "Manufacturing", element: Manufacturing },
  { path: "/paidleave", name: "Paid Leave", element: PaidLeave },
];

export default routes;
