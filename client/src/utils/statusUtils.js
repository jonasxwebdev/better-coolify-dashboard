export const STATUS_COLORS = {
  RUNNING: "bg-success",
  HEALTHY: "bg-success",
  ERROR: "bg-destructive",
  FAILED: "bg-destructive",
  EXITED: "bg-muted-foreground",
  STOPPED: "bg-muted-foreground",
  PENDING: "bg-warning",
  DEFAULT: "bg-muted-foreground",
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
