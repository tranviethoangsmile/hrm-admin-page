import {
  CANTEEN,
  CHAT,
  DAILY_REPORT,
  DASHBOARDS,
  DAY_OFFS,
  DEPENDENT_SUPPORT_AMOUNT,
  ERROR_OF_REPORT,
  EVENT_CHECK,
  FCM_TOKEN,
  FOOD,
  INVENTORY,
  NOTIFICATION,
  ORDER_URL,
  OVERTIME_REQUEST,
  PAID_LEAVE,
  PAYROLL,
  PLAN_PRODUCTION,
  SAFETY_CHECK,
  SAFETY_REPORT,
  SEARCH_ORDER_WITH_FIELD,
  TAX_DEPENDENT,
  UNIFORM_ORDER,
} from "../../constants";
import {
  NOTIFICATION_TYPE_OPTIONS,
  POSITION_OPTIONS,
  PRODUCT_OPTIONS,
  SHIFT_OPTIONS,
  TAX_DEPENDENT_STATUS_OPTIONS,
  UNIFORM_SIZE_OPTIONS,
  UNIFORM_TYPE_OPTIONS,
  WORK_SHIFT_OPTIONS,
} from "../../constants/adminOptions";

const today = () => new Date().toISOString().slice(0, 10);
const numberValue = (value) => (value === "" || value === undefined ? undefined : Number(value));

export const adminModuleConfig = {
  dayOffs: {
    title: "Ngay nghi cong ty",
    subtitle: "Quan ly lich nghi chung. Route admin can gui user_id cua admin trong body.",
    list: { method: "get", path: `${DAY_OFFS}/getall` },
    create: {
      path: `${DAY_OFFS}/create`,
      adminUser: true,
      fields: [{ key: "date", label: "Ngay nghi", type: "date", defaultValue: today }],
    },
    update: {
      method: "put",
      path: `${DAY_OFFS}/update`,
      adminUser: true,
      fields: [{ key: "date", label: "Ngay nghi", type: "date", required: true }],
    },
    delete: { path: `${DAY_OFFS}/deletebyid`, adminUser: true },
    columns: [
      { key: "date", label: "Ngay", type: "date" },
      { key: "createdAt", label: "Tao luc", type: "date" },
    ],
    filters: [{ key: "date", label: "Ngay", type: "date" }],
  },
  paidLeave: {
    title: "Phe duyet nghi phep",
    subtitle: "Leader duyet bang dashboard endpoint, Admin xac nhan don da duyet.",
    list: {
      method: (_, currentUser) =>
        ["LEADER", "SUPERVISOR", "MANAGER"].includes(currentUser.role)
          ? "get"
          : "post",
      path: (_, currentUser) =>
        ["LEADER", "SUPERVISOR", "MANAGER"].includes(currentUser.role)
          ? `${DASHBOARDS}/leader/paidleaves/get-paid-leave-request`
          : `${PAID_LEAVE}/search`,
    },
    search: {
      path: `${PAID_LEAVE}/search`,
      mapPayload: (filters) => ({
        ...filters,
        is_approve:
          filters.is_approve === undefined ? undefined : filters.is_approve === "true",
        is_confirm:
          filters.is_confirm === undefined ? undefined : filters.is_confirm === "true",
      }),
    },
    create: {
      path: `${PAID_LEAVE}/create`,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "leader_id", label: "Leader ID", required: true },
        { key: "reason", label: "Ly do", type: "textarea", required: true, fullWidth: true },
        { key: "date_request", label: "Ngay yeu cau", type: "date", defaultValue: today },
        { key: "date_leave", label: "Ngay nghi", type: "date", defaultValue: today },
        { key: "position", label: "Position", options: POSITION_OPTIONS },
        { key: "is_paid", label: "Co luong", options: ["true", "false"], defaultValue: "true" },
        { key: "is_half", label: "Nua ngay", options: ["false", "true"], defaultValue: "false" },
      ],
      mapPayload: (values) => ({
        ...values,
        is_paid: values.is_paid === true || values.is_paid === "true",
        is_half: values.is_half === true || values.is_half === "true",
      }),
    },
    columns: [
      { key: "staff.name", label: "Nhan vien" },
      { key: "leader.name", label: "Leader" },
      { key: "reason", label: "Ly do" },
      { key: "date_leave", label: "Ngay nghi", type: "date" },
      { key: "position", label: "Vi tri" },
      { key: "is_confirm", label: "Xac nhan", type: "boolean" },
      { key: "is_approve", label: "Duyet", type: "boolean" },
      { key: "is_paid", label: "Co luong", type: "boolean" },
    ],
    filters: [
      { key: "position", label: "Position", options: POSITION_OPTIONS },
      { key: "date_leave", label: "Ngay nghi", type: "date" },
      { key: "is_approve", label: "Leader duyet", options: ["true", "false"] },
      { key: "is_confirm", label: "Admin xac nhan", options: ["true", "false"] },
    ],
    rowActions: [
      {
        label: "Leader duyet",
        color: "success",
        path: `${DASHBOARDS}/leader/paidleaves/approve-paid-leave-request`,
        visible: (item, currentUser) =>
          ["LEADER", "SUPERVISOR", "MANAGER"].includes(currentUser.role) &&
          !item.is_approve,
        payload: (item) => ({
          id: item.id,
          is_approve: true,
        }),
      },
      {
        label: "Tu choi",
        color: "warning",
        path: `${DASHBOARDS}/leader/paidleaves/approve-paid-leave-request`,
        visible: (item, currentUser) =>
          ["LEADER", "SUPERVISOR", "MANAGER"].includes(currentUser.role) &&
          item.is_approve,
        payload: (item) => ({
          id: item.id,
          is_approve: false,
          feedback: item.feedback || "Rejected from admin page",
        }),
      },
      {
        label: "Admin confirm",
        color: "info",
        path: `${DASHBOARDS}/admin/paidleaves/paid-leave-confirm`,
        visible: (item, currentUser) =>
          currentUser.role === "ADMIN" && item.is_approve && !item.is_confirm,
        payload: (item) => ({
          id: item.id,
          user_id: item.user_id,
          feedback: item.feedback || null,
        }),
        confirmTitle: (item) => {
          const name = item.staff?.name || item.user?.name || item.user_id;
          return `Xác nhận nghỉ phép cho ${name}`;
        },
        confirmHtml: (item) => {
          const isPaid = item.is_paid === true || item.is_paid === "true";
          const days = isPaid ? (item.is_half === true || item.is_half === "true" ? 0.5 : 1) : 0;
          const balanceRaw = item.staff?.paid_days ?? item.user?.paid_days;
          const balance =
            balanceRaw === null || balanceRaw === undefined
              ? undefined
              : Number(balanceRaw);
          const lowBalance =
            isPaid && balance !== undefined && Number.isFinite(balance) && balance < days;

          const esc = (value) =>
            String(value ?? "")
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")
              .replaceAll('"', "&quot;");

          const rows = [
            ["Nhân viên", esc(item.staff?.name || item.user?.name || item.user_id)],
            ["Ngày nghỉ", esc(item.date_leave)],
            ["Lý do", esc(item.reason || "-")],
            ["Số ngày trừ", isPaid ? (days % 1 === 0 ? days : days.toFixed(1)) : "0 (nghỉ không lương)"],
          ];
          if (balance !== undefined && isPaid) {
            rows.push([
              "Số ngày còn lại",
              Number.isFinite(balance) ? (balance % 1 === 0 ? balance : balance.toFixed(1)) : esc(balanceRaw),
            ]);
          }

          const body = rows
            .map(([label, value]) => `<div><strong>${label}:</strong> ${value}</div>`)
            .join("");

          const warning = lowBalance
            ? `<div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:#fdecea;color:#c0392b;font-weight:600">
                ⚠ Số ngày còn lại thấp hơn số ngày yêu cầu. Kiểm tra lại trước khi xác nhận.
               </div>`
            : "";

          return `<div style="text-align:left;font-size:14px">${body}${warning}</div>`;
        },
        confirmIcon: (item) => {
          const days = item.is_paid === true || item.is_paid === "true"
            ? (item.is_half === true || item.is_half === "true" ? 0.5 : 1)
            : 0;
          const balanceRaw = item.staff?.paid_days ?? item.user?.paid_days;
          const balance =
            balanceRaw === null || balanceRaw === undefined ? undefined : Number(balanceRaw);
          return days > 0 && balance !== undefined && Number.isFinite(balance) && balance < days
            ? "warning"
            : "question";
        },
      },
    ],
  },
  overtime: {
    title: "Phe duyet tang ca",
    subtitle: "Admin xem toan bo OT bang endpoint getAll va duyet bang dashboard endpoint.",
    list: { path: `${OVERTIME_REQUEST}/getAll`, adminUser: true },
    columns: [
      { key: "userDetail.name|user.name", label: "Nhan vien" },
      { key: "date", label: "Ngay", type: "date" },
      { key: "overtime_hours", label: "Gio OT" },
      { key: "position|departmentDetail.name", label: "Vi tri" },
      { key: "is_confirm", label: "Leader", type: "boolean" },
      { key: "is_approved", label: "Admin", type: "boolean" },
      { key: "description", label: "Mo ta" },
    ],
    filters: [
      { key: "position", label: "Position", options: POSITION_OPTIONS },
      { key: "date", label: "Ngay", type: "date" },
    ],
    rowActions: [
      {
        label: "Confirm",
        color: "success",
        path: `${OVERTIME_REQUEST}/updateisconfirm`,
        visible: (item, currentUser) =>
          ["LEADER", "SUPERVISOR", "MANAGER"].includes(currentUser.role) &&
          !item.is_confirm,
        payload: (item) => ({ id: item.id }),
      },
      {
        label: "Approve",
        color: "info",
        path: `${DASHBOARDS}/admin/overtime-requests/update-approve-overtime-request`,
        visible: (item, currentUser) =>
          currentUser.role === "ADMIN" && !item.is_approved,
        payload: (item) => ({ id: item.id }),
      },
      {
        label: "Delete",
        color: "danger",
        path: `${DASHBOARDS}/leader/overtime-requests/destroy`,
        visible: (item, currentUser) =>
          ["LEADER", "SUPERVISOR", "MANAGER"].includes(currentUser.role),
        confirmTitle: "modulePage.confirmDeleteTitle",
      },
    ],
  },
  overtimeRequest: {
    title: "Yeu cau tang ca cua toi",
    subtitle: "Tao OT va theo doi cac don tang ca theo user dang dang nhap.",
    list: {
      path: `${OVERTIME_REQUEST}/getbyuserid`,
      mapPayload: (_, currentUser) => ({ id: currentUser.id }),
    },
    create: {
      path: `${DASHBOARDS}/leader/overtime-requests/create`,
      mapPayload: (values, currentUser) => ({
        ...values,
        user_id: currentUser.id,
        position: values.position || currentUser.position,
        department_id: values.department_id || currentUser.department_id,
      }),
      fields: [
        { key: "department_id", label: "Department ID" },
        { key: "position", label: "Position", options: POSITION_OPTIONS },
        { key: "date", label: "Ngay OT", type: "date", defaultValue: today },
        { key: "overtime_hours", label: "Gio OT", type: "number", defaultValue: 1 },
        { key: "description", label: "Mo ta", type: "textarea", required: true, fullWidth: true },
      ],
    },
    columns: [
      { key: "date", label: "Ngay", type: "date" },
      { key: "overtime_hours", label: "Gio OT" },
      { key: "position", label: "Vi tri" },
      { key: "is_confirm", label: "Leader", type: "boolean" },
      { key: "is_approved", label: "Admin", type: "boolean" },
      { key: "description", label: "Mo ta" },
    ],
    filters: [{ key: "date", label: "Ngay", type: "date" }],
    delete: {
      path: `${DASHBOARDS}/leader/overtime-requests/destroy`,
      visible: (item, currentUser) =>
        ["LEADER", "SUPERVISOR", "MANAGER"].includes(currentUser.role),
    },
  },
  payroll: {
    title: "Bang luong",
    subtitle: "Filter theo user/thang, hien cac khoan cong va khoan tru chinh.",
    search: { path: `${PAYROLL}/search` },
    create: {
      path: `${PAYROLL}/create`,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "date", label: "Ky luong", type: "date", defaultValue: today },
        { key: "pay_date", label: "Ngay tra", type: "date", defaultValue: today },
        { key: "work_time", label: "Gio cong", type: "number", defaultValue: 0 },
        { key: "over_time", label: "OT", type: "number", defaultValue: 0 },
        { key: "gross_salary", label: "Gross", type: "number", required: true },
        { key: "net_salary", label: "Net", type: "number", required: true },
      ],
      mapPayload: (values) => ({
        ...values,
        work_time: numberValue(values.work_time),
        over_time: numberValue(values.over_time),
        gross_salary: numberValue(values.gross_salary),
        net_salary: numberValue(values.net_salary),
      }),
    },
    update: {
      path: `${PAYROLL}/update`,
      fields: [
        { key: "date", label: "Ky luong", type: "date" },
        { key: "pay_date", label: "Ngay tra", type: "date" },
        { key: "work_time", label: "Gio cong", type: "number" },
        { key: "over_time", label: "OT", type: "number" },
        { key: "gross_salary", label: "Gross", type: "number" },
        { key: "net_salary", label: "Net", type: "number" },
      ],
      mapPayload: (values) => ({
        ...values,
        work_time: numberValue(values.work_time),
        over_time: numberValue(values.over_time),
        gross_salary: numberValue(values.gross_salary),
        net_salary: numberValue(values.net_salary),
      }),
    },
    delete: { path: `${PAYROLL}/destroy` },
    columns: [
      { key: "user.name", label: "Nhan vien" },
      { key: "date", label: "Ky luong", type: "date" },
      { key: "work_time", label: "Gio cong" },
      { key: "over_time", label: "OT" },
      { key: "gross_salary", label: "Gross", type: "money" },
      { key: "net_salary", label: "Net", type: "money" },
      { key: "is_active", label: "Active", type: "boolean" },
    ],
    filters: [
      { key: "user_id", label: "Nhan vien", type: "user_select" },
      { key: "date", label: "Thang", type: "month" },
    ],
  },
  planProduction: {
    title: "Ke hoach san xuat",
    subtitle: "Lich san xuat theo department, position, line va ca.",
    search: { path: `${PLAN_PRODUCTION}/searchbydateanddepartment` },
    create: {
      path: `${PLAN_PRODUCTION}/create`,
      fields: [
        { key: "department_id", label: "Department ID", required: true },
        { key: "date", label: "Ngay", type: "date", defaultValue: today },
        { key: "quantity", label: "So luong", type: "number", defaultValue: 0 },
        { key: "product", label: "Product", options: PRODUCT_OPTIONS, required: true },
        { key: "position", label: "Position", options: POSITION_OPTIONS, required: true },
        { key: "operation_time", label: "Operation time", type: "number", defaultValue: 0 },
        { key: "work_shift", label: "Work shift", options: WORK_SHIFT_OPTIONS, required: true },
        { key: "production_line", label: "Line", required: true },
      ],
      mapPayload: (values) => ({
        ...values,
        quantity: numberValue(values.quantity),
        operation_time: numberValue(values.operation_time),
      }),
    },
    update: {
      method: "put",
      path: `${PLAN_PRODUCTION}/update`,
      fields: [
        { key: "department_id", label: "Department ID" },
        { key: "date", label: "Ngay", type: "date" },
        { key: "quantity", label: "So luong", type: "number" },
        { key: "product", label: "Product", options: PRODUCT_OPTIONS },
        { key: "position", label: "Position", options: POSITION_OPTIONS },
        { key: "operation_time", label: "Operation time", type: "number" },
        { key: "work_shift", label: "Work shift", options: WORK_SHIFT_OPTIONS },
        { key: "production_line", label: "Line" },
      ],
      mapPayload: (values) => ({
        ...values,
        quantity: numberValue(values.quantity),
        operation_time: numberValue(values.operation_time),
      }),
    },
    delete: { path: `${PLAN_PRODUCTION}/destroy` },
    columns: [
      { key: "date", label: "Ngay", type: "date" },
      { key: "department.name|Department.name|departmentDetail.name", label: "Phong ban" },
      { key: "product", label: "Product" },
      { key: "quantity", label: "SL" },
      { key: "work_shift", label: "Ca" },
      { key: "production_line", label: "Line" },
    ],
    filters: [
      { key: "department_id", label: "Department ID" },
      { key: "start_date", label: "Tu ngay", type: "date" },
      { key: "end_date", label: "Den ngay", type: "date" },
    ],
  },
  dailyReports: {
    title: "Bao cao hang ngay",
    subtitle: "Theo doi quantity, good, defective va shutdown_time theo ngay/shift.",
    list: { path: `${DAILY_REPORT}/getall` },
    search: { path: `${DAILY_REPORT}/search` },
    create: {
      path: `${DAILY_REPORT}/create`,
      fields: [
        { key: "product", label: "Product", options: PRODUCT_OPTIONS, required: true },
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "department_id", label: "Department ID", required: true },
        { key: "date", label: "Ngay", type: "date", defaultValue: today },
        { key: "shift", label: "Shift", options: SHIFT_OPTIONS },
        { key: "quantity", label: "SL", type: "number", defaultValue: 0 },
        { key: "good_quantity", label: "Good", type: "number", defaultValue: 0 },
        { key: "defective_quantity", label: "Defective", type: "number", defaultValue: 0 },
        { key: "cycle_time", label: "Cycle time", type: "number" },
        { key: "operated_time", label: "Operated time", type: "number" },
        { key: "shutdown_time", label: "Shutdown time", type: "number" },
        { key: "operator_history", label: "Ghi chu", type: "textarea", fullWidth: true },
      ],
      mapPayload: (values) => ({
        ...values,
        quantity: numberValue(values.quantity),
        good_quantity: numberValue(values.good_quantity),
        defective_quantity: numberValue(values.defective_quantity),
        cycle_time: numberValue(values.cycle_time),
        operated_time: numberValue(values.operated_time),
        shutdown_time: numberValue(values.shutdown_time),
      }),
    },
    columns: [
      { key: "date", label: "Ngay", type: "date" },
      { key: "department.name|Department.name|departmentDetail.name", label: "Phong ban" },
      { key: "product", label: "Product" },
      { key: "shift", label: "Shift" },
      { key: "quantity", label: "SL" },
      { key: "good_quantity", label: "Good" },
      { key: "defective_quantity", label: "Defective" },
      { key: "shutdown_time", label: "Dung may" },
    ],
    filters: [
      { key: "department_id", label: "Department ID" },
      { key: "date", label: "Ngay", type: "date" },
      { key: "product", label: "Product", options: PRODUCT_OPTIONS },
      { key: "shift", label: "Shift", options: SHIFT_OPTIONS },
    ],
  },
  reportErrors: {
    title: "Loi bao cao",
    subtitle: "Tra cuu code error theo daily_report_id.",
    search: { path: `${ERROR_OF_REPORT}/findByDailyReportId` },
    columns: [
      { key: "code", label: "Code" },
      { key: "description", label: "Mo ta" },
      { key: "shutdown_time", label: "Dung may" },
      { key: "error_date", label: "Ngay loi", type: "date" },
      { key: "daily_report_id", label: "Daily report ID" },
    ],
    filters: [{ key: "daily_report_id", label: "Daily report ID" }],
  },
  inventory: {
    title: "Ton kho",
    subtitle: "Backend update theo product/department, khong bat buoc id.",
    list: { path: `${INVENTORY}/getall` },
    search: { path: `${INVENTORY}/search` },
    create: {
      path: `${INVENTORY}/create`,
      fields: [
        { key: "product", label: "Product", options: PRODUCT_OPTIONS },
        { key: "quantity", label: "So luong", type: "number", defaultValue: 0 },
        { key: "department_id", label: "Department ID", required: true },
      ],
    },
    update: {
      path: `${INVENTORY}/update`,
      fields: [
        { key: "product", label: "Product", options: PRODUCT_OPTIONS, required: true },
        { key: "quantity", label: "So luong", type: "number", required: true },
        { key: "department_id", label: "Department ID" },
      ],
      mapPayload: (values) => ({
        product: values.product,
        quantity: numberValue(values.quantity),
        department_id: values.department_id,
      }),
    },
    columns: [
      { key: "product", label: "Product" },
      { key: "quantity", label: "So luong" },
      { key: "department.name|Department.name|departmentDetail.name", label: "Phong ban" },
    ],
    filters: [
      { key: "product", label: "Product", options: PRODUCT_OPTIONS },
      { key: "department_id", label: "Department ID" },
    ],
  },
  safetyReports: {
    title: "Bao cao an toan",
    subtitle: "Theo doi report chua confirm va corrective action.",
    search: {
      path: `${SAFETY_REPORT}/getbydepartmentid`,
      mapPayload: (filters, currentUser) => ({
        id: filters.department_id || filters.id || currentUser.department_id,
      }),
    },
    create: {
      path: `${SAFETY_REPORT}/create`,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "department_id", label: "Department ID", required: true },
        { key: "title", label: "Tieu de", required: true },
        { key: "content", label: "Noi dung", type: "textarea", required: true, fullWidth: true },
        { key: "solution", label: "Giai phap", type: "textarea", required: true, fullWidth: true },
        { key: "corrective_action", label: "Hanh dong khac phuc", type: "textarea", fullWidth: true },
        { key: "leader_id", label: "Leader ID" },
        { key: "date", label: "Ngay", type: "date", defaultValue: today },
      ],
    },
    update: {
      path: `${SAFETY_REPORT}/update`,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "title", label: "Tieu de" },
        { key: "content", label: "Noi dung", type: "textarea", fullWidth: true },
        { key: "solution", label: "Giai phap", type: "textarea", fullWidth: true },
        { key: "corrective_action", label: "Hanh dong khac phuc", type: "textarea", fullWidth: true },
        { key: "leader_id", label: "Leader ID" },
      ],
    },
    delete: { path: `${SAFETY_REPORT}/delete` },
    columns: [
      { key: "date", label: "Ngay", type: "date" },
      { key: "userDetail.name|user.name|user_id", label: "Nguoi bao cao" },
      { key: "title", label: "Tieu de" },
      { key: "content", label: "Noi dung" },
      { key: "is_confirm", label: "Confirm", type: "boolean" },
      { key: "corrective_action", label: "Hanh dong" },
    ],
    filters: [{ key: "department_id", label: "Department ID" }],
    rowActions: [
      {
        label: "Confirm",
        color: "success",
        path: `${SAFETY_REPORT}/confirm`,
        payload: (item, currentUser) => ({
          id: item.id,
          leader_id: currentUser.id,
          corrective_action: item.corrective_action || "Confirmed by admin",
        }),
      },
    ],
  },
  eventChecks: {
    title: "Xac nhan su kien",
    subtitle: "Tao va tra cuu user da confirm event.",
    search: {
      path: `${EVENT_CHECK}/searcheventchecked`,
      requires: ["event_id", "user_id"],
    },
    create: {
      path: `${EVENT_CHECK}/create`,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "event_id", label: "Event ID", required: true },
        { key: "is_confirm", label: "Confirm", options: ["true"], defaultValue: "true" },
      ],
      mapPayload: (values) => ({
        ...values,
        is_confirm: values.is_confirm === true || values.is_confirm === "true",
      }),
    },
    columns: [
      { key: "user.name", label: "Nhan vien" },
      { key: "event.name", label: "Su kien" },
      { key: "is_confirm", label: "Confirm", type: "boolean" },
      { key: "createdAt", label: "Tao luc", type: "date" },
    ],
    filters: [
      { key: "user_id", label: "Nhan vien", type: "user_select" },
      { key: "event_id", label: "Event ID" },
    ],
  },
  safetyChecks: {
    title: "Safety check event",
    subtitle: "Tao safety check va xem danh sach user da check theo event.",
    search: {
      path: `${SAFETY_CHECK}/getallusercheckedsafetycheckevent`,
      requires: ["event_id"],
      mapPayload: (filters) => ({ id: filters.event_id || filters.id }),
    },
    create: {
      path: `${SAFETY_CHECK}/create`,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "event_id", label: "Event ID", required: true },
        { key: "is_safety", label: "Safety", options: ["true"], defaultValue: "true" },
        { key: "is_at_home", label: "At home", options: ["true"], defaultValue: "true" },
        { key: "is_can_work", label: "Can work", options: ["true"], defaultValue: "true" },
        { key: "feedback", label: "Feedback", type: "textarea", fullWidth: true },
      ],
      mapPayload: (values) => ({
        ...values,
        is_safety: values.is_safety === true || values.is_safety === "true",
        is_at_home: values.is_at_home === true || values.is_at_home === "true",
        is_can_work: values.is_can_work === true || values.is_can_work === "true",
      }),
    },
    columns: [
      { key: "user.name", label: "Nhan vien" },
      { key: "event.name", label: "Su kien" },
      { key: "is_safety", label: "Safety", type: "boolean" },
      { key: "is_at_home", label: "At home", type: "boolean" },
      { key: "is_can_work", label: "Can work", type: "boolean" },
      { key: "feedback", label: "Feedback" },
    ],
    filters: [{ key: "event_id", label: "Event ID" }],
  },
  notifications: {
    title: "Notification",
    subtitle: "Composer thong bao cho user, ho tro type INFO/WARNING/ERROR/SUCCESS/SYSTEM.",
    list: {
      path: `${NOTIFICATION}/searchById`,
      mapPayload: (filters, currentUser) => ({ user_id: filters.user_id || currentUser.id }),
    },
    search: {
      path: `${NOTIFICATION}/searchById`,
      mapPayload: (filters, currentUser) => ({ user_id: filters.user_id || currentUser.id }),
    },
    delete: { path: `${NOTIFICATION}/destroy` },
    create: {
      path: `${DASHBOARDS}/admin/notifications/create-notification`,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "title", label: "Tieu de", required: true },
        { key: "message", label: "Noi dung", type: "textarea", required: true },
        { key: "type", label: "Type", options: NOTIFICATION_TYPE_OPTIONS },
      ],
    },
    columns: [
      { key: "title", label: "Tieu de" },
      { key: "message", label: "Noi dung" },
      { key: "type", label: "Type" },
      { key: "is_readed", label: "Read", type: "boolean" },
      { key: "createdAt", label: "Tao luc", type: "date" },
    ],
    filters: [{ key: "user_id", label: "User ID" }],
    rowActions: [
      {
        label: "Read",
        color: "info",
        method: "put",
        path: `${NOTIFICATION}/update`,
        payload: (item) => ({ id: item.id }),
      },
    ],
  },
  uniformOrders: {
    title: "Don dong phuc",
    subtitle: "Search theo position/user/status va xem chi tiet items.",
    search: {
      path: (filters) =>
        filters.user_id
          ? `${UNIFORM_ORDER}/search/withuserid`
          : `${UNIFORM_ORDER}/search/withposition`,
      mapPayload: (filters, currentUser) =>
        filters.user_id
          ? {
              user_id: filters.user_id,
              order_status: filters.order_status || "pending",
            }
          : { position: filters.position || currentUser.position },
    },
    create: {
      path: `${UNIFORM_ORDER}/create`,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "position", label: "Position", options: POSITION_OPTIONS },
        { key: "date", label: "Ngay dat", type: "date", defaultValue: today },
        { key: "order_status", label: "Trang thai", defaultValue: "pending" },
        { key: "uniform_type", label: "Loai", options: UNIFORM_TYPE_OPTIONS },
        { key: "uniform_size", label: "Size", options: UNIFORM_SIZE_OPTIONS },
        { key: "quantity", label: "So luong", type: "number", defaultValue: 1 },
        { key: "notes", label: "Ghi chu", type: "textarea" },
      ],
      mapPayload: (values) => ({
        user_id: values.user_id,
        position: values.position,
        date: values.date,
        order_status: values.order_status,
        notes: values.notes,
        items: [
          {
            uniform_type: values.uniform_type,
            uniform_size: values.uniform_size,
            quantity: Number(values.quantity || 1),
          },
        ],
      }),
    },
    update: {
      path: `${UNIFORM_ORDER}/update`,
      fields: [
        { key: "order_status", label: "Trang thai" },
        { key: "delivery_date", label: "Ngay giao", type: "date" },
        { key: "uniform_size", label: "Size", options: UNIFORM_SIZE_OPTIONS },
        { key: "quantity", label: "So luong", type: "number" },
        { key: "notes", label: "Ghi chu", type: "textarea" },
      ],
      mapPayload: (values) => ({
        ...values,
        quantity: numberValue(values.quantity),
      }),
    },
    columns: [
      { key: "userDetail.name|user.name|user_id", label: "Nhan vien" },
      { key: "position", label: "Position" },
      { key: "date", label: "Ngay dat", type: "date" },
      { key: "order_status", label: "Trang thai" },
      { key: "delivery_date", label: "Ngay giao", type: "date" },
    ],
    filters: [
      { key: "position", label: "Position", options: POSITION_OPTIONS },
      { key: "user_id", label: "Nhan vien", type: "user_select" },
      { key: "order_status", label: "Trang thai", options: ["pending", "processing", "completed", "cancelled"] },
    ],
    delete: { path: `${UNIFORM_ORDER}/delete` },
  },
  taxDependents: {
    title: "Nguoi phu thuoc thue",
    subtitle: "Admin cap nhat status PENDING/APPROVED/REJECTED.",
    search: { path: `${TAX_DEPENDENT}/getbyuserid` },
    create: {
      path: `${TAX_DEPENDENT}/create`,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "name", label: "Ho ten", required: true },
        { key: "dob", label: "Ngay sinh", type: "date" },
        { key: "gender", label: "Gioi tinh" },
        { key: "identification_number", label: "So dinh danh" },
        { key: "phone", label: "Dien thoai" },
        { key: "address", label: "Dia chi" },
        { key: "relationship", label: "Quan he" },
        { key: "tax_code", label: "Ma so thue" },
        { key: "deduction_amount", label: "Giam tru", type: "number" },
        { key: "status", label: "Trang thai", options: TAX_DEPENDENT_STATUS_OPTIONS, defaultValue: "PENDING" },
        { key: "notes", label: "Ghi chu", type: "textarea", fullWidth: true },
      ],
      mapPayload: (values) => ({
        ...values,
        deduction_amount: numberValue(values.deduction_amount),
      }),
    },
    update: {
      method: "put",
      path: `${TAX_DEPENDENT}/update`,
      fields: [
        { key: "name", label: "Ho ten" },
        { key: "dob", label: "Ngay sinh", type: "date" },
        { key: "gender", label: "Gioi tinh" },
        { key: "identification_number", label: "So dinh danh" },
        { key: "phone", label: "Dien thoai" },
        { key: "address", label: "Dia chi" },
        { key: "relationship", label: "Quan he" },
        { key: "tax_code", label: "Ma so thue" },
        { key: "deduction_amount", label: "Giam tru", type: "number" },
        { key: "notes", label: "Ghi chu", type: "textarea", fullWidth: true },
      ],
      mapPayload: (values, item, currentUser) => ({
        ...values,
        user_id: item.user_id || currentUser.id,
        deduction_amount: numberValue(values.deduction_amount),
      }),
    },
    columns: [
      { key: "name", label: "Ho ten" },
      { key: "relationship", label: "Quan he" },
      { key: "dob", label: "Ngay sinh", type: "date" },
      { key: "identification_number", label: "So dinh danh" },
      { key: "deduction_amount", label: "Giam tru", type: "money" },
      { key: "status", label: "Trang thai" },
    ],
    filters: [{ key: "user_id", label: "User ID" }],
    delete: { path: `${TAX_DEPENDENT}/delete` },
    rowActions: TAX_DEPENDENT_STATUS_OPTIONS.map((status) => ({
      label: status,
      color: status === "APPROVED" ? "success" : status === "REJECTED" ? "danger" : "warning",
      method: "put",
      path: `${TAX_DEPENDENT}/update-status`,
      payload: (item, currentUser) => ({ id: item.id, user_id: currentUser.id, status }),
    })),
  },
  dependentSupport: {
    title: "Muc ho tro nguoi phu thuoc",
    subtitle: "Theo doi so tien ho tro theo dependent/year va confirm admin.",
    search: { path: `${DEPENDENT_SUPPORT_AMOUNT}/getbytaxdependentidandyear` },
    create: {
      path: `${DEPENDENT_SUPPORT_AMOUNT}/create`,
      fields: [
        { key: "tax_dependent_id", label: "Dependent ID", required: true },
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "year", label: "Nam", type: "number", defaultValue: new Date().getFullYear() },
        { key: "supported_amount", label: "So tien", type: "number", defaultValue: 0 },
        { key: "is_supporting_current_year", label: "Ho tro nam nay", options: ["true", "false"], defaultValue: "true" },
        { key: "expected_support_years", label: "So nam du kien", type: "number" },
        { key: "notes", label: "Ghi chu", type: "textarea", fullWidth: true },
      ],
      mapPayload: (values) => ({
        ...values,
        year: numberValue(values.year),
        supported_amount: numberValue(values.supported_amount),
        expected_support_years: numberValue(values.expected_support_years),
        is_supporting_current_year:
          values.is_supporting_current_year === true ||
          values.is_supporting_current_year === "true",
      }),
    },
    update: {
      path: `${DEPENDENT_SUPPORT_AMOUNT}/update`,
      fields: [
        { key: "supported_amount", label: "So tien", type: "number" },
        { key: "is_supporting_current_year", label: "Ho tro nam nay" },
        { key: "expected_support_years", label: "So nam du kien", type: "number" },
        { key: "notes", label: "Ghi chu", type: "textarea", fullWidth: true },
      ],
      mapPayload: (values, item, currentUser) => ({
        ...values,
        user_id: item.user_id || currentUser.id,
        supported_amount: numberValue(values.supported_amount),
        expected_support_years: numberValue(values.expected_support_years),
        is_supporting_current_year:
          values.is_supporting_current_year === true ||
          values.is_supporting_current_year === "true",
      }),
    },
    columns: [
      { key: "tax_dependent.name", label: "Nguoi phu thuoc" },
      { key: "year", label: "Nam" },
      { key: "supported_amount", label: "So tien", type: "money" },
      { key: "is_confirm", label: "Confirm", type: "boolean" },
      { key: "notes", label: "Ghi chu" },
    ],
    filters: [
      { key: "tax_dependent_id", label: "Dependent ID" },
      { key: "year", label: "Nam", type: "number" },
    ],
    delete: { path: `${DEPENDENT_SUPPORT_AMOUNT}/delete` },
    rowActions: [
      {
        label: "Confirm",
        color: "success",
        path: `${DEPENDENT_SUPPORT_AMOUNT}/confirm`,
        payload: (item, currentUser) => ({ id: item.id, user_id: currentUser.id }),
      },
    ],
  },
  fcmTokens: {
    title: "FCM Token",
    subtitle: "Backend hien tai moi co API tao token, chua co list/search token.",
    create: {
      path: `${FCM_TOKEN}/create`,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "fcm_token", label: "FCM token", type: "textarea", required: true, fullWidth: true },
        { key: "device_type", label: "Device type" },
        { key: "app_version", label: "App version" },
        { key: "device_id", label: "Device ID" },
      ],
    },
    columns: [
      { key: "user.name", label: "User" },
      { key: "device_type", label: "Device" },
      { key: "app_version", label: "Version" },
      { key: "device_id", label: "Device ID" },
      { key: "createdAt", label: "Tao luc", type: "date" },
    ],
    filters: [{ key: "user_id", label: "User ID" }],
  },
  food: {
    title: "Mon an / canteen",
    subtitle: "Quan ly danh muc mon an cho dich vu dat com.",
    list: { method: "get", path: FOOD },
    create: {
      path: FOOD,
      fields: [
        { key: "name", label: "Ten mon", required: true },
        { key: "description", label: "Mo ta" },
        { key: "price", label: "Gia", type: "number", defaultValue: 0 },
      ],
    },
    columns: [
      { key: "name", label: "Ten mon" },
      { key: "description", label: "Mo ta" },
      { key: "price", label: "Gia", type: "money" },
    ],
  },
  canteen: {
    title: "Canteen",
    subtitle: "Quan ly canteen theo nha may.",
    list: { method: "get", path: CANTEEN },
    create: {
      path: CANTEEN,
      fields: [
        { key: "factory_name", label: "Nha may", required: true },
        { key: "description", label: "Mo ta" },
      ],
    },
    columns: [
      { key: "factory_name", label: "Nha may" },
      { key: "description", label: "Mo ta" },
    ],
  },
  chat: {
    title: "Chat / AI bot",
    subtitle: "Khung gui payload den endpoint /chat. Lich su chat nhom dung conversations/message khi can tach rieng.",
    create: {
      path: CHAT,
      fields: [
        { key: "chat", label: "Message", type: "textarea", required: true, fullWidth: true },
      ],
    },
    columns: [
      { key: "chat", label: "Message" },
      { key: "response", label: "Response" },
    ],
  },
  auditLogs: {
    titleKey: "module.auditLogs.title",
    subtitleKey: "module.auditLogs.subtitle",
    search: {
      path: `${DASHBOARDS}/logs/search`,
      mapPayload: (filters) => ({
        page: 1,
        limit: 1000,
        resource_type: filters.resource_type || undefined,
        actor_id: filters.actor_id || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      }),
    },
    columns: [
      { key: "actorDetail.name|actor_name", label: "Nguoi thuc hien" },
      { key: "action", label: "Hanh dong", type: "status" },
      { key: "resource_type", label: "Loai tai nguyen" },
      { key: "resource_id", label: "Resource ID" },
      { key: "new_value.name|new_value", label: "Noi dung" },
      { key: "created_at", label: "Thoi gian", type: "datetime" },
    ],
    filters: [
      { key: "resource_type", label: "Loai tai nguyen" },
      { key: "actor_id", label: "Actor ID" },
      { key: "from", label: "Tu ngay", type: "date" },
      { key: "to", label: "Den ngay", type: "date" },
    ],
  },
  orders: {
    titleKey: "module.orders.title",
    subtitleKey: "module.orders.subtitle",
    search: {
      path: `${DASHBOARDS}/admin/orders/get-orders`,
      mapPayload: (filters) => ({
        date: filters.date || today(),
      }),
    },
    columns: [
      { key: "user.name", label: "Nhan vien" },
      { key: "date", label: "Ngay", type: "date" },
      { key: "dayOrNight", label: "Ca" },
      { key: "position", label: "Chapter" },
      { key: "user.department.name", label: "Phong ban" },
      { key: "isConfirmed", label: "Xac nhan", type: "boolean" },
      { key: "isPicked", label: "Nhan suat", type: "boolean" },
    ],
    filters: [{ key: "date", label: "Ngay", type: "date" }],
  },
  leave: {
    titleKey: "module.leave.title",
    subtitleKey: "module.leave.subtitle",
    search: {
      path: `${PAID_LEAVE}/search`,
      mapPayload: (filters) => ({
        ...filters,
        is_approve:
          filters.is_approve === undefined ? undefined : filters.is_approve === "true",
        is_confirm:
          filters.is_confirm === undefined ? undefined : filters.is_confirm === "true",
      }),
    },
    columns: [
      { key: "staff.name|user.name", label: "Nhan vien" },
      { key: "leader.name", label: "Leader" },
      { key: "reason", label: "Ly do" },
      { key: "date_leave", label: "Ngay nghi", type: "date" },
      { key: "is_approve", label: "Leader duyet", type: "boolean" },
      { key: "is_confirm", label: "Admin xac nhan", type: "boolean" },
      { key: "is_paid", label: "Co luong", type: "boolean" },
    ],
    filters: [
      { key: "position", label: "Position", options: POSITION_OPTIONS },
      { key: "date_leave", label: "Ngay nghi", type: "date" },
      { key: "is_approve", label: "Leader duyet", options: ["true", "false"] },
      { key: "is_confirm", label: "Admin xac nhan", options: ["true", "false"] },
    ],
  },
  purchases: {
    titleKey: "module.purchases.title",
    subtitleKey: "module.purchases.subtitle",
    list: { method: "get", path: ORDER_URL },
    search: {
      path: `${ORDER_URL}${SEARCH_ORDER_WITH_FIELD}`,
    },
    create: {
      path: ORDER_URL,
      fields: [
        { key: "user_id", label: "Nhan vien", type: "user_select", required: true },
        { key: "date", label: "Ngay", type: "date", defaultValue: today },
        { key: "position", label: "Position", options: POSITION_OPTIONS },
        { key: "dayOrNight", label: "Ca", options: SHIFT_OPTIONS },
      ],
    },
    columns: [
      { key: "user.name", label: "Nhan vien" },
      { key: "date", label: "Ngay", type: "date" },
      { key: "dayOrNight", label: "Ca" },
      { key: "position", label: "Chapter" },
      { key: "user.department.name", label: "Phong ban" },
      { key: "isConfirmed", label: "Xac nhan", type: "boolean" },
      { key: "isPicked", label: "Nhan suat", type: "boolean" },
    ],
    filters: [
      { key: "date", label: "Ngay", type: "date" },
      { key: "position", label: "Position", options: POSITION_OPTIONS },
      { key: "dayOrNight", label: "Ca", options: SHIFT_OPTIONS },
    ],
    rowActions: [
      {
        label: "Picked",
        color: "info",
        method: "put",
        path: `${ORDER_URL}/user`,
        visible: (item) => !item.isPicked,
        payload: (item, currentUser) => ({
          user_id: item.user_id || item.user?.id || currentUser.id,
          date: item.date,
        }),
      },
    ],
    delete: { method: "delete", path: ORDER_URL },
  },
};
