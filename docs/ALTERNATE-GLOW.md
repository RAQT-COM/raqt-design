# Glow: an alternate RAQT design direction

This exploration recreates `docs/design-refs/new_startfeed.png` as React UI and
extends its visual language into Discover, Play, Profile, Messages, Achievements,
Clinics, and a broadcast destination. These are Storybook prototypes, not an
integration into the production mobile app.

## Preview

Run `pnpm install`, then `pnpm exec storybook dev -p 6007 --no-open` from this
worktree. Open **Experiments → Glow → Compare Themes** to switch screens
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
PageHeading, PlayerIdentity, and Rating. Import the primitives and wrap a new screen in the theme:

```tsx
<div className="raqt-glow" data-theme="light">
  <PageHeading title="Upcoming games" />
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

Venue metadata, games, points and profile details are fixtures. Optional search, distance, outdoor, day and open-spot
filters work locally; joining/leaving games, message sending and reminders only
change preview state. Navigation/remounting resets that state. Nothing is sent
to other users, reserved, streamed, or persisted.

## Validation

TypeScript and the production Storybook build pass. Browser review covers dark
and light rendering, screen navigation, game joining and filtering. The global
Storybook build reports its usual large-bundle advisory, not a build failure.


## Courtside rules

These rules apply to all new Glow screens and take precedence over the original
exploration’s promotional copy. The Start Feed remains the visual reference.

1. **Every word has a job.** Text identifies content, states a fact, guides an
   action, or explains an error. Omit slogans, ornamental eyebrows, redundant
   subtitles, and explanations of obvious controls. Prefer “Clubs nearby” to
   “Your next good game / Find your court / Good people. Great places to play.”
2. **Show small choices; collapse large sets.** For a single-choice set with four
   or fewer options, show every option: one tap and the alternatives stay visible.
   With more than four, collapse the set into a menu, sheet, search or progressive
   filter flow. Toggles and checkboxes are reserved for genuine independent or
   multi-select choices. Static status is never styled like a selectable pill.
3. **Recognize before reading.** Pair players with avatars, using initials when
   no photo exists. Pair every DUPR value with a singles or doubles icon and an
   accessible format label. Use consistent icon meanings and a short visible
   label for unfamiliar concepts. Color reinforces meaning; never carries it
   alone. These previews use generic one/two-person icons, not an official DUPR
   brand asset. All ratings are fixtures.
4. **No keyboard required for the common path.** Prioritize useful defaults and
   visible small choice sets. Keep name search available on demand. Freeform
   messages can use an input; do not replace necessary input with awkward menus.
5. **Hierarchy over symmetry.** Prioritize one next action. Mix featured cards
   with compact rows and group related facts; do not give everything equal size,
   equal emphasis, or its own box. Keep alignment consistent within each group.
   Give most of the first viewport to the content named by the page: tournaments
   on Tournaments, scores on Scores, and the next match on My matches. Secondary
   controls should normally consume one compact row. They may expand temporarily
   after the user asks for search or advanced filtering.
6. **Fast response.** Use 120–180ms; the theme uses 150ms and an overshooting
   cubic-bezier for press feedback. No 300ms ease-in-out. Do not delay actions
   until animations finish. Respect reduced-motion preferences.
7. **Restrained diagonals.** The angled blurred background does most of the
   work. Small angled accents may establish priority. Never skew scores, body
   text, fields, touch targets or every card.
8. **Functional content sits on a surface.** The blob and gradients are
   atmosphere. Titles, filters, statuses, score rows and actions belong inside a
   card, bar, sheet or another clearly bounded component. Empty space may separate
   components, but text must not look accidentally placed on the wallpaper.

## Additional recommendations for tournament use

- Default the product to light/system for daytime use, with a persistent theme
  preference. Validate both themes outside on real phones before rollout.
- Aim for 44–48px touch targets and 16px reading text. Court assignments and
  scores should be larger. Support text scaling rather than clipping long names.
  The reference feed’s small captions are an exploration artifact, not a model
  for essential match information.
- During an event, put the player’s court, time, opponent (avatar + name), match
  status and next action above recommendations and social content. Keep positions
  stable as scores update. Use tabular numerals for scores and times.
- Distinguish “saved on device”, “syncing”, and “confirmed” when implementing score
  entry; offer undo. Do not imply a server accepted an action before it did.
- Preserve filters and position when going back. Use explicit labels for risky
  actions and make normal navigation forgiving. Prototype state is not persisted.
- Use a consistent doubles/singles vocabulary and explain DUPR on demand for
  newcomers. Ratings should not replace a player’s identity.
- Test key tasks with younger/older and experienced/inexperienced users, outdoors
  and with one hand. Validate “find my court”, “find my opponent”, and “enter a
  score”, rather than asking only whether people like the appearance.

## Product signature

To keep the platform specific to pickleball rather than resembling a generic
template, derive recurring forms from the sport and real tournament operations:

- Make the personal tournament card the home-screen anchor: next match, court,
  opponent, warm-up/start time and one action. When a match is live, it replaces
  promotional content at the top.
- Treat tournament discovery as an entry board. Show date, location, format,
  DUPR band, remaining spots and entry state. Those facts decide whether someone
  can participate; decorative descriptions do not.
- Give scores their own visual grammar: stable player rows, avatars, tabular
  numerals, game columns, serve/live markers and a distinct final state. Never
  render a score as ordinary body copy.
- Build a small, owned pickleball icon set for paddle, ball, court, singles,
  doubles, serve, bracket and medal. Use Lucide for common interface actions,
  then replace generic sport symbols with the owned set before production.
- Use regulation court geometry as a quiet motif: kitchen-line proportions,
  baseline blocks and a perforated-ball dot pattern. Apply it to separators,
  loading states, empty illustrations and broadcast panels, not every card.
- Keep real names, club names, Swedish date/time conventions and believable
  tournament states in design fixtures. Perfectly balanced cards, repeated
  marketing phrases and generic avatars make a product feel synthetic.
- Design interruption states as first-class screens: delayed court, opponent
  absent, match ready, score disputed, offline score pending and event complete.
  A sports product feels credible when it handles the messy parts of play.

WCAG reference: https://www.w3.org/TR/WCAG22/ (contrast, use of color, target size,
text resizing, and status messages). The 44–48px target above is a product design
recommendation, not a claim that WCAG AA requires 48px. No conformance audit has
been performed.
