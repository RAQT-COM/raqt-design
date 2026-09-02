# Claude Design bundle

The design system as sixteen self-contained HTML preview cards, for
[Claude Design](https://claude.ai/design). Same relationship to
`DESIGN.md` and `tokens/` that Storybook has to `components/`: another
rendering of one source, not a second source.

```bash
pnpm ds        # runs `pnpm tokens` first, then emits dist/
```

## Why it is generated

Every card inlines `tokens/dist/theme.css` **verbatim**. `@theme reference` and
`@utility` are Tailwind-only at-rules that a browser skips; `.raqt`, `.raqt.light`
and `@layer base` are plain CSS and resolve exactly as they do in an app. So a
card cannot drift from the contract — there is no second copy of a value to
forget to update. The colour card goes one step further and reads its hex
readouts out of `getComputedStyle` at render time.

Change a token, re-run `pnpm ds`, push. The previews are the new truth.

## What is in dist/

| group | card |
|---|---|
| Brand | `logo` · `principles` · `iconography` |
| Colors | `colors` |
| Type | `typography` |
| Elevation | `elevation` |
| Spacing | `spacing-radius` |
| Components | the nine of `docs/COMPONENTS.md` |

The `group` is the section heading in Claude Design's Design System pane. It
comes from the marker on each file's first line, which the app compiles into its
card index:

```html
<!-- @dsCard group="Components" -->
```

That marker is load-bearing. A file without one is uploaded but never indexed.

## The brand assets

Three marks, picked by how much room there is and whether the reader already
knows what Raqt is:

| file | what | floor | for |
|---|---|---|---|
| `logo.png` | wordmark + tagline, 768×423 | ~160px wide | first contact — marketing, login, footers |
| `logotype.png` | wordmark alone, 1870×501 | ~90px wide | in-product chrome — header, nav |
| `icon.png` | the **R**, 1024×1024 | — | home screen, favicon, avatar |

The floor on the logo is set by the **tagline**, not the wordmark: it is drawn at
about a fifth of the wordmark's height and turns to mush well before **RAQT**
does. That is what the logotype is for.

`logo.png` and `logotype.png` are white-ish artwork on transparency — the first a
palette PNG whose every entry is `#FFFFFF`, the second RGBA at `#FAFAFA`.
`mask-image` reads the **alpha channel** alone, so that difference never survives.
Both are therefore alpha **masks** rather than pictures, and `foundations/logo.html`
paints them with `mask-image` and a token:

```css
.mark {
  background: var(--color-foreground);
  mask: url("data:image/png;base64,…") no-repeat center/contain;
}
```

One file per mark serves both modes and inverts by itself when the mode flips —
for the same reason an icon takes `currentColor`. A second baked PNG per mode
would be a second value nobody can find or change.

Two things the pixels say that the files don't:

- **Both are cropped tight.** `logo.png`'s ink runs to the canvas edge on three
  sides, `logotype.png`'s on two. Neither carries a built-in margin, so clear
  space is always the layout's job.
- `icon.png` carries **JPEG** bytes under a `.png` name. The emitter declares it
  honestly as `image/jpeg`; renaming it is a separate call.

`icon.png` is the one asset that stays a picture — it is opaque, carries its own
white ground, and is drawn by iOS, Android and the browser tab, none of which
know what `.raqt` is.

## Pushing to Claude Design

There is no CLI. Ask Claude Code, which has the `DesignSync` tool:

> push design-system/dist to the Raqt design system project

It reads `dist/`, locks the paths with `finalize_plan`, then `write_files`.
`/design-login` must have been run once in an interactive session.

Project: `c8b2b84e-002a-4e69-9b07-ebed10a34e03` — "Design System", owned by Nelson.

Uploading is not publishing. The **Published** toggle in Claude Design is what
makes new projects in the organization inherit this system.
