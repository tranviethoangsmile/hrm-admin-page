/**
 * AUTO-GENERATED — không sửa tay. Chạy: npm run sync:api
 * Nguồn: http://localhost:4000/docs.json
 * Generated: 2026-08-10T11:05:40.992Z
 * Operations: 139 | V1 mounts: 32
 */

/** Module base paths (khớp hrmMetal src/routers/v1/v1.ts) */
export const API_MODULES = {
  "canteen": "/canteen",
  "chat": "/chat",
  "checkin": "/checkin",
  "conversations": "/conversations",
  "dailyreport": "/dailyreport",
  "dashboards": "/dashboards",
  "dayoffs": "/dayoffs",
  "department": "/department",
  "dependent-support-amount": "/dependent-support-amount",
  "error-of-report": "/error-of-report",
  "eventcheck": "/eventcheck",
  "events": "/events",
  "fcmtoken": "/fcmtoken",
  "find": "/find",
  "food": "/food",
  "groupmember": "/groupmember",
  "information": "/information",
  "inventory": "/inventory",
  "login": "/login",
  "media": "/media",
  "message": "/message",
  "notification": "/notification",
  "order": "/order",
  "overtimerequest": "/overtimerequest",
  "paidleave": "/paidleave",
  "payroll": "/payroll",
  "planproduction": "/planproduction",
  "safetycheck": "/safetycheck",
  "safetyreport": "/safetyreport",
  "taxdependent": "/taxdependent",
  "uniformorder": "/uniformorder",
  "users": "/users"
};

/** Legacy aliases dùng trong constants.js / moduleConfig */
export const API_PATH_ALIASES = {
  "USER_URL": "/users",
  "DEPARTMENT": "/department",
  "LOGIN_URL": "/login",
  "LOGIN_APP": "/app",
  "LOGIN_WEB": "/web",
  "ORDER_URL": "/order",
  "CHECKIN": "/checkin",
  "INFORMATION": "/information",
  "PAID_LEAVE": "/paidleave",
  "INVENTORY": "/inventory",
  "DAILY_REPORT": "/dailyreport",
  "EVENTS": "/events",
  "SAFETY_CHECK": "/safetycheck",
  "EVENT_CHECK": "/eventcheck",
  "PAYROLL": "/payroll",
  "PLAN_PRODUCTION": "/planproduction",
  "NOTIFICATION": "/notification",
  "CONVERSATION": "/conversations",
  "MESSAGE": "/message",
  "GROUP_MEMBER": "/groupmember",
  "FCM_TOKEN": "/fcmtoken",
  "UNIFORM_ORDER": "/uniformorder",
  "SAFETY_REPORT": "/safetyreport",
  "DAY_OFFS": "/dayoffs",
  "OVERTIME_REQUEST": "/overtimerequest",
  "TAX_DEPENDENT": "/taxdependent",
  "DEPENDENT_SUPPORT_AMOUNT": "/dependent-support-amount",
  "FOOD": "/food",
  "CANTEEN": "/canteen",
  "CHAT": "/chat",
  "MEDIA": "/media",
  "ERROR_OF_REPORT": "/error-of-report",
  "FIND_USER_BY_FIELD": "/finduserwithfield",
  "GET_ALL": "/getall",
  "CREATE": "/create",
  "SEARCH": "/search",
  "UPDATE": "/update",
  "DELETE": "/delete",
  "GET_CHECKIN_IN_DATE_OF_POSITION": "/getcheckinindateofposition",
  "SEARCH_ORDER_WITH_FIELD": "/searchorderwithfield",
  "GET_ALL_BY_DEPARTMENT_ID": "/getbydepartmentid",
  "SEARCH_PLAN_PRODUCTION_WITH_FIELD": "/searchbydateanddepartment",
  "UPDATE_CONFIRM_PAID_LEAVE": "/updateconfirm",
  "UPLOAD_AVATAR": "/upload-avatar",
  "GET_ALL_BY_FIELD": "/getallinforbyfield",
  "DELETE_INFORMATION_BY_ID": "/deleteinformationbyid",
  "GET_INFOR_BY_ID": "/getinforbyid",
  "GET_EVENTS_WITH_POSITION": "/getwithposition",
  "SEARCH_EVENT_CHECKED": "/searcheventchecked",
  "GET_UNIFORM_ORDER_DETAIL": "/getuniformorderdetail",
  "UPDATE_IS_CONFIRM": "/updateisconfirm",
  "UPDATE_IS_APPROVED": "/updateisapproved",
  "GET_BY_ID": "/getbyid",
  "DELETE_BY_ID": "/deletebyid",
  "UPDATE_STATUS": "/update-status",
  "CONFIRM": "/confirm",
  "GET_ALL_BY_USER_ID": "/getbyuserid",
  "SEARCH_MESSAGE_WITH_CONVERSATION": "/searchmessageofconversation",
  "GET_GROUP_MEMBER_OF_USER": "/getgroupmemberofuser",
  "UNSEND": "/unsend",
  "FIND_ALL_USER_WITH_FIELD": "/finduserwithfield"
};

/** Toàn bộ endpoint từ Swagger (path relative API_ROOT) */
export const SWAGGER_OPERATIONS = [
  {
    "method": "GET",
    "path": "/canteen",
    "summary": "Get all canteens",
    "tags": [
      "Canteens"
    ]
  },
  {
    "method": "GET",
    "path": "/canteen",
    "summary": "Get a canteen by ID",
    "tags": [
      "Canteens"
    ]
  },
  {
    "method": "POST",
    "path": "/canteen",
    "summary": "Create a new canteen",
    "tags": [
      "Canteens"
    ]
  },
  {
    "method": "POST",
    "path": "/chat",
    "summary": "Send a message to the chatbot",
    "tags": [
      "Chat"
    ]
  },
  {
    "method": "POST",
    "path": "/checkin/create",
    "summary": "Create or update a check-in record",
    "tags": [
      "Checkin"
    ]
  },
  {
    "method": "POST",
    "path": "/checkin/getcheckindetailindateofuser",
    "summary": "Get user's check-in details for a specific date",
    "tags": [
      "Checkin"
    ]
  },
  {
    "method": "POST",
    "path": "/checkin/getcheckinindateofposition",
    "summary": "Get check-in records by position and date",
    "tags": [
      "Checkin"
    ]
  },
  {
    "method": "POST",
    "path": "/checkin/search",
    "summary": "Search user's check-in records in a month",
    "tags": [
      "Checkin"
    ]
  },
  {
    "method": "POST",
    "path": "/conversations/create",
    "summary": "Create a new one-on-one conversation",
    "tags": [
      "Conversations"
    ]
  },
  {
    "method": "POST",
    "path": "/conversations/creategroup",
    "summary": "Create a new group conversation",
    "tags": [
      "Conversations"
    ]
  },
  {
    "method": "POST",
    "path": "/conversations/delete",
    "summary": "Delete a conversation",
    "tags": [
      "Conversations"
    ]
  },
  {
    "method": "GET",
    "path": "/dailyreport",
    "summary": "Get daily report by ID",
    "tags": [
      "Daily Reports"
    ]
  },
  {
    "method": "POST",
    "path": "/dailyreport",
    "summary": "Create daily report (legacy endpoint)",
    "tags": [
      "Daily Reports"
    ]
  },
  {
    "method": "POST",
    "path": "/dailyreport/create",
    "summary": "Create a new daily report",
    "tags": [
      "Daily Reports"
    ]
  },
  {
    "method": "POST",
    "path": "/dailyreport/getall",
    "summary": "Get all daily reports with filters",
    "tags": [
      "Daily Reports"
    ]
  },
  {
    "method": "POST",
    "path": "/dailyreport/search",
    "summary": "Search daily reports",
    "tags": [
      "Daily Reports"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/checkins/get-checkins",
    "summary": "Get checkins by admin position and date",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/departments/create-department",
    "summary": "Create a department as admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/events/create-event",
    "summary": "Create an event as admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/events/delete-event",
    "summary": "Delete an event as admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/informations/create-information",
    "summary": "Create an information post as admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/informations/delete-informations",
    "summary": "Delete an information post as admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "GET",
    "path": "/dashboards/admin/informations/get-informations",
    "summary": "Get information posts for the authenticated admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/notifications/create-notification",
    "summary": "Create a notification as admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "GET",
    "path": "/dashboards/admin/options/get-enums",
    "summary": "Get admin enum options",
    "tags": [
      "Admin Options"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/orders/create-orders",
    "summary": "Create an order as admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/orders/get-orders",
    "summary": "Get orders by admin position and date",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/paidleaves/paid-leave-confirm",
    "summary": "Confirm an approved paid leave request as admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/summarys/s",
    "summary": "Get admin dashboard summary",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "PUT",
    "path": "/dashboards/admin/tax-dependents/update-status-tax-dependent",
    "summary": "Update tax dependent status as admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/users/create-user",
    "summary": "Create a user as admin",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/admin/users/get-users",
    "summary": "Get users by admin position",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/leader/inventorys/update-inventory",
    "summary": "Update inventory as leader",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/leader/paidleaves/approve-paid-leave-request",
    "summary": "Approve or reject a paid leave request as leader",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "GET",
    "path": "/dashboards/leader/paidleaves/get-paid-leave-request",
    "summary": "Get paid leave requests for the current leader",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dashboards/logs/search",
    "summary": "Search audit logs",
    "tags": [
      "Dashboards"
    ]
  },
  {
    "method": "POST",
    "path": "/dayoffs/create",
    "summary": "Create a new day off",
    "tags": [
      "Day Offs"
    ]
  },
  {
    "method": "POST",
    "path": "/dayoffs/deletebyid",
    "summary": "Delete day off by ID",
    "tags": [
      "Day Offs"
    ]
  },
  {
    "method": "GET",
    "path": "/dayoffs/getall",
    "summary": "Get all days off",
    "tags": [
      "Day Offs"
    ]
  },
  {
    "method": "POST",
    "path": "/dayoffs/getbyid",
    "summary": "Get day off by ID",
    "tags": [
      "Day Offs"
    ]
  },
  {
    "method": "PUT",
    "path": "/dayoffs/update",
    "summary": "Update day off",
    "tags": [
      "Day Offs"
    ]
  },
  {
    "method": "POST",
    "path": "/department/create",
    "summary": "Create a new department",
    "tags": [
      "Departments"
    ]
  },
  {
    "method": "GET",
    "path": "/department/getall",
    "summary": "Get all departments",
    "tags": [
      "Departments"
    ]
  },
  {
    "method": "POST",
    "path": "/department/getbyid",
    "summary": "Get a department by ID",
    "tags": [
      "Departments"
    ]
  },
  {
    "method": "POST",
    "path": "/dependent-support-amount/confirm",
    "summary": "Xác nhận bản ghi số tiền hỗ trợ (chỉ Admin)",
    "tags": [
      "DependentSupportAmount"
    ]
  },
  {
    "method": "POST",
    "path": "/dependent-support-amount/create",
    "summary": "Tạo bản ghi số tiền hỗ trợ người phụ thuộc",
    "tags": [
      "DependentSupportAmount"
    ]
  },
  {
    "method": "POST",
    "path": "/dependent-support-amount/delete",
    "summary": "Xóa bản ghi số tiền hỗ trợ người phụ thuộc",
    "tags": [
      "DependentSupportAmount"
    ]
  },
  {
    "method": "POST",
    "path": "/dependent-support-amount/getbyid",
    "summary": "Lấy bản ghi số tiền hỗ trợ theo ID",
    "tags": [
      "DependentSupportAmount"
    ]
  },
  {
    "method": "POST",
    "path": "/dependent-support-amount/getbytaxdependentidandyear",
    "summary": "Get dependent support amount by tax dependent ID and year",
    "tags": [
      "DependentSupportAmount"
    ]
  },
  {
    "method": "POST",
    "path": "/dependent-support-amount/update",
    "summary": "Cập nhật bản ghi số tiền hỗ trợ người phụ thuộc",
    "tags": [
      "DependentSupportAmount"
    ]
  },
  {
    "method": "POST",
    "path": "/error-of-report/findByDailyReportId",
    "summary": "Find errors of a daily report",
    "tags": [
      "ErrorOfReports"
    ]
  },
  {
    "method": "POST",
    "path": "/eventcheck/create",
    "summary": "Create an event check",
    "tags": [
      "Event Checks"
    ]
  },
  {
    "method": "POST",
    "path": "/eventcheck/searcheventchecked",
    "summary": "Search event check",
    "tags": [
      "Event Checks"
    ]
  },
  {
    "method": "POST",
    "path": "/events/delete",
    "summary": "Delete an event",
    "tags": [
      "Events"
    ]
  },
  {
    "method": "GET",
    "path": "/events/getall",
    "summary": "Get all events",
    "tags": [
      "Events"
    ]
  },
  {
    "method": "POST",
    "path": "/events/getwithposition",
    "summary": "Get events based on position",
    "tags": [
      "Events"
    ]
  },
  {
    "method": "POST",
    "path": "/events/searchbyid",
    "summary": "Search an event by ID",
    "tags": [
      "Events"
    ]
  },
  {
    "method": "POST",
    "path": "/events/update",
    "summary": "Update an event",
    "tags": [
      "Events"
    ]
  },
  {
    "method": "POST",
    "path": "/fcmtoken/create",
    "summary": "Create or update FCM token",
    "tags": [
      "FCM Tokens"
    ]
  },
  {
    "method": "GET",
    "path": "/find",
    "summary": "Find users by name",
    "tags": [
      "Find"
    ]
  },
  {
    "method": "POST",
    "path": "/find",
    "summary": "Search orders by field",
    "tags": [
      "Find"
    ]
  },
  {
    "method": "GET",
    "path": "/food",
    "summary": "Get all food items",
    "tags": [
      "Food"
    ]
  },
  {
    "method": "GET",
    "path": "/food",
    "summary": "Get a food item by ID",
    "tags": [
      "Food"
    ]
  },
  {
    "method": "POST",
    "path": "/food",
    "summary": "Create a new food item",
    "tags": [
      "Food"
    ]
  },
  {
    "method": "POST",
    "path": "/groupmember/getgroupmemberofuser",
    "summary": "Get group members of a user",
    "tags": [
      "Group Members"
    ]
  },
  {
    "method": "POST",
    "path": "/information/getallinforbyfield",
    "summary": "Get information by current user position",
    "tags": [
      "Information"
    ]
  },
  {
    "method": "POST",
    "path": "/information/getinforbyid",
    "summary": "Get information by ID",
    "tags": [
      "Information"
    ]
  },
  {
    "method": "POST",
    "path": "/information/getinforofuser",
    "summary": "Get information by user ID",
    "tags": [
      "Information"
    ]
  },
  {
    "method": "POST",
    "path": "/inventory/create",
    "summary": "Create new inventory",
    "tags": [
      "Inventory"
    ]
  },
  {
    "method": "POST",
    "path": "/inventory/getall",
    "summary": "Get all inventory",
    "tags": [
      "Inventory"
    ]
  },
  {
    "method": "POST",
    "path": "/inventory/search",
    "summary": "Search inventory",
    "tags": [
      "Inventory"
    ]
  },
  {
    "method": "POST",
    "path": "/inventory/update",
    "summary": "Update inventory",
    "tags": [
      "Inventory"
    ]
  },
  {
    "method": "POST",
    "path": "/login/app",
    "summary": "Login for mobile app",
    "tags": [
      "Login"
    ]
  },
  {
    "method": "POST",
    "path": "/login/web",
    "summary": "Login for dashboard",
    "tags": [
      "Login"
    ]
  },
  {
    "method": "GET",
    "path": "/media/uploads",
    "summary": "Get a media file by filename",
    "tags": [
      "Media"
    ]
  },
  {
    "method": "POST",
    "path": "/message/create",
    "summary": "Create a new message",
    "tags": [
      "Messages"
    ]
  },
  {
    "method": "POST",
    "path": "/message/delete",
    "summary": "Delete a message",
    "tags": [
      "Messages"
    ]
  },
  {
    "method": "POST",
    "path": "/message/searchmessageofconversation",
    "summary": "Get conversation messages",
    "tags": [
      "Messages"
    ]
  },
  {
    "method": "POST",
    "path": "/message/unsend",
    "summary": "Unsend a message",
    "tags": [
      "Messages"
    ]
  },
  {
    "method": "POST",
    "path": "/notification/destroy",
    "summary": "Delete a notification",
    "tags": [
      "Notifications"
    ]
  },
  {
    "method": "POST",
    "path": "/notification/search",
    "summary": "Get notification by ID",
    "tags": [
      "Notifications"
    ]
  },
  {
    "method": "POST",
    "path": "/notification/searchById",
    "summary": "Get user's notifications",
    "tags": [
      "Notifications"
    ]
  },
  {
    "method": "PUT",
    "path": "/notification/update",
    "summary": "Mark notification as read",
    "tags": [
      "Notifications"
    ]
  },
  {
    "method": "DELETE",
    "path": "/order",
    "summary": "Delete an order",
    "tags": [
      "Orders"
    ]
  },
  {
    "method": "GET",
    "path": "/order",
    "summary": "Get all orders",
    "tags": [
      "Orders"
    ]
  },
  {
    "method": "POST",
    "path": "/order",
    "summary": "Create a new order",
    "tags": [
      "Orders"
    ]
  },
  {
    "method": "POST",
    "path": "/order/searchorderwithfield",
    "summary": "Search orders by field",
    "tags": [
      "Orders"
    ]
  },
  {
    "method": "POST",
    "path": "/order/user",
    "summary": "Get orders for the current user",
    "tags": [
      "Orders"
    ]
  },
  {
    "method": "PUT",
    "path": "/order/user",
    "summary": "Mark a user order as picked",
    "tags": [
      "Orders"
    ]
  },
  {
    "method": "POST",
    "path": "/overtimerequest/create",
    "summary": "Create a new overtime request",
    "tags": [
      "OvertimeRequest"
    ]
  },
  {
    "method": "POST",
    "path": "/overtimerequest/deletebyid",
    "summary": "Delete an overtime request",
    "tags": [
      "OvertimeRequest"
    ]
  },
  {
    "method": "POST",
    "path": "/overtimerequest/getAll",
    "summary": "Retrieve all overtime requests",
    "tags": [
      "OvertimeRequest"
    ]
  },
  {
    "method": "POST",
    "path": "/overtimerequest/getbyid",
    "summary": "Retrieve an overtime request by ID",
    "tags": [
      "OvertimeRequest"
    ]
  },
  {
    "method": "POST",
    "path": "/overtimerequest/getbyuserid",
    "summary": "Get overtime requests by user ID",
    "tags": [
      "Overtime Request"
    ]
  },
  {
    "method": "POST",
    "path": "/overtimerequest/updateisapproved",
    "summary": "Approve an overtime request by admin",
    "tags": [
      "OvertimeRequest"
    ]
  },
  {
    "method": "POST",
    "path": "/overtimerequest/updateisconfirm",
    "summary": "Confirm an overtime request by leader",
    "tags": [
      "OvertimeRequest"
    ]
  },
  {
    "method": "PUT",
    "path": "/paidleave",
    "summary": "Mark a paid leave request as approved",
    "tags": [
      "Paid Leave Requests"
    ]
  },
  {
    "method": "POST",
    "path": "/paidleave/create",
    "summary": "Create a paid leave request",
    "tags": [
      "Paid Leave Requests"
    ]
  },
  {
    "method": "POST",
    "path": "/paidleave/delete",
    "summary": "Delete a paid leave request",
    "tags": [
      "Paid Leave Requests"
    ]
  },
  {
    "method": "POST",
    "path": "/paidleave/search",
    "summary": "Search paid leave requests",
    "tags": [
      "Paid Leave Requests"
    ]
  },
  {
    "method": "POST",
    "path": "/payroll/create",
    "summary": "Create a new payroll record",
    "tags": [
      "Payroll"
    ]
  },
  {
    "method": "POST",
    "path": "/payroll/destroy",
    "summary": "Delete a payroll record",
    "tags": [
      "Payroll"
    ]
  },
  {
    "method": "POST",
    "path": "/payroll/search",
    "summary": "Search payroll records for a user in a specific month",
    "tags": [
      "Payroll"
    ]
  },
  {
    "method": "POST",
    "path": "/payroll/searchbyid",
    "summary": "Get payroll record by ID",
    "tags": [
      "Payroll"
    ]
  },
  {
    "method": "POST",
    "path": "/payroll/update",
    "summary": "Update a payroll record",
    "tags": [
      "Payroll"
    ]
  },
  {
    "method": "POST",
    "path": "/planproduction/create",
    "summary": "Create a new production plan",
    "tags": [
      "PlanProductions"
    ]
  },
  {
    "method": "POST",
    "path": "/planproduction/destroy",
    "summary": "Delete a production plan",
    "tags": [
      "PlanProductions"
    ]
  },
  {
    "method": "POST",
    "path": "/planproduction/searchbydateanddepartment",
    "summary": "Search production plans by date and department",
    "tags": [
      "PlanProductions"
    ]
  },
  {
    "method": "POST",
    "path": "/planproduction/searchbyid",
    "summary": "Search a production plan by ID",
    "tags": [
      "PlanProductions"
    ]
  },
  {
    "method": "PUT",
    "path": "/planproduction/update",
    "summary": "Update an existing production plan",
    "tags": [
      "PlanProductions"
    ]
  },
  {
    "method": "POST",
    "path": "/safetycheck/create",
    "summary": "Create a new safety check",
    "tags": [
      "SafetyChecks"
    ]
  },
  {
    "method": "POST",
    "path": "/safetycheck/getallusercheckedsafetycheckevent",
    "summary": "Get all users who have completed safety check for an event",
    "tags": [
      "SafetyChecks"
    ]
  },
  {
    "method": "POST",
    "path": "/safetycheck/searchsafetychecked",
    "summary": "Search completed safety check of user for event",
    "tags": [
      "SafetyChecks"
    ]
  },
  {
    "method": "POST",
    "path": "/safetyreport/confirm",
    "summary": "Confirm a safety report",
    "tags": [
      "SafetyReports"
    ]
  },
  {
    "method": "POST",
    "path": "/safetyreport/create",
    "summary": "Create a new safety report",
    "tags": [
      "SafetyReports"
    ]
  },
  {
    "method": "POST",
    "path": "/safetyreport/delete",
    "summary": "Delete a safety report",
    "tags": [
      "SafetyReports"
    ]
  },
  {
    "method": "POST",
    "path": "/safetyreport/getbydepartmentid",
    "summary": "Get safety reports by department ID",
    "tags": [
      "SafetyReports"
    ]
  },
  {
    "method": "POST",
    "path": "/safetyreport/getbyuserid",
    "summary": "Get safety reports by user ID and month",
    "tags": [
      "SafetyReports"
    ]
  },
  {
    "method": "POST",
    "path": "/safetyreport/update",
    "summary": "Update an existing safety report",
    "tags": [
      "SafetyReports"
    ]
  },
  {
    "method": "POST",
    "path": "/taxdependent/create",
    "summary": "Create a new tax dependent",
    "tags": [
      "TaxDependent"
    ]
  },
  {
    "method": "POST",
    "path": "/taxdependent/delete",
    "summary": "Delete a tax dependent",
    "tags": [
      "TaxDependent"
    ]
  },
  {
    "method": "POST",
    "path": "/taxdependent/getbyuserid",
    "summary": "Get all tax dependents by user ID",
    "tags": [
      "TaxDependent"
    ]
  },
  {
    "method": "PUT",
    "path": "/taxdependent/update",
    "summary": "Update a tax dependent",
    "tags": [
      "TaxDependent"
    ]
  },
  {
    "method": "PUT",
    "path": "/taxdependent/update-status",
    "summary": "Update tax dependent status (Admin only)",
    "tags": [
      "TaxDependent"
    ]
  },
  {
    "method": "POST",
    "path": "/uniformorder/create",
    "summary": "Create uniform orders",
    "tags": [
      "UniformOrders"
    ]
  },
  {
    "method": "POST",
    "path": "/uniformorder/delete",
    "summary": "Delete a uniform order",
    "tags": [
      "UniformOrders"
    ]
  },
  {
    "method": "POST",
    "path": "/uniformorder/getuniformorderdetail",
    "summary": "Get uniform order details",
    "tags": [
      "UniformOrders"
    ]
  },
  {
    "method": "POST",
    "path": "/uniformorder/search/withposition",
    "summary": "Search uniform orders by position",
    "tags": [
      "UniformOrders"
    ]
  },
  {
    "method": "POST",
    "path": "/uniformorder/search/withuserid",
    "summary": "Search uniform orders by user and status",
    "tags": [
      "UniformOrders"
    ]
  },
  {
    "method": "POST",
    "path": "/uniformorder/update",
    "summary": "Update a uniform order",
    "tags": [
      "UniformOrders"
    ]
  },
  {
    "method": "DELETE",
    "path": "/users",
    "summary": "Delete a user",
    "tags": [
      "Users"
    ]
  },
  {
    "method": "GET",
    "path": "/users",
    "summary": "Get all users",
    "tags": [
      "Users"
    ]
  },
  {
    "method": "GET",
    "path": "/users",
    "summary": "Get a user by ID",
    "tags": [
      "Users"
    ]
  },
  {
    "method": "PUT",
    "path": "/users",
    "summary": "Update a user",
    "tags": [
      "Users"
    ]
  },
  {
    "method": "POST",
    "path": "/users/findbyname",
    "summary": "Find a user by name",
    "tags": [
      "Users"
    ]
  },
  {
    "method": "POST",
    "path": "/users/finduserwithfield",
    "summary": "Find users by field",
    "tags": [
      "Users"
    ]
  },
  {
    "method": "POST",
    "path": "/users/getalluserforotrequestfeature",
    "summary": "Get users for overtime request feature",
    "tags": [
      "Users"
    ]
  },
  {
    "method": "POST",
    "path": "/users/getuserwithdepartmentid",
    "summary": "Get users by department ID",
    "tags": [
      "Users"
    ]
  },
  {
    "method": "POST",
    "path": "/users/upload-avatar",
    "summary": "Upload a user avatar",
    "tags": [
      "Users"
    ]
  }
];
