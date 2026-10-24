import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050506",
        foreground: "#F5F5F5",
        muted: "#B5BAC0",
        surface: {
          DEFAULT: "#0F1012",
          elevated: "#15171A",
          glass: "rgba(21, 23, 26, 0.85)",
        },
        border: {
          DEFAULT: "#3A3F45",
          medium: "#4A4F55",
          accent: "#D93A10",
          box: "#6A4A44",
        },
        accent: {
          DEFAULT: "#D93A10",
          hover: "#F04A1C",
          text: "#FF6A3D",
        },
        tile: "#D9D9D9",
      },
      fontFamily: {
        sans: ["Roboto", "system-ui", "-apple-system", "sans-serif"],
        ethiopic: ["'Noto Sans Ethiopic'", "sans-serif"],
      },
      maxWidth: {
        container: "1216px",
      },
      aspectRatio: {
        "cat-tile": "155 / 179",
        "card-tile": "234 / 278",
      },
      boxShadow: {
        "accent-glow": "0 8px 32px rgba(217, 58, 16, 0.18)",
        "accent-sm": "0 2px 10px rgba(217, 58, 16, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
