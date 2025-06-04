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
  cilStorage,
  cilClock,
  cilList,
  cilChart,
  cilBolt,
  cilMoon,
  cilText,
  cilBell,
  cilQrCode,
} from "@coreui/icons";
import { CNavItem, CNavGroup } from "@coreui/react";

const iconColor = { color: "#1a7f37" };

// Hàm lấy role từ sessionStorage
const getRole = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("userIF"));
    return user?.role || "";
  } catch {
    return "";
  }
};

const role = getRole();

let _nav = [];

if (role === "ADMIN") {
  _nav = [
    {
      component: CNavItem,
      name: "dashboard",
      to: "/dashboard",
      icon: (
        <CIcon
          icon={cilSpeedometer}
          customClassName="nav-icon"
          style={iconColor}
        />
      ),
    },
    {
      component: CNavItem,
      name: "meals",
      to: "/meals",
      icon: (
        <CIcon
          icon={cilFastfood}
          customClassName="nav-icon"
          style={iconColor}
        />
      ),
    },
    {
      component: CNavItem,
      name: "attendance",
      to: "/attendance",
      icon: (
        <CIcon
          icon={cilFingerprint}
          customClassName="nav-icon"
          style={iconColor}
        />
      ),
    },
    {
      component: CNavItem,
      name: "assets",
      to: "/assets",
      icon: (
        <CIcon icon={cilLibrary} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "payroll",
      to: "/payroll",
      icon: (
        <CIcon icon={cilMoney} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "departments",
      to: "/departments",
      icon: (
        <CIcon
          icon={cilBuilding}
          customClassName="nav-icon"
          style={iconColor}
        />
      ),
    },
    {
      component: CNavItem,
      name: "contracts",
      to: "/contracts",
      icon: (
        <CIcon icon={cilFile} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "information",
      to: "/information",
      icon: (
        <CIcon icon={cilBell} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "purchases",
      to: "/purchases",
      icon: (
        <CIcon icon={cilCart} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "events",
      to: "/events",
      icon: (
        <CIcon
          icon={cilCalendar}
          customClassName="nav-icon"
          style={iconColor}
        />
      ),
    },
    {
      component: CNavItem,
      name: "employees",
      to: "/employees",
      icon: (
        <CIcon icon={cilUser} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavGroup,
      name: "settings",
      to: "/settings",
      icon: (
        <CIcon
          icon={cilSettings}
          customClassName="nav-icon"
          style={iconColor}
        />
      ),
      items: [
        {
          component: CNavItem,
          name: "darkMode",
          to: "/settings/dark-mode",
          icon: (
            <CIcon
              icon={cilMoon}
              customClassName="nav-icon"
              style={iconColor}
            />
          ),
        },
        {
          component: CNavItem,
          name: "fontSize",
          to: "/settings/font-size",
          icon: (
            <CIcon
              icon={cilText}
              customClassName="nav-icon"
              style={iconColor}
            />
          ),
        },
      ],
    },
  ];
} else {
  _nav = [
    {
      component: CNavItem,
      name: "inventory",
      to: "/inventory",
      icon: (
        <CIcon icon={cilStorage} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "overtimeRequest",
      to: "/overtime-request",
      icon: (
        <CIcon icon={cilClock} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "taskRequest",
      to: "/task-request",
      icon: (
        <CIcon icon={cilList} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "reports",
      to: "/reports",
      icon: (
        <CIcon icon={cilChart} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "assets",
      to: "/assets",
      icon: (
        <CIcon icon={cilLibrary} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "contracts",
      to: "/contracts",
      icon: (
        <CIcon icon={cilFile} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavItem,
      name: "leave",
      to: "/leave",
      icon: (
        <CIcon
          icon={cilCalendar}
          customClassName="nav-icon"
          style={iconColor}
        />
      ),
    },
    {
      component: CNavItem,
      name: "purchases",
      to: "/purchases",
      icon: (
        <CIcon icon={cilCart} customClassName="nav-icon" style={iconColor} />
      ),
    },
    {
      component: CNavGroup,
      name: "settings",
      to: "/settings",
      icon: (
        <CIcon
          icon={cilSettings}
          customClassName="nav-icon"
          style={iconColor}
        />
      ),
      items: [
        {
          component: CNavItem,
          name: "darkMode",
          to: "/settings/dark-mode",
          icon: (
            <CIcon
              icon={cilMoon}
              customClassName="nav-icon"
              style={iconColor}
            />
          ),
        },
        {
          component: CNavItem,
          name: "fontSize",
          to: "/settings/font-size",
          icon: (
            <CIcon
              icon={cilText}
              customClassName="nav-icon"
              style={iconColor}
            />
          ),
        },
      ],
    },
  ];
}

export default _nav;
