import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CButton, CButtonGroup } from "@coreui/react";
import { useTranslation } from "react-i18next";

const FontSizeSettings = () => {
  const { t } = useTranslation();
  const FONT_SIZES = [
    { label: t("fontSmall"), value: "font-small" },
    { label: t("fontMedium"), value: "font-medium" },
    { label: t("fontLarge"), value: "font-large" },
  ];
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("fontSize") || "font-medium"
  );

  useEffect(() => {
    document.body.classList.remove("font-small", "font-medium", "font-large");
    document.body.classList.add(fontSize);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const handleChange = (dir) => {
    const idx = FONT_SIZES.findIndex((f) => f.value === fontSize);
    if (dir === "inc" && idx < FONT_SIZES.length - 1)
      setFontSize(FONT_SIZES[idx + 1].value);
    if (dir === "dec" && idx > 0) setFontSize(FONT_SIZES[idx - 1].value);
  };

  return (
    <div className="bg-light min-vh-100 p-4">
      <h2 className="fw-bold mb-3" style={{ color: "#1a7f37" }}>
        {t("fontSize")}
      </h2>
      <CCard className="shadow-sm rounded-4 p-4 bg-white">
        <CCardBody>
          <div className="d-flex align-items-center gap-3 mb-3">
            <CButton
              color="primary"
              variant="outline"
              onClick={() => handleChange("dec")}
              disabled={fontSize === "font-small"}
            >
              {t("fontSizeDecrease")}
            </CButton>
            <span className="fw-bold fs-5">
              {FONT_SIZES.find((f) => f.value === fontSize)?.label}
            </span>
            <CButton
              color="primary"
              variant="outline"
              onClick={() => handleChange("inc")}
              disabled={fontSize === "font-large"}
            >
              {t("fontSizeIncrease")}
            </CButton>
          </div>
          <CButtonGroup>
            {FONT_SIZES.map((f) => (
              <CButton
                key={f.value}
                color={fontSize === f.value ? "success" : "secondary"}
                variant={fontSize === f.value ? "" : "outline"}
                onClick={() => setFontSize(f.value)}
              >
                {f.label}
              </CButton>
            ))}
          </CButtonGroup>
        </CCardBody>
      </CCard>
    </div>
  );
};
export default FontSizeSettings;
