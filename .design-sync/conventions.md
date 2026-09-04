# Building with Raqt

## What is fixed, and what is yours

This library is small on purpose. It covers nine things. Your screen will need
far more than nine things, and inventing the rest is the job — not a failure.

So there are three tiers, and only the first is a rule.

1. **Fixed — where a component exists, use it.** A button must look like every
   other Raqt button. Same for badges, cards, inputs, fields, dialogs,
   skeletons, empty states and match cards. This is the one thing that must not
   drift, because it is what makes two screens look like one product.
2. **Default — everywhere else, build from tokens.** Colour, type, radius,
   spacing and elevation all have names. Reach for the name first. A value with
   no token is worth flagging, but it is not a blocker.
3. **Free — the rest is design.** Timelines, brackets, maps, charts, hero
   sections, onboarding, empty court diagrams: none of it is in the library and
   none of it should wait for the library. Build it. Make it good.

**The person prompting outranks this document.** If they ask for an off-system
colour, a different typeface, a louder layout, a brand moment that ignores every
rule below — do it, and do it well. This file describes the default, not a
permission system. Say once, briefly, what you stepped outside; then get on with
the design.

## Loading

Load the vendored React **before** the bundle. These components are built
against **React 19**, and the bundle binds to whatever `window.React` holds when
it loads. A React 18 already on the page is the wrong one — load ours over it:

```html
<script src="_ds/<folder>/_vendor/react.js"></script>
<script src="_ds/<folder>/_ds_bundle.js"></script>
<link rel="stylesheet" href="_ds/<folder>/styles.css">
```

`_vendor/react.js` carries React and ReactDOM together; `_vendor/react-dom.js`
is only a marker file. `styles.css` is the single stylesheet entry — it imports
the tokens, the fonts and the component CSS. Components land on
`window.RaqtDesign`. Mount into a dedicated node, never the host page's own
React root, so the two trees cannot collide.

**No provider and no wrapper.** Every token is declared on `:root, :host`, so a
component is styled the moment it renders. Dark is the default — it is what
Raqt's users see, and light is the check, not the baseline. For a light surface,
put `light` on a wrapping element:

```jsx
<div className="light">…</div>
```

## Reach for the component before the recipe

The most common failure is rebuilding a component by hand because its recipe is
easy to write. A panel drawn as `background: var(--color-surface-1); border: 1px
solid var(--color-border); border-radius: var(--radius-lg)` **is a `Card`.**
Import the `Card`. It carries padding, the slot grammar, and a nesting rule that
applies itself — a `Card` inside a `Card` steps up an elevation and down a
radius on its own, which hand-written markup will not do.

| when the screen shows | use | the props that matter |
|---|---|---|
| any panel, tile or grouped block | `Card` + `CardHeader` `CardTitle` `CardDescription` `CardContent` `CardFooter` | `level` 1·2·3 (auto when nested), `interactive` |
| a small status or category pill | `Badge` | `variant`: `default` `secondary` `outline` `live` `upcoming` `finished` `open` `success` `warning` `info` `destructive` |
| anything a person clicks to act | `Button` | `variant`: `primary` `secondary` `ghost` `outline` `destructive` · `size`: `sm` `md` `lg` `icon` · `loading` |
| a text entry | `Input` — inside a `Field` | invalid styling comes from `aria-invalid`, which `Field` sets |
| a labelled form row | `Field` | `label` `hint` `error` `required` `disabled` `loading` |
| a modal or confirm step | `Dialog` | `open` `defaultOpen` `modal` |
| a loading placeholder | `Skeleton` | — |
| "there is nothing here yet" | `EmptyState` | `variant` `default`·`compact` · `icon` `title` `description` `action` |
| one match with two sides and a score | `MatchCard` | `status` `upcoming`·`live`·`finished` · `sides` (exactly two, each `{ players, scores }`) · `court` `time` |

## What the library does not have yet

There is no nav, tab bar, list row, avatar, timeline, bracket, sheet, toast,
tooltip, table, chart, calendar, progress bar or segmented control. Build these
yourself from tokens. Two asks, both cheap:

- **Build it once and reuse it** across the screens in a project, so the same
  idea does not get three different treatments.
- **Mark it**, so the developer reading your file knows it was invented rather
  than imported:

```html
<div data-raqt-invented="timeline-row" style="…">…</div>
```

That attribute is the whole handoff. It tells a later reader "this is a
candidate for the library", and it separates your inventions from the parts that
already have a home. Anything you find yourself marking three times is worth
saying out loud at the end: *these deserve to become components.*

## The token vocabulary

Semantic names, not raw values. The full list is in `tokens/`; these are the ones
a screen actually reaches for.

| family | tokens |
|---|---|
| ground & type | `--color-background` `--color-foreground` `--color-muted-foreground` `--color-muted` `--color-border` `--color-input` `--color-ring` |
| action | `--color-primary` `--color-secondary` `--color-accent`, each with its `-foreground` |
| meaning | `--color-destructive` `--color-warning` `--color-success` `--color-info`, each with its `-foreground` |
| elevation | `--color-surface-1` `--color-surface-2` `--color-surface-3` · `--shadow-e1` `--shadow-e2` `--shadow-e3` |
| match status | `--color-status-upcoming` `--color-status-live` `--color-status-finished` `--color-status-open`, each with its `-foreground` |
| type | `--text-3xs` `--text-2xs` `--text-xs` `--text-sm` `--text-base` `--text-lg` `--text-xl` `--text-2xl` `--text-3xl` `--text-4xl`, each with its `--line-height` |
| display face | `--font-display` + `--font-display-stretch` + `--font-display-tracking`, always the three together |
| radius | `--radius-sm` `--radius-md` `--radius-lg` `--radius-xl` `--radius-full` |
| spacing | `--spacing` (the 4px base) · `--space-1 … --space-24` |

Three of these exist because designs kept needing them and inventing a number
instead:

- **`--text-2xs` (11px) and `--text-3xs` (10px)** are the caption floor, for
  mobile chrome the reading scale cannot carry — timeline stamps, seed numbers,
  avatar initials, bracket-stage labels. `3xs` takes uppercase micro-labels only.
  Both have utilities: `text-2xs`, `text-3xs`.
- **`--radius-full`** is the pill. Write it instead of `999px`.
- **`--space-*`** names the 4px grid for use outside a utility. `padding:
  var(--space-3) var(--space-4)` lands on the grid; `padding: 11px 13px` does
  not. Half steps have no name — use `calc(var(--spacing) * 1.5)`.

## The utility set is fixed

The stylesheets are **compiled Tailwind output, not a Tailwind runtime.** Only
the classes the library already uses exist. `bg-primary` works; `bg-accent` does
not, and an unused rung such as `p-7` compiles to nothing. The utilities are the
short path, not the only path:

| family | the classes that exist |
|---|---|
| ground & type | `bg-background` `text-foreground` `text-muted-foreground` `bg-muted` `border-border` `border-input` `ring-ring` |
| action | `bg-primary` `text-primary-foreground` `bg-secondary` `text-secondary-foreground` |
| meaning | `bg-destructive` `bg-warning` `bg-success` `bg-info`, each with its `text-*-foreground` |
| elevation | `bg-surface-1` `bg-surface-2` `bg-surface-3` · `shadow-e1` `shadow-e2` `shadow-e3` |
| match status | `bg-status-upcoming` `bg-status-live` `bg-status-finished` `bg-status-open`, each with its `text-*-foreground` |
| type | `text-3xs` `text-2xs` `text-xs` `text-sm` `text-base` `text-lg` `text-xl` `text-2xl` `text-3xl` `text-4xl` · `font-display` `font-medium` `font-semibold` |
| radius | `rounded-sm` `rounded-md` `rounded-lg` `rounded-xl` `rounded-full` |

For anything outside it, set the value inline from a token — the tokens are
always present even where a utility is not:

```jsx
<div style={{ padding: "var(--space-6)", background: "var(--color-accent)" }} />
```

## The rules that make it read as Raqt

- **Semantic names before raw values.** A hex or a bare px is a signal that a
  token is missing. Use the value, finish the design, and name the gap at the
  end so it can become a token.
- **One primary action per screen.** `primary` is the single most important
  thing a person can do. Two of them means neither is.
- **Colour carries meaning, never decoration.** `destructive` `warning`
  `success` `info` say something about severity. A match's state is a domain
  fact with its own four tokens: a live match is `status-live`, never
  `destructive`.
- **Nesting steps the surface up and the radius down.** Elevation N is
  `surface-N` + `border-border` + `shadow-eN`, all three together — the border
  carries the step in dark, the shadow carries it in light, so dropping either
  breaks exactly one mode. Three levels is the whole ladder. A flat chip that is
  not an elevation step — an avatar circle, a tag — can take `surface-3` on its
  own; that is the one exception, and it takes no shadow.
- **`--text-xl` and above are display type.** Apply the `font-display` utility,
  which sets family, width and tracking together. `--text-lg` and below are
  Inter, for anything read as a sentence.
- **A clickable thing is a `<button>` or an `<a>`.** Not a `<div>` with
  `cursor: pointer`. It has to reach focus and it has to say what it is. Give
  icon-only controls an `aria-label`, give images an `alt`, and never remove the
  focus ring without replacing it.
- **Every state, not just the happy one.** Rest, hover, active, `focus-visible`,
  disabled. Anything that shows data also needs a loading and an empty state —
  `Skeleton` and `EmptyState` ship so that covering them is cheaper than
  skipping them.

## Where the truth lives

`styles.css` and the `_ds_bundle.css` it imports carry every token and every
compiled class — read them before reaching for a class not listed above.
`guidelines/` holds the design system's own pages: colour, type, spacing,
radius, elevation, iconography and the brand. Read those before composing a
larger layout. Each component ships a `.d.ts` for its API and a `.prompt.md` for
how to compose it.

## One idiomatic composition

```jsx
<Card>
  <CardHeader>
    <CardTitle>Round of 16</CardTitle>
    <CardDescription>Court 1 · 14:00</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-3">
      <Badge variant="live">Live</Badge>
      <span className="text-sm text-muted-foreground">Centre Court</span>
    </div>
  </CardContent>
  <CardFooter>
    <Button>Enter tournament</Button>
    <Button variant="ghost">Cancel</Button>
  </CardFooter>
</Card>
```
