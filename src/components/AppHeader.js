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
  const [user, setUser] = React.useState({});

  React.useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userIF"));
    setUser(userData || {});
    // Lấy ngôn ngữ từ localStorage nếu có
    const lang = localStorage.getItem("i18nextLng");
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  }, []);

  const handleChangeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem("i18nextLng", e.target.value);
  };

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
          onChange={handleChangeLanguage}
        >
          <option value="en">{t("en")}</option>
          <option value="vn">{t("vi")}</option>
          <option value="jp">{t("jp")}</option>
          <option value="pt">{t("pt")}</option>
        </select>
        <span className="fw-semibold text-secondary">{t("welcome")}</span>
        <AppHeaderDropdown user={user} />
      </div>
    </header>
  );
};

export default AppHeader;
