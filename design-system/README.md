# Claude Design

How this repository becomes a design system inside
[Claude Design](https://claude.ai/design), and who owns what once it is there.

Nothing in this folder runs. It is documentation. The working files live in
[`.design-sync/`](../.design-sync).

## Who owns what

The single rule, and the one that is easy to get wrong:

> **This repository is the source. The design system inside Claude Design is
> output. Never hand-edit the output.**

| lives in | who writes it | edit it? |
|---|---|---|
| `DESIGN.md`, `CONTEXT.md`, `docs/` | you | **yes** — the design language |
| `tokens/source/*.json` | you | **yes** — the values |
| `components/**`, `assets/brand/**` | you | **yes** |
| `.design-sync/` config, notes, conventions | you | **yes** — the sync's memory |
| `tokens/dist/`, `skills/`, `r/`, `dist/` | `pnpm build` | no — generated |
| everything in the Claude Design project | the sync | **no** — replaced wholesale |

The project is a materialised snapshot. It holds compiled `.jsx`, `.d.ts`,
preview cards and token CSS that the sync wrote by reading this repo. They look
editable and are not: the next sync replaces them, and an edit made there is
silently lost. Fix it here and re-sync.

## Two routes, and why we use this one

Claude Design can build a design system two ways.

**Web onboarding** links the repo and lets Claude *infer* a design system from
it. It writes rich prose and looks impressive. It is also a model reading a
codebase, so another organization running it gets a different result — and the
one time we ran it, it invented a rule ("on green, knock the mark back to the
ink") that contradicts §6 of `DESIGN.md`.

**`/design-sync` in Claude Code** converts the repo deterministically: the
components are your *compiled bundle*, the tokens are emitted from
`tokens/source/`, and the prose is your own files copied verbatim. Every preview
is graded against this repo's own Storybook render before it ships. Run it twice,
or run it on another machine, and the output is the same.

We use the second. Same inputs, same design system, every time.

## Syncing

```bash
pnpm ds:sync      # tokens, the compiled entry, the reference storybook
```

Then, in Claude Code:

```
/design-sync
```

`pnpm ds:sync` prepares the three inputs the converter reads and stops. It cannot
upload: the converter lives in `.ds-sync/`, which Claude Code stages from its own
bundled copy of the skill, at a path carrying a version and a content hash. No
script here can find it, and pinning one would break on the next release.

The sync diffs against the project's anchor and re-verifies only what changed —
untouched components cost nothing.

**Two things it needs from you:**

- `/design-login` once, with an account that can write to the target project.
  This is per account, not per repo: whoever maintains another organization's
  design system needs an account in *that* organization.
- **`assets/**` in the upload plan's writes and deletes.** It is not in the
  converter's default globs, so the logo, logotype and app icon silently drop
  without it.

Uploading is not publishing. The **Published** toggle, in the organization's
settings via *Open* beside the design system, is what makes new projects inherit
it.

## What this repo has to supply that most do not

`raqt-design` ships **source** over a shadcn registry. It has no library build,
and the sync's storybook shape resolves a compiled entry *hard* — it will not
synthesise one. Three committed files close that gap:

| file | does |
|---|---|
| `.design-sync/entry.tsx` | a barrel re-exporting all nine components |
| `.design-sync/build-dist.mjs` | esbuild → `dist/index.js`; `tsc` → declarations |
| `.design-sync/tsconfig.dts.json` | the declaration build |

`dist/` stays gitignored; these three make it reproducible. `package.json` gained
`"types": "dist/index.d.ts"`, which is where the converter reads the export
surface — without it every component drops out.

**The barrel is a second component list.** Add a tenth component to
`registry.json` and forget the barrel, and it reaches every consuming repo but
never reaches Claude Design. `pnpm verify` fails when the two disagree.

## Before you trust a sync

- Read [`.design-sync/NOTES.md`](../.design-sync/NOTES.md) first. It carries the
  traps a previous run already paid for, and a **Re-sync risks** section naming
  what can go stale.
- `.design-sync/conventions.md` is prepended to the generated README and read by
  the design agent on every build. It enumerates the exact utility classes that
  exist — the shipped stylesheet is *compiled* Tailwind, a fixed set, not a
  runtime — so re-validate its tables against `_ds_bundle.css` whenever the
  stories change.
- Every story is graded against the Storybook render. Accept a `close` only with
  a note saying what is off and what you tried.
