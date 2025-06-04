import React from "react";
import { useTranslation } from "react-i18next";

const OvertimeRequest = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-light min-vh-100 p-4">
      <h2 className="fw-bold mb-3" style={{ color: "#1a7f37" }}>
        {t("overtimeRequest")}
      </h2>
      <div className="card shadow-sm rounded-4 p-4 bg-white">
        <p className="text-muted">{t("overtimeRequest")} - Coming soon...</p>
      </div>
    </div>
  );
};
export default OvertimeRequest;
