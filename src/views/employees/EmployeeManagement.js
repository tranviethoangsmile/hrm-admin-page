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
} from "@coreui/react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const statusBadge = (status, t) => {
  if (status === true || status === "active" || status === "Đã xác nhận")
    return (
      <CBadge
        color="success"
        className="px-3 py-2 fw-semibold"
        style={{
          fontSize: 15,
          background: "linear-gradient(90deg,#1a7f37,#43e97b)",
        }}
      >
        {t("Đã xác nhận")}
      </CBadge>
    );
  if (status === false || status === "inactive" || status === "Không xác nhận")
    return (
      <CBadge
        color="danger"
        className="px-3 py-2 fw-semibold"
        style={{
          fontSize: 15,
          background: "linear-gradient(90deg,#e74c3c,#f9d423)",
        }}
      >
        {t("Không xác nhận")}
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
      {t("Chờ xác nhận")}
    </CBadge>
  );
};

const EmployeeManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

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
    fetchUsers();
  }, []);

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (selected.length === users.length) setSelected([]);
    else setSelected(users.map((u) => u.id));
  };

  return (
    <CCard className="shadow-sm border-0 rounded-4">
      <CCardHeader className="bg-white border-0 px-4 py-4 rounded-top-4">
        <h4 className="fw-bold mb-0" style={{ color: "#1a7f37", fontSize: 26 }}>
          Danh sách nhân viên
        </h4>
      </CCardHeader>
      <CCardBody className="p-0">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <CSpinner color="success" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 text-body-secondary">
            {t("noData") || "Không có dữ liệu"}
          </div>
        ) : (
          <div className="table-responsive">
            <CTable
              hover
              align="middle"
              className="mb-0"
              style={{ minWidth: 900 }}
            >
              <CTableHead className="bg-body-tertiary">
                <CTableRow style={{ height: 60 }}>
                  <CTableHeaderCell
                    scope="col"
                    className="text-center"
                    style={{ width: 48 }}
                  >
                    <CFormCheck
                      checked={selected.length === users.length}
                      onChange={handleSelectAll}
                    />
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ minWidth: 220 }}>
                    Nhân viên
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col">Phòng ban</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Chức vụ</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Trạng thái</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-center">
                    Hành động
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {users.map((user, idx) => (
                  <CTableRow
                    key={user.id || idx}
                    style={{
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onClick={(e) => {
                      if (e.target.tagName !== "BUTTON")
                        navigate(`/employee-profile/${user.id}`);
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#f1f8f4")
                    }
                    onMouseOut={(e) => (e.currentTarget.style.background = "")}
                  >
                    <CTableDataCell className="text-center align-middle">
                      <CFormCheck
                        checked={selected.includes(user.id)}
                        onChange={() => handleSelect(user.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center gap-3">
                        <CAvatar
                          src={user.avatar || "/avatar-empty.png"}
                          size="lg"
                          className="border border-2 border-white shadow-sm"
                        />
                        <div>
                          <div className="fw-bold" style={{ fontSize: 18 }}>
                            {user.name || user.fullName || user.username}
                          </div>
                          <div className="small text-success fw-semibold">
                            NV{user.employee_id}
                          </div>
                          <div className="small text-muted">
                            {user.department?.name || user.department || ""}
                          </div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="align-middle">
                      {user.department?.name || user.department || ""}
                    </CTableDataCell>
                    <CTableDataCell className="align-middle">
                      {user.position || ""}
                    </CTableDataCell>
                    <CTableDataCell className="align-middle">
                      {statusBadge(user.is_active, t)}
                    </CTableDataCell>
                    <CTableDataCell className="text-center align-middle">
                      <div className="d-flex gap-2 justify-content-center">
                        <CButton
                          color="success"
                          variant="outline"
                          size="sm"
                          className="fw-semibold px-3 py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employee-profile/${user.id}`);
                          }}
                        >
                          Xem
                        </CButton>
                        <CButton
                          color="primary"
                          variant="outline"
                          size="sm"
                          className="fw-semibold px-3 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Sửa
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          className="fw-semibold px-3 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Xóa
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};
export default EmployeeManagement;
