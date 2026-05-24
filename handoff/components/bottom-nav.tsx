"use client";

/**
 * components/bottom-nav.tsx
 * 5 destinos: Início · Álbum · Banca · Trocas · Gastos
 * Item ativo ganha chip verde sob o ícone.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Album, Store, ArrowLeftRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/",       label: "Início", icon: Home,           match: (p: string) => p === "/" },
  { href: "/album",  label: "Álbum",  icon: Album,          match: (p: string) => p.startsWith("/album") },
  { href: "/banca",  label: "Banca",  icon: Store,          match: (p: string) => p.startsWith("/banca") },
  { href: "/trocas", label: "Trocas", icon: ArrowLeftRight, match: (p: string) => p.startsWith("/trocas") },
  { href: "/cash",   label: "Gastos", icon: Wallet,         match: (p: string) => p.startsWith("/cash") },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-around bg-elev px-2 pb-7 pt-2 shadow-[0_-4px_16px_rgba(26,20,16,.05)]"
      style={{ borderTop: "1px solid var(--line)" }}
    >
      {ITEMS.map((it) => {
        const active = it.match(pathname);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className="flex min-w-[56px] flex-col items-center gap-0.5 px-1 py-1"
          >
            <span
              className={cn(
                "flex h-8 w-11 items-center justify-center rounded-full transition-colors",
                active ? "bg-green-50" : "bg-transparent"
              )}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 2}
                className={active ? "text-green-700" : "text-ink-soft"}
              />
            </span>
            <span
              className={cn(
                "font-sans text-[11px] tracking-wide",
                active ? "font-bold text-green-700" : "font-medium text-ink-soft"
              )}
            >
              {it.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
