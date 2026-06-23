# Group Dashboard by Server — Design Spec

**Date:** 2026-06-23
**Status:** Approved (pending implementation plan)
**Supersedes:** the "group by Coolify project" primary goal in `CLAUDE.md` (deferred — see Out of Scope)

## Goal

Replace the dashboard's flat, type-tabbed resource list with a view **grouped by
server**. Each server is a section containing type sub-sections (Applications /
Services / Databases), and within those the **existing full-width detailed
resource cards, unchanged**. Add **deployment / runtime stats** at two levels: a
per-card runtime row and a per-server rollup, plus a live "deploying now"
indicator.

This is verified against the live Coolify API (see API Findings) — not the docs,
which `CLAUDE.md` notes have been wrong about response shapes before.

## API Findings (verified 2026-06-23 against the live instance)

Probed `/api/v1/{applications,services,databases,deployments,servers}`:

- **Server link differs by resource type:**
  - Applications → `destination.server` → `{ name, uuid }`
  - Databases → `destination.server` → `{ name, uuid }`
  - **Services have no `destination`.** They carry `server` (object) and
    `server_id` directly. `services[0].destination.server` returned `null`.
- **`/api/v1/servers`** returns a clean list: `[{ name, uuid, ... }]`. The test
  instance has one server, `localhost` (uuid `yiv9nahm0h8dp48up1z2hn8e`).
- **`/api/v1/deployments`** returned `null`/empty — it lists **currently running**
  deployments only. There is **no** historical "last deployment success/failed/
  duration" in the list endpoints. Therefore deployment stats use real per-resource
  fields plus the live running-deployments list.
- **Real per-resource fields available** for the runtime row:
  - Applications: `status`, `server_status`, `git_commit_sha`, `git_branch`,
    `last_online_at`, `last_restart_at`, `last_restart_type`, `restart_count`.
  - Databases: `status`, `server_status`, `last_online_at`, `started_at`,
    `last_restart_at`, `last_restart_type`, `restart_count`.
  - Services: `status`, `server_status`, plus nested `applications` / `databases`
    (sub-components). Leaner — no `last_online_at`.

## Decisions (from brainstorming)

1. **Replace** the type-tabs entirely. Server is the primary structure; type
   becomes sub-sections. (User chose "B".)
2. **Full-width detailed cards preserved** — the grouping only adds headers above
   the existing `ResourceCard`; card detail is unchanged.
3. **Deployment stats = option A:** real per-resource fields + server rollup +
   live deploying badge. No dependency on undocumented history endpoints.

## Layout

```
[ search ] [ sort ]                                   [ refresh ]

🖥 localhost   · 4 resources    ● 3 running  ● 1 stopped  ⟳ 0 deploying   [▾]
  APPLICATIONS (2)
    ┌─ full-width ResourceCard (unchanged) ─────────────────────────┐
    │  header: status badge, action buttons                         │
    │  details grid: git, docker image, server, ports …             │
    │  + DeploymentStats row: commit · online-since · last-restart  │
    │                          · restart-count · [deploying badge]  │
    └───────────────────────────────────────────────────────────────┘
  SERVICES (1)
    … full cards …
  DATABASES (1)
    … full cards …

🖥 second-server …   [▸ collapsed]
```

- Server sections are **collapsible**, expanded by default.
- Single-server instances render one section; type sub-sections still apply.
- **Search** filters resources across all servers; server sections and type
  sub-sections with no matching resources are hidden.
- **Sort** applies within each type sub-section (reuses current sort options).
- The server **health dot** = worst status among that server's resources.

## Architecture

### Server-side (Express)

Add two **read-only** proxied GET routes, behind `verifyToken` only (no admin —
these are read operations). The `COOLIFY_TOKEN` stays server-side, consistent with
`CoolifyApiClient`. These are read-only, so they do **not** belong in the CRUD
`ResourceRouterFactory`; add them directly in `server/routes/coolify.js`.

- `GET /api/coolify/servers` → `coolify.get("/servers")`
- `GET /api/coolify/deployments` → `coolify.get("/deployments")` (normalize a
  `null` body to `[]` before responding)

### Client-side

**Store** (`client/src/store/resourceStore.js`):
- Add `servers` and `deployments` to state; fetch them in the same cycle as
  applications/services/databases (extend `fetchResources`). Normalize
  `deployments` to `[]`.

**Pure helpers** (new, unit-tested — no React):
- `resolveServer(resource, servers)` → `{ name, uuid }`. Resolution order:
  `resource.destination?.server?.uuid` → `resource.server?.uuid` →
  `resource.server_id` → `resource.destination?.server_id`. Join the uuid to the
  `servers` list for the canonical name. Unresolved → `{ name: "Unassigned",
  uuid: null }`. If `servers` is empty/unavailable, fall back to
  `resource.destination?.server?.name ?? resource.server?.name`.
- `groupByServer(resources, servers, deployments)` → ordered array of
  `{ server, resourcesByType: { applications, services, databases }, stats }`.
  Server order follows the `/servers` list; "Unassigned" last.
- `worstStatus(resources)` → the most severe status string, ranked
  error/failed > exited/stopped > pending > running/healthy > unknown.
- `deployingIndex(deployments)` → `Set<resourceUuid>` of resources with an
  in-progress deployment (map each deployment entry to its resource uuid; exact
  field confirmed at implementation against a live running deploy, default to the
  documented application reference).

**Utils:**
- `statusUtils.js`: add `getStatusSeverity(status)` ranking + `worstStatus()`
  helper; reuse existing `getStatusColor` for the dot.
- `dateUtils.js`: add a relative-time formatter ("2d ago") for `last_online_at` /
  `last_restart_at` if not already present.

**New components:**
- `ServerGroup` — server header (name, health dot, rollup chips, collapse toggle)
  wrapping its type sub-sections.
- `TypeSection` — sub-header ("Applications (n)") + the list of cards.
- `DeploymentStats` — the runtime row, rendered inside `ResourceCardBody`. Shows
  commit / online-since / last-restart / restart-count, and the live "deploying…"
  badge when the resource uuid is in the deploying index. Renders the leaner
  variant for services.

**Reused unchanged:** `ResourceCard` and all its existing detail components.

**Dashboard** (`client/src/pages/Dashboard/`):
- Replace `ResourceTabs` + flat `ResourceList` with the grouped server view.
- Remove `activeView` tab state from `useDashboardState`; keep search, sort,
  refresh, loading/error wiring.

**i18n:** new keys in `en.json` and `tr.json` (server view labels, deployment-row
labels, rollup labels). German locale not in scope.

## Error Handling & Edge Cases

- `/deployments` `null`/empty → `[]` (server normalizes, client double-guards).
- Coolify 429 rate-limit → reuse existing graceful error handling. Deployments are
  fetched on the normal refresh cycle — **no separate polling loop**.
- A resource whose server cannot be resolved renders under **"Unassigned"** —
  never dropped.
- Services with `server.name === null` resolve via `server_id` → `/servers` join.
- `/servers` unreachable → group by the server name embedded in resources.

## Testing

- **TDD on the pure helpers:** `resolveServer` (all three resource shapes +
  fallbacks), `groupByServer` (ordering, empty sections, Unassigned),
  `worstStatus` (severity ranking), `deployingIndex`.
- **One component test** for `ServerGroup` (rollup counts + health dot from a
  fixture set of resources).

## Out of Scope (noted, not built)

- "Group by Coolify project" (the prior `CLAUDE.md` primary goal) — deferred;
  `CLAUDE.md` to be updated to reflect server-grouping as the shipped view.
- German locale (`de.json`).
- True deployment history / duration (not exposed by the public API at the
  required token scope).
