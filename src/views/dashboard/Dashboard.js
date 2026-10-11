import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilClock } from "@coreui/icons";

import {
  buildApiUrl,
  CHECKIN,
  DASHBOARDS,
  FIND_USER_BY_FIELD,
  GET_CHECKIN_IN_DATE_OF_POSITION,
  OVERTIME_REQUEST,
  PAID_LEAVE,
  GET_ALL_BY_DEPARTMENT_ID,
  SAFETY_REPORT,
  SEARCH,
  USER_URL,
} from "../../constants";
import { adminRequest, withAdminUser } from "../../api/adminClient";

import StatsCards from "./components/StatsCards";
import AttendanceChart from "./components/AttendanceChart";
import CheckinTable from "./components/CheckinTable";
import {
  PendingActionsPanel,
  RecentActivityPanel,
  AbsentEmployeesPanel,
} from "./components/DashboardBottomPanels";
import { toList } from "./dashboardHelpers";
import { useTranslation } from "react-i18next";

const countOf = (value) => {
  if (typeof value === "number") return value;
  if (Array.isArray(value)) return value.length;
  if (!value || typeof value !== "object") return 0;
  return (
    value.count ??
    value.rows?.length ??
    value.data?.count ??
    value.data?.rows?.length ??
    0
  );
};

const getRecordUserId = (item) =>
  item?.user_id || item?.User?.id || item?.user?.id || item?.id || null;

const getEmployeeName = (item) =>
  item?.name || item?.user_name || item?.User?.name || item?.user?.name || "Unknown";

const Dashboard = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("userIF")) || {};
  const today = moment().format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(
    moment(today).subtract(1, "day").toDate()
  );
  const [checkinData, setCheckinData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [isCheckinDataEmpty, setIsCheckinDataEmpty] = useState(false);
  const [isUserAtPosition, setIsUserAtPosition] = useState(0);
  const [paidCound, setPaidCount] = useState(0);
  const [isCheckinDetailModal, setIsCheckinDetailModal] = useState(false);
  const [checkinDetail, setCheckinDetail] = useState([]);
  const [timeWorkTotal, setTimeWorkTotal] = useState(0);
  const [OverTimeTotal, setOverTimeTotal] = useState(0);
  const [weekEndTimeTotal, setWeekEndTimeTotal] = useState(0);
  const [dayShitfTotal, setDayShiftTotal] = useState(0);
  const [nightShiftTotal, setNightShiftTotal] = useState(0);
  const [activeDetailUser, setActiveDetailUser] = useState("");
  const [pendingLeave, setPendingLeave] = useState(0);
  const [pendingOt, setPendingOt] = useState(0);
  const [pendingSafety, setPendingSafety] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingUniforms, setPendingUniforms] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const presentRecords = useMemo(
    () => checkinData.filter((item) => !item?.is_paid_leave),
    [checkinData]
  );
  const leaveRecords = useMemo(
    () => checkinData.filter((item) => item?.is_paid_leave),
    [checkinData]
  );
  const absentEmployees = useMemo(() => {
    const recordedIds = new Set(
      checkinData
        .map(getRecordUserId)
        .filter(Boolean)
        .map((value) => String(value))
    );

    return [...employeeData]
      .filter((employee) => {
        const employeeId = getRecordUserId(employee);
        return employeeId && !recordedIds.has(String(employeeId));
      })
      .sort((a, b) =>
        getEmployeeName(a).localeCompare(getEmployeeName(b), "vi", {
          sensitivity: "base",
        })
      );
  }, [checkinData, employeeData]);

  const presentCount = presentRecords.length;
  const onLeaveToday = leaveRecords.length;
  const attendanceRate = isUserAtPosition
    ? Math.round((presentCount / isUserAtPosition) * 100)
    : 0;

  const getAllUserWithField = async () => {
    try {
      const data = await adminRequest({
        method: "post",
        path: `${DASHBOARDS}/admin/users/get-users`,
      });
      const users = toList(data);
      setEmployeeData(users);
      setIsUserAtPosition(countOf(data));
    } catch (error) {
      try {
        const response = await axios.post(
          buildApiUrl(USER_URL, FIND_USER_BY_FIELD),
          { position: userData.position }
        );
        if (response.data.success) {
          const users = response.data.data || [];
          setEmployeeData(users);
          setIsUserAtPosition(users.length);
        }
      } catch (fallbackError) {
        console.error("Error fetching user data:", fallbackError);
      }
    }
  };

  const getUserCheckinOfDate = async () => {
    try {
      const response = await axios.post(
        buildApiUrl(CHECKIN, GET_CHECKIN_IN_DATE_OF_POSITION),
        {
          date: moment(startDate).format("YYYY-MM-DD"),
          position: userData.position,
        }
      );

      if (response.data.success) {
        const items = response.data.data || [];
        setCheckinData(items);
        setIsCheckinDataEmpty(items.length === 0);
      } else {
        setCheckinData([]);
        setIsCheckinDataEmpty(true);
      }
    } catch (error) {
      console.error("Error fetching checkin data:", error);
    }
  };

  const getAdminSummary = async () => {
    const safeCount = async (request, predicate = () => true) => {
      try {
        const data = await adminRequest(request);
        const list = toList(data);
        return list.filter(predicate).length;
      } catch {
        return 0;
      }
    };

    let summary = null;
    try {
      summary = await adminRequest({
        method: "post",
        path: `${DASHBOARDS}/admin/summarys/s`,
        data: { date: today },
      });
      const summaryUsers = toList(summary?.users_by_position);
      if (summaryUsers.length > 0) {
        setEmployeeData(summaryUsers);
      }
      setIsUserAtPosition(countOf(summary?.users_by_position));
      setPendingLeave(countOf(summary?.pending_paid_leave));
      setPendingOrders(countOf(summary?.pending_orders));
      setPendingUniforms(countOf(summary?.uniforms_pending));
    } catch {
      summary = null;
    }

    const [otCount, safetyCount] = await Promise.all([
      safeCount(
        {
          method: "post",
          path: `${OVERTIME_REQUEST}/getAll`,
          data: withAdminUser({}),
        },
        (item) => !item?.is_approved
      ),
      safeCount({
        method: "post",
        path: `${SAFETY_REPORT}${GET_ALL_BY_DEPARTMENT_ID}`,
        data: { id: userData.department_id },
      }),
    ]);

    if (!summary) {
      const leaveCount = await safeCount({
        method: "post",
        path: `${PAID_LEAVE}/search`,
        data: {
          position: userData.position,
          is_approve: true,
          is_confirm: false,
        },
      });
      setPendingLeave(leaveCount);
    }

    setPendingOt(otCount);
    setPendingSafety(safetyCount);
  };

  const handleShowCheckinDetailUser = async (id, name) => {
    try {
      const checkinDetailOfUser = await axios.post(
        buildApiUrl(CHECKIN, SEARCH),
        {
          user_id: id,
          date: moment(startDate).format("YYYY-MM-DD"),
        }
      );

      if (checkinDetailOfUser?.data.success) {
        const value = checkinDetailOfUser.data.data || [];
        const paidTotal = value.reduce(
          (total, item) => total + (item.is_paid_leave ? 1 : 0),
          0
        );
        const totalWorkTime = value.reduce((total, item) => {
          if (!item.is_weekend) return total + (item.work_time || 0);
          return total;
        }, 0);
        const totalOverTime = value.reduce(
          (total, item) => total + (item.over_time || 0),
          0
        );
        const totalDayShift = value.reduce(
          (total, item) => total + (item.work_shift === "DAY" ? 1 : 0),
          0
        );
        const totalNightShift = value.reduce(
          (total, item) => total + (item.work_shift === "NIGHT" ? 1 : 0),
          0
        );
        const totalWeekend = value.reduce((total, item) => {
          if (item.is_weekend) return total + (item.work_time || 0);
          return total;
        }, 0);

        setActiveDetailUser(name || "Employee");
        setDayShiftTotal(totalDayShift);
        setNightShiftTotal(totalNightShift);
        setOverTimeTotal(totalOverTime);
        setTimeWorkTotal(totalWorkTime);
        setWeekEndTimeTotal(totalWeekend);
        setPaidCount(paidTotal);
        setCheckinDetail(value);
        setIsCheckinDetailModal(true);
      } else {
        Swal.fire({
          position: "bottom-end",
          icon: "warning",
          width: "300px",
          title: checkinDetailOfUser?.data?.message,
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
      return;
    }
    Promise.all([
      getUserCheckinOfDate(),
      getAllUserWithField(),
      getAdminSummary(),
    ]).finally(() => setLoading(false));
  }, [startDate]);

  const userName = userData?.name || userData?.user_name || "Admin";

  return (
    <div className="hrm-dashboard">
      <div className="hrm-dashboard__intro">
        <h2>{t("dashboard.overview", "Tổng quan")}</h2>
        <p>
          {t("dashboard.welcomeBack", "Chào mừng quay lại, {{name}}", {
            name: userName,
            position: userData.position || "đội của bạn",
          })}
        </p>
      </div>

      <StatsCards
        totalEmployees={isUserAtPosition}
        presentCount={presentCount}
        attendanceRate={attendanceRate}
        pendingLeave={pendingLeave}
        pendingOt={pendingOt}
        onLeaveToday={onLeaveToday}
        pendingSafety={pendingSafety}
        empty={loading}
      />

      <AttendanceChart
        startDate={startDate}
        onDateChange={setStartDate}
        totalEmployees={isUserAtPosition}
        checkinData={checkinData}
      />

      <CheckinTable
        startDate={startDate}
        onDateChange={setStartDate}
        checkinData={checkinData}
        isEmpty={isCheckinDataEmpty}
        loading={loading}
        onViewDetail={handleShowCheckinDetailUser}
      />

      <div className="hrm-dashboard-row hrm-dashboard-row--2">
        <AbsentEmployeesPanel
          selectedDate={startDate}
          absentEmployees={absentEmployees}
        />
        <PendingActionsPanel
          pendingLeave={pendingLeave}
          pendingOt={pendingOt}
          pendingSafety={pendingSafety}
          pendingOrders={pendingOrders}
          pendingUniforms={pendingUniforms}
        />
      </div>

      <RecentActivityPanel checkinData={checkinData} />

      <CModal
        visible={isCheckinDetailModal}
        alignment="center"
        size="lg"
        onClose={() => setIsCheckinDetailModal(false)}
      >
        <CModalHeader>
          <CModalTitle>Chi tiết chấm công — {activeDetailUser}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mini-kpi-grid mb-4">
            <div className="mini-kpi">
              <span>Giờ làm</span>
              <strong>{timeWorkTotal}</strong>
            </div>
            <div className="mini-kpi">
              <span>Tăng ca</span>
              <strong>{OverTimeTotal}</strong>
            </div>
            <div className="mini-kpi">
              <span>Cuối tuần</span>
              <strong>{weekEndTimeTotal}</strong>
            </div>
            <div className="mini-kpi">
              <span>Nghỉ phép</span>
              <strong>{paidCound}</strong>
            </div>
            <div className="mini-kpi">
              <span>Ca ngày</span>
              <strong>{dayShitfTotal}</strong>
            </div>
            <div className="mini-kpi">
              <span>Ca đêm</span>
              <strong>{nightShiftTotal}</strong>
            </div>
          </div>
          <div className="hrm-table-wrap">
            <table className="hrm-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Ca</th>
                  <th>Giờ</th>
                  <th>OT</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {checkinDetail.map((item, index) => (
                  <tr key={item?.id || index}>
                    <td>{moment(item?.date || startDate).format("DD/MM/YYYY")}</td>
                    <td>{item?.work_shift || "—"}</td>
                    <td>{item?.work_time || 0}</td>
                    <td>{item?.over_time || 0}</td>
                    <td>
                      <span
                        className={`hrm-badge ${item?.is_paid_leave ? "hrm-badge--warning" : "hrm-badge--success"}`}
                      >
                        {item?.is_paid_leave ? "Nghỉ phép" : "Đã làm"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CModalBody>
      </CModal>
    </div>
  );
};

export default Dashboard;
