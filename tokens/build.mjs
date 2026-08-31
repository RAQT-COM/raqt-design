// Raqt token emitter. Reads tokens/source/*.json, resolves {color.x.y} references
// against the primitive layer, and writes tokens/dist/. Deterministic: same input,
// byte-identical output. Contract: docs/TOKENS.md — values live there, not here.
//
// The same tokens are emitted twice, under two ownership models — that split is the
// point of this file, not an accident of packaging:
//   theme.css   the distributable, shipped by the registry as `raqt-theme.css`. Paints
//               `.raqt` and nothing else, so it can land in an app that already has a
//               theme without moving a single pixel outside the scope.
//   tokens.css  Storybook's entrypoint, where Raqt owns the page: imports Tailwind and
//               theme.css, then claims `:root` so dark is the default with no class on
//               <html> and no change to `.storybook/`.
//   tokens.ts   the same values as a typed object, for stories that need them in JS.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = (name) => JSON.parse(readFileSync(join(here, "source", name), "utf8"));
const dist = (name) => join(here, "dist", name);

const primitives = src("primitives.json");
const semantic = src("semantic.json");

/* ---------- reference resolution ---------- */

const at = (path) =>
  path.split(".").reduce((node, key) => {
    if (node == null || !(key in node)) throw new Error(`unknown primitive: {${path}}`);
    return node[key];
  }, primitives);

const resolve = (value) => {
  const ref = /^\{([^}]+)\}$/.exec(value);
  return ref ? at(ref[1]) : value;
};

/** {name, dark, light} for every two-mode token, in source order. */
const modal = (group, prefix) =>
  Object.entries(semantic[group])
    .filter(([key]) => !key.startsWith("_"))
    .map(([key, { dark, light }]) => ({
      name: `${prefix}${key}`,
      dark: resolve(dark),
      light: resolve(light),
    }));

const colors = modal("color", "--color-");
const shadows = modal("shadow", "--shadow-");

/* ---------- CSS ---------- */

const decls = (pairs, indent = "  ") =>
  pairs.map(([name, value]) => `${indent}${name}: ${value};`).join("\n");

const { font, display, text, radius, radiusDefault, spacing, shadcnStandard } = semantic;

// Names stock shadcn/Tailwind already owns. See the note in semantic.json: the
// distributable must leave these alone at the Tailwind-theme level.
const standard = new Set(shadcnStandard.names);
const raqtOnly = colors.filter((t) => !standard.has(t.name.slice("--color-".length)));

// Scales that exist in every Tailwind install. Like the standard colours, they are
// retinted by redefining the property, never by re-registering the name.
const scales = [
  ["--font-sans", font.sans],
  ...Object.entries(text).flatMap(([step, t]) => [
    [`--text-${step}`, t.size],
    [`--text-${step}--line-height`, t.lineHeight],
  ]),
  ...Object.entries(radius).map(([step, value]) => [`--radius-${step}`, value]),
  ["--spacing", spacing.base],
];

// Not Tailwind theme keys at all, so they need writing out wherever values are set.
//  - `--shadow-*`: Tailwind inlines theme shadow values into the utility to splice in
//    the shadow colour, which would freeze elevation to whichever mode built it. Owning
//    the utility keeps `shadow-e1` reading the live property, so it flips with the mode.
//  - `--font-display`: a utility rather than a `--font-*` key so the family can never be
//    applied without the width and tracking (docs/TOKENS.md).
//  - `--radius`: shadcn's bare alias, which hand-pasted shadcn CSS still references.
const extras = [
  ["--font-display", font.display],
  ["--radius", radius[radiusDefault]],
];

const utilities = [
  ...shadows.map((s) => `@utility ${s.name.slice(2)} {\n  box-shadow: var(${s.name});\n}`),
  [
    "@utility font-display {",
    "  font-family: var(--font-display);",
    `  font-stretch: ${display.stretch};`,
    `  letter-spacing: ${display.tracking};`,
    "}",
  ].join("\n"),
].join("\n\n");

// shadcn's v4 theme file names its colours bare (`--primary`) and maps them with
// `@theme inline`, in which case the host's `bg-primary` compiles to `var(--primary)`
// and retinting `--color-primary` alone would do nothing. Emitting both spellings
// inside the scope covers either convention. Scope-local, so it costs the host nothing.
const alias = (t, mode) => [`--${t.name.slice("--color-".length)}`, t[mode]];
const standardColors = colors.filter((t) => standard.has(t.name.slice("--color-".length)));

const scopeDark = [
  ...colors.map((t) => [t.name, t.dark]),
  ...shadows.map((t) => [t.name, t.dark]),
  ...standardColors.map((t) => alias(t, "dark")),
  ...scales,
  ...extras,
];

const differs = (t) => t.light !== t.dark;
const scopeLight = [
  ...colors.filter(differs).map((t) => [t.name, t.light]),
  ...shadows.filter(differs).map((t) => [t.name, t.light]),
  ...standardColors.filter(differs).map((t) => alias(t, "light")),
];

const banner = "/* GENERATED by tokens/build.mjs — do not edit. Values: docs/TOKENS.md. */";

/* theme.css — the distributable. Global footprint: nothing. */

const themeCss = `${banner}

/* Raqt-only names. A host app has no utilities for these, so they have to be
   registered with Tailwind — but \`reference\` means registering only, no \`:root\`
   block of our own. The shadcn-standard names are deliberately absent: registering
   one replaces the host's entry for it and suppresses the host's own value, which
   would recolour their entire app. Those are retinted below instead. */
@theme reference {
${decls(raqtOnly.map((t) => [t.name, t.dark]))}
}

${utilities}

/* The scope. Custom properties declared on an element beat what it inherits, so
   \`.raqt\` always wins inside itself no matter what the host's \`:root\` says — and
   changes nothing outside itself. That asymmetry is the whole retrofit story. */
.raqt {
${decls(scopeDark)}
}

/* Only what actually differs. A token absent here — \`--color-primary\`, \`--color-ring\`
   — is one the contract holds identical across modes. */
.raqt.light,
.light .raqt {
${decls(scopeLight)}
}
`;

/* tokens.css — Storybook's entrypoint. Here Raqt owns the page, so a real \`@theme\`
   is correct: it both registers the names and paints \`:root\`, which is what makes
   dark the default without any class on <html>. */

const tokensCss = `${banner}

@import "tailwindcss";
@import "./theme.css";

@theme {
${decls([...colors.map((t) => [t.name, t.dark]), ...scales])}
}

/* Values Tailwind must not own — see the note on \`extras\` in build.mjs. */
:root {
${decls([...shadows.map((t) => [t.name, t.dark]), ...extras])}
}

/* Unlayered, so it beats the \`@layer theme\` block \`@theme\` above compiles to. */
.light {
${decls([
  ...colors.filter(differs).map((t) => [t.name, t.light]),
  ...shadows.filter(differs).map((t) => [t.name, t.light]),
])}
}
`;

/* ---------- TS ---------- */

const lit = (v) => JSON.stringify(v);
const entries = (pairs, indent = "  ") =>
  pairs.map(([key, value]) => `${indent}${lit(key)}: ${value},`).join("\n");

const ts = `/* GENERATED by tokens/build.mjs — do not edit. Values: docs/TOKENS.md. */

/** Layer 1. Present so the foundations pages can show the ramps; components never use it. */
export const primitives = ${JSON.stringify(stripComments(primitives), null, 2)} as const;

/** Layer 2, flat and mode-paired — iterate this to build a swatch grid. */
export const semanticColors = [
${colors.map((t) => `  { name: ${lit(t.name)}, dark: ${lit(t.dark)}, light: ${lit(t.light)} },`).join("\n")}
] as const;

export const elevationShadows = [
${shadows.map((t) => `  { name: ${lit(t.name)}, dark: ${lit(t.dark)}, light: ${lit(t.light)} },`).join("\n")}
] as const;

export const typography = {
  fonts: {
${entries(Object.entries(font).map(([k, v]) => [k, lit(v)]), "    ")}
  },
  display: { stretch: ${lit(display.stretch)}, tracking: ${lit(display.tracking)} },
  scale: {
${Object.entries(text)
  .map(
    ([step, t]) =>
      `    ${lit(step)}: { size: ${lit(t.size)}, lineHeight: ${lit(t.lineHeight)}, family: ${lit(t.family)} },`,
  )
  .join("\n")}
  },
} as const;

export const radius = {
${entries(Object.entries(radius).map(([k, v]) => [k, lit(v)]), "  ")}
} as const;

/** Tailwind generates the whole scale from \`base\`; these are the steps worth showing. */
export const spacing = {
  base: ${lit(spacing.base)},
  steps: [
${spacing.documentedSteps
  .map((step) => {
    const rem = step * parseFloat(spacing.base);
    return `    { step: ${step}, rem: ${lit(`${+rem.toFixed(4)}rem`)}, px: ${+(rem * 16).toFixed(2)} },`;
  })
  .join("\n")}
  ],
} as const;

/** Every mode-aware custom property, for a "what does this resolve to?" table. */
export const modeAwareTokens = [...semanticColors, ...elevationShadows];
`;

function stripComments(node) {
  if (Array.isArray(node)) return node.map(stripComments);
  if (node && typeof node === "object") {
    return Object.fromEntries(
      Object.entries(node)
        .filter(([key]) => !key.startsWith("_"))
        .map(([key, value]) => [key, stripComments(value)]),
    );
  }
  return node;
}

/* ---------- write ---------- */

mkdirSync(join(here, "dist"), { recursive: true });
writeFileSync(dist("theme.css"), themeCss);
writeFileSync(dist("tokens.css"), tokensCss);
writeFileSync(dist("tokens.ts"), ts);

console.log(
  `tokens: ${colors.length} colours, ${shadows.length} elevations, ${Object.keys(text).length} type steps ` +
    `→ dist/theme.css, dist/tokens.css, dist/tokens.ts`,
);
