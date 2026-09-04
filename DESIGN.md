# Raqt design language

Read this file and the emitted theme — `tokens/dist/theme.css`, or the
`tokens/dist/tokens.css` that imports it. Between them they are enough to build
something Raqt does not have yet and have it look like it belongs.

The **design system** is this document plus the tokens. The nine components in
[`docs/COMPONENTS.md`](docs/COMPONENTS.md) are the **component library** — built
with the system, not the whole of it. §4 is what makes the difference: the
library is finite, the language is not.

---

## 1. Principles

**Sporty, energetic, modern.** Raqt is a tournament platform — courts, draws,
live scores — and the interface should feel like the venue at night, not like an
admin panel.

**Dark is the default.** The ground is a near-black green-tinted ink, not grey.
One vibrant spring green (`primary`) carries every action and never changes
between modes, so the brand is the constant and everything else is the setting.

**Green is a signal, not a wash.** Most of a Raqt screen is ink and type. Green
marks the one thing to do next, or the one thing that is live.

**Density with air.** A day sheet stacks twenty matches; the layout has to stay
scannable, which means tight surfaces and generous type contrast rather than
generous padding.

---

## 2. Token reference

Semantic names only — the values live in `docs/TOKENS.md` and in the emitted
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

`--text-3xs` … `--text-4xl` · `--radius-sm|md|lg|xl|full` · `--spacing`
(`0.25rem`, Tailwind generates the rest) · the `font-display` and `shadow-e*`
utilities.

`--text-2xs` (11px) and `--text-3xs` (10px) are the caption floor, for mobile
chrome the reading scale cannot carry: timeline stamps, seed numbers, avatar
initials, bracket-stage labels. `3xs` takes uppercase micro-labels only —
anything read as a sentence starts at `sm`. `--radius-full` is the pill:
avatars, count bubbles, status dots. Write the token, never `999px`.

---

## 3. Component inventory

Nine items. Import from `@/components/ui/*`, except `match-card`.

| component | purpose | variants / API |
|---|---|---|
| `button` | every action | `primary` `secondary` `ghost` `destructive` `outline` × `sm` `md` `lg` `icon`; `loading` keeps its width; `asChild` |
| `input` | single-line text | no error prop — invalid is driven by `aria-invalid`, which `field` sets |
| `field` | label + control + hint/error, wired | `label` `hint` `error` `required` `disabled` `loading`; one prop turns on the whole error state |
| `card` | the surface primitive | slots `Card` `CardHeader` `CardTitle` `CardDescription` `CardAction` `CardContent` `CardFooter`; nesting steps elevation itself, `level` overrides, `interactive` for clickable cards |
| `badge` | the status vocabulary | meaning: `default` `secondary` `outline` `success` `warning` `destructive` `info` · match status: `upcoming` `live` `finished` `open` (`live` carries a pulsing dot) |
| `dialog` | modal overlays, Radix-backed | `DialogContent` takes `scope` — see rule 10 |
| `skeleton` | the loading state | any shape via `className`; shimmer falls back to a pulse under reduced motion |
| `empty-state` | the empty state | `icon` `title` `description` `action`; `default` and `compact` |
| `match-card` | the domain component | `status` `sides` `court` `time`; `MatchCardSkeleton` ships beside it. `@/components/patterns/match-card` |

`field`, `skeleton` and `empty-state` exist so that covering the unhappy states
is cheaper than skipping them. Reach for them.

---

## 4. Rules for inventing

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
file (`docs/TOKENS.md`) precisely so that changing it is a visible act rather
than a quiet one.

Inventing a value locally is how a design system dies: not in one bad decision,
but in fifty small ones nobody had to defend.

---

## 5. Iconography

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
`Radio` — and the register is the Storybook *Foundations → Iconography* page.
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

---

## 6. The marks

Three assets in `assets/brand/`, and choosing between them is one question: how
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

## 7. Platform notes

Web only. The theme is CSS custom properties consumed through Tailwind v4
utilities, so it works anywhere Tailwind does.

React Native is the documented next step, not a current target: the token source
in `tokens/source/*.json` is platform-neutral, and a `tokens.native.ts` emitter
alongside the CSS one is the intended shape. Nothing here has been proven on
native.
