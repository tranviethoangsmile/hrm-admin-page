import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSwitch,
  CRow,
  CCol,
  CFormSelect,
} from "@coreui/react";

const DepartmentManagement = () => {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });
  const [error, setError] = useState("");
  const userData = JSON.parse(sessionStorage.getItem("userIF")) || {};

  const fetchDepartments = () => {
    setLoading(true);
    axios
      .get("http://54.200.248.63:80/api/version/v1/department/getall")
      .then((res) => {
        setDepartments(res.data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="bg-light min-vh-100 p-4">
      <h2 className="fw-bold mb-3" style={{ color: "#1a7f37" }}>
        {t("departments")}
      </h2>
      <CCard className="shadow-sm rounded-4">
        <CCardHeader className="bg-white border-0 px-4 py-4 rounded-top-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <h5 className="fw-bold mb-0">{t("departments")}</h5>
            {userData.role === "ADMIN" && (
              <>
                <CButton
                  color="success"
                  className="fw-bold px-4 py-2 rounded-3 me-2"
                  onClick={() => {
                    setShowCreate(true);
                    setForm({
                      name: "",
                      code: "",
                      description: "",
                      is_active: true,
                    });
                    setError("");
                  }}
                >
                  + {t("addDepartment") || "Tạo phòng ban"}
                </CButton>
              </>
            )}
          </div>
        </CCardHeader>
        <CModal
          visible={showCreate}
          onClose={() => setShowCreate(false)}
          size="md"
          backdrop="static"
        >
          <CModalHeader>{t("addDepartment") || "Tạo phòng ban"}</CModalHeader>
          <CForm
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setCreating(true);
              if (!form.name || !form.code) {
                setError(t("requiredFields"));
                setCreating(false);
                return;
              }
              try {
                await axios.post(
                  "http://54.200.248.63:80/api/version/v1/department",
                  form
                );
                setShowCreate(false);
                fetchDepartments();
              } catch (e) {
                setError(
                  t("createDepartmentFailed") || "Tạo phòng ban thất bại"
                );
              }
              setCreating(false);
            }}
          >
            <CModalBody>
              {error && <div className="text-danger mb-2">{error}</div>}
              <CRow className="g-3">
                <CCol md={12}>
                  <CFormLabel>{t("name")}</CFormLabel>
                  <CFormInput
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </CCol>
                <CCol md={12}>
                  <CFormLabel>{t("code") || "Mã"}</CFormLabel>
                  <CFormInput
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
                    required
                  />
                </CCol>
                <CCol md={12}>
                  <CFormLabel>{t("description")}</CFormLabel>
                  <CFormInput
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </CCol>
                <CCol md={12}>
                  <CFormLabel>{t("status")}</CFormLabel>
                  <CFormSwitch
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_active: e.target.checked }))
                    }
                    label={form.is_active ? t("active") : t("inactive")}
                  />
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowCreate(false)}>
                {t("cancel")}
              </CButton>
              <CButton color="success" type="submit" disabled={creating}>
                {creating
                  ? t("creating")
                  : t("addDepartment") || "Tạo phòng ban"}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>
        <CCardBody className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="success" />
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-5 text-body-secondary">
              {t("noData")}
            </div>
          ) : (
            <div className="table-responsive">
              <CTable
                hover
                align="middle"
                className="mb-0"
                style={{ minWidth: 700 }}
              >
                <CTableHead className="bg-body-tertiary">
                  <CTableRow style={{ height: 60 }}>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t("name")}</CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      {t("code") || "Mã"}
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      {t("description")}
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      {t("status")}
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-center">
                      {t("actions")}
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {departments.map((d, idx) => (
                    <CTableRow key={d.id || idx}>
                      <CTableDataCell>{idx + 1}</CTableDataCell>
                      <CTableDataCell>{d.name}</CTableDataCell>
                      <CTableDataCell>
                        {d.code || d.department_code}
                      </CTableDataCell>
                      <CTableDataCell>{d.description}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={d.is_active ? "success" : "secondary"}>
                          {d.is_active ? t("active") : t("inactive")}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          color="success"
                          variant="outline"
                          size="sm"
                          className="fw-semibold px-3 py-1 me-2"
                        >
                          {t("view")}
                        </CButton>
                        <CButton
                          color="primary"
                          variant="outline"
                          size="sm"
                          className="fw-semibold px-3 py-1 me-2"
                        >
                          {t("update")}
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          className="fw-semibold px-3 py-1"
                        >
                          {t("delete")}
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};
export default DepartmentManagement;
