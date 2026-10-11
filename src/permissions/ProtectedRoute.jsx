import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import Unauthorized from "../views/pages/Unauthorized";
import { ROLES } from "./permissions";

/**
 * Route-guard theo permission.
 *
 * <ProtectedRoute permission="payroll.view">
 *   <PayrollPage />
 * </ProtectedRoute>
 *
 * - Chưa login → redirect /login
 * - Thiếu permission → render <Unauthorized /> (403)
 * - Có permission → render children
 */
export const ProtectedRoute = ({ permission, roles, children }) => {
  const location = useLocation();
  const { role, can } = usePermissions();
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowedByRoles = !roles || roles.includes(role);
  const allowedByPermission = !permission || can(permission);
  const isAdmin = role === ROLES.ADMIN;

  if (isAdmin || (allowedByRoles && allowedByPermission)) {
    return children;
  }

  return <Unauthorized />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  permission: PropTypes.string,
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;