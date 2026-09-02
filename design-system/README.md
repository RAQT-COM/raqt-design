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

`assets/brand/logo.png` is white artwork on transparency — every palette entry is
`#FFFFFF` and only the alpha varies. That makes it an alpha **mask** rather than a
picture, so `foundations/logo.html` paints it with `mask-image` and a token:

```css
.mark {
  background: var(--color-foreground);
  mask: url("data:image/png;base64,…") no-repeat center/contain;
}
```

One file serves both modes and the mark inverts by itself when the mode flips —
for the same reason an icon takes `currentColor`. A second baked PNG would be a
second value nobody can find or change.

`assets/brand/icon.png` carries **JPEG** bytes under a `.png` name. The emitter
declares it honestly as `image/jpeg`; renaming it is a separate call.

## Pushing to Claude Design

There is no CLI. Ask Claude Code, which has the `DesignSync` tool:

> push design-system/dist to the Raqt design system project

It reads `dist/`, locks the paths with `finalize_plan`, then `write_files`.
`/design-login` must have been run once in an interactive session.

Project: `c8b2b84e-002a-4e69-9b07-ebed10a34e03` — "Design System", owned by Nelson.

Uploading is not publishing. The **Published** toggle in Claude Design is what
makes new projects in the organization inherit this system.
