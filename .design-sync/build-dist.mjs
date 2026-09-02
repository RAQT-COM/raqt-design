// Compiles .design-sync/entry.tsx to dist/index.js, so design-sync's converter
// has a real built entry to bundle into window.RaqtDesign.
//
// The storybook shape resolves the package's dist entry hard - it does not fall
// back to synthesising one from src/. This repo has no build of its own, because
// it distributes source over a shadcn registry, so this script supplies the one
// artifact the converter cannot do without.
//
// dist/ is gitignored. The barrel and this script are committed instead, which
// is what makes a re-sync on another machine reproduce the same bundle.
//
// Run: node .design-sync/build-dist.mjs   (esbuild comes from .ds-sync/)

import { build } from "../.ds-sync/node_modules/esbuild/lib/main.js";
import { execFileSync } from "node:child_process";
import { globSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// react/react-dom stay external: the converter vendors its own copies and the
// preview pages load them from _vendor/. Bundling a second React here would give
// the previews two renderers and break every hook.
const result = await build({
  entryPoints: [join(root, ".design-sync/entry.tsx")],
  outfile: join(root, "dist/index.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  tsconfig: join(root, "tsconfig.json"),
  external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
  logLevel: "info",
  metafile: true,
});

const bytes = Object.values(result.metafile.outputs)[0]?.bytes ?? 0;
console.log(`dist/index.js — ${(bytes / 1024).toFixed(1)} KB`);

// Declarations. The converter reads the package's export surface out of
// `pkgJson.types`, and emits a per-component `.d.ts` that the design agent codes
// against - so these must be REAL types from tsc, never hand-written stubs.
execFileSync("npx", ["tsc", "-p", join(root, ".design-sync/tsconfig.dts.json")], {
  cwd: root,
  stdio: "inherit",
});

// tsc mirrors the source tree under dist/dts, so the barrel's own declaration
// lands under a DOT directory - and ts-morph's glob skips those, so the
// converter would parse every component's types except the entry that names
// them. Re-export the component declarations directly instead: no dot segment
// in any path, and the list follows whatever tsc actually emitted.
const decls = globSync("dts/components/**/*.d.ts", { cwd: join(root, "dist") })
  .map((f) => `./${f.replace(/\\/g, "/").replace(/\.d\.ts$/, "")}`)
  .sort();
if (!decls.length) throw new Error("no component declarations under dist/dts/components");
writeFileSync(
  join(root, "dist/index.d.ts"),
  decls.map((m) => `export * from "${m}";`).join("\n") + "\n",
);
console.log(`dist/index.d.ts — re-exports ${decls.length} component declaration(s)`);
