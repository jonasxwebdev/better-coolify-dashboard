export const STATUS_COLORS = {
  RUNNING: "bg-green-500",
  HEALTHY: "bg-green-500",
  ERROR: "bg-red-500",
  FAILED: "bg-red-500",
  EXITED: "bg-orange-500",
  STOPPED: "bg-orange-500",
  PENDING: "bg-yellow-500",
  DEFAULT: "bg-gray-500",
};

export const getStatusColor = (status) => {
  if (!status) return STATUS_COLORS.DEFAULT;
  const statusLower = status.toLowerCase();

  if (statusLower.includes("error") || statusLower.includes("failed"))
    return STATUS_COLORS.ERROR;
  if (statusLower.includes("exited") || statusLower.includes("stopped"))
    return STATUS_COLORS.EXITED;
  if (statusLower.includes("running")) return STATUS_COLORS.RUNNING;
  if (statusLower.includes("healthy")) return STATUS_COLORS.HEALTHY;
  return STATUS_COLORS.PENDING;
};
