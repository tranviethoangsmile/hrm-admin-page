import { useMemo } from "react";
import { canRole, hasRolePermission, ROLES } from "../permissions/permissions";

export const getRoleOf = (user) =>
  user?.role ||
  (typeof user?.is_admin === "boolean" && user.is_admin ? ROLES.ADMIN : undefined) ||
  ROLES.STAFF;

/**
 * React hook — lấy user hiện tại từ sessionStorage và kiểm tra permission.
 * Hook phải được gọi trong component (không gọi trong module-level _nav).
 */
export const usePermissions = () => {
  const user = useMemo(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("currentUser")) ||
        JSON.parse(sessionStorage.getItem("userIF")) ||
        {}
      );
    } catch {
      return {};
    }
  }, []);

  const role = useMemo(() => getRoleOf(user), [user]);
  const permissions = useMemo(() => hasRolePermission(role), [role]);

  const can = useMemo(
    () => (permission) => canRole(role, permission),
    [role]
  );

  const canAny = useMemo(
    () => (permissionsList) =>
      (Array.isArray(permissionsList) ? permissionsList : [permissionsList]).some(
        (permission) => canRole(role, permission)
      ),
    [role]
  );

  return { user, role, permissions, can, canAny };
};

export default usePermissions;