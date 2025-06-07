import React, { useEffect } from "react";
import { CButton } from "@coreui/react";
import { cilCheckCircle, cilXCircle, cilInfo } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

const iconMap = {
  success: cilCheckCircle,
  error: cilXCircle,
  info: cilInfo,
};
const colorMap = {
  success: {
    border: "#198754",
    bg: "#e6f4ea",
    text: "#198754",
  },
  error: {
    border: "#dc3545",
    bg: "#fbeaea",
    text: "#dc3545",
  },
  info: {
    border: "#0dcaf0",
    bg: "#eaf6fb",
    text: "#0dcaf0",
  },
};

const AppToast = ({ visible, message, type = "info", onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;
  const color = colorMap[type] || colorMap.info;

  return (
    <div
      style={{
        position: "fixed",
        top: 32,
        right: 32,
        zIndex: 9999,
        minWidth: 340,
        maxWidth: 420,
        background: color.bg,
        borderLeft: `7px solid ${color.border}`,
        boxShadow: "0 8px 32px rgba(34,139,34,0.13)",
        borderRadius: 18,
        display: "flex",
        alignItems: "center",
        padding: "22px 28px",
        fontWeight: 600,
        fontSize: 18,
        color: color.text,
        letterSpacing: 0.1,
        boxSizing: "border-box",
        transition: "all 0.2s",
      }}
    >
      <CIcon
        icon={iconMap[type] || cilInfo}
        size="xxl"
        style={{ color: color.border, marginRight: 22, flexShrink: 0 }}
      />
      <div style={{ flex: 1, fontWeight: 700 }}>{message}</div>
      <CButton
        color="link"
        className="p-0 ms-3"
        style={{
          fontSize: 28,
          color: color.text,
          opacity: 0.7,
          transition: "opacity 0.2s",
        }}
        onClick={onClose}
        tabIndex={0}
        onMouseOver={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseOut={(e) => (e.currentTarget.style.opacity = 0.7)}
      >
        ×
      </CButton>
    </div>
  );
};

export default AppToast;
