import React from "react";
import CIcon from "@coreui/icons-react";
import { cilClock } from "@coreui/icons";
import { useNavigate } from "react-router-dom";
import { getInitials, getPersonName } from "../dashboardHelpers";

export const PendingActionsPanel = ({
  pendingLeave,
  pendingOt,
  pendingSafety,
  pendingOrders,
  pendingUniforms,
}) => {
  const navigate = useNavigate();
  const total = pendingLeave + pendingOt + pendingSafety + pendingOrders + pendingUniforms;

  const items = [
    {
      title: "Đơn nghỉ phép",
      count: pendingLeave,
      path: "/paidleave",
      badge: "hrm-badge--warning",
    },
    {
      title: "Yêu cầu tăng ca",
      count: pendingOt,
      path: "/overtime-request",
      badge: "hrm-badge--info",
    },
    {
      title: "Báo cáo an toàn",
      count: pendingSafety,
      path: "/safety-reports",
      badge: "hrm-badge--danger",
    },
    {
      title: "Đơn đặt cơm hôm nay",
      count: pendingOrders,
      path: "/orders",
      badge: "hrm-badge--success",
    },
    {
      title: "Đơn đồng phục",
      count: pendingUniforms,
      path: "/uniform-orders",
      badge: "hrm-badge--muted",
    },
  ];

  return (
    <div className="hrm-panel">
      <div className="hrm-panel__header">
        <div className="hrm-panel__header-row">
          <div>
            <h3 className="hrm-panel__title">Việc cần xử lý</h3>
            <p className="hrm-panel__subtitle">Đơn và báo cáo đang chờ duyệt</p>
          </div>
          {total > 0 && <span className="hrm-badge-count">{total} mục</span>}
        </div>
      </div>
      <div className="hrm-panel__body">
        {items.map((item) => (
          <div className="hrm-list-item" key={item.title}>
            <div className="hrm-list-item__content">
              <div className="hrm-list-item__title">{item.title}</div>
              <div className="hrm-list-item__sub">
                <span className={`hrm-badge ${item.badge}`}>
                  {item.count} chờ xử lý
                </span>
              </div>
            </div>
            <button
              type="button"
              className="hrm-btn-ghost"
              onClick={() => navigate(item.path)}
            >
              Xem
            </button>
          </div>
        ))}
        {total === 0 && (
          <div className="hrm-empty">Không có việc chờ xử lý.</div>
        )}
      </div>
    </div>
  );
};

export const RecentActivityPanel = ({ checkinData }) => (
  <div className="hrm-panel">
    <div className="hrm-panel__header">
      <h3 className="hrm-panel__title">Hoạt động gần đây</h3>
      <p className="hrm-panel__subtitle">Chấm công và ghi nhận trong ngày</p>
    </div>
    <div className="hrm-panel__body">
      {checkinData.length === 0 ? (
        <div className="hrm-empty">Chưa có hoạt động.</div>
      ) : (
        checkinData.slice(0, 5).map((item, index) => {
          const name = getPersonName(item);
          const paid = item?.is_paid_leave;
          const shift = item?.work_shift || item?.dayOrNight || "—";

          return (
            <div className="hrm-list-item" key={`activity-${index}`}>
              <span className="hrm-avatar">{getInitials(name)}</span>
              <div className="hrm-list-item__content">
                <div className="hrm-list-item__title">{name}</div>
                <div className="hrm-list-item__meta">
                  <span
                    className={`hrm-badge ${paid ? "hrm-badge--warning" : "hrm-badge--success"}`}
                  >
                    {paid ? "Nghỉ phép" : "Có mặt"}
                  </span>
                  <span>
                    <CIcon icon={cilClock} size="sm" className="me-1" />
                    Ca {shift}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);

export const AbsentEmployeesPanel = ({
  selectedDate,
  absentEmployees,
}) => {
  const dateLabel = new Date(selectedDate).toLocaleDateString("vi-VN");

  return (
    <div className="hrm-panel">
      <div className="hrm-panel__header">
        <div className="hrm-panel__header-row">
          <div>
            <h3 className="hrm-panel__title">Danh sách vắng</h3>
            <p className="hrm-panel__subtitle">
              Nhân viên không có chấm công và không nằm trong danh sách nghỉ phép ngày{" "}
              {dateLabel}
            </p>
          </div>
          <span className="hrm-badge-count">{absentEmployees.length} người</span>
        </div>
      </div>
      <div className="hrm-panel__body">
        {absentEmployees.length === 0 ? (
          <div className="hrm-empty">Không có nhân viên vắng trong ngày này.</div>
        ) : (
          <div className="hrm-table-wrap">
            <table className="hrm-table">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Phòng ban</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {absentEmployees.slice(0, 12).map((item, index) => {
                  const name = getPersonName(item);
                  const department =
                    item?.department?.name ||
                    item?.Department?.name ||
                    item?.department_name ||
                    item?.departmentName ||
                    "—";
                  const key = item?.id || item?.employee_id || name || index;

                  return (
                    <tr key={`${key}-${index}`}>
                      <td>
                        <div className="hrm-employee-cell">
                          <span className="hrm-avatar">{getInitials(name)}</span>
                          <div>
                            <div className="hrm-employee-cell__name">{name}</div>
                            <div className="hrm-employee-cell__meta">
                              {item?.email || item?.phone || item?.id || "Không có mã"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{department}</td>
                      <td>
                        <span className="hrm-badge hrm-badge--danger">Vắng</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
