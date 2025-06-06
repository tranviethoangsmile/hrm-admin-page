import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
  CRow,
  CCol,
  CButton,
} from "@coreui/react";

const UserCreateModal = ({ visible, onClose, departmentList, onCreated }) => {
  const { t } = useTranslation();
  const initialForm = {
    name: "",
    user_name: "",
    email: "",
    dob: "",
    role: "STAFF",
    employee_id: "",
    department_id: departmentList?.[0]?.id || "",
    position: "HINO",
    is_officer: false,
    password: "",
    begin_date: "",
    is_offical_staff: false,
    salary_hourly: "",
    shift_night_pay: "",
    travel_allowance_pay: "",
    paid_days: "",
  };
  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const ROLES = [
    { value: "STAFF", label: t("ROLE_STAFF") },
    { value: "LEADER", label: t("ROLE_LEADER") },
    { value: "SUPERVISOR", label: t("ROLE_SUPERVISOR") },
    { value: "MANAGER", label: t("ROLE_MANAGER") },
    { value: "ADMIN", label: t("ROLE_ADMIN") },
  ];
  const POSITIONS = [
    { value: "HINO", label: t("POSITION_HINO") },
    { value: "IZUMO", label: t("POSITION_IZUMO") },
    { value: "KYOTO", label: t("POSITION_KYOTO") },
    { value: "OSAKA", label: t("POSITION_OSAKA") },
    { value: "TOKYO", label: t("POSITION_TOKYO") },
    { value: "COMPORATION", label: t("POSITION_COMPORATION") },
  ];

  const requiredFields = [
    "name",
    "user_name",
    "password",
    "email",
    "dob",
    "employee_id",
    "department_id",
    "salary_hourly",
    "travel_allowance_pay",
    "shift_night_pay",
    "paid_days",
    "role",
    "position",
    "begin_date",
  ];

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    const missing = requiredFields.filter((f) => !form[f]);
    if (missing.length > 0) {
      setError(t("missingFields") + " " + missing.map((f) => t(f)).join(", "));
      return;
    }
    setStep(2);
  };
  const handleBack = () => setStep(1);
  const handleClose = () => {
    setForm(initialForm);
    setStep(1);
    setError("");
    onClose();
  };
  const handleCreate = async () => {
    setError("");
    setCreating(true);
    try {
      await axios.post("http://54.200.248.63:80/api/version/v1/users", form);
      setCreating(false);
      handleClose();
      if (onCreated) onCreated();
    } catch (e) {
      setError(e?.response?.data?.message || t("createUserFailed"));
      setCreating(false);
    }
  };

  return (
    <CModal visible={visible} onClose={handleClose} size="lg" backdrop="static">
      <CModalHeader>{t("addEmployee") || "Tạo nhân viên mới"}</CModalHeader>
      {step === 1 ? (
        <CForm onSubmit={handleNext}>
          <CModalBody>
            {error && <div className="text-danger mb-2">{error}</div>}
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel>{t("name")}</CFormLabel>
                <CFormInput
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("user_name")}</CFormLabel>
                <CFormInput
                  value={form.user_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, user_name: e.target.value }))
                  }
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("password")}</CFormLabel>
                <CFormInput
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("email")}</CFormLabel>
                <CFormInput
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("dob")}</CFormLabel>
                <CFormInput
                  type="date"
                  value={form.dob}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dob: e.target.value }))
                  }
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("employee_id")}</CFormLabel>
                <CFormInput
                  value={form.employee_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, employee_id: e.target.value }))
                  }
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("role")}</CFormLabel>
                <CFormSelect
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  <option value="">{t("selectRole")}</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("position")}</CFormLabel>
                <CFormSelect
                  value={form.position}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, position: e.target.value }))
                  }
                >
                  <option value="">{t("selectPosition")}</option>
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("department_id")}</CFormLabel>
                <CFormSelect
                  value={form.department_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department_id: e.target.value }))
                  }
                >
                  <option value="">{t("selectDepartment")}</option>
                  {departmentList?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("is_officer")}</CFormLabel>
                <CFormSwitch
                  checked={form.is_officer}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_officer: e.target.checked }))
                  }
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("salary_hourly")}</CFormLabel>
                <CFormInput
                  type="number"
                  value={form.salary_hourly}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, salary_hourly: e.target.value }))
                  }
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("travel_allowance_pay")}</CFormLabel>
                <CFormInput
                  type="number"
                  value={form.travel_allowance_pay}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      travel_allowance_pay: e.target.value,
                    }))
                  }
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("shift_night_pay")}</CFormLabel>
                <CFormInput
                  type="number"
                  value={form.shift_night_pay}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shift_night_pay: e.target.value }))
                  }
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("paid_days")}</CFormLabel>
                <CFormInput
                  type="number"
                  value={form.paid_days}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paid_days: e.target.value }))
                  }
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>{t("begin_date")}</CFormLabel>
                <CFormInput
                  type="date"
                  value={form.begin_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, begin_date: e.target.value }))
                  }
                  required
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleClose}>
              {t("cancel") || "Hủy"}
            </CButton>
            <CButton color="primary" type="submit">
              {t("next") || "Tiếp tục"}
            </CButton>
          </CModalFooter>
        </CForm>
      ) : (
        <>
          <CModalBody>
            <div className="mb-3 fs-4 fw-bold text-center">
              {t("reviewInfo") || "Xem lại thông tin trước khi tạo"}
            </div>
            <CRow className="g-3 fs-5">
              <CCol md={6}>
                <div className="text-muted small">{t("name")}</div>
                <div>{form.name || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("user_name")}</div>
                <div>{form.user_name || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("password")}</div>
                <div>******</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("email")}</div>
                <div>{form.email || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("dob")}</div>
                <div>{form.dob || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("employee_id")}</div>
                <div>{form.employee_id || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("role")}</div>
                <div>{form.role || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("position")}</div>
                <div>{form.position || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("department_id")}</div>
                <div>
                  {departmentList?.find((d) => d.id === form.department_id)
                    ?.name || "-"}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("is_officer")}</div>
                <div>{form.is_officer ? t("yes") : t("no")}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("salary_hourly")}</div>
                <div>{form.salary_hourly || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">
                  {t("travel_allowance_pay")}
                </div>
                <div>{form.travel_allowance_pay || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("shift_night_pay")}</div>
                <div>{form.shift_night_pay || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("paid_days")}</div>
                <div>{form.paid_days || "-"}</div>
              </CCol>
              <CCol md={6}>
                <div className="text-muted small">{t("begin_date")}</div>
                <div>{form.begin_date || "-"}</div>
              </CCol>
            </CRow>
            {error && <div className="text-danger mt-3 fs-5">{error}</div>}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleBack}>
              {t("back") || "Quay lại"}
            </CButton>
            <CButton color="success" onClick={handleCreate} disabled={creating}>
              {creating
                ? t("creating") || "Đang tạo..."
                : t("create") || t("confirmAndCreate") || "Tạo"}
            </CButton>
          </CModalFooter>
        </>
      )}
    </CModal>
  );
};
export default UserCreateModal;
