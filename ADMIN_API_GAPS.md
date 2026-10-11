# ADMIN API GAPS

> Phân loại mức sẵn sàng của nghiệp vụ so với API backend hiện tại.
> **Available** = làm được ngay. **Partial** = làm được nhưng thiếu dữ liệu/workflow. **Missing** = BE chưa có. **Bug** = endpoint tồn tại nhưng lỗi logic.
> Kèm gợi ý API mới bằng tiếng Anh (chuẩn Swagger) để đội backend implement.

---

## 1. BẢNG TỔNG

| Nghiệp vụ | Trạng thái | Ghi chú |
|---|---|---|
| Login web / session | Available | JWT 2h, không refresh |
| Employee list/create | Available | position-scoped; chặn tạo ADMIN |
| Employee delete | Available | chỉ ADMIN |
| Employee update | Partial | cá nhân chỉ sửa profile; admin sửa được nhưng FE chưa quản |
| Department CRUD | Partial | **thiếu update/delete** |
| Attendance theo ngày/position | Available | `getcheckinindateofposition` |
| Attendance chi tiết user | Available | `getcheckindetailindateofuser`, `search` |
| Attendance correction | Missing | không có API sửa time_in/time_out/go_out/go_in |
| Day off CRUD | Available | admin |
| Paid leave (tạo + leader duyệt) | Available | |
| Paid leave admin confirm | Available | transaction trừ paid_days |
| Paid leave lịch sử/page | Available | `search` |
| Overtime (leader tạo + admin duyệt) | Available | |
| Overtime employee confirm | **Bug** | guard `requireRoles(['ADMIN'])` mâu thuẫn workflow |
| Payroll | Available | ADMIN/MANAGER |
| Plan production | Available | |
| Daily report | **Bug** | `getall` validate enum ngược → dùng `search` |
| Inventory | Available | |
| Error code of report | Available | |
| Events CRUD | Available | admin |
| Event participants/check-in list | **Partial→Missing** | chỉ có `searcheventchecked` theo từng user, **không list toàn event** |
| Safety check monitoring | Available | `getallusercheckedsafetycheckevent` |
| Safety report (tạo + leader confirm) | Available | |
| Chat conversations + messages + socket | Available | không auth socket; **no unread count** |
| Chat search | Missing | không có API tìm tin nhắn/hội thoại |
| Notifications (unread + mark read + composer) | Available | |
| Notification full history | Missing | chỉ trả unread (`searchById`), không có "tất cả + đã đọc" |
| Information (admin publish) | Available | |
| Information read cho admin | **Partial** | admin bị exclude khỏi `getallinforbyfield`; xem bài của mình qua admin endpoint |
| Tax dependent approve | Available | |
| Dependent support confirm | Available | |
| Orders (meal) per day | Available | `get-orders` |
| Orders create hộ | Available | |
| Uniform order queue | **Partial** | useCase admin tồn tại nhưng **không mount route** |
| Uniform status manager | Partial | `update` không có admin guard (ai cũng sửa) |
| Audit logs | Available | ADMIN/MANAGER |
| Food/Canteen | Available | |
| FCM token list | Missing | chỉ có create |

---

## 2. CHI TIẾT TỪNG GAP

### 2.1 BLOCKED — Event participants list

**Trạng thái:** Partial → cần bổ sung
**Lý do:** Backend chỉ có `POST /eventcheck/searcheventchecked` trả 1 row theo `{event_id, user_id}`. Không có endpoint liệt kê toàn bộ event_checks của một event. Admin chỉ thấy được "ai ấn confirm" nếu duyệt từng user.

**UI cần:** Event Check-in page (participants + trạng thái).
**Gợi ý API:**
```
GET /eventcheck/getallbyevent?event_id=:id        → list {user_id,is_confirm,created_at}+User
POST /eventcheck/getallbyevent                    → body {event_id} (đồng bộ style cũ)
```
**Workaround hiện tại (trong lúc chờ):** lấy `users_by_position` từ summary + dùng `searcheventchecked` cho từng user (chậm, không nên làm nếu >50 user).

---

### 2.2 BLOCKED — Chat unread count & message search

**Trạng thái:** Missing
**Lý do:** Không có trường `is_readed` ở message, không có endpoint unread-count, không có search message. Mobile hiện tự suy ra unread từ `groupmember/getgroupmemberofuser` (messages array + delete_messages).

**UI cần:** Chat Center với badge unread + search hội thoại/tin nhắn.
**Gợi ý API:**
```
GET /conversations/:id/read-status                     → per-user read receipt
POST /conversations/:id/mark-read                      → {conversation_id, user_id}
POST /message/search                                   → {conversation_id?, keyword, page}
POST /conversations/search                             → {keyword}
```

---

### 2.3 PARTIAL — Notification full history

**Trạng thái:** Missing
**Lý do:** `POST /notification/searchById` (tên gây nhầm) chỉ trả **unread** (`is_readed=false`), cached. Không có list đã đọc, không có badge realtime theo socket (chỉ polling).

**Gợi ý API:**
```
POST /notification/getallofuser                        → {user_id, is_readed?, page}
POST /notification/count-unread                       → {user_id} → {count}
```

---

### 2.4 BLOCKED — Attendance correction

**Trạng thái:** Missing
**Lý do:** `checkins.go_out/go_in` (break in/out) tồn tại trong model nhưng **không route nào ghi**. Không có API sửa sai công, không có route admin xem/sửa checkin.

**UI cần:** Attendance Correction (leader/admin sửa work_time nếu NV quên check-out).
**Gợi ý API:**
```
PUT /checkin/:id          → {work_time?, time_in?, time_out?, over_time?, go_in?, go_out?}
POST /checkin/adjust      → {id, fields} (admin + audit)
```

---

### 2.5 BLOCKED — Uniform order admin page

**Trạng thái:** Partial
**Lý do:** `GET_ALL_UNIFORM_ORDERS_OF_POSITION_FOR_ADMIN_USE` tồn tại trong useCase (`/uniformorder` search với filter `order_status='pending'`) nhưng **không mount route nào trong adminRouter**. Summary `/summarys/s` trả count `uniforms_pending` nhưng không có trang xem.

**UI cần:** Uniform queue theo position + status manager.
**Gợi ý API:**
```
POST /dashboards/admin/uniformorders/get-uniform-orders   → {position} (reuse useCase có sẵn)
PUT /dashboards/admin/uniformorders/update-status         → {id, order_status, delivery_date}
```

---

### 2.6 Bug — Overtime employee confirm guard

**Trạng thái:** Bug
**Lý do:** `POST /overtimerequest/updateisconfirm` (NV xác nhận đơn) được bọc `requireRoles(['ADMIN'])` — mâu thuẫn trực tiếp workflow "leader tạo → **employee confirm** → admin approve". EMP (không phải admin) sẽ bị 403.

**Gợi ý sửa BE:** guard → `requireRoles(['MANAGER','LEADER','SUPERVISOR','STAFF'])` hoặc để `authJwt` + quyền sở hữu (user_id chính mình).

---

### 2.7 Bug — Daily report `getall` enum validation ngược

**Trạng thái:** Bug
**Lý do:** Trong `getall`, `if (isValidEnumValue(field.product, Products)) { return 400 'product not valid' }` — điều kiện bị đảo: **product hợp lệ** bị trả 400.
**Workaround FE:** dùng `POST /dailyreport/search` thay cho `getall` khi có filter product/spec.

---

### 2.8 Bug — Position enum `COMPORATION` key/value

**Trạng thái:** Bug BE
**Lý do:** `Position.enum.ts`: value `'COMPORATION'` (12 ký tự chứa 2 R). Code query dùng key `'COMPORATION'` (1 R) → không match trong query/FCM push cho nhà máy COMPORATION.
**Tác động FE:** Safety push, event filter theo CORPORATION sẽ trả sai dữ liệu.
**Gợi ý sửa:** thống nhất value.

---

### 2.9 Bug — `SUPER_ADMIN` bị chặn ở dashboard

**Trạng thái:** Bug BE
**Lý do:** login/web cho phép `SUPER_ADMIN` nhưng `requireRoles(['ADMIN'])` trên `/dashboards/admin/**` không chứa `SUPER_ADMIN`. SUPER_ADMIN đăng nhập được nhưng 403 mọi route admin.

---

### 2.10 Partial — Department update/delete

**Trạng thái:** Missing
**Lý do:** chỉ có create/getall/getbyid.
**Gợi ý API:** `PUT /department/:id`, `DELETE /department/:id` (+ audit).
**FE hiện tại:** đã giữ View + Create, bỏ Update/Delete (đúng với BE).

---

### 2.11 Partial — Safety report confirm không audit

**Trạng thái:** Partial
**Lý do:** các endpoint `/safetyreport/confirm`, `/safetyreport/delete`, `/safetyreport/update` không ghi audit log, và `leader_id` lấy từ body (không ép từ token — risk giả mạo). So với chuẩn audit của events/notifications/tax thì không nhất quán.

---

### 2.12 Partial — Information read scoping

**Trạng thái:** Partial
**Lý do:** router `/information/*` bọc `requireRoles(['STAFF','LEADER','MANAGER','SUPERVISOR'])` — **ADMIN không thể gọi kênh đọc NV**. Admin chỉ xem bài mình qua `get-informations`.
**Gợi ý BE:** đưa ADMIN vào allowRoles của `getallinforbyfield` (vẫn giữ admin-vision), hoặc FE dùng admin endpoint để đọc bài công bố của chính mình.

---

### 2.13 Partial — Socket không auth

**Trạng thái:** Partial (bảo mật)
**Lý do:** `src/socket/socketIO.ts` không xác thực token khi connect; bất kỳ client nào cũng join room conversation_id nếu biết id.
**Gợi ý:** auth socket handshake bằng JWT (middleware) + verify membership khi join room.

---

### 2.14 Partial — Dept trống không có list "enterprise-wide"

**Trạng thái:** Partial
**Lý do:** summary `users_by_position` dùng `position` of admin + exclude admins. Không có tổng quan toàn công ty (tất cả positions) cho SUPER_ADMIN/global admin — hợp lý vì mỗi admin quản 1 nhà máy. Nếu sau này cần global view → thêm endpoint không-scope.

---

## 3. DANH SÁCH ƯU TIÊN API MỚI CHO BACKEND

1. `GET/POST /eventcheck/getallbyevent` — bỏ chặn màn hình Event Check-in.
2. `POST /overtimerequest/...` guard fix (updateisconfirm).
3. `POST /dashboards/admin/uniformorders/get-uniform-orders` — dùng useCase có sẵn.
4. `POST /message/search` + `conversations/mark-read` — Chat Center.
5. `POST /notification/getallofuser` + count-unread — Notification center.
6. `PUT /checkin/:id` — attendance correction.
7. `PUT/DELETE /department/:id`.
8. Fix Position enum `COMPORATION`.
9. Socket auth.
10. `SUPER_ADMIN` guard (nếu muốn hỗ trợ).

> Quy tắc FE: **không mock data** cho các mục BLOCKED. Nếu BE chưa bổ sung, màn hình hiển thị trang "Chưa có API" kèm link gap hoặc ẩn khỏi nav theo permission đã map.