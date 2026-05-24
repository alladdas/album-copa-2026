// lib/team-colors.ts
//
// Mapeia o `code` de cada seleção para um token de cor da paleta. Reutilizar
// uma cor entre 4 times é OK — são 48 seleções vs 12 tokens. NÃO usar
// bandeiras reais como referência ofical.

export type TeamColorToken =
  | "team-ruby" | "team-saffron" | "team-emerald" | "team-ocean"
  | "team-violet" | "team-sunset" | "team-mint" | "team-magenta"
  | "team-cobalt" | "team-olive" | "team-crimson" | "team-slate";

export const TEAM_COLOR: Record<string, TeamColorToken> = {
  // CONMEBOL
  BRA: "team-emerald", ARG: "team-ocean", URU: "team-cobalt",
  COL: "team-saffron", ECU: "team-saffron", PAR: "team-ruby",
  PER: "team-crimson", CHI: "team-ruby", BOL: "team-olive",
  VEN: "team-crimson",

  // UEFA
  ESP: "team-ruby", FRA: "team-cobalt", POR: "team-crimson",
  GER: "team-slate", ITA: "team-cobalt", ENG: "team-ruby",
  BEL: "team-ruby", NED: "team-sunset", CRO: "team-ruby",
  POL: "team-crimson", DEN: "team-crimson", SUI: "team-ruby",
  AUT: "team-crimson", TUR: "team-ruby", SRB: "team-ruby",
  UKR: "team-saffron", NOR: "team-ruby", SWE: "team-saffron",

  // CONCACAF
  MEX: "team-olive", USA: "team-cobalt", CAN: "team-ruby",
  CRC: "team-ruby", PAN: "team-ruby", JAM: "team-saffron",

  // CONMEBOL/AFC/CAF/OFC e demais
  JPN: "team-ruby", KOR: "team-cobalt", AUS: "team-saffron",
  IRN: "team-mint", KSA: "team-emerald", QAT: "team-crimson",
  UZB: "team-cobalt", JOR: "team-ruby", IRQ: "team-emerald",
  MAR: "team-crimson", SEN: "team-emerald", TUN: "team-crimson",
  ALG: "team-emerald", EGY: "team-ruby", GHA: "team-saffron",
  CIV: "team-sunset", CMR: "team-emerald",
  NZL: "team-slate",

  // Bloco especial
  SPECIAL: "team-violet",
  COKE:    "team-ruby",
};

export function teamColorVar(code: string): string {
  const token = TEAM_COLOR[code] ?? "team-slate";
  return `var(--${token})`;
}
