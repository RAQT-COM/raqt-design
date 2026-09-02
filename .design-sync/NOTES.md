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
- Story cap was raised to `--max-stories 11` to cover MatchCard's 11 stories.
  A component that grows past 11 will have its tail silently uncaptured.
