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
} from "@coreui/icons";
import UserCreateModal from "../departments/UserCreateModal";

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
          "http://54.200.248.63:80/api/version/v1/users"
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
          "http://54.200.248.63:80/api/version/v1/department/getall"
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
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser(null);
      setForm(null);
      setEditing(false);
      setError("");
      return;
    }
    setSelectedUser(user);
    setForm(user);
    setEditing(false);
    setError("");
  };

  const handleEdit = () => {
    setEditing(true);
    setForm(selectedUser);
    setError("");
  };

  const handleCancel = () => {
    setEditing(false);
    setForm(selectedUser);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    // Validate required fields
    const requiredFields = [
      "name",
      "email",
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
        return;
      }
    }
    try {
      const res = await axios.put(
        `http://54.200.248.63:80/api/version/v1/users/${form.id}`,
        { ...form },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res.data.success) {
        setError(res.data.message || t("updateUserFailed"));
        return;
      }
      setUsers((users) =>
        users.map((u) => (u.id === form.id ? res.data.data : u))
      );
      setSelectedUser(res.data.data);
      setForm(res.data.data);
      setEditing(false);
    } catch (e) {
      setError(e?.response?.data?.message || t("updateUserFailed"));
    }
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
              className="mb-4 p-4"
              style={{ maxWidth: 480, marginLeft: "auto" }}
            >
              <CRow className="align-items-center mb-3">
                <CCol xs={4} className="text-center">
                  <CAvatar
                    src={selectedUser.avatar || "/avatar-empty.png"}
                    size="xxl"
                  />
                </CCol>
                <CCol xs={8}>
                  <div className="fw-bold fs-4 mb-1">{selectedUser.name}</div>
                  <div className="text-muted mb-1">
                    Employee ID: {selectedUser.employee_id}
                  </div>
                  <CBadge
                    color={selectedUser.is_active ? "success" : "danger"}
                    className="mb-2"
                  >
                    {selectedUser.is_active ? "Working" : "Resigned"}
                  </CBadge>
                  <div className="mb-1">
                    <CBadge color="info">
                      {getDepartmentName(selectedUser.department_id)}
                    </CBadge>
                  </div>
                </CCol>
              </CRow>
              <CRow className="g-2">
                <CCol xs={6}>
                  <div className="text-muted small">Email</div>
                  <div>{selectedUser.email || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Phone</div>
                  <div>{selectedUser.phone || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">DOB</div>
                  <div>{selectedUser.dob || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Gender</div>
                  <div>{selectedUser.gender || "-"}</div>
                </CCol>
                <CCol xs={12}>
                  <div className="text-muted small">Address</div>
                  <div>{selectedUser.address || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">CMND</div>
                  <div>{selectedUser.cmnd || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">CMND Place</div>
                  <div>{selectedUser.cmnd_place || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">CMND Date</div>
                  <div>{selectedUser.cmnd_date || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Begin Date</div>
                  <div>{selectedUser.begin_date || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Role</div>
                  <div>{selectedUser.role || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Position</div>
                  <div>{selectedUser.position || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Salary Hourly</div>
                  <div>{selectedUser.salary_hourly || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Shift Night Pay</div>
                  <div>{selectedUser.shift_night_pay || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Travel Allowance Pay</div>
                  <div>{selectedUser.travel_allowance_pay || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Paid Days</div>
                  <div>{selectedUser.paid_days || "-"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Is Officer</div>
                  <div>{selectedUser.is_officer ? "yes" : "no"}</div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-muted small">Official Staff</div>
                  <div>{selectedUser.is_offical_staff ? "yes" : "no"}</div>
                </CCol>
              </CRow>
              <div className="d-flex justify-content-end mt-3">
                <CButton color="primary" onClick={handleEdit}>
                  Update
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
        onCreated={() => {
          setShowCreateModal(false);
          axios
            .get("http://54.200.248.63:80/api/version/v1/users")
            .then((res) => setUsers(res.data?.data || []));
        }}
      />
    </div>
  );
};

export default EmployeeManagement;
