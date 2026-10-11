# TODO — Phân tích & hoàn thiện HRM Admin (FE ↔ BE hrmMetal)

> Nguồn sự thật: `swagger-output.json` (133 endpoints), `src/api/generatedApiPaths.js`, backend `hrmMetal/src/routers`.
> Envelope: `{ success, data, message }` — luôn kiểm tra `success === false` kể cả HTTP 200.
> Auth: `Authorization: Bearer <token>`; login TTL 2h (không có refresh).

## Module

### Kiến trúc / cơ sở hạ tầng
- [x] API client: `src/api/adminClient.js` (adminRequest, withAdminUser)
- [x] RBAC: `src/permissions/permissions.js` + `usePermissions` + `ProtectedRoute`
- [x] Routing: `src/routes.js` + `src/App.js` (lazy load, route permission)
- [x] Dashboard: bỏ phần sản xuất, gộp stats, AttendanceChart mới
- [ ] i18n hóa label `moduleConfig.js` (đang hard-code tiếng Việt không dấu)
- [x] Xoá view placeholder chết (không route): inventory, overtime, reports, paidleave, order, tasks/task, assets, contracts, machining, manufacturing, employee, checkin, widgets, dashboard/widgets
- [x] Xoá `src/api/apiClient.js` (dead code trùng adminClient)

### Dashboard
- [x] KPI stats (users, present, pending leave, pending OT) — 4 thẻ
- [x] AttendanceChart (chips tuần + breakdown ngày)
- [x] Checkin table + chi tiết modal
- [x] Danh sách vắng + Việc cần xử lý + Hoạt động gần đây
- [x] Bổ sung mục "cần admin xử lý" từ `/dashboards/admin/summarys/s`: `pending_orders` (đơn cơm hôm nay), `uniforms_pending` (đơn đồng phục) → đã thêm vào PendingActionsPanel
- [ ] Loading/error/empty đồng nhất cho các panel còn lại

### Auth / Login
- [x] Login web (`POST /login/web`), lưu token + userIF
- [ ] Xử lý 401 hết hạn token → chuyển login

### Users / Departments
- [x] EmployeeManagement: list/update/delete/avatar (PermissionGuard)
- [x] DepartmentManagement: create/getall/getbyid
- [ ] Đối soát `DELETE /users/:id` (FE) vs swagger `DELETE /users/{id}` — đã xác nhận BE dùng path param

### Attendance / Checkin
- [x] AttendanceManagement: `/checkin/getcheckinindateofposition`, `/checkin/search`
- [ ] Kiểm tra `POST /checkin/getcheckindetailindateofuser` dùng trong modal chi tiết

### Nghỉ phép / Tăng ca
- [x] Paid leave: list (admin/leader), create, approve, confirm, delete
- [x] Overtime: list admin, confirm leader, approve admin, create leader
- [ ] Kiểm tra luồng confirm/approve theo từng role

### Lương / Sản xuất / Kho
- [x] Payroll (AdminModulePage)
- [x] PlanProduction, DailyReport, ReportErrors, Inventory (AdminModulePage)
- [x] ReportErrors: detail theo daily report

### Sự kiện / Tin nội bộ
- [x] AdminEventManagement: list/create/update/delete, lọc safety/normal data
- [x] Bật màn hình `/events/safety` và `/events/normal` (đã bỏ stub, lọc is_safety + i18n title)
- [x] AdminInformationManagement: list/create/delete + media

### Nội bộ khác
- [x] Chat (REST + socket)
- [x] Notifications (list/create/mark read/delete)
- [x] ApprovalsHub (tab 5 module)
- [x] FCM tokens (create)
- [x] Food / Canteen (create + list)
- [x] Orders / Purchases / Meals (meal order module)

### Đồng phục / Thuế
- [x] UniformOrders (AdminModulePage)
- [x] TaxDependents + DependentSupport (AdminModulePage)

### Kiểm tra sau mỗi module
- [ ] `npm run build` pass
- [ ] `npm run lint` chỉ còn lỗi pre-existing
