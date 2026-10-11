export const getPersonName = (item) =>
  item?.name ||
  item?.full_name ||
  item?.user_name ||
  item?.employee_name ||
  item?.user?.name ||
  item?.User?.name ||
  item?.staff?.name ||
  item?.user?.user_name ||
  item?.User?.user_name ||
  "Unknown";

export const getOrderName = (item) =>
  item?.order_name ||
  item?.name ||
  item?.title ||
  item?.code ||
  item?.user?.name ||
  item?.User?.name ||
  "Order";

export const getInitials = (name) => {
  if (!name || name === "Unknown") return "??";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const toList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};
