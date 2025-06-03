import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useTranslation } from "react-i18next";
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
  CButton,
} from "@coreui/react";
import {
  BASE_URL,
  V1,
  VERSION,
  API,
  PORT,
  ORDER_URL,
  SEARCH_ORDER_WITH_FIELD,
} from "../../constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MealManagement = () => {
  const { t } = useTranslation();
  const userData = JSON.parse(sessionStorage.getItem("userIF")) || {};
  const today = moment().format("YYYY-MM-DD");
  const [orderDate, setOrderDate] = useState(new Date(today));
  const [orderData, setOrderData] = useState([]);
  const [isOrderDataEmpty, setIsOrderDataEmpty] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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
      } else {
        setIsOrderDataEmpty(true);
      }
    } catch (error) {
      setIsOrderDataEmpty(true);
    } finally {
      setIsDataLoaded(true);
    }
  };

  useEffect(() => {
    getOrderInDateOfPosition();
    // eslint-disable-next-line
  }, [orderDate]);

  return (
    <div className="meal-management-page bg-light py-4 px-2 px-md-4 min-vh-100">
      {/* Header filter modern, chỉ giữ date picker */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#1a7f37" }}>
            {t("meals")}
          </h2>
          <div className="text-muted">
            {t("homeBreadcrumb")} / {t("meals")}
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center bg-white rounded-4 shadow-sm px-3 py-2">
          <DatePicker
            selected={orderDate}
            onChange={setOrderDate}
            dateFormat="yyyy-MM-dd"
            className="form-control form-control-sm w-auto"
            style={{ maxWidth: 140 }}
          />
        </div>
      </div>
      <CCard className="mb-4">
        <CCardHeader>
          <h5 className="mb-0">{t("meals")}</h5>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol xs={12}>
              <div className="table-responsive">
                <CTable align="middle" hover responsive bordered>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>{t("employee")}</CTableHeaderCell>
                      <CTableHeaderCell>{t("department")}</CTableHeaderCell>
                      <CTableHeaderCell>{t("date")}</CTableHeaderCell>
                      <CTableHeaderCell>{t("shift")}</CTableHeaderCell>
                      <CTableHeaderCell>{t("meals")}</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {isDataLoaded && isOrderDataEmpty ? (
                      <CTableRow>
                        <CTableDataCell
                          colSpan={5}
                          className="text-center text-muted py-5"
                        >
                          {t("noData")}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      orderData.map((item, idx) => (
                        <CTableRow key={idx}>
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
                          <CTableDataCell>{item.date}</CTableDataCell>
                          <CTableDataCell>
                            <span
                              className={
                                item.dayOrNight === "DAY"
                                  ? "badge bg-success"
                                  : "badge bg-info text-dark"
                              }
                            >
                              {item.dayOrNight === "DAY"
                                ? t("dayShift")
                                : t("nightShift")}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell>{item.mealCount}</CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default MealManagement;
