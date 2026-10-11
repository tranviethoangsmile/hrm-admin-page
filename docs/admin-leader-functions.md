# Chức năng ADMIN và LEADER — theo Swagger hrmMetal (BE)

**Nguồn dữ liệu:**
- Swagger: `GET http://localhost:4000/docs.json` (bản local: `swagger-output.json`, 133 endpoints)
- Router BE: `~/Desktop/hrmMetal/src/routers/v1/v1.ts` + các module router (guard bằng `requireRoles`)
- Access control thật do **backend enforce** (`authJwt` + `requireRoles`); FE chỉ ẩn/hiện UI theo `src/permissions/permissions.js`.

**Base URL:** `/api/version/v1`

---

## 1. Mô hình vai trò & cách BE bảo vệ endpoint

| Vai trò | Nhóm BE enforce | Mô tả |
|---------|-----------------|--------|
| `ADMIN` | `requireRoles(['ADMIN'])` | Quản trị toàn diện, có module `/dashboards/admin/*` riêng |
| `MANAGER` | chung với admin (một số endpoint) + toàn bộ leader | Leader endpoint + lương/audit/người dùng |
| `SUPERVISOR` | toàn bộ leader + write sản xuất | Leader endpoint |
| `LEADER` | `requireRoles(['LEADER','SUPERVISOR','MANAGER'])` | `/dashboards/leader/*` + module vận hành |
| `STAFF` | bị loại khỏi 2 nhóm trên | Chỉ make-request, không access admin |

Quy tắc cốt lõi trên BE:
- `adminRouter.use(requireRoles(['ADMIN']))` → **ADMIN mới gọi được** `/dashboards/admin/*`.
- `leaderRouter.use(requireRoles(['LEADER','SUPERVISOR','MANAGER']))` → **ADMIN KHÔNG gọi được** `/dashboards/leader/*`.
- `/dashboards/logs/search` → `requireRoles(['ADMIN','MANAGER'])`.
- Các module generic (checkin, paidleave, overtime, …) chỉ cần đăng nhập (`authJwt`), trừ endpoint được guard riêng.

---

## 2. Chức năng ADMIN (chỉ vai trò ADMIN)

### 2.1 Dashboard tổng quan (`/dashboards/admin/*`)
| Endpoint | Nghiệp vụ |
|----------|-----------|
| POST `/dashboards/admin/summarys/s` | Thống kê tổng quan admin (nhân sự, nghỉ phép chờ duyệt…) |
| POST `/dashboards/admin/checkins/get-checkins` | Lấy chấm công theo vị trí admin + ngày |
| POST `/dashboards/admin/options/get-enums` | Lấy danh sách enum (vị trí, ca, sản phẩm…) |

### 2.2 Quản lý nhân sự
| Endpoint | Nghiệp vụ |
|----------|-----------|
| POST `/dashboards/admin/users/create-user` | Tạo user |
| POST `/dashboards/admin/users/get-users` | Lấy danh sách user theo vị trí |
| DELETE `/users/{id}` | Xóa user (`requireRoles(['ADMIN'])`) |
| GET `/users` | Danh sách user (`['ADMIN','MANAGER']`) |
| PUT `/users` · GET `/users/{id}` · `/users/finduserwithfield` · `/users/findbyname` · `/users/getalluserforotrequestfeature` · `/users/getuserwithdepartmentid` · `/users/upload-avatar` | CRUD/tìm kiếm/avatar (auth) |
| POST `/dashboards/admin/departments/create-department` · `/department/create` | Tạo phòng ban |
| GET `/department/getall` · POST `/department/getbyid` | Danh sách/tìm phòng ban |
| POST `/dayoffs/create` · PUT `/dayoffs/update` · POST `/dayoffs/deletebyid` | Quản lý ngày nghỉ công ty (`['ADMIN']`) |
| GET `/dayoffs/getall` · POST `/dayoffs/getbyid` | Xem ngày nghỉ (auth) |

### 2.3 Phê duyệt nghỉ phép & tăng ca
| Endpoint | Nghiệp vụ |
|----------|-----------|
| POST `/dashboards/admin/paidleaves/paid-leave-confirm` | Xác nhận nghỉ phép đã duyệt |
| PUT `/paidleave` | Duyệt nghỉ phép (`['ADMIN','MANAGER','LEADER','SUPERVISOR']`) |
| POST `/paidleave/create` · `/paidleave/search` · POST `/paidleave/delete` | Tạo/tìm/xóa nghỉ phép (auth) |
| POST `/overtimerequest/getAll` | Danh sách toàn bộ tăng ca (`['ADMIN']`) |
| POST `/overtimerequest/updateisapproved` | **Duyệt tăng ca (by admin)** |
| POST `/overtimerequest/create` · `/getbyid` · `/getbyuserid` · `/updateisconfirm` | Quản lý tăng ca (auth) |

### 2.4 Sự kiện, thông tin & thông báo
| Endpoint | Nghiệp vụ |
|----------|-----------|
| POST `/dashboards/admin/events/create-event` · POST `/dashboards/admin/events/delete-event` | Tạo/xóa sự kiện |
| POST `/events/update` · POST `/events/delete` | Cập nhật/xóa sự kiện (`['ADMIN']`) |
| GET `/events/getall` · POST `/events/getwithposition` · `/events/searchbyid` | Xem sự kiện (auth) |
| POST `/dashboards/admin/informations/create-information` · `/delete-informations` | Tạo/xóa tin nội bộ |
| GET `/dashboards/admin/informations/get-informations` | Lấy tin nội bộ |
| POST `/dashboards/admin/notifications/create-notification` | Tạo thông báo |
| POST `/notification/search` · `/searchById` · PUT `/notification/update` · `/destroy` | Quản lý thông báo (auth) |

### 2.5 Đơn hàng / Dịch vụ
| Endpoint | Nghiệp vụ |
|----------|-----------|
| POST `/dashboards/admin/orders/create-orders` | Tạo đơn |
| POST `/dashboards/admin/orders/get-orders` | Lấy đơn theo vị trí + ngày |

### 2.6 Thuế & hỗ trợ phụ thuộc (admin-only)
| Endpoint | Nghiệp vụ |
|----------|-----------|
| PUT `/dashboards/admin/tax-dependents/update-status-tax-dependent` | Cập nhật trạng thái người phụ thuộc |
| PUT `/taxdependent/update-status` | Đổi trạng thái người phụ thuộc (`['ADMIN']`) |
| POST `/dependent-support-amount/confirm` | Xác nhận mức hỗ trợ (`['ADMIN']`) |
| POST `/taxdependent/create` · `/getbyuserid` · PUT `/taxdependent/update` · `/delete` | CRUD người phụ thuộc (auth) |
| POST `/dependent-support-amount/create` · `/update` · `/delete` · `/getbyid` · `/getbytaxdependentidandyear` | CRUD mức hỗ trợ (auth) |

### 2.7 Lương & Audit log (ADMIN + MANAGER)
| Endpoint | Nghiệp vụ |
|----------|-----------|
| POST `/payroll/create` · POST `/payroll/update` · POST `/payroll/destroy` | Quản lý bảng lương (`['ADMIN','MANAGER']`) |
| POST `/payroll/search` · `/searchbyid` | Tra cứu lương (auth) |
| POST `/dashboards/logs/search` | Tra cứu audit log (`['ADMIN','MANAGER']`) |

> Lưu ý: dù `ADMIN` là cấp cao nhất, ENDPOINT `/dashboards/leader/*`, `/checkin/create`, `/order/*`, `/information/*` **theo guard BE KHÔNG dành cho ADMIN** — admin dùng bản admin riêng (`/dashboards/admin/…`, `/order` CRUD riêng).

---

## 3. Chức năng LEADER (LEADER / SUPERVISOR / MANAGER)

### 3.1 Nghỉ phép — duyệt tại dashboard (`/dashboards/leader/*`)
| Endpoint | Nghiệp vụ |
|----------|-----------|
| GET `/dashboards/leader/paidleaves/get-paid-leave-request` | Lấy danh sách đơn nghỉ phép của leader |
| POST `/dashboards/leader/paidleaves/approve-paid-leave-request` | Duyệt / từ chối nghỉ phép |
| PUT `/paidleave` | (additionally) Duyệt/thay đổi trạng thái nghỉ phép |

### 3.2 Tồn kho (`/dashboards/leader/*`)
| Endpoint | Nghiệp vụ |
|----------|-----------|
| POST `/dashboards/leader/inventorys/update-inventory` | Cập nhật tồn kho |

### 3.3 Tăng ca (`/dashboards/leader/*`)
| Endpoint | Nghiệp vụ |
|----------|-----------|
| POST `/dashboards/leader/overtime-requests/create` | Leader tạo yêu cầu tăng ca |
| POST `/dashboards/leader/overtime-requests/destroy` | Leader xóa yêu cầu tăng ca |
| POST `/overtimerequest/updateisconfirm` | Leader xác nhận tăng ca |
| POST `/overtimerequest/create` · `/getbyid` · `/getbyuserid` | Quản lý tăng ca của ca trực |

### 3.4 Module vận hành dùng chung (auth — leader được cấp)
| Endpoint | Nghiệp vụ |
|----------|-----------|
| POST `/checkin/create` | Tạo/ghi nhận check-in (`['MANAGER','LEADER','SUPERVISOR','STAFF']` — **không phải ADMIN**) |
| POST `/checkin/getcheckinindateofposition` · `/getcheckindetailindateofuser` · `/search` | Xem chấm công |
| POST/GET `/order` · POST `/order/searchorderwithfield` · POST/PUT `/order/user` · DELETE `/order/{id}` | Quản lý đơn vận hành (`['LEADER','STAFF','MANAGER','SUPERVISOR']`) |
| POST `/information/getallinforbyfield` · `/getinforbyid` · `/getinforofuser` | Tin nội bộ (`['STAFF','LEADER','MANAGER','SUPERVISOR']`) |
| POST `/safetyreport/confirm` · `/create` · `/update` · `/delete` · `/getbydepartmentid` · `/getbyuserid` | Báo cáo an toàn |
| POST `/planproduction/create` · `/update` · `/destroy` · `/searchbydateanddepartment` · `/searchbyid` | Kế hoạch sản xuất |
| POST `/dailyreport/create` · `/getall` · `/search` · GET `/dailyreport/{id}` · `/dailyreport` | Báo cáo ngày |
| POST `/error-of-report/findByDailyReportId` | Lỗi báo cáo |
| POST `/inventory/create` · `/getall` · `/search` · `/update` | Tồn kho |
| POST `/uniformorder/create` · `/update` · `/delete` · `/search/withposition` · `/search/withuserid` · `/getuniformorderdetail` | Đơn đồng phục |
| POST `/eventcheck/create` · `/searcheventchecked` · POST `/safetycheck/create` · `/searchsafetychecked` · `/getallusercheckedsafetycheckevent` | Xác nhận sự kiện / safety check |
| POST `/notification/…` · POST `/conversations/…` · POST `/message/…` · POST `/groupmember/…` · POST `/chat` · POST `/fcmtoken/create` · GET `/media/uploads/{filename}` | Nội bộ & chat |
| POST `/food` · GET `/food` · GET `/food/{id}` · POST/GET `/canteen` · GET `/canteen/{id}` · POST `/find` · GET `/find/{name}` | Xem danh mục, tìm kiếm |

---

## 4. Bảng tóm tắt role → nhóm chức năng

| Nhóm chức năng | ADMIN | MANAGER | SUPERVISOR | LEADER |
|----------------|:-----:|:-------:|:----------:|:------:|
| Dashboard admin tổng quan (`/dashboards/admin/*`) | ✅ | — | — | — |
| Dashboard leader (duyệt nghỉ phép, kho, tăng ca) | — | ✅ | ✅ | ✅ |
| Audit log (`/dashboards/logs/search`) | ✅ | ✅ | — | — |
| Bảng lương (create/update/destroy) | ✅ | ✅ | — | — |
| Users (GET) | ✅ | ✅ | — | — |
| Users (DELETE), day-offs CRUD, events update/delete, OT getAll/approve, tax status, hỗ trợ confirm | ✅ | — | — | — |
| Check-in tạo mới · Đơn (`/order`) · Tin nội bộ (`/information`) | — | ✅ | ✅ | ✅ |
| Nghỉ phép duyệt (`PUT /paidleave`) | ✅ | ✅ | ✅ | ✅ |
| Quản lý kế hoạch SX / báo cáo / tồn kho / safety report | ✅ | ✅ | ✅ | ✅ |

---

## 5. Ghi chú

1. File này phân loại theo **guard thực tế trong router BE** (`requireRoles`), không phải theo menu/label UI.
2. Khác biệt quan trọng: **ADMIN không dùng** module `/dashboards/leader/*`, `/checkin/create`, `/order/*`, `/information/*` — ngược lại **LEADER/MANAGER/SUPERVISOR không dùng** `/dashboards/admin/*`.
3. Còn một số endpoint "chung" cho mọi user đã đăng nhập (`authJwt` không guard role) — xem phần chung trong mục 3.4.
4. Khi BE đổi API: chạy `npm run sync:api` để cập nhật `src/api/generatedApiPaths.js`.