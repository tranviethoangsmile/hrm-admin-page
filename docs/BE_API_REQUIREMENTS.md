# Yêu cầu chức năng & API cho Backend (HRM Metal Admin)

**Dự án FE:** `hrm-admin-page`  
**Dự án BE:** `hrmMetal`  
**Base URL:** `/api/version/v1`  
**Swagger:** `GET http://localhost:4000/docs.json` · UI: `/api-docs`  
**Tài liệu BE chi tiết:** `hrmMetal/docs/ADMIN_FRONTEND_SPEC.md`, `hrmMetal/docs/BACKEND_ADMIN_REQUIREMENTS.md`

Tài liệu này giúp team Backend biết **Admin Page cần gì**, **API nào đã có**, **API nào cần bổ sung/chuẩn hóa** để FE không phải gọi nhiều request rời hoặc workaround.

---

## 1. Mục tiêu sản phẩm (Admin Page)

Trang quản trị web cho vai trò `ADMIN`, `MANAGER`, `SUPERVISOR`, `LEADER` (tùy module), hỗ trợ:

| Nhóm | Chức năng FE |
|------|----------------|
| **Tổng quan** | Dashboard thống kê, biểu đồ chấm công / sản xuất / phê duyệt |
| **Nhân sự** | Nhân viên, phòng ban, chấm công, ngày nghỉ công ty |
| **Phê duyệt** | Nghỉ phép, tăng ca, báo cáo an toàn, người phụ thuộc thuế, mức hỗ trợ |
| **Lương** | Bảng lương (tạo / sửa / tìm / xóa) |
| **Sản xuất** | Kế hoạch SX, báo cáo ngày, lỗi báo cáo, tồn kho |
| **Nội bộ** | Sự kiện, xác nhận sự kiện, safety check, tin nội bộ, thông báo |
| **Dịch vụ NV** | Đặt cơm, món ăn, canteen, đồng phục |
| **Hệ thống** | FCM token, chat AI, cài đặt |

**Chưa có trên BE (menu FE đang placeholder — cần BE mới hoặc gỡ menu):**

- Quản lý tài sản (`/assets`)
- Quản lý hợp đồng (`/contracts`)
- Quản lý mua hàng (`/purchases`)
- Yêu cầu công việc (`/task-request`)
- Gia công / sản xuất generic (`/machining`, `/manufacturing`)

---

## 2. Quy ước API bắt buộc (FE đang xử lý theo chuẩn này)

### 2.1 Response

**Thành công:**

```json
{
  "success": true,
  "data": {},
  "message": "optional"
}
```

**Lỗi nghiệp vụ (quan trọng):**

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "code": "OPTIONAL_ERROR_CODE",
  "details": {}
}
```

- FE **luôn** kiểm tra `success === false`, kể cả khi HTTP status là `200`.
- Khuyến nghị: lỗi validation → `400`; không có quyền → `403`; không tìm thấy → `404`.

### 2.2 Authentication

```http
Authorization: Bearer <JWT>
```

- Login: `POST /login` body `{ "user_name", "password" }` → `{ data: user, token }`.
- FE lưu `token`, `currentUser` (id, name, role, position, department_id, …).

**Vấn đề hiện tại:** nhiều route admin yêu cầu `user_id` trong **body** để check role (vd. `dayoffs/create`, `overtimerequest/getAll`).  
**Yêu cầu:** lấy user từ JWT; body chỉ chứa dữ liệu nghiệp vụ.

### 2.3 Phân trang (API list/search mới)

```json
{
  "page": 1,
  "limit": 20,
  "sort_by": "created_at",
  "sort_order": "desc",
  "filters": {}
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

### 2.4 Ngày giờ

- Gửi/nhận date: `yyyy-MM-dd` (ISO).
- Timezone tổng hợp dashboard: **`Asia/Tokyo` (+09:00)** (theo spec hiện tại).

---

## 3. Ma trận API: Đã có vs Cần bổ sung

Chú thích: ✅ FE đã dùng · ⚠️ Có nhưng cần chuẩn hóa · ❌ Chưa có / FE đang workaround

### 3.1 P0 — Ưu tiên cao (chặn trải nghiệm Admin)

| ID | Chức năng | Trạng thái | Ghi chú FE |
|----|-----------|------------|------------|
| **A1** | Dashboard tổng hợp | ❌ | FE gọi `GET /admin/dashboard/summary` — **404**, đang fallback 4–5 API riêng |
| **A2** | Biểu đồ dashboard | ❌ | Cần `POST /admin/dashboard/charts` (chấm công, SX, OT, nghỉ phép, an toàn) |
| **B1** | Options user (select) | ❌ | Form đang nhập tay `user_id` |
| **B2** | Options phòng ban | ⚠️ | Có `GET /department/getall` nhưng chưa format `{ id, name }` cho select |
| **B3** | Options enum hệ thống | ❌ | FE hard-code role/position/product trong `adminOptions.js` |
| **C*** | List/search có pagination | ⚠️ | Hầu hết API search trả full list, không `page/limit` |

#### A1 — `GET /admin/dashboard/summary`

**Quyền:** `ADMIN`, `MANAGER` (có thể filter theo `department_id` / `position` từ query).

**Query (optional):**

```txt
?department_id=uuid&position=HINO&date=2026-05-26
```

**Response `data` (FE đang map các field sau):**

```json
{
  "employee_total": 120,
  "employee_active": 110,
  "pending_paid_leave": 5,
  "pending_overtime_leader": 3,
  "pending_overtime_admin": 2,
  "pending_safety_report": 4,
  "today_orders": 80,
  "today_production": 12,
  "today_checkins": 95,
  "today_present": 90,
  "today_on_leave": 8,
  "today_absent": 10,
  "attendance_rate": 94.5
}
```

**Acceptance:**

- Một request, &lt; 1s với dữ liệu production thông thường.
- Có trong Swagger.

---

#### A2 — `POST /admin/dashboard/charts`

**Body:**

```json
{
  "start_date": "2026-05-01",
  "end_date": "2026-05-31",
  "department_id": "uuid",
  "position": "HINO"
}
```

**Response `data` gợi ý:**

```json
{
  "attendance_by_day": [
    { "date": "2026-05-26", "present": 90, "leave": 5, "absent": 10, "late": 3 }
  ],
  "production_by_day": [
    { "date": "2026-05-26", "quantity": 1000, "good": 950, "defective": 50 }
  ],
  "shift_distribution": [
    { "label": "DAY", "count": 8 },
    { "label": "NIGHT", "count": 4 }
  ],
  "pending_by_type": {
    "paid_leave": 5,
    "overtime": 5,
    "safety_report": 4
  }
}
```

---

#### B1 — `GET /admin/options/users`

**Query:** `keyword`, `department_id`, `position`, `role`, `is_active`, `limit` (default 50).

**Item:**

```json
{
  "id": "uuid",
  "employee_id": 1001,
  "name": "Nguyen Van A",
  "user_name": "nva",
  "department_id": "uuid",
  "department_name": "Production",
  "position": "HINO",
  "role": "STAFF"
}
```

---

#### B3 — `GET /admin/options/enums`

Trả về toàn bộ enum dùng trong form (roles, positions, products, work_shifts, shifts, notification_types, uniform_types, uniform_sizes, tax_dependent_statuses, …) — **lấy từ enum backend**, không hard-code.

---

### 3.2 API đã có — FE Admin đang gọi (giữ ổn định, cập nhật Swagger)

Prefix: `/api/version/v1`. Path module **chữ thường** theo `v1.ts`.

| Module | Method | Path | Màn FE |
|--------|--------|------|--------|
| Auth | POST | `/login` | Login |
| Users | GET | `/users` | Nhân viên |
| Users | POST | `/users` | Tạo NV |
| Users | PUT | `/users` | Sửa NV |
| Users | DELETE | `/users/:id` | Xóa NV |
| Users | POST | `/users/finduserwithfield` | Lọc NV (position, …) |
| Users | POST | `/users/getuserwithdepartmentid` | Lọc theo phòng ban |
| Users | POST | `/users/upload-avatar` | Upload avatar (multipart) |
| Department | GET | `/department/getall` | Phòng ban |
| Department | POST | `/department/create` | Tạo phòng ban |
| Department | POST | `/department/getbyid` | Chi tiết |
| Checkin | POST | `/checkin/getcheckinindateofposition` | Dashboard, Attendance |
| Checkin | POST | `/checkin/search` | Chi tiết chấm công user |
| Day offs | GET | `/dayoffs/getall` | Ngày nghỉ công ty |
| Day offs | POST | `/dayoffs/create` | Tạo (cần admin trong body — nên đổi JWT) |
| Day offs | PUT | `/dayoffs/update` | Sửa |
| Day offs | POST | `/dayoffs/deletebyid` | Xóa |
| Paid leave | GET | `/paidleave` | Danh sách |
| Paid leave | POST | `/paidleave/search` | Lọc / dashboard fallback |
| Paid leave | POST | `/paidleave/create` | Tạo đơn |
| Paid leave | POST | `/paidleave/update` | Leader confirm |
| Paid leave | POST | `/paidleave/updateconfirm` | Approve |
| Paid leave | POST | `/paidleave/delete` | Xóa |
| Overtime | POST | `/overtimerequest/getAll` | Admin duyệt OT (**chữ A hoa**) |
| Overtime | POST | `/overtimerequest/getbyuserid` | OT của tôi |
| Overtime | POST | `/overtimerequest/create` | Tạo OT |
| Overtime | POST | `/overtimerequest/updateisconfirm` | Leader confirm |
| Overtime | POST | `/overtimerequest/updateisapproved` | Admin approve |
| Overtime | POST | `/overtimerequest/deletebyid` | Xóa |
| Payroll | POST | `/payroll/search` | Bảng lương |
| Payroll | POST | `/payroll/create` | Tạo |
| Payroll | POST | `/payroll/update` | Sửa |
| Payroll | POST | `/payroll/destroy` | Xóa |
| Plan production | POST | `/planproduction/searchbydateanddepartment` | Kế hoạch SX |
| Plan production | POST | `/planproduction/create` | Tạo |
| Plan production | PUT | `/planproduction/update` | Sửa |
| Plan production | POST | `/planproduction/destroy` | Xóa |
| Daily report | POST | `/dailyreport/getall` | Báo cáo ngày |
| Daily report | POST | `/dailyreport/search` | Tìm |
| Daily report | POST | `/dailyreport/create` | Tạo (+ errors[]) |
| Error report | POST | `/error-of-report/findByDailyReportId` | Lỗi báo cáo |
| Inventory | POST | `/inventory/getall` | Tồn kho |
| Inventory | POST | `/inventory/search` | Tìm |
| Inventory | POST | `/inventory/create` | Tạo |
| Inventory | POST | `/inventory/update` | Sửa (theo product+department) |
| Safety report | POST | `/safetyreport/getbydepartmentid` | Báo cáo AT |
| Safety report | POST | `/safetyreport/create` | Tạo (multipart) |
| Safety report | POST | `/safetyreport/update` | Sửa |
| Safety report | POST | `/safetyreport/confirm` | Xác nhận |
| Safety report | POST | `/safetyreport/delete` | Xóa |
| Events | GET | `/events/getall` | Sự kiện |
| Events | POST | `/events/getwithposition` | Lọc position |
| Events | POST | `/events/create` | Tạo |
| Events | POST | `/events/update` | Sửa |
| Events | POST | `/events/delete` | Xóa |
| Event check | POST | `/eventcheck/searcheventchecked` | Xác nhận SK |
| Event check | POST | `/eventcheck/create` | Tạo |
| Safety check | POST | `/safetycheck/getallusercheckedsafetycheckevent` | Safety check |
| Safety check | POST | `/safetycheck/create` | Tạo |
| Information | POST | `/information/getallinforbyfield` | Tin nội bộ |
| Information | POST | `/information/create` | Tạo |
| Information | POST | `/information/getinforbyid` | Chi tiết |
| Information | POST | `/information/deleteinformationbyid` | Xóa |
| Notification | POST | `/notification/search` | Thông báo |
| Notification | POST | `/notification/create` | Tạo |
| Notification | PUT | `/notification/update` | Đánh dấu đọc |
| Notification | POST | `/notification/destroy` | Xóa |
| Order | GET | `/order` | Đơn cơm |
| Order | POST | `/order/searchorderwithfield` | Lọc theo ngày/position |
| Food | GET/POST | `/food` | Món ăn |
| Canteen | GET/POST | `/canteen` | Canteen |
| Uniform | POST | `/uniformorder/search` | Đồng phục |
| Uniform | POST | `/uniformorder/create` | Tạo |
| Uniform | POST | `/uniformorder/update` | Sửa |
| Uniform | POST | `/uniformorder/delete` | Xóa |
| Uniform | POST | `/uniformorder/getuniformorderdetail` | Chi tiết items |
| Tax dependent | POST | `/taxdependent/getbyuserid` | Người phụ thuộc |
| Tax dependent | PUT | `/taxdependent/update` | Sửa |
| Tax dependent | PUT | `/taxdependent/update-status` | Duyệt trạng thái |
| Tax dependent | POST | `/taxdependent/delete` | Xóa |
| Dependent support | POST | `/dependent-support-amount/getbytaxdependentidandyear` | Mức hỗ trợ |
| Dependent support | POST | `/dependent-support-amount/update` | Sửa |
| Dependent support | POST | `/dependent-support-amount/confirm` | Confirm |
| Dependent support | POST | `/dependent-support-amount/delete` | Xóa |
| FCM | POST | `/fcmtoken/create` | Tạo token |
| Chat | POST | `/chat` | Chat AI |

**Lưu ý path Swagger vs router:** Swagger có một số path camelCase (`planProduction`, `safetyReport`) nhưng router thực tế dùng **lowercase** (`planproduction`, `safetyreport`). FE gọi theo router — **BE nên sửa Swagger cho khớp**.

---

### 3.3 P1 — Nên có để Admin vận hành tốt

| ID | Chức năng | API đề xuất |
|----|-----------|-------------|
| **D1** | Duyệt nghỉ phép thống nhất | `POST /admin/paid-leaves/:id/decision` body `{ action: CONFIRM\|APPROVE\|REJECT, feedback, is_paid }` |
| **D2** | Duyệt OT thống nhất | `POST /admin/overtime-requests/:id/decision` body `{ action: CONFIRM\|APPROVE\|REJECT }` |
| **D3** | Duyệt safety report | `POST /admin/safety-reports/:id/decision` |
| **E1** | Export CSV/Excel | `POST /admin/export/{module}` (attendance, payroll, daily-report, paid-leave, overtime) |
| **F1** | FCM list tokens | `GET /admin/fcm-tokens?user_id=` (hiện chỉ có create) |
| **G1** | Conversation admin | List conversations, messages (chat nội bộ) |
| **H1** | Module Assets | CRUD `/assets` hoặc xác nhận không làm |
| **H2** | Module Contracts | CRUD `/contracts` |
| **H3** | Module Purchases | CRUD `/purchases` |

---

### 3.4 P2 — Nâng cao

- Realtime notification admin (Socket.IO).
- Import Excel user / payroll / plan production.
- Audit log: ai approve/delete/update lương.
- Soft-delete + restore master data.

---

## 4. Workflow phê duyệt — Trạng thái FE cần

### 4.1 Nghỉ phép (`paidleave`)

FE hiển thị tab/trạng thái từ các field:

| Field | Ý nghĩa |
|-------|---------|
| `is_confirm` | Leader đã xác nhận |
| `is_approve` | Admin đã duyệt |
| `is_paid` | Có lương hay không |

**Status computed (đề xuất BE trả sẵn):**

```txt
PENDING_LEADER   → !is_confirm
PENDING_ADMIN    → is_confirm && !is_approve
APPROVED         → is_approve
REJECTED         → (cần field reject hoặc quy ước rõ)
```

### 4.2 Tăng ca (`overtimerequest`)

| Field | Ý nghĩa |
|-------|---------|
| `is_confirm` | Leader |
| `is_approved` | Admin |

### 4.3 Báo cáo an toàn (`safetyreport`)

| Field | Ý nghĩa |
|-------|---------|
| `is_confirm` | Leader đã xác nhận + `corrective_action` |

---

## 5. Payload quan trọng theo module

### 5.1 Tạo user (`POST /users`)

```json
{
  "name": "Nguyen Van A",
  "user_name": "nva",
  "email": "a@example.com",
  "password": "123456",
  "dob": "1990-01-01",
  "phone": "0900000000",
  "employee_id": 1001,
  "department_id": "uuid",
  "role": "STAFF",
  "position": "HINO",
  "is_active": true,
  "is_admin": false,
  "is_officer": false,
  "is_offical_staff": true,
  "salary_hourly": 1200,
  "shift_night_pay": 300,
  "travel_allowance_pay": 5000,
  "paid_days": 12,
  "begin_date": "2024-01-01"
}
```

**Không trả `password` trong GET/list.**

### 5.2 Chấm công theo ngày (`POST /checkin/getcheckinindateofposition`)

```json
{
  "date": "2026-05-26",
  "position": "HINO"
}
```

### 5.3 Tạo daily report (`POST /dailyreport/create`)

```json
{
  "product": "D59P",
  "user_id": "uuid",
  "department_id": "uuid",
  "date": "2026-05-26",
  "shift": "A",
  "quantity": 100,
  "good_quantity": 95,
  "defective_quantity": 5,
  "cycle_time": 1.2,
  "operated_time": 7,
  "shutdown_time": 1,
  "operator_history": "note",
  "errors": [
    {
      "code": "01",
      "description": "Machine stopped",
      "shutdown_time": 30,
      "error_date": "2026-05-26"
    }
  ]
}
```

**Rule:** `errors[].error_date` phải cùng ngày với `date`.

### 5.4 Safety report create (`POST /safetyreport/create`)

`multipart/form-data`: `user_id`, `department_id`, `title`, `content`, `solution`, `date`, `file?` → `media_path`.

---

## 6. Phân quyền (Role)

```txt
STAFF, LEADER, SUPERVISOR, MANAGER, ADMIN
```

| Role | Admin Page |
|------|------------|
| ADMIN | Toàn quyền |
| MANAGER / SUPERVISOR / LEADER | Xem + duyệt theo phòng ban/position (chi tiết từng module do BE define) |
| STAFF | Không vào Admin (FE redirect Unauthorized) |

**Position (ví dụ):** `HINO`, `IZUMO`, `KYOTO`, `OSAKA`, `TOKYO`, `COMPORATION` — filter nhiều API theo `position`.

---

## 7. Checklist cho BE trước mỗi release

- [ ] Cập nhật Swagger (`/docs.json`) — path khớp `v1.ts` (lowercase).
- [ ] API mới có `success` / `message` đúng quy ước §2.
- [ ] Không yêu cầu `user_id` admin trong body nếu đã có JWT.
- [ ] Test với Postman collection hoặc example trong Swagger.
- [ ] Thông báo FE chạy `npm run sync:api` trong repo `hrm-admin-page`.

---

## 8. Liên hệ đồng bộ FE ↔ BE

| Việc | Ai |
|------|-----|
| Đổi/ thêm endpoint | BE cập nhật Swagger → báo FE |
| FE cập nhật path constants | `npm run sync:api` (cần BE chạy port 4000) |
| Spec chi tiết từng field DB | `hrmMetal/docs/ADMIN_FRONTEND_SPEC.md` |
| Backlog đầy đủ epic | `hrmMetal/docs/BACKEND_ADMIN_REQUIREMENTS.md` |

---

## 9. Tóm tắt ưu tiên làm trước

1. **`GET /admin/dashboard/summary`** + **`POST /admin/dashboard/charts`**
2. **`GET /admin/options/users`**, **`GET /admin/options/enums`**
3. Chuẩn hóa **pagination** cho search admin
4. **JWT role guard** thay `user_id` trong body
5. Sửa **Swagger** path cho khớp router thực tế
6. Quyết định module **Assets / Contracts / Purchases** — làm API hay gỡ khỏi FE

---

*Tài liệu tạo cho dự án hrm-admin-page · Đối chiếu Swagger hrmMetal (128 operations) · Cập nhật khi có thay đổi scope.*
