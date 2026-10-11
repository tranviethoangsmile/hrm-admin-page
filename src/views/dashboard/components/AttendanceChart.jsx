import React, { useMemo } from "react";
import moment from "moment";
import { WEEKDAY_LABELS } from "../dashboardHelpers";

const AttendanceChart = ({ startDate, totalEmployees, checkinData, onDateChange }) => {
  const selectedMoment = moment(startDate);
  const selectedDay = selectedMoment.day();
  const selectedLabel = WEEKDAY_LABELS[selectedDay];

  const dayStats = useMemo(() => {
    const present = checkinData.filter((item) => !item?.is_paid_leave).length;
    const leave = checkinData.filter((item) => item?.is_paid_leave).length;
    const absent = Math.max(0, totalEmployees - present - leave);
    return { present, leave, absent, late: 0 };
  }, [checkinData, totalEmployees]);

  const total = Math.max(totalEmployees, 1);
  const presentPct = Math.round((dayStats.present / total) * 100);
  const leavePct = Math.round((dayStats.leave / total) * 100);
  const absentPct = Math.round((dayStats.absent / total) * 100);
  const computedPct = presentPct + leavePct + absentPct;
  const absentAdjustedPct = absentPct + Math.max(0, 100 - computedPct);

  const weekStart = selectedMoment.clone().startOf("week");
  const weekDays = [...Array(7)].map((_, index) => {
    const day = weekStart.clone().add(index, "days");
    return {
      label: WEEKDAY_LABELS[day.day()],
      date: day.format("DD/MM"),
      isActive: index === selectedDay,
    };
  });

  return (
    <div className="hrm-panel">
      <div className="hrm-panel__header">
        <h3 className="hrm-panel__title">Chấm công theo ngày</h3>
        <p className="hrm-panel__subtitle">
          Ngày {moment(startDate).format("DD/MM/YYYY")}
        </p>
      </div>
      <div className="hrm-panel__body">
        <div className="hrm-week-chips">
          {weekDays.map((day) => (
            <button
              type="button"
              key={day.label}
              className={`hrm-week-chip${day.isActive ? " hrm-week-chip--active" : ""}`}
              onClick={() => onDateChange && onDateChange(moment(day.date, "DD/MM").toDate())}
              disabled={!onDateChange}
            >
              <span className="hrm-week-chip__label">{day.label}</span>
              <span className="hrm-week-chip__date">{day.date}</span>
            </button>
          ))}
        </div>

        <div className="hrm-day-summary">
          <div className="hrm-day-summary__bar">
            {dayStats.present > 0 && (
              <div
                className="hrm-day-summary__segment hrm-day-summary__segment--present"
                style={{ width: `${presentPct}%` }}
              />
            )}
            {dayStats.leave > 0 && (
              <div
                className="hrm-day-summary__segment hrm-day-summary__segment--leave"
                style={{ width: `${leavePct}%` }}
              />
            )}
            {dayStats.absent > 0 && (
              <div
                className="hrm-day-summary__segment hrm-day-summary__segment--absent"
                style={{ width: `${absentAdjustedPct}%` }}
              />
            )}
          </div>

          <div className="hrm-day-summary__grid">
            <div className="hrm-day-summary__cell hrm-day-summary__cell--present">
              <span className="hrm-day-summary__value">{dayStats.present}</span>
              <span className="hrm-day-summary__label">Có mặt</span>
            </div>
            <div className="hrm-day-summary__cell hrm-day-summary__cell--leave">
              <span className="hrm-day-summary__value">{dayStats.leave}</span>
              <span className="hrm-day-summary__label">Nghỉ phép</span>
            </div>
            <div className="hrm-day-summary__cell hrm-day-summary__cell--absent">
              <span className="hrm-day-summary__value">{dayStats.absent}</span>
              <span className="hrm-day-summary__label">Vắng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;