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

const DefaultLayout = () => {
  const navigate = useNavigate();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);

  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const userData = JSON.parse(sessionStorage.getItem("userIF"));

  // Nếu là STAFF thì chỉ render Unauthorized, không render layout
  if (userData?.role === "STAFF") {
    return <Unauthorized />;
  }

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <AppSidebar />
      <div
        className={`wrapper d-flex flex-column min-vh-100${unfoldable ? " wrapper-full" : ""}`}
        style={unfoldable ? { paddingLeft: 0 } : {}}
      >
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  );
};

export default DefaultLayout;
