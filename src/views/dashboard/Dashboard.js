import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
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
  CBadge,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilCircle,
  cilX,
  cilUser,
  cilSun,
  cilMoon,
  cilCalendarCheck,
} from "@coreui/icons";
import {
  BASE_URL,
  V1,
  VERSION,
  API,
  PORT,
  CHECKIN,
  GET_CHECKIN_IN_DATE_OF_POSITION,
  USER_URL,
  FIND_ALL_USER_WITH_FIELD,
  SEARCH_ORDER_WITH_FIELD,
  ORDER_URL,
  CHECKIN_DETAIL_IN_DATE_OF_USER,
  SEARCH,
} from "../../constants";
import { useTranslation } from "react-i18next";

const statCards = [
  {
    label: "dashboard.totalEmployees",
    icon: cilUser,
    color: "#1a7f37",
    key: "isUserAtPosition",
  },
  {
    label: "dayShift",
    icon: cilSun,
    color: "#f9c846",
    key: "dayCount",
  },
  {
    label: "nightShift",
    icon: cilMoon,
    color: "#4e54c8",
    key: "nightCount",
  },
  {
    label: "paidLeave",
    icon: cilCalendarCheck,
    color: "#e74c3c",
    key: "paidCound",
  },
];

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("userIF")) || {};
  const today = moment().format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(
    moment(today).subtract(1, "day").toDate()
  );
  const [orderDate, setOrderDate] = useState(new Date(today));
  const [orderData, setOrderData] = useState([]);
  const [checkinData, setCheckinData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isCheckinDataEmpty, setIsCheckinDataEmpty] = useState(false);
  const [isOrderDataEmpty, setIsOrderDataEmpty] = useState(false);
  const [isUserAtPosition, setIsUserAtPosition] = useState(0);
  const [dayCount, setDayCount] = useState(0);
  const [nightCount, setNightCount] = useState(0);
  const [paidCound, setPaidCount] = useState(0);
  const [isCheckinDetailModal, setIsCheckinDetailModal] = useState(false);
  const [checkinDetail, setCheckinDetail] = useState([]);
  const [timeWorkTotal, setTimeWorkTotal] = useState(0);
  const [OverTimeTotal, setOverTimeTotal] = useState(0);
  const [weekEndTimeTotal, setWeekEndTimeTotal] = useState(0);
  const [dayShitfTotal, setDayShiftTotal] = useState(0);
  const [nightShiftTotal, setNightShiftTotal] = useState(0);

  const getAllUserWithField = async () => {
    try {
      const field = {
        position: userData.position,
      };
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${FIND_ALL_USER_WITH_FIELD}`,
        field
      );
      if (response.data.success) {
        setIsUserAtPosition(response.data.data.length);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getOrderInDateOfPosition = async () => {
    setIsDataLoaded(false);
    try {
      const field = {
        date: moment(orderDate).format("YYYY-MM-DD"),
        position: userData.position,
      };
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}${SEARCH_ORDER_WITH_FIELD}`,
        field
      );
      if (response.data.success) {
        setOrderData(response.data.data);
        setIsOrderDataEmpty(response.data.data.length === 0);
        const orders = response.data.data;
        const { dCount, nCount } = orders.reduce(
          (consts, order) => {
            if (order.dayOrNight === "DAY") {
              consts.dCount++;
            } else if (order.dayOrNight === "NIGHT") {
              consts.nCount++;
            }
            return consts;
          },
          { dCount: 0, nCount: 0 }
        );
        setDayCount(dCount);
        setNightCount(nCount);
      } else {
        setIsOrderDataEmpty(true);
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
    } finally {
      setIsDataLoaded(true);
    }
  };

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
      console.error("Error fetching checkin data:", error);
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
          if (item.is_paid_leave) {
            total++;
          }
          return total;
        }, 0);
        const totalWorkTime = value.reduce((total, item) => {
          if (!item.is_weekend) {
            total += item.work_time;
          }
          return total;
        }, 0);
        const totalOverTime = value.reduce((total, item) => {
          total += item.over_time;

          return total;
        }, 0);
        const totalDayShift = value.reduce((total, item) => {
          if (item.work_shift === "DAY") {
            total++;
          }

          return total;
        }, 0);
        const totalNightShift = value.reduce((total, item) => {
          if (item.work_shift === "NIGHT") {
            total++;
          }

          return total;
        }, 0);
        const totalWeekend = value.reduce((total, item) => {
          if (item.is_weekend) {
            total += item.work_time;
          }

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
      } else {
        Swal.fire({
          position: "bottom-end",
          icon: "warning",
          width: "300px",
          title: checkin_detail_of_user?.data?.message,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error(`Error getting detail of User Checkin : ${id} `, error);
    }
  };

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      getUserCheckinOfDate();
      getAllUserWithField();
      getOrderInDateOfPosition();
    }
  }, [startDate, orderDate]);

  const handleChangeCheckinDate = (date) => {
    setStartDate(date);
  };

  const handleChangeOrderDate = (date) => {
    setOrderDate(date);
  };

  return (
    <div className="dashboard-page bg-light py-4 px-2 px-md-4 min-vh-100">
      {/* Header + Breadcrumb */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#1a7f37" }}>
            {t("dashboard")}
          </h2>
          <div className="text-muted">
            {t("homeBreadcrumb")} / {t("dashboard")}
          </div>
        </div>
      </div>
      {/* Card thống kê */}
      <CRow className="mb-4 g-3">
        {statCards.map((card, idx) => (
          <CCol key={card.key} md={3} sm={6} xs={12}>
            <CCard className="shadow-sm border-0 rounded-4 text-center h-100">
              <CCardBody>
                <div className="mb-2">
                  <CIcon
                    icon={card.icon}
                    size="xxl"
                    style={{ color: card.color, fontSize: 36 }}
                  />
                </div>
                <div className="fw-semibold text-secondary mb-1">
                  {t(card.label)}
                </div>
                <div
                  className="display-6 fw-bold"
                  style={{ color: card.color }}
                >
                  {card.key === "isUserAtPosition"
                    ? isUserAtPosition
                    : card.key === "dayCount"
                      ? dayCount
                      : card.key === "nightCount"
                        ? nightCount
                        : paidCound}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </div>
  );
};

export default Dashboard;
