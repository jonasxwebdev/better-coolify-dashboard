import { RESOURCE_TYPES } from "../constants/resourceTypes";
import { getStatusCategory, worstStatus } from "../utils/statusUtils";

const UNASSIGNED = { name: "Unassigned", uuid: null };

export const resolveServer = (resource, servers = []) => {
  const embedded = resource?.destination?.server ?? resource?.server ?? null;
  const uuid =
    embedded?.uuid ??
    resource?.server_id ??
    resource?.destination?.server_id ??
    null;

  if (uuid) {
    const match = servers.find((s) => s.uuid === uuid);
    if (match) return { name: match.name, uuid: match.uuid };
    // servers list empty/unavailable — fall back to embedded name
    if (embedded?.name) return { name: embedded.name, uuid };
    return { name: uuid, uuid };
  }
  if (embedded?.name) return { name: embedded.name, uuid: null };
  return { ...UNASSIGNED };
};

export const deployingIndex = (deployments) => {
  const set = new Set();
  if (!Array.isArray(deployments)) return set;
  for (const d of deployments) {
    const id = d?.application_uuid ?? d?.resource_uuid ?? null;
    if (id) set.add(id);
  }
  return set;
};

export const serverStats = (resources, deployingIdx = new Set()) => {
  let running = 0;
  let stopped = 0;
  let deploying = 0;
  for (const r of resources) {
    if (deployingIdx.has(r.uuid)) {
      deploying++;
      continue;
    }
    const cat = getStatusCategory(r.status);
    if (cat === "running") running++;
    else stopped++;
  }
  return {
    total: resources.length,
    running,
    stopped,
    deploying,
    worst: worstStatus(resources),
  };
};

const TYPE_BUCKETS = [
  ["applications", RESOURCE_TYPES.APPLICATION],
  ["services", RESOURCE_TYPES.SERVICE],
  ["databases", RESOURCE_TYPES.DATABASE],
];

export const groupByServer = (resources, servers = [], deployments = []) => {
  const idx = deployingIndex(deployments);

  // Bucket resources by resolved server uuid (null key = Unassigned)
  const byUuid = new Map();
  for (const r of resources) {
    const server = resolveServer(r, servers);
    const key = server.uuid ?? "__unassigned__";
    if (!byUuid.has(key)) byUuid.set(key, { server, resources: [] });
    byUuid.get(key).resources.push(r);
  }

  const buildGroup = ({ server, resources: list }) => {
    const resourcesByType = {};
    for (const [bucket, typeValue] of TYPE_BUCKETS) {
      resourcesByType[bucket] = list.filter((r) => r.type === typeValue);
    }
    return { server, resourcesByType, stats: serverStats(list, idx) };
  };

  const groups = [];
  // Ordered by the servers list first
  for (const s of servers) {
    const entry = byUuid.get(s.uuid);
    if (entry) {
      groups.push(buildGroup(entry));
      byUuid.delete(s.uuid);
    }
  }
  // Any remaining resolved-but-not-listed servers, then Unassigned last
  const remaining = [...byUuid.values()];
  const unassigned = remaining.filter((e) => e.server.uuid === null);
  const others = remaining.filter((e) => e.server.uuid !== null);
  for (const e of others) groups.push(buildGroup(e));
  for (const e of unassigned) groups.push(buildGroup(e));

  return groups;
};
