import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Legacy shadcn/ui tokens (existing components) ──────────────
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // ── Carnaval de Bandeiras tokens ──────────────────────────
        bg:     "var(--bg)",
        elev:   "var(--bg-elev)",
        sunken: "var(--bg-sunken)",
        ink: {
          DEFAULT: "var(--ink)",
          soft:    "var(--ink-soft)",
          mute:    "var(--ink-mute)",
          invert:  "var(--ink-invert)",
        },
        green: {
          DEFAULT: "var(--green)",
          700:     "var(--green-700)",
          50:      "var(--green-50)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          700:     "var(--gold-700)",
          50:      "var(--gold-50)",
        },
        magenta: {
          DEFAULT: "var(--magenta)",
          50:      "var(--magenta-50)",
        },
        sky:     "var(--sky)",
        sunset:  "var(--sunset)",
        line:    "var(--line)",

        team: {
          ruby:    "var(--team-ruby)",
          saffron: "var(--team-saffron)",
          emerald: "var(--team-emerald)",
          ocean:   "var(--team-ocean)",
          violet:  "var(--team-violet)",
          sunset:  "var(--team-sunset)",
          mint:    "var(--team-mint)",
          magenta: "var(--team-magenta)",
          cobalt:  "var(--team-cobalt)",
          olive:   "var(--team-olive)",
          crimson: "var(--team-crimson)",
          slate:   "var(--team-slate)",
        },
      },

      // ── Typography ───────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-display)"],
        sans:    ["var(--font-body)"],
        mono:    ["var(--font-mono)"],
      },

      // ── Border radii ─────────────────────────────────────────────
      borderRadius: {
        xs:      "6px",
        sm:      "10px",
        DEFAULT: "14px",
        md:      "14px",
        lg:      "20px",
        xl:      "28px",
        pill:    "9999px",
      },

      // ── Shadows ──────────────────────────────────────────────────
      boxShadow: {
        sm:           "var(--shadow-sm)",
        md:           "var(--shadow-md)",
        lg:           "var(--shadow-lg)",
        focus:        "var(--shadow-focus)",
        ground:       "0 2px 0 var(--green-700), 0 6px 16px rgba(31,178,87,.28)",
        "ground-gold":"0 2px 0 var(--gold-700), 0 6px 16px rgba(242,179,61,.28)",
      },

      // ── Keyframes & animations ───────────────────────────────────
      keyframes: {
        "sc-reveal": {
          "0%":   { filter: "saturate(.4)", transform: "scale(1)" },
          "45%":  { filter: "saturate(1.25)", transform: "scale(1.06)" },
          "100%": { filter: "saturate(1)", transform: "scale(1)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "sc-reveal":      "sc-reveal .42s cubic-bezier(.2,.7,.3,1)",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
