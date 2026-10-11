import { useEffect, useState } from "react";
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import PropTypes from "prop-types";
import { cilAccountLogout, cilLockLocked, cilSettings, cilUser } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import avatar from "../../../src/assets/images/avatars/avatar-empty.png";

const AppHeaderDropdown = ({ user }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [avata, setAvata] = useState("");

  useEffect(() => {
    setAvata(user?.avatar);
  }, [user]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle
        placement="bottom-end"
        className="modern-avatar-toggle py-0 pe-0"
        caret={false}
      >
        <CAvatar src={avata || avatar} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="modern-dropdown" placement="bottom-end">
        <CDropdownHeader className="modern-dropdown__header border-0">
          <span className="modern-dropdown__title">{user?.name || "Account"}</span>
          <span className="modern-dropdown__subtitle">
            {user?.role || "Administrator"} {user?.position ? `• ${user.position}` : ""}
          </span>
        </CDropdownHeader>
        <CDropdownItem onClick={() => navigate("/employees")}>
          <CIcon icon={cilUser} className="me-2" />
          {t("dropdown.profile") || "View profile"}
        </CDropdownItem>
        <CDropdownItem onClick={() => navigate("/settings")}>
          <CIcon icon={cilSettings} className="me-2" />
          {t("dropdown.settings") || "Workspace settings"}
        </CDropdownItem>
        <CDropdownItem onClick={() => navigate("/audit-logs")}>
          <CIcon icon={cilLockLocked} className="me-2" />
          {t("dropdown.security") || "Security access"}
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout} style={{ color: "#b33939" }}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          {t("dropdown.logout") || "Logout"}
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

AppHeaderDropdown.propTypes = {
  user: PropTypes.object,
};

export default AppHeaderDropdown;