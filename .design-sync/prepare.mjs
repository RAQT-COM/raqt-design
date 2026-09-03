// `pnpm ds:sync` — everything a Claude Design sync needs that this repo can do
// on its own, so the sync itself is a short, boring run.
//
// It deliberately stops short of uploading. The converter lives in `.ds-sync/`,
// which Claude Code stages from its bundled copy of the design-sync skill and
// which is gitignored: its path carries a version and a content hash, so no
// script here can find it, and pinning one would rot on the next Claude Code
// release. This prepares the three inputs the converter reads — the tokens, the
// compiled entry, the reference storybook — and then hands off.
//
// Run it before `/design-sync` in Claude Code. Running it twice is harmless.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
};

let step = 0;
const heading = (msg) => console.log(`\n${c.bold(`[${++step}]`)} ${c.bold(msg)}`);
const ok = (msg) => console.log(`    ${c.green("✓")} ${msg}`);
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: "inherit" });

const die = (msg, hint) => {
  console.error(`\n${c.red("✗")} ${msg}`);
  if (hint) console.error(`  ${c.dim(hint)}`);
  process.exit(1);
};

/* ---------- config ---------- */

const configPath = join(root, ".design-sync/config.json");
if (!existsSync(configPath)) {
  die(
    ".design-sync/config.json is missing",
    "This repo has never been synced. Run /design-sync in Claude Code — it creates the config.",
  );
}
const cfg = JSON.parse(readFileSync(configPath, "utf8"));
if (!cfg.projectId) die("config.json has no projectId", "Run /design-sync in Claude Code to pick a target.");

/* ---------- 1. tokens + the compiled entry ---------- */

heading("Tokens and the compiled entry");
run("node", ["tokens/build.mjs"]);
run("node", [".design-sync/build-dist.mjs"]);
ok("tokens/dist/ and dist/ are current");

/* ---------- 2. the reference storybook ---------- */

/**
 * The storybook build is the sync's fidelity oracle: every preview is graded
 * against it. A stale one silently grades new components against the old design,
 * so it is rebuilt whenever anything it renders has moved. Newest mtime under the
 * source dirs versus the reference's own — cheap, and wrong only in the safe
 * direction (an unnecessary rebuild is a no-op, a skipped one corrupts grades).
 */
const newestUnder = (dir) => {
  let newest = 0;
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else newest = Math.max(newest, statSync(p).mtimeMs);
    }
  };
  if (existsSync(dir)) walk(dir);
  return newest;
};

const reference = join(root, ".design-sync/sb-reference");
const iframe = join(reference, "iframe.html");
// tokens/SOURCE, not tokens/dist: step 1 rewrites dist on every run whether or
// not a value moved, so comparing against it would mark the reference stale
// every time and rebuild a storybook that was already correct.
const sources = Math.max(
  ...["components", "stories", "tokens/source", ".storybook"].map((d) => newestUnder(join(root, d))),
);
const stale = !existsSync(iframe) || statSync(iframe).mtimeMs < sources;

heading("Reference storybook");
if (stale) {
  console.log(`    ${c.dim("sources moved since the last build — rebuilding (this takes a minute)")}`);
  run("npx", ["storybook", "build", "-c", cfg.storybookConfigDir ?? ".storybook", "-o", reference]);
} else {
  console.log(`    ${c.dim("up to date")}`);
}

// index.json can exist alongside a failed build; iframe.html is the real signal.
if (!existsSync(iframe) || statSync(iframe).size < 10_000) {
  die("the reference storybook did not build", `expected a populated ${iframe}`);
}
const stories = Object.keys(JSON.parse(readFileSync(join(reference, "index.json"), "utf8")).entries ?? {}).length;
ok(`${stories} stories in .design-sync/sb-reference`);

/* ---------- 3. hand off ---------- */

heading("Ready — the rest happens in Claude Code");
console.log(`
  ${c.cyan("/design-sync")}

  It stages the converter, rebuilds, diffs against the project's anchor, and
  re-verifies only what changed. Components you have not touched cost nothing.

  ${c.bold("Two things it needs from you:")}
    · ${c.cyan("/design-login")} once, with an account that can write to the target
    · ${c.bold("assets/**")} in the upload plan's writes AND deletes — it is not in the
      converter's defaults, so the logo, logotype and app icon drop without it
    · ${c.cyan("pnpm ds:cards")} AFTER the converter runs — it emits the Brand/Colors/
      Type/Elevation/Spacing cards, which the converter itself never produces

  Target: ${c.dim(cfg.projectId)}
  ${c.dim(`https://claude.ai/design/p/${cfg.projectId}`)}

  ${c.dim("Gotchas from previous syncs: .design-sync/NOTES.md")}
`);
