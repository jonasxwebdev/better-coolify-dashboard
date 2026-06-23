# Group Dashboard by Server — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the type-tabbed flat resource list with a view grouped by server (type as sub-sections inside each server), and add per-card deployment/runtime stats plus a per-server rollup with a live "deploying" badge.

**Architecture:** Two new read-only Express proxy routes expose Coolify's `/servers` and `/deployments`. The Zustand store fetches them alongside resources. Pure, unit-tested helpers resolve each resource's server (by uuid, joined to the servers list), group resources, compute per-server stats, and index in-progress deployments. New presentational components (`ServerGroup`, `TypeSection`, `DeploymentStats`) wrap the existing `ResourceCard`, which is reused unchanged.

**Tech Stack:** React 19, Vite 7, Tailwind 4, Zustand 5, Express 4, axios. Tests: Vitest + jsdom + @testing-library/react (added in Task 1).

**Spec:** `docs/superpowers/specs/2026-06-23-group-by-server-design.md`

---

## File Structure

**Created:**
- `client/vitest.config.js` — Vitest config (jsdom, globals, setup file)
- `client/src/test/setup.js` — jest-dom matchers
- `client/src/services/serverGrouping.js` — pure helpers: `resolveServer`, `groupByServer`, `serverStats`, `deployingIndex`
- `client/src/services/serverGrouping.test.js` — unit tests for the above
- `client/src/utils/statusUtils.test.js` — unit tests for status helpers
- `client/src/components/resource/DeploymentStats.jsx` — per-card runtime row
- `client/src/pages/Dashboard/components/ServerGroup.jsx` — server section (header + collapse + sub-sections)
- `client/src/pages/Dashboard/components/TypeSection.jsx` — type sub-header + cards
- `client/src/pages/Dashboard/components/ServerGroup.test.jsx` — component test

**Modified:**
- `server/routes/coolify.js` — add `/servers` and `/deployments` GET routes
- `client/package.json` — test deps + scripts
- `client/src/utils/statusUtils.js` — add `getStatusCategory`, `getStatusSeverity`, `worstStatus`
- `client/src/repositories/ResourceRepository.js` — add `fetchServers`, `fetchDeployments`
- `client/src/store/resourceStore.js` — add `servers`, `deployments` state + fetch
- `client/src/components/ResourceCard/components/ResourceCardBody.jsx` — render `DeploymentStats`
- `client/src/pages/Dashboard/hooks/useDashboardState.js` — build server groups, drop tab `activeView`
- `client/src/pages/Dashboard/index.jsx` — render `ServerGroup` list instead of tabs + flat list
- `client/src/i18n/locales/en.json`, `client/src/i18n/locales/tr.json` — new keys
- `CLAUDE.md` — note server-grouping shipped, supersedes the project-grouping goal

---

## Task 1: Test infrastructure

**Files:**
- Modify: `client/package.json`
- Create: `client/vitest.config.js`, `client/src/test/setup.js`, `client/src/test/sanity.test.js`

- [ ] **Step 1: Install test dependencies**

Run from repo root:
```bash
npm install -D vitest@^2 jsdom @testing-library/react @testing-library/jest-dom @testing-library/dom -w client
```
Expected: packages added to `client/package.json` devDependencies, no errors.

- [ ] **Step 2: Create Vitest config**

Create `client/vitest.config.js`:
```js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
});
```

- [ ] **Step 3: Create test setup file**

Create `client/src/test/setup.js`:
```js
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Add test scripts**

In `client/package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a sanity test**

Create `client/src/test/sanity.test.js`:
```js
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run it**

Run: `npm run test -w client`
Expected: 1 passing test.

- [ ] **Step 7: Commit**

```bash
git add client/package.json client/package-lock.json package-lock.json client/vitest.config.js client/src/test/
git commit -m "test: add vitest + testing-library harness"
```

---

## Task 2: Server-side proxy routes for servers and deployments

**Files:**
- Modify: `server/routes/coolify.js`

These are read-only passthroughs. The `COOLIFY_TOKEN` stays server-side in `CoolifyApiClient`. They sit behind `verifyToken` (no admin — read only). `/deployments` may return `null`; normalize to `[]`.

- [ ] **Step 1: Add the routes**

Replace the contents of `server/routes/coolify.js` with:
```js
import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getCoolifyClient } from "../services/CoolifyApiClient.js";
import {
  createResourceRouter,
  RESOURCE_CONFIGS,
} from "../factories/ResourceRouterFactory.js";

const router = express.Router();

// Generic CRUD routers per resource type (factory pattern)
router.use("/", createResourceRouter("applications", RESOURCE_CONFIGS.applications));
router.use("/", createResourceRouter("services", RESOURCE_CONFIGS.services));
router.use("/", createResourceRouter("databases", RESOURCE_CONFIGS.databases));

// Read-only: list servers (for grouping + canonical names)
router.get("/servers", verifyToken, async (req, res, next) => {
  try {
    const data = await getCoolifyClient().get("/servers");
    res.json(Array.isArray(data) ? data : []);
  } catch (error) {
    next(error);
  }
});

// Read-only: list currently-running deployments (for live "deploying" badge)
router.get("/deployments", verifyToken, async (req, res, next) => {
  try {
    const data = await getCoolifyClient().get("/deployments");
    res.json(Array.isArray(data) ? data : []);
  } catch (error) {
    next(error);
  }
});

export default router;
```

- [ ] **Step 2: Verify the server still boots**

Run: `node --check server/routes/coolify.js`
Expected: no output (syntax OK).

- [ ] **Step 3: Manual smoke test (requires a running instance with env)**

With the dev server running and a valid JWT in `localStorage`, the client will exercise these in Task 6. For a standalone check, run the server and curl:
```bash
curl -s -H "Authorization: Bearer $JWT" http://localhost:5000/api/coolify/servers | head -c 200
```
Expected: a JSON array (e.g. `[{"name":"localhost",...}]`). Skip if no instance is available — Task 6 covers integration.

- [ ] **Step 4: Commit**

```bash
git add server/routes/coolify.js
git commit -m "feat(server): add read-only /servers and /deployments proxy routes"
```

---

## Task 3: Status helpers (category, severity, worst)

**Files:**
- Modify: `client/src/utils/statusUtils.js`
- Create: `client/src/utils/statusUtils.test.js`

Coolify status strings look like `"running:healthy"`, `"exited"`, `"running:unhealthy"`, `"error"`, or `null`.

- [ ] **Step 1: Write failing tests**

Create `client/src/utils/statusUtils.test.js`:
```js
import { describe, it, expect } from "vitest";
import {
  getStatusCategory,
  getStatusSeverity,
  worstStatus,
} from "./statusUtils";

describe("getStatusCategory", () => {
  it("maps running variants to 'running'", () => {
    expect(getStatusCategory("running:healthy")).toBe("running");
    expect(getStatusCategory("running")).toBe("running");
  });
  it("maps exited/stopped to 'stopped'", () => {
    expect(getStatusCategory("exited")).toBe("stopped");
    expect(getStatusCategory("stopped")).toBe("stopped");
  });
  it("maps error/failed to 'error'", () => {
    expect(getStatusCategory("error")).toBe("error");
    expect(getStatusCategory("failed:x")).toBe("error");
  });
  it("maps null/unknown to 'unknown'", () => {
    expect(getStatusCategory(null)).toBe("unknown");
    expect(getStatusCategory("weird")).toBe("pending");
  });
});

describe("getStatusSeverity", () => {
  it("ranks error highest, running lowest non-zero", () => {
    expect(getStatusSeverity("error")).toBeGreaterThan(getStatusSeverity("exited"));
    expect(getStatusSeverity("exited")).toBeGreaterThan(getStatusSeverity("running:healthy"));
  });
});

describe("worstStatus", () => {
  it("returns the most severe status string among resources", () => {
    const resources = [
      { status: "running:healthy" },
      { status: "exited" },
      { status: "running:healthy" },
    ];
    expect(worstStatus(resources)).toBe("exited");
  });
  it("returns null for empty input", () => {
    expect(worstStatus([])).toBe(null);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -w client -- statusUtils`
Expected: FAIL — `getStatusCategory is not a function`.

- [ ] **Step 3: Implement**

Append to `client/src/utils/statusUtils.js`:
```js
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -w client -- statusUtils`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/statusUtils.js client/src/utils/statusUtils.test.js
git commit -m "feat: add status category/severity/worst helpers"
```

---

## Task 4: Server resolution + grouping + stats helpers

**Files:**
- Create: `client/src/services/serverGrouping.js`, `client/src/services/serverGrouping.test.js`

Server link differs by type (verified): apps/dbs → `destination.server`; services → `server` / `server_id`. Resolve by uuid, join to the `servers` list for the canonical name. Unresolved → "Unassigned".

- [ ] **Step 1: Write failing tests**

Create `client/src/services/serverGrouping.test.js`:
```js
import { describe, it, expect } from "vitest";
import {
  resolveServer,
  deployingIndex,
  serverStats,
  groupByServer,
} from "./serverGrouping";

const servers = [
  { name: "localhost", uuid: "srv-1" },
  { name: "edge", uuid: "srv-2" },
];

describe("resolveServer", () => {
  it("resolves apps/dbs via destination.server.uuid", () => {
    const r = { destination: { server: { uuid: "srv-1", name: "localhost" } } };
    expect(resolveServer(r, servers)).toEqual({ name: "localhost", uuid: "srv-1" });
  });
  it("resolves services via server.uuid", () => {
    const r = { server: { uuid: "srv-2" } };
    expect(resolveServer(r, servers)).toEqual({ name: "edge", uuid: "srv-2" });
  });
  it("resolves services via server_id when server object is empty", () => {
    const r = { server: { uuid: null }, server_id: "srv-2" };
    expect(resolveServer(r, servers).uuid).toBe("srv-2");
  });
  it("falls back to embedded name when servers list is empty", () => {
    const r = { destination: { server: { uuid: "x", name: "ghost" } } };
    expect(resolveServer(r, [])).toEqual({ name: "ghost", uuid: "x" });
  });
  it("returns Unassigned when nothing resolves", () => {
    expect(resolveServer({}, servers)).toEqual({ name: "Unassigned", uuid: null });
  });
});

describe("deployingIndex", () => {
  it("collects resource uuids from deployment entries", () => {
    const deps = [
      { application_uuid: "a1", status: "in_progress" },
      { resource_uuid: "d2" },
    ];
    const idx = deployingIndex(deps);
    expect(idx.has("a1")).toBe(true);
    expect(idx.has("d2")).toBe(true);
    expect(idx.has("nope")).toBe(false);
  });
  it("handles null/empty", () => {
    expect(deployingIndex(null).size).toBe(0);
  });
});

describe("serverStats", () => {
  it("counts running/stopped/deploying and picks worst status", () => {
    const resources = [
      { uuid: "a1", status: "running:healthy" },
      { uuid: "a2", status: "exited" },
      { uuid: "a3", status: "running:healthy" },
    ];
    const idx = new Set(["a3"]);
    const stats = serverStats(resources, idx);
    expect(stats.total).toBe(3);
    expect(stats.running).toBe(1); // a1 (a3 is deploying)
    expect(stats.stopped).toBe(1); // a2
    expect(stats.deploying).toBe(1); // a3
    expect(stats.worst).toBe("exited");
  });
});

describe("groupByServer", () => {
  const resources = [
    { uuid: "a1", type: "application", status: "running:healthy", destination: { server: { uuid: "srv-1" } } },
    { uuid: "s1", type: "service", status: "running:healthy", server: { uuid: "srv-2" } },
    { uuid: "d1", type: "database", status: "exited", destination: { server: { uuid: "srv-1" } } },
  ];

  it("groups resources by server, ordered by the servers list", () => {
    const groups = groupByServer(resources, servers, []);
    expect(groups.map((g) => g.server.name)).toEqual(["localhost", "edge"]);
  });
  it("splits resources into type buckets", () => {
    const groups = groupByServer(resources, servers, []);
    const localhost = groups.find((g) => g.server.uuid === "srv-1");
    expect(localhost.resourcesByType.applications.map((r) => r.uuid)).toEqual(["a1"]);
    expect(localhost.resourcesByType.databases.map((r) => r.uuid)).toEqual(["d1"]);
    expect(localhost.resourcesByType.services).toEqual([]);
  });
  it("omits servers that have no resources", () => {
    const groups = groupByServer([resources[0]], servers, []);
    expect(groups.map((g) => g.server.name)).toEqual(["localhost"]);
  });
  it("puts Unassigned resources in a trailing group", () => {
    const orphan = { uuid: "o1", type: "application", status: "running" };
    const groups = groupByServer([orphan], servers, []);
    expect(groups[groups.length - 1].server.name).toBe("Unassigned");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -w client -- serverGrouping`
Expected: FAIL — module not found / functions undefined.

- [ ] **Step 3: Implement**

Create `client/src/services/serverGrouping.js`:
```js
import { RESOURCE_TYPES } from "../constants/resourceTypes";
import { getStatusCategory, worstStatus } from "../utils/statusUtils";

const UNASSIGNED = { name: "Unassigned", uuid: null };

export const resolveServer = (resource, servers = []) => {
  const embedded =
    resource?.destination?.server ?? resource?.server ?? null;
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -w client -- serverGrouping`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add client/src/services/serverGrouping.js client/src/services/serverGrouping.test.js
git commit -m "feat: add server resolution, grouping, stats helpers"
```

---

## Task 5: Data layer — fetch servers + deployments

**Files:**
- Modify: `client/src/repositories/ResourceRepository.js`
- Modify: `client/src/store/resourceStore.js`

- [ ] **Step 1: Write failing repository test**

Create `client/src/repositories/ResourceRepository.test.js`:
```js
import { describe, it, expect, vi } from "vitest";
import { ResourceRepository } from "./ResourceRepository";

describe("ResourceRepository extras", () => {
  it("fetchServers returns the array from the client", async () => {
    const client = { get: vi.fn().mockResolvedValue([{ name: "localhost", uuid: "s1" }]) };
    const repo = new ResourceRepository(client);
    const servers = await repo.fetchServers();
    expect(client.get).toHaveBeenCalledWith("/servers");
    expect(servers).toEqual([{ name: "localhost", uuid: "s1" }]);
  });
  it("fetchDeployments returns [] on error", async () => {
    const client = { get: vi.fn().mockRejectedValue(new Error("boom")) };
    const repo = new ResourceRepository(client);
    expect(await repo.fetchDeployments()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -w client -- ResourceRepository`
Expected: FAIL — `fetchServers is not a function`.

- [ ] **Step 3: Implement repository methods**

In `client/src/repositories/ResourceRepository.js`, add these methods inside the class (after `fetchDatabases`):
```js
  async fetchServers() {
    try {
      const data = await this.client.get("/servers");
      return data || [];
    } catch (error) {
      console.warn("Failed to fetch servers:", error);
      return [];
    }
  }

  async fetchDeployments() {
    try {
      const data = await this.client.get("/deployments");
      return data || [];
    } catch (error) {
      console.warn("Failed to fetch deployments:", error);
      return [];
    }
  }
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -w client -- ResourceRepository`
Expected: PASS.

- [ ] **Step 5: Add servers + deployments to the store**

In `client/src/store/resourceStore.js`:

(a) Add to the initial state object (next to `databases: []`):
```js
  servers: [],
  deployments: [],
```

(b) In `fetchResources`, replace the line:
```js
      const allResources = await resourceRepository.fetchAll();
```
with:
```js
      const [allResources, servers, deployments] = await Promise.all([
        resourceRepository.fetchAll(),
        resourceRepository.fetchServers(),
        resourceRepository.fetchDeployments(),
      ]);
```

(c) In the same function, add `servers` and `deployments` to the `set({ ... })` call that sets applications/services/databases:
```js
      set({
        applications,
        services,
        databases,
        servers,
        deployments,
        loading: false,
      });
```

- [ ] **Step 6: Verify nothing broke**

Run: `npm run test -w client && npm run lint -w client`
Expected: tests pass, lint clean.

- [ ] **Step 7: Commit**

```bash
git add client/src/repositories/ResourceRepository.js client/src/repositories/ResourceRepository.test.js client/src/store/resourceStore.js
git commit -m "feat: fetch servers and deployments into the store"
```

---

## Task 6: DeploymentStats component + card integration

**Files:**
- Create: `client/src/components/resource/DeploymentStats.jsx`
- Modify: `client/src/components/ResourceCard/components/ResourceCardBody.jsx`

The component shows real fields: `git_commit_sha` (short), `last_online_at`, `last_restart_at` + `last_restart_type`, `restart_count`, and a live "deploying" badge when `isDeploying`. Reuses `getTimeAgo` from `dateUtils`. Services (no `last_online_at`) simply render fewer fields — the component shows only the fields present.

- [ ] **Step 1: Write a render test**

Create `client/src/components/resource/DeploymentStats.test.jsx`:
```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DeploymentStats from "./DeploymentStats";

describe("DeploymentStats", () => {
  it("renders commit and restart count when present", () => {
    render(
      <DeploymentStats
        resource={{ git_commit_sha: "a1b2c3d4e5", restart_count: 3 }}
        isDeploying={false}
      />
    );
    expect(screen.getByText(/a1b2c3d/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("shows a deploying badge when isDeploying", () => {
    render(<DeploymentStats resource={{}} isDeploying={true} />);
    expect(screen.getByText(/deploying/i)).toBeInTheDocument();
  });

  it("renders nothing meaningful when no fields and not deploying", () => {
    const { container } = render(
      <DeploymentStats resource={{}} isDeploying={false} />
    );
    expect(container.textContent).not.toMatch(/deploying/i);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -w client -- DeploymentStats`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

Create `client/src/components/resource/DeploymentStats.jsx`:
```jsx
import { useTranslation } from "react-i18next";
import { RocketLaunchIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { getTimeAgo } from "../../utils/dateUtils";

const Field = ({ label, value }) =>
  value === null || value === undefined || value === "" ? null : (
    <span className="text-xs md:text-sm text-slate-300">
      <span className="text-slate-500">{label}:</span>{" "}
      <span className="font-mono text-slate-200">{value}</span>
    </span>
  );

const DeploymentStats = ({ resource, isDeploying }) => {
  const { t } = useTranslation();

  const commit = resource.git_commit_sha
    ? resource.git_commit_sha.substring(0, 7)
    : null;
  const onlineSince = getTimeAgo(resource.last_online_at);
  const lastRestart = getTimeAgo(resource.last_restart_at);
  const restartType = resource.last_restart_type;
  const restartCount =
    typeof resource.restart_count === "number" ? resource.restart_count : null;

  return (
    <div className="bg-slate-900/50 rounded-lg p-3 md:p-4 border border-blue-500/30">
      <div className="flex items-center gap-2 mb-2 md:mb-3">
        <RocketLaunchIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
        <span className="text-sm font-semibold text-white">
          {t("deployment.title")}
        </span>
        {isDeploying && (
          <span className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-300 border border-blue-500/40 rounded-full px-2 py-0.5 text-xs">
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            {t("deployment.deploying")}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 bg-slate-800/50 px-3 py-2 rounded">
        <Field label={t("deployment.commit")} value={commit} />
        <Field label={t("deployment.onlineSince")} value={onlineSince} />
        <Field
          label={t("deployment.lastRestart")}
          value={
            lastRestart
              ? restartType
                ? `${lastRestart} · ${restartType}`
                : lastRestart
              : null
          }
        />
        <Field label={t("deployment.restarts")} value={restartCount} />
      </div>
    </div>
  );
};

export default DeploymentStats;
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -w client -- DeploymentStats`
Expected: PASS.

- [ ] **Step 5: Render it inside the card body**

In `client/src/components/ResourceCard/components/ResourceCardBody.jsx`, add the import at the top:
```jsx
import DeploymentStats from "../../resource/DeploymentStats";
import useResourceStore from "../../../store/resourceStore";
import { deployingIndex } from "../../../services/serverGrouping";
```
Then inside the component, before `return`, compute the deploying flag:
```jsx
  const deployments = useResourceStore((s) => s.deployments);
  const isDeploying = deployingIndex(deployments).has(resource.uuid);
```
And add `DeploymentStats` right after the `<ResourceDetails resource={resource} />` line:
```jsx
      <div className="mt-4">
        <DeploymentStats resource={resource} isDeploying={isDeploying} />
      </div>
```

- [ ] **Step 6: Verify**

Run: `npm run test -w client && npm run lint -w client`
Expected: pass + clean.

- [ ] **Step 7: Commit**

```bash
git add client/src/components/resource/DeploymentStats.jsx client/src/components/resource/DeploymentStats.test.jsx client/src/components/ResourceCard/components/ResourceCardBody.jsx
git commit -m "feat: per-card deployment/runtime stats row"
```

---

## Task 7: ServerGroup + TypeSection components

**Files:**
- Create: `client/src/pages/Dashboard/components/TypeSection.jsx`
- Create: `client/src/pages/Dashboard/components/ServerGroup.jsx`
- Create: `client/src/pages/Dashboard/components/ServerGroup.test.jsx`

- [ ] **Step 1: Write the ServerGroup test**

Create `client/src/pages/Dashboard/components/ServerGroup.test.jsx`:
```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ServerGroup from "./ServerGroup";

// i18n + sounds are used by nested cards; stub the section to test the header only
const group = {
  server: { name: "localhost", uuid: "srv-1" },
  resourcesByType: { applications: [], services: [], databases: [] },
  stats: { total: 4, running: 3, stopped: 1, deploying: 0, worst: "exited" },
};

describe("ServerGroup header", () => {
  it("shows server name and rollup counts", () => {
    render(<ServerGroup group={group} />);
    expect(screen.getByText("localhost")).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument(); // running count
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -w client -- ServerGroup`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement TypeSection**

Create `client/src/pages/Dashboard/components/TypeSection.jsx`:
```jsx
import ResourceCard from "../../../components/ResourceCard";

const TypeSection = ({ label, resources }) => {
  if (!resources || resources.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="text-xs font-bold uppercase tracking-wider text-indigo-300/80 px-1 mb-2">
        {label} ({resources.length})
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {resources.map((resource, index) => (
          <ResourceCard
            key={resource.uuid || resource.id || index}
            resource={resource}
          />
        ))}
      </div>
    </div>
  );
};

export default TypeSection;
```

- [ ] **Step 4: Implement ServerGroup**

Create `client/src/pages/Dashboard/components/ServerGroup.jsx`:
```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ServerIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import TypeSection from "./TypeSection";
import { getStatusColor } from "../../../utils/statusUtils";

const ServerGroup = ({ group }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const { server, resourcesByType, stats } = group;
  const dotColor = getStatusColor(stats.worst);

  return (
    <div className="mb-6 border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer text-left"
      >
        <span className={`w-3 h-3 rounded-full ${dotColor}`} />
        <ServerIcon className="w-5 h-5 text-pink-400" />
        <span className="font-bold text-foreground">{server.name}</span>
        <span className="text-xs text-muted-foreground">
          · {stats.total} {t("serverView.resources")}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-md bg-card border border-border text-green-300">
            ● {stats.running} {t("serverView.running")}
          </span>
          {stats.stopped > 0 && (
            <span className="text-xs px-2 py-1 rounded-md bg-card border border-border text-orange-300">
              ● {stats.stopped} {t("serverView.stopped")}
            </span>
          )}
          <span className="text-xs px-2 py-1 rounded-md bg-card border border-blue-500/40 text-blue-300 inline-flex items-center gap-1">
            {stats.deploying > 0 && <ArrowPathIcon className="w-3 h-3 animate-spin" />}
            ⟳ {stats.deploying} {t("serverView.deploying")}
          </span>
          {open ? (
            <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="p-3 md:p-4">
          <TypeSection label={t("dashboard.applications")} resources={resourcesByType.applications} />
          <TypeSection label={t("dashboard.services")} resources={resourcesByType.services} />
          <TypeSection label={t("dashboard.databases")} resources={resourcesByType.databases} />
        </div>
      )}
    </div>
  );
};

export default ServerGroup;
```

- [ ] **Step 5: Run to verify pass**

Run: `npm run test -w client -- ServerGroup`
Expected: PASS (header renders name + counts; empty type sections render nothing).

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/Dashboard/components/TypeSection.jsx client/src/pages/Dashboard/components/ServerGroup.jsx client/src/pages/Dashboard/components/ServerGroup.test.jsx
git commit -m "feat: ServerGroup and TypeSection components"
```

---

## Task 8: Wire grouping into the dashboard

**Files:**
- Modify: `client/src/pages/Dashboard/hooks/useDashboardState.js`
- Modify: `client/src/pages/Dashboard/index.jsx`

Search filters resources across servers (reuse `searchResources`); sort applies within each type sub-section (reuse `sortResources`). The tab `activeView` is removed.

- [ ] **Step 1: Update the hook to produce server groups**

In `client/src/pages/Dashboard/hooks/useDashboardState.js`:

(a) Update imports at the top:
```js
import { useState, useEffect, useMemo } from "react";
import useResourceStore from "../../../store/resourceStore";
import {
  filterDashboardResources,
  searchResources,
  sortResources,
} from "../../../services/resourceService";
import { groupByServer } from "../../../services/serverGrouping";
```

(b) Pull `servers` and `deployments` from the store destructure:
```js
  const {
    applications: storeApplications,
    services: storeServices,
    databases: storeDatabases,
    servers,
    deployments,
    loading,
    error,
    fetchResources,
    cleanup,
  } = useResourceStore();
```

(c) Remove the `activeView` state line (`const [activeView, setActiveView] = useState("applications");`).

(d) Replace the `filteredResources` memo with grouping logic. After the `allResources` memo, add:
```js
  const searchedResources = useMemo(
    () => searchResources(allResources, searchTerm),
    [allResources, searchTerm]
  );

  const sortedResources = useMemo(
    () => sortResources(searchedResources, sortBy, sortOrder),
    [searchedResources, sortBy, sortOrder]
  );

  const serverGroups = useMemo(
    () => groupByServer(sortedResources, servers, deployments),
    [sortedResources, servers, deployments]
  );
```
(Sorting before grouping preserves order inside each type bucket, since `groupByServer` filters but does not reorder.)

(e) In the returned object: remove `activeView`, `setActiveView`, and `filteredResources`; add `serverGroups`. Keep `resourceCounts` as-is. The returned object's `resourceCounts` block stays unchanged.

- [ ] **Step 2: Update the Dashboard page**

In `client/src/pages/Dashboard/index.jsx`:

(a) Replace the imports of `ResourceList` and `ResourceTabs` with:
```js
import ServerGroup from "./components/ServerGroup";
```
(remove the `ResourceList` and `ResourceTabs` import lines).

(b) Update the `useDashboardState()` destructure: remove `activeView`, `setActiveView`, `filteredResources`, `resourceCounts`; add `serverGroups`.

(c) Replace the "Tabs + Refresh Button" block (the `<div>` containing `<ResourceTabs ... />` and the refresh button) so only the refresh button remains in that row — delete the `<ResourceTabs .../>` element. Keep the refresh `<button>` exactly as-is.

(d) Replace the `<ResourceList ... />` element with:
```jsx
        {serverGroups.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <p className="text-muted-foreground text-sm">
              {t("dashboard.noResources")}
            </p>
          </div>
        ) : (
          serverGroups.map((group) => (
            <ServerGroup key={group.server.uuid || group.server.name} group={group} />
          ))
        )}
```

- [ ] **Step 3: Build to verify it compiles**

Run: `npm run build -w client`
Expected: build succeeds with no unresolved imports.

- [ ] **Step 4: Run tests + lint**

Run: `npm run test -w client && npm run lint -w client`
Expected: pass + clean. (If lint flags the now-unused `ResourceList.jsx`/`ResourceTabs.jsx` files, leave them — they are simply no longer imported; removal is optional cleanup in Task 10.)

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Dashboard/hooks/useDashboardState.js client/src/pages/Dashboard/index.jsx
git commit -m "feat: render dashboard grouped by server"
```

---

## Task 9: i18n keys

**Files:**
- Modify: `client/src/i18n/locales/en.json`, `client/src/i18n/locales/tr.json`

- [ ] **Step 1: Add English keys**

In `client/src/i18n/locales/en.json`, add these two top-level objects (merge alongside existing top-level keys like `dashboard`, `common`):
```json
"serverView": {
  "resources": "resources",
  "running": "running",
  "stopped": "stopped",
  "deploying": "deploying"
},
"deployment": {
  "title": "Deployment / Runtime",
  "deploying": "deploying…",
  "commit": "Commit",
  "onlineSince": "Online since",
  "lastRestart": "Last restart",
  "restarts": "Restarts"
}
```

- [ ] **Step 2: Add Turkish keys**

In `client/src/i18n/locales/tr.json`, add:
```json
"serverView": {
  "resources": "kaynak",
  "running": "çalışıyor",
  "stopped": "durduruldu",
  "deploying": "dağıtılıyor"
},
"deployment": {
  "title": "Dağıtım / Çalışma",
  "deploying": "dağıtılıyor…",
  "commit": "Commit",
  "onlineSince": "Çevrimiçi",
  "lastRestart": "Son yeniden başlatma",
  "restarts": "Yeniden başlatma"
}
```

- [ ] **Step 3: Verify JSON validity + build**

Run: `node -e "require('./client/src/i18n/locales/en.json'); require('./client/src/i18n/locales/tr.json'); console.log('ok')" && npm run build -w client`
Expected: prints `ok`, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add client/src/i18n/locales/en.json client/src/i18n/locales/tr.json
git commit -m "i18n: add server-view and deployment labels"
```

---

## Task 10: Update CLAUDE.md + optional cleanup

**Files:**
- Modify: `CLAUDE.md`
- Delete (optional): `client/src/pages/Dashboard/components/ResourceList.jsx`, `client/src/pages/Dashboard/components/ResourceTabs.jsx`

- [ ] **Step 1: Update CLAUDE.md**

In `CLAUDE.md`, under "Primary goal for this fork", add a note at the top of that section:
```markdown
> **Update (2026-06-23):** Shipped a "group by **server**" view that replaces the
> type-tabbed flat list (server → type sub-sections → full detail cards) with
> per-card deployment/runtime stats and a per-server rollup. See
> `docs/superpowers/specs/2026-06-23-group-by-server-design.md`. The original
> "group by Coolify **project**" idea is deferred.
```

- [ ] **Step 2: Optional — remove now-unused components**

Only if no remaining import references them (the grouped view replaced both):
```bash
grep -rl "ResourceTabs\|Dashboard/components/ResourceList" client/src || echo "no references"
```
If `no references`, delete them:
```bash
git rm client/src/pages/Dashboard/components/ResourceList.jsx client/src/pages/Dashboard/components/ResourceTabs.jsx
```

- [ ] **Step 3: Final full verification**

Run: `npm run test -w client && npm run lint -w client && npm run build -w client`
Expected: all tests pass, lint clean, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: note server-grouping view in CLAUDE.md"
```

---

## Self-Review Notes (for the implementer)

- **Deployments field mapping is an assumption.** `deployingIndex` reads
  `application_uuid` / `resource_uuid` because `/deployments` was empty at design
  time. When a real deployment is running, confirm the actual reference field
  against the live response and adjust the single line in `deployingIndex` if
  needed (the test pins the contract). Everything else is verified.
- **Single-server instances** (the current real setup) render one `ServerGroup` —
  expected and fine.
- **Search/sort:** search hides empty sections automatically (a server with no
  matching resources produces no group); sort runs before grouping so order is
  preserved within each type bucket.
