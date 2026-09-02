---
name: raqt-design
description: >-
  Raqt design language — the rules for building UI with the Raqt tokens and
  components installed in this repo. Use when writing or changing any interface
  here: picking a colour, surface, radius, spacing or type step; building
  something the Raqt library does not already have; wiring hover, focus,
  disabled, loading or empty states; or when a component renders wrong in light
  mode or inside a portal.
---

<!-- GENERATED from DESIGN.md and registry.json by skills/build.mjs in
     RAQT-COM/raqt-design. Edits here are overwritten by the next `pnpm build` and never
     reach anyone else — raise the change against DESIGN.md instead. -->

# Raqt design language

Everything below is the contract, not advice. **Apply every rule** — a component
that breaks one still compiles, still looks fine in dark mode, and fails the
moment somebody flips the theme or drops it in a portal.

## What is installed here

Raqt arrives through a [shadcn registry](https://ui.shadcn.com/docs/registry),
so the components are **files in this repo**, not a package:

| | |
|---|---|
| components | `@/components/raqt/*` — *not* `@/components/ui/*`, which stays this app's own |
| theme | `@/styles/raqt-theme.css`, imported after the app's own stylesheet |
| add one | `pnpm dlx shadcn@latest add RAQT-COM/raqt-design/<name>` |

Two consequences that only exist on this side of the registry:

**The theme paints `.raqt` and nothing else.** A Raqt component rendered outside
that scope inherits this app's palette and looks broken. Opt a subtree in:

```tsx
<div className="raqt bg-background text-foreground">…</div>
```

Dark is the default; add `light` alongside it for a light surface
(`className="raqt light"`).

**Files under `@/components/raqt/` are replaced wholesale on the next sync.**
Editing one is work that will be silently reverted. Wrap it, compose around it,
or raise the gap upstream — which is what rule 1 means by a contract change.

## Component inventory

Reach for one of these before building anything. `field`, `skeleton` and
`empty-state` exist so that covering the unhappy states is cheaper than skipping
them.

### `button`

Raqt button. Variants: primary (default), secondary, ghost, destructive, outline. Sizes: sm, md (default), lg, icon. Props: `loading` swaps the label for a spinner and disables the button while preserving its width, `asChild` renders the styles onto a child element such as a link. All five interaction states are defined (default, hover, active, focus-visible, disabled). Reach for this for any action; use `size="icon"` with an accessible label for icon-only buttons.

### `input`

Raqt text input. A bare `<input>` with Raqt's border, focus ring and disabled styling; it takes every native input prop and adds none of its own. It owns no error prop: invalid styling is driven entirely by `aria-invalid`, which the `field` component sets. Use it inside `field` whenever there is a label, a hint or validation.

### `field`

Raqt form field: label + control + hint or error message, wired together. Props: `label`, `hint`, `error`, `required`, `disabled`, `loading`, `children` (the control). Setting `error` is the only switch — it tints the label, puts `aria-invalid` on the control, points `aria-describedby` at the message and replaces the hint. The message line reserves its height, so validating a form never shifts the layout. Use this instead of hand-building a label and an error paragraph.

### `card`

Raqt card, the surface primitive every other container inherits from. Slots: Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter. A card nested inside another card automatically steps up one elevation and down one radius — no prop needed; `level` (1-3) overrides it for a surface that only reads as nested, such as a popover panel. `interactive` adds hover and focus affordances for a card that is itself a control. Use it for any panel, tile or grouped block.

### `badge`

Raqt badge, the status vocabulary. Two families of variants that are not interchangeable: generic meaning — default, secondary, outline, success, warning, destructive, info — and Raqt match statuses — upcoming, live, finished, open. Say what a thing is (`variant="live"`), never what it looks like (`variant="destructive"` for a live match is wrong); the token layer decides the colour. `live` carries a pulsing dot that respects prefers-reduced-motion. `asChild` renders it as a link.

### `dialog`

Raqt modal dialog, built on Radix. Slots: Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose. Focus trap, escape-to-close and scroll lock come from Radix. Because Radix portals to document.body — outside the `.raqt` scope — DialogContent re-establishes the scope itself; pass `scope="raqt light"` when the host page is in light mode. Use for confirmations and short forms, not for full pages.

### `skeleton`

Raqt loading placeholder. A shape, not a component per shape: give it the size and radius of the thing it stands in for — `h-4 w-40` is a line of text, `size-10 rounded-full` an avatar. A shimmer travels across it, falling back to an opacity pulse under prefers-reduced-motion. The keyframes ship inside the file, so nothing else has to be installed. Use it for any content that arrives after first paint, in place of a spinner.

### `empty-state`

Raqt empty state. Props: `icon`, `title`, `description`, `action` (usually a Button), and `variant` — default, or compact for an empty inside a panel, sidebar or table where a full display title would out-shout its container. Deliberately borderless: it is content, not a container, so it inherits whatever surface it is dropped onto. Use it for zero-result lists, unfiltered searches and not-yet-created states.

### `match-card`

Raqt match card — the domain component. Renders one padel or pickleball match: two sides of one or two players each, the set-by-set score, a status badge and the court and time. Props: `status` (upcoming, live, finished), `sides` (exactly two, each `{ players, scores }`), `court`, `time`. An upcoming match shows its time in place of the score; a live one emphasises the set being played; a finished one dims the losing side. Exports MatchCardSkeleton, whose layout matches exactly. Composed entirely from card, badge and skeleton — pulling this in pulls those.

## Token reference

This table is the whole vocabulary — a name that is not in it does not exist.

Semantic names only — the values live in [the token contract](https://github.com/RAQT-COM/raqt-design/blob/main/docs/TOKENS.md) and in the emitted
theme. Never write the hex.

### Ground and type

| token | for |
|---|---|
| `background` / `foreground` | the page and its text |
| `muted` / `muted-foreground` | quiet surfaces and secondary text |
| `border` | every hairline edge |
| `input` | form control borders only |
| `ring` | focus rings, nothing else |

### Action

| token | for |
|---|---|
| `primary` / `primary-foreground` | the one most important action; brand green, identical in both modes |
| `secondary` / `secondary-foreground` | the alternative action |
| `accent` / `accent-foreground` | hover and tertiary emphasis |
| `card` / `card-foreground`, `popover` / `popover-foreground` | shadcn compatibility; prefer `surface-N` for elevation |

### Meaning

`destructive` · `warning` · `success` · `info`, each with a `-foreground`. These
say something about severity. Do not use them for decoration.

### Elevation — Raqt-only

`surface-1` · `surface-2` · `surface-3`, paired with `shadow-e1` · `e2` · `e3`.

In dark, elevation is surface lightness plus a hairline border; in light, the
three surfaces are all white and elevation is the shadow. One vocabulary, two
implementations — this is why the semantic layer exists.

### Match status — Raqt-only

`status-upcoming` · `status-live` · `status-finished` · `status-open`, each with
a `-foreground`. A match's state is a domain fact, not a severity.

### Type, radius, spacing

`--text-xs` … `--text-4xl` · `--radius-sm|md|lg|xl` · `--spacing` (`0.25rem`,
Tailwind generates the rest) · the `font-display` and `shadow-e*` utilities.

## Rules for inventing

The ten rules. Follow them and a component the library has never had will still
read as Raqt.

**1 · Semantic tokens only.** `bg-primary`, `text-muted-foreground`,
`border-border`. Never a hex, never a `px`, never an arbitrary value. A raw value
is the one thing in the component that will not follow the theme into light mode,
into a host app's `.raqt` scope, or into next quarter's brand. If a value you
need has no token, say so — that is a gap in the contract, not a hex to inline.

**2 · Start on the ground.** `background` is the page; everything sits on it.
Text is `foreground`, and its quieter half is `muted-foreground` — two levels,
not five. There is no "slightly dimmer than secondary" grey, and making one by
lowering opacity puts a colour on screen that no token can reach.

**3 · Nesting steps the surface up and the radius down.** Elevation N is
`bg-surface-N` + `border border-border` + `shadow-eN`, all three together. A card
at `surface-1 rounded-lg` holds a row at `surface-2 rounded-md`, which holds a
chip at `surface-3 rounded-sm`. Three levels is the whole ladder; a design that
needs a fourth is too deep — flatten it.

> A surface step separates a **box from the box around it**. It cannot carry
> emphasis **inside** a box, because in light mode all three surfaces are white.
> Emphasis within a card comes from `muted`, `accent` or type weight — tokens
> that differ from the card in both modes.

**4 · One primary action.** `primary` is the single most important thing a person
can do on the screen; two primary buttons in one view means neither is.
Everything else steps down — `secondary` for the alternative, `ghost`/`accent`
for tertiary, plain text below that.

**5 · Colour carries meaning, never decoration.** `destructive`, `warning`,
`success` and `info` say something, and using `warning` amber because a card
looked flat is a lie the interface tells. Match state has its own four tokens
because it is a domain fact: a live match is `status-live`, never `destructive`.

**6 · Scan sizes and read sizes are different faces.** `--text-xl` and above are
display type — Archivo, stretched, applied with the `font-display` utility.
Scores, names, headings; things the eye lands on. `--text-lg` and below are
Inter, for anything read as a sentence. Never apply the Archivo family by hand:
`font-display` sets family, width and tracking together, and the family alone is
a different typeface.

**7 · Spacing comes off the scale.** `--spacing` is `0.25rem` and Tailwind
generates the rungs. Use `2` inside a control, `3`–`4` for control padding, `4`–`6`
for surface padding, `8`+ between sections. `p-[13px]` is the same defect as a
hex — a decision nobody else can find or change.

**8 · Every state, not just the happy one.** An interactive thing is not done
until it has all five — rest, hover, active, `focus-visible`, disabled. Focus is
a `ring-ring` ring and is never removed; `outline-none` without a replacement
makes the component unusable by keyboard, and that is not a visual preference. A
thing that shows data is not done until it has all three: loaded, **loading**,
**empty**.

The pointer cursor is not one of the five, because it is not yours to declare:
Tailwind v4's preflight dropped the `cursor: pointer` v3 gave buttons, and the
theme restores it for every enabled `button` and `[role="button"]` in the scope.
Write `cursor-pointer` only for something clickable that is *not* a button — an
interactive `card` is the one in this library.

**9 · Dark is the truth, light is the check.** Design in dark — it is the default
and it is what most of Raqt's users see. Then flip to light before calling it
done. Almost every mode bug is one of the rules above already broken: a hardcoded
colour, a surface without its border, an elevation without its shadow. The flip
does not create those bugs, it reveals them.

**10 · Anything portalled has to re-enter the scope.** The theme is a `.raqt`
class, and custom properties inherit down the DOM. A dialog, popover, tooltip or
dropdown that portals to `document.body` lands **outside** the scope and picks up
the host app's palette instead. Re-establish it inside the portal on a
`display: contents` wrapper (`<div className="contents raqt">`), and carry the
mode explicitly — the portal left its ancestry behind, so a light-mode host needs
`"raqt light"`. `dialog` does this already; copy it rather than rediscovering it.

### When the rules do not cover it

Say so out loud, in the pull request. A missing token, a fourth elevation level,
a state nobody planned for — these are contract changes, and the contract is one
file ([the token contract](https://github.com/RAQT-COM/raqt-design/blob/main/docs/TOKENS.md)) precisely so that changing it is a visible act rather
than a quiet one.

Inventing a value locally is how a design system dies: not in one bad decision,
but in fifty small ones nobody had to defend.

## Iconography

**One library: Lucide, via `lucide-react`.** It is what `components.json`
declares, what `button` and `dialog` already ship with, and therefore what a
consumer already installs with either of them. A second icon family is a second
design system — a different grid, a different stroke, a different idea of what a
chevron is — so a glyph Lucide does not have is a gap to raise, the same as a
missing token. Named imports only; the package is side-effect free, so
`import { Trophy } from "lucide-react"` ships one glyph and `import * as icons`
ships seven thousand.

**The set is the vocabulary, not the library.** Each concept Raqt names has one
nominated glyph — tournament `Trophy`, match `Swords`, court `LandPlot`, live
`Radio` — and the register is [Foundations → Iconography](https://raqt-com.github.io/raqt-design) in Raqt's Storybook.
One concept, one glyph, and the rule runs both ways: the same icon for "filter"
here and "settings" there is the same defect as two icons for "add". Adding a
concept means adding it to that page.

**Three sizes, off the spacing scale.** `size-3` beside `--text-xs` (inside a
badge), `size-4` beside `--text-sm`/`--text-base` (the default — `button` and
`dialog` set it for you), `size-5` for an icon standing alone, like the
`empty-state` medallion. Nothing larger: a 24px-grid glyph at 32px is four
visible line segments, not an illustration. Never set `strokeWidth` by hand.

**Icons take `currentColor`.** They have no colour of their own, which is what
carries them into light mode and into a host app's scope. Do not give one a
colour class unless the colour is the message — `text-success`, `text-warning`,
`text-destructive`, `text-info`, and nothing else. That is rule 5, not an
exception to it: a live match is a `status-live` badge, never a red icon.

**Decorative icons are `aria-hidden`; an icon alone still needs its word.** An
icon beside a label repeats the label, so it is hidden from the accessibility
tree. An icon-only `button` (`size="icon"`) carries an `sr-only` label, as
`dialog`'s close does. And never let the glyph be the only carrier — status is
colour *and* glyph *and* text, because any one of the three fails for somebody.

## The marks

Three assets in [`assets/brand/`](https://github.com/RAQT-COM/raqt-design/tree/main/assets/brand), and choosing between them is one question: how
much room is there, and does the reader already know what Raqt is.

| asset | what | floor | for |
|---|---|---|---|
| `logo.png` | the wordmark over the tagline | ~160px wide | first contact — marketing, the login screen, a footer |
| `logotype.png` | the wordmark alone | ~90px wide | in-product chrome — app header, nav |
| `icon.png` | the **R** alone, on its own ground | — | home screen, favicon, avatar |

The floor on the full logo is set by the **tagline**, not the wordmark: it is
drawn at about a fifth of the wordmark's height and stops resolving well before
**RAQT** does. That is the whole reason the logotype exists — the same mark with
the fragile part removed. Below the logotype's floor, use the icon.

**The lockups are masks, not pictures.** `logo.png` and `logotype.png` are
white-ish artwork on transparency, and only the alpha channel carries the shape.
So they are applied with `mask-image` and painted from a token:

```css
background: var(--color-foreground);
mask: url("…/logotype.png") no-repeat center/contain;
```

One file per mark serves both modes and inverts by itself when the mode flips —
the same reason an icon takes `currentColor`. A second baked file per mode would
be a second value nobody can find or change. That is rule 1 applied to artwork.

**There are two grounds, and they are the two values `background` resolves to.**
Ink in dark, the near-white in light. A field of `primary` behind a mark is not a
third ground: it is legible — 10.8:1 — and still wrong, because `primary` is the
signal for the one thing to do next and a logo is never an action. That is rule 5.
The mark takes `foreground`; never `primary`, never `muted-foreground`, never a
tint. Its proportions are the file's — no stretching, condensing or rotating.

**Neither file carries a margin.** Both are cropped tight — `logo.png`'s ink runs
to the canvas edge on three sides, `logotype.png`'s on two — so clear space is
always the layout's job and is not something anyone can eyeball from the asset.
Until the brand ratifies a figure, leave the cap height of the wordmark on all
four sides.

`icon.png` is the exception to all of it. It is opaque, carries its own white
ground, and is drawn by iOS, Android and the browser tab — none of which know
what `.raqt` is. It is a picture; do not try to token-drive it.

> **Open, and deliberately not decided here.** The icon's charcoal is `#2B2F30`,
> a neutral. The system's near-black is `#071410`, green-tinted ink, and that is
> what the masked marks resolve to in light mode. They read as the same colour
> alone and visibly differ side by side, and no token names the charcoal. Either
> the icon moves onto the ink or the charcoal earns a `brand-*` primitive — a
> contract change either way, which is why it is written down rather than fixed
> quietly.
