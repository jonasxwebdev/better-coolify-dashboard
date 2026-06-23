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

export const getStatusCategory = (status) => {
  if (!status) return "unknown";
  const s = status.toLowerCase();
  if (s.includes("error") || s.includes("failed")) return "error";
  if (s.includes("exited") || s.includes("stopped") || s.includes("dead"))
    return "stopped";
  if (s.includes("running") || s.includes("healthy")) return "running";
  return "pending";
};

const SEVERITY = { error: 4, stopped: 3, pending: 2, running: 1, unknown: 0 };

export const getStatusSeverity = (status) =>
  SEVERITY[getStatusCategory(status)] ?? 0;

export const worstStatus = (resources) => {
  if (!resources || resources.length === 0) return null;
  return resources.reduce((worst, r) => {
    if (worst === null) return r.status ?? null;
    return getStatusSeverity(r.status) > getStatusSeverity(worst)
      ? r.status ?? worst
      : worst;
  }, null);
};
