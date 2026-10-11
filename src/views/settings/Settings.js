import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCol,
  CFormSelect,
  CFormSwitch,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilGlobeAlt, cilMoon, cilText } from "@coreui/icons";

const LANGUAGES = [
  { value: "en", key: "en" },
  { value: "vi", key: "vi" },
  { value: "jp", key: "jp" },
  { value: "pt", key: "pt" },
];

const FONT_SIZES = [
  { labelKey: "fontSmall", value: "font-small" },
  { labelKey: "fontMedium", value: "font-medium" },
  { labelKey: "fontLarge", value: "font-large" },
];

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("fontSize") || "font-medium"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.remove("font-small", "font-medium", "font-large");
    document.body.classList.add(fontSize);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const handleChangeLanguage = (value) => {
    i18n.changeLanguage(value);
    localStorage.setItem("i18nextLng", value);
  };

  return (
    <div className="bg-light min-vh-100 p-3 p-md-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: "#1a7f37" }}>
          {t("settings")}
        </h2>
        <div className="text-body-secondary small">
          {t("settingsSubtitle") || "Tùy chỉnh giao diện và ngôn ngữ hệ thống."}
        </div>
      </div>

      <CRow className="g-4">
        <CCol md={6} lg={4}>
          <CCard className="shadow-sm border-0 rounded-4 h-100">
            <CCardBody className="p-4">
              <div className="d-flex align-items-center gap-2 mb-1">
                <CIcon icon={cilGlobeAlt} size="lg" style={{ color: "#1a7f37" }} />
                <h5 className="fw-bold mb-0">
                  {t("language") || "Ngôn ngữ"}
                </h5>
              </div>
              <p className="text-body-secondary small">
                {t("languageHint") || "Chọn ngôn ngữ hiển thị giao diện."}
              </p>
              <CFormSelect
                value={i18n.language}
                onChange={(e) => handleChangeLanguage(e.target.value)}
                aria-label="Language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {t(lang.key)}
                  </option>
                ))}
              </CFormSelect>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6} lg={4}>
          <CCard className="shadow-sm border-0 rounded-4 h-100">
            <CCardBody className="p-4">
              <div className="d-flex align-items-center gap-2 mb-1">
                <CIcon icon={cilMoon} size="lg" style={{ color: "#1a7f37" }} />
                <h5 className="fw-bold mb-0">{t("darkMode")}</h5>
              </div>
              <p className="text-body-secondary small">
                {t("darkModeHint") || "Bật chế độ tối cho giao diện."}
              </p>
              <CFormSwitch
                id="settingsDarkMode"
                label={darkMode ? t("darkModeOn") : t("darkModeOff")}
                checked={darkMode}
                onChange={() => setDarkMode((v) => !v)}
                size="lg"
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6} lg={4}>
          <CCard className="shadow-sm border-0 rounded-4 h-100">
            <CCardBody className="p-4">
              <div className="d-flex align-items-center gap-2 mb-1">
                <CIcon icon={cilText} size="lg" style={{ color: "#1a7f37" }} />
                <h5 className="fw-bold mb-0">{t("fontSize")}</h5>
              </div>
              <p className="text-body-secondary small">
                {t("fontSizeHint") || "Điều chỉnh cỡ chữ giao diện."}
              </p>
              <CButtonGroup className="w-100">
                {FONT_SIZES.map((f) => (
                  <CButton
                    key={f.value}
                    color={fontSize === f.value ? "success" : "secondary"}
                    variant={fontSize === f.value ? "" : "outline"}
                    onClick={() => setFontSize(f.value)}
                  >
                    {t(f.labelKey)}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default Settings;