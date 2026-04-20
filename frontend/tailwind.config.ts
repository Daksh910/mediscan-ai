import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        border:     "hsl(var(--border))",
        background: "hsl(var(--bg))",
        foreground: "hsl(var(--ink))",
        primary: {
          DEFAULT:    "hsl(var(--green))",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT:    "hsl(var(--bg-subtle))",
          foreground: "hsl(var(--ink))",
        },
        muted: {
          DEFAULT:    "hsl(var(--bg-subtle))",
          foreground: "hsl(var(--ink-3))",
        },
        accent: {
          DEFAULT:    "hsl(var(--gold))",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT:    "hsl(var(--risk-high))",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT:    "hsl(var(--surface))",
          foreground: "hsl(var(--ink))",
        },
        popover: {
          DEFAULT:    "hsl(var(--surface))",
          foreground: "hsl(var(--ink))",
        },
        input: "hsl(var(--bg-subtle))",
        ring:  "hsl(var(--green))",
      },
      borderRadius: {
        lg:   "12px",
        md:   "10px",
        sm:   "8px",
        xl:   "16px",
        "2xl":"20px",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
        hover: "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
