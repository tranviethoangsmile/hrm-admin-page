import React from "react";
import { useTranslation } from "react-i18next";
import { CAlert, CButton } from "@coreui/react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
      <CAlert
        color="danger"
        className="shadow-lg rounded-4 p-4 text-center w-auto"
      >
        <h2 className="fw-bold mb-3">{t("unauthorized")}</h2>
        <CButton
          color="primary"
          className="mt-2 px-4 rounded-pill"
          onClick={() => navigate("/login")}
        >
          Login
        </CButton>
      </CAlert>
    </div>
  );
};
export default Unauthorized;
