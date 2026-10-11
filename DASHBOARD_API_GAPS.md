# Dashboard API Gaps — what real data is NOT available yet

Companion to `DASHBOARD_BUSINESS_AUDIT.md`. All findings from reading the actual backend
(`hrmMetal/src`) and Swagger (`src/api/generatedApiPaths.js`). The FE currently either shows
these without data or papers over them. Until fixed, the dashboard must NOT fake them.

## Critical gaps (block displaying the fact)

| # | Needed fact | Backend reality | Effect |
|---|-------------|-----------------|--------|
| 1 | **All staff of position** | `GET_ALL_USERS_OF_POSITION_FOR_ADMIN` exists and works (`/dashboards/admin/users/get-users`) | ✅ available — use it |
| 2 | **Who is absent** | Only derivable: headcount − (`is_paid_leave=false` checkins) − paid-leave rows. Absence **reason** (sick, no-show) is unknown | Show count + split leave/unknown; never guess reason |
| 3 | **Unread message count** | Chat has **no read-receipt / is_readed on Message**. `/groupmember/getgroupmemberofuser` returns conversations with `messages[]` but no per-message `created_at` in the included attributes (`message, message_type, is_unsend, user_id`) | Cannot show "N unread messages". Can show recent conversations + last-message text only |
| 4 | **Live / up-to-date unread notifications** | `/notification/searchById` result is **Redis-cached 86400s** — a 24h stale window | Unread notification count refreshes at most daily unless FE busts cache (not possible via API) — treat as "today's batch", not "this second" |
| 5 | **Events participation / who confirmed** | Normal (non-safety) events have **no aggregated participant count** API. Only per-user `/eventcheck/searcheventchecked` and safety-check users via `/safetycheck/getallusercheckedsafetycheckevent` | Show today's event list, not "X attended" |

## Endpoint-level gaps (simple gaps, small backend work)

| # | Endpoint | Problem | Suggested fix (BE) |
|---|----------|---------|--------------------|
| 6 | `/checkin/getcheckinindateofposition` | Admin repo variant filters `is_paid_leave=false` only — the **paid-leave rows are silently excluded** from "today checked in". The summary returns `paid_leaves` separately, but the per-position route drops them | Return rows with `is_paid_leave` present and let FE split, or add a query flag |
| 7 | `/checkin` admin repo `GET_ALL_CHECKINS_OF_POSITION_IN_DATE_FOR_ADMIN` | Attributes omit `go_in`/`go_out` (break time fields exist on model but are not selected) | Add `go_in`,`go_out` to attributes for break-time tracking |
| 8 | No "**late**" anywhere | Checkin model has no `is_late`; no scheduled shift-start time is exposed | Track `is_late` on checkin create (compare `time_in` vs shift start), expose in admin repo |
| 9 | Summary `/dashboards/admin/summarys/s` | `pending_checkins` = **previous day** by design (uses `subtract(1,'day')`); returns nothing for today | Add today's check-in context or document the semantics; FE must not label it "today" |
| 10 | `/events/getwithposition` | Typo in filter `'COMPORATION'` (should be CORPORATION); "company-wide events" rely on the typo match — fragile | Fix constant spelling in events.repo |
| 11 | Leader/MANAGER/SUPERVISOR | No summary endpoint; no per-position all-users aggregate (that's ADMIN-only); supervisor/manager dashboards cannot compute "not checked in" without `/dashboards/admin` routes | Add a role-aware summary (`/dashboards/leader/summarys/s`) mirroring the admin one |

## Not needed / intentionally excluded from headline (by audit)

- Attendance-rate **%** — synthetic (see audit §3).
- Production plan / daily report counts — separate module concerns.
- "Recent activity" feed without timestamps or targets — not actionable.

**Rule:** A KPI is shown only if the API above it is real. Anything in the "critical / endpoint
gaps" table that is still missing stays hidden with a "coming soon" placeholder, never a guessed number.