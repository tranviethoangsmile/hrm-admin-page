import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  const today = moment().format("YYYY-MM-DD");
  const subtractToday = moment(today).subtract(1, "day").format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(subtractToday);
  const [checkinData, setCheckinData] = useState([]);
  const [dataNotExist, setDataNotExist] = useState("");
  const [users, setUsers] = useState(0);

  const userData = JSON.parse(sessionStorage.getItem("userIF"));
  useEffect(() => {
    getUserCheckinOfDate();
    getAllUser();
  }, [startDate]);
  const getAllUser = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${FIND_ALL_USER_WITH_FIELD}`,
        {
          position: userData?.position,
        }
      );
      if (response?.data?.success) {
        setUsers(response?.data?.data.length);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getUserCheckinOfDate = async () => {
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
        console.log(response.data.data);
        setCheckinData(response?.data?.data);
      } else {
        setDataNotExist("data not exists");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeDate = async (date) => {
    try {
      const dateTaget = moment(date).format("YYYY-MM-DD");
      setStartDate(dateTaget);
      getUserCheckinOfDate();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <CContainer>
        <WidgetsBrand users={users} />
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
                  selected={startDate}
                  onChange={(date) => handleChangeDate(date)}
                  dateFormat="YYYY-MM-dd"
                />
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody>
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
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  );
};

export default Dashboard;
