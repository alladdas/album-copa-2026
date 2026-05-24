// app/fonts.ts
//
// Carrega Space Grotesk + DM Sans + JetBrains Mono via next/font.
// Em app/layout.tsx:
//
//   import { spaceGrotesk, dmSans, jetbrains } from "./fonts";
//   <html className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrains.variable}`}>

import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});
