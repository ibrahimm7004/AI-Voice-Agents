const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yellow1: "var(--yellow1)",
        red1: "var(--red1)",
        orange1: "var(--orange1)",
        secondary: "cyan",
      },
      ringColor: {
        yellow1: "var(--yellow1)",
      },
      boxShadow: {
        input: `0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)`,
        custom: "0 0 15px rgba(0, 0, 0, 0.15)",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
        bebas: ["Bebas Neue", "sans-serif"],
        jost: ["Jost", "sans-serif"],
        robotoMono: ["Roboto Mono", "monospace"],
      },
      fontSize: {
        "2xl": "1.7rem",
      },
    },
  },
  darkMode: "class",
  plugins: [addVariablesForColors, nextui()],
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
