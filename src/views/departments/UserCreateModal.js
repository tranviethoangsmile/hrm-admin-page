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
import AppToast from "../../components/AppToast";
import { BASE_URL, PORT, API, VERSION, V1, USER_URL } from "../../constants";

const UserCreateModal = ({ visible, onClose, departmentList, onCreated }) => {
  const { t } = useTranslation();
  const initialForm = {
    name: "",
    user_name: "",
    email: "",
    phone: "",
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
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

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
    "phone",
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
      setError(
        t("user.create.validation.required") +
          " " +
          missing.map((f) => t("user.create.reviewField." + f)).join(", ")
      );
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
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}`,
        form
      );
      setCreating(false);
      if (res.data?.success === true) {
        setToast({
          visible: true,
          message: t("user.create.toast.success"),
          type: "success",
        });
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
        handleClose();
        if (onCreated) onCreated(res.data.data);
      } else {
        setToast({
          visible: true,
          message: t("user.create.toast.failed"),
          type: "error",
        });
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
      }
    } catch (e) {
      setError(t("user.create.toast.failed"));
      setToast({
        visible: true,
        message: t("user.create.toast.failed"),
        type: "error",
      });
      setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
      setCreating(false);
    }
  };

  return (
    <>
      <CModal
        visible={visible}
        onClose={handleClose}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>{t("user.create.title")}</CModalHeader>
        {step === 1 ? (
          <CForm onSubmit={handleNext}>
            <CModalBody>
              {error && <div className="text-danger mb-2">{error}</div>}
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel>{t("user.create.reviewField.name")}</CFormLabel>
                  <CFormInput
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>
                    {t("user.create.reviewField.user_name")}
                  </CFormLabel>
                  <CFormInput
                    value={form.user_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, user_name: e.target.value }))
                    }
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>
                    {t("user.create.reviewField.password")}
                  </CFormLabel>
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
                  <CFormLabel>{t("user.create.reviewField.email")}</CFormLabel>
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
                  <CFormLabel>
                    {t("user.create.reviewField.phone") || "Phone"}
                  </CFormLabel>
                  <CFormInput
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>{t("user.create.reviewField.dob")}</CFormLabel>
                  <CFormInput
                    type="date"
                    value={form.dob}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dob: e.target.value }))
                    }
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>
                    {t("user.create.reviewField.employee_id")}
                  </CFormLabel>
                  <CFormInput
                    value={form.employee_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, employee_id: e.target.value }))
                    }
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>{t("user.create.reviewField.role")}</CFormLabel>
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
                  <CFormLabel>
                    {t("user.create.reviewField.position")}
                  </CFormLabel>
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
                  <CFormLabel>
                    {t("user.create.reviewField.department_id")}
                  </CFormLabel>
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
                  <CFormLabel>
                    {t("user.create.reviewField.is_officer")}
                  </CFormLabel>
                  <CFormSwitch
                    checked={form.is_officer}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_officer: e.target.checked }))
                    }
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>
                    {t("user.create.reviewField.salary_hourly")}
                  </CFormLabel>
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
                  <CFormLabel>
                    {t("user.create.reviewField.travel_allowance_pay")}
                  </CFormLabel>
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
                  <CFormLabel>
                    {t("user.create.reviewField.shift_night_pay")}
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    value={form.shift_night_pay}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        shift_night_pay: e.target.value,
                      }))
                    }
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>
                    {t("user.create.reviewField.paid_days")}
                  </CFormLabel>
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
                  <CFormLabel>
                    {t("user.create.reviewField.begin_date")}
                  </CFormLabel>
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
                {t("user.create.back")}
              </CButton>
              <CButton color="primary" type="submit">
                {t("user.create.step.review")}
              </CButton>
            </CModalFooter>
          </CForm>
        ) : (
          <>
            <CModalBody>
              <div className="mb-3 fs-4 fw-bold text-center text-primary">
                {t("user.create.reviewTitle")}
              </div>
              <div
                className="row g-3 fs-5"
                style={{ maxWidth: 700, margin: "0 auto" }}
              >
                {[
                  {
                    label: t("user.create.reviewField.name"),
                    value: form.name,
                  },
                  {
                    label: t("user.create.reviewField.user_name"),
                    value: form.user_name,
                  },
                  {
                    label: t("user.create.reviewField.password"),
                    value: "******",
                  },
                  {
                    label: t("user.create.reviewField.email"),
                    value: form.email,
                  },
                  {
                    label: t("user.create.reviewField.phone"),
                    value: form.phone,
                  },
                  { label: t("user.create.reviewField.dob"), value: form.dob },
                  {
                    label: t("user.create.reviewField.employee_id"),
                    value: form.employee_id,
                  },
                  {
                    label: t("user.create.reviewField.role"),
                    value: form.role,
                  },
                  {
                    label: t("user.create.reviewField.position"),
                    value: form.position,
                  },
                  {
                    label: t("user.create.reviewField.department_id"),
                    value: departmentList?.find(
                      (d) => d.id === form.department_id
                    )?.name,
                  },
                  {
                    label: t("user.create.reviewField.is_officer"),
                    value: form.is_officer ? t("yes") : t("no"),
                  },
                  {
                    label: t("user.create.reviewField.salary_hourly"),
                    value: form.salary_hourly,
                  },
                  {
                    label: t("user.create.reviewField.travel_allowance_pay"),
                    value: form.travel_allowance_pay,
                  },
                  {
                    label: t("user.create.reviewField.shift_night_pay"),
                    value: form.shift_night_pay,
                  },
                  {
                    label: t("user.create.reviewField.paid_days"),
                    value: form.paid_days,
                  },
                  {
                    label: t("user.create.reviewField.begin_date"),
                    value: form.begin_date,
                  },
                ].map((item, idx) => (
                  <div className="col-md-6" key={idx}>
                    <div className="text-muted small mb-1">{item.label}</div>
                    <div className="fw-bold text-dark border rounded-2 px-3 py-2 bg-light">
                      {item.value || "-"}
                    </div>
                  </div>
                ))}
              </div>
              {error && <div className="text-danger mt-3 fs-5">{error}</div>}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={handleBack}>
                {t("user.create.back")}
              </CButton>
              <CButton
                color="success"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? t("creating") : t("user.create.confirm")}
              </CButton>
            </CModalFooter>
          </>
        )}
      </CModal>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  );
};
export default UserCreateModal;
