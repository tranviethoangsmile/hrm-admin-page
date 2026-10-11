import { useCallback, useEffect, useMemo, useState } from "react";
import CIcon from "@coreui/icons-react";
import {
  cilBell,
  cilCheckCircle,
  cilEnvelopeOpen,
  cilInfo,
  cilPaperPlane,
  cilSearch,
  cilSend,
  cilTrash,
  cilUser,
  cilWarning,
  cilXCircle,
} from "@coreui/icons";
import { CButton, CFormInput, CFormTextarea, CSpinner } from "@coreui/react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

import { adminRequest, getCurrentUser } from "../../api/adminClient";
import { DASHBOARDS, NOTIFICATION } from "../../constants";

const TYPE_META = {
  INFO: { icon: cilInfo, color: "#2f7cf6", soft: "rgba(47,124,246,.12)" },
  WARNING: { icon: cilWarning, color: "#f5a623", soft: "rgba(245,166,35,.14)" },
  ERROR: { icon: cilXCircle, color: "#e5484d", soft: "rgba(229,72,77,.12)" },
  SUCCESS: { icon: cilCheckCircle, color: "#14a04f", soft: "rgba(20,160,79,.12)" },
  SYSTEM: { icon: cilBell, color: "#8b5cf6", soft: "rgba(139,92,246,.13)" },
};

const NOTIFICATION_TYPES = Object.keys(TYPE_META);

const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const timeAgo = (value, t) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const intervals = [
    { label: t("notifCenter.year"), secs: 31536000 },
    { label: t("notifCenter.month"), secs: 2592000 },
    { label: t("notifCenter.week"), secs: 604800 },
    { label: t("notifCenter.day"), secs: 86400 },
    { label: t("notifCenter.hour"), secs: 3600 },
    { label: t("notifCenter.minute"), secs: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.secs);
    if (count > 0) return `${count} ${interval.label} ${t("notifCenter.ago")}`;
  }
  return t("notifCenter.justNow");
};

const NotificationCenter = () => {
  const { t } = useTranslation();
  const currentUser = useMemo(() => getCurrentUser(), []);

  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "INFO" });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminRequest({
        method: "post",
        path: `${NOTIFICATION}/searchById`,
        data: { user_id: currentUser.id },
      });
      setNotifications(toArray(data));
      setError("");
    } catch (err) {
      if (!/(not available|not found)/i.test(err.message || "")) {
        setError(err.message);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminRequest({ method: "get", path: "/users" });
      setUsers(toArray(data));
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, [fetchNotifications, fetchUsers]);

  const filteredList = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return notifications.filter((item) => {
      if (activeType !== "ALL" && item.type !== activeType) return false;
      if (!needle) return true;
      return `${item.title} ${item.message}`.toLowerCase().includes(needle);
    });
  }, [notifications, activeType, search]);

  const visibleUsers = useMemo(() => {
    const needle = userQuery.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (user) =>
        `${user.name} ${user.employee_id ?? ""} ${user.user_name ?? ""} ${
          user.department?.name ?? ""
        }`
          .toLowerCase()
          .includes(needle)
    );
  }, [users, userQuery]);

  const selectedUserInfo = users.find(
    (user) => String(user.id) === String(selectedUser)
  );

  const handleSend = async () => {
    if (!selectedUser) {
      setError(t("notifCenter.chooseRecipientRequired"));
      return;
    }
    if (!form.title.trim() || !form.message.trim()) {
      setError(t("notifCenter.titleMessageRequired"));
      return;
    }
    setSending(true);
    setError("");
    try {
      await adminRequest({
        method: "post",
        path: `${DASHBOARDS}/admin/notifications/create-notification`,
        data: {
          user_id: selectedUser,
          title: form.title.trim(),
          message: form.message.trim(),
          type: form.type,
        },
      });
      setForm({ title: "", message: "", type: "INFO" });
      setSelectedUser("");
      setUserQuery("");
      Swal.fire({
        icon: "success",
        title: t("notifCenter.sentTitle"),
        text: t("notifCenter.sentText"),
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      setError(err.message || t("notifCenter.sendFailed"));
    } finally {
      setSending(false);
    }
  };

  const markRead = async (item) => {
    try {
      await adminRequest({
        method: "put",
        path: `${NOTIFICATION}/update`,
        data: { id: item.id },
      });
      setNotifications((list) => list.filter((n) => n.id !== item.id));
    } catch {
      setNotifications((list) => list.filter((n) => n.id !== item.id));
    }
  };

  const handleDelete = async (item) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: t("notifCenter.deleteTitle"),
      text: t("notifCenter.deleteText"),
      showCancelButton: true,
      confirmButtonColor: "#e5484d",
      confirmButtonText: t("notifCenter.delete"),
    });
    if (!confirm.isConfirmed) return;
    try {
      await adminRequest({
        method: "post",
        path: `${NOTIFICATION}/destroy`,
        data: { id: item.id },
      });
      setNotifications((list) => list.filter((n) => n.id !== item.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const counts = useMemo(() => {
    const result = { ALL: notifications.length };
    NOTIFICATION_TYPES.forEach((type) => {
      result[type] = notifications.filter((n) => n.type === type).length;
    });
    return result;
  }, [notifications]);

  return (
    <div className="notif-page">
      <section className="content-panel notif-hero">
        <div className="notif-hero__left">
          <span className="notif-hero__kicker">
            <CIcon icon={cilBell} />
            {t("notifCenter.kicker")}
          </span>
          <h1 className="notif-hero__title">{t("notifCenter.title")}</h1>
          <p className="notif-hero__subtitle">
            {t("notifCenter.subtitle")}
          </p>
        </div>
        <div className="notif-hero__stats">
          <div className="notif-stat">
            <span className="notif-stat__value">{notifications.length}</span>
            <span className="notif-stat__label">{t("notifCenter.unread")}</span>
          </div>
          {NOTIFICATION_TYPES.map((type) => (
            <div className="notif-stat" key={type}>
              <span className="notif-stat__value" style={{ color: TYPE_META[type].color }}>
                {counts[type]}
              </span>
              <span className="notif-stat__label">{type.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="notif-grid">
        <section className="content-panel notif-composer">
          <div className="notif-composer__head">
            <CIcon icon={cilPaperPlane} className="notif-composer__head-icon" />
            <div>
              <h3>{t("notifCenter.compose")}</h3>
              <p>{t("notifCenter.composeHint")}</p>
            </div>
          </div>

          <div className="notif-composer__field">
            <label>{t("notifCenter.recipient")}</label>
            <div className="notif-user-select">
              <div className="notif-user-select__trigger">
                <CIcon icon={cilUser} className="notif-user-select__search-icon" />
                <CFormInput
                  type="search"
                  placeholder={t("notifCenter.searchRecipient")}
                  value={userQuery}
                  onChange={(e) => {
                    setUserQuery(e.target.value);
                    setUserSelectOpen(true);
                  }}
                  onFocus={() => setUserSelectOpen(true)}
                  onBlur={() => {
                    setTimeout(() => setUserSelectOpen(false), 150);
                  }}
                />
              </div>
              {userSelectOpen && (
                <div className="notif-user-select__dropdown">
                  {visibleUsers.length === 0 ? (
                    <div className="notif-user-select__empty">
                      {t("notifCenter.noUserMatch")}
                    </div>
                  ) : (
                    visibleUsers.slice(0, 12).map((user) => (
                      <button
                        type="button"
                        key={user.id}
                        className="notif-user-option"
                        onClick={() => {
                          setSelectedUser(user.id);
                          setUserQuery("");
                          setUserSelectOpen(false);
                        }}
                      >
                        <span className="notif-user-option__avatar">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" />
                          ) : (
                            <CIcon icon={cilUser} />
                          )}
                        </span>
                        <span className="notif-user-option__info">
                          <span className="notif-user-option__name">{user.name}</span>
                          <span className="notif-user-option__meta">
                            {`${user.employee_id ?? user.user_name ?? ""}${
                              user.department?.name ? ` — ${user.department.name}` : ""
                            }`}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedUserInfo && (
              <div className="notif-recipient-chip">
                <span className="notif-recipient-chip__avatar">
                  {selectedUserInfo.avatar ? (
                    <img src={selectedUserInfo.avatar} alt="" />
                  ) : (
                    <CIcon icon={cilUser} />
                  )}
                </span>
                <div>
                  <div className="notif-recipient-chip__name">
                    {selectedUserInfo.name}
                  </div>
                  <div className="notif-recipient-chip__meta">
                    {`${selectedUserInfo.employee_id ?? selectedUserInfo.user_name ?? ""}${
                      selectedUserInfo.department?.name
                        ? ` — ${selectedUserInfo.department.name}`
                        : ""
                    }`}
                  </div>
                </div>
                <button
                  type="button"
                  className="notif-recipient-chip__clear"
                  onClick={() => setSelectedUser("")}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="notif-composer__field">
            <label>{t("notifCenter.type")}</label>
            <div className="notif-type-picker">
              {NOTIFICATION_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`notif-type-chip${form.type === type ? " is-active" : ""}`}
                  style={
                    form.type === type
                      ? { background: TYPE_META[type].soft, borderColor: TYPE_META[type].color, color: TYPE_META[type].color }
                      : undefined
                  }
                  onClick={() => setForm((f) => ({ ...f, type }))}
                >
                  <CIcon icon={TYPE_META[type].icon} />
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="notif-composer__field">
            <label>{t("notifCenter.titleLabel")}</label>
            <CFormInput
              placeholder={t("notifCenter.titlePlaceholder")}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="notif-composer__field">
            <label>{t("notifCenter.messageLabel")}</label>
            <CFormTextarea
              rows={4}
              placeholder={t("notifCenter.messagePlaceholder")}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>

          {error && <div className="notif-composer__error">{error}</div>}

          <CButton
            color="success"
            className="notif-composer__send"
            disabled={sending}
            onClick={handleSend}
          >
            {sending ? <CSpinner size="sm" /> : <CIcon icon={cilSend} />}
            {t("notifCenter.send")}
          </CButton>
        </section>

        <section className="content-panel notif-feed">
          <div className="notif-feed__toolbar">
            <div className="notif-feed__tabs">
              <button
                type="button"
                className={`notif-tab${activeType === "ALL" ? " is-active" : ""}`}
                onClick={() => setActiveType("ALL")}
              >
                {t("notifCenter.all")}
                <span className="notif-tab__count">{counts.ALL}</span>
              </button>
              {NOTIFICATION_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`notif-tab${activeType === type ? " is-active" : ""}`}
                  style={
                    activeType === type
                      ? { color: TYPE_META[type].color, borderColor: TYPE_META[type].color }
                      : undefined
                  }
                  onClick={() => setActiveType(type)}
                >
                  {type}
                  <span className="notif-tab__count">{counts[type]}</span>
                </button>
              ))}
            </div>
            <div className="notif-feed__search">
              <CIcon icon={cilSearch} />
              <CFormInput
                type="search"
                placeholder={t("notifCenter.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="notif-feed__status">
              <CSpinner color="success" />
              <span>{t("notifCenter.loading")}</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="notif-feed__status">
              <div className="notif-feed__empty-icon">
                <CIcon icon={cilEnvelopeOpen} />
              </div>
              <strong>{t("notifCenter.emptyTitle")}</strong>
              <span>{t("notifCenter.emptyHint")}</span>
            </div>
          ) : (
            <div className="notif-list">
              {filteredList.map((item) => {
                const meta = TYPE_META[item.type] || TYPE_META.INFO;
                return (
                  <div
                    className="notif-card"
                    key={item.id}
                    onClick={() => markRead(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") markRead(item);
                    }}
                  >
                    <span
                      className="notif-card__icon"
                      style={{ background: meta.soft, color: meta.color }}
                    >
                      <CIcon icon={meta.icon} />
                    </span>
                    <div className="notif-card__body">
                      <div className="notif-card__top">
                        <span
                          className="notif-card__type"
                          style={{ color: meta.color }}
                        >
                          {item.type}
                        </span>
                        <span className="notif-card__time">
                          {timeAgo(item.createdAt || item.created_at, t)}
                        </span>
                      </div>
                      <h4 className="notif-card__title">{item.title}</h4>
                      <p className="notif-card__message">{item.message}</p>
                    </div>
                    <button
                      type="button"
                      className="notif-card__delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      title={t("notifCenter.delete")}
                    >
                      <CIcon icon={cilTrash} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default NotificationCenter;