import { createElement } from "react";
import { useTranslation } from "react-i18next";
import {
  CpuChipIcon,
  ServerIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";

const formatPercent = (value) =>
  typeof value === "number" ? `${Math.round(value)}%` : "n/a";

const getMetricColor = (value) => {
  if (typeof value !== "number") return "text-muted-foreground";
  if (value >= 90) return "text-destructive";
  if (value >= 75) return "text-warning";
  return "text-success";
};

const getMetricStatusLabel = (metric, t) => {
  if (!metric) return t("serverMetrics.loading");

  switch (metric.status) {
    case "ok":
      return metric.sampledAt
        ? t("serverMetrics.live")
        : t("serverMetrics.current");
    case "disabled":
      return t("serverMetrics.disabled");
    case "unconfigured":
      return t("serverMetrics.unconfigured");
    case "token_unavailable":
      return t("serverMetrics.tokenUnavailable");
    default:
      return t("serverMetrics.unavailable");
  }
};

const ServerMetric = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 min-w-0">
    {createElement(icon, {
      className: "w-4 h-4 text-muted-foreground shrink-0",
    })}
    <span className="text-xs text-muted-foreground uppercase">{label}</span>
    <span className={`text-sm font-semibold ${getMetricColor(value)}`}>
      {formatPercent(value)}
    </span>
  </div>
);

const ServerMetricsOverview = ({ servers, serverMetrics }) => {
  const { t } = useTranslation();

  if (!servers?.length) return null;

  return (
    <section className="mb-4 md:mb-6">
      <div className="flex items-center gap-2 mb-3">
        <ServerIcon className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">
          {t("serverMetrics.title")}
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {servers.map((server) => {
          const metric = serverMetrics?.[server.uuid];
          const reachable =
            server.is_reachable ?? server.settings?.is_reachable ?? false;
          const usable =
            server.is_usable ?? server.settings?.is_usable ?? false;
          const statusLabel = getMetricStatusLabel(metric, t);

          return (
            <article
              key={server.uuid}
              className="bg-card border border-border rounded-lg px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {server.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {server.ip || server.uuid}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium shrink-0 ${
                    reachable && usable ? "text-success" : "text-warning"
                  }`}
                >
                  <SignalIcon className="w-4 h-4" />
                  {reachable && usable
                    ? t("serverMetrics.reachable")
                    : t("serverMetrics.limited")}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <ServerMetric
                  icon={CpuChipIcon}
                  label={t("serverMetrics.cpu")}
                  value={metric?.cpuPercent}
                />
                <ServerMetric
                  icon={ServerIcon}
                  label={t("serverMetrics.memory")}
                  value={metric?.memoryPercent}
                />
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                {statusLabel}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ServerMetricsOverview;
