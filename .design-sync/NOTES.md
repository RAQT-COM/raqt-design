# design-sync notes — raqt-design

Repo-specific gotchas. Read before a re-sync; it saves re-deriving all of this.

## The big one: this repo has no build of its own

`[GENERAL]` raqt-design distributes **source** over a shadcn registry. There is
no `dist/`, and `package.json` declared no library entry. The storybook shape
resolves the package's dist entry **hard** — it does not fall back to
synthesising one from `src/` the way the package shape does — so the converter
exits `[NO_DIST]` with nothing to bundle.

Fix, all committed:

- `.design-sync/entry.tsx` — a barrel re-exporting all 9 components.
- `.design-sync/build-dist.mjs` — esbuild bundles that to `dist/index.js`, then
  `tsc` emits declarations. React stays external; the converter vendors its own.
- `.design-sync/tsconfig.dts.json` — the declaration build.
- `package.json` gained `"types": "dist/index.d.ts"`. The converter reads the
  export surface from that field; without it every component drops out as
  `[TITLE_UNMAPPED]` even though the storybook side paired all 71 stories.

`dist/` stays gitignored. The three source files are what make it reproducible.

## Traps that cost time

- `[GENERAL]` **ts-morph's glob skips dot directories.** The barrel's own
  declaration lands at `dist/dts/.design-sync/entry.d.ts` and is silently never
  parsed, so the export set comes back empty. `build-dist.mjs` therefore emits
  `dist/index.d.ts` as re-exports of the **component** declarations, whose paths
  contain no dot segment. Do not "simplify" it back to one line.
- **TypeScript 7 removed `baseUrl`.** `paths` now resolve relative to the config
  file, so `tsconfig.dts.json` maps `@/*` to `../*`, not `./*`.
- **Do not set `cfg.cssEntry`.** `tokens/dist/tokens.css` is a Tailwind *source*
  file (`@import "tailwindcss"`), not compiled CSS. Leaving `cssEntry` unset lets
  `[CSS_FROM_STORYBOOK]` scrape the real compiled stylesheet out of the reference
  build, which is correct for this pipeline.
- `titleMap` maps `Empty State` -> `EmptyState` and `Match Card` -> `MatchCard`,
  and nulls the six `Foundations/*` MDX pages — they are docs, not components.
- Six components rendered wider than their grid cells: Card, EmptyState, Field,
  Input, Skeleton, MatchCard are all `cardMode: "column"`.
- `[FONT_REMOTE]` is expected. Inter and Archivo come from Google Fonts through
  an `@import` in `styles.css`. Nothing ships them locally.

## Completeness: tokens, guidelines and the marks

The first sync shipped only components and a scraped stylesheet, which read as
thin next to an LLM-generated design system. Three config-level fixes closed the
gap, all deterministic:

- **`tokensGlob` does nothing without `tokensPkg`.** `copyTokens` returns early
  when the package is unset, and it resolves the package by name under
  `--node-modules` — which a package's own repo never contains. `build-dist.mjs`
  creates `node_modules/raqt-design -> .` on every build. `node_modules` is
  gitignored, so a fresh clone has no link, and losing it silently drops the
  whole token layer back to the Tailwind scrape.
- **`tokens/dist/root/`** is a fifth output of `tokens/build.mjs`: the same values
  on `:root`, split by concern, colour first. It exists because the app was
  reading the compiled Tailwind stylesheet, whose 55 `--tw-*` internals pushed
  `--color-primary` far down the palette. Semantic tokens reference the ramps
  (`--color-primary: var(--green-400)`), so the structure is legible.
- **`guidelinesGlob` REPLACES the default** (`docs/guides/**/*.md`, `docs/*.md`,
  `guides/**/*.md`). Setting it without re-listing `docs/*.md` would silently drop
  `TOKENS.md` and `COMPONENTS.md`. It now ships `DESIGN.md`, `CONTEXT.md` and
  both docs.
- **`guidelinesGlob` is `.md`/`.mdx` only** — `matchGlob` checks `isDocExt` and
  logs a skip for anything else. The brand PNGs cannot ride through it. They are
  copied into `ds-bundle/assets/brand/` after the final build and need
  `assets/**` in the upload plan's writes and deletes.

The six `Foundations/*` storybook entries stay nulled in `titleMap`: they are MDX
doc pages, not components, and their content is covered by `DESIGN.md` §2/§5/§6
in prose the guidelines now carry verbatim.

## Documentation used to compile itself into the stylesheet

`[GENERAL]` Tailwind v4 auto-detects sources from the repo root, which swept in
the prose under `.design-sync/`. A class **named** in prose gets compiled — even
when the prose names it as an example of a class that does not exist. The
conventions header cited two absent utilities to teach the design agent that the
compiled set is fixed, and naming them created both, making its own claim false.

`tokens/dist/tokens.css` now carries `@source not "../../.design-sync"`. Proof it
works: after the exclusion the scraped stylesheet returned to the byte-identical
hash it had before the header existed, and `styleSha` matched the project anchor
again. The whole apparent styling change was documentation polluting the scan.

Two things follow:

- Prose under `.design-sync/` is safe to write freely — it is no longer a source.
- **`stories/**` still is, correctly.** `stories/foundations/03-Spacing.mdx` cites
  an arbitrary gap step as a counter-example, so that step is compiled and shipped
  even though the system tells you not to use it. Harmless, but it means the
  compiled set is slightly wider than "what components use". Do not exclude
  `stories/` to fix it — those files are the storybook's real source.

## The token list: why it is 209 and not 167

The app builds its token list from every custom property in styles.css's @import
closure, and the raw storybook scrape contributed 151 of them. Two committed
changes cut that to a clean list without inventing anything:

- **`.design-sync/overrides/css-fallback.mjs`** (declared in `cfg.libOverrides`)
  trims the scrape before it is written: a declaration this repo's
  `tokens/dist/root/*.css` already makes is dropped (223 of them, counting the
  light-mode blocks), and an `@property --tw-*` rule that no `var()` references
  is dropped (12). Both are provable, not judged.
- **`tokens/dist/root/palette.css`** splits the primitive ramps out of
  `colors.css`. The app lists tokens in filename order, so the semantic names now
  lead: `--color-primary` moved from index 47 to 6.

**43 `--tw-*` remain, and they must.** They back Tailwind's composition strings —
`filter: var(--tw-blur,) … var(--tw-sepia,)`, `font-variant-numeric:
var(--tw-ordinal,) var(--tw-slashed-zero,) …` — and their `inherits: false` is
what stops each leaking down the tree. Removing them makes `shadow-*`, `ring-*`,
`rotate-*`, gradients and `tabular-nums` silently no-op or bleed. The numeric one
exists because MatchCard uses `tabular-nums`. They now sit alone in
`_ds_bundle.css`, which sorts last, so they no longer interleave with the palette.

The auto-generated design system shows 167 tokens and zero `--tw-*` only because
a model hand-wrote its component stylesheet. That tidiness is the inference this
sync exists to avoid.

## The foundation cards are a separate step

`cfg.guidelinesGlob` copies markdown, and markdown is stored but never becomes a
card: the app's Brand / Colors / Type / Elevation / Spacing sections come from
HTML files whose FIRST LINE carries `<!-- @dsCard group=… name=… -->`. The
converter emits none, so a sync without this step ships components and tokens and
no foundations at all.

`.design-sync/cards.mjs` (`pnpm ds:cards`) emits 16 of them from
`tokens/dist/tokens.json` — the same emitter that writes theme.css — so a card
cannot disagree with the theme. It also recomputes the anchor's `auxSha` with the
converter's own `auxShaFor`, because `package-build.mjs` writes `_ds_sync.json`
before these files exist and a stale anchor would report guidelines churn on every
future sync.

**It must run AFTER the converter**, which wipes `--out`. Order for any sync:

    pnpm ds:sync  ->  /design-sync  ->  pnpm ds:cards  ->  upload

A card renders only what is ALLOWED. Prohibitions go in prose — a picture of a
banned pairing is the part of the ban that survives being read by something that
learns from examples, which is how a green logo plate reached a design system once.

## Re-sync risks — what to watch

- **The barrel is a second component list.** Add a tenth component to
  `registry.json` and it reaches consumers but NOT Claude Design, because
  `.design-sync/entry.tsx` never mentions it. `pnpm verify` fails when the two
  disagree; keep that guard working.
- **The shipped CSS is a fixed set of compiled utilities**, scraped from the
  storybook build. A class no story uses does not exist — `bg-accent` is real as
  a token and absent as a utility. If stories change, that vocabulary changes,
  and `.design-sync/conventions.md` enumerates it. Re-validate the header's
  class table against `_ds_bundle.css` on every re-sync.
- Every one of the 71 stories graded `match` from images on this run, with no
  `close` accepted and nothing skipped. A future `close` deserves scrutiny.
- **The upload plan must include `assets/**`.** It is not in the converter's
  default write globs, so a re-sync that reuses the documented plan silently drops
  the logo, logotype and app icon. Add the path at `finalize_plan` time.
- **Forget `pnpm ds:cards` and the foundations silently vanish.** The converter
  never emits them, so a plain re-sync leaves the project with components only.
- **Adding or deleting a fork re-grades every component.** Forks are in the grade
  contract, so `.design-sync/overrides/` changes cost one full re-verify. Budget
  for it; it is also the right verification for a change that touches the CSS.
- **A counter-example in a scanned file becomes real.** Before citing a class as
  absent anywhere Tailwind scans, confirm the file is outside the source set.
- Story cap was raised to `--max-stories 11` to cover MatchCard's 11 stories.
  A component that grows past 11 will have its tail silently uncaptured.
- **A new token needs a component to use it, or `@source inline`.** Tailwind only
  compiles a class whose name appears literally in a scanned source file, so a
  token nothing uses yet ships as a token with **no utility** — and the header's
  class table then claims a class that does not exist. `--text-2xs`/`--text-3xs`
  were added as the caption floor with no component using them; `tokens.css`
  carries `@source inline("text-{2,3}xs")` to force them into the compiled set.
  Add the same line for any future rung introduced ahead of its first use.
- **Rebuild `sb-reference` after ANY change to `tokens/dist/tokens.css`.** The
  shipped stylesheet is scraped from the reference build, so a directive added
  there (`@source inline`, `@source not`) is invisible until the reference is
  rebuilt. This cost one wasted converter run: the class table validated against
  a `storybook-static/` build while the converter scraped a stale reference.
- **`upload.aux: true` on a re-sync is usually the cards, not churn.** The driver
  computes `auxSha` before `pnpm ds:cards` runs, and the cards are part of
  `guidelines/`. Run the cards, then compare the sidecar's `auxSha` with the
  remote's before concluding anything needs uploading — on a no-op re-sync they
  are equal and the correct action is to upload nothing.

## The shipped `.d.ts` drops types the props reference

`[GENERAL]` The converter emits the props interface and the component
declaration, and nothing else — a named type the interface *references* is not
carried over. `MatchCard.d.ts` ships `sides: readonly [MatchSide, MatchSide]`
with `MatchSide` undeclared; `dist/dts/components/patterns/match-card.d.ts`
declares it. `MatchCard.prompt.md` does not close the gap either: its examples
spread `DOUBLES.a` fixtures, so `players` never appears literally in either
shipped file, and the design agent has to infer the shape of a side.

`package-validate.mjs` reports "all .d.ts parse cleanly" — parsing is not
resolving, so this passes every gate. `.design-sync/conventions.md` states the
shape (`each { players, scores }`) in its component map, which is currently the
only shipped place the agent can read it. Keep that line until the converter
carries referenced types. Worth reporting upstream.
