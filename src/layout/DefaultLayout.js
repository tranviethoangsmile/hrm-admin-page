import React, { useEffect } from "react";
import {
  AppContent,
  AppSidebar,
  AppFooter,
  AppHeader,
} from "../components/index";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Unauthorized from "../views/pages/Unauthorized";
import { ADMIN_ROLES } from "../constants/adminOptions";

const DefaultLayout = () => {
  const navigate = useNavigate();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);

  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const userData = JSON.parse(sessionStorage.getItem("userIF"));

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  if (userData?.role && !ADMIN_ROLES.includes(userData.role)) {
    return <Unauthorized />;
  }

  return (
    <div className="app-shell">
      <AppSidebar />
      <div
        className={`wrapper d-flex flex-column min-vh-100${unfoldable ? " wrapper-full" : ""}`}
      >
        <div className="main-content-shell">
          <AppHeader />
          <AppContent />
          <AppFooter />
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
