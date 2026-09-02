# Claude Design

How the Raqt design system gets into [Claude Design](https://claude.ai/design),
and who owns what once it is there.

There is no build step in this folder and nothing here is pushed anywhere. This
file is documentation.

## Who owns what

The single rule, and the one that is easy to get wrong:

> **This repository is the source. The design system inside Claude Design is
> output. Never hand-edit the output.**

| lives in | who writes it | edit it? |
|---|---|---|
| `DESIGN.md`, `docs/TOKENS.md` | you | **yes** — this is the design language |
| `tokens/source/*.json` | you | **yes** — the values |
| `components/**`, `assets/brand/**` | you | **yes** |
| `tokens/dist/`, `skills/`, `r/` | `pnpm build` | no — generated, from the above |
| everything in the Claude Design project | Claude Design | **no** — regenerated wholesale |

The Claude Design project is a *materialised snapshot*. It contains `.jsx`
components, `tokens/*.css`, `guidelines/*.html` cards and a `ui_kits/` app that
Claude wrote by reading this repo. They look editable and are not: the next
generation replaces them, and any edit made there is silently lost.

If something in Claude Design is wrong, **fix it here and regenerate.** The one
exception is Remix (below), for a change too small to justify a regeneration —
and even then, write the same fix back into this repo or it dies at the next run.

## Installing it in an organization

Anyone who can administer the target organization can do this. No CLI, no
tooling, no access to anybody's session.

In [Claude Design](https://claude.ai/design), select the organization, complete
the onboarding flow, and give it this repository:

```
https://github.com/RAQT-COM/raqt-design
```

The repo is public, so linking needs no token. Claude Design accepts a linked
codebase as source material and extracts the palette, typography, components and
spacing from it — see Anthropic's
[Set up your design system in Claude Design](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design).

Then **switch the Published toggle on**, in the organization's settings via
*Open* beside the design system. Generating is not publishing: until that toggle
is on, projects created from the Claude Design homescreen still use the default
system.

### What to put in the onboarding fields

The blurb and notes are the only steering the extractor gets, so spend them on
what it would otherwise get wrong:

- **Dark is the default mode, not an alternative.** Most systems it has seen are
  light-first; ours is the reverse.
- **The ground is near-black green-tinted ink (`#071410`), never grey.**
- **`#2BE07C` is a signal, not a wash** — one element per screen, never a plate
  behind a logo or a field of colour.
- **Two typefaces with a hard boundary**: Archivo stretched 115% at `--text-xl`
  and up, Inter below it.
- **Do not take brand colours from `assets/brand/icon.png`** — its charcoal
  `#2B2F30` is a neutral that is not in the palette.

## Updating it when the system changes

**Generation is a snapshot, not a subscription.** Linking feeds one extraction
run. Pushing to `main` afterwards changes nothing in Claude Design — no
documented mechanism re-fetches the repo.

So adding a component or moving a token means updating deliberately:

1. **Regenerate** — the default. Run it again against `main`. Orgs can hold more
   than one design system, so this is not destructive, and it is the only route
   that picks up new components.
2. **Remix** — open the design system from organization settings and use the
   *Remix* button for a chat interface. For a one-line correction where a full
   regeneration is overkill. Write the same fix back into this repo.

`/design-sync` in Claude Code can also write to a project directly, and is a
documented import path. It is per-account: whoever maintains Raqt's design system
needs `/design-login` with an account in *that* organization. Prefer regeneration
— it is reproducible by anyone with organization access and leaves no artifacts
that only one person's machine can produce.

## Things the last generation got wrong

Worth checking after any run, because they have happened:

- **A logo on a green plate.** The extractor learns from rendered examples, and a
  *picture* of a prohibited pairing reads as an example to copy — the caption
  does not survive. State prohibitions in prose; only render what is allowed.
- **Paraphrased rules.** It wrote "never recoloured" for a mark that *is*
  recoloured, from `foreground`, via its alpha channel. Read the generated
  `guidelines/*.html` before trusting them.
