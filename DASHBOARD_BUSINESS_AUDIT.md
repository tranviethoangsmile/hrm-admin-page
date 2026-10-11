# Dashboard Business Audit — HRM Admin

Scope: the `/dashboard` page for **admin** (position-based, one production site).
Goal: answer the admin's real daily questions with **real API data only**, no fabricated KPIs.

## 1. Daily business questions the dashboard must answer (P0)

Every morning an admin needs to know, in order of urgency:

| # | Question | Source API (only admin routes) | Status |
|---|----------|-------------------------------|--------|
| Q1 | How many people have **not checked in** yet today? | `GET_ALL_USERS_OF_POSITION_FOR_ADMIN` (expected headcount) minus `GET_ALL_CHECKINS_OF_POSITION_IN_DATE_FOR_ADMIN` (who actually checked in) | ✅ computable |
| Q2 | Who hasn't ordered a **meal** for today? | `GET_ALL_USERS_OF_POSITION_FOR_ADMIN` minus `GET_ALL_ORDERS_OF_POSITION_IN_DATE_FOR_ADMIN` | ✅ computable |
| Q3 | How many **meal orders** today, split day/night? | `/dashboards/admin/orders/get-orders` (fields: `dayOrNight`, `isConfirmed`, `isPicked`) | ✅ real |
| Q4 | Any **paid-leave requests** waiting for my final confirm? | `GET_ALL_PAID_LEAVE_APPROVED_FOR_ADMIN` (approved but `is_confirm:false`) | ✅ real |
| Q5 | Any **overtime requests** waiting for my approval? | `/overtimerequest/getAll` → filter `is_confirm=true, is_approved=false` | ✅ real |
| Q6 | What **events** are happening today in my position? | `/events/getwithposition` → filter by today in `[date_start, date_end]` | ✅ real |
| Q7 | Are there **unread notifications** addressed to me? | `/notification/searchById` (returns only `is_readed:false`) | ✅ real |
| Q8 | Any **pending uniform orders** to process? | `GET_ALL_UNIFORM_ORDERS_OF_POSITION_FOR_ADMIN` (`order_status=pending`) | ✅ real |
| Q9 | Anyone **not checked-in** with a marked absence reason? | `GET_ALL_PAID_LEAVE_OF_POSITION_IN_DATE_FOR_ADMIN` (today's `is_paid_leave=true`) | ✅ real |
| Q10 | Any **safety reports** pending confirm for my department? | `/safetyreport/getbydepartmentid` (`is_confirm=false`) | ✅ real |

## 2. Secondary facts (P1 — support the daily questions, not headline KPIs)

- Day/night meal order counts, order confirmation/pickup progress.
- On-leave staff today (names) — helps explain absence.
- Latest "needs attention" type lists, each with a drill-down link.

## 3. What the current dashboard shows (audit) — why it's wrong

Current Dashboard.js renders: total employees, present, attendance-rate %, pending leave / OT / safety
/ production KPIs, a 7-day attendance chart, shift overview, a checkin table, absent list, recent
activity, order panel. Problems:

1. **Attendance-rate % is synthetic.** `present / total` mixes "every employee works today" with reality
   (weekends, day-offs) — a number nobody can act on. Remove as a headline. Use absolute "not checked in" counts instead.
2. **Today's checkin fetch is wrong by default.** `startDate` defaults to *yesterday*; the SQL filter
   `is_paid_leave:false` + `position` shows a partial view. The page must default to **today** and clearly show today's state.
3. **"Recent activity" is unlabeled and non-actionable.** Replaced by a real "Needs your attention" list derived from queues (Q4-Q10).
4. **Production plans / daily report KPIs** belong in their own modules and are unrelated to daily personnel ops. Remove `todayProduction` from the headline.
5. **Live socket reading is missing.** The backend already emits `userChecked`; today a check-in does not update the page live.
6. **No drill-down.** KPIs are numbers only; admin must click into nav to act.

## 4. Redesigned layout (business-first)

1. **Hello + date + position.** One line, not data.
2. **Needs your attention** — list built only from non-empty queues (Q4..Q10); each row links to its page.
3. **Today snapshot** — actionable absolute numbers: checked-in, not checked-in, on leave, meal orders
   (day/night), not ordered. Each links to `/attendance` or `/orders`.
4. **Today's attendance** — present / on leave / not checked-in counts + list of not-checked-in staff
   with reason (leave vs unknown); link to `/attendance`.
5. **Today's meal orders** — day/night split, ordered vs not ordered names; link to `/orders`.
6. **Messages & notifications** — recent conversations (from group member API) + unread notification list.
7. **Today's events** — name, time range, safety flag; link to `/events`.
8. **Approval queue** — leave confirm / overtime approve / uniform pending / safety pending, with count badges.
9. **Footer** — "Data refreshed HH:MM · auto-refresh x/60s" so stale numbers are visible.

Every number is derived from a real admin endpoint; anything not available is listed in
`DASHBOARD_API_GAPS.md`, not estimated.