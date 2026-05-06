import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f5f8ff",
          100: "#e7eefb",
          500: "#345a91",
          700: "#183861",
          900: "#0b1f3a"
        },
        brand: {
          50: "#edf7ff",
          100: "#d7edff",
          500: "#1b78d0",
          600: "#1267b8",
          700: "#0d4f8d"
        }
      },
      boxShadow: {
        soft: "0 16px 45px rgba(15, 48, 88, 0.08)",
        card: "0 10px 30px rgba(15, 48, 88, 0.07)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
