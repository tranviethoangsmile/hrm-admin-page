# ADMIN API — Business Analysis

> **Project:** HRM Metal — Hệ thống quản lý nhân sự nhà máy sản xuất linh kiện kim khí
> **Backend:** `/Users/hoangdev/Desktop/hrmMetal` (Express + Sequelize + PostgreSQL + Redis + Socket.IO + Cloudinary + FCM)
> **Frontend:** `/Users/hoangdev/Desktop/hrm-admin-page` (React 18 + CoreUI + i18next)
> **Source of truth:** `src/routers`, `src/controllers`, `src/useCases`, `src/models`, `src/securitys`, `src/socket`, `src/services/pushNotification`

---

## 0. Bức tranh tổng thể (Business Model)

Hệ thống này **không phải** một HR SaaS thông thường — đây là hệ thống vận hành cho một **nhà máy sản xuất linh kiện** với các đặc trưng:

- **`position` = NHÀ MÁY / KHU SẢN XUẤT** (HINO, IZUMO, KYOTO, OSAKA, TOKYO, COMPORATION), không phải "chức danh".
  Mọi nghiệp vụ (chấm công, suất ăn, sự kiện, inventory, plan production) đều **scope theo position**.
  Admin quản lý **đúng một nhà máy** của mình (position lấy từ JWT, không thể ghi đè).
- **`department` = PHÒNG / CHUYỀN SẢN XUẤT** (còn gọi là "chapter" trong code order).
- **Ca làm việc (`work_shift`)**: DAY / NIGHT. **Shift sản xuất (`shift`)**: A / B / C.
- Quy tắc chấm công **hardcode trong backend**: vào ca ≥08:00, nghỉ trưa 12:00–12:45, ca ngày kết thúc 16:45, threshold OT 17:00; ca đêm vào ≥20:00, kết thúc 05:00, OT từ 05:15; cuối tuần (thứ 7/CN/day-off) tính khác và OT = 0. Làm tròn công theo 0.25h.
- **4 luồng duyệt chính đều là state-machine nhiều bước** (chi tiết bên dưới): Chấm công, Nghỉ phép (2 cấp), Tăng ca (2 cấp), Báo cáo an toàn (1 cấp).
- **Position-scoped admin**: Admin dashboard chỉ thấy dữ liệu của position mình.
- **Audit log** xuyên suốt: CREATE / UPDATE / DELETE / APPROVE / CONFIRM — admin có thể search.
- **Realtime** qua Socket.IO cho chat (per-conversation room) + `userChecked` (check-in/out); **push FCM** cho sự kiện an toàn, tăng ca, message mới.

### Vai trò (Role.enum.ts)

| Role | Login | Đặc quyền |
|---|---|---|
| `STAFF` | app | Chấm công, đặt suất ăn, xem thông tin, khai báo an toàn, đơn nghỉ/tăng ca tự tạo, tự xác nhận OT |
| `LEADER` | app | Duyệt nghỉ phép (queue của leader), tạo/xóa OT cho thành viên, cập nhật inventory của phòng, xác nhận báo cáo an toàn |
| `SUPERVISOR` | app | Như LEADER (nằm trong nhóm leaderAndOther) |
| `MANAGER` | app | Như LEADER + payroll CRUD + xem user + audit logs |
| `ADMIN` | web | Toàn quyền dashboard (chỉ cho người dùng web) |
| `SUPER_ADMIN` | web (mâu thuẫn rõ: login được nhưng bị chặn ở `/dashboards/admin` vì guard `requireRoles(['ADMIN'])` không chứa SUPER_ADMIN) | — |

> ⚠️ **Phát hiện**: `SUPER_ADMIN` login web OK nhưng mọi route admin đều 403. Đây là bug BE cần xác nhận (xem `ADMIN_API_GAPS.md`).

---

## 1. AUTHENTICATION & SESSION

| # | API | Purpose | Data | Who | Access | Workflow | UI required |
|---|---|---|---|---|---|---|---|
| 1.1 | `POST /api/version/v1/login/web` | Đăng nhập dashboard | `{user_name, password}` → `{success, data:{id,name,user_name,avatar,position,role,department_id}, token}` | ADMIN, SUPER_ADMIN | public | 403 nếu role không phải ADMIN/SUPER_ADMIN ("Not allowed for dashboard") | Login page |
| 1.2 | `POST /api/version/v1/login/app` | Đăng nhập app | như trên | STAFF/LEADER/SUPERVISOR/MANAGER | public | 403 nếu role nằm web-roles ("Not allowed for app") | (app, không dùng) |
| 1.3 | `authJwt` (global) | Mọi route trừ `/login`, `/media` yêu cầu Bearer JWT | payload: `{id,name,user_name,avatar,position,role,department_id}`, TTL 2h, secret = sha256(SECRET) | mọi role | global | Token hết hạn → 401. Không có refresh token. | FE phải xử lý hết hạn: interceptor 401 → force logout |
| 1.4 | `requireRoles([...])` | Guard theo role (chỉ duy nhất cơ chế) | so `req.user.role` | — | route | 403 "You do not have permission for this action" | FE: 403 → trang Unauthorized; ẩn nav theo permission |

**Gap FE rõ ràng**: hiện FE lưu `currentUser`/`userIF` + `token` trong sessionStorage nhưng **chưa có axios interceptor** xử lý 401 (token hết hạn 2h). Cần "session timeout / autorefresh" hoặc "expiry guard".

---

## 2. PEOPLE — NHÂN SỰ (users + departments)

### 2.1 Users

| # | API | Purpose | Data ra | Who | Access | Workflow | UI required |
|---|---|---|---|---|---|---|---|
| 2.1.1 | `POST /dashboards/admin/users/get-users` | Danh sách nhân sự của nhà máy (position từ token), loại admin | `{rows,count}`: id,name,email,dob,phone,avatar + department{name} | ADMIN | ADMIN | — | **Employees list (thay thế current /employees)** |
| 2.1.2 | `POST /dashboards/admin/users/create-user` | Tạo user mới; position gán từ token; **chặn tạo ADMIN** | CreateField + trả user | ADMIN | ADMIN | Audit CREATE; bcrypt password; invalidate Redis ALL_USER | **Create Employee modal** |
| 2.1.3 | `GET /users` | Toàn bộ user (all positions) | fields + department.name | ADMIN, MANAGER | ADMIN/MANAGER | cached ALL_USER 1min | Tra cứu / import |
| 2.1.4 | `GET /users/:id` | Chi tiết user | + department.name | mọi user | auth | — | Detail drawer |
| 2.1.5 | `PUT /users` | Cập nhật; admin sửa mọi thứ; non-admin chỉ sửa profile mình (whitelist) | — | mọi user (rule trong useCase) | auth | ADMIN_UPDATABLE_FIELDS: role,position,department_id,salary_hourly,shift_night_pay,travel_allowance_pay,paid_days,is_active,... | **Edit employee (admin)** + profile self-edit |
| 2.1.6 | `DELETE /users/:id` | Xóa mềm + is_active=false | — | ADMIN | ADMIN | Audit CREATE (bug: action sai) | Xóa employee + confirm |
| 2.1.7 | `POST /users/upload-avatar` | Upload avatar Cloudinary | media_path | mọi user (self) | auth + create_media_path | — | Avatar crop/upload |
| 2.1.8 | `POST /users/finduserwithfield` | Lọc user theo position/department/role/employee_id/name | danh sách | mọi role | auth | — | **User selector (dùng mọi nơi: tạo đơn, OT, payroll)** |
| 2.1.9 | `POST /users/findbyname` | Search LIKE theo name | — | mọi role | auth | — | Global search |
| 2.1.10 | `POST /users/getuserwithdepartmentid` | User theo dept, **exclude STAFF** | {id,name} | mọi role | auth | Dùng cho chọn leader khi tạo đơn nghỉ | Chọn leader trong form đơn nghỉ |
| 2.1.11 | `POST /users/getalluserforotrequestfeature` | User trong dept (mọi role) | {id,name} | mọi role | auth | Dùng cho OT | Chọn user trong form OT |

**Nghiệp vụ suy ra (missing screens)**:
- **Employee Management** phải gồm: danh sách theo position + search/filter (dept/chức vụ/trạng thái) + create/edit/delete + detail (thông tin lương, ngày công, paid_days balance, lịch sử chấm công, lịch sử đơn nghỉ/OT).
- Cần **view paid_days balance** (user.paid_days) — trực tiếp ảnh hưởng duyệt nghỉ.

### 2.2 Departments

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 2.2.1 | `GET /department/getall` | DS phòng ban | mọi role | auth | — | Select + list phòng ban |
| 2.2.2 | `POST /department/getbyid` | Chi tiết | mọi role | auth | — | Detail |
| 2.2.3 | `POST /department/create` | Tạo (audit khi đi qua admin endpoint) | mọi role | auth | — | **Department list page** |
| 2.2.4 | `POST /dashboards/admin/departments/create-department` | Tạo phòng ban (admin) | ADMIN | ADMIN | Audit CREATE | /

> ⚠️ **BE thiếu**: department **không có update/delete API**. DepartmentManagement FE hiện có nút Update/Delete nhưng BE không hỗ trợ — nên giữ View + Create (đã làm). Xem `ADMIN_API_GAPS.md`.

---

## 3. ATTENDANCE — CHẤM CÔNG (checkin + dayoffs)

| # | API | Purpose | Data | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|---|
| 3.1 | `POST /checkin/create` | Check-in + Check-out (1 endpoint, state machine) | date, vị trí; BE tính time_in/time_out, work_time (0.25h), over_time, work_shift, is_weekend, is_checked | MANAGER/LEADER/SUPERVISOR/STAFF (app) | requireRoles | **State machine**: ① chưa có row → check-in (is_checked=false) ② có row chưa checkout → checkout (tính công/OT, socket `userChecked in/out`, notification) ③ row đã xong → 400 | — (app) |
| 3.2 | `POST /checkin/getcheckinindateofposition` | Chấm công của nhà máy theo ngày | rows đầy đủ + user | mọi role | auth | — | ⭐ **Attendance (per-position, per-date)** — replace hiện tại |
| 3.3 | `POST /checkin/search` | Chấm công của 1 user theo ngày (tháng) | rows của user trong ngày | mọi role | auth | — | **Attendance detail theo user** |
| 3.4 | `POST /checkin/getcheckindetailindateofuser` | Chi tiết chấm công 1 người 1 ngày | 1 row | mọi role | auth | — | Detail modal |
| 3.5 | `GET /dayoffs/getall` | Danh sách ngày nghỉ lễ nhà máy | rows | mọi role | auth | Dùng bởi checkin để tính is_weekend/dayoff | Ngày công + lịch |
| 3.6 | `POST /dayoffs/create`, `PUT /dayoffs/update`, `POST /dayoffs/deletebyid`, `GET /dayoffs/getbyid` | CRUD ngày nghỉ | — | ADMIN | requireRoles(['ADMIN']) | — | **Day-off manager** |

**KPI suy ra**: Present / Late / Absent / Overtime / Missing check-in theo position+date; phân bố DAY/NIGHT; is_weekend; danh sách chưa checkout (is_checked=false).

**Gap**: không có API sửa sai chấm công (attendance correction). `go_out/go_in` không được ghi. Xem gaps.

---

## 4. LEAVE — NGHỈ PHÉP (paidleave) — luồng 2 cấp

| # | API | Purpose | Data | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|---|
| 4.1 | `POST /paidleave/create` | NV tạo đơn nghỉ (cần leader_id, date_request, date_leave, position) | reason,user_id,leader_id,is_paid,is_half,... | mọi role (em tạo) | auth | — | **Leave request form** |
| 4.2 | `GET /dashboards/leader/paidleaves/get-paid-leave-request` | **Inbox leader**: đơn chưa duyệt của mình | {rows,count} + staff + leader + dept | LEADER/SUPERVISOR/MANAGER | requireRoles([LEADER,SUPERVISOR,MANAGER]) | — | **Leave approval queue (leader view)** |
| 4.3 | `POST /dashboards/leader/paidleaves/approve-paid-leave-request` | Leader duyệt/từ chối | {id, is_approve, feedback?}; leader_id & actor_name từ token | LEADER/... | như trên | Audit APPROVE; chặn đã duyệt | Nút Approve/Reject kèm feedback |
| 4.4 | `POST /dashboards/admin/paidleaves/paid-leave-confirm` | **Admin xác nhận cuối** — transaction | {id, user_id, feedback?}; admin_id & actor_name từ token | ADMIN | ADMIN | **Transaction**: validate is_approve=true & chưa confirm → trừ paid_days (0.5 nếu half) → tạo checkin row is_paid_leave=true → is_confirm=true; Audit CONFIRM | **Leave confirmation queue (admin view)** |
| 4.5 | `POST /paidleave/search` | Tìm kiếm theo bất kỳ trường (user/leader/date/position/is_approve/is_confirm) | rows | mọi role | auth | — | **Leave history / filterable table** |
| 4.6 | `POST /paidleave/delete` | Xóa (chỉ owner) | {id, user_id?} | owner | auth | — | Xóa đơn (em) |
| 4.7 | `PUT /paidleave` | Đặt is_approve=true (legacy) | {id} | roles quản lý | requireRoles | — | — |

**Workflow hoàn chỉnh**:
```
NV tạo đơn → Leader duyệt (is_approve) → Admin confirm (is_confirm) → trừ paid_days + tạo row chấm công nghỉ
```
**KPI**: Pending leader, Pending admin confirm, Leave calendar, Leave balance (paid_days).

---

## 5. OVERTIME — TĂNG CA (luồng 2 cấp, leader tạo)

| # | API | Purpose | Data | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|---|
| 5.1 | `POST /dashboards/leader/overtime-requests/create` | Leader tạo OT cho thành viên | user_id,date,overtime_hours(1-12),description; leader_id & department_id từ token | LEADER/SUPERVISOR/MANAGER | như leader | Validate user cùng phòng, role leader ≠ STAFF; FCM push + notification INFO + Audit CREATE | **Create OT form (leader)** |
| 5.2 | `POST /overtimerequest/updateisconfirm` | NV xác nhận đơn OT | {id, user_id} → is_confirm=true | ADMIN (guard hiện tại chỉ ADMIN — nghi ngờ sai, xem gaps) + NV | auth | step 2 | Nút "Confirm" |
| 5.3 | `POST /overtimerequest/getAll` | **Queue admin**: is_confirm=true & is_approved=false | rows | ADMIN | ADMIN | — | **OT approval queue (admin)** |
| 5.4 | `POST /dashboards/admin/overtime-requests/update-approve-overtime-request` | Admin duyệt | {id} → is_approved=true | ADMIN | ADMIN | Audit UPDATE | Nút Approve |
| 5.5 | `POST /overtimerequest/getbyuserid` | Đơn OT của user (is_confirm=false) | rows | mọi role | auth | — | "OT của tôi" |
| 5.6 | `POST /overtimerequest/getbyid` | Chi tiết | row | mọi role | auth | — | Detail |
| 5.7 | `POST /dashboards/leader/overtime-requests/destroy` | Leader xóa đơn của mình | {id}; ownership check | LEADER/... | như leader | Audit DELETE | Xóa |

> ⚠️ **Guard 5.2 `requireRoles(['ADMIN'])`** mâu thuẫn workflow "employee confirms". Xem gaps.

---

## 6. PAYROLL — LƯƠNG

| # | API | Purpose | Data | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|---|
| 6.1 | `POST /payroll/create` | Tạo phiếu lương | date,pay_date,user_id,gross_salary,net_salary + nhiều cột | ADMIN/MANAGER | requireRoles | — | **Payroll create/import** |
| 6.2 | `POST /payroll/update` | Sửa phiếu lương | — | ADMIN/MANAGER | như trên | — | Edit |
| 6.3 | `POST /payroll/destroy` | Xóa mềm | {id} | ADMIN/MANAGER | như trên | — | Delete |
| 6.4 | `POST /payroll/search` | Phiếu lương user theo tháng | {user_id,date} | mọi role | auth | — | **Payroll per user/month** |
| 6.5 | `POST /payroll/searchbyid` | Chi tiết | {id} | mọi role | auth | — | Detail |

**Nghiệp vụ**: Bảng lương đầy đủ (công, OT, weekend, phụ cấp, gross, thuế, BH, net). Admin quản lý; NV self-view. **Payroll là nơi DN tính tiền từ dữ liệu chấm công — cần report month.**

---

## 7. PRODUCTION — SẢN XUẤT (daily report + plan production + inventory + error code)

### 7.1 Daily Report

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 7.1.1 | `POST /dailyreport/create` | NV ghi kết quả sản xuất ca (product, quantity, good, defective, cycle_time, operated/shutdown_time, errors[]) — **transaction: tự cập nhật inventory** | mọi role | auth | Tạo row + bulk error codes + **inventory reconciliation theo dept (đặc biệt dept `加工`/machining có chuyển kho)** + notification SUCCESS | **Daily report entry** |
| 7.1.2 | `POST /dailyreport/getall` | Lọc theo date/dept/product/shift/user | mọi role | auth | ⚠️ **Bug BE**: validate enum ngược → product hợp lệ bị 400 | ⭐ **Production reports list** |
| 7.1.3 | `POST /dailyreport/search` | Search flexible | mọi role | auth | — | Report search |
| 7.1.4 | `GET /dailyreport/:id` | Chi tiết | mọi role | auth | — | Detail |
| 7.1.5 | `POST /error-of-report/findByDailyReportId` | Mã lỗi của báo cáo | mọi role | auth | — | **Error codes viewer** |

### 7.2 Plan Production

| # | API | Purpose | UI |
|---|---|---|---|
| 7.2.1 | `POST /planproduction/create` | Tạo kế hoạch sp (dept,line,ca,product,quantity,operation_time) | Plan entry |
| 7.2.2 | `PUT /planproduction/update` | Sửa | Edit |
| 7.2.3 | `POST /planproduction/searchbydateanddepartment` | Kế hoạch theo dept + ngày (7-day) | **Plan board / Gantt-ish week view** |
| 7.2.4 | `POST /planproduction/searchbyid` | Chi tiết | Detail |
| 7.2.5 | `POST /planproduction/destroy` | Xóa mềm | Delete |

### 7.3 Inventory

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 7.3.1 | `POST /inventory/getall` | Toàn bộ tồn kho | cached | mọi role | auth | — | **Inventory list** |
| 7.3.2 | `POST /inventory/search` | Theo dept/product | — | mọi role | auth | — | Filter |
| 7.3.3 | `POST /inventory/create` | Tạo | mọi role | auth | invalidate cache | Create |
| 7.3.4 | `POST /inventory/update` | Cập nhật | mọi role | auth | — | Edit |
| 7.3.5 | `POST /dashboards/leader/inventorys/update-inventory` | **Leader cập nhật inventory phòng mình** (department_id từ token) | LEADER/... | leader | Audit UPDATE | Leader inventory adjust |

**Nghiệp vụ quan trọng**: daily report tự động reconcile inventory — nghĩa là **kho hàng tự cập nhật theo báo cáo sản xuất**. Cần giám sát: Low stock, movement theo ngày.

---

## 8. EVENTS + CHECK-IN SỰ KIỆN + AN TOÀN (SỰ KIỆN)

### 8.1 Events

| # | API | Purpose | Data | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|---|
| 8.1.1 | `GET /events/getall` | DS event active | name,date_start,date_end,position,is_safety,is_active,media | mọi role | auth | — | **Event list** |
| 8.1.2 | `POST /events/getwithposition` | Event theo position (hoặc CORP) | — | mọi role | auth | ⚠️ Enum hư COMPORATION k/v | Event theo nhà máy |
| 8.1.3 | `POST /events/searchbyid` | Chi tiết | — | mọi role | auth | — | Event detail |
| 8.1.4 | `POST /dashboards/admin/events/create-event` | Admin tạo event; nếu is_safety → FCM push cho toàn vị trí | multipart media | ADMIN | ADMIN + create_media_path | Audit CREATE; push "Safety Check Required!" | **Create/edit event** |
| 8.1.5 | `POST /events/update` | Sửa (admin) | — | ADMIN | ADMIN | — | Edit |
| 8.1.6 | `POST /dashboards/admin/events/delete-event` + `/events/delete` | Xóa | ADMIN | ADMIN | Audit DELETE | Delete |

### 8.2 Event Check (xác nhận tham dự)

| # | API | Purpose | UI |
|---|---|---|---|
| 8.2.1 | `POST /eventcheck/create` | NV xác nhận tham dự event (is_confirm) | (app) |
| 8.2.2 | `POST /eventcheck/searcheventchecked` | Xem 1 người đã check event chưa | **Check-in participant status per user** |

### 8.3 Safety Check (khai báo an toàn — SỰ KIỆN an toàn)

| # | API | Purpose | UI |
|---|---|---|---|
| 8.3.1 | `POST /safetycheck/create` | NV khai báo is_safety, is_at_home, is_can_work, feedback | (app) |
| 8.3.2 | `POST /safetycheck/searchsafetychecked` | Trạng thái 1 người | Detail |
| 8.3.3 | `POST /safetycheck/getallusercheckedsafetycheckevent` | **Toàn cảnh: ai đã check, is_safety, dept, avatar, employee_id** | ⭐ **Safety monitoring per event** |

### 8.4 Safety Report (báo cáo an toàn — KHÁC events)

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 8.4.1 | `POST /safetyreport/create` | NV tạo report (title, content, solution, media) | mọi role | auth + create_media_path | — | Safety report form |
| 8.4.2 | `POST /safetyreport/getbydepartmentid` | **Queue leader**: department chỉ trả is_confirm=false | mọi role | auth | — | **Leader safety queue** |
| 8.4.3 | `POST /safetyreport/confirm` | Leader confirm + corrective_action (role ≠ STAFF) | leader_id từ body (bug: không ép từ token) | mọi role nhưng useCase kiểm role ≠ STAFF | auth | Audit không có → xem gaps | Nút Confirm + corrective action |
| 8.4.4 | `POST /safetyreport/update` | Sửa | — | auth | — | Edit |
| 8.4.5 | `POST /safetyreport/delete` | Xóa (chặn nếu confirm) | — | auth | — | Delete |
| 8.4.6 | `POST /safetyreport/getbyuserid` | Lịch sử user theo tháng | — | auth | — | History |

> ⚠️ **Phân biệt rõ hai thứ an toàn**: **SafetyCheck = khai báo trạng thái an toàn cá nhân sau sự kiện an toàn** (disaster/weather), **SafetyReport = báo cáo sự cố/near-miss kèm giải pháp**. Admin cần **2 luồng UI khác nhau**. FE hiện đang trộn 2 cái.

---

## 9. COMMUNICATION — CHAT + THÔNG BÁO

### 9.1 Chat (conversation + message + groupMember + socket)

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 9.1.1 | `POST /conversations/create` | Tạo 1-1, tái dùng nếu tồn tại | mọi role | auth | — | ⭐ **Chat Center** |
| 9.1.2 | `POST /conversations/creategroup` | Tạo group (receivers ≥2) | mọi role | auth | — | Tạo group |
| 9.1.3 | `POST /conversations/delete` | Ẩn hội thoại (tạo DeleteMessage cho mọi msg + DeleteConversation) | mọi role | auth | membership check | Ẩn |
| 9.1.4 | `POST /groupmember/getgroupmemberofuser` | **Danh sách hội thoại của user + peer (id,name,avatar) + messages** | mọi role | auth | — | **Conversation list** |
| 9.1.5 | `POST /message/searchmessageofconversation` | Tin nhắn của hội thoại (+ DeleteMessage markers) | mọi role | auth | — | Message thread |
| 9.1.6 | `POST /message/create` | **Chỉ upload media → trả media_path; message thật qua socket `send-message`** | mọi role | auth + create_media_path | — | Upload attachment |
| 9.1.7 | Socket `joinConversation` + `send-message` → emit `${conversation_id}` | Gửi/nhận message realtime; broadcast + FCM push | mọi role | socket (không auth!) | — | **Thay vì polling** |
| 9.1.8 | Socket `un_send_message`, `delete_message` | Rút tin / xóa tin (per user) | mọi role | socket | — | Unsent placeholder + per-user delete |
| 9.1.9 | `POST /message/unsend` `POST /message/delete` | HTTP fallback | — | auth | — | — |
| 9.1.10 | `POST /fcmtoken/create` | Đăng ký device (destroys cũ) | mọi role | auth | — | (app) |

**⚠️ Không có unread count endpoint.** "Unread" phải suy ra từ `groupmember` (messages array + delete_messages) hoặc phải bổ sung BE. Xem gaps.

**Nghiệp vụ Admin cần (missing)**:
- **Chat Center** đầy đủ: conversation list + thread + realtime + attachment viewer + gửi ảnh/video.
- **Message tìm kiếm**: không có API search tin nhắn.
- **Saqlà**: không có "admin hai lần là quản trị hội thoại" (assign conversation) — không có API. Không chế.
- **Realtime ưu tiên socket** vì BE đã có room per conversation.

### 9.2 Notifications

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 9.2.1 | `POST /dashboards/admin/notifications/create-notification` | Admin broadcast | ADMIN | ADMIN | Audit CREATE | **Notification composer** |
| 9.2.2 | `POST /notification/searchById` | **Unread list của user** (is_readed=false) | mọi role | auth | Redis cached | **Notification center (unread)** |
| 9.2.3 | `PUT /notification/update` | Mark read {id} | mọi role | auth | — | Nút read |
| 9.2.4 | `POST /notification/destroy` | Xóa | auth | — | — |
| 9.2.5 | `POST /notification/search` | Chi tiết {id} | auth | — | — |

**Gap**: không có API liệt kê all (đã đọc + chưa đọc) và không có badge realtime qua socket; chỉ có unread qua polling/cache.

---

## 10. INFORMATION — THÔNG TIN / CÔNG BỐ

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 10.1 | `POST /information/getallinforbyfield` | Thông tin công bố của position (is_public=true) | STAFF/LEADER/MANAGER/SUPERVISOR (ADMIN bị loại!) | auth | cached | ⭐ **Thông tin board** |
| 10.2 | `POST /dashboards/admin/informations/create-information` | Admin đăng | ADMIN | ADMIN + create_media_path | Audit CREATE; invalidate cache | **Create post (+ media/video)** |
| 10.3 | `GET /dashboards/admin/informations/get-informations` | Đăng nào của admin | ADMIN | ADMIN | cached | Danh sách bài của tôi |
| 10.4 | `POST /dashboards/admin/informations/delete-informations` | Xóa + xóa media | ADMIN | ADMIN + delete_media_path | Audit DELETE | Delete |
| 10.5 | `POST /information/getinforbyid` / `getinforofuser` | Chi tiết / bài theo user | mọi role | auth | — | Detail |

**Chú ý**: Admin bị exclude khỏi `getallinforbyfield` nên **admin phải dùng endpoint admin** để xem bài của mình. Cần 1 Information Manager cho admin (khác kênh đọc của NV).

---

## 11. TAX & DEPENDENTS (thuế, người phụ thuộc)

### 11.1 Tax Dependent

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 11.1.1 | `POST /taxdependent/create` | NV khai người PT | mọi role | auth + media | status=PENDING | (app) |
| 11.1.2 | `POST /taxdependent/getbyuserid` | DS khai của user | mọi role | auth | — | Xem |
| 11.1.3 | `PUT /taxdependent/update-status` | **Admin: PENDING→APPROVED/REJECTED** | ADMIN | ADMIN | Audit qua admin endpoint | ⭐ **Approval queue tax dependent** |
| 11.1.4 | `PUT /dashboards/admin/tax-dependents/update-status-tax-dependent` | Như trên + audit | ADMIN | ADMIN | Audit UPDATE | — |
| 11.1.5 | `POST /taxdependent/delete`, `PUT /taxdependent/update` | owner-only | owner | auth | — | — |

### 11.2 Dependent Support Amount

| # | API | Purpose | UI |
|---|---|---|---|
| 11.2.1 | `POST /dependent-support-amount/create/update/delete` | Số tiền hỗ trợ theo dependent × năm | form |
| 11.2.2 | `POST /dependent-support-amount/confirm` | **Admin confirm** is_confirm=true | Nút confirm |
| 11.2.3 | `POST /dependent-support-amount/getbytaxdependentidandyear` | Xem | filter |
| 11.2.4 | `POST /dependent-support-amount/getbyid` | Chi tiết | detail |

**Nghiệp vụ**: Bộ phận phụ thuộc thuế có **luồng admin duyệt 2 tầng** (dependent + support amount). Admin cần queue xét duyệt.

---

## 12. SERVICE — SUẤT ĂN + ĐỒNG PHỤC

### 12.1 Orders (suất ăn)

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 12.1.1 | `POST /order` | Đặt suất ăn (cutoff 9:00 hôm nay hoặc ngày tương lai) | LEADER/STAFF/MANAGER/SUPERVISOR (app) | requireRoles trên module | `timeOrderLimit`: quá giờ → "Order time has expired"; notification | (app) |
| 12.1.2 | `GET /dashboards/admin/orders/get-orders` | Đơn suất ăn của nhà máy theo ngày | rows + user + dept | ADMIN | ADMIN | ⭐ **Meal orders per day** |
| 12.1.3 | `POST /dashboards/admin/orders/create-orders` | Admin đặt hộ | ADMIN | ADMIN | Audit CREATE | Tạo hộ |
| 12.1.4 | `DELETE /order/:id` | Xóa (chặn nếu ngày < hôm nay) | mọi role | module | — | Xóa |
| 12.1.5 | `POST /order/searchorderwithfield` | Search | — | module | — | Filter |
| 12.1.6 | `PUT /order/user` / `POST /order/user` | Mark picked / đơn của user | mọi role | module | — | Xác nhận nhận suất |

**KPI**: số lượng DAY/NIGHT, tổng theo ngày, chưa picked → số bữa cần chuẩn bị cho canteen.

### 12.2 Food / Canteen

| 12.2.1 | `POST/GET/GET:food` `POST/GET/GET:canteen` | CRUD danh mục món + canteen | mọi role | auth | Không quan hệ DB với order (chỉ theo dayOrNight convention) | **Menu/canteen admin** |

### 12.3 Uniform Order

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 12.3.1 | `POST /uniformorder/create` | NV đặt đồng phục (items[]) | mọi role | auth | 1 row/item | (app) |
| 12.3.2 | `POST /uniformorder/search/withposition` | Đơn theo nhà máy | mọi role | auth | — | ⭐ **Uniform queue theo position** |
| 12.3.3 | `POST /uniformorder/search/withuserid` | Đơn theo user + status | mọi role | auth | — | Của tôi |
| 12.3.4 | `POST /uniformorder/update` | Đổi status (pending→processing→completed/cancelled) + delivery_date | mọi role | auth | ⚠️ không có admin guard | **Status manager admin** |
| 12.3.5 | `POST /uniformorder/delete`, `getuniformorderdetail` | — | — | auth | — | — |

> ⚠️ UseCase `GET_ALL_UNIFORM_ORDERS_OF_POSITION_FOR_ADMIN` tồn tại nhưng **không mount route** — admin "uniform pending" trong summary `/summarys/s` có count nhưng không có trang xem chi tiết pending. Xem gaps.

---

## 13. AUDIT & HỆ THỐNG

| # | API | Purpose | Who | Access | Workflow | UI |
|---|---|---|---|---|---|---|
| 13.1 | `POST /dashboards/logs/search` | Tra cứu audit log (actor, resource_type, from/to, pagination) | ADMIN/MANAGER | ADMIN/MANAGER | — | **Audit log viewer (filter + pagination)** |
| 13.2 | `GET /dashboards/admin/options/get-enums` | Toàn bộ enum (roles, positions, products, shifts, uniform, tax...) | ADMIN | ADMIN | — | **Nguồn dữ liệu dropdown toàn FE** |
| 13.3 | `POST /media/uploads` (public) | — | — | public | — | — |

---

## 14. TỔNG HỢP WORKFLOW CỐT LÕI (để thiết kế màn hình)

```
A. CHẤM CÔNG        NV check-in → checkout → BE tính công/OT → socket userChecked → dashboard/admin theo ngày
B. NGHỈ PHÉP         NV tạo → Leader duyệt → Admin confirm → trừ paid_days + row chấm công nghỉ phép
C. TĂNG CA           Leader tạo → NV confirm → Admin approve
D. SỰ KIỆN AN TOÀN   Admin tạo event is_safety → FCM push → NV khai báo an toàn → Admin theo dõi tỉ lệ check
E. BÁO CÁO AN TOÀN   NV báo cáo sự cố → Leader confirm + corrective_action
F. SẢN XUẤT          Kế hoạch → Báo cáo ca (auto cập nhật TỒN KHO) → mã lỗi
G. SUẤT ĂN           Đặt trước 9:00 → Admin đếm theo ngày/ca → canteen (isPicked)
H. THUẾ/DEPENDENTS   NV khai → Admin duyệt status → Admin confirm support amount
I. ĐỒNG PHỤC         NV đặt → Admin/kho đổi status → giao
J. CHAT              Admin chọn người/hội thoại → đọc → trả lời realtime
K. TTM THÔNG TIN     Admin đăng công bố → NV đọc theo position
```

---

## 15. KẾT LUẬN — MÀN HÌNH ADMIN CẦN (rút ra từ nghiệp vụ)

| Nghiệp vụ | KPI/Màn hình cần | API hỗ trợ |
|---|---|---|
| Dashboard | Summary tổng (pending leave, checkins hôm qua, orders hôm nay, users, uniforms pending) | `/dashboards/admin/summarys/s` |
| Chấm công | Attendance theo position/date, DAY/NIGHT, chưa checkout, OT | 3.2/3.3/3.4 |
| Nghỉ phép | Queue leader + Queue admin confirm + lịch sử + balance | 4.1–4.7 |
| Tăng ca | Queue admin approve + lịch sử theo user | 5.3/5.4/5.5/5.6 |
| Lương | Bảng lương theo tháng + chi tiết | 6.x |
| Sản xuất | Báo cáo ca + kế hoạch + tồn kho + mã lỗi | 7.x |
| Events | Event list + create/edit + participants check-in + safety monitoring | 8.1/8.2/8.3 |
| An toàn | Safety queue (report) + Safety monitoring (check) | 8.3/8.4 |
| Chat | Chat center realtime | 9.1 |
| Thông báo | Notification composer + unread inbox | 9.2 |
| Công bố | Information manager (đăng/xem của admin) | 10.x |
| Thuế | Queue xét duyệt dependent + support | 11.x |
| Suất ăn | Meal orders theo ngày/ca | 12.1 |
| Đồng phục | Uniform queue + status manager | 12.3 |
| Nhân sự | Employee CRUD theo position + detail | 2.x |
| Phòng ban | Department list + create | 2.2 |
| Audit | Log viewer | 13.1 |

**Đây là nền tảng cho ADMIN_INFORMATION_ARCHITECTURE.md.**