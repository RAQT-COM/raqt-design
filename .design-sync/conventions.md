# Building with Raqt

**No provider and no wrapper.** Every token is declared on `:root, :host`, so a
component is styled the moment it renders. Dark is the default — it is what
Raqt's users see, and light is the check, not the baseline. For a light surface,
put `light` on a wrapping element:

```jsx
<div className="light">…</div>
```

## The utility set is fixed

These stylesheets are **compiled Tailwind output, not a Tailwind runtime.** Only
the classes the library already uses exist. `bg-primary` works; `bg-accent` does
not, and an unused rung such as `p-7` compiles to nothing. Stay inside this
vocabulary:

| family | the classes that exist |
|---|---|
| ground & type | `bg-background` `text-foreground` `text-muted-foreground` `bg-muted` `border-border` `border-input` `ring-ring` |
| action | `bg-primary` `text-primary-foreground` `bg-secondary` `text-secondary-foreground` |
| meaning | `bg-destructive` `bg-warning` `bg-success` `bg-info`, each with its `text-*-foreground` |
| elevation | `bg-surface-1` `bg-surface-2` `bg-surface-3` · `shadow-e1` `shadow-e2` `shadow-e3` |
| match status | `bg-status-upcoming` `bg-status-live` `bg-status-finished` `bg-status-open`, each with its `text-*-foreground` |
| type | `text-xs` `text-sm` `text-base` `text-lg` `text-xl` `text-2xl` `text-3xl` `text-4xl` · `font-display` `font-medium` `font-semibold` |
| radius | `rounded-sm` `rounded-md` `rounded-lg` `rounded-xl` `rounded-full` |

For anything outside it, set the value inline from a token. The tokens are always
present even where a utility is not:

```jsx
<div style={{ padding: "calc(var(--spacing) * 7)", background: "var(--color-accent)" }} />
```

## The rules that make it read as Raqt

- **Semantic names only.** Never a hex, never a raw px. A value with no token is
  a gap to raise, not a number to inline.
- **One primary action per screen.** `bg-primary` is the single most important
  thing a person can do. Two of them means neither is.
- **Colour carries meaning, never decoration.** `destructive` `warning`
  `success` `info` say something about severity. A match's state is a domain fact
  with its own four tokens: a live match is `bg-status-live`, never
  `bg-destructive`.
- **Nesting steps the surface up and the radius down.** Elevation N is
  `bg-surface-N` + `border border-border` + `shadow-eN`, all three together. A
  card at `bg-surface-1 rounded-lg` holds a row at `bg-surface-2 rounded-md`.
  Three levels is the whole ladder.
- **`text-xl` and above are display type.** Apply `font-display`, which sets
  family, width and tracking together. `text-lg` and below are Inter, for
  anything read as a sentence.
- **Every state, not just the happy one.** Rest, hover, active, `focus-visible`,
  disabled. Focus is a `ring-ring` ring and is never removed. Anything that shows
  data also needs a loading and an empty state — `Skeleton` and `EmptyState` ship
  so that covering them is cheaper than skipping them.

## Where the truth lives

`styles.css` and the `_ds_bundle.css` it imports carry every token and every
compiled class — read them before reaching for a class not listed above. Each
component ships a `.d.ts` for its API and a `.prompt.md` for how to compose it.

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
