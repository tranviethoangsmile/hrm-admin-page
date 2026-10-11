import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilCloudDownload,
  cilZoomIn,
  cilFilter,
  cilInbox,
  cilPencil,
  cilPlus,
  cilReload,
  cilSearch,
  cilX,
} from "@coreui/icons";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

import { adminRequest, getCurrentUser, withAdminUser } from "../../api/adminClient";
import { adminModuleConfig } from "./moduleConfig";

/* ── Shared helpers ─────────────────────────────── */

const getValue = (item, key) => {
  const keys = Array.isArray(key) ? key : String(key).split("|");

  for (const currentKey of keys) {
    const value = currentKey
      .split(".")
      .reduce((currentValue, part) => currentValue?.[part], item);
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return undefined;
};

const isEmptyDataError = (message) =>
  /no .+(found|created|available)|not found|not available|no data|empty|không có dữ liệu|chưa có dữ liệu/i.test(
    message || ""
  );

const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (data?.data && typeof data.data === "object") return toArray(data.data);
  if (Array.isArray(data?.content)) return data.content;
  if (data && typeof data === "object") return [data];
  return [];
};

const isEmptyValue = (value) => value === "" || value === undefined || value === null;

const resolveValue = (value, ...args) =>
  typeof value === "function" ? value(...args) : value;

const EMPTY_COLUMNS = [];

const inferOptionSource = (field) =>
  ({
    position: "positions",
    product: "products",
    work_shift: "work_shifts",
    shift: "shifts",
    type: "notification_types",
    uniform_type: "uniform_types",
    uniform_size: "uniform_sizes",
    status: "tax_dependent_statuses",
    gender: "tax_dependent_gender_enum",
    relationship: "tax_dependent_relationship_enum",
    overtime_hours: "overtime_request_hours",
  })[field.key];

const buildDefaults = (fields = []) =>
  fields.reduce((values, field) => {
    const defaultValue =
      typeof field.defaultValue === "function"
        ? field.defaultValue()
        : field.defaultValue;
    values[field.key] = defaultValue ?? "";
    return values;
  }, {});

const buildValuesFromItem = (fields = [], item = {}) =>
  fields.reduce((values, field) => {
    const sourceKey = field.sourceKey || field.key;
    const currentValue = getValue(item, sourceKey);
    const defaultValue =
      typeof field.defaultValue === "function"
        ? field.defaultValue()
        : field.defaultValue;
    values[field.key] = currentValue ?? defaultValue ?? "";
    return values;
  }, {});

/* ── Status badges ──────────────────────────────── */

const STATUS_PALETTE_CLASS = {
  success: "status-badge--success",
  warning: "status-badge--warning",
  danger: "status-badge--danger",
  info: "status-badge--info",
  violet: "status-badge--violet",
  neutral: "status-badge--neutral",
};

const DEFAULT_STATUS_PALETTE = {
  pending: "warning",
  waiting: "warning",
  in_progress: "info",
  processing: "info",
  completed: "success",
  done: "success",
  cancelled: "neutral",
  approved: "success",
  rejected: "danger",
  confirmed: "success",
  unconfirmed: "warning",
  active: "success",
  valid: "success",
  invalid: "danger",
  locked: "neutral",
  yes: "success",
  no: "neutral",
  true: "success",
  false: "neutral",
};

const StatusBadge = ({ value, palette, t }) => {
  const textValue = typeof value === "boolean" ? (value ? "yes" : "no") : String(value ?? "");
  const key = textValue.trim().toLowerCase();
  const resolvedPalette = palette || DEFAULT_STATUS_PALETTE[key] || "neutral";
  const label = t(`status.${key}`, { defaultValue: textValue });

  return (
    <span className={`status-badge ${STATUS_PALETTE_CLASS[resolvedPalette] || STATUS_PALETTE_CLASS.neutral}`}>
      <span className="status-badge__dot" />
      {label}
    </span>
  );
};

StatusBadge.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  palette: PropTypes.string,
  t: PropTypes.func.isRequired,
};

/* ── Value formatting ───────────────────────────── */

const formatValue = (value, column, t) => {
  if (value === null || value === undefined || value === "") return "-";

  if (column.type === "boolean") {
    const boolValue = value === true || value === "true" || value === 1 || value === "1";
    return <StatusBadge value={boolValue} t={t} />;
  }

  if (column.type === "status") {
    return (
      <StatusBadge
        value={value}
        palette={typeof column.statusMap === "object" ? column.statusMap[String(value).toLowerCase()] : undefined}
        t={t}
      />
    );
  }

  if (column.type === "date" || column.type === "datetime") {
    return String(value).slice(0, 16);
  }

  if (column.type === "money") {
    const numeric = Number(value);
    return Number.isFinite(numeric)
      ? numeric.toLocaleString("vi-VN", { maximumFractionDigits: 0 })
      : value;
  }

  if (column.type === "link" && value) {
    return (
      <a
        href={String(value)}
        target="_blank"
        rel="noreferrer"
        className="text-decoration-none fw-semibold"
      >
        {String(value)}
      </a>
    );
  }

  if (typeof value === "object") {
    return value.name || value.title || value.id || JSON.stringify(value);
  }

  return String(value);
};

/* ── Row actions (config-driven) ────────────────── */

const getRowActions = (config) => [
  {
    label: "modulePage.detail",
    color: "info",
    variant: "outline",
    type: "detail",
    icon: cilZoomIn,
    visible: (item) => Boolean(item),
  },
  ...(config.update
    ? [
        {
          label: "modulePage.edit",
          color: "primary",
          variant: "outline",
          type: "update",
          icon: cilPencil,
        },
      ]
    : []),
  ...(config.rowActions || []),
  ...(config.delete
    ? [
        {
          label: "modulePage.delete",
          color: "danger",
          variant: "outline",
          type: "delete",
          method: config.delete.method || "post",
          path: config.delete.path,
          icon: cilX,
          visible: config.delete.visible,
          payload: (item, currentUser) => {
            const payload = { id: item.id, user_id: currentUser.id };
            return config.delete.adminUser ? withAdminUser(payload) : payload;
          },
        },
      ]
    : []),
];

const pageWindow = (page, totalPages) => {
  const delta = 2;
  const range = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      range.push(i);
    }
  }
  const out = [];
  let previous = 0;
  range.forEach((number) => {
    if (number - previous > 1) out.push("…");
    out.push(number);
    previous = number;
  });
  return out;
};

/* ── Main component ─────────────────────────────── */

const AdminModulePage = ({ moduleKey }) => {
  const { t } = useTranslation();
  const config = adminModuleConfig[moduleKey];
  const currentUser = useMemo(() => getCurrentUser(), []);

  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({});
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [adminEnums, setAdminEnums] = useState({});
  const [userOptions, setUserOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(() => buildDefaults(config?.create?.fields));
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateForm, setUpdateForm] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const rowActions = config ? getRowActions(config) : [];
  const columns = config?.columns ?? EMPTY_COLUMNS;
  const hasFilters = (config?.filters || []).length > 0;
  const pageSize = config?.pageSize || 10;

  const filledFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== "" && value !== undefined
        )
      ),
    [filters]
  );

  const filteredItems = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    if (!needle || !columns.length) return items;
    return items.filter((item) =>
      columns.some((column) => {
        const value = getValue(item, column.key);
        if (value === undefined || value === null) return false;
        const text =
          typeof value === "object"
            ? value.name || value.title || ""
            : String(value);
        return text.toLowerCase().includes(needle);
      })
    );
  }, [items, keyword, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const pageFrom = filteredItems.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const pageTo = Math.min(safePage * pageSize, filteredItems.length);

  const detailFields = useMemo(() => {
    if (!activeItem) return [];
    const mapped = columns.map((column) => ({
      label: column.label,
      key: Array.isArray(column.key) ? column.key.join(".") : column.key,
      value: getValue(activeItem, column.key),
      full: column.full || false,
    }));
    const covered = new Set(
      columns
        .flatMap((column) => (Array.isArray(column.key) ? column.key : [column.key]))
        .map((key) => key.split(".")[0])
    );
    Object.keys(activeItem).forEach((key) => {
      if (!covered.has(key)) {
        mapped.push({ label: key, key, value: activeItem[key], full: false });
      }
    });
    return mapped;
  }, [activeItem, columns]);

  const fetchItems = useCallback(async () => {
    if (!config) return;
    const requestConfig =
      Object.keys(filledFilters).length > 0 && config.search
        ? config.search
        : config.list || config.search;

    if (!requestConfig) {
      setItems([]);
      return;
    }

    const requiredMissing = (requestConfig.requires || []).filter(
      (key) => isEmptyValue(filledFilters[key])
    );
    if (requiredMissing.length > 0) {
      setItems([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const requestPayload = requestConfig.mapPayload
        ? requestConfig.mapPayload(filledFilters, currentUser)
        : filledFilters;
      const method =
        resolveValue(requestConfig.method, filledFilters, currentUser, requestPayload) ||
        "post";
      const path = resolveValue(
        requestConfig.path,
        filledFilters,
        currentUser,
        requestPayload
      );
      const params = requestConfig.mapParams
        ? requestConfig.mapParams(filledFilters, currentUser)
        : requestConfig.params;
      const data =
        requestConfig.adminUser || method !== "get"
          ? requestConfig.adminUser
            ? withAdminUser(requestPayload)
            : requestPayload
          : undefined;
      const result = await adminRequest({ method, path, data, params });
      setItems(toArray(result));
      setPage(1);
    } catch (err) {
      setItems([]);
      const message = err.message || "";
      setError(isEmptyDataError(message) ? "" : message || t("modulePage.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [config, currentUser, filledFilters, t]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    let mounted = true;
    adminRequest({
      method: "get",
      path: "/dashboards/admin/options/get-enums",
    })
      .then((data) => {
        if (mounted) setAdminEnums(data || {});
      })
      .catch(() => {
        if (mounted) setAdminEnums({});
      });

    adminRequest({
      method: "get",
      path: "/users",
    })
      .then((data) => {
        if (mounted) setUserOptions(toArray(data));
      })
      .catch(() => {
        if (mounted) setUserOptions([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!config) {
    return (
      <section className="content-panel section-panel">
        <div className="admin-empty-state">
          <div className="admin-empty-state__icon">
            <CIcon icon={cilInbox} className="icon" />
          </div>
          <h4>{t("modulePage.notConfigured")}</h4>
          <p>
            {t("module", { defaultValue: moduleKey })}: {moduleKey}
          </p>
        </div>
      </section>
    );
  }

  const title = config.titleKey ? t(config.titleKey) : config.title;
  const subtitle = config.subtitleKey ? t(config.subtitleKey) : config.subtitle;

  const handleCreate = async () => {
    if (!config.create) return;
    const missingField = config.create.fields?.find(
      (field) => field.required && isEmptyValue(form[field.key])
    );
    if (missingField) {
      setError(`• ${t("modulePage.requiredField", { label: missingField.label })}`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const rawPayload = config.create.mapPayload
        ? config.create.mapPayload(form, currentUser)
        : form;
      const payload = config.create.adminUser ? withAdminUser(rawPayload) : rawPayload;
      const path = resolveValue(config.create.path, form, currentUser, payload);
      await adminRequest({
        method: resolveValue(config.create.method, form, currentUser, payload) || "post",
        path,
        data: payload,
      });
      setShowCreate(false);
      setForm(buildDefaults(config.create.fields));
      fetchItems();
    } catch (err) {
      setError(err.message || t("modulePage.createFailed"));
    } finally {
      setSaving(false);
    }
  };

  const openUpdate = (item) => {
    const fields = config.update?.fields || config.create?.fields || [];
    setActiveItem(item);
    setUpdateForm({
      ...buildValuesFromItem(fields, item),
      id: item.id,
    });
    setError("");
    setShowUpdate(true);
  };

  const handleUpdate = async () => {
    if (!config.update || !activeItem) return;
    const fields = config.update.fields || config.create?.fields || [];
    const missingField = fields.find(
      (field) => field.required && isEmptyValue(updateForm[field.key])
    );
    if (missingField) {
      setError(`• ${t("modulePage.requiredField", { label: missingField.label })}`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const basePayload = { id: activeItem.id, ...updateForm };
      const rawPayload = config.update.mapPayload
        ? config.update.mapPayload(basePayload, activeItem, currentUser)
        : basePayload;
      const payload = config.update.adminUser ? withAdminUser(rawPayload) : rawPayload;
      const path = resolveValue(config.update.path, updateForm, currentUser, payload);
      await adminRequest({
        method: resolveValue(config.update.method, updateForm, currentUser, payload) || "post",
        path,
        data: payload,
      });
      setShowUpdate(false);
      setActiveItem(null);
      fetchItems();
    } catch (err) {
      setError(err.message || t("modulePage.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleRowAction = async (action, item) => {
    if (action.type === "detail") {
      setActiveItem(item);
      setShowDetail(true);
      return;
    }

    if (action.type === "update") {
      openUpdate(item);
      return;
    }

    const resolveDynamicValue = (value) =>
      typeof value === "function" ? value(item, currentUser) : value;

    const resolvedConfirmTitle =
      resolveDynamicValue(action.confirmTitle) ||
      (action.type === "delete" ? "modulePage.confirmDeleteTitle" : action.label);
    const confirmHtml = resolveDynamicValue(action.confirmHtml);
    const defaultText =
      action.type === "delete"
        ? "modulePage.confirmDeleteText"
        : "modulePage.confirmBody";
    const confirmText = resolveDynamicValue(action.confirmText);
    const confirm = await Swal.fire({
      title: t(resolvedConfirmTitle),
      html:
        confirmHtml === undefined || confirmHtml === null
          ? t(confirmText || defaultText)
          : confirmHtml,
      icon: resolveDynamicValue(action.confirmIcon) || "question",
      showCancelButton: true,
      confirmButtonColor: resolveDynamicValue(action.confirmButtonColor) || "#1a7f37",
      cancelButtonColor: "#aaaaaa",
      confirmButtonText: t(action.label),
      cancelButtonText: t("modulePage.cancel"),
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);
    setError("");
    try {
      const payload = action.payload ? action.payload(item, currentUser) : { id: item.id };
      const path = resolveValue(action.path, item, currentUser, payload);
      await adminRequest({
        method: resolveValue(action.method, item, currentUser, payload) || "post",
        path,
        data: payload,
      });
      fetchItems();
    } catch (err) {
      setError(err.message || t("modulePage.actionFailed"));
    } finally {
      setSaving(false);
    }
  };

  const resolveOptions = (field) => {
    if (field.type === "user_select") return userOptions;
    const source = field.optionSource || inferOptionSource(field);
    const remoteOptions = source ? adminEnums?.[source] : undefined;
    const options = remoteOptions?.length
      ? remoteOptions
      : resolveValue(field.options, adminEnums, currentUser);

    return Array.isArray(options) ? options : [];
  };

  const renderUserSelect = (value, onChange, allowedLabel) => {
    const selected = userOptions.find((user) => String(user.id) === String(value));
    return (
      <CFormSelect value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
        <option value="">{allowedLabel || t("modulePage.select")}</option>
        {userOptions.map((user) => (
          <option value={user.id} key={user.id}>
            {`${user.name} — ${user.employee_id ?? user.user_name ?? ""}${
              user.department?.name ? ` — ${user.department.name}` : ""
            }`}
          </option>
        ))}
      </CFormSelect>
    );
  };

  const renderFieldControl = (field, value, onChange) => {
    const options = resolveOptions(field);
    const selectValue = value === true ? "true" : value === false ? "false" : value ?? "";

    if (field.type === "user_select") {
      return renderUserSelect(value, onChange);
    }

    if (options.length > 0) {
      return (
        <CFormSelect value={selectValue} onChange={(event) => onChange(event.target.value)}>
          <option value="">{t("modulePage.select")}</option>
          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </CFormSelect>
      );
    }

    if (field.type === "textarea") {
      return (
        <CFormTextarea
          rows={field.rows || 3}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    }

    return (
      <CFormInput
        type={field.type || "text"}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  };

  const exportCsv = () => {
    const header = columns.map((column) => column.label).join(",");
    const rows = filteredItems.map((item) =>
      columns
        .map((column) => {
          const value = getValue(item, column.key);
          const text = typeof value === "object" ? value?.name || value?.title || "" : value ?? "";
          return `"${String(text).replaceAll('"', '""')}"`;
        })
        .join(",")
    );
    const blob = new Blob(["\uFEFF", header, "\n", rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${moduleKey}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({});
    setKeyword("");
  };

  const renderFilterControl = (filter) => {
    if (filter.type === "user_select") {
      return renderUserSelect(
        filters[filter.key] || "",
        (nextValue) =>
          setFilters((value) => ({ ...value, [filter.key]: nextValue })),
        t("modulePage.all")
      );
    }
    if (resolveOptions(filter).length > 0) {
      return (
        <CFormSelect
          value={filters[filter.key] ?? ""}
          onChange={(event) =>
            setFilters((value) => ({ ...value, [filter.key]: event.target.value }))
          }
        >
          <option value="">{t("modulePage.all")}</option>
          {resolveOptions(filter).map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </CFormSelect>
      );
    }
    return (
      <CFormInput
        type={filter.type || "text"}
        value={filters[filter.key] || ""}
        onChange={(event) =>
          setFilters((value) => ({ ...value, [filter.key]: event.target.value }))
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") fetchItems();
        }}
      />
    );
  };

  const renderDetailValue = (field) => {
    const value = field.value;
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "boolean") return <StatusBadge value={value} t={t} />;
    if (typeof value === "object") {
      return value.name || value.title || value.id || JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="admin-module-page">
      <section className="content-panel admin-hero">
        <div className="admin-hero__left">
          <span className="admin-hero__kicker">
            <CIcon icon={cilFilter} className="me-1" />
            {config.kickerKey ? t(config.kickerKey) : t("hrmMetal")}
          </span>
          <h1 className="admin-hero__title">{title}</h1>
          <p className="admin-hero__subtitle">{subtitle}</p>
        </div>
        <div className="admin-hero__actions">
          <CButton
            color="light"
            variant="outline"
            className="admin-toolbar-btn"
            onClick={exportCsv}
            disabled={!filteredItems.length}
          >
            <CIcon icon={cilCloudDownload} className="icon" />
            {t("modulePage.csv")}
          </CButton>
          <CButton
            color="light"
            variant="outline"
            className="admin-toolbar-btn"
            onClick={fetchItems}
            disabled={loading}
          >
            <CIcon icon={cilReload} className="icon" />
            {t("modulePage.refresh")}
          </CButton>
          {config.create && (
            <CButton
              color="success"
              className="admin-toolbar-btn"
              onClick={() => {
                setShowCreate(true);
                setError("");
              }}
            >
              <CIcon icon={cilPlus} className="icon" />
              {t("modulePage.add")}
            </CButton>
          )}
        </div>
      </section>

      {hasFilters && (
        <section className="content-panel admin-filter-panel">
          <div className="admin-filter-grid">
            {(config.filters || []).map((filter) => (
              <div key={filter.key}>
                <CFormLabel className="d-block mb-1">{filter.label}</CFormLabel>
                {renderFilterControl(filter)}
              </div>
            ))}
          </div>
          <div className="admin-filter-actions">
            <CButton
              color="success"
              className="admin-toolbar-btn"
              onClick={() => {
                setPage(1);
                fetchItems();
              }}
            >
              <CIcon icon={cilSearch} className="icon" />
              {t("modulePage.search")}
            </CButton>
            <CButton
              color="light"
              variant="outline"
              className="admin-toolbar-btn"
              onClick={clearFilters}
            >
              <CIcon icon={cilX} className="icon" />
              {t("modulePage.clear")}
            </CButton>
          </div>
        </section>
      )}

      {error && <CAlert color="danger">{error}</CAlert>}

      <section className="content-panel admin-table-panel">
        <div className="admin-table-panel__meta">
          <span className="admin-count">
            {t("modulePage.records", { total: filteredItems.length })}
          </span>
          <div className="d-flex align-items-center gap-3">
            {filteredItems.length > pageSize && (
              <div className="admin-pagination__info">
                {t("modulePage.showing", { from: pageFrom, to: pageTo, total: filteredItems.length })}
              </div>
            )}
            <CFormInput
              type="search"
              placeholder={t("modulePage.search")}
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              style={{ maxWidth: 220 }}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-empty-state">
            <CSpinner color="success" />
            <h4>{t("modulePage.loading")}</h4>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state__icon">
              <CIcon icon={cilInbox} className="icon" />
            </div>
            <h4>{t("modulePage.empty")}</h4>
            <p>{t("modulePage.emptyHint")}</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <CTable align="middle" hover responsive>
              <CTableHead>
                <CTableRow>
                  {columns.map((column) => (
                    <CTableHeaderCell key={String(column.key)}>
                      {column.label}
                    </CTableHeaderCell>
                  ))}
                  {rowActions.length > 0 && (
                    <CTableHeaderCell className="text-end">
                      {t("modulePage.action")}
                    </CTableHeaderCell>
                  )}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {pagedItems.map((item, index) => (
                  <CTableRow key={item.id || index}>
                    {columns.map((column) => (
                      <CTableDataCell key={String(column.key)}>
                        {formatValue(getValue(item, column.key), column, t)}
                      </CTableDataCell>
                    ))}
                    {rowActions.length > 0 && (
                      <CTableDataCell className="text-end">
                        <div className="admin-row-actions">
                          {rowActions
                            .filter(
                              (action) =>
                                !action.visible || action.visible(item, currentUser)
                            )
                            .map((action) => (
                              <CButton
                                color={action.color || "success"}
                                variant={action.variant || "outline"}
                                size="sm"
                                className="admin-action-btn"
                                key={action.label}
                                disabled={saving}
                                onClick={() => handleRowAction(action, item)}
                              >
                                {action.icon && <CIcon icon={action.icon} className="icon" />}
                                {t(action.label)}
                              </CButton>
                            ))}
                        </div>
                      </CTableDataCell>
                    )}
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        )}

        {filteredItems.length > pageSize && (
          <div className="admin-pagination">
            <div className="admin-pagination__info">
              {t("modulePage.showing", { from: pageFrom, to: pageTo, total: filteredItems.length })}
            </div>
            <div className="admin-pagination__controls">
              <button
                type="button"
                className="admin-page-btn"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                {t("modulePage.prev")}
              </button>
              {pageWindow(safePage, totalPages).map((entry, index) =>
                entry === "…" ? (
                  <span key={`e-${index}`} className="admin-page-btn" style={{ border: 0, background: "transparent" }}>
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    key={String(entry)}
                    className={`admin-page-btn${entry === safePage ? " active" : ""}`}
                    onClick={() => setPage(Number(entry))}
                  >
                    {entry}
                  </button>
                )
              )}
              <button
                type="button"
                className="admin-page-btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                {t("modulePage.next")}
              </button>
            </div>
          </div>
        )}
      </section>

      <CModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        alignment="center"
        size="lg"
      >
        <CModalHeader className="border-0 admin-modal-header admin-modal-header--create">
          <CModalTitle className="text-white fw-semibold">
            {t("modulePage.createTitle", { title })}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="g-3">
              {config.create?.fields?.map((field) => (
                <CCol md={field.fullWidth ? 12 : 6} key={field.key}>
                  <CFormLabel>{field.label}</CFormLabel>
                  {renderFieldControl(field, form[field.key], (nextValue) =>
                    setForm((value) => ({ ...value, [field.key]: nextValue }))
                  )}
                </CCol>
              ))}
            </CRow>
            {error && <div className="text-danger mt-3">{error}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowCreate(false)}>
            {t("modulePage.cancel")}
          </CButton>
          <CButton color="success" disabled={saving} onClick={handleCreate}>
            {saving ? <CSpinner size="sm" /> : t("modulePage.add")}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={showUpdate}
        onClose={() => setShowUpdate(false)}
        alignment="center"
        size="lg"
      >
        <CModalHeader className="border-0 admin-modal-header admin-modal-header--update">
          <CModalTitle className="text-white fw-semibold">
            {t("modulePage.updateTitle", { title })}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="g-3">
              {(config.update?.fields || config.create?.fields || []).map((field) => (
                <CCol md={field.fullWidth ? 12 : 6} key={field.key}>
                  <CFormLabel>{field.label}</CFormLabel>
                  {renderFieldControl(field, updateForm[field.key], (nextValue) =>
                    setUpdateForm((value) => ({ ...value, [field.key]: nextValue }))
                  )}
                </CCol>
              ))}
            </CRow>
            {error && <div className="text-danger mt-3">{error}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowUpdate(false)}>
            {t("modulePage.cancel")}
          </CButton>
          <CButton color="success" disabled={saving} onClick={handleUpdate}>
            {saving ? <CSpinner size="sm" /> : t("modulePage.save")}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        alignment="center"
        size="lg"
      >
        <CModalHeader className="border-0 admin-modal-header admin-modal-header--info">
          <CModalTitle className="text-white fw-semibold">
            {t("modulePage.detailTitle", { title })}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="admin-detail-grid">
            {detailFields.map((field) => (
              <div
                className={`admin-detail-field${field.full ? " admin-detail-field--full" : ""}`}
                key={field.key}
              >
                <span className="admin-detail-field__label">{field.label}</span>
                <span className="admin-detail-field__value">{renderDetailValue(field)}</span>
              </div>
            ))}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetail(false)}>
            {t("modulePage.close", { defaultValue: t("modulePage.cancel") })}
          </CButton>
          {config.update && activeItem && (
            <CButton
              color="primary"
              onClick={() => {
                setShowDetail(false);
                openUpdate(activeItem);
              }}
            >
              <CIcon icon={cilPencil} className="me-1" />
              {t("modulePage.edit")}
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </div>
  );
};

AdminModulePage.propTypes = {
  moduleKey: PropTypes.string,
};

export default AdminModulePage;