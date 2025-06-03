import React from "react";
import CIcon from "@coreui/icons-react";
import {
  cilSpeedometer,
  cilFingerprint,
  cilUser,
  cilMoney,
  cilCart,
  cilCalendar,
  cilBuilding,
  cilLibrary,
  cilFile,
  cilSettings,
  cilFastfood,
} from "@coreui/icons";
import { CNavItem } from "@coreui/react";

const _nav = [
  {
    component: CNavItem,
    name: "dashboard",
    to: "/dashboard",
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "attendance",
    to: "/attendance",
    icon: <CIcon icon={cilFingerprint} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "meals",
    to: "/meals",
    icon: <CIcon icon={cilFastfood} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "employees",
    to: "/employees",
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "payroll",
    to: "/payroll",
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "purchases",
    to: "/purchases",
    icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "leave",
    to: "/leave",
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "departments",
    to: "/departments",
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "assets",
    to: "/assets",
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "contracts",
    to: "/contracts",
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "settings",
    to: "/settings",
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
];

export default _nav;
