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

const { font, display, radiusDefault, spacing, shadcnStandard } = semantic;

/* `text` and `radius` are iterated key-by-key to build token names, so an `_comment`
   key in them would emit `--text-_comment`. `modal()` already drops those for the
   mode-paired groups; these two need the same filter before anything reads them. */
const text = stripComments(semantic.text);
const radius = stripComments(semantic.radius);

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

/* The one behavioural rule the token layer carries. Tailwind v4's preflight dropped
   the `cursor: pointer` v3 gave buttons, so a `<button>` now takes the UA arrow and a
   control stops looking clickable. The restore belongs here rather than in nine
   component files: "a clickable thing shows a pointer" is one system decision, and
   spreading it across components only creates nine chances to forget it. `:not(:disabled)`
   keeps a dead control from advertising itself; `@layer base` keeps every `cursor-*`
   utility — `cursor-not-allowed`, say — winning over it. */
const pointerRule = (scope) => `@layer base {
  ${scope}button:not(:disabled),
  ${scope}[role="button"]:not(:disabled) {
    cursor: pointer;
  }
}`;

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

${pointerRule(".raqt ")}
`;

/* tokens.css — Storybook's entrypoint. Here Raqt owns the page, so a real \`@theme\`
   is correct: it both registers the names and paints \`:root\`, which is what makes
   dark the default without any class on <html>. */

const tokensCss = `${banner}

@import "tailwindcss";
@import "./theme.css";

/* Documentation is not a source. Tailwind v4 auto-detects sources from the repo
   root, which sweeps in the prose under .design-sync/ — and a class NAMED in prose
   gets compiled, even when the prose names it as an example of something that does
   not exist. That is not hypothetical: .design-sync/conventions.md tells the
   design agent which utilities exist, and citing two absent ones silently created
   both, making its own claim false. Excluding the directory keeps the compiled set
   equal to what the components and stories actually use. */
@source not "../../.design-sync";

/* Tailwind only generates a utility whose class name appears literally in a
   source file, so a token no component has reached for yet gets a name and no
   class. That is fine inside this repo — a component that needs the rung writes
   it. It is not fine downstream: the compiled stylesheet IS the vocabulary for
   Claude Design, and a caption rung reachable only as \`var(--text-2xs)\` is a
   rung that gets hand-written as a raw px instead. These two are the caption
   floor and were added for exactly that reason, so they ship as classes from
   the start. */
@source inline("text-{2,3}xs");

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

${pointerRule("")}
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

/* ---------- root/ — the token layer as its own artifact ---------- */

/* theme.css scopes everything to `.raqt`, which is right for a host app and wrong
   for a tool that reads a stylesheet to learn the palette: it finds the tokens
   behind a class it has no reason to apply. These five files are the same values
   on `:root`, split by concern, in the order a person reads a design system —
   colour first.
   
   They exist because Claude Design was falling back to scraping the compiled
   Tailwind stylesheet, which carries 55 `--tw-*` internals and buries `primary`
   far down the list. A named, ordered palette is not cosmetic there: it is what
   the design agent reads to learn the brand. Emitted from the same `primitives`
   and `semantic` sources as everything else, so they cannot drift. */

/** The primitive ramps, written out so the palette shows its structure. */
const rampDecls = Object.entries(primitives.color).flatMap(([ramp, steps]) =>
  typeof steps === "string"
    ? [[`--${ramp}`, steps]]
    : Object.entries(steps).map(([step, value]) => [`--${ramp}-${step}`, value]),
);

/** A semantic value, expressed as `var(--ramp-step)` when it names a primitive. */
const byHex = new Map(rampDecls.map(([name, value]) => [value.toUpperCase(), name]));
const ref = (value) => {
  const hit = byHex.get(String(value).toUpperCase());
  return hit ? `var(${hit})` : value;
};

const rootFiles = {
  // Colour leads, and inside colour the SEMANTIC names lead. The app lists tokens
  // in filename order, so splitting the ramps into palette.css puts the names a
  // designer actually looks for - primary, background, foreground - at the top
  // instead of forty entries down behind green-50..950 and ink-25..950.
  "colors.css": `${banner}

/* The semantic names components use. Dark is the default. Values reference the
   ramps in palette.css; custom properties resolve at use, so order never matters. */
:root {
${decls(colors.map((t) => [t.name, ref(t.dark)]))}
${decls(standardColors.map((t) => { const [n, v] = alias(t, "dark"); return [n, ref(v)]; }))}
}

/* Only what differs in light. A token absent here is identical in both modes. */
:root.light,
.light {
${decls(colors.filter(differs).map((t) => [t.name, ref(t.light)]))}
${decls(standardColors.filter(differs).map((t) => { const [n, v] = alias(t, "light"); return [n, ref(v)]; }))}
}
`,

  // The raw ramps, referenced by colors.css. Their own file so they do not bury
  // the semantic layer - a designer reaches for `primary`, not `green-400`.
  "palette.css": `${banner}

/* Layer 1 - the primitive ramps. Components never name these directly (rule 1);
   they exist so the semantic layer has something to point at. */
:root {
${decls(rampDecls)}
}
`,

  "typography.css": `${banner}

/* Two faces, and the boundary between them is a rule: --text-xl and above are
   display type and take the font-display utility, which sets family, width and
   tracking together. --text-lg and below are Inter. */
:root {
${decls([
  ["--font-sans", font.sans],
  ["--font-display", font.display],
  ["--font-display-stretch", display.stretch],
  ["--font-display-tracking", display.tracking],
  ...Object.entries(text).flatMap(([step, t]) => [
    [`--text-${step}`, t.size],
    [`--text-${step}--line-height`, t.lineHeight],
  ]),
])}
}
`,

  "spacing.css": `${banner}

/* --spacing is the multiplier Tailwind generates every rung from. The named
   steps are the rungs docs/TOKENS.md documents, for use outside a utility —
   derived from documentedSteps so this file cannot claim a different scale than
   the docs do. Half steps are reachable through the utilities and through
   calc(var(--spacing) * n); they get no name here because a custom property
   cannot carry the dot. */
:root {
${decls([
  ["--spacing", spacing.base],
  ...spacing.documentedSteps
    .filter(Number.isInteger)
    .map((n) => [`--space-${n}`, `calc(${spacing.base} * ${n})`]),
])}
}
`,

  "radius.css": `${banner}

/* Radius steps DOWN as elevation steps up: a card at rounded-lg holds a row at
   rounded-md, which holds a chip at rounded-sm. */
:root {
${decls([
  ...Object.entries(radius).map(([step, value]) => [`--radius-${step}`, value]),
  ["--radius", radius[radiusDefault]],
])}
}
`,

  "elevation.css": `${banner}

/* In dark, elevation is surface lightness plus a hairline border, so the shadows
   are none. In light, the three surfaces are all white and the shadow does the
   work. One vocabulary, two implementations. */
:root {
${decls(shadows.map((t) => [t.name, t.dark]))}
}

:root.light,
.light {
${decls(shadows.filter(differs).map((t) => [t.name, t.light]))}
}
`,
};

/* ---------- write ---------- */

mkdirSync(join(here, "dist"), { recursive: true });
writeFileSync(dist("theme.css"), themeCss);
writeFileSync(dist("tokens.css"), tokensCss);
writeFileSync(dist("tokens.ts"), ts);

/* The same values as data. tokens.ts is `as const` TypeScript, which a plain .mjs
   cannot import - and .design-sync/cards.mjs needs these to draw the foundation
   cards from real values instead of restating them. */
writeFileSync(
  dist("tokens.json"),
  JSON.stringify(
    { primitives: stripComments(primitives), semanticColors: colors, elevationShadows: shadows,
      typography: { fonts: font, display, scale: text }, radius, radiusDefault, spacing },
    null, 2,
  ) + "\n",
);

mkdirSync(join(here, "dist", "root"), { recursive: true });
for (const [name, css] of Object.entries(rootFiles)) {
  writeFileSync(join(here, "dist", "root", name), css);
}

console.log(
  `tokens: ${colors.length} colours, ${shadows.length} elevations, ${Object.keys(text).length} type steps ` +
    `→ dist/theme.css, dist/tokens.css, dist/tokens.ts, dist/tokens.json, dist/root/ (${Object.keys(rootFiles).length} files)`,
);
