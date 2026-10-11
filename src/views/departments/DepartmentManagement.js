import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CCard,
  CCardBody,
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
} from "@coreui/react";
import { adminRequest } from "../../api/adminClient";
import { CREATE, DEPARTMENT, GET_ALL, GET_BY_ID } from "../../constants";
import { PermissionGuard } from "../../permissions/PermissionGuard";
import PageHeader from "../../components/ui/PageHeader";

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
  const [detail, setDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchDepartments = () => {
    setLoading(true);
    adminRequest({ method: "get", path: `${DEPARTMENT}${GET_ALL}` })
      .then((data) => {
        setDepartments(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openDetail = async (department) => {
    setDetail(department);
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const data = await adminRequest({
        method: "post",
        path: `${DEPARTMENT}${GET_BY_ID}`,
        data: { id: department.id },
      });
      setDetail(data || department);
    } catch {
      setDetail(department);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 p-4">
      <PageHeader
        title={t("departments")}
        subtitle={t("departmentManagementDescription") || ""}
        actions={
          <PermissionGuard permission="departments.create">
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
          </PermissionGuard>
        }
      />
      <CCard className="shadow-sm rounded-4">
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
              if (!form.name) {
                setError(t("requiredFields"));
                setCreating(false);
                return;
              }
              try {
                await adminRequest({
                  method: "post",
                  path: `${DEPARTMENT}${CREATE}`,
                  data: { name: form.name },
                });
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
        <CModal
          visible={showDetail}
          onClose={() => setShowDetail(false)}
          size="md"
        >
          <CModalHeader>
            {detail?.name || t("view")} {detailLoading && <CSpinner size="sm" className="ms-2" />}
          </CModalHeader>
          <CModalBody>
            {detail ? (
              <div className="d-flex flex-column gap-2">
                <div>
                  <span className="fw-semibold text-body-secondary me-2">{t("code") || "Mã"}:</span>
                  {detail.code || detail.department_code || "-"}
                </div>
                <div>
                  <span className="fw-semibold text-body-secondary me-2">{t("name")}:</span>
                  {detail.name || "-"}
                </div>
                <div>
                  <span className="fw-semibold text-body-secondary me-2">{t("description")}:</span>
                  {detail.description || "-"}
                </div>
                <div>
                  <span className="fw-semibold text-body-secondary me-2">{t("status")}:</span>
                  <CBadge color={detail.is_active ? "success" : "secondary"}>
                    {detail.is_active ? t("active") : t("inactive")}
                  </CBadge>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <CSpinner color="primary" />
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDetail(false)}>
              {t("close") || t("cancel")}
            </CButton>
          </CModalFooter>
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
                          onClick={() => openDetail(d)}
                        >
                          {t("view")}
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
