# Token contract

Authoritative values for the Raqt design system. W1 emits these; every other lane consumes them by name. Changing a value here means changing it in one place; changing a *name* means renegotiating with every lane.

Direction: **Turf** — green-ink ground, vibrant spring green. Dark-default.

## Layer 1 — primitives

Raw values. Components never reference these.

### `green` — the brand ramp

| step | hex | |
|---|---|---|
| 50 | `#E6FCF0` | |
| 100 | `#C2F7DC` | |
| 200 | `#8FEFBE` | |
| 300 | `#5BE79F` | |
| **400** | **`#2BE07C`** | **brand green — the one colour that never changes between modes** |
| 500 | `#1BC468` | |
| 600 | `#12A253` | |
| 700 | `#0D7D40` | |
| 800 | `#08582D` | |
| 900 | `#04331A` | |
| 950 | `#04120C` | text on green |

### `ink` — the green-tinted neutral ramp

Lower number = lighter. This ramp is what makes the system read as *green-grounded* rather than grey with a green accent.

| step | hex | |
|---|---|---|
| 25 | `#F2F7F4` | light background |
| 50 | `#EAF5EF` | dark foreground |
| 75 | `#E7EFEA` | light muted surface |
| 100 | `#DCE7E1` | light border |
| 200 | `#B4C9BF` | light input border |
| 300 | `#8AA79A` | dark muted foreground |
| 400 | `#6B9C86` | |
| 500 | `#5A736A` | light muted foreground |
| 600 | `#2C5142` | dark input border |
| 700 | `#1B3329` | dark border, elevation 3 |
| 750 | `#142E24` | dark elevation 2 |
| 800 | `#0E211A` | dark surface, elevation 1 |
| 900 | `#071410` | dark background |
| 950 | `#040D0A` | |

### Status ramps

| ramp | 100 | 400 | 500 | 600 | 900 |
|---|---|---|---|---|---|
| `red` | `#FFE0E0` | `#FF6B6B` | `#F04444` | `#C42A2A` | `#3A0A0A` |
| `amber` | `#FFF0D6` | `#FFC24D` | `#FFA51F` | `#D97F00` | `#3A2600` |
| `blue` | `#D9F1FD` | `#4FC3F7` | `#22A8E8` | `#1580B4` | `#06263A` |

Success reuses `green`. `white` is `#FFFFFF`.

## Layer 2 — semantic

The only layer components touch. Names match shadcn's so `shadcn add` output works unmodified.

| token | dark (default) | light |
|---|---|---|
| `--color-background` | `ink.900` | `ink.25` |
| `--color-foreground` | `ink.50` | `ink.900` |
| `--color-card` | `ink.800` | `white` |
| `--color-card-foreground` | `ink.50` | `ink.900` |
| `--color-popover` | `ink.800` | `white` |
| `--color-popover-foreground` | `ink.50` | `ink.900` |
| `--color-primary` | `green.400` | `green.400` |
| `--color-primary-foreground` | `green.950` | `green.950` |
| `--color-secondary` | `ink.750` | `ink.100` |
| `--color-secondary-foreground` | `ink.50` | `ink.900` |
| `--color-muted` | `ink.750` | `ink.75` |
| `--color-muted-foreground` | `ink.300` | `ink.500` |
| `--color-accent` | `ink.700` | `ink.100` |
| `--color-accent-foreground` | `ink.50` | `ink.900` |
| `--color-destructive` | `red.500` | `red.600` |
| `--color-destructive-foreground` | `white` | `white` |
| `--color-warning` | `amber.500` | `amber.600` |
| `--color-warning-foreground` | `green.950` | `white` |
| `--color-success` | `green.400` | `green.600` |
| `--color-success-foreground` | `green.950` | `white` |
| `--color-info` | `blue.400` | `blue.600` |
| `--color-info-foreground` | `blue.900` | `white` |
| `--color-border` | `ink.700` | `ink.100` |
| `--color-input` | `ink.600` | `ink.200` |
| `--color-ring` | `green.400` | `green.400` |

### Surfaces — Raqt-only

Elevation on a near-black ground cannot be carried by shadow. In dark mode elevation is **surface lightness plus a hairline border**; in light mode the same names resolve to **shadows on white**. One vocabulary, two implementations — this is the clearest demonstration of why the semantic layer exists.

| token | dark | light |
|---|---|---|
| `--color-surface-1` | `ink.800` | `white` |
| `--color-surface-2` | `ink.750` | `white` |
| `--color-surface-3` | `ink.700` | `white` |
| `--shadow-e1` | `none` | `0 1px 2px rgb(7 20 16 / 0.06)` |
| `--shadow-e2` | `none` | `0 2px 8px rgb(7 20 16 / 0.08)` |
| `--shadow-e3` | `none` | `0 8px 24px rgb(7 20 16 / 0.10)` |

Usage: elevation *n* is `bg-surface-n` + `border border-border` + `shadow-en`. Nested surfaces step **up** one level and **down** one radius step.

### Match status — Raqt-only

| token | dark bg / fg | light bg / fg |
|---|---|---|
| `--color-status-upcoming-*` | `ink.750` / `ink.300` | `ink.75` / `ink.500` |
| `--color-status-live-*` | `red.500` / `white` | `red.600` / `white` |
| `--color-status-finished-*` | `ink.700` / `ink.200` | `ink.100` / `ink.500` |
| `--color-status-open-*` | `green.800` / `green.300` | `green.100` / `green.800` |

## Typography

```
--font-sans:    "Inter", ui-sans-serif, system-ui, sans-serif
--font-display: "Archivo", "Archivo Expanded", ui-sans-serif, sans-serif
```

Archivo on Google Fonts is a variable font with a `wdth` axis. Display type uses `font-stretch: 115%` and `letter-spacing: -0.01em` — emit a `.font-display` utility that sets family, stretch, and tracking together, so a lane cannot apply the family without the width.

| token | size / line-height |
|---|---|
| `--text-xs` | `0.75rem / 1rem` |
| `--text-sm` | `0.875rem / 1.25rem` |
| `--text-base` | `1rem / 1.5rem` |
| `--text-lg` | `1.125rem / 1.75rem` |
| `--text-xl` | `1.375rem / 1.875rem` |
| `--text-2xl` | `1.75rem / 2.125rem` |
| `--text-3xl` | `2.25rem / 2.5rem` |
| `--text-4xl` | `3rem / 3.125rem` |

`xl` and above are display sizes: Archivo, stretched. `lg` and below are Inter.

## Radius

```
--radius-sm: 0.375rem   /*  6px */
--radius-md: 0.625rem   /* 10px — default */
--radius-lg: 0.875rem   /* 14px */
--radius-xl: 1.25rem    /* 20px */
```

## Spacing

Tailwind v4 generates the whole scale from one base. Emit `--spacing: 0.25rem` and nothing else — hand-authoring `--spacing-1`, `--spacing-2` is Tailwind v3 thinking and produces a scale that fights the generated one. Document the resulting steps on the Spacing foundations page.
