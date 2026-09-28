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
        background: "#090d16",
        foreground: "#f8fafc",
        card: "#111827",
        border: "#1f2937",
        primary: {
          DEFAULT: "#0284c7",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
