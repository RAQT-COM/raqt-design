# raqt-design

The Raqt design system — tokens plus the rules for building with them — and a
nine-component library built on it. Dark-default, green-grounded, distributed to
other repos over a [shadcn registry](https://ui.shadcn.com/docs/registry).

- [`DESIGN.md`](DESIGN.md) — the design language. Hand this to an agent.
- [`CONTEXT.md`](CONTEXT.md) — what each word in this project names.
- [`docs/TOKENS.md`](docs/TOKENS.md) — the token contract.
- [`docs/COMPONENTS.md`](docs/COMPONENTS.md) — the per-component spec.

> **Proof of concept.** This exists to demonstrate a workflow, not to ship a
> production library. See [`PLAN.md`](PLAN.md).

## Consuming it from another repo

### What you need

Tailwind v4, React 19, and a `components.json` whose `aliases.utils` actually
points at your `cn`. The theme is plain CSS custom properties, so nothing else
is required — no package to install, no build step, no auth.

### 1. Pull the theme and the components you want

```bash
pnpm dlx shadcn@latest add RAQT-COM/raqt-design/theme
pnpm dlx shadcn@latest add RAQT-COM/raqt-design/button RAQT-COM/raqt-design/card
```

Every component item depends on `theme`, so pulling one component alone brings
the tokens with it. `match-card` additionally pulls `card`, `badge` and
`skeleton`.

Files land at:

| item | target |
|---|---|
| `theme` | `src/styles/raqt-theme.css` |
| the eight `ui` components | `src/components/raqt/<name>.tsx` |
| `match-card` | `src/components/raqt/match-card.tsx` |

Components deliberately do **not** land in your `components/ui/`. Yours stays
yours.

### 2. Import the theme

After your own stylesheet, so it is the later declaration:

```css
@import "./app.css";
@import "./styles/raqt-theme.css";
```

### 3. Scope it

The theme paints `.raqt` and nothing else. Nothing changes anywhere in your app
until you opt a subtree in:

```tsx
<div className="raqt bg-background text-foreground">
  <Button>Enter tournament</Button>
</div>
```

Inside that element the Raqt palette applies; outside it your app is untouched.
This works because Tailwind compiles `bg-primary` to `var(--color-primary)` once,
globally, and a custom property declared on an element beats what it inherits.

The theme registers only Raqt-only names (`surface-*`, `status-*`, `warning`,
`info`, `success`) with Tailwind. It never re-registers a shadcn-standard name —
doing so would suppress your app's own value for it and recolour your whole app.

### 4. Light mode

Dark is the default. Add `light` alongside the scope for a light surface:

```tsx
<div className="raqt light">…</div>
```

`--color-primary` and `--color-ring` hold the same value in both modes.

### Overlays

Radix portals to `document.body`, which is outside your `.raqt` element, so a
dialog would otherwise render in your app's palette. `DialogContent` takes a
`scope` prop that re-establishes it — `"raqt"` by default, `"raqt light"` in a
light-mode host. Anything else you portal needs the same treatment; see
`DESIGN.md` rule 10.

## Working on this repo

```bash
pnpm install
pnpm storybook
```

`pnpm tokens` regenerates `tokens/dist/` from `tokens/source/*.json` — it runs
automatically before Storybook. Never edit `tokens/dist/` by hand.
`pnpm typecheck` runs `tsc --noEmit`.

## Status

Tokens, the nine components and the Storybook are built. The registry itself
(`registry.json`, `r/`, and the `v0.1.0` tag the commands above resolve against)
is lane **W4** in [`PLAN.md`](PLAN.md) and is not published yet — the consuming
instructions describe its agreed shape and are verified by W4 and W5, not here.
