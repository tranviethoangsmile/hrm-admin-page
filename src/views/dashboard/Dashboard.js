import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useNavigate } from "react-router-dom";

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
} from "@coreui/react";
import {
  BASE_URL,
  V1,
  VERSION,
  API,
  PORT,
  CHECKIN,
  GET_CHECKIN_OF_DATE,
  USER_URL,
  FIND_ALL_USER_WITH_FIELD,
} from "../../constants";
import WidgetsBrand from "../dashboard/widgets/WidgetsBrand";

const Dashboard = () => {
  const navigate = useNavigate();

  const userData = JSON.parse(sessionStorage.getItem("userIF"));
  const today = moment().format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(
    moment(today).subtract(1, "day").format("YYYY-MM-DD")
  );
  const [checkinData, setCheckinData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isDataEmpty, setIsDataEmpty] = useState(false);
  const [isUserAtPosition, setIsUserAtPosition] = useState(0);

  const getAllUserWithField = async () => {
    try {
      const field = {
        position: userData?.position,
      };
      const users = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${FIND_ALL_USER_WITH_FIELD}`
      );
      if (users?.data?.success) {
        setIsUserAtPosition(users?.data?.data.length);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    console.log(isLoggedIn);
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      getUserCheckinOfDate();
      getAllUserWithField();
    }
  }, [startDate]);

  const getUserCheckinOfDate = async () => {
    setIsDataLoaded(false);
    const field = {
      date: startDate,
      position: userData?.position,
    };
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${CHECKIN}${GET_CHECKIN_OF_DATE}`,
        {
          ...field,
        }
      );
      if (response?.data?.success) {
        setCheckinData(response?.data?.data);
        setIsDataEmpty(response?.data?.data.length === 0);
      } else {
        setIsDataEmpty(true);
      }
    } catch (error) {
      console.log(error);
    }
    setIsDataLoaded(true);
  };

  const handleChangeDate = async (date) => {
    try {
      const dateTarget = moment(date).format("YYYY-MM-DD");
      setStartDate(dateTarget);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <CContainer>
        <WidgetsBrand users={isUserAtPosition} />
        <CCard className="mb-4 mt-4">
          <CCardHeader>
            <CRow>
              <CCol sm={5}>
                <h4 id="traffic" className="card-title mb-0">
                  CHECKIN
                </h4>
                <div className="small text-body-secondary">{startDate}</div>
              </CCol>
              <CCol>
                <DatePicker
                  selected={new Date(startDate)}
                  onChange={(date) => handleChangeDate(date)}
                  dateFormat="yyyy-MM-dd"
                />
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody>
            {isDataLoaded && isDataEmpty ? (
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
                      User
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
                    <CTableRow key={index}>
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
                        <div className={item.is_weekend ? "bg-primary" : ""}>
                          {item.is_weekend ? "Yes" : "No"}
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
      </CContainer>
    </>
  );
};

export default Dashboard;
