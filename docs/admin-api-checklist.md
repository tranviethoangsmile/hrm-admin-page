# Admin API Checklist (đồng bộ Swagger hrmMetal)

**Tài liệu gửi Backend (yêu cầu chức năng + API):** [BE_API_REQUIREMENTS.md](./BE_API_REQUIREMENTS.md)

Nguồn sự thật:

1. **Swagger live:** `http://localhost:4000/api-docs` → JSON: `http://localhost:4000/docs.json`
2. **Router:** `~/Desktop/hrmMetal/src/routers/v1/v1.ts`
3. **Tài liệu:** `~/Desktop/hrmMetal/docs/ADMIN_FRONTEND_SPEC.md`

Đồng bộ FE:

```bash
# hrmMetal phải đang chạy (port 4000)
npm run sync:api
```

Sinh file `src/api/generatedApiPaths.js` (128+ operations) và cập nhật `constants.js`.

## Quy ước FE

| Việc | Cách làm |
|------|----------|
| Base URL | `.env` → `VITE_API_URL` hoặc `VITE_API_BASE_URL` + … |
| Path module | `constants.js` (từ `API_PATH_ALIASES`) |
| Gọi API đầy đủ | `buildApiUrl(USER_URL, FIND_USER_BY_FIELD)` |
| Admin CRUD generic | `adminRequest({ path: \`${PAID_LEAVE}/search\`, data })` |
| Response | Luôn kiểm tra `success === false` (kể cả HTTP 200) |

## Sửa lỗi đã áp dụng (Swagger vs FE cũ)

- `FIND_ALL_USER_WITH_FIELD` sai (`/findallwithfield`) → đúng **`/users/finduserwithfield`**
- Module paths khớp `v1.ts` lowercase: `planproduction`, `safetyreport`, `overtimerequest`, …
- OT list: `POST /overtimerequest/getAll` (chữ `A` hoa)

## Trạng thái module

- [x] Auth, Users, Department, Checkin, Day offs, Paid leave, OT
- [x] Payroll, Plan production, Daily report, Inventory, Safety report
- [x] Events, Information, Notification, Order/Food/Canteen, Uniform
- [x] Tax dependent, Dependent support, FCM, Chat
- [ ] Conversation/Message — cần UI chat riêng
- [ ] `GET /admin/dashboard/summary` — BE chưa có; dashboard dùng aggregate fallback

## Khi backend đổi API

1. Cập nhật Swagger trên hrmMetal
2. `npm run sync:api`
3. Kiểm tra `moduleConfig.js` / trang custom nếu có path hard-code
