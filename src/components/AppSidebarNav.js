import React from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

import { CBadge, CNavLink, CSidebarNav } from "@coreui/react";

export const AppSidebarNav = ({ items }) => {
  const { t } = useTranslation();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const navLink = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon && (
          <span className="me-3" style={{ fontSize: 22 }}>
            {icon}
          </span>
        )}
        {indent && !icon && (
          <span className="nav-icon">
            <span className="nav-icon-bullet"></span>
          </span>
        )}
        {!unfoldable && (
          <span className="fw-semibold sidebar-nav-label">{t(name)}</span>
        )}
        {badge && !unfoldable && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
      </>
    );
  };

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, ...rest } = item;
    const Component = component;
    return (
      <Component as="div" key={index} className="sidebar-nav-item">
        {rest.to || rest.href ? (
          <CNavLink
            {...(rest.to && { as: NavLink })}
            {...rest}
            {...(indent ? { end: true } : {})}
            className="sidebar-nav-link px-4 py-3 my-1 rounded-3 fw-medium d-flex align-items-center gap-2"
          >
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    );
  };

  const navGroup = (item, index) => {
    const { component, name, icon, items, to, ...rest } = item;
    const Component = component;
    return (
      <Component
        compact
        as="div"
        key={index}
        toggler={navLink(name, icon)}
        {...rest}
      >
        {item.items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index, true)
        )}
      </Component>
    );
  };

  return (
    <CSidebarNav as={SimpleBar} className="sidebar-nav-modern py-3">
      {items &&
        items.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index)
        )}
    </CSidebarNav>
  );
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
