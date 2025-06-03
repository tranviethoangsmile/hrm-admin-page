import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  CAlert,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser } from "@coreui/icons";
import logo from "../../../../public/logo-metal.png";
import {
  BASE_URL,
  V1,
  VERSION,
  LOGIN_URL,
  API,
  PORT,
} from "../../../constants";
import axios from "axios";
import { useTranslation } from "react-i18next";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user_name, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [badUserName, setBadUserName] = useState("");
  const [badPassword, setBadPassword] = useState("");
  const [visibleAlert, setVisibleAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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
    if (validate()) {
      try {
        const respone = await axios.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${LOGIN_URL}`,
          {
            user_name,
            password,
          }
        );
        if (!respone?.data?.success) {
          setVisibleAlert(true);
          setAlertMessage(respone?.data?.message);
        } else {
          sessionStorage.setItem("isLoggedIn", true);
          sessionStorage.setItem("token", respone?.data?.token);
          sessionStorage.setItem("userIF", JSON.stringify(respone?.data?.data));
          navigate("/dashboard");
        }
      } catch (error) {
        setVisibleAlert(true);
        setAlertMessage("Đăng nhập thất bại. Vui lòng thử lại!");
      }
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5} sm={12}>
            <CCard className="shadow-lg border-0 rounded-4 p-4">
              <CCardBody>
                <div className="text-center mb-4">
                  <img
                    src={logo}
                    alt="Logo"
                    style={{ width: 80, marginBottom: 16 }}
                  />
                  <h2
                    className="fw-bold mt-2 mb-1"
                    style={{ color: "#1a7f37" }}
                  >
                    {t("HRM Metal")}
                  </h2>
                  <div className="text-muted mb-2">{t("loginSubtitle")}</div>
                </div>
                <CAlert
                  color="danger"
                  dismissible
                  visible={visibleAlert}
                  onClose={() => setVisibleAlert(false)}
                  className="py-2"
                >
                  {alertMessage}
                </CAlert>
                <CForm onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      {t("login.usernameLabel")}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <CIcon icon={cilUser} />
                      </span>
                      <CFormInput
                        placeholder={t("login.usernamePlaceholder")}
                        autoComplete="username"
                        value={user_name}
                        onChange={(e) => setUserName(e.target.value)}
                        className={badUserName ? "is-invalid" : ""}
                      />
                      {badUserName && (
                        <div className="invalid-feedback">{badUserName}</div>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      {t("login.passwordLabel")}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <CIcon icon={cilLockLocked} />
                      </span>
                      <CFormInput
                        type="password"
                        placeholder={t("login.passwordPlaceholder")}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={badPassword ? "is-invalid" : ""}
                      />
                      {badPassword && (
                        <div className="invalid-feedback">{badPassword}</div>
                      )}
                    </div>
                  </div>
                  <div className="d-grid mt-4">
                    <CButton
                      color="success"
                      size="lg"
                      type="submit"
                      className="rounded-pill fw-bold shadow-sm"
                    >
                      {t("login.loginBtn")}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
