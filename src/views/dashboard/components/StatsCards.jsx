import React from "react";
import CIcon from "@coreui/icons-react";
import {
  cilCalendarCheck,
  cilClock,
  cilPeople,
  cilSun,
} from "@coreui/icons";
import { useTranslation } from "react-i18next";

const StatCard = ({ label, value, change, changeTone, icon, iconClass }) => (
  <div className="hrm-stat-card">
    <div className="hrm-stat-card__inner">
      <div className="hrm-stat-card__text">
        <div className="hrm-stat-card__label">{label}</div>
        <div className="hrm-stat-card__value">{value}</div>
        {change && (
          <div className={`hrm-stat-card__change hrm-stat-card__change--${changeTone}`}>
            {change}
          </div>
        )}
      </div>
      <div className={`hrm-stat-card__icon ${iconClass}`}>
        <CIcon icon={icon} className="icon" />
      </div>
    </div>
  </div>
);

const StatsCards = ({
  totalEmployees,
  presentCount,
  attendanceRate,
  pendingLeave,
  pendingOt,
  onLeaveToday,
  empty,
}) => {
  const { t } = useTranslation();

  if (empty) {
    return (
      <div className="hrm-stats-grid">
        {[...Array(4)].map((_, index) => (
          <div className="hrm-stat-card hrm-stat-card--skeleton" key={index}>
            <div className="hrm-stat-card__skeleton-label" />
            <div className="hrm-stat-card__skeleton-value" />
            <div className="hrm-stat-card__skeleton-change" />
          </div>
        ))}
      </div>
    );
  }

  const leaveChange =
    onLeaveToday > 0
      ? `${onLeaveToday} ${t("dashboard.onLeaveToday")}`
      : t("dashboard.noLeaveToday");

  const cards = [
    {
      key: "employees",
      label: t("dashboard.totalEmployees", "Tổng nhân viên"),
      value: totalEmployees ?? 0,
      change: t("dashboard.totalEmployeesHint"),
      changeTone: "neutral",
      icon: cilPeople,
      iconClass: "hrm-stat-card__icon--primary",
    },
    {
      key: "present",
      label: t("dashboard.present", "Đang làm việc"),
      value: presentCount ?? 0,
      change: `${attendanceRate}% ${t("dashboard.attendanceRate")}`,
      changeTone: presentCount > 0 ? "positive" : "neutral",
      icon: cilSun,
      iconClass: "hrm-stat-card__icon--chart1",
    },
    {
      key: "pendingLeave",
      label: t("pendingLeave"),
      value: pendingLeave ?? 0,
      change: leaveChange,
      changeTone: pendingLeave > 0 ? "negative" : "positive",
      icon: cilCalendarCheck,
      iconClass: "hrm-stat-card__icon--chart3",
    },
    {
      key: "pendingOt",
      label: t("pendingOt"),
      value: pendingOt ?? 0,
      change: t("dashboard.pendingOtHint"),
      changeTone: pendingOt > 0 ? "negative" : "positive",
      icon: cilClock,
      iconClass: "hrm-stat-card__icon--chart4",
    },
  ];

  return (
    <div className="hrm-stats-grid">
      {cards.map((card) => (
        <StatCard {...card} key={card.key} />
      ))}
    </div>
  );
};

export default StatsCards;