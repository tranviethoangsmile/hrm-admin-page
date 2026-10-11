import React from "react";
import DatePicker from "react-datepicker";
import { getInitials, getPersonName } from "../dashboardHelpers";

const CheckinTable = ({
  startDate,
  onDateChange,
  checkinData,
  isEmpty,
  loading,
  onViewDetail,
}) => (
  <div className="hrm-panel">
    <div className="hrm-panel__header">
      <div className="hrm-panel__header-row">
        <div>
          <h3 className="hrm-panel__title">Chấm công trong ngày</h3>
          <p className="hrm-panel__subtitle">
            Danh sách nhân viên đã ghi nhận chấm công
          </p>
        </div>
        <div className="hrm-panel__actions">
          <div className="hrm-date-filter">
            <label>Ngày</label>
            <DatePicker
              selected={startDate}
              onChange={onDateChange}
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>
      </div>
    </div>
    <div className="hrm-panel__body">
      {loading ? (
        <div className="hrm-table-skeleton">
          {[...Array(5)].map((_, index) => (
            <div className="hrm-table-skeleton__row" key={index}>
              <div className="hrm-table-skeleton__cell" />
              <div className="hrm-table-skeleton__cell" />
              <div className="hrm-table-skeleton__cell" />
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="hrm-empty">Chưa có dữ liệu chấm công cho ngày này.</div>
      ) : (
        <div className="hrm-table-wrap">
          <table className="hrm-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Ca</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {checkinData.slice(0, 10).map((item, index) => {
                const name = getPersonName(item);
                const shift =
                  item?.work_shift || item?.dayOrNight || item?.shift || "-";
                const paid = item?.is_paid_leave;
                const userId = item?.user_id || item?.id || item?.user?.id;

                return (
                  <tr key={`${userId || name}-${index}`}>
                    <td>
                      <div className="hrm-employee-cell">
                        <span className="hrm-avatar">{getInitials(name)}</span>
                          <div>
                          <div className="hrm-employee-cell__name">{name}</div>
                          <div className="hrm-employee-cell__meta">
                            {item?.position ||
                              item?.user?.position ||
                              item?.User?.position ||
                              item?.userDetail?.position ||
                              "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{shift}</td>
                    <td>
                      <span
                        className={`hrm-badge ${paid ? "hrm-badge--warning" : "hrm-badge--success"}`}
                      >
                        {paid ? "Nghỉ phép" : "Có mặt"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="hrm-btn-ghost"
                        onClick={() => onViewDetail(userId, name)}
                        disabled={!userId}
                      >
                        Chi tiết
                      </button>
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

export default CheckinTable;
