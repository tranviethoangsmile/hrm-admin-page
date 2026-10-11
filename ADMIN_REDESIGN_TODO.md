# Admin Redesign TODO

Trạng thái theo từng phase. Tick `[x]` khi hoàn thành.

## Phase 1 — Discovery
- [x] Analyze existing APIs (139 operations — `generatedApiPaths.js`)
- [x] Analyze authentication (`/login/web`, sessionStorage JWT)
- [x] Analyze roles (`ADMIN/MANAGER/SUPERVISOR/LEADER/STAFF`)
- [x] Analyze permissions (chưa có RBAC — cần xây)
- [x] Analyze existing UI (layout, dashboard, modules, placeholders)
- [x] Write `ADMIN_REDESIGN_ANALYSIS.md`
- [x] DT3 — API business analysis (`ADMIN_API_BUSINESS_ANALYSIS.md`)
- [x] DT4 — Information Architecture (`ADMIN_INFORMATION_ARCHITECTURE.md`)
- [x] DT5 — API gaps & new-API proposals (`ADMIN_API_GAPS.md`)

## Phase 2 — Architecture
- [x] Implement permission system (`src/permissions/`)
- [x] Implement `can()` / `usePermissions` hook
- [x] Add `PermissionGuard` / `ProtectedRoute`
- [x] Guard admin routes by permission
- [x] Role-based navigation filtered by permission
- [x] Apply `PermissionGuard` to key pages (departments)
- [x] Apply `PermissionGuard` to employees / information / events pages
- [x] Remove fake stats (EmployeeManagement) & dead Export button

## Phase 3 — Design System
- [x] Shared `PageHeader` component
- [x] Shared empty/loading/error states (`StateView`)
- [x] Shared confirm dialog (SweetAlert2 `ConfirmDialog`)
- [ ] Table primitives (search/filter/pagination wrappers)
- [ ] Toast/notification improvements

## Phase 4 — Admin Layout
- [x] Sidebar dark + brand (đã xong từ trước)
- [x] Header with position + date + language
- [x] Wire header dropdown actions (profile/settings/logout)
- [ ] Responsive drawer/sidebar check

## Phase 5 — Dashboard
- [x] Admin dashboard filtering by role
- [x] Leader view (team attendance, pending requests)
- [ ] Remove hard-coded Vietnamese strings → i18n
- [ ] Loading/error/empty states on all panels

## Phase 6 — Modules
- [ ] Employees — migrate to `adminRequest`, i18n, remove fake stats
- [x] Departments — connect view action via `getbyid`, remove dead update/delete (no BE API)
- [x] Employees — remove fake stats, gate create/edit/delete behind permissions
- [x] Information — PageHeader + gate create behind `information.create`
- [x] Events — PageHeader + gate create/update/delete behind permissions
- [ ] Attendance — tách khỏi `AdminModulePage` dùng `getcheckinindateofposition` thật, day/night split, weekend, chi tiết user (`getcheckindetailindateofuser`)
- [ ] Attendance correction — sau khi BE bổ sung `PUT /checkin/:id` (gap 2.4)
- [ ] Orders — verify config (`get-orders` theo Day/Night + isPicked)
- [ ] Inventory — remove placeholder, use AdminModulePage (config sẵn)
- [ ] Reports — remove placeholder, use AdminModulePage
- [ ] Payroll — remove placeholder, use AdminModulePage
- [ ] Overtime — remove placeholder, use AdminModulePage
- [ ] Leave — remove placeholder
- [ ] Settings — build real page
- [ ] Day offs / Paid leave / Safety / Tax / Uniform / Food / Canteen / FCM — verify config
- [ ] Approved modules — verify config

### Phase 6b — Approvals Hub (ưu tiên cao nhất)
- [x] 1 Hub tổng với tabs: PaidLeave leader-inbox / Admin-confirm, Overtime, SafetyReport, TaxDependent, DependentSupport (route `/approvals`, nav + i18n)
- [ ] Paid leave admin confirm → gọi `paid-leave-confirm`, hiện số `paid_days` bị trừ, cảnh báo balance thấp
- [ ] Badge đếm queue trên nav items (data từ dashboard summary)

### Phase 6c — Chat Center (mới hoàn toàn)
- [x] Conversation list (`getgroupmemberofuser`) + peer info
- [x] Thread + socket `joinConversation`/`send-message`/event realtime
- [x] Attachments qua `message/create` (upload media)
- [x] Unsend/delete per user (`un_send_message`/`delete_message`)
- [x] Rút gọn: `chat.view` đọc / `chat.send` gửi / `chat.manage` xóa
- [x] AES encryption/decryption chia sẻ key = conversation_id (đồng bộ mobile)
- [ ] Unread badge — sau khi BE có mark-read (gap 2.2)

### Phase 6d — Event & Safety (an toàn lao động)
- [ ] Event participants / check-in — chờ BE `eventcheck/getallbyevent` (gap 2.1)
- [ ] Safety monitoring `getallusercheckedsafetycheckevent` (SAFE/UNKNOWN/Needs attention)

### Phase 6e — Notifications & Uniform
- [ ] Notification composer + unread inbox (polling 15–30s)
- [ ] Notification full history — sau khi BE bổ sung (gap 2.3)
- [ ] Uniform queue — chờ BE mount route admin (gap 2.5)

## Phase 7 — Testing
- [ ] Admin permissions
- [ ] Leader permissions
- [ ] STAFF blocked (Unauthorized)
- [ ] Forbidden routes (403)
- [ ] API errors resilience
- [ ] Empty data states
- [ ] Responsive UI (sidebar drawer, tables scroll)
- [ ] Build passes (`npm run build`)
- [ ] Lint passes / cleanup unused imports

## Phase 8 — Backend dependencies (để 2 bên điều phối)
- [ ] BE: mount uniform admin route + `get-orders` cho uniform (gap 2.5)
- [ ] BE: guard `updateisconfirm` overtime cho EMP (fix 2.6)
- [ ] BE: fix `dailyreport getall` enum validation ngược (fix 2.7)
- [ ] BE: thống nhất Position enum `COMPORATION` (fix 2.8)
- [ ] BE: `eventcheck/getallbyevent` + `notification/getallofuser` (gaps 2.1, 2.3)
- [ ] BE: `PUT /checkin/:id` attendance correction (gap 2.4)
- [ ] BE: `message/search` + `conversations/mark-read` (gap 2.2)
- [ ] BE: socket auth handshake (gap 2.13)

## Report
- [ ] Final report (10 items)