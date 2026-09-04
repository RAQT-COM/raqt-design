# Reading a Claude Design export

[Claude Design](https://claude.ai/design) renders against the synced Raqt system
and exports a folder. This file says how to turn one into real code.

> **An export is a specification, not source.** Nothing in it ships. Read it for
> layout, hierarchy, copy and states; then write the screen against
> `raqt-design` and [`DESIGN.md`](DESIGN.md). Never paste its markup.

## What is in the folder

| path | what it is |
|---|---|
| `<Screen>.dc.html` | the design. One artboard, `<x-dc>` template plus a `<script data-dc-script>` holding its state |
| `_ds/<system>/` | the synced Raqt system the design was drawn against |
| `_ds/<system>/_ds_manifest.json` | which components, tokens and guideline pages the system exposed |
| `_ds/<system>/_adherence.oxlintrc.json` | every component's real prop and variant signature, as lint rules. The most precise API list in the folder |
| `support.js` | Claude Design's own runtime. Ignore it |

`_ds/` is a snapshot. If it disagrees with this repo, this repo wins.

## Read the artboard in three passes

**1. Find the real components.** Every `<x-import>` is a deliberate use of the
library:

```html
<x-import component-from-global-scope="RaqtDesign.Button" variant="ghost">Court map</x-import>
```

These map one-to-one onto `@/components/ui/*`. The `variant`, `size` and `status`
attributes are the real props — carry them across unchanged.

**2. Find the components it drew by hand.** This is where the work is. Inline
markup that matches a library recipe **is** that component, and must be written
as the component:

| what you see in the artboard | write it as |
|---|---|
| `background: var(--color-surface-N)` + `border: 1px solid var(--color-border)` + `border-radius: var(--radius-*)` | `<Card>` (with `level` if it is not literally nested) |
| a heading and a sub-line at the top of such a block | `<CardHeader><CardTitle>…</CardTitle><CardDescription>…</CardDescription></CardHeader>` |
| a button row at the bottom, above a `border-top` | `<CardFooter>` |
| a small pill with a status colour | `<Badge variant="…">` |
| a `<div>` or `<span>` with `cursor: pointer` | `<Button>`, or a real `<a>` |
| a grey block standing in for content | `<Skeleton>` |
| "nothing here yet" copy | `<EmptyState>` |
| two sides, a score and a court | `<MatchCard>` |

**3. Find what the library does not have.** Timelines, brackets, nav, tab bars,
avatars, list rows: these are genuine inventions and the export is the best
spec you will get for them. Look for `data-raqt-invented="…"`, which the design
agent is asked to put on them. Build them from tokens, per
[`DESIGN.md`](DESIGN.md) § 4.

**An invented block that appears three times across a project is a component
request.** Say so — that is how the library grows, and the export is the
evidence.

## What an export reliably gets wrong

Check these every time. They are artefacts of the medium, not design decisions:

- **Raw px for spacing.** `padding: 11px 13px` is a drawing, not a measurement.
  Snap to the 4px grid and use the utilities.
- **Raw px for type.** Match it to the nearest step, `--text-3xs` upward. If
  nothing fits, that is a token gap — raise it, do not inline it.
- **`999px` for pills.** `rounded-full`.
- **Missing elevation parts.** Elevation N is `bg-surface-N` + `border-border` +
  `shadow-eN`, all three. An artboard often drops the shadow because dark mode
  hides it — light mode will not.
- **No semantics and no accessibility.** Exports carry no `aria-*`, no `role`,
  no `alt`, and clickable `<div>`s. Every one of those is yours to add.
- **Only the happy state.** The artboard shows data. You still owe loading,
  empty and error.
- **The prototype chrome is not the design.** The phone frame, the status bar,
  the artboard-switching tabs and the `sc-if` blocks belong to Claude Design.
  Each `data-screen-label` is one route or one state.

## Feeding a Claude Code session

Point it at three things and nothing else:

1. the `.dc.html` artboard,
2. `_ds/<system>/README.md` — the conventions, including the pattern-to-component
   map the design agent worked from,
3. this repo's `.claude/skills/raqt-design/SKILL.md`, installed with
   `pnpm dlx shadcn@latest add RAQT-COM/raqt-design/rules`.

Then ask for the screen, not for a translation. "Build the match-day screen from
this artboard using raqt-design" produces Raqt code. "Convert this HTML"
produces the inline styles again.
