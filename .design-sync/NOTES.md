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
- Story cap was raised to `--max-stories 11` to cover MatchCard's 11 stories.
  A component that grows past 11 will have its tail silently uncaptured.
