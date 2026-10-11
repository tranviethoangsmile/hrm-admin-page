/**
 * API env + path constants — đồng bộ với hrmMetal Swagger.
 * Chạy `npm run sync:api` sau khi backend đổi route.
 */
export {
  apiEnv,
  API_ORIGIN,
  API_ROOT,
  SOCKET_URL,
  buildApiUrl,
} from "./config/env";

export { API_ROOT as API_BASE } from "./config/env";

export { API_MODULES, API_PATH_ALIASES, SWAGGER_OPERATIONS } from "./api/generatedApiPaths";

import { API_PATH_ALIASES as paths } from "./api/generatedApiPaths";

// Re-export toàn bộ alias (tên export giữ tương thích codebase cũ)
export const USER_URL = paths.USER_URL;
export const DEPARTMENT = paths.DEPARTMENT;
export const LOGIN_URL = paths.LOGIN_URL;
export const LOGIN_APP = paths.LOGIN_APP;
export const LOGIN_WEB = paths.LOGIN_WEB;
export const ORDER_URL = paths.ORDER_URL;
export const CHAT = paths.CHAT;
export const CHECKIN = paths.CHECKIN;
export const CREATE = paths.CREATE;
export const SEARCH = paths.SEARCH;
export const UPLOAD_AVATAR = paths.UPLOAD_AVATAR;
export const INFORMATION = paths.INFORMATION;
export const PAID_LEAVE = paths.PAID_LEAVE;
export const INVENTORY = paths.INVENTORY;
export const DAILY_REPORT = paths.DAILY_REPORT;
export const GET_INFOR_OF_USER = "/getinforofuser";
export const GET_INFOR_BY_ID = paths.GET_INFOR_BY_ID;
export const GET_ALL_BY_FIELD = paths.GET_ALL_BY_FIELD;
export const DELETE_INFORMATION_BY_ID = paths.DELETE_INFORMATION_BY_ID;
export const GET_CHECKIN_IN_DATE_OF_POSITION = paths.GET_CHECKIN_IN_DATE_OF_POSITION;
export const FIND_ALL_USER_WITH_FIELD = paths.FIND_ALL_USER_WITH_FIELD;
export const FIND_USER_BY_FIELD = paths.FIND_USER_BY_FIELD;
export const SEARCH_ORDER_WITH_FIELD = paths.SEARCH_ORDER_WITH_FIELD;
export const CHECKIN_DETAIL_IN_DATE_OF_USER = "/getcheckindetailindateofuser";
export const GET_USER_WITH_DEPARTMENT_ID = "/getuserwithdepartmentid";
export const UPDATE_CONFIRM_PAID_LEAVE = paths.UPDATE_CONFIRM_PAID_LEAVE;

export const CONFIRM = paths.CONFIRM;
export const UPDATE = paths.UPDATE;
export const GET_ALL = paths.GET_ALL;

export const EVENTS = paths.EVENTS;
export const SAFETY_CHECK = paths.SAFETY_CHECK;
export const EVENT_CHECK = paths.EVENT_CHECK;
export const SEARCH_EVENT_CHECKED = paths.SEARCH_EVENT_CHECKED;
export const SEARCH_SAFETY_CHECKED = "/searchsafetychecked";
export const PAYROLL = paths.PAYROLL;
export const PLAN_PRODUCTION = paths.PLAN_PRODUCTION;
export const SEARCH_PLAN_PRODUCTION_WITH_FIELD = paths.SEARCH_PLAN_PRODUCTION_WITH_FIELD;
export const SEARCH_BY_ID = "/searchbyid";
export const NOTIFICATION = paths.NOTIFICATION;
export const CONVERSATION = paths.CONVERSATION;
export const MESSAGE = paths.MESSAGE;
export const SEARCH_MESSAGE_WITH_CONVERSATION = paths.SEARCH_MESSAGE_WITH_CONVERSATION;
export const GROUP_MEMBER = paths.GROUP_MEMBER;
export const GET_GROUP_MEMBER_OF_USER = paths.GET_GROUP_MEMBER_OF_USER;
export const UNSEND = paths.UNSEND;
export const DELETE = paths.DELETE;
export const FCM_TOKEN = paths.FCM_TOKEN;
export const GET_EVENTS_WITH_POSITION = paths.GET_EVENTS_WITH_POSITION;
export const UNIFORM_ORDER = paths.UNIFORM_ORDER;
export const GET_UNIFORM_ORDER_DETAIL = paths.GET_UNIFORM_ORDER_DETAIL;
export const WITH_USER_ID = "/withuserid";
export const WITH_POSITION = "/withposition";
export const CREATE_GROUP = "/creategroup";
export const SAFETY_REPORT = paths.SAFETY_REPORT;
export const GET_ALL_BY_USER_ID = paths.GET_ALL_BY_USER_ID;
export const GET_ALL_BY_DEPARTMENT_ID = paths.GET_ALL_BY_DEPARTMENT_ID;
export const DAY_OFFS = paths.DAY_OFFS;
export const OVERTIME_REQUEST = paths.OVERTIME_REQUEST;
export const TAX_DEPENDENT = paths.TAX_DEPENDENT;
export const DEPENDENT_SUPPORT_AMOUNT = paths.DEPENDENT_SUPPORT_AMOUNT;
export const FOOD = paths.FOOD;
export const CANTEEN = paths.CANTEEN;
export const MEDIA = paths.MEDIA;
export const ERROR_OF_REPORT = paths.ERROR_OF_REPORT;
export const DASHBOARDS = paths.DASHBOARDS || "/dashboards";
export const GET_BY_ID = paths.GET_BY_ID;
export const DELETE_BY_ID = paths.DELETE_BY_ID;
export const UPDATE_STATUS = paths.UPDATE_STATUS;
export const UPDATE_IS_CONFIRM = paths.UPDATE_IS_CONFIRM;
export const UPDATE_IS_APPROVED = paths.UPDATE_IS_APPROVED;
