/**
 * Cấu hình API — đọc từ .env (Vite).
 * Ưu tiên VITE_API_URL (URL đầy đủ), không thì ghép từ các biến riêng lẻ.
 */

const read = (key, fallback = "") => {
  const value = import.meta.env[key];
  if (value === undefined || value === "") {
    return fallback;
  }
  return String(value).trim();
};

const stripTrailingSlash = (url) => url.replace(/\/+$/, "");

const apiUrlOverride = read("VITE_API_URL");

export const apiEnv = {
  /** URL REST đầy đủ — ưu tiên VITE_API_URL */
  apiUrl: apiUrlOverride,
  baseUrl: read("VITE_API_BASE_URL", "http://localhost"),
  port: read("VITE_API_PORT", ":4000"),
  path: read("VITE_API_PATH", "/api"),
  version: read("VITE_API_VERSION", "/version"),
  v1: read("VITE_API_V1", "/v1"),
  socketUrl: read("VITE_SOCKET_URL", ""),
};

/** Host + port, ví dụ http://localhost:4000 */
export const API_ORIGIN = (() => {
  if (apiEnv.apiUrl) {
    try {
      return new URL(apiEnv.apiUrl).origin;
    } catch {
      return stripTrailingSlash(`${apiEnv.baseUrl}${apiEnv.port}`);
    }
  }
  return stripTrailingSlash(`${apiEnv.baseUrl}${apiEnv.port}`);
})();

/** Socket.IO */
export const SOCKET_URL = apiEnv.socketUrl || API_ORIGIN;

/** Prefix REST, ví dụ http://localhost:4000/api/version/v1 */
export const API_ROOT = apiEnv.apiUrl
  ? stripTrailingSlash(apiEnv.apiUrl)
  : stripTrailingSlash(
      `${apiEnv.baseUrl}${apiEnv.port}${apiEnv.path}${apiEnv.version}${apiEnv.v1}`
    );

/** Ghép URL đầy đủ: buildApiUrl(USER_URL + SEARCH) */
export const buildApiUrl = (...segments) => {
  const path = segments
    .filter(Boolean)
    .map((s) => String(s))
    .join("")
    .replace(/\/{2,}/g, "/");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_ROOT}${normalized}`;
};
