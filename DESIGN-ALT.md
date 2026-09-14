# RAQT — alternative design language

Built from four frames: the
[start feed](docs/design-refs/new_startfeed.png) (rebuilt as
[Experiments / Start Feed](stories/experiments/start-feed.tsx)) and the
tournament screens in [`docs/screen-refs/`](docs/screen-refs). It does **not**
use the token contract in `DESIGN.md`.

Rules are written to be checkable in review. If a rule can't fail a PR, it isn't
a rule yet.

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
- **One blurred green blob, behind every screen.** It belongs to the app, not
  to a screen: each screen parks it somewhere different, and navigating moves it
  rather than replacing it. It sits behind opaque cards, so it only ever shows
  through gutters and margins — never behind text.
- Status red is reserved for live and destructive. It is not a brand colour.

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
- **One exception: the backdrop.** The blob is further away than the UI, so it
  lags — content snaps at ~200ms while the blob drifts over ~620ms. That
  difference is what reads as depth. Nothing else gets an exception.
- Expressive choreography lives in Celebrate only. Frequency and personality are
  inversely proportional.

## 8. Diagonals

- One angle across the whole app: ~33° from horizontal. **(originally measured
  off the backdrop wash, which is now a blob — see contradiction 7)**
- Background and structural elements only. Never on text blocks or tap targets.
- If a screen has two angles, one is wrong.

## 9. Controls

Assume the user is on a phone, mid-tournament, in a hurry.

- One full-width segmented control per screen for view switching. Three segments
  max. **(measured)**
- Other filters: ≤ 4 options show all, > 4 collapse to a sheet.
- Selection beats typing. Text input only for search-by-name and freeform
  messages.
- A filter shows its current state without being opened.

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

## Open contradictions

The reference frames disagree. These need a decision, not a rule:

1. **Segmented selection.** Results index and Eliminations use a grey selected
   segment; Groups uses white-on-black. Pick one.
2. **Bottom nav.** The start feed has five items with a centre PLAY button; all
   three tournament screens have four and no PLAY. Is PLAY home-only?
3. **Green.** The `Register now` button reads lighter than the feed's
   `#3fe176`. If they're meant to be the same green, they aren't yet.
4. **Medals are emoji** on the Groups screen, which breaks §4. Placeholder, or
   intended?
5. **`See all participants..`** — trailing double dot appears on two screens.
   Ellipsis, or drop it?
6. **Screen margin.** The feed uses 10px, all three tournament screens use 15px.
   Two values is one too many.
7. **Where the 33° comes from.** The diagonal was derived from the backdrop
   wash. The backdrop is now a blob with no angle, so the number is currently
   orphaned — either re-anchor it to something or drop §8.
8. **Display face.** §2 asks for a face that echoes the wordmark; nothing has
   been chosen. Archivo is standing in. This is the largest remaining gap.
