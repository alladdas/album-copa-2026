/**
 * tailwind.config.ts — RECORTE pra mesclar com o existente.
 * Mantenha o resto (content paths, plugins, presets) como está.
 */
import type { Config } from "tailwindcss";

const album: Partial<Config["theme"]> = {
  extend: {
    colors: {
      bg:        "var(--bg)",
      elev:      "var(--bg-elev)",
      sunken:    "var(--bg-sunken)",
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
      sky:       "var(--sky)",
      sunset:    "var(--sunset)",
      line:      "var(--line)",

      // paleta de times — mapeie code → token em lib/team-colors.ts
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
    fontFamily: {
      display: ["var(--font-display)"],
      sans:    ["var(--font-body)"],
      mono:    ["var(--font-mono)"],
    },
    borderRadius: {
      xs: "6px",
      sm: "10px",
      DEFAULT: "14px",
      md: "14px",
      lg: "20px",
      xl: "28px",
    },
    boxShadow: {
      sm:    "var(--shadow-sm)",
      md:    "var(--shadow-md)",
      lg:    "var(--shadow-lg)",
      focus: "var(--shadow-focus)",
      // "ground shadow" usada nos CTAs principais
      ground: "0 2px 0 var(--green-700), 0 6px 16px rgba(31,178,87,.28)",
      "ground-gold": "0 2px 0 var(--gold-700), 0 6px 16px rgba(242,179,61,.28)",
    },
    keyframes: {
      "sc-reveal": {
        "0%":   { filter: "saturate(.4)", transform: "scale(1)" },
        "45%":  { filter: "saturate(1.25)", transform: "scale(1.06)" },
        "100%": { filter: "saturate(1)", transform: "scale(1)" },
      },
    },
    animation: {
      "sc-reveal": "sc-reveal .42s cubic-bezier(.2,.7,.3,1)",
    },
  },
};

export default album; // <- mescle dentro do `theme.extend` do seu tailwind.config.ts
