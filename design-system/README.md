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

## Installing it in a Claude Design organization

**The route to hand someone else for the initial install.** It needs no CLI and
no tooling — only that the person doing it can administer the target
organization. See [Updating it afterwards](#updating-it-afterwards) for what
happens when the system changes, because this step does not repeat itself.

In [Claude Design](https://claude.ai/design), pick the organization, complete the
onboarding flow, and give it this repository:

```
https://github.com/RAQT-COM/raqt-design
```

The repo is public, so linking needs no token. Claude Design accepts a linked or
uploaded codebase as source material and extracts colour, typography, components
and spacing from it — see Anthropic's
[Set up your design system in Claude Design](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design).

`design-system/dist/` is **committed** precisely so this route works: linking the
repo exposes the sixteen rendered cards and `globals.css` directly, rather than
leaving Claude Design to infer the system from Tailwind class strings and a CSS
file full of `@theme` at-rules. If uploading rather than linking, upload that
folder plus `DESIGN.md`, `docs/TOKENS.md` and `assets/brand/`.

Then **switch the Published toggle on** — in the organization's settings, via
*Open* beside the design system. Uploading is not publishing: until that toggle
is on, projects created from the Claude Design homescreen still use the default
system.

## Updating it afterwards

**Generation is a snapshot, not a subscription.** Linking this repo feeds one
extraction run — the "this will take about 5 minutes" step — and what comes out
is a materialised project of files. Pushing to `main` afterwards changes nothing
in Claude Design. None of Anthropic's three Claude Design articles documents a
linked repository re-syncing, and the design system project we have contains
generated artifacts (`_ds_manifest.json`, `_ds_bundle.js`) rather than a view
onto git.

So adding a tenth component means updating the design system deliberately. Three
ways, in order of how well they fit this repo:

1. **`/design-sync` in Claude Code** — the documented import path, and the only
   incremental one: it diffs and pushes a component at a time rather than
   replacing wholesale. Run `pnpm ds` first, then ask Claude Code to push
   `design-system/dist`. Requires `/design-login` once, with an account that can
   write to the target design system.
2. **Remix** — open the design system from organization settings and use the
   *Remix* button for a chat interface to adjust it. Good for wording and
   arrangement; not for re-importing sixteen regenerated cards.
3. **Generate again** — organizations can hold more than one design system, so a
   fresh run against the updated repo is a legitimate reset. Blunt: it discards
   any Remix edits.

Route 1 is why `pnpm ds` exists. Change a token, re-run it, push — the cards are
regenerated from `tokens/dist/theme.css`, so they cannot drift from the contract.

Whoever maintains Raqt's design system needs an account in *that* organization
for route 1; it is per-account access, not a property of this repo.

Project id for this repo's own copy:
`c8b2b84e-002a-4e69-9b07-ebed10a34e03` — "Design System", owned by Nelson.
