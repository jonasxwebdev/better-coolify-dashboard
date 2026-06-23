# Interface Design System — better-coolify-dashboard

Flat **shadcn-style** UI. Infrastructure/deployment dashboard: a viewer scans
status of many Coolify resources and (in admin mode) starts/stops/deletes them.
Feel: calm, technical, low-chrome — the structure should be felt, not seen.

## Direction

- **Depth: borders-only.** No `backdrop-blur`, no gradients, no glow/colored
  shadows. Elevation comes from hairline borders + whisper-quiet surface shifts.
  Shadows only on overlays/floating elements (`shadow-sm`/`shadow-lg`), never
  decorative.
- **One accent: refined violet** (`--primary`), tied to Coolify's identity.
  Used only for the active tab, primary buttons, focus rings, and the `◈` mark.
  Everything else is neutral.
- **Color = meaning.** Decorative category colors were removed. Color appears
  only for status/semantics: `success` / `warning` / `destructive` / `info`.
- **Light + dark**, dark is the default. Theme set before paint by an inline
  script in `index.html`; toggled via `ThemeToggle.jsx` (persists to
  `localStorage.theme`, toggles `.dark` on `<html>`).

## Tokens

Defined in [`client/src/index.css`](../client/src/index.css) as HSL channels on
`:root` and `.dark`, exposed to Tailwind v4 via `@theme inline` (`hsl(var(--x))`).
Opacity modifiers work through `color-mix` (e.g. `bg-success/15`).

Core: `background` `foreground` · `card`/`card-foreground` ·
`popover`/`popover-foreground` · `primary`/`primary-foreground` ·
`secondary`/`secondary-foreground` · `muted`/`muted-foreground` ·
`accent`/`accent-foreground` · `border` · `input` · `ring`.
Semantic: `destructive` · `success` · `warning` · `info` (+ `-foreground`).

`--radius: 0.5rem` → Tailwind `rounded-sm/md/lg/xl` derive from it.

### Surface elevation (low → high)
`background` (page) → `card` (nav, footer, list container, login card) →
`popover` (dropdowns, modals). Inputs use `bg-input` (inset, slightly darker).
Sidebars/nav share the canvas family + a `border-border` separator — never a
different hue.

### Text hierarchy
`text-foreground` (primary) · `text-muted-foreground` (secondary/metadata/
placeholder). Don't introduce new gray values.

## Component patterns

- **Primary button:** `bg-primary hover:bg-primary/90 text-primary-foreground
  rounded-md focus:ring-2 focus:ring-ring`.
- **Secondary/utility button:** `bg-secondary hover:bg-accent
  text-secondary-foreground border border-border rounded-md`.
- **Semantic button/badge:** `bg-{success|warning|destructive|info}/15
  text-… border-…/30` (hover `/25`). Shared `Button.jsx` variants follow this.
- **Input / dropdown trigger:** `bg-input border border-border rounded-md
  focus:ring-2 focus:ring-ring placeholder-muted-foreground`.
- **Tabs:** active = `bg-primary text-primary-foreground`; inactive =
  `bg-secondary border-border text-muted-foreground hover:bg-accent`.
- **Modal:** scrim `bg-black/60` (no blur); panel `bg-popover border-border
  rounded-xl shadow-lg`; destructive confirm uses `bg-destructive`, others
  `bg-primary`.
- **Status dot:** `statusUtils.js` → running/healthy `bg-success`,
  error/failed `bg-destructive`, stopped/exited `bg-muted-foreground`,
  pending `bg-warning`.
- **Transitions:** `transition-colors`, ~150ms. No transform/scale/bounce.

## Conventions

- No raw hex or `bg-white/x` opacity stacks in components — map to tokens.
- LogsModal's `highlightLog` keeps literal Tailwind colors on purpose
  (log-level syntax highlighting) — do not tokenize those.
- Icons clarify, not decorate; standalone icons use `text-muted-foreground`.
