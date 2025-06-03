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
import navigation from "../_nav";

const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);

  return (
    <CSidebar
      className={`border-0 shadow-lg rounded-end-4 bg-white sidebar-modern${unfoldable ? " sidebar-narrow" : ""}`}
      colorScheme="light"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      style={{
        minHeight: "100vh",
        width: unfoldable ? 72 : 260,
        transition: "width 0.2s",
      }}
      onVisibleChange={(visible) => {
        dispatch({ type: "set", sidebarShow: visible });
      }}
    >
      <CSidebarHeader className="border-0 bg-white d-flex align-items-center justify-content-center px-3 py-3 rounded-top-4">
        <div
          style={{
            background: "linear-gradient(135deg, #1a7f37 0%, #157347 100%)",
            borderRadius: 28,
            boxShadow: "0 8px 32px rgba(26,127,55,0.18)",
            padding: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid #fff",
            width: unfoldable ? 56 : 220,
            height: unfoldable ? 56 : 120,
            margin: "0 auto",
            transition: "all 0.2s",
          }}
        >
          <span
            style={{
              fontSize: unfoldable ? 18 : 36,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: 2,
              textShadow: "0 2px 12px rgba(26,127,55,0.25)",
              textAlign: "center",
              width: "100%",
              display: "block",
              lineHeight: unfoldable ? "20px" : "44px",
              userSelect: "none",
            }}
          >
            HRM METAL
          </span>
        </div>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: "set", sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-0 bg-white d-none d-lg-flex rounded-bottom-4 justify-content-center py-3">
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
