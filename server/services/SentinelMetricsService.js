import axios from "axios";

const SENTINEL_TIMEOUT_MS = 5000;

const metricClient = axios.create({
  timeout: SENTINEL_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toIsoTime = (value) => {
  const number = toNumber(value);
  if (!number) return null;
  return new Date(number).toISOString();
};

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

const getServerSetting = (server, key) => server?.settings?.[key];

const getSentinelToken = (server) => getServerSetting(server, "sentinel_token");

const getMetricsEnabled = (server) =>
  Boolean(getServerSetting(server, "is_metrics_enabled"));

const replaceTemplateValues = (template, server) =>
  template
    .replaceAll("{uuid}", encodeURIComponent(server.uuid || ""))
    .replaceAll("{ip}", encodeURIComponent(server.ip || ""))
    .replaceAll("{name}", encodeURIComponent(server.name || ""))
    .replaceAll("{port}", encodeURIComponent(server.port || ""));

const getSentinelBaseUrl = (server) => {
  const template =
    process.env.SENTINEL_BASE_URL_TEMPLATE ||
    process.env.COOLIFY_SENTINEL_BASE_URL_TEMPLATE;

  if (template) {
    return stripTrailingSlash(replaceTemplateValues(template, server));
  }

  const singleServerUrl =
    process.env.SENTINEL_BASE_URL || process.env.COOLIFY_SENTINEL_BASE_URL;

  return singleServerUrl ? stripTrailingSlash(singleServerUrl) : null;
};

const buildSentinelUrl = (baseUrl, endpoint) => {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  if (baseUrl.endsWith("/api")) {
    return `${baseUrl}${normalizedEndpoint}`;
  }

  return `${baseUrl}/api${normalizedEndpoint}`;
};

const unavailable = (server, status, message) => ({
  uuid: server.uuid,
  status,
  message,
  metricsEnabled: getMetricsEnabled(server),
  sampledAt: null,
  updatedAt: new Date().toISOString(),
  cpuPercent: null,
  memoryPercent: null,
  memoryUsedBytes: null,
  memoryTotalBytes: null,
});

export const sanitizeServer = (server) => {
  const { settings, ...safeServer } = server;

  return {
    ...safeServer,
    settings: settings
      ? {
          is_metrics_enabled: Boolean(settings.is_metrics_enabled),
          is_reachable: Boolean(settings.is_reachable),
          is_usable: Boolean(settings.is_usable),
          is_sentinel_enabled: Boolean(settings.is_sentinel_enabled),
        }
      : null,
  };
};

export const fetchCurrentServerMetrics = async (server) => {
  if (!getMetricsEnabled(server)) {
    return unavailable(
      server,
      "disabled",
      "Metrics are disabled for this server.",
    );
  }

  const token = getSentinelToken(server);
  if (!token) {
    return unavailable(
      server,
      "token_unavailable",
      "Sentinel token is unavailable. The Coolify token likely needs read:sensitive.",
    );
  }

  const baseUrl = getSentinelBaseUrl(server);
  if (!baseUrl) {
    return unavailable(
      server,
      "unconfigured",
      "Set SENTINEL_BASE_URL or SENTINEL_BASE_URL_TEMPLATE to read live metrics.",
    );
  }

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const [cpuResponse, memoryResponse] = await Promise.all([
      metricClient.get(buildSentinelUrl(baseUrl, "/cpu/current"), { headers }),
      metricClient.get(buildSentinelUrl(baseUrl, "/memory/current"), {
        headers,
      }),
    ]);

    const cpu = cpuResponse.data || {};
    const memory = memoryResponse.data || {};
    const sampledAt = toIsoTime(cpu.time || memory.time);

    return {
      uuid: server.uuid,
      status: "ok",
      message: null,
      metricsEnabled: true,
      sampledAt,
      updatedAt: new Date().toISOString(),
      cpuPercent: toNumber(cpu.percent),
      memoryPercent: toNumber(memory.usedPercent),
      memoryUsedBytes: toNumber(memory.used),
      memoryTotalBytes: toNumber(memory.total),
    };
  } catch (error) {
    return unavailable(
      server,
      "unavailable",
      error.response?.status === 401
        ? "Sentinel rejected the token."
        : "Sentinel metrics are unavailable.",
    );
  }
};

export const fetchCurrentMetricsForServers = async (servers) => {
  const metrics = await Promise.all(servers.map(fetchCurrentServerMetrics));

  return metrics.reduce((byUuid, metric) => {
    byUuid[metric.uuid] = metric;
    return byUuid;
  }, {});
};
