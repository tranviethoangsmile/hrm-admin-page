import React, { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
} from "@coreui/icons";
import { useTranslation } from "react-i18next";

import { AppBreadcrumb } from "./index";
import { AppHeaderDropdown } from "./header/index";
import logo from "../../public/logo-metal.png";

const AppHeader = () => {
  const headerRef = useRef();
  const { colorMode, setColorMode } = useColorModes(
    "coreui-free-react-admin-template-theme"
  );
  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.sidebarShow);

  useEffect(() => {
    document.addEventListener("scroll", () => {
      headerRef.current &&
        headerRef.current.classList.toggle(
          "shadow-sm",
          document.documentElement.scrollTop > 0
        );
    });
  }, []);

  return (
    <header className="app-header bg-white shadow-sm rounded-4 px-4 py-2 mb-3 d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        <span
          className="fw-bold fs-4"
          style={{ color: "#1a7f37", letterSpacing: 1 }}
        >
          {t("HRM Metal")}
        </span>
      </div>
      <div className="d-flex align-items-center gap-3">
        <select
          className="form-select form-select-sm w-auto"
          style={{ minWidth: 110 }}
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">{t("en")}</option>
          <option value="vn">{t("vi")}</option>
          <option value="jp">{t("jp")}</option>
          <option value="pt">{t("pt")}</option>
        </select>
        <span className="fw-semibold text-secondary">{t("welcome")}</span>
        <img
          src="/avatar-empty.png"
          alt="avatar"
          style={{ width: 36, height: 36, borderRadius: "50%" }}
        />
      </div>
    </header>
  );
};

export default AppHeader;
