import React, { Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import { CSpinner, useColorModes } from "@coreui/react";
import "./scss/style.scss";
import Dashboard from "./views/dashboard/Dashboard";

// Containers
const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout"));

// Pages
const Login = React.lazy(() => import("./views/pages/login/Login"));
const Checkin = React.lazy(() => import("./views/pages/checkin/Checkin"));
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isColorModeSet, setColorMode } = useColorModes(
    "coreui-free-react-admin-template-theme"
  );
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split("?")[1]);
    const theme =
      urlParams.get("theme") &&
      urlParams.get("theme").match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    } else if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
    setIsLoggedIn(sessionStorage.getItem("isLoggedIn"));
  }, [storedTheme, isColorModeSet, setColorMode]);

  return (
    <Router>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/" element={<Navigate to="/login" />} />
          <Route exact path="/login" name="Login Page" element={<Login />} />
          {/* <Route
            exact
            path="/dashboard"
            name="Dashboard"
            element={<Dashboard />}
          /> */}
          <Route
            exact
            path="/checkin"
            name="Checkin Page"
            element={<Checkin />}
          />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route
            path="*"
            element={isLoggedIn ? <DefaultLayout /> : <Navigate to="/login" />}
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
