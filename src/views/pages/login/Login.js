import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CAlert,
  CButton,
  CForm,
  CFormInput,
  CSpinner,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilChartPie,
  cilFingerprint,
  cilGlobeAlt,
  cilLockLocked,
  cilShieldAlt,
  cilUser,
} from "@coreui/icons";
import axios from "axios";
import { useTranslation } from "react-i18next";

import logo from "../../../../public/logo-metal.png";
import { buildApiUrl, LOGIN_URL, LOGIN_WEB } from "../../../constants";

const LOGIN_ENDPOINT = buildApiUrl(LOGIN_URL, LOGIN_WEB);

const HIGHLIGHTS = [
  {
    icon: cilChartPie,
    titleKey: "login.highlightLive.title",
    textKey: "login.highlightLive.text",
  },
  {
    icon: cilShieldAlt,
    titleKey: "login.highlightFloor.title",
    textKey: "login.highlightFloor.text",
  },
  {
    icon: cilFingerprint,
    titleKey: "login.highlightRoles.title",
    textKey: "login.highlightRoles.text",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user_name, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [badUserName, setBadUserName] = useState("");
  const [badPassword, setBadPassword] = useState("");
  const [visibleAlert, setVisibleAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const validate = () => {
    let isValid = true;

    if (user_name === "") {
      setBadUserName(t("login.usernameRequired"));
      isValid = false;
    } else if (user_name.length < 5) {
      setBadUserName(t("login.usernameMinLength"));
      isValid = false;
    } else {
      setBadUserName("");
    }

    if (password === "") {
      setBadPassword(t("login.passwordRequired"));
      isValid = false;
    } else if (password.length < 6) {
      setBadPassword(t("login.passwordMinLength"));
      isValid = false;
    } else {
      setBadPassword("");
    }

    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const respone = await axios.post(LOGIN_ENDPOINT, {
        user_name,
        password,
      });

      if (!respone?.data?.success) {
        setVisibleAlert(true);
        setAlertMessage(respone?.data?.message);
        return;
      }

      sessionStorage.setItem("isLoggedIn", true);
      sessionStorage.setItem("token", respone?.data?.token);
      sessionStorage.setItem("userIF", JSON.stringify(respone?.data?.data));
      sessionStorage.setItem("currentUser", JSON.stringify(respone?.data?.data));
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setVisibleAlert(true);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("loginFailed");
      setAlertMessage(`${t("loginFailed")} (${message})`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem("i18nextLng", e.target.value);
  };

  return (
    <div className="hrm-login">
      <div className="hrm-login__toolbar">
        <div className="hrm-login__chip">
          <CIcon icon={cilGlobeAlt} />
          <select
            className="hrm-login__lang-select"
            value={i18n.language}
            onChange={handleChangeLanguage}
            aria-label="Language"
          >
            <option value="en">{t("en")}</option>
            <option value="vi">{t("vi")}</option>
            <option value="jp">{t("jp")}</option>
            <option value="pt">{t("pt")}</option>
          </select>
        </div>
        <button
          type="button"
          className="hrm-login__chip hrm-login__theme-toggle"
          onClick={() => setDarkMode((value) => !value)}
        >
          <span className={`hrm-login__theme-dot${darkMode ? " hrm-login__theme-dot--active" : ""}`} />
          {darkMode ? t("darkModeOn") : t("darkModeOff")}
        </button>
      </div>

      <div className="hrm-login__shell">
        <aside className="hrm-login__brand">
          <div className="hrm-login__brand-glow" />
          <div className="hrm-login__brand-content">
            <div className="hrm-login__brand-top">
              <div className="hrm-login__logo">
                <img src={logo} alt="HRM Metal" />
              </div>
              <div>
                <strong>HRM Metal</strong>
                <span>Industrial people operations</span>
              </div>
            </div>

            <div className="hrm-login__headline">
              <span className="hrm-login__eyebrow">Secure access</span>
              <h1>Operate your workforce with clarity.</h1>
              <p>
                A sharper control room for attendance, schedules, people data
                and production support — designed to feel modern from the first
                screen.
              </p>
            </div>

            <div className="hrm-login__highlights">
              {HIGHLIGHTS.map((item) => (
                <div className="hrm-login__highlight" key={item.titleKey}>
                  <div className="hrm-login__highlight-icon">
                    <CIcon icon={item.icon} />
                  </div>
                  <div>
                    <strong>{t(item.titleKey)}</strong>
                    <span>{t(item.textKey)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hrm-login__brand-stats">
            <div>
              <strong>24/7</strong>
              <span>Shift tracking</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Languages</span>
            </div>
            <div>
              <strong>+09</strong>
              <span>Asia/Tokyo</span>
            </div>
          </div>
        </aside>

        <section className="hrm-login__panel">
          <span className="hrm-login__eyebrow hrm-login__eyebrow--panel">
            {t("login")} · HRM Metal
          </span>
          <h2 className="hrm-login__title">{t("login.loginBtn")}</h2>
          <p className="hrm-login__subtitle">{t("loginSubtitle")}</p>

          <CAlert
            color="danger"
            dismissible
            visible={visibleAlert}
            onClose={() => setVisibleAlert(false)}
            className="hrm-login__alert"
          >
            {alertMessage}
          </CAlert>

          <CForm onSubmit={handleLogin} noValidate>
            <div className="hrm-login__field">
              <label className="hrm-login__label">{t("login.usernameLabel")}</label>
              <div className={`hrm-login__input${badUserName ? " hrm-login__input--invalid" : ""}`}>
                <CIcon icon={cilUser} />
                <CFormInput
                  placeholder={t("login.usernamePlaceholder")}
                  autoComplete="username"
                  value={user_name}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              {badUserName && (
                <span className="hrm-login__error">{badUserName}</span>
              )}
            </div>

            <div className="hrm-login__field">
              <label className="hrm-login__label">{t("login.passwordLabel")}</label>
              <div className={`hrm-login__input${badPassword ? " hrm-login__input--invalid" : ""}`}>
                <CIcon icon={cilLockLocked} />
                <CFormInput
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {badPassword && (
                <span className="hrm-login__error">{badPassword}</span>
              )}
            </div>

            <CButton
              color="success"
              size="lg"
              type="submit"
              disabled={loading}
              className="hrm-login__submit"
            >
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  {t("login.signingIn")}
                </>
              ) : (
                t("login.loginBtn")
              )}
            </CButton>
          </CForm>

          <div className="hrm-login__footer">
            <span>API</span>
            <code>{LOGIN_ENDPOINT}</code>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
