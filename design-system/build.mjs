// Raqt design-system bundle emitter. Reads DESIGN.md's rules, the emitted theme and
// assets/brand/, and writes design-system/dist/ — one self-contained HTML preview card
// per foundation and per component, each opening with a `<!-- @dsCard group="…" -->`
// marker that Claude Design indexes into its Design System pane.
//
// The whole point of this file is that nothing here restates a value. `tokens/dist/theme.css`
// is inlined verbatim into every card: `@theme reference` and `@utility` are Tailwind-only
// at-rules a browser skips, while `.raqt`, `.raqt.light` and `@layer base` are plain CSS and
// resolve exactly as they do in an app. A card can therefore never drift from the contract —
// re-run `pnpm tokens && pnpm ds` and the previews are the new truth.
//
// Push to Claude Design with the DesignSync tool: finalize_plan against design-system/dist,
// then write_files. See design-system/README.md.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const REPO = join(here, "..");
const OUT = join(here, "dist");

// The real emitted theme, verbatim. `@theme reference` and `@utility` are
// Tailwind-only at-rules — a browser skips them; `.raqt`, `.raqt.light` and
// `@layer base` are plain CSS and apply exactly as they do in the app.
const THEME = readFileSync(join(REPO, "tokens/dist/theme.css"), "utf8");

const CHROME = `
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:var(--font-sans, "Inter", ui-sans-serif, system-ui, sans-serif)}
.page{background:var(--color-background);color:var(--color-foreground);padding:40px;min-height:100%}
.page.split{display:grid;grid-template-columns:1fr 1fr;gap:0;padding:0}
.half{padding:40px}
h1{font-family:var(--font-display);font-stretch:115%;letter-spacing:-.01em;font-size:var(--text-2xl);line-height:var(--text-2xl--line-height);margin:0 0 6px}
h2{font-family:var(--font-display);font-stretch:115%;letter-spacing:-.01em;font-size:var(--text-lg);margin:32px 0 12px}
h2:first-of-type{margin-top:24px}
.lede{color:var(--color-muted-foreground);font-size:var(--text-sm);line-height:var(--text-sm--line-height);margin:0 0 8px;max-width:68ch}
.mode{display:inline-block;font-size:var(--text-xs);letter-spacing:.08em;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:16px}
.row{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.col{display:flex;flex-direction:column;gap:12px}
.stack{display:flex;flex-direction:column;gap:24px}
.cap{font-size:var(--text-xs);color:var(--color-muted-foreground);margin-top:6px}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.85em;background:var(--color-muted);color:var(--color-foreground);padding:.1em .4em;border-radius:var(--radius-sm)}

/* ---- component CSS, mirroring the CVA class strings 1:1 ---- */
.btn{position:relative;display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;gap:.5rem;white-space:nowrap;border-radius:var(--radius-md);font-weight:500;border:1px solid transparent;outline:none;cursor:pointer;font-family:inherit}
.btn svg{flex-shrink:0;width:1rem;height:1rem}
.sm{height:2rem;gap:.375rem;padding:0 .75rem;font-size:var(--text-sm)}
.md{height:2.25rem;padding:0 1rem;font-size:var(--text-sm)}
.lg{height:2.75rem;padding:0 1.5rem;font-size:var(--text-base)}
.icon{height:2.25rem;width:2.25rem;padding:0}
.primary{background:var(--color-primary);color:var(--color-primary-foreground)}
.secondary{background:var(--color-secondary);color:var(--color-secondary-foreground)}
.ghost{background:transparent;color:var(--color-foreground)}
.destructive{background:var(--color-destructive);color:var(--color-destructive-foreground)}
.outline{border-color:var(--color-input);background:transparent;color:var(--color-foreground)}
.is-hover.primary{background:color-mix(in srgb,var(--color-primary) 90%,transparent)}
.is-hover.secondary{background:color-mix(in srgb,var(--color-secondary) 80%,transparent)}
.is-hover.ghost,.is-hover.outline{background:var(--color-accent);color:var(--color-accent-foreground)}
.is-active.primary{background:color-mix(in srgb,var(--color-primary) 80%,transparent)}
.is-focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--color-ring) 50%,transparent)}
.is-focus.destructive{box-shadow:0 0 0 3px color-mix(in srgb,var(--color-destructive) 50%,transparent)}
.is-disabled{opacity:.5;pointer-events:none}

.badge{display:inline-flex;width:fit-content;flex-shrink:0;align-items:center;justify-content:center;gap:.375rem;overflow:hidden;white-space:nowrap;border-radius:9999px;border:1px solid transparent;padding:.125rem .5rem;font-size:var(--text-xs);line-height:1rem;font-weight:500}
.badge.b-default{background:var(--color-primary);color:var(--color-primary-foreground)}
.badge.b-secondary{background:var(--color-secondary);color:var(--color-secondary-foreground)}
.badge.b-outline{border-color:var(--color-border);color:var(--color-foreground)}
.badge.b-success{background:var(--color-success);color:var(--color-success-foreground)}
.badge.b-warning{background:var(--color-warning);color:var(--color-warning-foreground)}
.badge.b-destructive{background:var(--color-destructive);color:var(--color-destructive-foreground)}
.badge.b-info{background:var(--color-info);color:var(--color-info-foreground)}
.badge.b-upcoming{background:var(--color-status-upcoming);color:var(--color-status-upcoming-foreground)}
.badge.b-live{background:var(--color-status-live);color:var(--color-status-live-foreground)}
.badge.b-finished{background:var(--color-status-finished);color:var(--color-status-finished-foreground)}
.badge.b-open{background:var(--color-status-open);color:var(--color-status-open-foreground)}
.dot{position:relative;display:inline-flex;width:.375rem;height:.375rem}
.dot i{position:absolute;inset:0;border-radius:9999px;background:currentColor;opacity:.75;animation:ping 1s cubic-bezier(0,0,.2,1) infinite}
.dot b{position:relative;width:.375rem;height:.375rem;border-radius:9999px;background:currentColor}
@keyframes ping{75%,100%{transform:scale(2);opacity:0}}
@media (prefers-reduced-motion:reduce){.dot i{display:none}}

.card{background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-e1);padding:1.5rem 0;display:flex;flex-direction:column;gap:1.5rem}
.card>*{padding-left:1.5rem;padding-right:1.5rem}
.card.l2{background:var(--color-surface-2);border-radius:var(--radius-md);box-shadow:var(--shadow-e2);padding:1.25rem 0;gap:1.25rem}
.card.l2>*{padding-left:1.25rem;padding-right:1.25rem}
.card.l3{background:var(--color-surface-3);border-radius:var(--radius-sm);box-shadow:var(--shadow-e3);padding:1rem 0;gap:1rem}
.card.l3>*{padding-left:1rem;padding-right:1rem}
.card-title{font-family:var(--font-display);font-stretch:115%;letter-spacing:-.01em;font-size:var(--text-lg);margin:0}
.card-desc{color:var(--color-muted-foreground);font-size:var(--text-sm);margin:4px 0 0}

.input{display:flex;height:2.25rem;width:100%;border-radius:var(--radius-md);border:1px solid var(--color-input);background:transparent;padding:0 .75rem;font-size:var(--text-sm);color:var(--color-foreground);font-family:inherit;align-items:center}
.input.ph{color:var(--color-muted-foreground)}
.input.invalid{border-color:var(--color-destructive);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-destructive) 25%,transparent)}
.input.foc{border-color:var(--color-ring);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-ring) 50%,transparent)}
.field{display:grid;gap:.5rem}
.field label{font-size:var(--text-sm);font-weight:500}
.field .msg{font-size:var(--text-xs);line-height:1rem;min-height:1rem;color:var(--color-muted-foreground)}
.field.err label{color:var(--color-destructive)}
.field.err .msg{color:var(--color-destructive)}
.req{color:var(--color-destructive)}

.skel{background:var(--color-muted);border-radius:var(--radius-sm);position:relative;overflow:hidden}
.skel::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--color-foreground) 7%,transparent),transparent);animation:shim 1.6s infinite}
@keyframes shim{100%{transform:translateX(200%)}}
@media (prefers-reduced-motion:reduce){.skel::after{animation:none;background:none}}

.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:.75rem;padding:3rem 1.5rem}
.medallion{display:flex;flex-shrink:0;align-items:center;justify-content:center;border-radius:9999px;background:var(--color-muted);color:var(--color-muted-foreground);width:3rem;height:3rem}
.medallion svg{width:1.25rem;height:1.25rem}
.empty h3{font-family:var(--font-display);font-stretch:115%;letter-spacing:-.01em;font-size:var(--text-xl);margin:0}
.empty p{max-width:44ch;color:var(--color-muted-foreground);font-size:var(--text-sm);margin:0}

.swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:10px}
.sw{border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;background:var(--color-surface-1)}
.sw .chip{height:56px}
.sw .meta{padding:8px 10px}
.sw .n{font-size:var(--text-xs);font-weight:600;display:block}
.sw .h{font-size:var(--text-xs);color:var(--color-muted-foreground);font-family:ui-monospace,Menlo,monospace}
`;

function page({ group, title, subtitle, body, extraCss = "" }) {
  return `<!-- @dsCard group="${group}" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Archivo:wdth,wght@100..125,400..700&display=swap" rel="stylesheet">
<style>
${THEME}
${CHROME}
${extraCss}
</style>
</head>
<body class="raqt">
${body}
</body>
</html>
`;
}

function head(title, lede) {
  return `<h1>${title}</h1><p class="lede">${lede}</p>`;
}

const files = {};
const add = (path, opts) => { files[path] = page(opts); };
/* ------------------------------------------------------------------ */
/* Brand — principles                                                  */
/* ------------------------------------------------------------------ */
add("foundations/principles.html", {
  group: "Brand",
  title: "Raqt — principles & rules for inventing",
  extraCss: `.rules{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px}
.rule{background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:14px 16px}
.rule .k{display:block;font-family:var(--font-display);font-stretch:115%;font-size:var(--text-sm);color:var(--color-primary);margin-bottom:4px}
.rule p{margin:0;font-size:var(--text-sm);line-height:1.45;color:var(--color-muted-foreground)}
.prin{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.prin div{border-left:2px solid var(--color-primary);padding-left:12px}
.prin b{display:block;font-family:var(--font-display);font-stretch:115%;font-size:var(--text-base);margin-bottom:4px}
.prin p{margin:0;font-size:var(--text-sm);line-height:1.45;color:var(--color-muted-foreground)}`,
  body: `<div class="page">
${head("Raqt design language", "A tournament platform — courts, draws, live scores. The interface should feel like the venue at night, not like an admin panel. Dark is the default; green is a signal, not a wash.")}
<h2>Principles</h2>
<div class="prin">
  <div><b>Sporty, energetic, modern</b><p>The venue at night, not an admin panel.</p></div>
  <div><b>Dark is the default</b><p>The ground is near-black green-tinted ink, not grey. One vibrant spring green carries every action and never changes between modes.</p></div>
  <div><b>Green is a signal</b><p>Most of a screen is ink and type. Green marks the one thing to do next, or the one thing that is live.</p></div>
  <div><b>Density with air</b><p>A day sheet stacks twenty matches. Tight surfaces and generous type contrast, not generous padding.</p></div>
</div>
<h2>The ten rules for inventing</h2>
<p class="lede">Follow these and a component the library has never had will still read as Raqt.</p>
<div class="rules">
  <div class="rule"><span class="k">1 · Semantic tokens only</span><p><code>bg-primary</code>, <code>text-muted-foreground</code>, <code>border-border</code>. Never a hex, never a px, never an arbitrary value. If a value you need has no token, that is a gap in the contract — not a hex to inline.</p></div>
  <div class="rule"><span class="k">2 · Start on the ground</span><p><code>background</code> is the page. Text is <code>foreground</code>, its quieter half <code>muted-foreground</code> — two levels, not five. No "slightly dimmer" grey made by lowering opacity.</p></div>
  <div class="rule"><span class="k">3 · Nesting steps surface up, radius down</span><p>Elevation N is <code>bg-surface-N</code> + <code>border-border</code> + <code>shadow-eN</code>, all three together. Three levels is the whole ladder.</p></div>
  <div class="rule"><span class="k">4 · One primary action</span><p><code>primary</code> is the single most important thing on the screen. Two primary buttons in one view means neither is.</p></div>
  <div class="rule"><span class="k">5 · Colour carries meaning, never decoration</span><p><code>destructive</code> · <code>warning</code> · <code>success</code> · <code>info</code> say something. Match state has its own four tokens because it is a domain fact: a live match is <code>status-live</code>, never <code>destructive</code>.</p></div>
  <div class="rule"><span class="k">6 · Scan sizes and read sizes differ</span><p><code>text-xl</code> and above are display type — Archivo, applied with <code>font-display</code>. <code>text-lg</code> and below are Inter. Never apply the Archivo family by hand.</p></div>
  <div class="rule"><span class="k">7 · Spacing comes off the scale</span><p><code>--spacing</code> is 0.25rem. <code>2</code> inside a control, <code>3</code>–<code>4</code> for control padding, <code>4</code>–<code>6</code> for surface padding, <code>8</code>+ between sections.</p></div>
  <div class="rule"><span class="k">8 · Every state, not just the happy one</span><p>Rest, hover, active, focus-visible, disabled — all five. Focus is a <code>ring-ring</code> ring and is never removed. A thing showing data needs loaded, <b>loading</b> and <b>empty</b>.</p></div>
  <div class="rule"><span class="k">9 · Dark is the truth, light is the check</span><p>Design in dark, then flip to light before calling it done. Almost every mode bug is one of the rules above already broken.</p></div>
  <div class="rule"><span class="k">10 · Anything portalled re-enters the scope</span><p>The theme is a <code>.raqt</code> class. A dialog or popover portalled to <code>body</code> lands outside it. Re-establish on a <code>display:contents</code> wrapper, and carry the mode explicitly.</p></div>
</div>
</div>`,
});

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */
const GROUPS = [
  ["Ground and type", ["background","foreground","muted","muted-foreground","border","input","ring"]],
  ["Action", ["primary","primary-foreground","secondary","secondary-foreground","accent","accent-foreground","card","popover"]],
  ["Meaning", ["destructive","destructive-foreground","warning","warning-foreground","success","success-foreground","info","info-foreground"]],
  ["Elevation — Raqt-only", ["surface-1","surface-2","surface-3"]],
  ["Match status — Raqt-only", ["status-upcoming","status-upcoming-foreground","status-live","status-live-foreground","status-finished","status-finished-foreground","status-open","status-open-foreground"]],
];

function swatchGrid(names) {
  return `<div class="swatches">` + names.map((n) =>
    `<div class="sw"><div class="chip" style="background:var(--color-${n})"></div><div class="meta"><span class="n">${n}</span><span class="h" data-var="--color-${n}"></span></div></div>`
  ).join("") + `</div>`;
}

const colorBody = (mode) => `<div class="half">
<span class="mode">${mode}</span>
${GROUPS.map(([label, names]) => `<h2>${label}</h2>${swatchGrid(names)}`).join("")}
</div>`;

add("foundations/colors.html", {
  group: "Colors",
  title: "Colour",
  extraCss: `.sw .chip{border-bottom:1px solid var(--color-border)}
.hdr{padding:40px 40px 0;background:var(--color-background);color:var(--color-foreground)}`,
  body: `<div class="hdr">${head("Colour", "Semantic names only — never write the hex. One vibrant spring green carries every action and is identical in both modes; the brand is the constant and everything else is the setting.")}</div>
<div class="page split" style="padding:0">
  <div class="raqt">${colorBody("Dark — the default")}</div>
  <div class="raqt light" style="background:var(--color-background);color:var(--color-foreground)">${colorBody("Light — the check")}</div>
</div>
<script>
for (const el of document.querySelectorAll("[data-var]")) {
  const scope = el.closest(".raqt");
  el.textContent = getComputedStyle(scope).getPropertyValue(el.dataset.var).trim().toUpperCase();
}
</script>`,
});

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */
const SCALE = [
  ["text-4xl","3rem","Display"],["text-3xl","2.25rem","Display"],["text-2xl","1.75rem","Display"],
  ["text-xl","1.375rem","Display"],["text-lg","1.125rem","Read"],["text-base","1rem","Read"],
  ["text-sm","0.875rem","Read"],["text-xs","0.75rem","Read"],
];
add("foundations/typography.html", {
  group: "Type",
  title: "Typography",
  extraCss: `.spec{display:grid;grid-template-columns:120px 92px 1fr;gap:16px;align-items:baseline;padding:14px 0;border-bottom:1px solid var(--color-border)}
.spec .t{font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground)}
.spec .f{font-size:var(--text-xs);color:var(--color-primary);text-transform:uppercase;letter-spacing:.06em}
.disp{font-family:var(--font-display);font-stretch:115%;letter-spacing:-.01em}
.two{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:8px}
.fbox{background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px}`,
  body: `<div class="page">
${head("Typography", "Two faces, and the boundary between them is a rule, not a preference. text-xl and above are display type — Archivo, applied with the font-display utility, which sets family, width and tracking together. text-lg and below are Inter, for anything read as a sentence.")}
<div class="two">
  <div class="fbox"><div class="disp" style="font-size:var(--text-3xl)">Semifinal</div><p class="cap">Archivo, <code>font-stretch: 115%</code>, <code>letter-spacing: -0.01em</code> — the <code>font-display</code> utility. Scores, names, headings; things the eye lands on. Never apply the family by hand: the family alone is a different typeface.</p></div>
  <div class="fbox"><div style="font-size:var(--text-base);line-height:1.6">Court 3 opens at 14:00. Winners advance to the semifinal draw.</div><p class="cap">Inter — <code>--font-sans</code>. Everything read as a sentence: body copy, labels, hints, metadata.</p></div>
</div>
<h2>The scale</h2>
${SCALE.map(([t,v,f]) => `<div class="spec"><span class="t">--${t}</span><span class="f">${f}</span><span class="${f==="Display"?"disp":""}" style="font-size:var(--${t})">Raqt Open — Semifinal</span></div>`).join("")}
<p class="cap" style="margin-top:14px">Line heights ship paired with every step (<code>--text-2xl--line-height: 2.125rem</code>, and so on) — the scale is a type ramp, not a font-size list.</p>
</div>`,
});

/* ------------------------------------------------------------------ */
/* Elevation                                                           */
/* ------------------------------------------------------------------ */
const ladder = `<div class="card">
  <div><p class="card-title">Court 1 — Day sheet</p><p class="card-desc">surface-1 · rounded-lg · shadow-e1</p></div>
  <div><div class="card l2">
    <div><p class="card-title" style="font-size:var(--text-base)">Round of 16</p><p class="card-desc">surface-2 · rounded-md · shadow-e2</p></div>
    <div><div class="card l3">
      <div><p class="card-desc" style="margin:0">surface-3 · rounded-sm · shadow-e3</p></div>
    </div></div>
  </div></div>
</div>`;
add("foundations/elevation.html", {
  group: "Elevation",
  title: "Elevation & surfaces",
  body: `<div class="page" style="padding-bottom:0">${head("Elevation", "Three levels, and a nested surface steps up one elevation and down one radius. Elevation N is bg-surface-N + border-border + shadow-eN — all three together, never one of them. A design that needs a fourth level is too deep; flatten it.")}</div>
<div class="page split" style="padding:0">
  <div class="raqt"><div class="half"><span class="mode">Dark — lightness + hairline carries it</span>${ladder}<p class="cap">On a near-black ground a shadow is invisible, so <code>--shadow-e1/2/3</code> are <code>none</code> and the step is surface lightness plus the border.</p></div></div>
  <div class="raqt light" style="background:var(--color-background);color:var(--color-foreground)"><div class="half"><span class="mode">Light — shadow carries it</span>${ladder}<p class="cap">All three surfaces resolve to white; the step is the shadow. One vocabulary, two implementations — this is why the semantic layer exists.</p></div></div>
</div>
<div class="raqt"><div class="page" style="padding-top:0"><p class="lede"><b style="color:var(--color-foreground)">A surface step separates a box from the box around it.</b> It cannot carry emphasis <i>inside</i> a box, because in light mode all three surfaces are white. Emphasis within a card comes from <code>muted</code>, <code>accent</code> or type weight — tokens that differ from the card in both modes.</p></div></div>`,
});

/* ------------------------------------------------------------------ */
/* Spacing & radius                                                    */
/* ------------------------------------------------------------------ */
const STEPS = [1,2,3,4,6,8,12,16];
const RADII = [["radius-sm","0.375rem"],["radius-md","0.625rem"],["radius-lg","0.875rem"],["radius-xl","1.25rem"]];
add("foundations/spacing-radius.html", {
  group: "Spacing",
  title: "Spacing & radius",
  extraCss: `.bar{display:grid;grid-template-columns:64px 92px 1fr;align-items:center;gap:14px;padding:7px 0}
.bar .b{height:16px;background:var(--color-primary);border-radius:2px}
.bar .t{font-family:ui-monospace,Menlo,monospace;font-size:var(--text-xs);color:var(--color-muted-foreground)}
.rad{display:flex;gap:18px;flex-wrap:wrap}
.rad div{text-align:center}
.rad .box{width:88px;height:88px;background:var(--color-surface-2);border:1px solid var(--color-border)}
.use{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:6px}
.use div{background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:14px}
.use b{display:block;font-size:var(--text-sm);margin-bottom:4px}
.use p{margin:0;font-size:var(--text-xs);color:var(--color-muted-foreground)}`,
  body: `<div class="page">
${head("Spacing & radius", "--spacing is 0.25rem and Tailwind generates the rungs. p-[13px] is the same defect as a hex — a decision nobody else can find or change.")}
<h2>Scale</h2>
${STEPS.map(n => `<div class="bar"><span class="t">${n}</span><span class="t">${n*0.25}rem</span><div class="b" style="width:calc(var(--spacing) * ${n} * 4)"></div></div>`).join("")}
<h2>Where each rung goes</h2>
<div class="use">
  <div><b>2</b><p>Inside a control — gap between an icon and its label.</p></div>
  <div><b>3–4</b><p>Control padding — button and input horizontal padding.</p></div>
  <div><b>4–6</b><p>Surface padding — the inside of a card, by level.</p></div>
  <div><b>8+</b><p>Between sections.</p></div>
</div>
<h2>Radius</h2>
<div class="rad">
${RADII.map(([n,v]) => `<div><div class="box" style="border-radius:var(--${n})"></div><p class="cap">${n}<br>${v}</p></div>`).join("")}
</div>
<p class="cap" style="margin-top:14px">Radius steps <i>down</i> as elevation steps up: a card at <code>rounded-lg</code> holds a row at <code>rounded-md</code>, which holds a chip at <code>rounded-sm</code>. <code>--radius</code> (0.625rem) is the shadcn compatibility alias for <code>radius-md</code>.</p>
</div>`,
});

/* ------------------------------------------------------------------ */
/* Iconography                                                         */
/* ------------------------------------------------------------------ */
const ICONS = {
  Trophy: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>`,
  Swords: `<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>`,
  LandPlot: `<path d="m12 8 6-3-6-3v10"/><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"/><path d="m6.49 12.85 11.02 6.3"/><path d="M17.51 12.85 6.5 19.15"/>`,
  Radio: `<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>`,
  Users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  Calendar: `<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>`,
  Plus: `<path d="M5 12h14"/><path d="M12 5v14"/>`,
  Filter: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
  Plus: `<path d="M5 12h14"/><path d="M12 5v14"/>`,
  Trophy: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>`,
  X: `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`,
  Search: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
  Loader: `<path d="M21 12a9 9 0 1 1-6.219-8.56"/>`,
  Swords: `<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>`,
};
const svg = (n, s = 16, cls = "") => `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const CONCEPTS = [["Trophy","tournament"],["Swords","match"],["LandPlot","court"],["Radio","live"],["Users","players"],["Calendar","schedule"],["Plus","add"],["Filter","filter"]];
add("foundations/iconography.html", {
  group: "Brand",
  title: "Iconography",
  extraCss: `.icons{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:12px}
.ic{background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:16px;text-align:center}
.ic svg{width:24px;height:24px;margin-bottom:8px}
.ic b{display:block;font-size:var(--text-sm)}
.ic span{font-size:var(--text-xs);color:var(--color-muted-foreground);font-family:ui-monospace,Menlo,monospace}
.sizes{display:flex;gap:28px;align-items:flex-end}
.sizes div{text-align:center}`,
  body: `<div class="page">
${head("Iconography", "One library: Lucide, via lucide-react. A second icon family is a second design system — a different grid, a different stroke, a different idea of what a chevron is. A glyph Lucide does not have is a gap to raise, the same as a missing token.")}
<h2>The vocabulary — one concept, one glyph</h2>
<p class="lede">The set is the vocabulary, not the library. The rule runs both ways: the same icon for "filter" here and "settings" there is the same defect as two icons for "add".</p>
<div class="icons">
${CONCEPTS.map(([n,c]) => `<div class="ic">${svg(n,24)}<b>${c}</b><span>${n}</span></div>`).join("")}
</div>
<h2>Three sizes, off the spacing scale</h2>
<div class="sizes">
  <div>${svg("Trophy",12)}<p class="cap"><code>size-3</code><br>beside text-xs — inside a badge</p></div>
  <div>${svg("Trophy",16)}<p class="cap"><code>size-4</code><br>the default — button and dialog set it</p></div>
  <div>${svg("Trophy",20)}<p class="cap"><code>size-5</code><br>an icon standing alone</p></div>
</div>
<p class="cap" style="margin-top:16px">Nothing larger: a 24px-grid glyph at 32px is four visible line segments, not an illustration. Never set <code>strokeWidth</code> by hand.</p>
<h2>Colour and labelling</h2>
<p class="lede">Icons take <code>currentColor</code> — that is what carries them into light mode and into a host app's scope. Give one a colour class only when the colour is the message: <span style="color:var(--color-success)">text-success</span>, <span style="color:var(--color-warning)">text-warning</span>, <span style="color:var(--color-destructive)">text-destructive</span>, <span style="color:var(--color-info)">text-info</span>, and nothing else. A live match is a <code>status-live</code> badge, never a red icon.</p>
<p class="lede">Decorative icons are <code>aria-hidden</code>; an icon-only button carries an <code>sr-only</code> label. Never let the glyph be the only carrier — status is colour <i>and</i> glyph <i>and</i> text, because any one of the three fails for somebody.</p>
</div>`,
});

const G = "Components";


const btn = (variant, { size = "md", state = "", label = "Enter tournament", icon = null, only = false } = {}) =>
  `<button class="btn ${size} ${variant} ${state}"${state === "is-disabled" ? " disabled" : ""}>${icon ? svg(icon) : ""}${only ? "" : label}</button>`;

/* ---------------- button ---------------- */
add("components/button.html", {
  group: G, title: "Button",
  extraCss: `.grid{display:grid;grid-template-columns:130px 1fr;gap:14px 20px;align-items:center}
.lbl{font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground)}
.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.loadwrap{position:relative;display:inline-flex}
.loadwrap .lbl-hidden{visibility:hidden}
.loadwrap .ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}`,
  body: `<div class="page">
${head("Button", "Every action. Five variants x four sizes. primary is the single most important thing a person can do on the screen — two primary buttons in one view means neither is.")}
<h2>Variants</h2>
<div class="grid">
  <span class="lbl">primary</span><div class="row">${btn("primary")}${btn("primary",{state:"is-hover",label:"Hover"})}${btn("primary",{state:"is-active",label:"Active"})}${btn("primary",{state:"is-focus",label:"Focus"})}${btn("primary",{state:"is-disabled",label:"Disabled"})}</div>
  <span class="lbl">secondary</span><div class="row">${btn("secondary",{label:"View draw"})}${btn("secondary",{state:"is-hover",label:"Hover"})}${btn("secondary",{state:"is-focus",label:"Focus"})}${btn("secondary",{state:"is-disabled",label:"Disabled"})}</div>
  <span class="lbl">ghost</span><div class="row">${btn("ghost",{label:"Cancel"})}${btn("ghost",{state:"is-hover",label:"Hover"})}${btn("ghost",{state:"is-focus",label:"Focus"})}${btn("ghost",{state:"is-disabled",label:"Disabled"})}</div>
  <span class="lbl">destructive</span><div class="row">${btn("destructive",{label:"Withdraw"})}${btn("destructive",{state:"is-hover",label:"Hover"})}${btn("destructive",{state:"is-focus",label:"Focus"})}${btn("destructive",{state:"is-disabled",label:"Disabled"})}</div>
  <span class="lbl">outline</span><div class="row">${btn("outline",{label:"Export"})}${btn("outline",{state:"is-hover",label:"Hover"})}${btn("outline",{state:"is-focus",label:"Focus"})}${btn("outline",{state:"is-disabled",label:"Disabled"})}</div>
</div>
<h2>Sizes</h2>
<div class="row">${btn("primary",{size:"sm",label:"Small"})}${btn("primary",{size:"md",label:"Medium"})}${btn("primary",{size:"lg",label:"Large"})}<button class="btn icon primary" aria-label="Add">${svg("Plus")}</button></div>
<p class="cap"><code>sm</code> h-8 · <code>md</code> h-9 (default) · <code>lg</code> h-11 · <code>icon</code> size-9. An icon-only button carries an <code>sr-only</code> label.</p>
<h2>With icon, and loading</h2>
<div class="row">
  ${btn("primary",{icon:"Plus",label:"Add match"})}
  ${btn("secondary",{icon:"Trophy",label:"Tournaments"})}
  <span class="loadwrap"><button class="btn md primary is-disabled"><span class="ov">${svg("Loader",16,"spin")}</span><span class="lbl-hidden">Add match</span></button></span>
</div>
<p class="cap"><code>loading</code> covers the label with a centred spinner and disables the button. The label stays in the layout — hidden, not removed — so the button keeps exactly the width it had. A spinner that is merely <i>inserted</i> widens a button with no icon and shifts everything beside it.</p>
<h2>All five states are required</h2>
<p class="lede">Rest, hover, active, <code>focus-visible</code>, disabled. Focus is a <code>ring-ring</code> ring and is never removed — <code>outline-none</code> without a replacement makes the component unusable by keyboard, and that is not a visual preference.</p>
</div>`,
});

/* ---------------- input ---------------- */
add("components/input.html", {
  group: G, title: "Input",
  extraCss: `.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.lbl{font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground);display:block;margin-bottom:6px}
.withicon{position:relative}.withicon .input{padding-left:2.25rem}
.withicon svg{position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:var(--color-muted-foreground)}`,
  body: `<div class="page">
${head("Input", "Single-line text. bg-transparent, border-input, radius md, focus ring on ring-ring. The input owns no error prop — invalid is driven by aria-invalid, which field sets.")}
<div class="grid">
  <div><span class="lbl">default</span><div class="input">Elin Bergström</div></div>
  <div><span class="lbl">placeholder</span><div class="input ph">Search players…</div></div>
  <div><span class="lbl">focused</span><div class="input foc">Elin Bergström</div></div>
  <div><span class="lbl">invalid — aria-invalid</span><div class="input invalid">not-an-email</div></div>
  <div><span class="lbl">disabled</span><div class="input" style="opacity:.5">Elin Bergström</div></div>
  <div><span class="lbl">with leading icon</span><div class="withicon">${svg("Search")}<div class="input ph">Search players…</div></div></div>
</div>
<p class="cap" style="margin-top:20px">The border is <code>--color-input</code> — a token that exists for form control borders and nothing else. Hairline edges elsewhere use <code>border</code>.</p>
</div>`,
});

/* ---------------- field ---------------- */
const field = (o) => `<div class="field ${o.error ? "err" : ""}"${o.disabled ? ' style="opacity:.5"' : ""}>
  <label>${o.label}${o.required ? ' <span class="req">*</span>' : ""}</label>
  ${o.loading ? '<div class="skel" style="height:2.25rem;border-radius:var(--radius-md)"></div>' : `<div class="input ${o.error ? "invalid" : ""} ${o.value ? "" : "ph"}">${o.value || o.placeholder || ""}</div>`}
  <div class="msg">${o.error || o.hint || ""}</div>
</div>`;
add("components/field.html", {
  group: G, title: "Field",
  extraCss: `.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.lbl{font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground);display:block;margin-bottom:8px}
.form{max-width:420px;display:grid;gap:16px}`,
  body: `<div class="page">
${head("Field", "Label + control + hint/error, wired together. This component is the argument that a product team never has to design an error state: pass one prop and the label tints, the control goes aria-invalid, the message swaps, and screen readers are pointed at it.")}
<div class="grid">
  <div><span class="lbl">default</span>${field({label:"Player name",placeholder:"Elin Bergström"})}</div>
  <div><span class="lbl">with hint</span>${field({label:"Seed",value:"4",hint:"Leave blank for unseeded entries."})}</div>
  <div><span class="lbl">required</span>${field({label:"Email",required:true,placeholder:"you@club.se"})}</div>
  <div><span class="lbl">error — replaces the hint, never stacked</span>${field({label:"Email",required:true,value:"elin@",error:"Enter a valid email address."})}</div>
  <div><span class="lbl">disabled</span>${field({label:"Division",value:"Open",disabled:true})}</div>
  <div><span class="lbl">loading</span>${field({label:"Club",loading:true,hint:"Loading your clubs…"})}</div>
</div>
<h2>A three-field form with one field in error</h2>
<div class="form">
  ${field({label:"Player name",required:true,value:"Elin Bergström"})}
  ${field({label:"Email",required:true,value:"elin@",error:"Enter a valid email address."})}
  ${field({label:"Seed",value:"4",hint:"Leave blank for unseeded entries."})}
  <div class="row"><button class="btn md primary">Add entry</button><button class="btn md ghost">Cancel</button></div>
</div>
<p class="cap" style="margin-top:16px">The message line reserves its height whether or not there is a message, so validating a form never pushes the rest of the page down. When <code>error</code> is set the label tints <code>text-destructive</code>, the control receives <code>aria-invalid</code>, and <code>aria-describedby</code> points at the error.</p>
</div>`,
});

/* ---------------- card ---------------- */
add("components/card.html", {
  group: G, title: "Card",
  extraCss: `.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:start}
.lbl{font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground);display:block;margin-bottom:8px}
.ftr{border-top:1px solid var(--color-border);padding-top:1.5rem!important}
.card.hov{border-color:var(--color-ring);cursor:pointer}`,
  body: `<div class="page">
${head("Card", "The surface primitive — it establishes the elevation, radius and padding grammar the whole system inherits. Nesting steps elevation itself; level overrides it.")}
<div class="grid">
  <div><span class="lbl">default</span><div class="card"><div><p class="card-title">Raqt Open 2026</p><p class="card-desc">Mixed doubles · 32 draw</p></div><div><p style="margin:0;font-size:var(--text-sm);color:var(--color-muted-foreground)">Entries close 14 March.</p></div></div></div>
  <div><span class="lbl">header, content, footer</span><div class="card"><div><p class="card-title">Raqt Open 2026</p><p class="card-desc">Mixed doubles · 32 draw</p></div><div><p style="margin:0;font-size:var(--text-sm);color:var(--color-muted-foreground)">24 of 32 slots filled.</p></div><div class="ftr row"><button class="btn sm primary">Enter</button><button class="btn sm ghost">Draw</button></div></div></div>
  <div><span class="lbl">interactive — cursor-pointer is written by hand here</span><div class="card hov"><div><p class="card-title">Court 3</p><p class="card-desc">Next match 14:00</p></div></div><p class="cap">Rule 8: the theme restores <code>cursor:pointer</code> for buttons, so you write <code>cursor-pointer</code> only for something clickable that is <i>not</i> a button — an interactive card is the one in this library.</p></div>
</div>
<h2>Nested — the elevation rule applying itself</h2>
<div style="max-width:520px">
  <div class="card">
    <div><p class="card-title">Round of 16</p><p class="card-desc">surface-1 · rounded-lg · shadow-e1 · p-6</p></div>
    <div><div class="card l2">
      <div><p class="card-title" style="font-size:var(--text-base)">Court 1</p><p class="card-desc">surface-2 · rounded-md · shadow-e2 · p-5</p></div>
      <div><div class="card l3"><div><p class="card-desc" style="margin:0">surface-3 · rounded-sm · shadow-e3 · p-4</p></div></div></div>
    </div></div>
  </div>
</div>
<p class="cap" style="margin-top:14px">A <code>Card</code> inside a <code>Card</code> is one level up without anyone remembering to say so — the elevation rule should be impossible to get wrong by omission. Three levels is the whole ladder.</p>
</div>`,
});

/* ---------------- badge ---------------- */
const bdg = (v, label, dot = false) => `<span class="badge b-${v}">${dot ? '<span class="dot"><i></i><b></b></span>' : ""}${label}</span>`;
const badgeRows = `<h2>Meaning — the seven any product needs</h2>
<div class="row">${bdg("default","Default")}${bdg("secondary","Secondary")}${bdg("outline","Outline")}${bdg("success","Confirmed")}${bdg("warning","Awaiting payment")}${bdg("destructive","Withdrawn")}${bdg("info","Rescheduled")}</div>
<h2>Match status — the domain's own words</h2>
<div class="row">${bdg("upcoming","Upcoming")}${bdg("live","Live",true)}${bdg("finished","Finished")}${bdg("open","Open")}</div>`;
add("components/badge.html", {
  group: G, title: "Badge",
  body: `<div class="page" style="padding-bottom:0">
${head("Badge", "The status vocabulary. Two families live here and they are not interchangeable: seven generic meanings, and four match statuses wired to the --color-status-* tokens. A match that is live is live, never destructive — the badge says what a thing is, and the token layer decides what that looks like.")}
</div>
<div class="page split" style="padding:0">
  <div class="raqt"><div class="half"><span class="mode">Dark</span>${badgeRows}</div></div>
  <div class="raqt light" style="background:var(--color-background);color:var(--color-foreground)"><div class="half"><span class="mode">Light</span>${badgeRows}</div></div>
</div>
<div class="raqt"><div class="page" style="padding-top:8px">
<p class="lede">Only <code>live</code> moves, and only the dot moves — a badge that pulses in its entirety turns a list of matches into a strobe. Under <code>prefers-reduced-motion</code> the pulse drops to a plain dot rather than to nothing: the dot is the signal, the pulse is only emphasis.</p>
<p class="lede">Retinting <code>live</code> later is one token, not a search through every screen for the badge that happened to be red.</p>
</div></div>`,
});

/* ---------------- dialog ---------------- */
add("components/dialog.html", {
  group: G, title: "Dialog",
  extraCss: `.stage{position:relative;border:1px solid var(--color-border);border-radius:var(--radius-lg);overflow:hidden;height:340px;background:var(--color-background)}
.behind{padding:24px;opacity:.6}
.scrim{position:absolute;inset:0;background:color-mix(in srgb,var(--color-background) 80%,transparent);backdrop-filter:blur(2px)}
.panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(400px,86%);background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-e3);padding:24px;display:grid;gap:16px}
.panel h3{font-family:var(--font-display);font-stretch:115%;letter-spacing:-.01em;font-size:var(--text-lg);margin:0}
.panel p{margin:0;font-size:var(--text-sm);color:var(--color-muted-foreground)}
.close{position:absolute;right:14px;top:14px;background:transparent;border:0;color:var(--color-muted-foreground);cursor:pointer;padding:4px;border-radius:var(--radius-sm)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:20px}`,
  body: `<div class="page">
${head("Dialog", "Modal overlays, Radix-backed. The overlay is a scrim over background at reduced opacity; the panel is surface-2 with shadow-e3 and radius lg. Focus trap and escape-to-close come from Radix.")}
<div class="two">
  <div>
    <div class="stage">
      <div class="behind"><p class="card-title">Round of 16</p><p class="card-desc">Court 1 · 14:00</p></div>
      <div class="scrim"></div>
      <div class="panel">
        <button class="close" aria-label="Close">${svg("X")}</button>
        <div><h3>Withdraw from draw</h3><p>Elin Bergström will be removed from the Raqt Open 2026 mixed doubles draw. Their opponent advances on a walkover.</p></div>
        <div class="row" style="justify-content:flex-end"><button class="btn md ghost">Cancel</button><button class="btn md destructive">Withdraw</button></div>
      </div>
    </div>
    <p class="cap">Destructive confirmation. One primary action per view — here the destructive button <i>is</i> it, and the alternative steps down to <code>ghost</code>.</p>
  </div>
  <div>
    <div class="stage">
      <div class="behind"><p class="card-title">Entries</p><p class="card-desc">24 of 32 slots filled</p></div>
      <div class="scrim"></div>
      <div class="panel">
        <button class="close" aria-label="Close">${svg("X")}</button>
        <div><h3>Add entry</h3></div>
        ${field({label:"Player name",required:true,placeholder:"Elin Bergström"})}
        ${field({label:"Seed",hint:"Leave blank for unseeded.",placeholder:"—"})}
        <div class="row" style="justify-content:flex-end"><button class="btn md ghost">Cancel</button><button class="btn md primary">Add entry</button></div>
      </div>
    </div>
    <p class="cap">Composed with <code>field</code> — the dialog owns the frame, not the form grammar.</p>
  </div>
</div>
<h2>Rule 10 — anything portalled has to re-enter the scope</h2>
<p class="lede">The theme is a <code>.raqt</code> class and custom properties inherit down the DOM. A dialog that portals to <code>document.body</code> lands <b style="color:var(--color-foreground)">outside</b> the scope and picks up the host app's palette instead. Re-establish it inside the portal on a <code>display:contents</code> wrapper — <code>&lt;div className="contents raqt"&gt;</code> — and carry the mode explicitly, because the portal left its ancestry behind: a light-mode host needs <code>"raqt light"</code>. <code>dialog</code> does this already; copy it rather than rediscovering it.</p>
</div>`,
});

/* ---------------- skeleton ---------------- */
add("components/skeleton.html", {
  group: G, title: "Skeleton",
  extraCss: `.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;align-items:start}
.lbl{font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground);display:block;margin-bottom:10px}`,
  body: `<div class="page">
${head("Skeleton", "The loading state a product team will never design — which is exactly why it ships in the library. bg-muted with a shimmer that travels across it, falling back to a static pulse under prefers-reduced-motion.")}
<div class="grid">
  <div><span class="lbl">line</span><div class="skel" style="height:1rem;width:70%"></div></div>
  <div><span class="lbl">paragraph</span><div class="col" style="gap:8px"><div class="skel" style="height:.75rem"></div><div class="skel" style="height:.75rem"></div><div class="skel" style="height:.75rem;width:60%"></div></div></div>
  <div><span class="lbl">avatar</span><div class="skel" style="height:2.5rem;width:2.5rem;border-radius:9999px"></div></div>
</div>
<h2>Card skeleton</h2>
<div style="max-width:420px"><div class="card">
  <div class="col" style="gap:10px"><div class="skel" style="height:1.25rem;width:55%"></div><div class="skel" style="height:.75rem;width:35%"></div></div>
  <div class="col" style="gap:8px"><div class="skel" style="height:.75rem"></div><div class="skel" style="height:.75rem;width:70%"></div></div>
</div></div>
<p class="cap" style="margin-top:14px">Block sizes mirror the real layout, so a list does not reflow when the data lands. A thing that shows data is not done until it has all three states: loaded, <b>loading</b>, <b>empty</b>.</p>
</div>`,
});

/* ---------------- empty-state ---------------- */
add("components/empty-state.html", {
  group: G, title: "Empty state",
  extraCss: `.two{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
.lbl{font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground);display:block;margin-bottom:10px}
.compact{gap:.5rem;padding:1.5rem 1rem}
.compact .medallion{width:2.25rem;height:2.25rem}
.compact .medallion svg{width:1rem;height:1rem}
.compact h3{font-family:var(--font-sans);font-stretch:normal;letter-spacing:normal;font-size:var(--text-base);font-weight:600}
.well{border:1px dashed var(--color-border);border-radius:var(--radius-lg)}`,
  body: `<div class="page">
${head("Empty state", "The other state a product team will never design. Deliberately borderless: an empty state is content, not a container — drop it inside a card, a dashed well or a bare region and it inherits whatever surface it lands on rather than fighting it with a second edge.")}
<div class="two">
  <div><span class="lbl">default, with action</span><div class="well"><div class="empty"><span class="medallion">${svg("Trophy",20)}</span><h3>No tournaments yet</h3><p>Create your first tournament and Raqt will build the draw, the schedule and the day sheets for you.</p><button class="btn md primary">${svg("Plus")}New tournament</button></div></div></div>
  <div><span class="lbl">inside a card</span><div class="card"><div><p class="card-title">Court 3</p><p class="card-desc">Today</p></div><div><div class="empty compact"><span class="medallion">${svg("Swords",16)}</span><h3>No matches scheduled</h3><p>Assign a match from the draw.</p></div></div></div><p class="cap"><code>compact</code> is for empties inside something else already — a panel, a sidebar, a table — where the full display title would out-shout its own container.</p></div>
</div>
<p class="cap" style="margin-top:18px">The icon sits in a medallion rather than loose on the surface, so a glyph of any weight lands at the same optical size. The medallion is <code>muted</code>, never <code>primary</code> — the one green thing in an empty state should be the action, if there is one.</p>
</div>`,
});

/* ---------------- match-card ---------------- */
const side = (players, scores, { muted = false, won = false, liveSet = null } = {}) => `
<div class="side">
  <div class="names ${muted ? "mut" : ""}">${players.map(p => `<p class="${muted ? "" : "strong"}">${p}</p>`).join("")}</div>
  ${scores ? `<div class="scores">${scores.map((g, i) => `<span class="s ${muted ? "mut" : ""} ${won ? "won" : ""} ${i === liveSet ? "live" : ""}">${g}</span>`).join("")}</div>` : ""}
</div>`;
const mc = (o) => `<div class="card" style="gap:.75rem">
  <div class="row" style="justify-content:space-between"><span class="badge b-${o.status}">${o.status === "live" ? '<span class="dot"><i></i><b></b></span>' : ""}${o.label}</span><span style="font-size:var(--text-xs);color:var(--color-muted-foreground)">${o.meta}</span></div>
  <div class="mcbody">
    <div style="flex:1;min-width:0">
      ${side(o.a.p, o.a.s, { muted: o.muted === 0, won: o.won === 0, liveSet: o.liveSet })}
      <div class="divider">${side(o.b.p, o.b.s, { muted: o.muted === 1, won: o.won === 1, liveSet: o.liveSet })}</div>
    </div>
    ${o.time ? `<span class="time">${o.time}</span>` : ""}
  </div>
</div>`;
add("components/match-card.html", {
  group: G, title: "Match card",
  extraCss: `.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:start}
.lbl{font-size:var(--text-xs);font-family:ui-monospace,Menlo,monospace;color:var(--color-muted-foreground);display:block;margin-bottom:10px}
.mcbody{display:flex;align-items:center;gap:1rem}
.side{display:flex;align-items:center;justify-content:space-between;gap:1rem}
.names{min-width:0;flex:1}
.names p{margin:0;font-size:var(--text-sm);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.names p.strong{font-weight:500;color:var(--color-foreground)}
.names.mut{color:var(--color-muted-foreground)}
.divider{margin-top:.5rem;border-top:1px solid var(--color-border);padding-top:.5rem}
.scores{display:flex;flex-shrink:0;gap:.25rem}
.s{width:1.75rem;border-radius:var(--radius-sm);padding:.125rem 0;text-align:center;font-size:var(--text-sm);font-variant-numeric:tabular-nums;color:var(--color-foreground)}
.s.mut{color:var(--color-muted-foreground)}
.s.won{font-weight:600}
.s.live{background:var(--color-muted);font-weight:600;color:var(--color-foreground)}
.time{flex-shrink:0;font-size:var(--text-lg);font-weight:500;font-variant-numeric:tabular-nums;color:var(--color-muted-foreground)}`,
  body: `<div class="page">
${head("Match card", "The domain component — the one thing in the library that looks like Raqt rather than like a component library. It is assembled entirely from card and badge: every surface, edge, radius and status colour arrives through them. A domain component is a composition, not an exception.")}
<div class="grid">
  <div><span class="lbl">upcoming — time replaces the score</span>${mc({status:"upcoming",label:"Upcoming",meta:"Court 3",time:"14:00",a:{p:["E. Bergström"]},b:{p:["M. Lindqvist"]}})}</div>
  <div><span class="lbl">live — the set in play is emphasised</span>${mc({status:"live",label:"Live",meta:"Court 1 · 13:42",liveSet:2,a:{p:["E. Bergström"],s:[6,3,4]},b:{p:["M. Lindqvist"],s:[4,6,2]}})}</div>
  <div><span class="lbl">finished — the losing side dims</span>${mc({status:"finished",label:"Finished",meta:"Court 1 · 12:05",won:0,muted:1,a:{p:["E. Bergström"],s:[6,3,6]},b:{p:["M. Lindqvist"],s:[4,6,2]}})}</div>
  <div><span class="lbl">doubles</span>${mc({status:"live",label:"Live",meta:"Court 2 · 14:18",liveSet:1,a:{p:["E. Bergström","J. Falk"],s:[6,2]},b:{p:["M. Lindqvist","A. Nyström"],s:[3,4]}})}</div>
  <div><span class="lbl">long names truncate</span>${mc({status:"finished",label:"Finished",meta:"Court 4 · 11:20",won:1,muted:0,a:{p:["Konstantinos Papadopoulos-Nilsson"],s:[4,6,3]},b:{p:["Wilhelmina Söderström-Åkerlund"],s:[6,4,6]}})}</div>
  <div><span class="lbl">loading — MatchCardSkeleton</span><div class="card" style="gap:.75rem">
    <div class="row" style="justify-content:space-between"><div class="skel" style="height:1.25rem;width:4rem;border-radius:9999px"></div><div class="skel" style="height:.75rem;width:6rem"></div></div>
    <div><div class="side"><div class="skel" style="height:1rem;width:10rem"></div><div class="scores"><div class="skel" style="height:1.25rem;width:1.75rem"></div><div class="skel" style="height:1.25rem;width:1.75rem"></div><div class="skel" style="height:1.25rem;width:1.75rem"></div></div></div>
    <div class="divider"><div class="side"><div class="skel" style="height:1rem;width:8rem"></div><div class="scores"><div class="skel" style="height:1.25rem;width:1.75rem"></div><div class="skel" style="height:1.25rem;width:1.75rem"></div><div class="skel" style="height:1.25rem;width:1.75rem"></div></div></div></div></div>
  </div></div>
</div>
<p class="cap" style="margin-top:18px">The set in play is emphasised with <code>bg-muted</code> — not a surface step. The surface ramp collapses to white in light mode, so a level-3 chip on a level-1 card would be invisible there; the emphasis has to come from a token that differs from the card in <i>both</i> modes. That is rule 3 doing real work.</p>
<p class="cap">Only a finished match has a losing side to play down. A live one is still anyone's, so neither line is dimmed while it is being played.</p>
</div>`,
});

/* ------------------------------------------------------------------ */
/* Brand — three marks                                                 */
/* ------------------------------------------------------------------ */
/**
 * Two of the three brand assets are white-ish artwork on transparency, and
 * `mask-image` reads the alpha channel alone — the ink colour in the file is
 * never sampled. (`logo.png` is a palette PNG whose every entry is #FFFFFF;
 * `logotype.png` is RGBA at #FAFAFA. The difference does not survive masking,
 * which is the point.) So both are painted from a token and follow the theme
 * into light mode by themselves, for the same reason an icon takes
 * `currentColor`. A second baked PNG per mode would be a second value nobody
 * can find or change.
 *
 * `icon.png` is the exception and stays a picture: it is opaque, it carries its
 * own white ground, and it is rendered by iOS, Android and the browser tab —
 * none of which know what `.raqt` is.
 */
const b64 = (p) => readFileSync(join(REPO, "assets/brand", p)).toString("base64");
const LOGO_URL = `data:image/png;base64,${b64("logo.png")}`;
const TYPE_URL = `data:image/png;base64,${b64("logotype.png")}`;
/* icon.png carries JPEG bytes under a .png name — declared honestly here. */
const ICON_URL = `data:image/jpeg;base64,${b64("icon.png")}`;

/** Intrinsic ratios, so every rendering below is the asset's own proportion. */
const LOGO_AR = 768 / 423;   // 1.816 — wordmark over tagline
const TYPE_AR = 1870 / 501;  // 3.733 — wordmark alone

const mark = (which, w, extra = "") =>
  `<div class="mark ${which}" style="width:${w}px;height:${Math.round(w / (which === "logo" ? LOGO_AR : TYPE_AR))}px;${extra}"></div>`;

const modePanel = (label, fg, note) => `<div class="mk">
  <span class="mode">${label}</span>
  <div class="col" style="gap:22px">${mark("logo", 210)}${mark("type", 260)}</div>
  <p class="cap">Both painted <code>--color-foreground</code> — <code>${fg}</code> here. ${note}</p>
</div>`;

add("foundations/logo.html", {
  group: "Brand",
  title: "Logo, logotype & app icon",
  extraCss: `.mk{padding:40px}
.mark{background:var(--color-foreground);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain}
.mark.logo{-webkit-mask-image:url("${LOGO_URL}");mask-image:url("${LOGO_URL}")}
.mark.type{-webkit-mask-image:url("${TYPE_URL}");mask-image:url("${TYPE_URL}")}
.three{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:start}
.three>div{background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:22px}
.three .box{height:104px;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.three h3{font-family:var(--font-display);font-stretch:115%;letter-spacing:-.01em;font-size:var(--text-base);margin:0 0 4px}
.three p{margin:0;font-size:var(--text-sm);color:var(--color-muted-foreground);line-height:1.45}
.three .when{margin-top:10px;font-size:var(--text-xs);color:var(--color-primary)}
.clear{position:relative;display:inline-block;padding:34px;border:1px dashed var(--color-border);border-radius:var(--radius-md)}
.icon{width:104px;height:104px;border-radius:23px;display:block}
.two{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
.floor{display:flex;align-items:flex-end;gap:26px;flex-wrap:wrap}
.floor figure{margin:0;text-align:center}
.floor figcaption{font-size:var(--text-xs);color:var(--color-muted-foreground);margin-top:8px}
.floor .bad{color:var(--color-destructive)}
.dont{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px}
.grounds{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
.gr{border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-background);min-height:150px;display:flex;align-items:center;justify-content:center;padding:28px}
.gr.plate{background:var(--color-primary);border-color:transparent}
.gr.plate .mark{background:var(--color-background)}
.ratio{font-family:ui-monospace,Menlo,monospace;font-size:var(--text-xs);color:var(--color-muted-foreground)}
.no{color:var(--color-destructive);font-weight:600}
.dont div{border:1px solid var(--color-border);border-radius:var(--radius-md);padding:18px;text-align:center}
.dont .mark{margin:0 auto 12px}
.dont b{display:block;font-size:var(--text-xs);color:var(--color-destructive);text-transform:uppercase;letter-spacing:.06em}`,
  body: `<div class="page" style="padding-bottom:16px">
${head("Logo, logotype & app icon", "Three marks, one decision: how much room is there, and does the reader already know what Raqt is. Two of the three are alpha masks painted by a token, so they invert with the mode on their own — there is no light-mode file to keep in sync.")}
<div class="three">
  <div><div class="box">${mark("logo", 190)}</div><h3>Logo</h3><p>The full lockup — wordmark over the tagline. The only mark that says what Raqt <i>is</i>.</p><p class="when">First contact: marketing, the login screen, a footer, a printed draw sheet.</p></div>
  <div><div class="box">${mark("type", 230)}</div><h3>Logotype</h3><p>Wordmark alone. Reads at a third of the height because nothing small has to survive.</p><p class="when">In-product chrome: app header, nav bar, anywhere the reader is already inside Raqt.</p></div>
  <div><div class="box"><img class="icon" src="${ICON_URL}" alt="Raqt app icon"></div><h3>App icon</h3><p>The <b>R</b> alone, on its own opaque ground. A picture, not a mask.</p><p class="when">Home screen, favicon, avatar — any square the platform draws for you.</p></div>
</div>
</div>
<div class="page split" style="padding:0">
  <div class="raqt">${modePanel("Dark — the default", "#EAF5EF", "The mark is never the green: <code>primary</code> marks the one thing to do next, and a logo is not an action.")}</div>
  <div class="raqt light" style="background:var(--color-background);color:var(--color-foreground)">${modePanel("Light", "#071410", "Nothing swapped the file — <code>foreground</code> changed and the mask followed.")}</div>
</div>
<div class="raqt"><div class="page">
<h2>Grounds the mark may sit on</h2>
<p class="lede">Two, and they are the two <code>background</code> resolves to. The mark is
<code>foreground</code> on <code>background</code> in whichever mode it lands in — that pairing is the
whole rule, and it is why there is one file rather than one per ground.</p>
<div class="grounds">
  <div class="raqt">
    <div class="gr">${mark("type", 190)}</div>
    <p class="cap">Ink ground — the default.<br><span class="ratio">#EAF5EF on #071410 · 16.8:1</span></p>
  </div>
  <div class="raqt light">
    <div class="gr">${mark("type", 190)}</div>
    <p class="cap" style="color:var(--color-muted-foreground)">Light ground.<br><span class="ratio">#071410 on #F2F7F4 · 17.4:1</span></p>
  </div>
  <div class="raqt">
    <div class="gr plate">${mark("type", 190)}</div>
    <p class="cap"><span class="no">Not a green plate.</span> Legible — 10.8:1 — and still wrong: <code>primary</code> is
    the signal for the one thing to do next, and a field of it behind a logo spends the loudest colour in the system on
    the one element that is never an action. Rule 5. Use the ink or light ground and let the green stay scarce.</p>
  </div>
</div>
<h2>Size floor — this is what picks the mark</h2>
<div class="floor">
  <figure>${mark("logo", 210)}<figcaption>logo · 210px ✓</figcaption></figure>
  <figure>${mark("logo", 160)}<figcaption>logo · 160px — floor</figcaption></figure>
  <figure>${mark("logo", 96)}<figcaption class="bad">logo · 96px ✗ tagline gone</figcaption></figure>
  <figure>${mark("type", 150)}<figcaption>logotype · 150px ✓</figcaption></figure>
  <figure>${mark("type", 90)}<figcaption>logotype · 90px — floor</figcaption></figure>
  <figure><img class="icon" src="${ICON_URL}" alt="" style="width:40px;height:40px;border-radius:9px"><figcaption>icon · 40px ✓</figcaption></figure>
</div>
<p class="cap" style="margin-top:14px">The binding constraint on the <b>logo</b> is never <b>RAQT</b> — it is the tagline, set at roughly a fifth of the wordmark's height. Below about 160px wide it stops resolving and the lockup becomes a wordmark with a grey smudge under it, which is worse than a wordmark. That is the whole reason the logotype exists: it is the same mark with the fragile part removed, so it holds down to about 90px. Below that, the icon.</p>
<h2>Clear space</h2>
<div class="two">
  <div><div class="clear">${mark("type", 200)}</div><p class="cap"><b style="color:var(--color-foreground)">Both files are cropped tight — there is no built-in margin.</b> <code>logo.png</code>'s ink runs to the canvas edge on three sides and <code>logotype.png</code>'s on two; set either one flush in a header and the glyphs touch the box. Clear space is the layout's job, always, and it is not something a designer can eyeball from the asset.</p><p class="cap"><b style="color:var(--color-foreground)">Proposed, not yet ratified:</b> clear space on all four sides equal to the cap height of the wordmark, as drawn here. Nothing sets in it, including the edge of the surface the mark sits on. Replace this with the real rule if the brand has one.</p></div>
  <div><p class="lede"><b style="color:var(--color-foreground)">Open question — the charcoal.</b> The app icon is <code>#2B2F30</code>, a neutral. The system's near-black is <code>#071410</code>, green-tinted ink, and that is what the masked marks are painted in light mode. They read as the same colour alone and visibly differ side by side. No token names <code>#2B2F30</code>, so as it stands it is an undocumented value — which by §4 is a contract change, not something to inline. Either the icon moves onto the ink, or the charcoal earns a <code>brand-*</code> primitive.</p>
  <p class="lede"><code>assets/brand/icon.png</code> also carries JPEG bytes under a <code>.png</code> name. Nothing is broken — the emitter declares it <code>image/jpeg</code> — but the name is wrong.</p></div>
</div>
<h2>Don't</h2>
<div class="dont">
  <div>${mark("type", 150, "background:var(--color-primary)")}<b>Not in the green</b></div>
  <div style="background:var(--color-primary);border-color:transparent">${mark("type", 150, "background:var(--color-background)")}<b style="color:var(--color-background)">Not on a green plate</b></div>
  <div>${mark("type", 150, "background:var(--color-muted-foreground)")}<b>Not at reduced contrast</b></div>
  <div>${mark("type", 150, "transform:scaleX(1.3)")}<b>Never stretched</b></div>
  <div>${mark("logo", 110)}<b>Not below its floor</b></div>
</div>
</div></div>`,
});

/* ------------------------------------------------------------------ */
/* globals.css — the project-level stylesheet                          */
/* ------------------------------------------------------------------ */
/**
 * The cards each inline the theme, which is what makes them byte-exact. But that
 * leaves Claude Design with sixteen pictures and no machinery: its manifest wants
 * a stylesheet at `globalCssPaths` before it can apply the tokens to a design it
 * generates itself.
 *
 * This is that stylesheet, and it is a *rewrite* of the emitted theme rather than
 * a copy of it — two selector substitutions, so there is still exactly one place
 * any value is written. Claude Design draws artboards with no `.raqt` wrapper, so
 * the scope is promoted to `:root`: dark by default, no class required, the same
 * trick tokens.css plays for Storybook.
 */
function promoteScope(css) {
  const subs = [
    [".raqt {", ":root,\n.raqt {"],
    [".raqt.light,\n.light .raqt {", ":root.light,\n.light,\n.raqt.light,\n.light .raqt {"],
  ];
  return subs.reduce((out, [from, to]) => {
    if (!out.includes(from)) {
      throw new Error(`theme.css no longer contains ${JSON.stringify(from)} — selector rewrite is stale`);
    }
    return out.replace(from, to);
  }, css);
}

writeFileSync(
  join(OUT, "globals.css"),
  `/* GENERATED by design-system/build.mjs from tokens/dist/theme.css — do not edit.
   The Raqt theme with its scope promoted to :root, for Claude Design, which
   renders artboards without a .raqt wrapper. Values live in docs/TOKENS.md. */

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Archivo:wdth,wght@100..125,400..700&display=swap");

${promoteScope(THEME)}

body {
  margin: 0;
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
}
`,
);
console.log("  globals.css");

writeAll(files);

/* ------------------------------------------------------------------ */
function writeAll(map) {
  for (const [p, content] of Object.entries(map)) {
    const full = join(OUT, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  console.log(Object.keys(map).length + " files:\n" + Object.keys(map).map(f => "  " + f).join("\n"));
}
