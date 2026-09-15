import type { StorybookConfig } from "@storybook/react-vite";

/**
 * Experiments are explorations, not the design system.
 *
 * Everything this glob matches is compiled into two builds that matter:
 * `pages.yml` publishes one to GitHub Pages, and `pnpm ds:sync` builds the
 * other as the reference storybook — which the Claude Design sync then treats
 * as the oracle every real component is graded against. An experiment landing
 * in either one becomes part of the design system by accident.
 *
 * So they are off by default and opted into per run:
 *
 *     pnpm storybook:experiments
 *
 * `.design-sync/prepare.mjs` refuses to hand off a reference build that
 * contains any of them, so forgetting to unset the flag fails loudly rather
 * than silently shipping.
 */
const withExperiments = process.env.RAQT_EXPERIMENTS === "1";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../components/**/*.stories.@(ts|tsx)",
    // A new non-experiment story under stories/ needs its own entry here — the
    // broad `../stories/**/*.stories.@(ts|tsx)` glob is deliberately gone,
    // because it swept experiments in.
    ...(withExperiments ? ["../stories/experiments/**/*.stories.@(ts|tsx)"] : []),
  ],
  addons: ["@storybook/addon-docs"],
  // Only mounted with the experiments: the gallery loads each mockup as its own
  // document, and nothing in the design system serves static html.
  ...(withExperiments
    ? { staticDirs: [{ from: "../stories/experiments/screens", to: "/screens" }] }
    : {}),
  framework: { name: "@storybook/react-vite", options: {} },
};

export default config;
