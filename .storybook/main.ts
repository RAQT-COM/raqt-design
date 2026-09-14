import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(ts|tsx)",
    "../components/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-docs"],
  // the screen gallery loads each mockup as its own document, so it needs the
  // raw html + images served verbatim rather than bundled
  staticDirs: [{ from: "../stories/experiments/screens", to: "/screens" }],
  framework: { name: "@storybook/react-vite", options: {} },
};

export default config;
