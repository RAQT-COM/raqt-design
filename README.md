# raqt-design

The Raqt design system — tokens plus the rules for building with them — and a
nine-component library built on it. Dark-default, green-grounded, distributed to
other repos over a [shadcn registry](https://ui.shadcn.com/docs/registry) that
serves the rules alongside the components.

- [`DESIGN.md`](DESIGN.md) — the design language. Hand this to an agent, or pull
  it into a repo as a skill with
  [`add RAQT-COM/raqt-design/rules`](#5-teach-your-agent-the-rules).
- [`CONTEXT.md`](CONTEXT.md) — what each word in this project names.
- [`docs/TOKENS.md`](docs/TOKENS.md) — the token contract.
- [`docs/COMPONENTS.md`](docs/COMPONENTS.md) — the per-component spec.
- [Storybook](https://raqt-com.github.io/raqt-design/) — the components, live.
- [`design-system/`](design-system/README.md) — how `pnpm ds:sync` turns this repo
  into a [Claude Design](https://claude.ai/design) system, and who owns what once
  it is there. Read before touching anything generated.

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

A bare address resolves against this repo's **default branch**. Pin a release by
appending the ref — `RAQT-COM/raqt-design/button#v0.1.0`.

Files land at:

| item | target |
|---|---|
| `theme` | `src/styles/raqt-theme.css` |
| `rules` | `.claude/skills/raqt-design/SKILL.md` |
| the eight `ui` components | `src/components/raqt/<name>.tsx` |
| `match-card` | `src/components/raqt/match-card.tsx` |

Components deliberately do **not** land in your `components/ui/`. Yours stays
yours.

To pull a **newer version** of something you already have, `add` will skip files
that exist — pass `--overwrite`:

```bash
pnpm dlx shadcn@latest add --overwrite RAQT-COM/raqt-design/theme
```

That replaces those files wholesale, so commit your app first. If you have this
repo checked out as a sibling, `pnpm sync` from it does the same thing and then
verifies the bytes actually arrived — see [Releasing](#releasing).

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

Besides the custom properties, the theme carries exactly one rule: a `button` or
`[role="button"]` inside the scope gets `cursor: pointer`, which Tailwind v4's
preflight no longer supplies. It sits in `@layer base`, so any `cursor-*` utility
of yours still wins, and it reaches nothing outside `.raqt`.

### 4. Light mode

Dark is the default. Add `light` alongside the scope for a light surface:

```tsx
<div className="raqt light">…</div>
```

`--color-primary` and `--color-ring` hold the same value in both modes.

### 5. Teach your agent the rules

**One registry item is not a component.** `rules` installs the design language
itself, as a project-level agent skill:

```bash
pnpm dlx shadcn@latest add RAQT-COM/raqt-design/rules
```

It writes `.claude/skills/raqt-design/SKILL.md` and nothing else — no import, no
runtime behaviour. Claude Code picks it up on its own when it writes UI in that
repo, so a component the library has never had still comes out looking like
Raqt. Generated from [`DESIGN.md`](DESIGN.md), so it is the contract rather than
a summary of it that drifts.

Add it once per repo, deliberately: it is not a dependency of `theme`, because
adding a stylesheet should not write agent configuration into a repo that may
not want any.

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

| command | does |
|---|---|
| `pnpm build` | regenerates `tokens/dist/`, `skills/raqt-design/` and `r/` |
| `pnpm ds:sync` | prepares a [Claude Design](design-system/README.md) sync, then hands off to `/design-sync` |
| `pnpm verify` | `build`, then validates `registry.json` and runs `tsc --noEmit` |
| `pnpm ship` | `verify`, commit, push `main` — consumers see it immediately |
| `pnpm release <bump>` | `ship`, then bump `package.json` and tag `v<version>` |
| `pnpm sync` | re-installs the registry into the consuming app |

`pnpm tokens` regenerates `tokens/dist/` from `tokens/source/*.json` — it runs
automatically before Storybook.

**`tokens/dist/`, `skills/raqt-design/` and `r/` are generated.** Edit their
sources — `tokens/source/*.json`, `DESIGN.md`, `registry.json`, `components/` —
never the output. `pnpm build` names any generated file it overwrites, so a hand
edit is reported rather than silently lost, and the skill's emitter refuses to
write a file that still references a path only this repo has.

The design system inside Claude Design is generated too, from this repo, and is
likewise never hand-edited. See
[`design-system/README.md`](design-system/README.md).

## Releasing

There is no npm package. **The registry is the repo**: consumers read `r/*.json`
straight off GitHub, so "published" means "pushed to `main`". Two consequences
shape the whole workflow:

- `r/` inlines the contents of every component file. Editing a component without
  re-running the build ships the *old* component to every consumer — silently,
  with no error anywhere.
- A bare address resolves against `main` **at HEAD**, not at the latest tag. You
  do not need to cut a version to test a change.

`pnpm ship` exists so neither can be forgotten. It rebuilds first, so a stale
`r/` is repaired and swept into the same commit rather than left behind:

```bash
pnpm ship -m "button: tighten focus ring"
```

That runs the build, validates the registry, typechecks, shows you exactly what
it is about to commit, asks, then pushes. Cut a version only when you want
something pinnable:

```bash
pnpm release patch
```

which does everything `ship` does and then bumps `package.json`, tags `v0.1.1`,
and pushes the tag. `major`, `minor` and an explicit `1.2.3` also work. The tag
is what `#v0.1.1` in a consumer's address resolves to.

### Testing a change in a consuming app

`pnpm sync` re-installs into a sibling checkout — `../raqt-public` by default,
or wherever `RAQT_CONSUMER` points:

```bash
pnpm ship -m "wip" && pnpm sync
```

With no arguments it detects which items that app already has and re-pulls
exactly those with `--overwrite`. Name items to pull more (`pnpm sync dialog
field`), or `--ref v0.1.0` to pull a pinned version instead of `main@HEAD`.

One trap worth knowing: **`raw.githubusercontent.com` caches for about five
minutes.** A re-add immediately after a push can hand back the previous version
and look like your change did nothing. `sync` compares the theme that landed
against this repo's build and tells you when they differ, so a cache hit reads as
a warning rather than as a baffling no-op. Wait, re-run `pnpm sync`.

## Status

Tokens, the nine components, the Storybook and the registry are built and pushed.
`registry.json` validates both locally and at `RAQT-COM/raqt-design`, `r/` is
committed, and `v0.1.0` is tagged. Every target and every dependency chain above
was verified by installing all ten items into a scratch consumer.
