import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCircle, cilX } from "@coreui/icons";
import {
  BASE_URL,
  V1,
  VERSION,
  API,
  PORT,
  CHECKIN,
  GET_CHECKIN_IN_DATE_OF_POSITION,
  SEARCH,
} from "../../constants";
import { useTranslation } from "react-i18next";

const AttendanceManagement = () => {
  const userData = JSON.parse(sessionStorage.getItem("userIF")) || {};
  const today = moment().format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(
    moment(today).subtract(1, "day").toDate()
  );
  const [checkinData, setCheckinData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isCheckinDataEmpty, setIsCheckinDataEmpty] = useState(false);
  const [isCheckinDetailModal, setIsCheckinDetailModal] = useState(false);
  const [checkinDetail, setCheckinDetail] = useState([]);
  const [timeWorkTotal, setTimeWorkTotal] = useState(0);
  const [OverTimeTotal, setOverTimeTotal] = useState(0);
  const [weekEndTimeTotal, setWeekEndTimeTotal] = useState(0);
  const [dayShitfTotal, setDayShiftTotal] = useState(0);
  const [nightShiftTotal, setNightShiftTotal] = useState(0);
  const [paidCound, setPaidCount] = useState(0);
  const { t } = useTranslation();

  const getUserCheckinOfDate = async () => {
    setIsDataLoaded(false);
    const field = {
      date: moment(startDate).format("YYYY-MM-DD"),
      position: userData.position,
    };
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${CHECKIN}${GET_CHECKIN_IN_DATE_OF_POSITION}`,
        field
      );
      if (response.data.success) {
        setCheckinData(response.data.data);
        setIsCheckinDataEmpty(response.data.data.length === 0);
      } else {
        setIsCheckinDataEmpty(true);
      }
    } catch (error) {
      setIsCheckinDataEmpty(true);
    } finally {
      setIsDataLoaded(true);
    }
  };

  const handleShowCheckinDetailUser = async (id) => {
    try {
      const field = {
        user_id: id,
        date: moment(startDate).format("YYYY-MM-DD"),
      };
      const checkin_detail_of_user = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${CHECKIN}${SEARCH}`,
        field
      );
      if (checkin_detail_of_user?.data.success) {
        const value = checkin_detail_of_user.data.data;
        const paidTotal = value.reduce((total, item) => {
          if (item.is_paid_leave) total++;
          return total;
        }, 0);
        const totalWorkTime = value.reduce((total, item) => {
          if (!item.is_weekend) total += item.work_time;
          return total;
        }, 0);
        const totalOverTime = value.reduce((total, item) => {
          total += item.over_time;
          return total;
        }, 0);
        const totalDayShift = value.reduce((total, item) => {
          if (item.work_shift === "DAY") total++;
          return total;
        }, 0);
        const totalNightShift = value.reduce((total, item) => {
          if (item.work_shift === "NIGHT") total++;
          return total;
        }, 0);
        const totalWeekend = value.reduce((total, item) => {
          if (item.is_weekend) total += item.work_time;
          return total;
        }, 0);
        setDayShiftTotal(totalDayShift);
        setNightShiftTotal(totalNightShift);
        setOverTimeTotal(totalOverTime);
        setTimeWorkTotal(totalWorkTime);
        setWeekEndTimeTotal(totalWeekend);
        setPaidCount(paidTotal);
        setCheckinDetail(checkin_detail_of_user?.data?.data);
        setIsCheckinDetailModal(true);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getUserCheckinOfDate();
    // eslint-disable-next-line
  }, [startDate]);

  return (
    <div className="attendance-management-page bg-light py-4 px-2 px-md-4 min-vh-100">
      {/* Header filter modern, chỉ giữ date picker và search */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#1a7f37" }}>
            {t("attendance")}
          </h2>
          <div className="text-muted">
            {t("homeBreadcrumb")} / {t("attendance")}
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center bg-white rounded-4 shadow-sm px-3 py-2">
          <input
            className="form-control form-control-sm w-auto"
            placeholder={t("search")}
          />
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            dateFormat="yyyy-MM-dd"
            className="form-control form-control-sm w-auto"
            style={{ maxWidth: 140 }}
          />
        </div>
      </div>
      {/* Table modern, chỉ giữ các cột như trước, thêm avatar */}
      <CRow className="g-4 justify-content-center">
        <CCol xl={12} lg={12} md={12} sm={12} xs={12}>
          <CCard className="shadow-sm border-0 rounded-4">
            <CCardBody className="p-0">
              {isDataLoaded && isCheckinDataEmpty ? (
                <div className="text-center text-muted py-5">{t("noData")}</div>
              ) : (
                <div className="table-responsive">
                  <CTable
                    align="middle"
                    hover
                    responsive
                    bordered
                    className="rounded-4 overflow-hidden mb-0"
                    style={{ minWidth: 900 }}
                  >
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>{t("employee")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("department")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("workTime")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("overTime")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("weekend")}</CTableHeaderCell>
                        <CTableHeaderCell>{t("shift")}</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {checkinData.map((item, index) => (
                        <CTableRow
                          key={index}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            handleShowCheckinDetailUser(item.user_id)
                          }
                        >
                          <CTableDataCell>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={item.user?.avatar || "/avatar-empty.png"}
                                alt="avatar"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                }}
                              />
                              <div>
                                <div className="fw-semibold text-primary">
                                  {item.user?.name}
                                </div>
                                <div className="small text-muted">
                                  {item.user?.employee_id}
                                </div>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            {item.user?.department?.name}
                          </CTableDataCell>
                          <CTableDataCell>{item.work_time}</CTableDataCell>
                          <CTableDataCell>{item.over_time}</CTableDataCell>
                          <CTableDataCell>
                            <span
                              className={
                                item.is_weekend
                                  ? "badge bg-warning text-dark"
                                  : "badge bg-success"
                              }
                            >
                              {item.is_weekend ? t("yes") : t("no")}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell>{item.work_shift}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {/* Modal chi tiết checkin */}
      <CModal
        size="lg"
        visible={isCheckinDetailModal}
        scrollable
        onClose={() => setIsCheckinDetailModal(false)}
      >
        <CModalHeader className="bg-light border-0 rounded-top-4">
          <CRow className="w-100">
            <CCol>
              <CModalTitle className="fw-bold">Chi tiết Checkin</CModalTitle>
            </CCol>
            <CCol>
              <CModalTitle>Ca ngày: {dayShitfTotal}</CModalTitle>
            </CCol>
            <CCol>
              <CModalTitle>Ca đêm: {nightShiftTotal}</CModalTitle>
            </CCol>
            <CCol>
              <CModalTitle>Giờ làm: {timeWorkTotal}</CModalTitle>
            </CCol>
            <CCol>
              <CModalTitle>Tăng ca: {OverTimeTotal}</CModalTitle>
            </CCol>
            <CCol>
              <CModalTitle>Cuối tuần: {weekEndTimeTotal}</CModalTitle>
            </CCol>
            <CCol>
              <CModalTitle>Nghỉ phép: {paidCound}</CModalTitle>
            </CCol>
          </CRow>
        </CModalHeader>
        <CModalBody className="bg-white rounded-bottom-4">
          <CTable
            align="middle"
            hover
            responsive
            bordered
            className="rounded-4 overflow-hidden"
          >
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Ngày</CTableHeaderCell>
                <CTableHeaderCell>Nhân viên</CTableHeaderCell>
                <CTableHeaderCell>Phòng ban</CTableHeaderCell>
                <CTableHeaderCell>Giờ làm</CTableHeaderCell>
                <CTableHeaderCell>Tăng ca</CTableHeaderCell>
                <CTableHeaderCell>Cuối tuần</CTableHeaderCell>
                <CTableHeaderCell>Ca</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {checkinDetail
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((item, index) => (
                  <CTableRow
                    key={index}
                    color={item?.is_paid_leave ? "danger" : ""}
                  >
                    <CTableDataCell>{item.date}</CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-semibold">{item.user?.name}</div>
                      <div className="small text-muted">
                        {item.user?.employee_id}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.user?.department?.name}
                    </CTableDataCell>
                    <CTableDataCell>{item.work_time}</CTableDataCell>
                    <CTableDataCell>{item.over_time}</CTableDataCell>
                    <CTableDataCell>
                      <span
                        className={
                          item.is_weekend ? "text-warning" : "text-success"
                        }
                      >
                        {item.is_weekend ? (
                          <CIcon icon={cilCircle} size="lg" />
                        ) : (
                          <CIcon icon={cilX} size="lg" />
                        )}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell>{item.work_shift}</CTableDataCell>
                  </CTableRow>
                ))}
            </CTableBody>
          </CTable>
        </CModalBody>
        <CModalFooter className="bg-light rounded-bottom-4 border-0">
          <CButton
            color="secondary"
            onClick={() => setIsCheckinDetailModal(false)}
            className="rounded-pill px-4 fw-bold"
          >
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default AttendanceManagement;
