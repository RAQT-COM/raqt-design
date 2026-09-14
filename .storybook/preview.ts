import React from "react";
import type { Preview } from "@storybook/react-vite";

import "../tokens/dist/tokens.css";

const THEME_CLASSES = ["raqt", "theme-player", "theme-referee", "light"] as const;

function applyGlobals(product: string, colorMode: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const cls of THEME_CLASSES) root.classList.remove(cls);
  root.classList.add("raqt");
  root.classList.add(product === "referee" ? "theme-referee" : "theme-player");
  if (colorMode === "light") root.classList.add("light");
}

const preview: Preview = {
  globalTypes: {
    product: {
      description: "Player (Sage) or Referee (gold)",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "player", title: "Player", description: "Sage — mobile canvases" },
          { value: "referee", title: "Referee", description: "Gold — official canvases" },
        ],
        dynamicTitle: true,
      },
    },
    colorMode: {
      description: "Paper (canvas) or derived dark",
      toolbar: {
        title: "Mode",
        items: [
          { value: "light", title: "Light", description: "Paper — what the canvases are" },
          { value: "dark", title: "Dark", description: "Derived" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    product: "player",
    colorMode: "light",
  },
  decorators: [
    (Story, context) => {
      const product = (context.globals.product as string) ?? "player";
      const colorMode = (context.globals.colorMode as string) ?? "light";
      applyGlobals(product, colorMode);
      const className = [
        "raqt",
        product === "referee" ? "theme-referee" : "theme-player",
        colorMode === "light" ? "light" : "",
        "bg-background",
        "text-foreground",
        "min-h-dvh",
      ]
        .filter(Boolean)
        .join(" ");
      return React.createElement("div", { className }, React.createElement(Story));
    },
  ],
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
  },
};

export default preview;
