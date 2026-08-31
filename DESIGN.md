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

`--text-xs` … `--text-4xl` · `--radius-sm|md|lg|xl` · `--spacing` (`0.25rem`,
Tailwind generates the rest) · the `font-display` and `shadow-e*` utilities.

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

## 6. Platform notes

Web only. The theme is CSS custom properties consumed through Tailwind v4
utilities, so it works anywhere Tailwind does.

React Native is the documented next step, not a current target: the token source
in `tokens/source/*.json` is platform-neutral, and a `tokens.native.ts` emitter
alongside the CSS one is the intended shape. Nothing here has been proven on
native.
