import {
  CCol,
  CFormInput,
  CRow,
} from "@coreui/react";
import PropTypes from "prop-types";
import CIcon from "@coreui/icons-react";
import { cilSearch } from "@coreui/icons";

const PageHeader = ({
  title,
  subtitle,
  searchPlaceholder = "Tìm kiếm...",
  searchKeyword,
  onSearch,
  actions,
}) => {
  return (
    <CRow className="mb-4 align-items-center justify-content-between g-3">
      <CCol md={searchKeyword !== undefined ? 6 : "auto"}>
        <h2 className="fw-bold mb-0" style={{ color: "#1a7f37" }}>
          {title}
        </h2>
        {subtitle && (
          <div className="text-body-secondary small mt-1">{subtitle}</div>
        )}
      </CCol>
      {searchKeyword !== undefined && (
        <CCol md={4}>
          <div className="position-relative">
            <CIcon
              icon={cilSearch}
              size="lg"
              className="text-body-tertiary position-absolute top-50 translate-middle-y"
              style={{ left: 14 }}
            />
            <CFormInput
              className="ps-5 rounded-3"
              placeholder={searchPlaceholder}
              value={searchKeyword}
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>
        </CCol>
      )}
      {actions && <CCol md="auto">{actions}</CCol>}
    </CRow>
  );
};

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  searchPlaceholder: PropTypes.string,
  searchKeyword: PropTypes.string,
  onSearch: PropTypes.func,
  actions: PropTypes.node,
};

export default PageHeader;