# Glossary

The words this project uses, and what each one names. Nothing else lives here —
no implementation detail, no rationale. For the design language read
[`DESIGN.md`](DESIGN.md); for values, [`docs/TOKENS.md`](docs/TOKENS.md).

One rule made the rest of this list possible: **"design system" is the umbrella
and names no artifact.** When it was also a repo, also a Storybook, and also a
thing inside Claude Design, every sentence containing it had to be disambiguated
by tone of voice.

## The system

**design system** — the shared visual language: the tokens plus the rules for
inventing with them (`DESIGN.md` §4). Generative, not a list of parts. It does
**not** include the nine components.

**component library** — the nine components. Built *with* the design system, not
part of it. Finite, and replaceable; the design system is what survives it.

**icon library** — `lucide-react`. The one family the system draws glyphs from.
Not authored here, and not a component: it is a dependency two components
already carry.

**icon set** — the curated vocabulary, one glyph nominated per concept Raqt
names. The library is what is *available*; the set is what is *used*. It is
documented rather than coded — the register is the Storybook Iconography page
and `DESIGN.md` §5, not a module.

## Where it is authored

**`raqt-design`** — this repository, by proper noun. Authors both the design
system and the component library.

**token contract** — `docs/TOKENS.md`. The document that fixes the values.
Changing a value here changes it everywhere; changing a *name* is a
renegotiation.

**tokens** — `tokens/source/*.json`. The authored source, in two layers:
primitives (the raw ramps) referenced by semantics (the only layer components
touch).

**theme** — the emitted CSS, `tokens/dist/theme.css`, shipped as a registry item.
*The theme crosses the boundary; the tokens stay here.*

## Where it is seen

**Storybook** — where the design system and the component library are rendered
for humans. The foundations pages, one story per component state, and one
**playground** per component — the same component with every prop on a control,
where the state pages show the design and the playground shows the API.

## How it travels

**registry** — `registry.json` and the `r/` files emitted from it by
`shadcn build`. The one channel that exists: the mechanism by which the system
reaches a consumer, over `shadcn add`.

**consumer** — anything that depends on this repo, whether through the registry
or otherwise. `raqt-public` is the first one.

**Claude Design system** — a consumer that does not exist yet. Its role is known
(it would depend on this repo); its mechanism is not. Listed because
"Claude Design system" is the phrase that collapses back into "design system" in
conversation, and it should not be allowed to.
