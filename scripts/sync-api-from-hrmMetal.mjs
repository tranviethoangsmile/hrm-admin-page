#!/usr/bin/env node
/**
 * Đồng bộ API paths từ hrmMetal Swagger (/docs.json) + routers v1.
 * Chạy: npm run sync:api
 * Cần hrmMetal đang chạy hoặc file swagger qua HRM_METAL_SWAGGER_URL / HRM_METAL_SWAGGER_FILE
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outFile = path.join(root, "src/api/generatedApiPaths.js");

const swaggerUrl =
  process.env.HRM_METAL_SWAGGER_URL || "http://localhost:4000/docs.json";
const swaggerFile =
  process.env.HRM_METAL_SWAGGER_FILE ||
  path.resolve(root, "../hrmMetal/swagger-output.json");
const hrmV1Router = path.resolve(root, "../hrmMetal/src/routers/v1/v1.ts");

const API_PREFIX = "/api/version/v1";

async function loadSwagger() {
  if (process.env.HRM_METAL_SWAGGER_FILE && fs.existsSync(swaggerFile)) {
    return JSON.parse(fs.readFileSync(swaggerFile, "utf8"));
  }
  try {
    const res = await fetch(swaggerUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    if (fs.existsSync(swaggerFile)) {
      console.warn("Fetch swagger failed, using file:", e.message);
      return JSON.parse(fs.readFileSync(swaggerFile, "utf8"));
    }
    throw new Error(
      `Cannot load swagger from ${swaggerUrl}. Start hrmMetal or set HRM_METAL_SWAGGER_FILE.`
    );
  }
}

/** Chuẩn hóa path Swagger → path relative API_ROOT (bắt đầu /) */
function normalizeSwaggerPath(swaggerPath) {
  let p = swaggerPath.replace(/\{[^}]+\}/g, "").replace(/\/+$/, "");
  if (p.startsWith(API_PREFIX)) {
    p = p.slice(API_PREFIX.length);
  }
  if (!p.startsWith("/")) p = `/${p}`;
  return p || "/";
}

function parseV1Mounts() {
  if (!fs.existsSync(hrmV1Router)) return [];
  const src = fs.readFileSync(hrmV1Router, "utf8");
  const mounts = [];
  const re = /v1Router\.use\(\s*['"]([^'"]+)['"]\s*,/g;
  let m;
  while ((m = re.exec(src))) {
    mounts.push(m[1]);
  }
  return mounts.sort();
}

function pathToConstantName(relativePath) {
  return relativePath
    .replace(/^\//, "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

function buildOperations(swagger) {
  const ops = [];
  for (const [rawPath, methods] of Object.entries(swagger.paths || {})) {
    const rel = normalizeSwaggerPath(rawPath);
    for (const [method, spec] of Object.entries(methods)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
      ops.push({
        method: method.toUpperCase(),
        path: rel,
        summary: spec.summary || "",
        tags: spec.tags || [],
      });
    }
  }
  ops.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  return ops;
}

function groupByModule(ops, mounts) {
  const modules = {};
  for (const mount of mounts) {
    modules[mount.replace(/^\//, "")] = mount;
  }
  for (const op of ops) {
    const seg = op.path.split("/").filter(Boolean)[0] || "root";
    if (!modules[seg]) {
      modules[seg] = `/${seg}`;
    }
  }
  return modules;
}

async function main() {
  const swagger = await loadSwagger();
  const ops = buildOperations(swagger);
  const mounts = parseV1Mounts();
  const modules = groupByModule(ops, mounts);

  const legacyAliases = {
    USER_URL: modules.users || "/users",
    DEPARTMENT: modules.department || "/department",
    LOGIN_URL: "/login",
    LOGIN_APP: "/app",
    LOGIN_WEB: "/web",
    ORDER_URL: modules.order || "/order",
    CHECKIN: modules.checkin || "/checkin",
    INFORMATION: modules.information || "/information",
    PAID_LEAVE: modules.paidleave || "/paidleave",
    INVENTORY: modules.inventory || "/inventory",
    DAILY_REPORT: modules.dailyreport || "/dailyreport",
    EVENTS: modules.events || "/events",
    SAFETY_CHECK: modules.safetycheck || "/safetycheck",
    EVENT_CHECK: modules.eventcheck || "/eventcheck",
    PAYROLL: modules.payroll || "/payroll",
    PLAN_PRODUCTION: modules.planproduction || "/planproduction",
    NOTIFICATION: modules.notification || "/notification",
    CONVERSATION: modules.conversations || "/conversations",
    MESSAGE: modules.message || "/message",
    GROUP_MEMBER: modules.groupmember || "/groupmember",
    FCM_TOKEN: modules.fcmtoken || "/fcmtoken",
    UNIFORM_ORDER: modules.uniformorder || "/uniformorder",
    SAFETY_REPORT: modules.safetyreport || "/safetyreport",
    DAY_OFFS: modules.dayoffs || "/dayoffs",
    OVERTIME_REQUEST: modules.overtimerequest || "/overtimerequest",
    TAX_DEPENDENT: modules.taxdependent || "/taxdependent",
    DEPENDENT_SUPPORT_AMOUNT:
      modules["dependent-support-amount"] || "/dependent-support-amount",
    FOOD: modules.food || "/food",
    CANTEEN: modules.canteen || "/canteen",
    CHAT: modules.chat || "/chat",
    MEDIA: modules.media || "/media",
    ERROR_OF_REPORT: modules["error-of-report"] || "/error-of-report",
    FIND_USER_BY_FIELD: "/finduserwithfield",
    GET_ALL: "/getall",
    CREATE: "/create",
    SEARCH: "/search",
    UPDATE: "/update",
    DELETE: "/delete",
    GET_CHECKIN_IN_DATE_OF_POSITION: "/getcheckinindateofposition",
    SEARCH_ORDER_WITH_FIELD: "/searchorderwithfield",
    GET_ALL_BY_DEPARTMENT_ID: "/getbydepartmentid",
    SEARCH_PLAN_PRODUCTION_WITH_FIELD: "/searchbydateanddepartment",
    UPDATE_CONFIRM_PAID_LEAVE: "/updateconfirm",
    UPLOAD_AVATAR: "/upload-avatar",
    GET_ALL_BY_FIELD: "/getallinforbyfield",
    DELETE_INFORMATION_BY_ID: "/deleteinformationbyid",
    GET_INFOR_BY_ID: "/getinforbyid",
    GET_EVENTS_WITH_POSITION: "/getwithposition",
    SEARCH_EVENT_CHECKED: "/searcheventchecked",
    GET_UNIFORM_ORDER_DETAIL: "/getuniformorderdetail",
    UPDATE_IS_CONFIRM: "/updateisconfirm",
    UPDATE_IS_APPROVED: "/updateisapproved",
    GET_BY_ID: "/getbyid",
    DELETE_BY_ID: "/deletebyid",
    UPDATE_STATUS: "/update-status",
    CONFIRM: "/confirm",
    GET_ALL_BY_USER_ID: "/getbyuserid",
    SEARCH_MESSAGE_WITH_CONVERSATION: "/searchmessageofconversation",
    GET_GROUP_MEMBER_OF_USER: "/getgroupmemberofuser",
    UNSEND: "/unsend",
    FIND_ALL_USER_WITH_FIELD: "/finduserwithfield",
  };

  const lines = [
    "/**",
    " * AUTO-GENERATED — không sửa tay. Chạy: npm run sync:api",
    ` * Nguồn: ${swaggerUrl}`,
    ` * Generated: ${new Date().toISOString()}`,
    ` * Operations: ${ops.length} | V1 mounts: ${mounts.length}`,
    " */",
    "",
    "/** Module base paths (khớp hrmMetal src/routers/v1/v1.ts) */",
    "export const API_MODULES = " + JSON.stringify(modules, null, 2) + ";",
    "",
    "/** Legacy aliases dùng trong constants.js / moduleConfig */",
    "export const API_PATH_ALIASES = " + JSON.stringify(legacyAliases, null, 2) + ";",
    "",
    "/** Toàn bộ endpoint từ Swagger (path relative API_ROOT) */",
    "export const SWAGGER_OPERATIONS = " + JSON.stringify(ops, null, 2) + ";",
    "",
  ];

  fs.writeFileSync(outFile, lines.join("\n"));
  fs.writeFileSync(
    path.join(root, "swagger-output.json"),
    JSON.stringify(swagger, null, 2)
  );
  console.log(`Wrote ${outFile} (${ops.length} operations)`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
