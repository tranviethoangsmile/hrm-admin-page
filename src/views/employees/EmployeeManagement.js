import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CAvatar,
  CSpinner,
  CFormCheck,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
  CRow,
  CCol,
} from "@coreui/react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EmployeeManagement.css";
import CIcon from "@coreui/icons-react";
import {
  cilUser,
  cilUserFollow,
  cilUserUnfollow,
  cilUserPlus,
  cilTrash,
  cilPencil,
  cilCamera,
} from "@coreui/icons";
import UserCreateModal from "../departments/UserCreateModal";
import AppToast from "../../components/AppToast";
import {
  UPLOAD_AVATAR,
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  USER_URL,
} from "../../constants";

const statusBadge = (status, t) => {
  if (status === true || status === "active" || status === t("confirmed"))
    return (
      <CBadge
        color="success"
        className="px-3 py-2 fw-semibold"
        style={{
          fontSize: 15,
          background: "linear-gradient(90deg,#1a7f37,#43e97b)",
        }}
      >
        {t("confirmed")}
      </CBadge>
    );
  if (status === false || status === "inactive" || status === t("notConfirmed"))
    return (
      <CBadge
        color="danger"
        className="px-3 py-2 fw-semibold"
        style={{
          fontSize: 15,
          background: "linear-gradient(90deg,#e74c3c,#f9d423)",
        }}
      >
        {t("notConfirmed")}
      </CBadge>
    );
  return (
    <CBadge
      color="warning"
      className="px-3 py-2 fw-semibold"
      style={{
        fontSize: 15,
        background: "linear-gradient(90deg,#f9c846,#f7971e)",
      }}
    >
      {t("pending")}
    </CBadge>
  );
};

const EmployeeManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const ROLES = [
    { value: "STAFF", label: t("ROLE_STAFF") },
    { value: "LEADER", label: t("ROLE_LEADER") },
    { value: "SUPERVISOR", label: t("ROLE_SUPERVISOR") },
    { value: "MANAGER", label: t("ROLE_MANAGER") },
    { value: "ADMIN", label: t("ROLE_ADMIN") },
  ];
  const POSITIONS = [
    { value: "HINO", label: t("POSITION_HINO") },
    { value: "IZUMO", label: t("POSITION_IZUMO") },
    { value: "KYOTO", label: t("POSITION_KYOTO") },
    { value: "OSAKA", label: t("POSITION_OSAKA") },
    { value: "TOKYO", label: t("POSITION_TOKYO") },
    { value: "COMPORATION", label: t("POSITION_COMPORATION") },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}`
        );
        setUsers(res.data?.data || []);
      } catch (e) {
        setUsers([]);
      }
      setLoading(false);
    };
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}/department/getall`
        );
        setDepartments(res.data?.data || []);
      } catch (e) {
        setDepartments([]);
      }
    };
    fetchUsers();
    fetchDepartments();
  }, []);

  const getDepartmentName = (id) => {
    const found = departments.find((d) => d.id === id);
    return found ? found.name : id || "";
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setForm({ ...user, department_id: String(user.department_id || "") });
    setEditing(false);
    setError("");
  };

  const handleEdit = () => {
    let depId = selectedUser.department_id;
    if (!departments.some((dep) => String(dep.id) === depId)) {
      depId = departments.length > 0 ? String(departments[0].id) : "";
    }
    setEditing(true);
    setForm({ ...selectedUser, department_id: depId });
    setError("");
    setShowEditModal(true);
  };

  const handleCancelEditModal = () => {
    setShowEditModal(false);
    setEditing(false);
    setForm(selectedUser);
    setError("");
  };

  const handleSaveEditModal = async () => {
    setError("");
    const requiredFields = [
      "id",
      "name",
      "email",
      "phone",
      "user_name",
      "dob",
      "employee_id",
      "department_id",
      "salary_hourly",
      "travel_allowance_pay",
      "shift_night_pay",
      "paid_days",
      "role",
      "position",
      "begin_date",
    ];
    for (const field of requiredFields) {
      if (!form[field]) {
        setError(t("requiredFields") + `: ${t(field)}`);
        setToast({
          visible: true,
          message: t("requiredFields") + `: ${t(field)}`,
          type: "error",
        });
        return;
      }
    }
    try {
      const { avatar, department, ...formData } = form;
      const res = await axios.put(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res.data.success) {
        setError(res.data.message || t("updateUserFailed"));
        setToast({
          visible: true,
          message: res.data.message || t("updateUserFailed"),
          type: "error",
        });
        return;
      }
      const usersRes = await axios.get(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}`
      );
      setUsers(usersRes.data?.data || []);
      const found = (usersRes.data?.data || []).find((u) => u.id === form.id);
      if (found) {
        setSelectedUser(found);
        setForm({ ...found, department_id: String(found.department_id || "") });
        setEditing(false);
        setError("");
      }
      setShowEditModal(false);
      setToast({
        visible: true,
        message: t("updateUserSuccess"),
        type: "success",
      });
    } catch (e) {
      setError(e?.response?.data?.message || t("updateUserFailed"));
      setToast({
        visible: true,
        message: e?.response?.data?.message || t("updateUserFailed"),
        type: "error",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setShowDeleteModal(false);
    try {
      await axios.delete(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}/${selectedUser.id}`
      );
      setUsers((users) => users.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
      setForm(null);
      setEditing(false);
      setError("");
      setToast({
        visible: true,
        message: t("deleteUserSuccess") || t("user.create.toast.success"),
        type: "success",
      });
    } catch (e) {
      setError(t("deleteUserFailed") || "Delete user failed");
    }
  };

  const handleAvatarChange = async () => {
    if (!avatarFile || !selectedUser) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    formData.append("id", selectedUser.id);
    try {
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${UPLOAD_AVATAR}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data?.success) {
        const usersRes = await axios.get(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}`
        );
        setUsers(usersRes.data?.data || []);
        const found = (usersRes.data?.data || []).find(
          (u) => u.id === selectedUser.id
        );
        if (found) {
          setSelectedUser(found);
          setForm({
            ...found,
            department_id: String(found.department_id || ""),
          });
          setEditing(false);
          setError("");
        }
        setToast({
          visible: true,
          message: t("updateAvatarSuccess") || "Avatar updated successfully!",
          type: "success",
        });
        setShowAvatarModal(false);
        setAvatarFile(null);
      } else {
        setToast({
          visible: true,
          message: t("updateAvatarFailed") || "Update avatar failed!",
          type: "error",
        });
      }
    } catch (e) {
      setToast({
        visible: true,
        message: t("updateAvatarFailed") || "Update avatar failed!",
        type: "error",
      });
    }
    setAvatarUploading(false);
  };

  // Dashboard stats
  const totalEmployee = users.length;
  const activeEmployee = users.filter((u) => u.is_active).length;
  const inactiveEmployee = users.filter((u) => !u.is_active).length;
  const newJoiners = users.filter((u) => {
    if (!u.begin_date) return false;
    const joinDate = new Date(u.begin_date);
    const now = new Date();
    return (
      joinDate.getMonth() === now.getMonth() &&
      joinDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="employee-page-container">
      {/* DASHBOARD SECTION */}
      <CRow className="mb-4">
        <CCol md={3} sm={6} xs={12}>
          <CCard className="text-center">
            <CCardBody>
              <CBadge color="dark" className="mb-2 p-3">
                <CIcon icon={cilUser} size="xl" />
              </CBadge>
              <div className="fw-bold">Total Employee</div>
              <div className="fs-2 fw-bolder">{totalEmployee}</div>
              <CBadge color="light" textColor="primary">
                +19.01%
              </CBadge>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3} sm={6} xs={12}>
          <CCard className="text-center">
            <CCardBody>
              <CBadge color="success" className="mb-2 p-3">
                <CIcon icon={cilUserFollow} size="xl" />
              </CBadge>
              <div className="fw-bold">Active</div>
              <div className="fs-2 fw-bolder">{activeEmployee}</div>
              <CBadge color="light" textColor="success">
                +19.01%
              </CBadge>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3} sm={6} xs={12}>
          <CCard className="text-center">
            <CCardBody>
              <CBadge color="danger" className="mb-2 p-3">
                <CIcon icon={cilUserUnfollow} size="xl" />
              </CBadge>
              <div className="fw-bold">Inactive</div>
              <div className="fs-2 fw-bolder">{inactiveEmployee}</div>
              <CBadge color="light" textColor="danger">
                +19.01%
              </CBadge>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3} sm={6} xs={12}>
          <CCard className="text-center">
            <CCardBody>
              <CBadge color="info" className="mb-2 p-3">
                <CIcon icon={cilUserPlus} size="xl" />
              </CBadge>
              <div className="fw-bold">New Joiners</div>
              <div className="fs-2 fw-bolder">{newJoiners}</div>
              <CBadge color="light" textColor="info">
                +19.01%
              </CBadge>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={12} className="d-flex justify-content-end gap-2 mt-2">
          <CButton color="secondary" variant="outline">
            Export
          </CButton>
          <CButton color="warning" onClick={() => setShowCreateModal(true)}>
            + Add Employee
          </CButton>
        </CCol>
      </CRow>
      {/* MAIN CONTENT: TABLE + DETAIL PANEL */}
      <div className="employee-main-content">
        <div className="employee-table-panel">
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div className="fw-bold fs-5">{t("employeeListTitle")}</div>
              <CFormInput
                type="text"
                placeholder={t("search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 220 }}
              />
            </CCardHeader>
            <CCardBody className="p-0">
              <CTable hover responsive align="middle">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell scope="col">Emp ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Phone</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Designation</CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Joining Date
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.map((user) => (
                    <CTableRow
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      style={{ cursor: "pointer" }}
                      active={selectedUser?.id === user.id}
                    >
                      <CTableDataCell>{user.employee_id}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center gap-2">
                          <CAvatar
                            src={user.avatar || "/avatar-empty.png"}
                            size="md"
                          />
                          <div>
                            <div className="fw-semibold">{user.name}</div>
                            <div className="text-muted small">
                              {getDepartmentName(user.department_id)} •{" "}
                              {user.position}
                            </div>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell>{user.phone || "-"}</CTableDataCell>
                      <CTableDataCell>{user.role}</CTableDataCell>
                      <CTableDataCell>{user.begin_date}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={user.is_active ? "success" : "danger"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </CBadge>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </div>
        <div className={`employee-detail-slide${selectedUser ? " open" : ""}`}>
          {selectedUser ? (
            <CCard
              className="mb-4 p-4 shadow-lg border-0 employee-detail-card"
              style={{ maxWidth: 480, marginLeft: "auto", borderRadius: 24 }}
            >
              <div
                className="d-flex flex-column align-items-center mb-4 position-relative"
                style={{ width: 140, height: 140, margin: "0 auto" }}
              >
                <CAvatar
                  src={selectedUser.avatar || "/avatar-empty.png"}
                  size="3xl"
                  className="shadow mb-3"
                  style={{
                    width: 140,
                    height: 140,
                    border: "4px solid #1a7f37",
                    objectFit: "cover",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                />
                <div
                  className="avatar-hover-overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    opacity: 1,
                    transition: "opacity 0.2s",
                    zIndex: 2,
                  }}
                  onClick={() => setShowAvatarModal(true)}
                >
                  <CIcon
                    icon={cilCamera}
                    size="xl"
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {t("updateAvatar")}
                  </div>
                </div>
              </div>
              <div className="d-flex flex-column align-items-center mb-4">
                <div className="fw-bold fs-3 mb-1 text-center text-primary">
                  {selectedUser.name}
                </div>
                <div className="text-muted mb-1 fs-6">
                  {t("employee_id")}: {selectedUser.employee_id}
                </div>
                <CBadge
                  color={selectedUser.is_active ? "success" : "danger"}
                  className="mb-2 px-3 py-2 fs-6"
                >
                  {selectedUser.is_active ? t("active") : t("inactive")}
                </CBadge>
              </div>
              <CRow className="g-3 mb-2">
                {selectedUser.email && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("email")}</div>
                    <div className="profile-value">{selectedUser.email}</div>
                  </CCol>
                )}
                {selectedUser.phone && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("phone")}</div>
                    <div className="profile-value">{selectedUser.phone}</div>
                  </CCol>
                )}
                {selectedUser.dob && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("dob")}</div>
                    <div className="profile-value">{selectedUser.dob}</div>
                  </CCol>
                )}
                {selectedUser.gender && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("gender")}</div>
                    <div className="profile-value">{selectedUser.gender}</div>
                  </CCol>
                )}
                {selectedUser.address && (
                  <CCol xs={12}>
                    <div className="profile-label">{t("address")}</div>
                    <div className="profile-value">{selectedUser.address}</div>
                  </CCol>
                )}
                {selectedUser.cmnd && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("cmnd")}</div>
                    <div className="profile-value">{selectedUser.cmnd}</div>
                  </CCol>
                )}
                {selectedUser.cmnd_place && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("cmnd_place")}</div>
                    <div className="profile-value">
                      {selectedUser.cmnd_place}
                    </div>
                  </CCol>
                )}
                {selectedUser.cmnd_date && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("cmnd_date")}</div>
                    <div className="profile-value">
                      {selectedUser.cmnd_date}
                    </div>
                  </CCol>
                )}
                {selectedUser.begin_date && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("begin_date")}</div>
                    <div className="profile-value">
                      {selectedUser.begin_date}
                    </div>
                  </CCol>
                )}
                {selectedUser.role && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("role")}</div>
                    <div className="profile-value">{selectedUser.role}</div>
                  </CCol>
                )}
                {selectedUser.position && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("position")}</div>
                    <div className="profile-value">{selectedUser.position}</div>
                  </CCol>
                )}
                {selectedUser.salary_hourly && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("salary_hourly")}</div>
                    <div className="profile-value">
                      {selectedUser.salary_hourly}
                    </div>
                  </CCol>
                )}
                {selectedUser.shift_night_pay && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("shift_night_pay")}</div>
                    <div className="profile-value">
                      {selectedUser.shift_night_pay}
                    </div>
                  </CCol>
                )}
                {selectedUser.travel_allowance_pay && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">
                      {t("travel_allowance_pay")}
                    </div>
                    <div className="profile-value">
                      {selectedUser.travel_allowance_pay}
                    </div>
                  </CCol>
                )}
                {selectedUser.paid_days && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("paid_days")}</div>
                    <div className="profile-value">
                      {selectedUser.paid_days}
                    </div>
                  </CCol>
                )}
                {typeof selectedUser.is_officer === "boolean" && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("is_officer")}</div>
                    <div className="profile-value">
                      {selectedUser.is_officer ? t("yes") : t("no")}
                    </div>
                  </CCol>
                )}
                {typeof selectedUser.is_offical_staff === "boolean" && (
                  <CCol xs={12} md={6}>
                    <div className="profile-label">{t("is_offical_staff")}</div>
                    <div className="profile-value">
                      {selectedUser.is_offical_staff ? t("yes") : t("no")}
                    </div>
                  </CCol>
                )}
                {selectedUser.department_id && (
                  <CCol xs={12} md={6}>
                    <div className="text-muted small">{t("department_id")}</div>
                    <CBadge
                      className="profile-department-badge"
                      style={{
                        background: "linear-gradient(90deg,#e6f4ea,#d2f7e3)",
                        color: "#1a7f37",
                        fontWeight: 700,
                        fontSize: 16,
                        borderRadius: 12,
                        padding: "6px 24px",
                        boxShadow: "0 2px 8px rgba(34,139,34,0.07)",
                        letterSpacing: 0.5,
                        marginTop: 4,
                        display: "inline-block",
                      }}
                    >
                      {selectedUser.department?.name}
                    </CBadge>
                  </CCol>
                )}
              </CRow>
              {error && (
                <div className="text-danger mt-2 mb-2 text-center">{error}</div>
              )}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <CButton
                  color="danger"
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <CIcon icon={cilTrash} className="me-2" />
                  {t("delete")}
                </CButton>
                <CButton color="primary" onClick={handleEdit}>
                  <CIcon icon={cilPencil} className="me-2" />
                  {t("update")}
                </CButton>
              </div>
            </CCard>
          ) : (
            <div className="employee-detail-empty">
              <h5 className="text-muted text-center mt-5">
                {t("selectEmployeeToView")}
              </h5>
            </div>
          )}
        </div>
      </div>
      <UserCreateModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        departmentList={departments}
        onCreated={async (createdUser) => {
          setShowCreateModal(false);
          const res = await axios.get(
            `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}`
          );
          setUsers(res.data?.data || []);
          // Focus vào user vừa tạo
          const found = (res.data?.data || []).find(
            (u) => u.id === createdUser?.id
          );
          if (found) {
            setSelectedUser(found);
            setForm({
              ...found,
              department_id: String(found.department_id || ""),
            });
            setEditing(false);
            setError("");
          }
        }}
      />
      {/* Delete Confirmation Modal */}
      <CModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        backdrop="static"
        alignment="center"
      >
        <CModalHeader className="bg-danger bg-gradient border-0 rounded-top-4 text-white align-items-center">
          <CIcon
            icon={cilTrash}
            size="xxl"
            className="me-3"
            style={{ color: "#fff" }}
          />
          <div className="fw-bold fs-4">
            {t("delete") + " " + t("employee")}
          </div>
        </CModalHeader>
        <CModalBody className="text-center py-4">
          <div className="fs-5 mb-2">{t("deleteUserConfirm")}</div>
          <div className="text-danger fw-bold fs-4 mb-2">
            {selectedUser?.name}
          </div>
        </CModalBody>
        <CModalFooter className="bg-light rounded-bottom-4 border-0 d-flex justify-content-end gap-2">
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
          >
            {t("cancel")}
          </CButton>
          <CButton color="danger" onClick={handleDelete}>
            <CIcon icon={cilTrash} className="me-2" />
            {t("delete")}
          </CButton>
        </CModalFooter>
      </CModal>
      {/* Avatar Upload Modal */}
      <CModal
        visible={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        alignment="center"
        backdrop="static"
      >
        <CModalHeader className="bg-success bg-gradient border-0 rounded-top-4 text-white align-items-center">
          <CIcon
            icon={cilPencil}
            size="xxl"
            className="me-3"
            style={{ color: "#fff" }}
          />
          <div className="fw-bold fs-4">{t("updateAvatar")}</div>
        </CModalHeader>
        <CModalBody className="text-center py-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
            className="form-control mb-3"
            disabled={avatarUploading}
          />
          {avatarFile && (
            <img
              src={URL.createObjectURL(avatarFile)}
              alt="preview"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #1a7f37",
              }}
              className="mb-2"
            />
          )}
        </CModalBody>
        <CModalFooter className="bg-light rounded-bottom-4 border-0 d-flex justify-content-end gap-2">
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setShowAvatarModal(false)}
            disabled={avatarUploading}
          >
            {t("cancel")}
          </CButton>
          <CButton
            color="success"
            onClick={handleAvatarChange}
            disabled={!avatarFile || avatarUploading}
          >
            {avatarUploading ? t("creating") : t("updateAvatar")}
          </CButton>
        </CModalFooter>
      </CModal>
      {/* Modal Edit User */}
      <CModal
        visible={showEditModal}
        onClose={handleCancelEditModal}
        alignment="center"
        backdrop="static"
      >
        <CModalHeader>{t("update") + " " + t("employee")}</CModalHeader>
        <CModalBody>
          <CRow className="g-3 mb-2">
            <CCol xs={12} md={6}>
              <CFormLabel>{t("name")}</CFormLabel>
              <CFormInput
                value={form?.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("email")}</CFormLabel>
              <CFormInput
                value={form?.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("user_name")}</CFormLabel>
              <CFormInput
                value={form?.user_name || ""}
                onChange={(e) => handleInputChange("user_name", e.target.value)}
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("dob")}</CFormLabel>
              <CFormInput
                type="date"
                value={form?.dob || ""}
                onChange={(e) => handleInputChange("dob", e.target.value)}
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("employee_id")}</CFormLabel>
              <CFormInput
                value={form?.employee_id || ""}
                onChange={(e) =>
                  handleInputChange("employee_id", e.target.value)
                }
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("department_id")}</CFormLabel>
              <CFormSelect
                value={String(form?.department_id || "")}
                onChange={(e) =>
                  handleInputChange("department_id", e.target.value)
                }
                required
              >
                <option value="">{t("selectDepartment")}</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={String(dep.id)}>
                    {dep.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("role")}</CFormLabel>
              <CFormSelect
                value={form?.role || ""}
                onChange={(e) => handleInputChange("role", e.target.value)}
                required
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("position")}</CFormLabel>
              <CFormSelect
                value={form?.position || ""}
                onChange={(e) => handleInputChange("position", e.target.value)}
                required
              >
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("salary_hourly")}</CFormLabel>
              <CFormInput
                type="number"
                value={form?.salary_hourly || ""}
                onChange={(e) =>
                  handleInputChange("salary_hourly", e.target.value)
                }
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("travel_allowance_pay")}</CFormLabel>
              <CFormInput
                type="number"
                value={form?.travel_allowance_pay || ""}
                onChange={(e) =>
                  handleInputChange("travel_allowance_pay", e.target.value)
                }
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("shift_night_pay")}</CFormLabel>
              <CFormInput
                type="number"
                value={form?.shift_night_pay || ""}
                onChange={(e) =>
                  handleInputChange("shift_night_pay", e.target.value)
                }
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("paid_days")}</CFormLabel>
              <CFormInput
                type="number"
                value={form?.paid_days || ""}
                onChange={(e) => handleInputChange("paid_days", e.target.value)}
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("begin_date")}</CFormLabel>
              <CFormInput
                type="date"
                value={form?.begin_date || ""}
                onChange={(e) =>
                  handleInputChange("begin_date", e.target.value)
                }
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("phone")}</CFormLabel>
              <CFormInput
                value={form?.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("is_officer")}</CFormLabel>
              <CFormSwitch
                checked={!!form?.is_officer}
                onChange={(e) =>
                  handleInputChange("is_officer", e.target.checked)
                }
                label={form?.is_officer ? t("yes") : t("no")}
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>{t("is_offical_staff")}</CFormLabel>
              <CFormSwitch
                checked={!!form?.is_offical_staff}
                onChange={(e) =>
                  handleInputChange("is_offical_staff", e.target.checked)
                }
                label={form?.is_offical_staff ? t("yes") : t("no")}
              />
            </CCol>
          </CRow>
          {error && (
            <div className="text-danger mt-2 mb-2 text-center">{error}</div>
          )}
        </CModalBody>
        <CModalFooter className="bg-light rounded-bottom-4 border-0 d-flex justify-content-end gap-2">
          <CButton
            color="secondary"
            variant="outline"
            onClick={handleCancelEditModal}
          >
            {t("cancel")}
          </CButton>
          <CButton color="primary" onClick={handleSaveEditModal}>
            {t("save")}
          </CButton>
        </CModalFooter>
      </CModal>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  );
};

export default EmployeeManagement;
