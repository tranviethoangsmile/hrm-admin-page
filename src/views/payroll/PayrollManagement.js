import React from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
} from "@coreui/react";

const PayrollManagement = () => {
  // Dummy data mẫu, sẽ thay bằng API sau
  const payrollData = [
    {
      id: 1,
      code: "NV21312",
      name: "Phạm Thị Thanh An",
      avatar: "",
      department: "Phòng kinh doanh",
      period: "2/2022",
      salaryType: "NV Kinh Doanh",
      position: "Trưởng phòng",
      status: "Đã xác nhận",
    },
    {
      id: 2,
      code: "NV21312",
      name: "Nguyễn Thị Thắm",
      avatar: "",
      department: "Phòng kinh doanh",
      period: "2/2022",
      salaryType: "NV Kinh Doanh",
      position: "Nhân viên",
      status: "Đã xác nhận",
    },
    {
      id: 3,
      code: "NV21312",
      name: "Phạm Văn Nam",
      avatar: "",
      department: "Phòng kinh doanh",
      period: "2/2022",
      salaryType: "NV Kinh Doanh",
      position: "Nhân viên",
      status: "Chờ xác nhận",
    },
    {
      id: 4,
      code: "NV21312",
      name: "Đặng Hồng Nhung",
      avatar: "",
      department: "Phòng kinh doanh",
      period: "2/2022",
      salaryType: "NV Kinh Doanh",
      position: "Nhân viên",
      status: "Đã xác nhận",
    },
    {
      id: 5,
      code: "NV21312",
      name: "Trần Văn Nghĩa",
      avatar: "",
      department: "Phòng kinh doanh",
      period: "2/2022",
      salaryType: "NV Kinh Doanh",
      position: "Nhân viên",
      status: "Không xác nhận",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Đã xác nhận":
        return <CBadge color="success">Đã xác nhận</CBadge>;
      case "Chờ xác nhận":
        return <CBadge color="warning">Chờ xác nhận</CBadge>;
      case "Không xác nhận":
        return <CBadge color="danger">Không xác nhận</CBadge>;
      default:
        return <CBadge color="secondary">{status}</CBadge>;
    }
  };

  return (
    <div className="payroll-management-page">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Bảng lương phòng kinh doanh</h5>
            <small className="text-muted">
              Trang chủ / HRM / Lương / Tính lương
            </small>
          </div>
          <CButton color="success" variant="outline">
            Khóa bảng lương
          </CButton>
        </CCardHeader>
        <CCardBody>
          {/* Bộ lọc và tìm kiếm */}
          <CRow className="mb-3">
            <CCol md={2} sm={6} className="mb-2">
              <CFormSelect aria-label="Chế độ lương">
                <option>Chế độ lương</option>
                <option value="1">NV Kinh Doanh</option>
                <option value="2">NV Sản Xuất</option>
              </CFormSelect>
            </CCol>
            <CCol md={2} sm={6} className="mb-2">
              <CFormSelect aria-label="Phòng ban">
                <option>Phòng ban</option>
                <option value="1">Phòng kinh doanh</option>
                <option value="2">Phòng sản xuất</option>
              </CFormSelect>
            </CCol>
            <CCol md={2} sm={6} className="mb-2">
              <CFormSelect aria-label="Trạng thái">
                <option>Trạng thái</option>
                <option value="1">Đã xác nhận</option>
                <option value="2">Chờ xác nhận</option>
                <option value="3">Không xác nhận</option>
              </CFormSelect>
            </CCol>
            <CCol md={3} sm={6} className="mb-2">
              <CFormInput placeholder="Tìm kiếm" />
            </CCol>
            <CCol
              md={3}
              sm={12}
              className="mb-2 d-flex justify-content-end gap-2"
            >
              <CButton color="primary" variant="outline">
                Thêm nhân viên
              </CButton>
              <CButton color="success">Gửi phiếu lương</CButton>
            </CCol>
          </CRow>

          {/* Bảng lương */}
          <CTable align="middle" hover responsive bordered>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell
                  scope="col"
                  style={{ width: 40 }}
                ></CTableHeaderCell>
                <CTableHeaderCell scope="col">Nhân viên</CTableHeaderCell>
                <CTableHeaderCell scope="col">Kỳ lương</CTableHeaderCell>
                <CTableHeaderCell scope="col">Chế độ lương</CTableHeaderCell>
                <CTableHeaderCell scope="col">Chức danh</CTableHeaderCell>
                <CTableHeaderCell scope="col">Trạng thái</CTableHeaderCell>
                <CTableHeaderCell scope="col" className="text-center">
                  Hành động
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {payrollData.map((item, idx) => (
                <CTableRow key={item.id}>
                  <CTableDataCell>
                    <input type="checkbox" />
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={item.avatar || "/avatar-empty.png"}
                        alt="avatar"
                        style={{ width: 32, height: 32, borderRadius: "50%" }}
                      />
                      <div>
                        <div className="fw-semibold text-primary">
                          {item.code}
                        </div>
                        <div className="small text-muted">{item.name}</div>
                        <div className="small text-muted">
                          {item.department}
                        </div>
                      </div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>{item.period}</CTableDataCell>
                  <CTableDataCell>{item.salaryType}</CTableDataCell>
                  <CTableDataCell>{item.position}</CTableDataCell>
                  <CTableDataCell>{getStatusBadge(item.status)}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton
                      color="info"
                      size="sm"
                      variant="ghost"
                      title="Xem chi tiết"
                    >
                      <i className="bi bi-eye"></i>
                    </CButton>
                    <CButton
                      color="success"
                      size="sm"
                      variant="ghost"
                      title="Cập nhật"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      variant="ghost"
                      title="Xóa"
                    >
                      <i className="bi bi-trash"></i>
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default PayrollManagement;
