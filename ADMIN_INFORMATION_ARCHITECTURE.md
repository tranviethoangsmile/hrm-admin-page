# ADMIN Information Architecture

> Dựa trên `ADMIN_API_BUSINESS_ANALYSIS.md`. Cấu trúc sidebar + màn hình được sinh ra từ **nghiệp vụ thực tế** (position-scoped factory HRM), không phải từ tên API.
> Mọi node có gắn **permission** (RBAC). Màn hình dùng biểu tượng ⭐ = màn hình mới/missing cần xây; 🔧 = màn hình hiện có cần refactor.

---

## 1. Nguyên tắc cốt lõi

1. **Position-scoped**: Admin của HINO chỉ thấy HINO. Mọi list theo position phải tự động lấy từ token (backend chặn override).
2. **Trạng thái hàng đầu**: màn hình phải ưu tiên queue chờ xử lý (pending/approve/confirm) vì đó là việc admin làm hằng ngày.
3. **Tách luồng Approve khỏi CRUD**: Admin làm 2 việc khác nhau — (a) quản lý dữ liệu nền, (b) xử lý đơn. Không trộn vào một bảng.
4. **Tách an toàn thành 2 thứ riêng biệt**: `Safety Check` (khai báo sau sự kiện) khác `Safety Report` (báo cáo sự cố).
5. **Realtime**: Chat dùng socket (đã có room); chấm công dùng `userChecked`.

---

## 2. SIDEBAR (Admin — role ADMIN)

```
DASHBOARD
└── Tổng quan (position)                                             dashboard.view

VẬN HÀNH
├── Chấm công (Attendance theo ngày/ca)                              attendance.view/attendance.detail
├── Suất ăn (Orders per day/DayNight)                                orders.view/orders.manage
├── Tồn kho (Inventory)                                              inventory.view
├── Kế hoạch sản xuất (Plan production)                              planProduction.view
├── Báo cáo sản xuất (Daily report + mã lỗi)                        dailyReports.view
└── Đồng phục (Uniform orders + trạng thái)                         uniformOrders.view

DUYỆT ĐƠN  (Approvals Hub — các queue)
├── Nghỉ phép chờ leader duyệt                                       paidLeave.approve
├── Nghỉ phép chờ admin xác nhận                                     paidLeave.confirm
├── Tăng ca chờ admin duyệt                                          overtime.approve
├── Báo cáo an toàn (sự cố) chờ confirm                              safetyReports.confirm
├── Người phụ thuộc thuế chờ duyệt                                   taxDependents.confirm
└── Hỗ trợ người phụ thuộc chờ confirm                               dependentSupport.confirm

SỰ KIỆN & AN TOÀN
├── Sự kiện (Event list + detail)                                    events.view
├── Check-in sự kiện (participants)                                  events.checkin.view
├── Giám sát an toàn (Safety check monitoring)                       events.safety.view
└── Thông báo sự kiện (FCM)                                          events.view

CON NGƯỜI (People)
├── Nhân sự (Employee list/CRUD/detail)                              employees.view/employees.manage
├── Phòng ban (Department)                                           departments.view
├── Nghỉ phép (lịch sử toàn bộ)                                      paidLeave.view
└── Ngày nghỉ lễ (Day offs)                                          dayOffs.view

LƯƠNG
└── Bảng lương (Payroll theo tháng)                                  payroll.view/payroll.manage

GIAO TIẾP
├── Chat Center (realtime)                                           chat.view/chat.send/chat.manage
├── Thông báo (composer + unread inbox)                              notifications.view
└── Công bố (Information manager)                                    information.manage

HỆ THỐNG
├── Nhật ký hành động (Audit logs)                                   auditLogs.view
├── Danh mục (Food, Canteen)                                         food.view/canteen.view
├── FCM Token                                                        fcmTokens.view
├── Cài đặt (Dark mode / Font size)                                  settings.view
└── Options enums                                                    (nội bộ)
```

---

## 3. SIDEBAR (Leader / Supervisor / Manager)

Leader nhìn **team của mình** và **queue của mình**:

```
DASHBOARD
└── Tổng quan (team)                                                 dashboard.view

QUẢN LÝ TRỰC TIẾP
├── Chấm công team (position/day)                                    attendance.view
├── Nghỉ phép chờ tôi duyệt (inbox)                                  paidLeave.approve
├── Tạo tăng ca (OT cho thành viên) + xóa                            overtime.manage
├── Điều chỉnh tồn kho của phòng                                     inventory.update
└── Báo cáo an toàn phòng tôi (chưa confirm)                         safetyReports.confirm

SẢN XUẤT
├── Báo cáo ca (nhập + xem phòng)                                    dailyReports.view
└── Mã lỗi                                                           reportErrors.view

SỰ KIỆN & AN TOÀN
├── Sự kiện phòng                                                    events.view
└── Giám sát an toàn                                                 events.safety.view

GIAO TIẾP
├── Chat Center                                                      chat.view/chat.send
├── Công bố                                                          information.view
└── Thông báo                                                        notifications.view

HỆ THỐNG
└── Cài đặt                                                          settings.view
```

---

## 4. CHI TIẾT MÀN HÌNH (mỗi nghiệp vụ → workflow đủ)

### 4.1 Dashboard (⭐ refactor)
```text
┌─────────────────────────────────────────────┐
│ KPI: users theo position · checkin hôm qua · │
│ orders hôm nay · paid leave pending ·        │
│ uniforms pending · OT/Safety counts           │
├─────────────────────────────────────────────┤
│ Pending approvals (leave→leader→admin)       │
│ Bảng: chưa checkout (is_checked=false)       │
│ Bảng: đơn nghỉ chờ admin confirm             │
│ Bảng: đơn suất ăn chưa picked                │
└─────────────────────────────────────────────┘
```
API: `POST /dashboards/admin/summarys/s`, `POST /checkin/getcheckinindateofposition`, `POST /dashboards/admin/orders/get-orders`.

### 4.2 Attendance (⭐ refactor từ AdminModulePage)
```text
Chọn ngày → Chọn position (mặc định token)
Stat: Present · Day/Night split · Weekend · Over-time giờ tổng · Chưa checkout
Bảng: user · time_in · time_out · work_time · over_time · work_shift · is_weekend ✓
Click user → detail modal (getcheckindetailindateofuser)
```
API: `getcheckinindateofposition`, `getcheckindetailindateofuser`, `checkin/search`.

### 4.3 Approvals Hub (⭐ mới)
Trang tổng queue theo từng nghiệp vụ (sử dụng PageHeader + cards xếp tầng):

**4.3.1 Paid Leave — Leader inbox** (`get-paid-leave-request`)
Nút Approve / Reject + feedback → `approve-paid-leave-request`.

**4.3.2 Paid Leave — Admin confirm queue** (`POST /paidleave/search` với is_approve=true & is_confirm=false, hoặc dữ liệu từ summary)
Nút Confirm (transaction) → `paid-leave-confirm`. Hiện **paid_days trừ bao nhiêu**, cảnh báo nếu balance thấp.

**4.3.3 Overtime — Admin approve queue** (`POST /overtimerequest/getAll`)
Nút Approve → `update-approve-overtime-request`.

**4.3.4 Safety Report — leader queue** (`getbydepartmentid`)
Nút Confirm + corrective_action → `confirm`.

**4.3.5 Tax dependents — admin approve** (`getbyuserid` + `update-status`)
Nút Approve/Reject.

**4.3.6 Dependent support — admin confirm** (`getbytaxdependentidandyear` + `confirm`).

> ⭐ **Thiết kế chung cho bộ Approvals**: mỗi màn hình = Danh sách chờ + Badge trạng thái + action per-row + Toast/Confirm. Có thể gộp tất cả queue vào **một trang Approvals Hub** tổng thể với tabs, hoặc 6 trang riêng. → Khuyến nghị: **1 Hub với tabs** để tiết kiệm, nhưng mỗi tab là 1 module config riêng để tái sử dụng AdminModulePage.

### 4.4 Events (🔧 refactor)
```text
Event list (position-scoped): name · date_start/end · is_safety badge · is_active
+ Tạo event (có is_safety toggle) · Sửa · Xóa
+ Event detail: thông tin + media + các nút:
   → Participants (eventcheck list)
   → Safety monitoring (safetycheck list)
```
API: `getall`, `searchbyid`, `create-event`, `update`, `delete-event`.

### 4.5 Event Check-in / Participants (⭐ mới)
```text
Chọn event → danh sách thành viên + ai đã confirm (searcheventchecked per user)
Total · Đã confirm · Chưa confirm
```
⚠️ BE chỉ có `searcheventchecked` theo từng user — **không có endpoint liệt kê tất cả event_checks của event**. Cần lặp theo users_by_position hoặc bổ sung BE. Xem gaps.

### 4.6 Safety Monitoring (⭐ mới)
```text
Chọn event is_safety → getallusercheckedsafetycheckevent
KPI: Total · SAFE (is_safety) · UNKNOWN (chưa check) · At home · Can work tỉ lệ
Bảng: employee · avatar · department · is_safety · is_at_home · is_can_work · last update
```
API: `getallusercheckedsafetycheckevent`. Đây là màn hình **khẩn cấp** sau sự kiện an toàn.

### 4.7 Chat Center (⭐ mới)
```text
Conversation list (getgroupmemberofuser) ← peer + last messages
→ Thread (searchmessageofconversation) + socket joinConversation + send-message
→ Reply realtime (socket broadcast)
→ Attachments (message/create upload media)
Search: filter theo peer name (chưa có API search tin; xem gaps)
```
Permission: `chat.view` đọc, `chat.send` gửi, `chat.manage` xóa/unsend.

### 4.8 Notification Center (🔧)
Composer admin (`create-notification`): chọn user + title + message + type.
Inbox unread (`searchById`) + mark read (`update`).
⚠️ Không có list "đã đọc" và không có realtime badge — dùng polling 15–30s (đã có Redis cache).

### 4.9 Information Manager (🔧)
Danh sách bài của admin (`get-informations`) + create (multipart, is_public/is_video/is_event) + delete.
⚠️ ADMIN không vào được kênh đọc NV (`requireRoles(['STAFF','LEADER','MANAGER','SUPERVISOR'])`) → admin chỉ quản lý bài của mình.

### 4.10 Employees (🔧 để đồng bộ `adminRequest` + bỏ mock)
List theo position (`get-users`) + search/filter + create (`create-user`) + edit (`PUT /users`) + delete + detail drawer.
**Detail**: thông tin → tab: Chấm công user · Đơn nghỉ · Tăng ca · Lương · Balance paid_days.

### 4.11 Departments (🔧)
List + create + getbyid detail. **Không update/delete** (BE không có).

### 4.12 Payroll (🔧)
List theo user/tháng (`search`) + create/update/destroy (ADMIN/MANAGER) + detail monthly với đủ các cột công/trừ.

### 4.13 Production
- **Plan production** (🔧): week view theo dept (`searchbydateanddepartment`) + CRUD.
- **Daily report** (🔧): form nhập ca + list filter (`getall`/`search`) + mã lỗi (`findByDailyReportId`).
- **Inventory** (🔧): list theo dept/product + create/update + leader adjust (`update-inventory`).
- ⚠️ Daily report `getall` bug logic enum — dùng `search` thay thế. Xem gaps.

### 4.14 Orders (⭐ mới dùng config sẵn)
Per day + Day/Night + isPicked → đếm suất ăn cho canteen. Admin tạo hộ (`create-orders`).

### 4.15 Uniform Orders (🔧)
Queue theo position (`search/withposition`) + status manager (pending→processing→completed/cancelled) + delivery_date.

### 4.16 Audit Logs (🔧 config sẵn)
Filter theo resource_type/actor/from/to + pagination. Đọc JSONB old/new value.

### 4.17 Settings
Dark mode / font size (hiện có). 🔧 Bổ sung: **hồ sơ cá nhân self-edit** (PUT /users whitelist) nếu cần.

---

## 5. QUAN HỆ MÀN HÌNH ↔ ROUTE (mapping)

| Route | Màn hình | Phân loại |
|---|---|---|
| `/dashboard` | 4.1 Dashboard | refactor |
| `/attendance` | 4.2 | refactor |
| `/employees` | 4.10 | refactor |
| `/departments` | 4.11 | refactor |
| `/paidleave` | 4.3.1+4.3.2 | hub |
| `/overtime` | 4.3.3 | hub |
| `/safety-reports` | 4.3.4 | hub |
| `/tax-dependents` | 4.3.5 | hub |
| `/dependent-support` | 4.3.6 | hub |
| `/payroll` | 4.12 | refactor |
| `/plan-production` | 4.13 | refactor |
| `/daily-reports` | 4.13 | refactor |
| `/report-errors` | 4.13 | refactor |
| `/inventory` | 4.13 | refactor |
| `/events` | 4.4 | refactor |
| `/events/:id/participants` ⭐ | 4.5 | new |
| `/events/:id/safety` ⭐ | 4.6 | new |
| `/chat` | 4.7 | **new** |
| `/notifications` | 4.8 | refactor |
| `/information` | 4.9 | refactor |
| `/orders` | 4.14 | new (config sẵn) |
| `/uniform-orders` | 4.15 | refactor |
| `/audit-logs` | 4.16 | config sẵn |
| `/day-offs` | 4.3 phụ | config sẵn |
| `/food` `/canteen` `/fcm-tokens` | 4.17 | config sẵn |

---

## 6. THỨ TỰ ƯU TIÊN XÂY DỰNG

1. **Attendance real** (4.2) — màn hình đang fake, nghiệp vụ lõi.
2. **Approvals Hub** (4.3) — giá trị hàng ngày cao nhất.
3. **Chat Center** (4.7) — thiếu hoàn toàn, realtime sẵn.
4. **Safety Monitoring** (4.6) — an toàn người lao động, dữ liệu sẵn.
5. **Orders per day** (4.14) — canteen.
6. Event participants (4.5, phụ thuộc gap BE).
7. Refactor Dashboard (4.1) với real summary API.
8. Employees → `adminRequest` (4.10).