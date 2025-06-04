import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CFormSwitch } from "@coreui/react";
import { useTranslation } from "react-i18next";

const DarkModeSettings = () => {
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className="bg-light min-vh-100 p-4">
      <h2 className="fw-bold mb-3" style={{ color: "#1a7f37" }}>
        {t("darkMode")}
      </h2>
      <CCard className="shadow-sm rounded-4 p-4 bg-white">
        <CCardBody>
          <div className="d-flex align-items-center gap-3">
            <CFormSwitch
              id="darkModeSwitch"
              label={darkMode ? t("darkModeOn") : t("darkModeOff")}
              checked={darkMode}
              onChange={() => setDarkMode((v) => !v)}
              size="lg"
            />
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};
export default DarkModeSettings;
