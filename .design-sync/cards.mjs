// Emits ds-bundle/guidelines/*.html — the foundation cards Claude Design shows
// under Brand, Colors, Type, Elevation and Spacing.
//
// The converter ships guidelines as MARKDOWN (cfg.guidelinesGlob is .md/.mdx
// only), which the app stores but does not turn into cards: a card is an HTML
// file whose first line carries a `<!-- @dsCard group=… -->` marker. Without
// these, the synced system has components and tokens and no foundations at all.
//
// Every value comes from tokens/dist/tokens.json — the same emitter that writes
// theme.css — so a card can never disagree with the theme. The prose is lifted
// from DESIGN.md. Nothing here is authored twice.
//
// Run AFTER the converter: package-build.mjs wipes --out, so cards written before
// it are lost. `pnpm ds:cards` does it.
//
// One rule learned the hard way: a card renders only what is ALLOWED. A picture
// of a prohibited pairing is the one part of a prohibition that survives being
// read by something that learns from examples, and it is how a green logo plate
// once ended up in a generated design system. Prohibitions go in prose.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "ds-bundle", "guidelines");
const T = JSON.parse(readFileSync(join(root, "tokens/dist/tokens.json"), "utf8"));

if (!existsSync(join(root, "ds-bundle", "styles.css"))) {
  console.error("✗ ds-bundle/ has no styles.css — run the converter first, then this.");
  process.exit(1);
}

/* ---------- helpers ---------- */

const semantic = (n) => T.semanticColors.find((t) => t.name === `--color-${n}`);
const named = (n) => semantic(n)?.dark ?? "#f0f";

/** Cards link ../styles.css, whose closure puts every token on :root. */
const page = ({ group, name, subtitle, viewport = "700x220", css = "", body }) =>
  `<!-- @dsCard group="${group}" viewport="${viewport}" name="${name}" subtitle="${subtitle}" -->
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${name}</title>
<link rel="stylesheet" href="../styles.css"><style>
body{margin:0;padding:20px 24px;background:var(--color-background);color:var(--color-foreground);
  font-family:var(--font-sans);font-size:var(--text-sm)}
h2{font-family:var(--font-display);font-stretch:115%;letter-spacing:-.01em;font-size:var(--text-lg);margin:0 0 4px}
p{margin:0 0 14px;color:var(--color-muted-foreground);line-height:1.5;max-width:74ch}
code{font-family:ui-monospace,Menlo,monospace;font-size:.9em;background:var(--color-muted);
  color:var(--color-foreground);padding:.1em .35em;border-radius:var(--radius-sm)}
.row{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start}
.sw{border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;width:132px}
.sw i{display:block;height:44px}
.sw b{display:block;font-size:var(--text-xs);padding:6px 8px 0;font-weight:600}
.sw s{display:block;font-size:var(--text-xs);color:var(--color-muted-foreground);
  padding:0 8px 6px;text-decoration:none;font-family:ui-monospace,Menlo,monospace}
${css}
</style></head><body>
${body}
</body></html>
`;

/** A swatch grid from semantic token names. */
const swatches = (names) =>
  `<div class="row">${names
    .map(
      (n) =>
        `<div class="sw"><i style="background:var(--color-${n})"></i><b>${n}</b><s>${named(n)}</s></div>`,
    )
    .join("")}</div>`;

/* ---------- the cards ---------- */

const cards = {};

/* --- Brand ------------------------------------------------------------- */

cards["brand-principles.html"] = page({
  group: "Brand", name: "Principles", viewport: "700x300",
  subtitle: "Sporty, energetic, modern — the venue at night, not an admin panel",
  css: `.g{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g div{border-left:2px solid var(--color-primary);padding-left:12px}
.g b{display:block;font-family:var(--font-display);font-stretch:115%;font-size:var(--text-base);margin-bottom:3px}
.g p{margin:0;font-size:var(--text-sm)}`,
  body: `<h2>Principles</h2>
<p>Raqt is a tournament platform — courts, draws, live scores. Four commitments decide every other call.</p>
<div class="g">
  <div><b>Sporty, energetic, modern</b><p>The interface should feel like the venue at night, not like an admin panel.</p></div>
  <div><b>Dark is the default</b><p>The ground is near-black green-tinted ink, never grey. One spring green carries every action and does not change between modes, so the brand is the constant.</p></div>
  <div><b>Green is a signal, not a wash</b><p>Most of a screen is ink and type. Green marks the one thing to do next, or the one thing that is live.</p></div>
  <div><b>Density with air</b><p>A day sheet stacks twenty matches. Tight surfaces and generous type contrast, not generous padding.</p></div>
</div>`,
});

cards["brand-marks.html"] = page({
  group: "Brand", name: "Logo, logotype & icon", viewport: "700x340",
  subtitle: "Three marks; the two lockups are alpha masks painted foreground",
  css: `.three{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:16px}
.pane{border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-surface-1);
  height:96px;display:flex;align-items:center;justify-content:center;margin-bottom:8px}
.pane.on-light{background:var(--ink-25);border-color:var(--ink-100)}
.mark{background:var(--color-foreground);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
  -webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain}
.on-light .mark{background:var(--ink-900)}
.logo{width:132px;height:73px;-webkit-mask-image:url(../assets/brand/logo.png);mask-image:url(../assets/brand/logo.png)}
.type{width:170px;height:46px;-webkit-mask-image:url(../assets/brand/logotype.png);mask-image:url(../assets/brand/logotype.png)}
.tile{width:72px;height:72px;border-radius:16px}
.cap{font-size:var(--text-xs);color:var(--color-muted-foreground);margin:0}
.cap b{color:var(--color-foreground)}`,
  body: `<h2>The marks</h2>
<p>Choosing between them is one question: how much room is there, and does the reader already know what Raqt is.</p>
<div class="three">
  <div><div class="pane"><span class="mark logo"></span></div>
    <p class="cap"><b>Logo</b> — wordmark over the tagline. Floor ~160px. First contact: marketing, login, a footer.</p></div>
  <div><div class="pane"><span class="mark type"></span></div>
    <p class="cap"><b>Logotype</b> — wordmark alone. Floor ~90px. In-product chrome, where the reader is already inside Raqt.</p></div>
  <div><div class="pane"><img class="tile" src="../assets/brand/icon.png" alt="Raqt app icon"></div>
    <p class="cap"><b>App icon</b> — the R, on its own opaque ground. Home screen, favicon, avatar.</p></div>
</div>
<div class="three">
  <div><div class="pane"><span class="mark type"></span></div><p class="cap">Ink ground — the default.</p></div>
  <div><div class="pane on-light"><span class="mark type"></span></div><p class="cap">Light ground.</p></div>
  <div><p class="cap">The lockups ship as near-white artwork on transparency, so their alpha is a <b>mask</b>: the colour comes from
    <code>foreground</code> and follows the mode. Two grounds only — the two values <code>background</code> resolves to.
    Never a plate of <code>primary</code> behind a mark: green is the signal for the one thing to do next, and a logo is never an
    action. Never tint, stretch or rebuild. Neither file carries a margin, so clear space is always the layout's job.</p></div>
</div>`,
});

cards["brand-iconography.html"] = page({
  group: "Brand", name: "Iconography", viewport: "700x260",
  subtitle: "One library — Lucide. One concept, one glyph, three sizes",
  css: `.ic{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}
.ic div{border:1px solid var(--color-border);border-radius:var(--radius-md);padding:12px;text-align:center;background:var(--color-surface-1)}
.ic svg{width:22px;height:22px;margin-bottom:6px}
.ic b{display:block;font-size:var(--text-sm)}
.ic s{display:block;font-size:var(--text-xs);color:var(--color-muted-foreground);text-decoration:none;font-family:ui-monospace,Menlo,monospace}
.sz{display:flex;align-items:flex-end;gap:26px}
.sz figure{margin:0;text-align:center}
.sz figcaption{font-size:var(--text-xs);color:var(--color-muted-foreground);margin-top:6px}`,
  body: (() => {
    const I = {
      Trophy: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>`,
      Swords: `<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>`,
      LandPlot: `<path d="m12 8 6-3-6-3v10"/><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"/><path d="m6.49 12.85 11.02 6.3"/><path d="M17.51 12.85 6.5 19.15"/>`,
      Radio: `<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>`,
    };
    const svg = (n, s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;
    const set = [["Trophy", "tournament"], ["Swords", "match"], ["LandPlot", "court"], ["Radio", "live"]];
    return `<h2>Iconography</h2>
<p>One library: <b>Lucide</b>, via <code>lucide-react</code>. A second icon family is a second design system — a different grid,
a different stroke, a different idea of what a chevron is. A glyph Lucide lacks is a gap to raise, the same as a missing token.</p>
<div class="ic">${set.map(([n, c]) => `<div>${svg(n, 22)}<b>${c}</b><s>${n}</s></div>`).join("")}</div>
<div class="sz">
  <figure>${svg("Trophy", 12)}<figcaption><code>size-3</code> · in a badge</figcaption></figure>
  <figure>${svg("Trophy", 16)}<figcaption><code>size-4</code> · the default</figcaption></figure>
  <figure>${svg("Trophy", 20)}<figcaption><code>size-5</code> · standing alone</figcaption></figure>
</div>
<p style="margin-top:14px">The set is the vocabulary, not the library: one concept, one glyph, and the rule runs both ways.
Icons take <code>currentColor</code>, which is what carries them into light mode. Give one a colour only when the colour is the
message. Decorative icons are <code>aria-hidden</code>; an icon-only control still carries its word.</p>`;
  })(),
});

/* --- Colors ------------------------------------------------------------ */

const colorCard = (file, name, subtitle, names, prose) => {
  cards[file] = page({
    group: "Colors", name, subtitle, viewport: "700x220",
    body: `<h2>${name}</h2><p>${prose}</p>${swatches(names)}`,
  });
};

colorCard("colors-ground.html", "Ground & type",
  "Two text levels, not five — foreground and muted-foreground",
  ["background", "foreground", "muted", "muted-foreground", "border", "input", "ring"],
  "<code>background</code> is the page and everything sits on it. Text is <code>foreground</code>, and its quieter half is <code>muted-foreground</code> — two levels, not five. There is no slightly-dimmer grey, and making one by lowering opacity puts a colour on screen no token can reach. <code>input</code> is for form control borders only; <code>ring</code> for focus rings and nothing else.");

colorCard("colors-action.html", "Action",
  "One primary per view; secondary is the alternative, accent the tertiary",
  ["primary", "primary-foreground", "secondary", "secondary-foreground", "accent", "accent-foreground"],
  "<code>primary</code> is the single most important thing a person can do on the screen — two primary buttons in one view means neither is. Everything else steps down: <code>secondary</code> for the alternative, <code>accent</code> for hover and tertiary emphasis, plain text below that. The green is identical in both modes, so the brand is the constant and everything else is the setting.");

colorCard("colors-meaning.html", "Meaning",
  "These say something about severity — never used for decoration",
  ["destructive", "warning", "success", "info"],
  "Each says something about severity, and each has a <code>-foreground</code>. Using <code>warning</code> amber because a card looked flat is a lie the interface tells. A match being live is not a severity — that has its own tokens.");

colorCard("colors-match-status.html", "Match status",
  "A match's state is a domain fact, not a severity",
  ["status-upcoming", "status-live", "status-finished", "status-open"],
  "Raqt-only. A match's state is a domain fact, so it gets its own four tokens rather than borrowing the severity ones: a live match is <code>status-live</code>, never <code>destructive</code>. The badge says what a thing <i>is</i> and the token layer decides what that looks like, so retinting <code>live</code> later is one token rather than a search through every screen for the badge that happened to be red.");

colorCard("colors-surfaces.html", "Surfaces",
  "surface-1..3 — the elevation ramp, Raqt-only",
  ["surface-1", "surface-2", "surface-3"],
  "Three levels, and three is the whole ladder. In dark, elevation is surface lightness plus a hairline border; in light, all three resolve to white and the shadow does the work. One vocabulary, two implementations — which is the reason the semantic layer exists.");

cards["colors-modes.html"] = page({
  group: "Colors", name: "Dark is the default", viewport: "700x260",
  subtitle: "Light is the check. primary and ring hold the same value in both",
  css: `table{border-collapse:collapse;width:100%;font-size:var(--text-xs)}
th,td{text-align:left;padding:5px 8px;border-bottom:1px solid var(--color-border)}
th{color:var(--color-muted-foreground);font-weight:500}
i{display:inline-block;width:13px;height:13px;border-radius:3px;vertical-align:-2px;margin-right:6px;border:1px solid var(--color-border)}
td{font-family:ui-monospace,Menlo,monospace}`,
  body: `<h2>Dark is the default</h2>
<p>Design in dark — it is the default and what most of Raqt's users see. Then flip to light before calling it done. Almost every
mode bug is a rule already broken: a hardcoded colour, a surface without its border, an elevation without its shadow. The flip does
not create those bugs, it reveals them. A token absent from the light column resolves identically in both modes.</p>
<table><tr><th>token</th><th>dark</th><th>light</th></tr>
${["background", "foreground", "primary", "surface-1", "muted-foreground", "border", "destructive"]
    .map((n) => {
      const t = semantic(n);
      const same = t.dark === t.light;
      return `<tr><td>--color-${n}</td><td><i style="background:${t.dark}"></i>${t.dark}</td><td><i style="background:${t.light}"></i>${t.light}${same ? " (same)" : ""}</td></tr>`;
    })
    .join("")}
</table>`,
});

cards["colors-ramps.html"] = page({
  group: "Colors", name: "The ramps", viewport: "700x300",
  subtitle: "Layer 1 — green and the green-tinted ink neutral. Components never name these",
  css: `.ramp{display:flex;margin-bottom:10px;border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--color-border)}
.ramp span{flex:1;height:38px;position:relative}
.ramp span::after{content:attr(data-s);position:absolute;bottom:2px;left:0;right:0;text-align:center;
  font-size:9px;font-family:ui-monospace,Menlo,monospace;color:#0007}
.lbl{font-size:var(--text-xs);color:var(--color-muted-foreground);margin-bottom:3px;font-family:ui-monospace,Menlo,monospace}`,
  body: `<h2>The ramps</h2>
<p>Layer 1. Components never name these — they exist so the semantic layer has something to point at, which is what makes a
retint one edit. The neutral is <b>green-tinted ink</b>, never grey: that tint is why a Raqt screen reads as a venue at night.</p>
${Object.entries(T.primitives.color)
    .filter(([, steps]) => typeof steps === "object")
    .map(([ramp, steps]) =>
      `<div class="lbl">${ramp}</div><div class="ramp">${Object.entries(steps)
        .map(([step, hex]) => `<span data-s="${step}" style="background:${hex}"></span>`)
        .join("")}</div>`)
    .join("")}`,
});

/* --- Type -------------------------------------------------------------- */

cards["type-scale.html"] = page({
  group: "Type", name: "The scale", viewport: "700x340",
  subtitle: "Eight steps, each shipping its own line height",
  css: `.r{display:grid;grid-template-columns:96px 84px 1fr;gap:14px;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--color-border)}
.r i{font-style:normal;font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground)}
.r em{font-style:normal;font-size:var(--text-xs);color:var(--color-primary);text-transform:uppercase;letter-spacing:.06em}
.disp{font-family:var(--font-display);font-stretch:115%;letter-spacing:-.01em}`,
  body: `<h2>The scale</h2>
<p>Line heights ship paired with every step — it is a type ramp, not a font-size list.</p>
${Object.entries(T.typography.scale).reverse().map(([k, v]) =>
    `<div class="r"><i>--text-${k}</i><em>${v.family === "display" ? "display" : "read"}</em>
<span class="${v.family === "display" ? "disp" : ""}" style="font-size:${v.size};line-height:${v.lineHeight}">Raqt Open — Semifinal</span></div>`).join("")}`,
});

cards["type-boundary.html"] = page({
  group: "Type", name: "The hard boundary", viewport: "700x240",
  subtitle: "text-xl and above are Archivo via font-display; text-lg and below are Inter",
  css: `.two{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.box{background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:16px}
.disp{font-family:var(--font-display);font-stretch:${T.typography.display.stretch};letter-spacing:${T.typography.display.tracking}}`,
  body: `<h2>The hard boundary</h2>
<p>Two faces, and the line between them is a rule rather than a preference.</p>
<div class="two">
  <div class="box"><div class="disp" style="font-size:var(--text-3xl)">Semifinal</div>
    <p style="margin:8px 0 0;font-size:var(--text-xs)">Archivo, <code>font-stretch:${T.typography.display.stretch}</code>,
    <code>letter-spacing:${T.typography.display.tracking}</code> — the <code>font-display</code> utility. Scores, player names,
    headings; things the eye lands on. Never apply the family by hand: it sets family, width and tracking together, and the
    family alone is a different typeface.</p></div>
  <div class="box"><div style="font-size:var(--text-base);line-height:1.6">Court 3 opens at 14:00. Winners advance to the semifinal draw.</div>
    <p style="margin:8px 0 0;font-size:var(--text-xs)">Inter — <code>--font-sans</code>. Anything read as a sentence: body copy,
    labels, hints, metadata. Numbers that can change under the reader take tabular figures so they do not jitter.</p></div>
</div>`,
});

/* --- Elevation --------------------------------------------------------- */

cards["elevation-surfaces.html"] = page({
  group: "Elevation", name: "Surfaces 1–3", viewport: "700x280",
  subtitle: "Elevation N = surface-N + a hairline border + shadow-eN, all three together",
  css: `.c{background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:var(--radius-lg);
  box-shadow:var(--shadow-e1);padding:16px}
.c2{background:var(--color-surface-2);border-radius:var(--radius-md);box-shadow:var(--shadow-e2);padding:14px;margin-top:10px;border:1px solid var(--color-border)}
.c3{background:var(--color-surface-3);border-radius:var(--radius-sm);box-shadow:var(--shadow-e3);padding:12px;margin-top:10px;border:1px solid var(--color-border)}
.t{font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground)}`,
  body: `<h2>Surfaces 1–3</h2>
<p>A nested surface steps <b>up</b> one elevation and <b>down</b> one radius. All three parts together — a surface without its
border, or an elevation without its shadow, is the bug the light-mode flip reveals. Three levels is the whole ladder; a design
that needs a fourth is too deep, so flatten it.</p>
<div class="c"><span class="t">surface-1 · rounded-lg · shadow-e1</span>
  <div class="c2"><span class="t">surface-2 · rounded-md · shadow-e2</span>
    <div class="c3"><span class="t">surface-3 · rounded-sm · shadow-e3</span></div></div></div>
<p style="margin-top:12px">A surface step separates a <b>box from the box around it</b>. It cannot carry emphasis <i>inside</i> a
box, because in light mode all three surfaces are white. Emphasis within a card comes from <code>muted</code>, <code>accent</code>
or type weight — tokens that differ from the card in both modes.</p>`,
});

cards["elevation-radius.html"] = page({
  group: "Elevation", name: "Radius", viewport: "700x200",
  subtitle: Object.entries(T.radius).map(([k, v]) => `${k} ${v}`).join(" · ") + " — nesting steps down",
  css: `.row{gap:18px}
.b{width:76px;height:76px;background:var(--color-surface-2);border:1px solid var(--color-border)}
figure{margin:0;text-align:center}
figcaption{font-size:var(--text-xs);color:var(--color-muted-foreground);margin-top:6px;font-family:ui-monospace,Menlo,monospace}`,
  body: `<h2>Radius</h2>
<p>Radius steps <b>down</b> as elevation steps up: a card at <code>rounded-lg</code> holds a row at <code>rounded-md</code>,
which holds a chip at <code>rounded-sm</code>. <code>--radius</code> aliases <code>${T.radiusDefault}</code> for hand-pasted
shadcn CSS.</p>
<div class="row">${Object.entries(T.radius).map(([k, v]) =>
    `<figure><div class="b" style="border-radius:${v}"></div><figcaption>${k}<br>${v}</figcaption></figure>`).join("")}</div>`,
});

/* --- Spacing ----------------------------------------------------------- */

cards["spacing-scale.html"] = page({
  group: "Spacing", name: "The scale", viewport: "700x300",
  subtitle: `--spacing is ${T.spacing.base}; every rung is a multiple of it`,
  css: `.r{display:grid;grid-template-columns:52px 74px 1fr;gap:12px;align-items:center;padding:4px 0}
.r i{font-style:normal;font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground)}
.bar{height:14px;background:var(--color-primary);border-radius:2px}`,
  body: `<h2>The scale</h2>
<p><code>--spacing</code> is <code>${T.spacing.base}</code> and Tailwind generates the rungs from it. <code>p-[13px]</code> is the
same defect as a hex — a decision nobody else can find or change.</p>
${T.spacing.documentedSteps.filter((s) => s >= 1 && s <= 16).map((s) =>
    `<div class="r"><i>${s}</i><i>${s * 0.25}rem</i><div class="bar" style="width:calc(var(--spacing) * ${s} * 3)"></div></div>`).join("")}`,
});

cards["spacing-in-use.html"] = page({
  group: "Spacing", name: "Spacing in use", viewport: "700x200",
  subtitle: "2 inside a control, 3–4 control padding, 4–6 surface padding, 8+ between sections",
  css: `.g{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.g div{background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:14px}
.g b{display:block;font-family:var(--font-display);font-stretch:115%;font-size:var(--text-base);margin-bottom:4px}
.g p{margin:0;font-size:var(--text-xs)}`,
  body: `<h2>Spacing in use</h2>
<p>Which rung goes where. Pick from the scale rather than measuring: the rungs are what make two screens built by two people
line up.</p>
<div class="g">
  <div><b>2</b><p>Inside a control — the gap between an icon and its label.</p></div>
  <div><b>3–4</b><p>Control padding — a button's or input's horizontal padding.</p></div>
  <div><b>4–6</b><p>Surface padding — the inside of a card, stepping down with its level.</p></div>
  <div><b>8+</b><p>Between sections.</p></div>
</div>`,
});

/* ---------- write ---------- */

mkdirSync(OUT, { recursive: true });
for (const [name, html] of Object.entries(cards)) writeFileSync(join(OUT, name), html);

// The index the converter wrote lists only the markdown; re-list everything.
const groups = {};
for (const [file, html] of Object.entries(cards)) {
  const m = /group="([^"]+)"[^>]*name="([^"]+)"/.exec(html);
  (groups[m[1]] ??= []).push(`- [${m[2]}](./${file})`);
}
const md = ["DESIGN.md", "CONTEXT.md", "docs/TOKENS.md", "docs/COMPONENTS.md"]
  .filter((f) => existsSync(join(OUT, f)))
  .map((f) => `- [${f}](./${f})`);
writeFileSync(
  join(OUT, "index.md"),
  `# Guidelines\n\n${Object.entries(groups)
    .map(([g, items]) => `## ${g}\n\n${items.join("\n")}`)
    .join("\n\n")}${md.length ? `\n\n## Reference\n\n${md.join("\n")}` : ""}\n`,
);

/* The anchor hashes guidelines/ (see auxShaFor in lib/sync-hashes.mjs), and the
   build wrote it before these cards existed. Recompute it over the real final
   bundle with the converter's own function - an anchor must describe exactly what
   is uploaded, and leaving it stale makes every future re-sync report aux churn.
   Skipped when .ds-sync/ is not staged; the only cost is that one extra upload. */
const hashes = join(root, ".ds-sync/lib/sync-hashes.mjs");
if (existsSync(hashes)) {
  const { auxShaFor } = await import(pathToFileURL(hashes).href);
  const anchorPath = join(root, "ds-bundle", "_ds_sync.json");
  const anchor = JSON.parse(readFileSync(anchorPath, "utf8"));
  const before = anchor.auxSha;
  anchor.auxSha = auxShaFor(join(root, "ds-bundle"));
  writeFileSync(anchorPath, JSON.stringify(anchor, null, 2) + "\n");
  console.log(`  anchor auxSha ${before} → ${anchor.auxSha} (now covers the cards)`);
} else {
  console.error("  ! .ds-sync/ not staged — anchor auxSha left stale; the next sync re-uploads guidelines");
}

console.log(
  `cards: ${Object.keys(cards).length} → ds-bundle/guidelines/ ` +
    `(${Object.entries(groups).map(([g, i]) => `${g} ${i.length}`).join(", ")})`,
);