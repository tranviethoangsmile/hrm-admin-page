import axios from "axios";

import { API_ROOT } from "../constants";

export { API_ROOT };

export const getCurrentUser = () => {
  try {
    return (
      JSON.parse(sessionStorage.getItem("currentUser")) ||
      JSON.parse(sessionStorage.getItem("userIF")) ||
      {}
    );
  } catch {
    return {};
  }
};

const getToken = () => sessionStorage.getItem("token") || "";

/**
 * Gọi API admin — path relative API_ROOT (vd: `/paidleave/search`).
 * Backend HRM Metal có thể trả HTTP 200 kèm success: false.
 */
export const adminRequest = async ({
  method = "post",
  path,
  data,
  params,
  headers,
}) => {
  const isFormData = data instanceof FormData;
  const response = await axios({
    method,
    url: `${API_ROOT}${path}`,
    data,
    params,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
  }).catch((error) => {
    const serverMessage = error?.response?.data?.message;
    if (serverMessage) {
      error.message = serverMessage;
    }
    throw error;
  });

  const payload = response.data;

  if (payload?.success === false) {
    throw new Error(payload.message || "Request failed");
  }

  return payload?.data ?? payload;
};

export const withAdminUser = (payload = {}) => {
  const currentUser = getCurrentUser();
  return {
    ...payload,
    user_id: payload.user_id || currentUser.id,
  };
};
