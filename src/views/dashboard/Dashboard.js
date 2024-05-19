import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  CAvatar,
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from "@coreui/react";
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
import WidgetsBrand from "../dashboard/widgets/WidgetsBrand";
import CIcon from "@coreui/icons-react";
import { cilCircle, cilX } from "@coreui/icons";
const Dashboard = () => {
  const navigate = useNavigate();

  const userData = JSON.parse(sessionStorage.getItem("userIF")) || {};
  const today = moment().format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(
    moment(today).subtract(1, "day").toDate()
  );
  const [isCheckinDetailModal, setIsCheckinDetailModal] = useState(false);
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
    <>
      <CContainer>
        <WidgetsBrand users={isUserAtPosition} />
        <CRow xs={{ gutter: 1 }}>
          <CCol sm={6}>
            <CCard className="mb-4 mt-4">
              <CCardHeader>
                <CRow>
                  <CCol sm={5}>
                    <h4 id="traffic" className="card-title mb-0">
                      CHECKIN
                    </h4>
                    <div className="small text-body-secondary">
                      {moment(startDate).format("YYYY-MM-DD")}
                    </div>
                  </CCol>
                  <CCol>
                    <DatePicker
                      selected={startDate}
                      onChange={handleChangeCheckinDate}
                      dateFormat="yyyy-MM-dd"
                    />
                  </CCol>
                </CRow>
              </CCardHeader>

              <CCardBody>
                {isDataLoaded && isCheckinDataEmpty ? (
                  <div className="text-center">Không có dữ liệu</div>
                ) : (
                  <CTable
                    align="middle"
                    className="mb-0 border text-center"
                    hover
                    responsive
                  >
                    <CTableHead className="text-nowrap">
                      <CTableRow>
                        <CTableHeaderCell className="bg-body-tertiary">
                          Name
                        </CTableHeaderCell>
                        <CTableHeaderCell className="bg-body-tertiary text-center">
                          Department
                        </CTableHeaderCell>
                        <CTableHeaderCell className="bg-body-tertiary">
                          Work time
                        </CTableHeaderCell>
                        <CTableHeaderCell className="bg-body-tertiary">
                          Over time
                        </CTableHeaderCell>
                        <CTableHeaderCell className="bg-body-tertiary">
                          Weekend
                        </CTableHeaderCell>
                        <CTableHeaderCell className="bg-body-tertiary">
                          Shift
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {checkinData.map((item, index) => (
                        <CTableRow
                          key={index}
                          onClick={() =>
                            handleShowCheckinDetailUser(item.user_id)
                          }
                          color={item?.is_paid_leave ? "danger" : ""}
                        >
                          <CTableDataCell>
                            <div>{item.user?.name}</div>
                            <div className="small text-body-secondary text-nowrap">
                              <span>{item.user?.employee_id}</span>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <div>{item.user?.department?.name}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>{item.work_time}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>{item.over_time}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div
                              className={
                                item.is_weekend ? "bg-warning" : "bg-success"
                              }
                            >
                              {item.is_weekend ? (
                                <CIcon icon={cilCircle} size="lg" />
                              ) : (
                                <CIcon icon={cilX} size="lg" />
                              )}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>{item.work_shift}</div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CCardBody>
            </CCard>
          </CCol>
          <CModal
            size="lg"
            visible={isCheckinDetailModal}
            scrollable
            onClose={() => setIsCheckinDetailModal(false)}
          >
            <CModalHeader>
              <CRow>
                <CCol>
                  <CModalTitle>Checkin detail</CModalTitle>
                </CCol>
                <CCol>
                  <CModalTitle>DAY: {dayShitfTotal} </CModalTitle>
                </CCol>
                <CCol>
                  <CModalTitle>NIGHT: {nightShiftTotal} </CModalTitle>
                </CCol>
                <CCol>
                  <CModalTitle>Hours: {timeWorkTotal} </CModalTitle>
                </CCol>
                <CCol>
                  <CModalTitle>Over time: {OverTimeTotal} </CModalTitle>
                </CCol>
                <CCol>
                  <CModalTitle>Weekend: {weekEndTimeTotal} </CModalTitle>
                </CCol>
                <CCol>
                  <CModalTitle>Paid Leave: {paidCound} </CModalTitle>
                </CCol>
              </CRow>
            </CModalHeader>
            <CModalBody>
              <CTable
                align="middle"
                className="mb-1 border text-center"
                hover
                responsive
              >
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Date
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Name
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Department
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Work time
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Over time
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Weekend
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Shift
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {
                    (checkinDetail.sort(
                      (a, b) => new Date(b.date) - new Date(a.date)
                    ),
                    checkinDetail.map((item, index) => (
                      <CTableRow
                        key={index}
                        color={item?.is_paid_leave ? "danger" : ""}
                      >
                        <CTableDataCell>
                          <div>{item.date}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{item.user?.name}</div>
                          <div className="small text-body-secondary text-nowrap">
                            <span>{item.user?.employee_id}</span>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <div>{item.user?.department?.name}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{item.work_time}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{item.over_time}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div
                            className={
                              item.is_weekend ? "bg-warning" : "bg-success"
                            }
                          >
                            {item.is_weekend ? (
                              <CIcon icon={cilCircle} size="lg" />
                            ) : (
                              <CIcon icon={cilX} size="lg" />
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{item.work_shift}</div>
                        </CTableDataCell>
                      </CTableRow>
                    )))
                  }
                </CTableBody>
              </CTable>
            </CModalBody>
          </CModal>
          <CCol sm={6}>
            <CCard className="mb-4 mt-4">
              <CCardHeader>
                <CRow>
                  <CCol sm={3}>
                    <h4 id="traffic" className="card-title mb-0">
                      ORDER
                    </h4>
                    <div className="small text-body-secondary">
                      {moment(orderDate).format("YYYY-MM-DD")}
                    </div>
                  </CCol>
                  <CCol>
                    <DatePicker
                      selected={orderDate}
                      onChange={handleChangeOrderDate}
                      dateFormat="yyyy-MM-dd"
                    />
                  </CCol>
                  <CCol className="text-center">
                    <h5>Day</h5>
                    <div className="small text-body-secondary text-nowrap">
                      <span>{dayCount}</span>
                    </div>
                  </CCol>
                  <CCol className="text-center">
                    <h5>Night</h5>
                    <div className="small text-body-secondary text-nowrap">
                      <span>{nightCount}</span>
                    </div>
                  </CCol>
                </CRow>
              </CCardHeader>

              <CCardBody>
                {isDataLoaded && isOrderDataEmpty ? (
                  <div className="text-center">Không có dữ liệu</div>
                ) : (
                  <CTable
                    align="middle"
                    className="mb-0 border text-center"
                    hover
                    responsive
                  >
                    <CTableHead className="text-nowrap">
                      <CTableRow>
                        <CTableHeaderCell className="bg-body-tertiary">
                          Name
                        </CTableHeaderCell>
                        <CTableHeaderCell className="bg-body-tertiary text-center">
                          DATE
                        </CTableHeaderCell>
                        <CTableHeaderCell className="bg-body-tertiary">
                          SHIFT
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {orderData.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            <div>{item.user?.name}</div>
                            <div className="small text-body-secondary text-nowrap">
                              <span>{item.user?.employee_id}</span>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <div>{moment(item.date).format("YYYY-MM-DD")}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>{item.dayOrNight}</div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </>
  );
};

export default Dashboard;
