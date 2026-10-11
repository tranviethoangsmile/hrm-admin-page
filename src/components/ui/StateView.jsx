import {
  CSpinner,
  CButton,
} from "@coreui/react";
import PropTypes from "prop-types";
import CIcon from "@coreui/icons-react";
import { cilSearch, cilInbox } from "@coreui/icons";

const StateView = ({ loading, error, empty, children }) => {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <CSpinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="text-danger fw-semibold mb-3">{error}</div>
        {children && <div>{children}</div>}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="text-center py-5">
        <div className="text-body-secondary">{empty}</div>
      </div>
    );
  }

  return null;
};

export const EmptyState = ({ icon = cilInbox, title = "", message = "" }) => (
  <div className="text-center py-5">
    <CIcon icon={icon} size="3xl" className="text-body-tertiary mb-3" />
    {title && <div className="fw-semibold text-body-secondary">{title}</div>}
    {message && (
      <div className="text-body-tertiary small mt-1">{message}</div>
    )}
  </div>
);

export const ErrorState = ({ message = "", onRetry }) => (
  <div className="text-center py-5">
    <CIcon icon={cilSearch} size="3xl" className="text-danger mb-3" />
    <div className="fw-semibold text-danger mb-3">{message}</div>
    {onRetry && (
      <CButton color="primary" size="sm" onClick={onRetry}>
        Thử lại
      </CButton>
    )}
  </div>
);

StateView.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.node,
  empty: PropTypes.node,
  children: PropTypes.node,
};

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node,
  message: PropTypes.node,
};

ErrorState.propTypes = {
  message: PropTypes.node,
  onRetry: PropTypes.func,
};

export default StateView;