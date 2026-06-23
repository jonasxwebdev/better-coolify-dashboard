# CLAUDE.md — Project Handoff

This file gives context for anyone (human or Claude Code) picking up this repo.

## What this is

**better-coolify-dashboard** — a standalone fork of [kalayciburak/coolify-dashboard](https://github.com/kalayciburak/coolify-dashboard), created as a **clean clone into a new independent repo** (not a GitHub "Fork") because major changes are planned and there's no intention of sending changes back upstream. This repo is **public**.

The original is a self-hosted dashboard that gives a single overview of all Coolify-managed applications, services, and databases — status, basic info, and (in admin mode) start/stop/restart/delete actions — instead of clicking through each resource individually in Coolify's own UI.

## Repo provenance

Created via clean clone (history stripped, single fresh initial commit), not GitHub's fork button — no fork relationship is tracked on GitHub, this repo is fully independent.

Renamed from the original throughout: `package.json` files (root/client/server), `README.md` title, CI workflow image references. The Docker Hub image references in `README.md`, `README-TR.md`, and `.github/workflows/docker-build.yml` were changed from the original author's `torukobyte/...` namespace to a `YOUR_DOCKERHUB_USERNAME/better-coolify-dashboard` placeholder — fill in your own, or disable that workflow if you don't need a published Docker image (Coolify can build straight from this repo's `Dockerfile`).

**Since this repo is public:** the `.gitignore` already excludes all `.env` files and `.2fa-state.json`, but double-check before every push, especially while iterating quickly. A leaked `COOLIFY_TOKEN` is a leaked credential to your real infrastructure.

## License

MIT, original copyright Burak Kalaycı (2025). **Keep the `LICENSE` file and its copyright notice intact**, even as the code diverges substantially — that's the only obligation MIT carries. No requirement to credit further, but a one-line "based on" mention in the README is good etiquette while the code still resembles the original.

## Stack

- **client/** — React 19, Vite 7, Tailwind CSS 4, Zustand (state), react-i18next (en, tr locales)
- **server/** — Node 20, Express 4, JWT sessions, speakeasy (TOTP 2FA)
- Ships as a single Docker image; designed to be deployed as a Coolify-managed resource itself

## Architecture map (verified by reading the source, not just the README)

| File | Role |
|---|---|
| `server/services/CoolifyApiClient.js` | Axios client wrapping Coolify's REST API. Reads `COOLIFY_BASE_URL` + `COOLIFY_TOKEN` from `process.env`. **The token never reaches the client — preserve this in any refactor.** |
| `server/factories/ResourceRouterFactory.js` | Generates list/start/stop/restart/delete routes per resource type (applications/services/databases) from a config object. Extend behavior here, not via hand-rolled routes. |
| `server/middleware/auth.js` | `verifyToken` — JWT session check |
| `server/middleware/adminCheck.js` | Gates start/stop/restart/delete behind `DASHBOARD_USER_TYPE=admin` |
| `server/routes/auth.js` | Login + one-time 2FA setup. No UI for resetting 2FA — deliberate security choice, reset requires server access (delete `server/.2fa-state.json`, regenerate). |
| `client/src/pages/Dashboard/` | Main view. Currently a **flat list of all resources**, filterable by type (apps/services/dbs) via tabs, with search + sort. **Not grouped by Coolify project** — see primary goal below. |
| `client/src/components/ResourceCard/` | Per-resource card UI + action buttons |
| `client/src/utils/statusUtils.js` | Status string → color: running/healthy = green, error/failed = red, exited/stopped = orange, else = yellow/gray |
| `client/src/services/resourceMapper.js` | Maps raw Coolify API objects into the UI's shape. Spreads the original object (`...app`), so any project reference Coolify's API returns should already be present here — confirm the exact field name against a live response before building on it. |

## Primary goal for this fork

> **Update (2026-06-23):** Shipped a **"group by server"** view that *replaces* the
> type-tabbed flat list — server sections → type sub-sections (Applications /
> Services / Databases) → the existing full-detail resource cards, with per-card
> deployment/runtime stats (`git_commit_sha`, `last_online_at`, `last_restart_at`,
> `restart_count`) and a per-server rollup (running/stopped/deploying + health
> dot). Resources are linked to their server by uuid (`destination.server` for
> apps/dbs, `server`/`server_id` for services) joined to `/api/v1/servers`. Live
> "deploying" badge comes from `/api/v1/deployments`. See
> `docs/superpowers/specs/2026-06-23-group-by-server-design.md` and
> `docs/superpowers/plans/2026-06-23-group-by-server.md`. The "group by project"
> idea below is **deferred**.

Add a **"group by Coolify project"** view alongside the existing "group by resource type" view.

Known constraints:
- `GET /api/v1/projects` only returns `{id, uuid, name, description}` — it does **not** nest environments/resources (confirmed doc/behavior mismatch, see coollabsio/coolify#7702). Don't build the grouping around that endpoint.
- Instead: keep fetching apps/services/dbs as already done, and check whatever field each object actually carries for its parent project (likely something under `environment` or a `project_uuid`-style key) — verify with a real `curl` against the target instance before coding against it, since Coolify's API docs have been wrong about response shapes before.
- Reuse the existing `statusUtils` color logic for a per-project "health dot" — e.g. red if any resource in the project is errored, otherwise the worst status among its resources.

## Other planned changes (mentioned, not started)

- German locale: `client/src/i18n/locales/de.json` — only `en.json` and `tr.json` exist today.
- Possible visual restyle to match the Coolify Tweaks theme color palette already used elsewhere in this infra, for visual consistency.

## Deployment target / infra context

- Hetzner CAX21 VPS, self-hosted Coolify (Traefik as reverse proxy), custom domain via Let's Encrypt.
- Intended to be deployed as a new Docker Image/Compose resource inside Coolify itself, on its own subdomain.
- **Must sit behind an additional access-control layer beyond the app's own login+2FA before going live** — e.g. a Traefik `basicAuth` middleware or IP allowlist on its router. Once admin-mode write actions (start/stop/restart) are reachable, an exposed instance lets anyone who finds the URL disrupt production services.
- Coolify's action endpoints are rate-limited server-side (429 + `Retry-After`) — handle this gracefully in any new action UI.

## Security constraints — do not violate

- `COOLIFY_TOKEN`, `JWT_SECRET`, `ADMIN_PASSWORD`, `ADMIN_2FA_SECRET` stay server-side only, via env vars. Never log them, never include them in any API response to the client, never hardcode them in source.
- The `read:sensitive` Coolify token permission — required by this app even in "viewer" mode, per its own setup docs — exposes env vars/secrets of your real Coolify resources through this dashboard. Be deliberate about whether you actually need that scope before granting it.
- `.gitignore` already excludes `.env`, `client/.env`, `server/.env`, `.2fa-state.json`, `credentials.json`. Preserve these patterns when restructuring — never commit real secrets to this repo, especially since it's public.

## Local dev setup

```bash
npm install                 # installs root + client + server workspaces
# create server/.env with the vars below
npm run dev                 # runs client (Vite) + server (Express) concurrently
```

Required `server/.env`:

```env
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_2FA_SECRET=        # generate via: cd server && npm run generate-2fa
JWT_SECRET=
ALLOWED_ORIGINS=
COOLIFY_BASE_URL=
COOLIFY_TOKEN=
DASHBOARD_USER_TYPE=     # "admin" or "viewer"
```

## Open questions for whoever picks this up next

- [ ] Confirm the exact field Coolify's API uses to link a resource to its project (inspect a real `/api/v1/applications` response)
- [ ] Decide grouping UX: a new tab next to Applications/Services/Databases, or a toggle that switches the whole view's grouping mode
- [ ] Decide on the Traefik auth layer (basicAuth vs IP allowlist vs both) before the first public-facing deploy
- [ ] Decide whether to keep `DASHBOARD_USER_TYPE=admin` (write access) or run in `viewer` mode initially, given write actions are exposed once deployed
