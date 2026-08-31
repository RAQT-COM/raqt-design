# Component spec

Nine components. Each lane owns three; see [`../PLAN.md`](../PLAN.md) for ownership.

Method: `pnpm dlx shadcn@latest add <name>`, then retheme against the semantic tokens in [`TOKENS.md`](TOKENS.md). If `add` reports the item does not exist, hand-write it to this spec.

**One story per state.** A product person opens the page and sees every state at once. Controls hide states; they defeat the purpose.

Every interactive component defines all five interaction states: **default, hover, active, focus-visible, disabled.** Focus-visible uses `ring-ring` — never remove the outline without replacing it.

---

## W3a

### `button`

Variants `primary` (default) · `secondary` · `ghost` · `destructive` · `outline`. Sizes `sm` · `md` (default) · `lg` · `icon`.

`primary` is `bg-primary text-primary-foreground` — vibrant green with near-black text, in both modes.

**Loading state**: a `loading` boolean prop that swaps the leading slot for a spinner, disables the button, and **preserves its width** so layouts do not jump.

Stories: each variant · each size · hover · focus-visible · disabled · loading · with leading icon · icon-only.

### `input`

`bg-transparent border-input`, radius `md`, focus ring on `ring-ring`. Invalid state driven by `aria-invalid`, which `field` sets — the input itself owns no error prop.

Stories: default · focused · filled · placeholder · disabled · invalid · with leading icon.

### `field` — the star of the demo

Wraps label + control + hint + error. This component is the argument that product never has to design error states, so it gets the fullest story treatment in the library.

Props: `label`, `hint`, `error`, `required`, `disabled`, `children`.

Rules: the label is bound to the control with a generated id. When `error` is set, the control receives `aria-invalid` and `aria-describedby` points at the error, the error replaces the hint (never both stacked), and the label tints `text-destructive`. Required fields carry a marker in `text-destructive`. Reserve the hint/error line's height so validation does not shift the form.

Stories: default · filled · with hint · with error · error and hint together · disabled · required · loading · **a three-field form with one field in error** (this is the screenshot that goes in the deck).

---

## W3b

### `card`

The surface primitive — it establishes the elevation/radius/padding grammar the whole system inherits. `bg-surface-1 border-border rounded-lg shadow-e1`, padding from the spacing scale.

Slots: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

Stories: default · with header and footer · interactive/hoverable · **nested card** (steps up one surface, down one radius — this demonstrates the elevation rule) · in both modes side by side.

### `badge`

The status vocabulary. Cheap to build, high visual impact in a demo.

Variants `default` · `secondary` · `outline` · `success` · `warning` · `destructive` · `info`, plus the match statuses `upcoming` · `live` · `finished` · `open` wired to the `--color-status-*` tokens.

`live` gets a subtle pulsing dot. Do not animate the whole badge.

Stories: every variant in one grid · with icon · in both modes.

### `dialog`

Proves the system handles overlays, not just flat layout. Radix-backed. Overlay is a scrim over `background` at reduced opacity; the panel is `surface-2` with `shadow-e3` and radius `lg`. Focus trap and escape-to-close come from Radix — verify they survive the retheme.

Stories: default · with form content (compose with `field`) · destructive confirmation · long scrolling content.

---

## W3c

### `skeleton`

The loading state product will never design. `bg-muted` with a shimmer that travels across it. Respect `prefers-reduced-motion` by falling back to a static pulse.

Stories: line · paragraph · avatar/circle · card skeleton · **match-card skeleton** (matches `match-card`'s exact layout).

### `empty-state`

The empty state product will also never design. Props: `icon`, `title`, `description`, `action`.

Stories: default · with action button · with icon · compact variant · inside a card.

### `match-card` — the domain component

The one component that looks like *Raqt* rather than like a component library. It exists to demonstrate the promotion path: a domain component built in an app, promoted into the system.

Renders:
- **Two sides**, one or two player names each (singles and doubles)
- **Set-by-set score**, with the winning side's line emphasised
- **Status** — `upcoming` · `live` · `finished`, as a `badge`
- **Court and time**

Rules: `live` emphasises the current set and uses the `live` badge; `finished` de-emphasises the losing side to `text-muted-foreground`; `upcoming` shows time in place of the score. Built entirely from `card` and `badge` — reaching for a raw `div` with bespoke styling here misses the point of the exercise.

Stories: upcoming · live · finished · singles · doubles · long player names (overflow) · three-set match · loading (uses the match-card skeleton).
