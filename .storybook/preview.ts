import React from "react";
import type { Preview } from "@storybook/react-vite";

import "../tokens/dist/tokens.css";

const THEME_CLASSES = ["raqt", "theme-player", "theme-turf", "theme-referee", "light"] as const;

function themeClass(product: string): string {
  if (product === "referee") return "theme-referee";
  if (product === "turf") return "theme-turf";
  return "theme-player";
}

function applyGlobals(product: string, colorMode: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const cls of THEME_CLASSES) root.classList.remove(cls);
  root.classList.add("raqt");
  root.classList.add(themeClass(product));
  if (colorMode === "light") root.classList.add("light");
}

const preview: Preview = {
  globalTypes: {
    product: {
      description: "Player Claude Design, Player Original/Nelson, or Referee gold",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "player", title: "Player — Claude Design", description: "Sage — harvested from the canvases" },
          { value: "turf", title: "Player — Original/Nelson", description: "Neon green, Inter/Archivo. Switch Mode to Dark to match" },
          { value: "referee", title: "Referee", description: "Gold — Claude Design canvases" },
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
          { value: "dark", title: "Dark", description: "Derived — original Storybook default" },
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
        themeClass(product),
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
