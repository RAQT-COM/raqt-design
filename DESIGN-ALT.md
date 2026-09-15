# RAQT — alternative design language

Built from four frames: the
[start feed](docs/design-refs/new_startfeed.png) (rebuilt as
[Experiments / Start Feed](stories/experiments/start-feed.tsx)) and the
tournament screens in [`docs/screen-refs/`](docs/screen-refs). It does **not**
use the token contract in `DESIGN.md`.

Rules are written to be checkable in review. If a rule can't fail a PR, it isn't
a rule yet.

> **This is not the design system.** Everything here lives behind
> `RAQT_EXPERIMENTS=1` — excluded from the published Storybook and refused by
> the Claude Design sync. `DESIGN.md` and the token contract are unaffected.
> Run these screens with `pnpm storybook:experiments`.

> **(measured)** = sampled from a reference frame. Everything else is proposed.
> Open contradictions between the frames are listed at the bottom.

---

## 1. Voice

- Category label + title. Never a selling subtitle.
- No taglines, no encouragement, no exclamation marks in chrome.
- Nouns, not sentences. "Clinics", not "Find a clinic near you".
- Never write what an icon already says.
- If a string exists to set a mood, delete it.

## 2. Type

Two faces, and only two.

- **Display** — page titles, section labels, names at size. Heavy, tight,
  closed apertures, echoing the wordmark. This face carries the brand.
- **Inter** — everything else. Stays legible at 9px, and is deliberately
  anonymous.

Rules:

- Page titles are **ALL CAPS display**, two lines max. **(measured)**
- Section labels are ALL CAPS display at 11px. **(measured: "MIXED",
  "SINGLES", "GROUPS")**
- Scale: `9 / 11 / 13 / 16 / 22 / 32 / 48+`. **(measured: 9, 10, 11, 13.5, 16)**
- Leading ≤ 1.15 at 16px and up. **(measured: 16/17)**
- Max two type sizes per card.

Tight leading is doing real work — it reads dense and athletic. Loose leading
reads editorial, which is the wrong sport.

## 3. Colour

- **One green**, `#3fe176` **(measured)**. Live, positive, actionable, won.
  Nothing else on screen is saturated. Two greens on one screen is a bug.
- Neutrals carry structure: `#282828` surface, `#1c1c1c` recessed, `#333333`
  raised, `#464646` track. **(measured)**
- **A different surface means someone else's content.** Partner and broadcast
  tiles sit on navy `#0f192b`; RAQT's own content never does. **(measured)**
- **One blurred green band, behind every screen.** It belongs to the app, not to
  a screen. Navigating moves and rotates it rather than replacing it, so the
  background is one continuous place the screens travel across. It sits behind
  opaque cards, so it only ever shows through gutters and margins — never behind
  text.
- Status red is reserved for live and destructive. It is not a brand colour.
- **Two grounds, one brand.** Light is a warm off-white `#f2f1ea`, never pure
  white — white with grey cards is the most generic light UI there is. What does
  *not* move between grounds: the green fill, the PLAY gradient, the points
  sparkle and the partner navy. A value that changes when the lights come on was
  never a brand value.
- **Surfaces are translucent, so the band shows through them.** A card is not
  decorated to look like the screen — it is made of the screen, and its tint
  changes as it scrolls past the band. Controls are the most transparent:
  opaque chrome sitting on an atmospheric ground is what reads as pasted on.
  Only `raised` is solid, because it sits on photography rather than on the
  band.
- Green as a **fill** is `#3fe176` on both grounds. Green as **foreground** has
  its own value, because `#3fe176` on white is unreadable.
- Surfaces lift off the ground in both directions: recessed is darker than the
  card, raised is lighter. On light that inverts arithmetically, not
  semantically — a closed tournament is still *recessed*, whichever ground it
  sits on.

## 4. Photography and icons

The least forgeable thing you own. Protect it.

- Real players. Real courts. Never stock, never posed.
- Mid-action or mid-conversation. Nobody looks at the lens.
- Faces visible and identifiable — this is a social product.
- Every photo is a specific person, place or session. No decorative texture.
- No illustration, no 3D render, no generated imagery. Anywhere.
- **No emoji as iconography.** Medals, counts and states are drawn icons.

**Warmth comes from faces, not words.** This is the rule that makes the terse
voice survivable. Strip the photography and the app turns cold, and no other
rule will catch it.

## 5. Results and numbers

**Outcome reads before the score.** In any result, the eye finds who won without
reading a digit. **(measured: bracket rows)**

- Winner: full white name + green `WIN`. Loser: dimmed. Never rely on position.
- Scores are supporting detail — small, right-aligned, never the headline.
- A number is set large only when it *is* the subject: a DUPR rating, a final
  score on a winner card, a streak, a count.
- A number gets an icon or a one-word unit. Never an explaining sentence.
- DUPR always ships with the duo/singles icon. A player always ships with an
  avatar. **(measured)**
- Numbers that change while you watch roll. They never cross-fade.

## 6. Layout

- Bento grid. 10px gutters, 20px radius. **(measured)**
- Screen margin: 15px on content screens, 10px on the feed. **(measured — see
  contradiction 6)**
- Exactly one element per screen is unambiguously most important, and is sized
  like it. Asymmetry is the *result* of this, never the goal.
- **Cards may be under-filled.** Empty space inside a card is a decision, not a
  gap to close. **(measured: the hero tile is mostly nothing)**
- Padding is chosen by eye per component against its content — not inherited
  from a global spacing scale. **(measured: 13px tiles, 7px photo tile, 25px
  message card)**
- Horizontal sets cut off mid-item at the screen edge to show they continue.
  **(measured: bracket rounds)**
- **In a scrolling list, the gap between two cards must be clearly larger than
  the largest gap inside one.** Otherwise proximity groups the wrong things and
  a card's text reads as belonging to the next card's photo. 20px between, ≤14px
  within. **(this is why the first pass of the tournament list failed)**
- **A full-bleed photo is not a card edge.** Inset the photo so the card's own
  surface frames it on all four sides, and give it the next radius down —
  20px card, 13px photo. The frame is what binds the photo to its text.
- Elevation is surface *and* edge together, not surface alone. A card on the
  band needs `border-[var(--hairline)]` or its boundary disappears exactly where
  the green is strongest.
- Elements separate by surface and weight, not by dividers.

## 7. Motion

One curve, everywhere. Taken from the ball: hard plastic, pops, stops dead —
fast out, abrupt settle, almost no bounce-back.

| Tier | Duration | Where |
|---|---|---|
| Tap | 80–120ms | Every interactive element, no exceptions |
| Navigate | 180–220ms | Directional, so it says where you went |
| Celebrate | 400–800ms | Match found, game starting, point won — rare |

- Never `ease-in-out`. Never 300ms.
- No ambient motion, no idle drift, no scroll-triggered reveals.
- **No exceptions, including the backdrop.** The band travels and rotates on the
  same clock as the screen in front of it. A background still moving after the
  content has landed reads as lag, not depth — and lag is the one thing this
  brand cannot afford.
- Expressive choreography lives in Celebrate only. Frequency and personality are
  inversely proportional.

## 8. Diagonals

- **The band carries the angle, and it is keyed to navigation depth — not to the
  screen.** A footer destination gets −33° **(measured)**; a screen pushed on
  top of one gets −13°; a detail inside that gets −5°. Going deeper flattens and
  raises the band; going back steepens and drops it.
- Depth, not screen name, is what makes this scale: twenty screens still need
  only three poses, and nobody invents an angle.
- A screen has exactly one angle. Any foreground diagonal on it matches the
  band. Two angles on one screen means one is wrong.
- Background and structural elements only. Never on text blocks or tap targets.
- **A card catches the band's light along the same angle.** `--sheen` is a green
  streak across the top of any card carrying a block of text, and its angle is
  published by `Screen` from the band pose — so a card physically cannot
  disagree with the screen it is on. It is what stops a large text surface
  reading as a blank slab.

## 9. Controls

Assume the user is on a phone, mid-tournament, in a hurry.

- **The footer is identical on every screen** — four destinations either side of
  PLAY. PLAY is the brand's primary action and never disappears. Anything
  screen-specific (a back button, a participant count, notifications) belongs in
  the header instead.
- One full-width segmented control per screen for view switching. Three segments
  max. **(measured)**
- Other filters: ≤ 4 options show all, > 4 collapse to a sheet.
- Selection beats typing. Text input only for search-by-name and freeform
  messages.
- A filter shows its current state without being opened.

## 10. States

Adopted from `DESIGN.md` §4 rule 8, because this spec had a whole section on
motion and nothing on states — and every control built against it was keyboard-
unusable as a result.

- An interactive thing is not done until it has **rest, hover, active,
  `focus-visible`** and, where it can occur, **disabled**.
- **Focus is never removed without a replacement.** `outline-none` with nothing
  in its place is a defect, not a visual preference. One treatment, defined once
  as `FOCUS` in `theme.ts`, used everywhere.
- **If it has a press state, it is a control.** A `<div>` that scales on tap is
  a button that forgot to say so — it cannot be reached, focused or activated
  from a keyboard.
- A thing that shows data is not done until it has **loaded, loading and
  empty**.

## 11. Surfaces and light

Adopted from `DESIGN.md` §4 rule 3, which predicted a bug this spec shipped.

- **A surface step separates a box from the box around it. It cannot carry
  emphasis inside a box**, because on the light ground the surfaces converge.
  Emphasis within a card comes from ink tier, weight, or the recessed step —
  never from "raised".
- Three levels is the whole ladder: recessed, surface, raised. A design needing
  a fourth is too deep; flatten it.
- **Anything portalled has to re-establish the ground.** The tokens are custom
  properties set on `Screen`. A sheet, popover or dialog that portals to
  `document.body` lands outside them and silently loses every colour.
- Light does not create mode bugs, it reveals rule breaks that were already
  there. Design on dark, check on light before calling it done.

## 12. The marks

Adopted from `DESIGN.md` §6 — the correct solution already existed and this
spec was flipping the wordmark with a CSS filter instead.

- The lockups are **masks, not pictures**. `logotype.png` is near-white artwork
  on transparency; only the alpha carries the shape. Paint it from a token with
  `mask-image`, and one file serves both grounds and inverts itself.
- The mark takes the ink colour. Never green — a logo is not an action.
- Neither file carries a margin. Until the brand ratifies a figure, leave the
  cap height of the wordmark clear on all four sides.

## 13. Adding a screen

- **Render it as a `<Screen depth={n}>`.** That is what supplies the backdrop,
  the status bar and the footer. Never assemble those yourself — a screen should
  get the chrome right by existing, not by remembering to.
- **Ground comes from `mode`** (`"dark"` | `"light"`), set once on the `Screen`.
  Never write a raw hex for a surface, a text tier or the backdrop — those are
  `var(--surface)`, `var(--ink-dim)` and so on, and hardcoding one is what breaks
  the other ground.
- **`depth` is how far in you are**: `0` a footer destination, `1` pushed on top
  of one, `2` a detail inside that. It selects the band pose. You do not pick an
  angle or a position.
- Screen-specific chrome — a back button, a count, notifications — goes in the
  header. The footer never changes.
- Margin is 15px on content screens, 10px on the feed (contradiction 6).

---

## Review checklist

- [ ] Any string that only sets a mood?
- [ ] More than one saturated colour?
- [ ] Can you name the single most important element?
- [ ] Can you tell who won without reading a score?
- [ ] Any player without an avatar, any DUPR without its icon?
- [ ] Any emoji standing in for an icon?
- [ ] Any transition over 220ms outside Celebrate?
- [ ] Any generated or illustrated imagery?
- [ ] Could a user finish this task without typing?
- [ ] Is the screen a `Screen`, with a `depth` that matches where it sits?
- [ ] Does it hold up on both grounds, with nothing hardcoded that should flip?
- [ ] Does every control have focus, hover and press — and is anything with a
      press state actually a control?
- [ ] Does anything portalled still have the ground?

## Open contradictions

The reference frames disagree. These need a decision, not a rule:

1. **Segmented selection.** Results index and Eliminations use a grey selected
   segment; Groups uses white-on-black. Pick one.
2. **Footer active state.** The footer is now consistent, but no tab is marked
   as current — the reference frames show every icon at full white, and which
   destination owns the start feed is undecided. Needs an IA call, not a rule.
3. **Green.** The `Register now` button reads lighter than the feed's
   `#3fe176`. If they're meant to be the same green, they aren't yet.
4. **Medals are emoji** on the Groups screen, which breaks §4. Placeholder, or
   intended?
5. **`See all participants..`** — trailing double dot appears on two screens.
   Ellipsis, or drop it?
6. **Screen margin.** The feed uses 10px, all three tournament screens use 15px.
   Two values is one too many.
7. **Caption floor.** `DESIGN.md` sets one at 10px and says it exists because
   designs kept landing below it and getting hand-written as raw px. This spec
   uses 9px for "+ 12 online now". Raise it or argue for it.
8. **The Clinics tile has three type sizes** — 10px label, 16px title, 9px
   "+ 12 online now" — against §2's max of two. The reference frame does this,
   so either §2 is too strict or the tile is wrong. Cannot be both.
9. **The points sparkle is a yellow-to-green gradient**, which puts a second
   saturated hue on screen against §3. It is measured from the reference and
   it is a brand mark, so it is probably a documented exception — but it is
   currently an undocumented one.
10. **Neither screen has a loading state.** §10 requires loaded, loading and
    empty. Search has empty; nothing has loading, because nothing fetches yet.
11. **Display face.** §2 asks for a face that echoes the wordmark; nothing has
   been chosen. Archivo is standing in. This is the largest remaining gap.
