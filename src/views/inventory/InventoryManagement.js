import React from "react";
import { useTranslation } from "react-i18next";

const InventoryManagement = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-light min-vh-100 p-4">
      <h2 className="fw-bold mb-3" style={{ color: "#1a7f37" }}>
        {t("inventory")}
      </h2>
      <div className="card shadow-sm rounded-4 p-4 bg-white">
        <p className="text-muted">{t("inventory")} - Coming soon...</p>
      </div>
    </div>
  );
};
export default InventoryManagement;
