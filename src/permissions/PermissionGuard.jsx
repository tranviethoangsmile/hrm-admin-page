import PropTypes from "prop-types";
import { usePermissions } from "../hooks/usePermissions";
import { ROLES } from "./permissions";

/**
 * Rendering-guard theo permission.
 * Nếu user thiếu permission → render fallback (mặc định null).
 *
 * <PermissionGuard permission="employee.create">
 *   <CreateEmployeeButton />
 * </PermissionGuard>
 */
export const PermissionGuard = ({ permission, fallback = null, children }) => {
  const { can, role } = usePermissions();
  if (role === ROLES.ADMIN) return children;
  if (can(permission)) return children;
  return fallback;
};

PermissionGuard.propTypes = {
  permission: PropTypes.string,
  fallback: PropTypes.node,
  children: PropTypes.node,
};

export default PermissionGuard;