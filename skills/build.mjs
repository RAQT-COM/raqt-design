// Emits skills/raqt-design/SKILL.md — the design language as a project-level
// agent skill, for the repos that consume this registry.
//
// Generated for the same reason tokens/dist/ is. The rules already have one home
// in DESIGN.md; a hand-written skill would be a second copy of them, and the copy
// that drifts is always the one nobody is reading while they edit. So §2, §4 and §5
// are lifted out of DESIGN.md verbatim, the component inventory is lifted out of
// registry.json, and the only prose written here is the part that has no other
// home: what changes once the system is installed in somebody else's repo.
//
// Committed, not gitignored — the registry serves it out of git, so it has to be
// on main for `shadcn add` to find it. `pnpm build` regenerates it and `ship`
// refuses to publish if the result is dirty.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const DESIGN = readFileSync(join(root, "DESIGN.md"), "utf8");
const REGISTRY = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"));

/**
 * One `## ` section of DESIGN.md, heading dropped, trailing `---` rules trimmed.
 * Dies loudly rather than emitting a skill with a hole in it: a silently missing
 * section is a rule the consuming agent never sees.
 */
function section(title) {
  const heads = [...DESIGN.matchAll(/^## (.+)$/gm)];
  const i = heads.findIndex((h) => h[1].trim() === title);
  if (i === -1) {
    throw new Error(
      `DESIGN.md has no "## ${title}" section. Found: ${heads.map((h) => h[1]).join(", ")}`,
    );
  }
  const from = heads[i].index + heads[i][0].length;
  const to = i + 1 < heads.length ? heads[i + 1].index : DESIGN.length;
  return DESIGN.slice(from, to).replace(/\n---\n/g, "\n").trim();
}

/* Where a consumer can actually reach this repo's material, derived from the
   registry's own homepage so it cannot disagree with where items resolve from. */
const REPO_URL = (REGISTRY.homepage ?? "").replace(/\/+$/, "");
const ADDRESS = (() => {
  const m = /github\.com\/([^/]+\/([^/]+?))(?:\.git)?$/.exec(REPO_URL);
  if (!m) throw new Error(`registry.json homepage is not a GitHub URL: ${REGISTRY.homepage}`);
  return m[1];
})();
const [OWNER, REPO_NAME] = ADDRESS.split("/");
const STORYBOOK = `https://${OWNER.toLowerCase()}.github.io/${REPO_NAME}`;

/**
 * A lifted section still points at paths in *this* repo — `docs/TOKENS.md`, the
 * Storybook page — and a consuming repo has neither on disk. Repoint them at
 * something the reader can actually open. Every pattern must hit: a rewrite that
 * silently misses ships a dead reference to every consumer.
 */
const LINKS = [
  [/`docs\/TOKENS\.md`/g, `[the token contract](${REPO_URL}/blob/main/docs/TOKENS.md)`],
  [
    /the Storybook \*Foundations → Iconography\* page/g,
    `[Foundations → Iconography](${STORYBOOK}) in Raqt's Storybook`,
  ],
];

const reroot = (md) => LINKS.reduce((out, [pattern, to]) => out.replace(pattern, to), md);

/**
 * The rewrites above are per-section, so none of them is individually required.
 * What *is* required is that nothing repo-local survives into the finished file:
 * a path only this repo has is a dead reference in every consuming repo, and
 * DESIGN.md is free to grow new ones between builds.
 */
const DANGLING = [/(?<!\/)\bdocs\/[A-Z]+\.md\b/, /\bStorybook \*/, /\bPLAN\.md\b/, /\bCONTEXT\.md\b/];

function assertSelfContained(md) {
  const body = md.replace(/\]\(https?:\/\/[^)]+\)/g, "]()"); // already-absolute links are fine
  const dead = DANGLING.filter((p) => p.test(body)).map((p) => `${p} → ${body.match(p)[0]}`);
  if (dead.length) {
    throw new Error(
      `SKILL.md still points at paths only this repo has:\n  ${dead.join("\n  ")}\n` +
        `Add a rewrite to LINKS, or reword DESIGN.md.`,
    );
  }
}

/* The inventory is registry.json's job: it is what `shadcn add` can actually
   resolve, and its descriptions are already written for a reader deciding
   whether an item is the one they want. */
const components = REGISTRY.items.filter((i) => i.type === "registry:ui");
const inventory = components
  .map((i) => `### \`${i.name}\`\n\n${i.description}`)
  .join("\n\n");

const SKILL = `---
name: raqt-design
description: >-
  Raqt design language — the rules for building UI with the Raqt tokens and
  components installed in this repo. Use when writing or changing any interface
  here: picking a colour, surface, radius, spacing or type step; building
  something the Raqt library does not already have; wiring hover, focus,
  disabled, loading or empty states; or when a component renders wrong in light
  mode or inside a portal.
---

<!-- GENERATED from DESIGN.md and registry.json by skills/build.mjs in
     ${ADDRESS}. Edits here are overwritten by the next \`pnpm build\` and never
     reach anyone else — raise the change against DESIGN.md instead. -->

# Raqt design language

Everything below is the contract, not advice. **Apply every rule** — a component
that breaks one still compiles, still looks fine in dark mode, and fails the
moment somebody flips the theme or drops it in a portal.

## What is installed here

Raqt arrives through a [shadcn registry](https://ui.shadcn.com/docs/registry),
so the components are **files in this repo**, not a package:

| | |
|---|---|
| components | \`@/components/raqt/*\` — *not* \`@/components/ui/*\`, which stays this app's own |
| theme | \`@/styles/raqt-theme.css\`, imported after the app's own stylesheet |
| add one | \`pnpm dlx shadcn@latest add ${ADDRESS}/<name>\` |

Two consequences that only exist on this side of the registry:

**The theme paints \`.raqt\` and nothing else.** A Raqt component rendered outside
that scope inherits this app's palette and looks broken. Opt a subtree in:

\`\`\`tsx
<div className="raqt bg-background text-foreground">…</div>
\`\`\`

Dark is the default; add \`light\` alongside it for a light surface
(\`className="raqt light"\`).

**Files under \`@/components/raqt/\` are replaced wholesale on the next sync.**
Editing one is work that will be silently reverted. Wrap it, compose around it,
or raise the gap upstream — which is what rule 1 means by a contract change.

## Component inventory

Reach for one of these before building anything. \`field\`, \`skeleton\` and
\`empty-state\` exist so that covering the unhappy states is cheaper than skipping
them.

${inventory}

## Token reference

This table is the whole vocabulary — a name that is not in it does not exist.

${reroot(section("2. Token reference"))}

## Rules for inventing

${reroot(section("4. Rules for inventing"))}

## Iconography

${reroot(section("5. Iconography"))}
`;

assertSelfContained(SKILL);

const out = join(here, "raqt-design", "SKILL.md");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, SKILL);
console.log(
  `skill: ${SKILL.split("\n").length} lines → skills/raqt-design/SKILL.md ` +
    `(${components.length} components, 3 sections lifted from DESIGN.md)`,
);
