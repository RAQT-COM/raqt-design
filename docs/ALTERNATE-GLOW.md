# Glow: an alternate RAQT design direction

This exploration recreates `docs/design-refs/new_startfeed.png` as React UI and
extends its visual language into Discover, Play, Profile, Messages, Achievements,
Clinics, and a broadcast destination. These are Storybook prototypes, not an
integration into the production mobile app.

## Preview

Run `pnpm install`, then `pnpm exec storybook dev -p 6007 --no-open` from this
worktree. Open **Alternate Design → Glow → Compare Themes** to switch screens
and compare dark and light. Navigation inside each phone works independently.
The original system and registry remain available alongside this exploration.

## Language

- Black canvas, one large blurred green ellipse behind content. The blob is CSS,
  not an image. Keep it behind opaque reading surfaces.
- Compact 10px card corners and 10px gutters; 157px feed tiles at the reference
  width of 402px. More expressive 19–38px corners belong to social imagery.
- Charcoal cards, a slightly lighter social surface, and navy broadcast cards.
- White, compact, bold headings. Larger 30px headings introduce destination
  screens; 16px headings maintain feed density.
- A glowing Play control anchors the navigation. Green also denotes progress,
  selection and primary actions. Avoid adding green to every card.
- Light mode uses warm off-white, white cards, an apple-green blurred background,
  and dark green text/actions. Navy broadcast cards retain their identity.

## Reuse

`components/alternate/theme.css` is the hand-authored token source. Its semantic
variables live under `.raqt-glow`; `data-theme="light"` changes the palette.
It does not overwrite `.raqt` or the existing generated theme.

`components/alternate/primitives.tsx` exports Tile, Action, IconButton, Progress,
and PageHeading. Import the primitives and wrap a new screen in the theme:

```tsx
<div className="raqt-glow" data-theme="light">
  <PageHeading eyebrow="YOUR CLUB" title="See you on court." />
  <Tile onClick={openGame}>After-work doubles</Tile>
  <Action onClick={joinGame}>Join game</Action>
</div>
```

Use Tile only for interactive cards; use a section with `glow-tile` for passive
content. Buttons have keyboard focus styles and icons have accessible labels.
Progress uses native progress semantics. Additional screen composition and the
mobile shell live in `stories/alternate/glow.tsx`.

## Prototype boundaries

Photography, avatars and ATP marks reuse the pre-existing crops supplied in the
repository. They are small reference assets, so larger placements appear soft;
replace them with source assets before production. The recreated layout is not
an exact Figma inspection: the export was the accessible source.

Venue metadata, games, points and profile details are fixtures. Search and sport
filters work locally; joining/leaving games, message sending and reminders only
change preview state. Navigation/remounting resets that state. Nothing is sent
to other users, reserved, streamed, or persisted.

## Validation

TypeScript and the production Storybook build pass. Browser review covers dark
and light rendering, screen navigation, game joining and filtering. The global
Storybook build reports its usual large-bundle advisory, not a build failure.
