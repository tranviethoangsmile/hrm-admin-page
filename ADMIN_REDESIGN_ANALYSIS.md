# Admin Redesign — Analysis

Tài liệu phân tích project `hrm-admin-page` trước khi redesign. Dùng làm nguồn tham chiếu cho mọi quyết định kiến trúc tiếp theo.

---

## 1. Tech stack hiện tại

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | React 18 + Vite |
| UI | CoreUI React v5 (`@coreui/react`, `@coreui/icons-react`) |
| Routing | `react-router-dom` v6 |
| State | Redux (legacy `createStore`) — chỉ quản lý `sidebarShow`, `sidebarUnfoldable`, `theme` |
| i18n | i18next (`en`/`vi`/`jp`/`pt`) |
| HTTP | axios — có 2 wrapper: `apiClient.js` (apiRequest) và `adminClient.js` (adminRequest) |
| Date | moment.js + react-datepicker |
| Alert | SweetAlert2 |
| Realtime | socket.io-client (chỉ connect + log) |
| Charts | Chart.js + @coreui/react-chartjs (dashboard cũ) — dashboard mới tự dựng chart bằng CSS |

---

## 2. API Layer (đã được 1 lần refactor — quan trọng)

Không còn hard-code URL. Tất cả đi qua:

- `src/config/env.js` — đọc `.env` (`VITE_API_URL` / `VITE_API_BASE_URL`+port+path+version+v1, `VITE_SOCKET_URL`). Export: `apiEnv`, `API_ORIGIN`, `API_ROOT`, `SOCKET_URL`, `buildApiUrl()`.
- `src/api/generatedApiPaths.js` — AUTO-GENERATED từ Swagger (`npm run sync:api`), 139 operations, 32 module mounts. Export `API_MODULES`, `API_PATH_ALIASES`, `SWAGGER_OPERATIONS`.
- `src/constants.js` — re-export toàn bộ alias path.


- `src/api/apiClient.js` — `apiRequest(config)`: wrapper axios, luôn check `payload.success === false`, tự nối `buildApiUrl`, tự gắn `Authorization: Bearer <token>`.
- `src/api/adminClient.js` — `adminRequest({method, path, data, params, headers})`, `getCurrentUser()`, `withAdminUser(payload)` (tự nối `user_id` của admin). **Page admin nên dùng cái này.**

> ⚠️ Vẫn còn nhiều file legacy gọi `axios` trực tiếp (EmployeeManagement, AttendanceManagement, MealManagement, AdminEventManagement, AdminInformationManagement cũ…) — cần migrate dần sang `adminRequest`/`apiRequest`.

---

## 3. Authentication

- `src/views/pages/login/Login.js`: POST `buildApiUrl(LOGIN_URL, LOGIN_WEB)` = `/login/web` body `{user_name, password}`.
- Lưu vào `sessionStorage`: `isLoggedIn`, `token`, `userIF` (dữ liệu user), `currentUser` (giống userIF).
- `App.js`: route `*` → `<DefaultLayout />`; nếu chưa login, DefaultLayout redirect `/login`.
- `DefaultLayout.js`: role KHÔNG nằm trong `ADMIN_ROLES` → render `<Unauthorized />`.
- Auth mặc định là **JWT** (`Authorization: Bearer`), nhưng nhiều route admin vẫn yêu cầu `user_id` trong body (BE đang dần đổi sang đọc từ JWT).

---

## 4. Roles & Permissions hiện tại

Nguồn: `src/constants/adminOptions.js`

```js
ROLE_OPTIONS = ["ADMIN", "MANAGER", "SUPERVISOR", "LEADER", "STAFF"];
ADMIN_ROLES   = ["ADMIN", "MANAGER", "SUPERVISOR", "LEADER"];
```

- Position (dùng để filter dữ liệu theo dây chuyền): `HINO, IZUMO, KYOTO, OSAKA, TOKYO, COMPORATION`.

Quyền hiện tại:

| Role | Quyền trên UI |
|------|----------------|
| STAFF | Không vào admin (Unauthorized) |
| LEADER | Nav riêng `leaderNavigation` (`_nav.js`) |
| SUPERVISOR / MANAGER | Dùng chung `adminNavigation` (như ADMIN) |
| ADMIN | Toàn bộ nav + create/update/delete trong các page |

**Chưa có hệ thống Permission (RBAC).** Hiện chỉ có:
- `_nav.js` chọn navigation theo role string.
- Một vài check thủ công `userData.role === "ADMIN"` (vd DepartmentManagement ẩn nút thêm nếu không phải ADMIN, moduleConfig `visible: (item, currentUser) => currentUser.role === "ADMIN"`).

> Kết luận Phase 2 (Architecture): cần thêm tầng **permission** giữa role và UI (như yêu cầu), nhưng **giữ nguyên** `role`, `position`, `user_id` contract — KHÔNG đổi API/auth.

---

## 5. Các màn hình hiện tại

### 5.1 Layout (đã redesign gần xong)
- `AppSidebar.js`: sidebar tối (colorScheme dark), brand HRM Metal, footer summary + toggler.
- `AppHeader.js`: header dạng brand + chips (position, ngày, language) + user dropdown.
- `AppContent.js`: render route với `route.props` (truyền `moduleKey` xuống `AdminModulePage`).
- `DefaultLayout.js`: wrapper `app-shell` + layout căn chỉnh + Unauthorized guard.

### 5.2 Trang chính
- `Dashboard.js` — data-driven, dựng từ component nhỏ (`StatsCards`, `AttendanceChart`, `ShiftOverview`, `CheckinTable`, `PendingActionsPanel`, `RecentActivityPanel`, `ProductionOrdersPanel`, `AbsentEmployeesPanel`). Gọi API: checkin, user, order, pending leave/OT/safety, production plan. **Chưa phân theo role** và còn vài chuỗi tiếng Việt hard-code trong component.
- `EmployeeManagement.js` — CRUD user đầy đủ (create/edit/delete/avatar/detail panel). **Dùng axios trực tiếp**, có 1 số chỗ hard-code tiếng Anh và nút "Export" + badge `+19.01%` giả.
- `DepartmentManagement.js` — list/create department. Button view/update/delete trong bảng chưa nối action (placeholder).
- `AttendanceManagement.js` — chấm công theo ngày + chi tiết user.
- `MealManagement.js` — order cơm theo ngày/position.
- `AdminEventManagement.jsx` — sự kiện (safety/normal), CRUD + upload media.
- `AdminInformationManagement.jsx` — tin nội bộ, dùng `adminRequest` (đã migrate).
- `AdminModulePage.jsx` + `moduleConfig.js` — **generic CRUD** cho 22 module (dayOffs, paidLeave, overtime, overtimeRequest, payroll, planProduction, dailyReports, reportErrors, inventory, safetyReports, eventChecks, safetyChecks, notifications, uniformOrders, taxDependents, dependentSupport, fcmTokens, food, canteen, chat, auditLogs, orders). Hỗ trợ: list/search/filter/create/update/delete/detail/rowActions/CSV export/pagination (client-side)/enum từ `GET /dashboards/admin/options/get-enums`.

### 5.3 Trang phụ
- `Login`, `Unauthorized`, `404`, `500`, `Checkin`.
- `Settings.js` (placeholder), `DarkModeSettings`, `FontSizeSettings`.
- Legacy placeholder còn sót: `inventory`, `payroll`, `overtime`, `reports` (Coming Soon `.js` lẫn `.jsx`), `assets`, `contracts`, `purchases`, `machining`, `manufacturing`, `task/tasks`, `leave`.

---

## 6. API theo module (đã đăng ký trong `/users`, `moduleConfig`, hoặc dashboard)

Bảng map API hiện có (nguồn `SWAGGER_OPERATIONS` + `moduleConfig.js`):

| Module FE | API (relative `API_ROOT`) |
|-----------|---------------------------|
| Auth | `POST /login/web`, `POST /login/app` |
| Users | `GET/POST/PUT/DELETE /users`, `POST /users/finduserwithfield`, `POST /users/getuserwithdepartmentid`, `POST /users/upload-avatar` |
| Department | `GET /department/getall`, `POST /department/create`, `POST /department/getbyid` |
| Checkin | `POST /checkin/create`, `/getcheckinindateofposition`, `/getcheckindetailindateofuser`, `/search` |
| Day Offs | `GET /dayoffs/getall`, `POST /create`, `PUT /update`, `POST /deletebyid` |
| Paid Leave | `GET /paidleave`, `POST /paidleave/search|create|update|delete`, `POST /updateconfirm`, dashboard endpoints |
| Overtime | `POST /overtimerequest/getAll|getbyuserid|create|updateisconfirm|updateisapproved|deletebyid` |
| Payroll | `POST /payroll/search|create|update|destroy|searchbyid` |
| Plan Production | `POST /planproduction/searchbydateanddepartment|create|destroy|searchbyid`, `PUT /update` |
| Daily Report | `POST /dailyreport/getall|search|create` |
| Error Report | `POST /error-of-report/findByDailyReportId` |
| Inventory | `POST /inventory/getall|search|create|update` |
| Safety Report | `POST /safetyreport/getbydepartmentid|getbyuserid|create|update|confirm|delete` |
| Events | `GET /events/getall`, `POST /events/getwithposition|create|update|delete|searchbyid` |
| Event Check | `POST /eventcheck/searcheventchecked|create` |
| Safety Check | `POST /safetycheck/getallusercheckedsafetycheckevent|create|searchsafetychecked` |
| Information | `POST /information/getallinforbyfield|getinforbyid|getinforofuser|create|deleteinformationbyid` |
| Notification | `POST /notification/search|searchById|create`, `PUT /update`, `POST /destroy` |
| Order/Food/Canteen | `GET/POST /order`, `POST /order/searchorderwithfield`, `GET/POST /food`, `GET/POST /canteen` |
| Uniform | `POST /uniformorder/search/withposition|search/withuserid|create|update|delete|getuniformorderdetail` |
| Tax Dependent | `POST /taxdependent/create|getbyuserid|delete`, `PUT /update|update-status` |
| Dependent Support | `POST /dependent-support-amount/getbytaxdependentidandyear|create|update|confirm|delete` |
| FCM | `POST /fcmtoken/create` |
| Chat | `POST /chat` (AI bot), `POST /conversations/create|creategroup|delete`, `POST /message/create|delete|unsend|searchmessageofconversation` |
| Dashboard admin | `POST /dashboards/admin/checkins/get-checkins`, `/orders/get-orders`, `/users/get-users`, `/informations/get-informations`, `/paidleaves/paid-leave-confirm`, `/notifications/create-notification`, `/options/get-enums`, `/summarys/s`, `/tax-dependents/update-status-tax-dependent`, `/departments/create-department`, `/events/create-event|delete-event` |
| Dashboard leader | `GET /dashboards/leader/paidleaves/get-paid-leave-request`, `POST /approve-paid-leave-request`, `/inventorys/update-inventory`, OT create/destroy |
| Audit logs | `POST /dashboards/logs/search` |

---

## 7. Có thể reuse (KHÔNG rewrite)

1. **`AdminModulePage.jsx` + `moduleConfig.js`** — generic CRUD engine, đã xử lý loading/empty/error/confirm/CSV/pagination. Nhiều module chỉ cần config, không cần page mới.
2. **`adminClient.js` / `apiClient.js`** — API wrapper chuẩn.
3. **`env.js` / `generatedApiPaths.js` / `constants.js`** — config API tập trung.
4. **Dashboard component nhỏ** `StatsCards`, `AttendanceChart`, `ShiftOverview`, `CheckinTable`, `DashboardBottomPanels`, `dashboardHelpers`.
5. **`_nav.js`** cấu trúc nav theo role (chỉ cần thêm tầng permission-filter).
6. **Design tokens trong `_custom.scss`** — brand green `#1a7f37`, gradient, status-badge classes, spacing, `.content-panel`, `.hrm-*`, `.admin-*`.
7. **i18n resources** (4 ngôn ngữ, ~1400 dòng) — nền để thêm translation key mới.
8. **`AppToast`**, `StatusBadge`, `getValue/toList/countOf` helpers.
9. **Alert confirm pattern** (SweetAlert2) cho xóa/approve/reject.

---

## 8. Cần redesign / cải thiện

| Hạng mục | Vấn đề | Giải pháp |
|----------|--------|-----------|
| **RBAC** | Chưa có permission; nav theo role string; check thủ công | Thêm `permissions.js` (map role→permissions), `usePermissions`, `can()`, `PermissionGuard`, `ProtectedRoute` |
| **Routes** | Chưa guard theo permission; tất cả chui vào `*` → DefaultLayout | Guard từng route (vd `/payroll` cần `payroll.view`) |
| **Nav** | Nav dựng theo role, không theo permission | Lọc theo permission từng item |
| **EmployeeManagement** | axios trực tiếp, text EN hard-code, `+19.01%` giả, nút "Export" không làm gì | Migrate `adminRequest`, i18n, bỏ số liệu giả, nối Export |
| **DepartmentManagement** | View/Update/Delete không nối action | Nối update/delete + confirm |
| **Dashboard** | Chưa phân role, chuỗi tiếng Việt hard-code trong component | Tách Admin/Leader hiển thị, dùng i18n |
| **Legacy placeholder** | `inventory/payroll/overtime/reports` Coming Soon `.js`+`.jsx` | Dùng `AdminModulePage` (đã có config) hoặc xóa legacy |
| **Settings** | Trang trống placeholder | Xây Settings đẹp (profile, preferences) dùng dữ liệu user có sẵn |
| **AppHeaderDropdown** | item "View profile / Workspace settings / Security access" href="#" không nối | Nối hành động thật (profile modal/settings) |
| **Audit an toàn** | Một số nút xóa/duyệt vẫn modal CModal thủ công | Chuẩn hóa confirm xóa bằng SweetAlert2 |
| **Lint** | 581 errors (chủ yếu `React` unused import) | Cleanup trước khi đóng module |

---

## 9. API còn thiếu / không được tự giả định

Những thứ sau KHÔNG có API, KHÔNG mock, sẽ ghi BLOCKED nếu cần:

- Dashboard **summary tổng hợp** cho Leader đúng chuẩn (`GET /dashboards/admin/summarys/s` hiện chỉ trả `users_by_position`+`pending_paid_leave` — FE fallback aggregate). KHÔNG có `POST /admin/dashboard/charts`.
- **Export Excel** (`POST /admin/export/{module}`) — FE đang tự gen CSV client-side (được phép, không phụ thuộc API).
- **Thống nhất decision endpoint** cho paid-leave/OT/safety (`/:id/decision`) — FE dùng `updateisconfirm/updateisapproved/confirm` dispatch, không đổi contract.
- **Options users** (`GET /admin/options/users`) — form select user_id vẫn nhập tay.
- **GS** global search/command menu — cần data layer; ghi nhận, không giả vờ.

> Nguyên tắc: không thêm feature chỉ để "cho nhiều". Chỉ build khi có API hoặc dữ liệu thật hỗ trợ.

---

## 10. Kết luận

Project đã được refactor 1 lần (API layer, AdminModulePage, i18n, dashboard mới). Việc redesign tiếp theo tập trung vào:

1. **RBAC permission system** (Phase 2) — bổ sung mà không phá contract auth/role.
2. **Route + nav guard** theo permission.
3. **Dashboard per role** (Admin vs Leader) — dữ liệu từ API có sẵn.
4. **Hoàn thiện module còn placeholder** bằng `AdminModulePage`/config.
5. **Cleanup legacy** + lint.