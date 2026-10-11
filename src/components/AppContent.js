import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { CContainer, CSpinner } from "@coreui/react";

// routes config
import routes from "../routes";
import { ProtectedRoute } from "../permissions/ProtectedRoute";

const AppContent = () => {
  return (
    <CContainer className="main-content-container" fluid>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            const page = <route.element {...(route.props || {})} />;
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={
                    route.permission ? (
                      <ProtectedRoute permission={route.permission}>{page}</ProtectedRoute>
                    ) : (
                      page
                    )
                  }
                />
              )
            );
          })}
        </Routes>
      </Suspense>
    </CContainer>
  );
};

export default React.memo(AppContent);
