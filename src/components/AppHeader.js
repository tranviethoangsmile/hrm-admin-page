import React from "react";
import { useTranslation } from "react-i18next";
import CIcon from "@coreui/icons-react";
import { cilCalendar, cilGlobeAlt, cilLocationPin, cilMenu } from "@coreui/icons";
import { CHeaderToggler } from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";

import { AppHeaderDropdown } from "./header/index";
import logo from "../../public/logo-metal.png";

const AppHeader = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const user = JSON.parse(sessionStorage.getItem("userIF")) || {};
  const todayLabel = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  const handleChangeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem("i18nextLng", e.target.value);
  };

  return (
    <header className="app-header content-panel">
      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 gap-lg-4">
        <div className="app-header__brand">
          <CHeaderToggler
            className="d-lg-none"
            onClick={() => dispatch({ type: "set", sidebarShow: !sidebarShow })}
          >
            <CIcon icon={cilMenu} size="lg" />
          </CHeaderToggler>
          <div className="app-header__logo">
            <img src={logo} alt="HRM Metal" style={{ width: "100%", height: "100%" }} />
          </div>
          <div>
            <span className="app-header__eyebrow">HRM Pro</span>
            <h1 className="app-header__title">{t("hrmMetal") || "HRM Metal"}</h1>
            <div className="small text-body-secondary">
              Quản lý nhân sự — chấm công và vận hành
            </div>
          </div>
        </div>

        <div className="app-header__meta">
          <div className="app-chip">
            <CIcon icon={cilLocationPin} />
            <span>{user?.position || "Factory line"}</span>
          </div>
          <div className="app-chip app-chip--accent">
            <CIcon icon={cilCalendar} />
            <span>{todayLabel}</span>
          </div>
          <div className="app-chip app-chip--select">
            <CIcon icon={cilGlobeAlt} className="ms-3" />
            <select
              className="form-select form-select-sm"
              value={i18n.language}
              onChange={handleChangeLanguage}
              aria-label="Language"
            >
              <option value="en">{t("en")}</option>
              <option value="vi">{t("vi")}</option>
              <option value="jp">{t("jp")}</option>
              <option value="pt">{t("pt")}</option>
            </select>
          </div>
          <AppHeaderDropdown user={user} />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
