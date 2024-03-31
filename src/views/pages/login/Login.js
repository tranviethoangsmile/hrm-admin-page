import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser } from "@coreui/icons";
import {
  BASE_URL,
  V1,
  VERSION,
  LOGIN_URL,
  API,
  PORT,
} from "../../../constants";

const Login = () => {
  const navigate = useNavigate();
  const [user_name, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [badUserName, setBadUserName] = useState("");
  const [badPassword, setBadPassword] = useState("");
  const [visibleAlert, setVisibleAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const validate = () => {
    let isValid = true;

    if (user_name === "") {
      setBadUserName("Please input username");
      isValid = false;
    } else if (user_name.length < 5) {
      setBadUserName("Please enter a username with at least 5 characters");
      isValid = false;
    } else {
      setBadUserName("");
    }

    if (password === "") {
      setBadPassword("Please input password");
      isValid = false;
    } else if (password.length < 6) {
      setBadPassword("Please enter a password with at least 6 characters");
      isValid = false;
    } else {
      setBadPassword("");
    }

    return isValid;
  };

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, []);

  const handleLogin = async () => {
    const user = {
      user_name: user_name,
      password: password,
    };
    if (validate()) {
      try {
        const respone = await axios.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${LOGIN_URL}`,
          {
            ...user,
          }
        );
        console.log(respone);
        if (!respone?.data?.success) {
          setVisibleAlert(!visibleAlert);
          setAlertMessage(respone?.data?.message);
        } else {
          sessionStorage.setItem("isLoggedIn", true);
          console.log(respone?.data?.data);
          navigate("/dashboard");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CAlert
          className="d-flex align-items-center"
          color="danger"
          dismissible
          visible={visibleAlert}
          onClose={() => setVisibleAlert(false)}
        >
          <svg
            className="flex-shrink-0 me-2"
            width="24"
            height="24"
            viewBox="0 0 512 512"
          >
            <rect
              width="32"
              height="176"
              x="240"
              y="176"
              fill="var(--ci-primary-color, currentColor)"
              className="ci-primary"
            ></rect>
            <rect
              width="32"
              height="32"
              x="240"
              y="384"
              fill="var(--ci-primary-color, currentColor)"
              className="ci-primary"
            ></rect>
            <path
              fill="var(--ci-primary-color, currentColor)"
              d="M274.014,16H237.986L16,445.174V496H496V445.174ZM464,464H48V452.959L256,50.826,464,452.959Z"
              className="ci-primary"
            ></path>
          </svg>
          {alertMessage}
        </CAlert>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1>Login</h1>
                    <p className="text-body-secondary">
                      Sign In to Admin account
                    </p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={user_name}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                      {badUserName !== "" && (
                        <span className="text-danger">{badUserName}</span>
                      )}
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                      />
                      {badPassword !== "" && (
                        <span className="text-danger">{badPassword}</span>
                      )}
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          color="primary"
                          className="px-4"
                          onClick={handleLogin}
                        >
                          Login
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard
                className="text-white bg-primary py-5"
                style={{ width: "44%" }}
              >
                <CCardBody className="text-center">
                  <div>
                    <h2>WELCOME</h2>
                    <p>
                      Welcome to the smart business management system. This
                      product is developed by Hoangdev.
                    </p>
                    <Link to="/">
                      <CButton
                        color="primary"
                        className="mt-3"
                        active
                        tabIndex={-1}
                      >
                        Contact
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
