import { useState } from "react";
import { CButton, CCol, CRow } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilBriefcase,
  cilClock,
  cilPeople,
  cilShieldAlt,
  cilCalendarCheck,
} from "@coreui/icons";
import { useTranslation } from "react-i18next";
import AdminModulePage from "../admin/AdminModulePage";
import { usePermissions } from "../../hooks/usePermissions";

const TABS = [
  {
    key: "paidLeave",
    label: "paidLeave",
    icon: cilCalendarCheck,
    moduleKey: "paidLeave",
    permission: "paidLeave.view",
  },
  {
    key: "overtime",
    label: "overtime",
    icon: cilClock,
    moduleKey: "overtime",
    permission: "overtime.view",
  },
  {
    key: "safetyReports",
    label: "safetyReports",
    icon: cilShieldAlt,
    moduleKey: "safetyReports",
    permission: "safetyReports.view",
  },
  {
    key: "taxDependents",
    label: "taxDependents",
    icon: cilPeople,
    moduleKey: "taxDependents",
    permission: "taxDependents.view",
  },
  {
    key: "dependentSupport",
    label: "dependentSupport",
    icon: cilBriefcase,
    moduleKey: "dependentSupport",
    permission: "dependentSupport.view",
  },
];

const ApprovalsHub = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const available = TABS.filter((tab) => can(tab.permission));
  const [activeKey, setActiveKey] = useState(available[0]?.key || "");
  const activeTab = available.find((t) => t.key === activeKey) || available[0];

  if (available.length === 0) {
    return (
      <div className="bg-light min-vh-100 p-4">
        <div className="card shadow-sm rounded-4 p-4 bg-white">
          <p className="text-muted mb-0">Unauthorized</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 p-2 p-md-3">
      <CRow className="mb-3">
        <CCol>
          <h2 className="fw-bold mb-1" style={{ color: "#1a7f37" }}>
            {t("approvalsHub")}
          </h2>
          <div className="text-muted">{t("nav_approvals")}</div>
        </CCol>
      </CRow>

      <div
        className="d-flex flex-wrap gap-2 bg-white rounded-4 shadow-sm p-2 mb-3"
        role="tablist"
      >
        {available.map((tab) => (
          <CButton
            key={tab.key}
            color="light"
            className="rounded-pill border-0 d-flex align-items-center gap-1"
            onClick={() => setActiveKey(tab.key)}
            style={{
              background:
                activeTab?.key === tab.key
                  ? "linear-gradient(90deg,#1a7f37,#43e97b)"
                  : "#f4f4f4",
              color: activeTab?.key === tab.key ? "#fff" : "#444",
            }}
          >
            <CIcon icon={tab.icon} size="sm" />
            <span>{t(tab.label)}</span>
          </CButton>
        ))}
      </div>

      {activeTab && <AdminModulePage key={activeTab.key} moduleKey={activeTab.moduleKey} />}
    </div>
  );
};

export default ApprovalsHub;