// Raqt release driver. One entry point for the three things that have to happen
// in order for a change here to reach a consuming app:
//
//   build    regenerate every derived artifact (tokens/dist/, r/)
//   verify   build, then prove the result is valid and type-checks
//   ship     verify, commit, push main — a consumer's bare address reads main@HEAD
//   release  ship, then bump package.json and tag v<version>
//   sync     re-install the registry into the local consumer repo
//
// The reason this file exists rather than a line of && in package.json: the registry
// is served straight out of git, so "published" means "pushed", and every derived
// file has to be committed in the same breath as its source. Forgetting `shadcn build`
// after editing a component ships the *old* component to every consumer, silently,
// with a green checkmark. The build-then-check-git-dirty dance below is what turns
// that failure mode into an error message.

import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkgPath = join(root, "package.json");

const isDerived = (p) => DERIVED.some((d) => p.startsWith(d));

/* ---------- output ---------- */

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

let stepN = 0;
const step = (msg) => console.log(`\n${c.bold(`[${++stepN}]`)} ${c.bold(msg)}`);
const info = (msg) => console.log(`    ${msg}`);
const ok = (msg) => console.log(`    ${c.green("✓")} ${msg}`);
const warn = (msg) => console.log(`    ${c.yellow("!")} ${msg}`);

const die = (msg, hint) => {
  console.error(`\n${c.red("✗")} ${msg}`);
  if (hint) console.error(`  ${c.dim(hint)}`);
  process.exit(1);
};

/* ---------- shells ---------- */

/** Run a command, streaming its output. Dies with `hint` on a non-zero exit. */
const run = (cmd, args, { cwd = root, hint } = {}) => {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", encoding: "utf8" });
  if (r.error) die(`could not run ${cmd}: ${r.error.message}`, hint);
  if (r.status !== 0) die(`${cmd} ${args.join(" ")} exited ${r.status}`, hint);
};

/** Run a command and capture stdout. Returns "" on failure rather than dying. */
const capture = (cmd, args, cwd = root) => {
  try {
    return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
};

const git = (...args) => capture("git", args);

/** shadcn is not a dependency — it is always fetched. Keeps the lockfile clean. */
const shadcn = (args, opts) => run("pnpm", ["dlx", "shadcn@latest", ...args], opts);

const confirm = async (question, { yes }) => {
  if (yes) return true;
  if (!process.stdin.isTTY) {
    die("needs confirmation but stdin is not a terminal", "re-run with --yes to skip the prompt");
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`\n${question} ${c.dim("[y/N]")} `)).trim().toLowerCase();
  rl.close();
  return answer === "y" || answer === "yes";
};

/* ---------- registry knowledge ---------- */

const registry = () => JSON.parse(readFileSync(join(root, "registry.json"), "utf8"));

/** "RAQT-COM/raqt-design", derived from the git remote so it survives a repo rename. */
const address = () => {
  const url = git("remote", "get-url", "origin");
  const m = /github\.com[:/](.+?)(?:\.git)?$/.exec(url);
  if (!m) die(`could not read a GitHub owner/repo out of the origin remote: ${url || "(none)"}`);
  return m[1];
};

const version = () => JSON.parse(readFileSync(pkgPath, "utf8")).version;

/** Rewrite only the version line, so package.json formatting survives untouched. */
const setVersion = (next) => {
  const raw = readFileSync(pkgPath, "utf8");
  const updated = raw.replace(/("version":\s*")[^"]+(")/, `$1${next}$2`);
  if (updated === raw) die("could not find a version field to bump in package.json");
  writeFileSync(pkgPath, updated);
};

const bump = (current, kind) => {
  if (/^\d+\.\d+\.\d+/.test(kind)) return kind;
  const [maj, min, pat] = current.split(".").map(Number);
  if (kind === "major") return `${maj + 1}.0.0`;
  if (kind === "minor") return `${maj}.${min + 1}.0`;
  if (kind === "patch") return `${maj}.${min}.${pat + 1}`;
  die(`unknown version bump "${kind}"`, "expected: major | minor | patch | an explicit x.y.z");
};

/* ---------- steps ---------- */

/** Everything written by a generator rather than by a person. */
const DERIVED = ["tokens/dist/", "skills/raqt-design/", "r/"];

/** path -> sha1 of contents, for every file under DERIVED that exists right now. */
const hashDerived = () => {
  const out = new Map();
  for (const dir of DERIVED) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const name of readdirSync(abs, { recursive: true, withFileTypes: true })) {
      if (!name.isFile()) continue;
      const rel = join(dir, name.parentPath.slice(abs.length), name.name).replace(/\/+/g, "/");
      out.set(rel, createHash("sha1").update(readFileSync(join(name.parentPath, name.name))).digest("hex"));
    }
  }
  return out;
};

const doBuild = () => {
  step("Regenerating derived files");

  // Hash the derived tree first, so the rebuild can tell you what it overwrote.
  const before = hashDerived();

  run("node", ["tokens/build.mjs"]);
  // Before the shadcn build: the `rules` item's file is this script's output, so
  // building the registry first would package the previous run's skill.
  run("node", ["skills/build.mjs"]);
  // Not the default output dir. shadcn writes to public/r unless told otherwise, and
  // this repo serves r/ — a wrong -o here silently publishes nothing.
  shadcn(["build", "--output", "r"]);
  ok("tokens/dist/, skills/ and r/ rebuilt");

  // Whatever the rebuild changed, the old bytes were not generator output. Usually
  // that is the point — you edited a source and the derived files caught up. But it
  // is also the only signal that someone hand-edited a generated file, so say what
  // was overwritten either way. Silence here is how somebody spends an afternoon
  // editing SKILL.md and wonders why nothing ever reaches a consumer.
  const overwritten = [...hashDerived()].filter(([f, h]) => before.get(f) !== h).map(([f]) => f);
  if (overwritten.length) {
    warn(`rebuilt ${overwritten.length} generated file(s) — any hand edits to these are now gone:`);
    console.log(overwritten.slice(0, 8).map((f) => `      ${f}`).join("\n"));
    if (overwritten.length > 8) console.log(`      ${c.dim(`…and ${overwritten.length - 8} more`)}`);
    console.log(`  ${c.dim("Sources are DESIGN.md, docs/TOKENS.md, tokens/source/*.json, components/,")}`);
    console.log(`  ${c.dim("registry.json. design-system/README.md has the full ownership table.")}`);
  }
};

const doVerify = () => {
  doBuild();

  step("Validating the registry");
  shadcn(["registry", "validate", "./registry.json"], {
    hint: "registry.json does not match the shadcn schema",
  });

  step("Type-checking");
  run("pnpm", ["typecheck"]);
  ok("no type errors");

  step("Design-sync barrel");
  checkBarrel();
};

/**
 * `.design-sync/entry.tsx` is a SECOND list of this library's components: the
 * shadcn registry ships source, so design-sync needs a compiled entry, and that
 * barrel is what it compiles. The two lists drifting is silent and expensive —
 * a component added to the registry but not the barrel reaches every consuming
 * repo and never reaches Claude Design. This is the only place that can catch it.
 */
const checkBarrel = () => {
  const barrelPath = join(root, ".design-sync/entry.tsx");
  if (!existsSync(barrelPath)) return info(c.dim("no .design-sync/entry.tsx — design-sync not set up here"));

  const pascal = (name) => name.replace(/(^|-)([a-z])/g, (_, __, ch) => ch.toUpperCase());
  const expected = registry().items.filter((i) => i.type === "registry:ui").map((i) => pascal(i.name));
  const barrel = readFileSync(barrelPath, "utf8");
  const missing = expected.filter((n) => !new RegExp(`\\b${n}\\b`).test(barrel));

  if (missing.length) {
    die(
      `.design-sync/entry.tsx does not export: ${missing.join(", ")}`,
      "Add them to the barrel, or Claude Design will not get them. See design-sync/README.md.",
    );
  }
  ok(`barrel exports all ${expected.length} registry component(s)`);
};

/** Files git considers changed, as a flat list of paths. */
const dirtyPaths = () =>
  git("status", "--porcelain")
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim());

const requireCleanBranch = ({ yes, branch = "main" }) => {
  if (!git("rev-parse", "--is-inside-work-tree")) die("not a git repository");
  const current = git("rev-parse", "--abbrev-ref", "HEAD");
  if (current !== branch && !yes) {
    die(
      `on branch "${current}", not "${branch}"`,
      `consumers read ${branch}@HEAD, so shipping from elsewhere publishes nothing — use --yes to override`,
    );
  }
  return current;
};

const doShip = async (opts) => {
  const branch = requireCleanBranch(opts);
  doVerify();

  step("Committing");
  const changed = dirtyPaths();
  if (changed.length === 0) {
    info(c.dim("working tree clean — nothing new to commit"));
  } else {
    console.log(changed.map((p) => `      ${p}`).join("\n"));
    // The check that earns this script its keep: r/ is derived, so if the rebuild above
    // changed it, whatever is committed right now is stale relative to the source.
    const stale = changed.filter(isDerived);
    if (stale.length) warn(`${stale.length} generated file(s) were out of date — rebuilt, and included above`);

    if (!(await confirm(`Commit ${changed.length} file(s) and push to ${branch}?`, opts))) {
      die("aborted");
    }
    run("git", ["add", "-A"]);
    run("git", ["commit", "-m", opts.message ?? "update registry"]);
    ok("committed");
  }

  if (opts.tag) {
    const next = bump(version(), opts.tag);
    step(`Tagging v${next}`);
    if (git("tag", "-l", `v${next}`)) die(`tag v${next} already exists`);
    setVersion(next);
    run("git", ["add", "package.json"]);
    run("git", ["commit", "-m", `v${next}`]);
    run("git", ["tag", `v${next}`]);
    ok(`v${next}`);
  }

  step(`Pushing to ${branch}`);
  const ahead = git("rev-list", "--count", `origin/${branch}..HEAD`);
  info(`${ahead || "?"} commit(s) ahead of origin/${branch}`);
  run("git", ["push", "origin", branch]);
  if (opts.tag) run("git", ["push", "origin", `v${version()}`]);
  ok("pushed");

  const addr = address();
  console.log(`\n${c.green("Published.")} Consumers can now pull:`);
  console.log(`  ${c.cyan(`pnpm dlx shadcn@latest add ${addr}/button`)}                ${c.dim("# main@HEAD")}`);
  if (opts.tag) {
    console.log(`  ${c.cyan(`pnpm dlx shadcn@latest add ${addr}/button#v${version()}`)}         ${c.dim("# pinned")}`);
  }
  console.log(`\n  ${c.dim("raw.githubusercontent.com caches for ~5 min — a re-add right now may")}`);
  console.log(`  ${c.dim("still return the previous version. `pnpm sync` verifies what arrived.")}`);
};

/* ---------- sync ---------- */

/** Where the consuming app lives. Sibling checkout by default. */
const consumerRoot = () =>
  resolvePath(root, process.env.RAQT_CONSUMER ?? join("..", "raqt-public"));

/** Registry items already installed in the consumer, inferred from what is on disk. */
const installedItems = (consumer) => {
  const items = [];
  if (existsSync(join(consumer, "src/styles/raqt-theme.css"))) items.push("theme");
  if (existsSync(join(consumer, ".claude/skills/raqt-design/SKILL.md"))) items.push("rules");
  const dir = join(consumer, "src/components/raqt");
  if (existsSync(dir)) {
    const known = new Set(registry().items.map((i) => i.name));
    for (const file of readdirSync(dir)) {
      const name = file.replace(/\.tsx$/, "");
      if (file.endsWith(".tsx") && known.has(name)) items.push(name);
    }
  }
  return items;
};

const doSync = async (opts) => {
  const consumer = consumerRoot();
  if (!existsSync(consumer)) {
    die(`no consumer repo at ${consumer}`, "set RAQT_CONSUMER=/path/to/app to point somewhere else");
  }

  step(`Consumer: ${consumer}`);
  const consumerDirty = capture("git", ["status", "--porcelain"], consumer);
  if (consumerDirty) {
    // --overwrite replaces these files wholesale. Uncommitted edits there are gone.
    warn("consumer has uncommitted changes — --overwrite will discard any local edits to Raqt files");
    console.log(consumerDirty.split("\n").slice(0, 10).map((l) => `      ${l}`).join("\n"));
    if (!(await confirm("Continue anyway?", opts))) die("aborted");
  }

  const items = opts.items.length ? opts.items : installedItems(consumer);
  if (!items.length) {
    die("nothing to sync", `no Raqt files found in the consumer — name the items: pnpm sync theme button`);
  }

  const addr = address();
  const ref = opts.ref ? `#${opts.ref}` : "";
  step(`Pulling ${items.length} item(s)${opts.ref ? ` at ${opts.ref}` : " from main@HEAD"}`);
  info(items.join(", "));
  shadcn(["add", "--overwrite", ...items.map((i) => `${addr}/${i}${ref}`)], { cwd: consumer });

  // Did the bytes actually arrive, or did a CDN hand back the previous version?
  step("Verifying what landed");
  const local = join(root, "tokens/dist/theme.css");
  const remote = join(consumer, "src/styles/raqt-theme.css");
  if (items.includes("theme") && existsSync(remote)) {
    if (readFileSync(local, "utf8") === readFileSync(remote, "utf8")) {
      ok("consumer theme matches this repo's build");
    } else {
      warn("consumer theme DIFFERS from this repo's build");
      info(c.dim("either the push has not propagated yet (wait ~5 min, re-run) or main is behind your working tree"));
    }
  } else {
    info(c.dim("theme not in this sync — skipping byte check"));
  }
};

/* ---------- cli ---------- */

const usage = `
${c.bold("raqt")} — build, publish and consume the Raqt registry

  ${c.cyan("pnpm build")}                 regenerate tokens/dist/ and r/
  ${c.cyan("pnpm verify")}                build, validate the registry, typecheck
  ${c.cyan("pnpm ship")} [-m "msg"]       verify, commit, push main  ${c.dim("← consumers see it immediately")}
  ${c.cyan("pnpm release")} <bump>        ship + bump package.json + tag  ${c.dim("(major|minor|patch|x.y.z)")}
  ${c.cyan("pnpm sync")} [items...]       re-install into the consumer app

${c.bold("Options")}
  -m, --message <msg>   commit message for ship/release
  --ref <ref>           sync a specific tag or branch instead of main@HEAD
  --yes                 skip confirmation prompts (and the branch guard)

${c.bold("Environment")}
  RAQT_CONSUMER         path to the consuming app  ${c.dim("(default: ../raqt-public)")}
`;

const main = async () => {
  const argv = process.argv.slice(2);
  const cmd = argv.shift();

  const opts = { yes: false, message: null, tag: null, ref: null, items: [] };
  while (argv.length) {
    const a = argv.shift();
    if (a === "--yes" || a === "-y") opts.yes = true;
    else if (a === "-m" || a === "--message") opts.message = argv.shift();
    else if (a === "--ref") opts.ref = argv.shift();
    else if (a.startsWith("-")) die(`unknown option ${a}`, usage);
    else opts.items.push(a);
  }

  switch (cmd) {
    case "build":
      return doBuild();
    case "verify":
      return doVerify();
    case "ship":
      return doShip(opts);
    case "release": {
      const kind = opts.items.shift();
      if (!kind) die("release needs a version bump", "pnpm release patch | minor | major | 1.2.3");
      return doShip({ ...opts, tag: kind });
    }
    case "sync":
      return doSync(opts);
    default:
      console.log(usage);
      process.exit(cmd ? 1 : 0);
  }
};

await main();
