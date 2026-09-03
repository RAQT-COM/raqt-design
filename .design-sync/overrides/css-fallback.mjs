// FORK of lib/css-fallback.mjs. Only fallbackCssFromStorybook differs: the
// scraped stylesheet is trimmed before it is written.
//
// Why. The scrape is Storybook's compiled Tailwind output, and it is the only
// faithful source of component styling - the components ARE Tailwind classes, so
// hand-authoring a replacement would mean inventing CSS, which is exactly what a
// deterministic sync must not do. But the app builds its token list from every
// custom property in styles.css's @import closure, and the raw scrape contributes
// 151 of them: 82 redeclarations of tokens our own tokens/*.css already define,
// and 55 of Tailwind's internal --tw-* composition variables. The palette ends up
// buried in machinery.
//
// Two trims, both provable rather than judged:
//
//   1. A custom property this repo's tokens/dist/root/*.css already declares is
//      dropped from the scrape. Same generator, same values, and our files are
//      imported first, so the cascade lands on an identical result.
//   2. An `@property --tw-*` rule whose variable is referenced by no var() in the
//      stylesheet is dropped. Unreferenced means unreachable.
//
// What is NOT trimmed: the 43 --tw-* rules that ARE referenced. They back
// Tailwind's composition strings - `filter: var(--tw-blur,) … var(--tw-sepia,)`,
// `font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) …` - and
// their `inherits: false` is what stops those leaking down the tree. Dropping
// them would make shadow-*, ring-*, rotate-*, gradients and tabular-nums either
// silently do nothing or bleed. They stay, and they stay grouped in
// _ds_bundle.css, which sorts last in the token list.
//
// The gate is the compare loop: if a trim changed any rendering, a component
// stops matching its storybook render.

// Storybook-only CSS fallbacks - storybook-static's iframe.html is the source
// for both the compiled-stylesheet fallback (when _ds_bundle.css is a
// bundler-resolve-only stub) and remote webfont <link> scraping.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Brand fonts shipped via .storybook/preview-head.html land inline in the
// built iframe.html, often as base64 data-URI @font-face that no filename
// search finds. Harvest faces that are FULLY self-contained (every src is a
// data: URI - storybook's own UI fonts use file URLs and are skipped) for
// families nothing else shipped.
export function inlineFontFacesFromStorybook(sbStatic, existingRules) {
  if (!sbStatic) return [];
  let html;
  try { html = readFileSync(join(sbStatic, 'iframe.html'), 'utf8'); } catch { return []; }
  const familyOf = (block) => /font-family:\s*['"]?([^'";}]+)/i.exec(block)?.[1].trim().toLowerCase();
  const have = new Set(existingRules.map(familyOf).filter(Boolean));
  const out = [];
  for (const m of html.matchAll(/@font-face\s*\{[^}]*\}/gi)) {
    const block = m[0];
    const urls = [...block.matchAll(/url\(\s*['"]?([^'")]+)/gi)].map((u) => u[1]);
    if (!urls.length || !urls.every((u) => u.startsWith('data:'))) continue;
    const fam = familyOf(block);
    if (!fam || have.has(fam)) continue;
    out.push(block);
  }
  if (out.length) console.error(`  [FONTS_FROM_PREVIEW_HEAD] harvested ${out.length} data-URI @font-face rule(s) from the storybook reference`);
  return out;
}

// Utility-CSS / CSS-in-JS DSes often ship a dist/styles.css
// that's a stub `@import "@scope/styles"` meant for a bundler to resolve.
export function isPlaceholderCss(p) {
  if (!existsSync(p)) return false;
  const sz = statSync(p).size;
  if (sz > 500) return false;
  const txt = readFileSync(p, 'utf8');
  // Only @import/@charset/comments/whitespace -> no real rules.
  const stripped = txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@(import|charset)\b[^;]*;/g, '').trim();
  return stripped.length === 0;
}

// If bundleCss is a placeholder stub, replace it with storybook-static's own
// compiled CSS (the largest local <link rel=stylesheet> in iframe.html).
// Relative url()s are NOT rewritten - sbStatic isn't uploaded, so pointing
// into it would break post-upload. They'll 404 in the preview (images missing)
// but class rules still apply. Returns the new srcDir for extractFonts, which
// DOES copy font files into the bundle.

/** Names this repo's own token files declare - the scrape need not repeat them. */
function ownTokenNames() {
  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'tokens', 'dist', 'root');
  if (!existsSync(dir)) return new Set();
  const names = new Set();
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.css')) continue;
    for (const m of readFileSync(join(dir, f), 'utf8').matchAll(/(--[a-z0-9-]+)\s*:/g)) names.add(m[1]);
  }
  return names;
}

/** Drop redundant declarations and unreachable @property rules. Verified by compare. */
function trimScrapedCss(css) {
  const before = new Set(css.match(/(--[a-zA-Z0-9-]+)\s*:/g) ?? []).size;

  // 2. @property rules for variables nothing references.
  const referenced = new Set([...css.matchAll(/var\((--tw-[a-z0-9-]+)/g)].map((m) => m[1]));
  let dropped = 0;
  css = css.replace(/@property\s+(--tw-[a-z0-9-]+)\s*\{[^}]*\}/g, (whole, name) => {
    if (referenced.has(name)) return whole;
    dropped++;
    return '';
  });

  // 1. Declarations our own token files already make. Scoped to the property name,
  //    so a rule keeps every other declaration it carries.
  const own = ownTokenNames();
  let deduped = 0;
  if (own.size) {
    css = css.replace(/(--[a-z0-9-]+)\s*:\s*[^;}]*;/g, (whole, name) => {
      if (!own.has(name) || name.startsWith('--tw-')) return whole;
      deduped++;
      return '';
    });
  }

  console.error(`  [CSS_TRIM] scrape: dropped ${deduped} declaration(s) our tokens/ already define and ${dropped} unreferenced @property rule(s)`);
  return css;
}

export function fallbackCssFromStorybook({ bundleCss, sbStatic, out }) {
  // A MISSING _ds_bundle.css counts too - DSes that ship styles in a sibling
  // package (compiled JS imports no CSS) emit no css file at all.
  if ((existsSync(bundleCss) && !isPlaceholderCss(bundleCss)) || !sbStatic || !existsSync(join(sbStatic, 'iframe.html'))) return null;
  const iframeHtml = readFileSync(join(sbStatic, 'iframe.html'), 'utf8');
  const links = [...iframeHtml.matchAll(/<link\b[^>]*>/gi)]
    .map((m) => m[0])
    .filter((t) => /\brel\s*=\s*["']stylesheet["']/i.test(t))
    .map((t) => t.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1])
    .filter((h) => h && !/^(https?:|\/\/)/.test(h))
    .map((h) => join(sbStatic, h.replace(/^\.\//, '')))
    .filter((p) => p.startsWith(sbStatic + sep) && existsSync(p))
    .sort((a, b) => statSync(b).size - statSync(a).size);
  if (links[0]) {
    const was = existsSync(bundleCss) ? `a ${statSync(bundleCss).size}B placeholder` : 'missing';
    const kb = (statSync(links[0]).size / 1024).toFixed(0);
    const srcDir = dirname(links[0]);
    const css = readFileSync(links[0], 'utf8');
    const assets = [...new Set([...css.matchAll(/url\(\s*(['"]?)(?!data:|https?:|\/\/|\/)([^'")]+)\1\s*\)/gi)].map((m) => m[2]))];
    writeFileSync(bundleCss, trimScrapedCss(css));
    console.error(`[CSS_FROM_STORYBOOK] _ds_bundle.css was ${was} \u2014 replaced with ${relative(out, links[0])} (${kb} KB).`);
    if (assets.length) {
      console.error(`[CSS_ASSETS] ${assets.length} relative url() ref(s) in the fallback CSS won't resolve post-upload (fonts are copied separately via extractFonts; images will 404): ${assets.slice(0, 5).join(', ')}${assets.length > 5 ? ', \u2026' : ''}`);
    }
    return srcDir;
  }
  console.error(`[CSS_PLACEHOLDER] _ds_bundle.css is missing or a stub (@import-only, <500B) and no storybook CSS found to fall back to \u2014 set cfg.cssEntry to the compiled stylesheet.`);
  return null;
}

// Remote stylesheet links (webfonts, etc.) from the storybook iframe. CSS-in-JS
// DSes emit no static stylesheet, but commonly inject a remote webfont <link>
// via .storybook/preview-head.html - that link
// is then the ONLY static style source. Returns absolute URLs to @import url().
export function scrapeRemoteImports(sbStatic) {
  if (!sbStatic || !existsSync(join(sbStatic, 'iframe.html'))) return [];
  const iframeHtml = readFileSync(join(sbStatic, 'iframe.html'), 'utf8');
  const out = [...new Set(
    [...iframeHtml.matchAll(/<link\b[^>]*>/gi)]
      .map((m) => m[0])
      .filter((t) => /\brel\s*=\s*["']stylesheet["']/i.test(t))
      .map((t) => t.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1])
      .filter((h) => h && /^(https?:|\/\/)/.test(h))
      .map((h) => (h.startsWith('//') ? 'https:' + h : h)),
  )];
  if (out.length) {
    console.error(`  remote stylesheet(s) from storybook: ${out.length} \u2192 styles.css @import url(...)`);
  }
  return out;
}
