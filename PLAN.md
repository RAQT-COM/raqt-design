# raqt-design — build plan

Read this file, then read [`docs/TOKENS.md`](docs/TOKENS.md). Both are contracts. Do not renegotiate them.

**Tracked in `.wayfinder/`** — a local, gitignored map, one file per lane. Run `python3 .wayfinder/frontier.py` to see which lanes are takeable right now. **Claim a lane by setting `claimed-by:` in its ticket file before starting any work**; that line is the only thing stopping two sessions from colliding.

## What this is

A proof-of-concept design system for Raqt (pickleball/padel tournament platform). It exists to demonstrate a workflow to the product team — tokens → components → Storybook → distribution into other repos → AI building against the system — not to ship a production library. Everything here is throwaway-able.

Brand direction: **sporty, energetic, modern.** Dark-default, vibrant green.

## Non-goals

React Native and native token emitters · Claude Design `/design-sync` (no org seat) · Storybook deployment · visual regression testing · lint rules · npm publishing · CI · accessibility audit · any component beyond the nine listed here.

This is a **greenfield brand.** Nothing is reused from `raqt-public`, `raqt-mobile`, or any other Raqt repo. Do not open them for inspiration; their palettes are deliberately being replaced.

## Ground rules

Every lane obeys these.

1. **Semantic tokens only.** Components reference the semantic layer (`bg-primary`, `text-muted-foreground`, `border-border`). A `#` or a `px` inside `components/` is a defect.
2. **shadcn-compatible names.** The semantic token vocabulary matches shadcn's, so `pnpm dlx shadcn@latest add <x>` produces components that work with zero rewiring. Raqt-only additions sit alongside; they never rename shadcn's.
3. **Dark is the default mode.** Light is derived. Both ship. `--color-primary` holds the same value in both.
4. **File ownership is exclusive.** A lane writes only the files it owns. To change a file another lane owns, finish and hand off instead.
5. **`pnpm` only.** Never `npm` or `yarn`.
6. **No push, no PR, no merge** without the user asking.

## Lanes

A **lane** is one unit of work owned by one agent session. Dependencies are hard: do not start a lane whose dependencies are unfinished.

| Lane | Work | Depends on | Owns |
|---|---|---|---|
| **W0** | Scaffold repo, install every dependency, create the GitHub repo | — | `package.json`, `vite.config.ts`, `tsconfig*.json`, `.storybook/`, `components.json`, `lib/utils.ts`, `.gitignore` |
| **W1** | Token source JSON + `build.mjs` + generated CSS/TS | W0 | `tokens/**` |
| **W2** | Foundations stories | W1 | `stories/foundations/**` |
| **W3a** | `button`, `input`, `field` | W1 | `components/ui/{button,input,field}.tsx`, their stories |
| **W3b** | `card`, `badge`, `dialog` | W1 | `components/ui/{card,badge,dialog}.tsx`, their stories |
| **W3c** | `skeleton`, `empty-state`, `match-card` | W1 | `components/ui/{skeleton,empty-state}.tsx`, `components/patterns/match-card.tsx`, their stories |
| **W4** | `registry.json`, `shadcn build`, validate, tag `v0.1.0` | W3a, W3b, W3c | `registry.json`, `r/**` |
| **W5** | Consume into `raqt-public` locally | W4 | nothing in this repo |
| **W6** | `DESIGN.md`, `CONTEXT.md`, `README.md` | W1 | those three files |
| **W7** | Have Claude Code invent a component from `DESIGN.md` | W5, W6 | nothing |

**Run in parallel:** after W1 lands, W2 · W3a · W3b · W3c · W6 are all independent. That is the widest point; use it.

`package.json` is owned by W0 alone. W0 pre-installs every dependency the component lanes need, so no lane installs anything. If a lane discovers a genuinely missing dependency, stop and report rather than installing it.

`registry.json` is owned by W4 alone. Component lanes do not add registry entries; W4 writes the whole file once from the finished components.

---

## W0 — Scaffold ✅ done

Storybook is the only host; there is no Vite app, so `dev`/`build` were dropped. Scripts: `pnpm tokens` · `pnpm typecheck` · `pnpm storybook` · `pnpm build-storybook`.

Components live at the **repo root**, not under `src/` — registry file paths depend on it. `@/*` resolves to `./*` in both `tsconfig.json` and `vite.config.ts`.

Four things later lanes need to know:

- **`pnpm-workspace.yaml` carries `allowBuilds: esbuild: true`.** pnpm 11 no longer reads the `pnpm` field in `package.json`; without this, esbuild's postinstall is skipped and Vite cannot build. If a lane sees `ERR_PNPM_IGNORED_BUILDS`, run `pnpm approve-builds --all`.
- **TypeScript is v7**, which removed `baseUrl`. `paths` resolve relative to `tsconfig.json`.
- **`tokens/dist/tokens.css` and `tokens/build.mjs` are placeholders.** W1 replaces both. Until then only Tailwind's stock palette exists — no `--color-*` Raqt tokens.
- **`stories/00-Scaffold.mdx` is a smoke test.** W2 deletes it.

Verified: Storybook 10.5.10 boots on :6006, MDX renders, Tailwind v4 compiles (`rounded-lg` → 8px), Inter and Archivo both load, and Archivo's `wdth` axis responds (115% measures 394px against 335px at 100%). `pnpm typecheck` is clean.

## W1 — Tokens ✅ done

Read [`docs/TOKENS.md`](docs/TOKENS.md) for every value. It is the contract; the other lanes have already been told what these tokens are called.

Write `tokens/source/*.json` (primitives + semantic, two layers, semantic referencing primitives as `{color.green.400}`) and `tokens/build.mjs` (~100 lines, plain Node, no Style Dictionary). `build.mjs` resolves references and emits, committed:

- `tokens/dist/tokens.css` — `@import "tailwindcss"`, a global `@theme` block (dark values), a `.light` block overriding the custom properties, **and** a `.raqt` scope block carrying the dark values again so the file can be dropped into an already-themed app without recolouring it.
- `tokens/dist/tokens.ts` — plain typed object, for stories that need values in JS.

The `.raqt` scope block is what makes retrofitting work: Tailwind utilities compile to `var(--color-primary)`, so redefining those properties inside a scope retint everything within it.

**Done when:** `pnpm tokens` regenerates `dist/` deterministically, `tokens.css` imports cleanly into Storybook, a `bg-primary` div renders `#2BE07C`, adding `class="light"` to `<html>` flips the whole surface, and every semantic token in `docs/TOKENS.md` exists in the output.

All five verified. Five things later lanes need to know:

- **Three files come out of `dist/`, not two.** `theme.css` is the theme and paints `.raqt` and nothing else — that is the file W4 ships and W5 drops in. `tokens.css` is Storybook's entrypoint: it imports Tailwind, imports `theme.css`, and *then* claims `:root`, which is why dark is the default with no class on `<html>` and no edit to `.storybook/`. `tokens.ts` is the same values as a typed object.
- **The retrofit works by redefining variables, never by re-registering names.** Tailwind compiles `bg-primary` to `var(--color-primary)` once, globally; a custom property declared on an element beats what it inherits, so setting `--color-primary` on `.raqt` retints everything inside and nothing outside. `theme.css` therefore registers only the *Raqt-only* names (surfaces, statuses, warning/info/success) with `@theme reference`. **Registering a shadcn-standard name in a host app suppresses the host's own value and recolours their entire app** — that was measured, not guessed. `.raqt` also carries shadcn's bare aliases (`--primary` as well as `--color-primary`) so the scope works whichever CSS convention the host uses.
- **Tailwind only generates a utility whose class name appears literally in a source file.** A swatch grid that composes `` `bg-${token}` `` at runtime renders unstyled. W2's Colour page must either write the class names out literally or set `style={{ background: "var(--color-x)" }}` from `tokens.ts`.
- **`shadow-e1/e2/e3` and `font-display` are `@utility` definitions, not theme keys.** Tailwind inlines a themed `--shadow-*` value into the utility to splice in the shadow colour, which would freeze elevation to whichever mode compiled it; owning the utility keeps it reading the live property so it flips with the mode. `font-display` is a utility so the family can never be applied without the width and tracking.
- **`--color-status-*` resolved to `--color-status-<state>` plus `--color-status-<state>-foreground`.** `docs/TOKENS.md` left the `*` unexpanded; this matches how shadcn pairs `--color-primary` with `--color-primary-foreground`.

`.gitignore`'s `dist/` also matched `tokens/dist/`, so the generated CSS was not committed. Un-ignored with `!tokens/dist/` on the user's call, so "emits, committed" above now holds and W4 can point `registry.json` straight at `tokens/dist/theme.css`.

---

## W2 — Foundations stories ✅ done

MDX pages under `stories/foundations/`, no interactivity. Build these before judging any component — they are half the demo.

- **Colour** — swatch grid per semantic token: name, resolved hex, and the contrast ratio of each foreground/background pair.
- **Typography** — every step of the scale rendered at size, with its token name and the family in use.
- **Spacing** — visual bars for the scale.
- **Radius & Elevation** — the surface vocabulary, each elevation shown nested inside the previous one.
- **Grammar** — prose version of `DESIGN.md` §"Rules for inventing". Coordinate with W6 or write it after.

Read values from `tokens/dist/tokens.ts` rather than retyping them, so the pages cannot drift.

**Done when:** all five render, every value on the page traces to a token, and the Colour page shows contrast ratios in both modes.

All three verified in a browser. Five things later lanes need to know:

- **`sb-unstyled` is mandatory on anything that has to look like the real app.** Storybook's docs container ships an opinionated stylesheet that sets font-size, font-family, margins, text colour and a zebra stripe on the elements MDX compiles to — and it is **unlayered**, so it beats every Tailwind utility, which live in `@layer utilities`, no matter how specific the class. Measured: `text-4xl` rendered at 14px, `mt-10` at 0, and a light-mode panel inherited the dark panel's text colour. Wrapping the specimen in Storybook's own `sb-unstyled` opt-out fixes all of it at once; inside it there is no docs CSS, only Tailwind's preflight. Any lane writing an MDX page or an autodocs block hits this.
- **Both modes on one page come from the `.raqt` scope, not from a mode toggle.** A panel is `<div class="raqt">` or `<div class="raqt light">`, which is exactly the mechanism W5 drops into `raqt-public`. Side-by-side dark/light needs no addon and no edit to `.storybook/`, and the foundations pages double as a live test of the retrofit.
- **`parameters.docs.theme` does nothing on these pages.** They are unattached MDX (no `of={meta}`), and the docs container only reads that parameter off a CSF meta or the project. The docs chrome is therefore a project-wide setting in `.storybook/preview.ts` — W0's file — so W2 left it alone. A token-derived theme is exported from `stories/foundations/lib.tsx` as `docsTheme`, ready if the user wants the chrome dark; see the hand-off below.
- **Class names still cannot be composed at runtime**, per W1. Where a specimen has to prove the *utility* works rather than the custom property, the loop indexes a map of literal class strings (`TEXT_CLASS`, `RADIUS_CLASS` in `lib.tsx`); everything else paints via `style={{ … "var(--color-x)" }}`.
- **The Colour page reports one real contrast failure**, and it is a fact about the palette, not a bug on the page: `primary` on `background` in **light** mode is 1.61:1. Brand green is a fill in light mode, never text on the ground. Dark mode is fine at 10.80:1.

`stories/foundations/lib.tsx` holds the shared renderers. The colour groups carry a drift alarm: a semantic token added to `tokens.ts` and not assigned to a group surfaces in an "Ungrouped" block instead of silently vanishing from the page.

**Grammar and `DESIGN.md` §4 are the same nine rules.** W2 wrote the Grammar page rather than waiting, so W6 should lift §"Rules for inventing" from `stories/foundations/05-Grammar.mdx` instead of writing a second version. If they drift, W7 is testing a brief the Storybook does not teach.

**One hand-off, W0's file.** `.storybook/preview.ts` is the only place the docs chrome can be themed. Two lines make it Raqt-dark:

```ts
import { docsTheme } from "../stories/foundations/lib";
// parameters: { docs: { theme: docsTheme } }
```

Every page is self-carrying without it — the specimens paint themselves — so this is presentation for the demo, not a correctness fix.

---

## W3a / W3b / W3c — Components

Read [`docs/COMPONENTS.md`](docs/COMPONENTS.md) for the per-component spec.

Method for each: `pnpm dlx shadcn@latest add <name>`, then retheme against the semantic tokens. Some names may not exist upstream (`field`, `empty`) — if `add` fails, hand-write to spec rather than searching for a substitute. `match-card` is written from scratch.

**Stories: one story per state, not one story with controls.** The point is that a product person sees every state on one page without touching anything.

**Done when:** every state listed in `docs/COMPONENTS.md` has its own story, `pnpm tsc --noEmit` is clean, and `grep -nE '#[0-9a-fA-F]{3,8}|[0-9]+px' components/` returns nothing.

---

## W4 — Registry

`registry.json` at the repo root, `$schema: https://ui.shadcn.com/schema/registry.json`, `name: raqt`, `homepage: https://github.com/RAQT-COM/raqt-design`.

Items: `theme` (type `registry:file`, target `~/src/styles/raqt-theme.css`) and one per component. Every component item lists `"registryDependencies": ["RAQT-COM/raqt-design/theme"]` — that is what makes pulling one component into a fresh repo drag the tokens along.

Component items use an explicit `target` of `~/src/components/raqt/<name>.tsx`, **not** the default `ui` alias. Consuming repos already have their own `components/ui/`; landing there overwrites their work and breaks their app.

**Write the descriptions for an LLM to read.** `"Raqt button"` is useless. `"Raqt button. Variants: primary, secondary, ghost, destructive. Sizes sm/md/lg. Includes loading and disabled states."` tells an agent when to reach for it.

Then:

```bash
pnpm dlx shadcn@latest build
pnpm dlx shadcn@latest registry validate RAQT-COM/raqt-design
git tag v0.1.0
```

`shadcn build` compiles `registry.json` into per-item files under `r/`. Commit them — the public repo serves them directly and consumers need no auth.

**Done when:** `validate` passes, `r/*.json` is committed, and `pnpm dlx shadcn@latest add RAQT-COM/raqt-design/button` succeeds from a scratch directory.

---

## W5 — Consume into raqt-public

`/Users/nelson/Sites/raqt/raqt-public`, on `develop`. **Local working tree only — never commit, never push, never branch.** Report the diff and leave it for the user to revert.

1. Fix `components.json`: it declares `"utils": "@/lib/utils"` but `cn` actually lives at `src/utils/utils.ts` and `src/lib/utils.ts` does not exist. Set it to `@/utils/utils`.
2. `pnpm dlx shadcn@latest add RAQT-COM/raqt-design/theme RAQT-COM/raqt-design/button RAQT-COM/raqt-design/card`
3. Import `src/styles/raqt-theme.css` after the existing `app.css`.
4. Add a scratch route under `src/routes/$locale/` whose content sits inside `<div className="raqt">`, rendering the pulled components.

**Done when:** the scratch route renders Raqt-green components, **every other page of raqt-public is visually unchanged**, `src/components/ui/` is untouched, and `pnpm typescript:report` is clean.

---

## W6 — Docs

`DESIGN.md` (under two pages) is the grammar, written for an agent to build from:

1. **Principles** — three or four sentences on what Raqt feels like.
2. **Token reference** — semantic names and what each is for. Names, not hex; hex lives in code.
3. **Component inventory** — name, one-line purpose, variants.
4. **Rules for inventing** — the section that matters. Surfaces, interactive states, loading/empty coverage, spacing from the scale, how nesting steps elevation and radius.
5. **Platform notes** — one line: web only for the PoC, native emitters are the documented next step.

The bar: a component built only from §4 by someone who has never seen the library should look like it belongs. W7 tests exactly that.

`CONTEXT.md` is a glossary and nothing else — no implementation detail. Settle the term collision first: **"design system"** currently names three different things (this repo, the Storybook, a Claude Design extracted system). Give each its own word.

`README.md` covers consuming the registry from another repo.

---

## W7 — Invention test

In a scratch directory, give a fresh Claude Code session `DESIGN.md` and `tokens/dist/tokens.css` and nothing else. Ask it to build a component the library does not have — a leaderboard row, a stat tile. Then judge: does it look like it belongs?

This substitutes for the Claude Design demo (blocked on an org seat) and carries the same claim: product invents freely, the tokens keep inventions on-brand. If the output drifts, the fix is `DESIGN.md` §4, not the component.

**Done when:** the generated component uses only semantic tokens and reads as Raqt. Record what you changed in `DESIGN.md` to get there — that delta is the interesting result.
