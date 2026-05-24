import type { Metadata, Viewport } from "next";
import { spaceGrotesk, dmSans, jetbrains } from "./fonts";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Álbum Copa 2026",
  description: "Controle sua coleção de figurinhas Panini Copa do Mundo 2026",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Álbum Copa 2026",
  },
};

export const viewport: Viewport = {
  themeColor: "#1FB257",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body className="bg-bg text-ink font-sans antialiased">
        <main className="min-h-screen pb-24 max-w-lg mx-auto">{children}</main>
        <BottomNav />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
