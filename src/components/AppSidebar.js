import React from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from "@coreui/react";

import { AppSidebarNav } from "./AppSidebarNav";

import logo from "../../public/logo-metal.png";
// sidebar nav config
import navigation, { filterNavigation } from "../_nav";
import { usePermissions } from "../hooks/usePermissions";

const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const { can } = usePermissions();

  const filteredNavigation = React.useMemo(
    () => filterNavigation(navigation, can),
    [can]
  );

  return (
    <CSidebar
      className={`border-0 sidebar-modern${unfoldable ? " sidebar-narrow" : ""}`}
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      style={{
        minHeight: "100vh",
        width: unfoldable ? 88 : 280,
        transition: "width 0.2s",
      }}
      onVisibleChange={(visible) => {
        dispatch({ type: "set", sidebarShow: visible });
      }}
    >
      <CSidebarHeader className="border-0 sidebar-header-modern">
        <div className="sidebar-modern__brand">
          <div className="sidebar-modern__brand-mark">
            <img src={logo} alt="HRM Metal" />
          </div>
          <div className="sidebar-modern__brand-text">
            <strong>HRM Metal</strong>
            <span>Admin Control</span>
          </div>
        </div>
        <CCloseButton
          className="d-lg-none"
          white
          onClick={() => dispatch({ type: "set", sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={filteredNavigation} />
      <div className="sidebar-modern__footer d-none d-lg-block">
        {!unfoldable && (
          <div className="sidebar-modern__summary">
            <div>
              <strong>Daily focus</strong>
              <span>Keep operations steady</span>
            </div>
            <span>24/7</span>
          </div>
        )}
      </div>
      <CSidebarFooter className="border-0 d-none d-lg-flex justify-content-center sidebar-footer-modern py-3">
        <CSidebarToggler
          onClick={() =>
            dispatch({ type: "set", sidebarUnfoldable: !unfoldable })
          }
        />
      </CSidebarFooter>
    </CSidebar>
  );
};

export default React.memo(AppSidebar);
