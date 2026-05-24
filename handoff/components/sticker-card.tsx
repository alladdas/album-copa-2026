"use client";

/**
 * components/sticker-card.tsx
 * --------------------------------------------------------------
 * Núcleo visual do álbum. NÃO contém lógica de tap — só visual.
 * O consumidor (ex.: app/(app)/album/page.tsx) faz o optimistic
 * update no Supabase e troca o prop `state`.
 *
 * Para animar a virada FALTA → TENHO, adicione a classe
 * `is-revealing` no card durante ~420ms (vide globals.css).
 * --------------------------------------------------------------
 */
import { cn } from "@/lib/utils";
import { teamColorVar } from "@/lib/team-colors";

export type StickerState = "locked" | "owned" | "duplicate";

export interface StickerCardProps {
  state: StickerState;
  team: { code: string; name: string };
  number: number;          // número impresso
  label: string;           // ex.: "Neymar", "Escudo", "Foto da equipe"
  count?: number;          // owned_count quando duplicate
  foil?: boolean;          // is_foil = true (brilho metálico)
  size?: "sm" | "md";      // sm = grid (76px), md = destaque (108px)
  revealing?: boolean;     // dispara animação de revelar
  onClick?: () => void;
  onLongPress?: () => void;
}

const SIZE = { sm: 76, md: 108 };

export function StickerCard({
  state,
  team,
  number,
  label,
  count = 1,
  foil = false,
  size = "md",
  revealing = false,
  onClick,
  onLongPress,
}: StickerCardProps) {
  const W = SIZE[size];
  const H = Math.round(W * 1.4);
  const isLocked = state === "locked";
  const isDup = state === "duplicate";

  // long-press handler (toque longo decrementa)
  const lpRef = { timer: 0 as number | undefined };
  const lpStart = () => {
    if (!onLongPress) return;
    lpRef.timer = window.setTimeout(onLongPress, 550);
  };
  const lpEnd = () => window.clearTimeout(lpRef.timer);

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={lpStart}
      onPointerUp={lpEnd}
      onPointerLeave={lpEnd}
      aria-label={`#${number} ${label} — ${
        isLocked ? "faltando" : isDup ? `repetida ×${count}` : "tenho"
      }`}
      className={cn(
        "sticker-card relative overflow-hidden rounded-md border bg-white p-0 text-left",
        "transition focus-visible:shadow-focus",
        isLocked && "border-dashed border-ink/20 bg-[#E8DFCB] saturate-50",
        !isLocked && "border-line shadow-md",
        isDup && "shadow-[0_2px_0_rgba(0,0,0,.06),0_8px_18px_rgba(226,51,107,.18)]",
        revealing && "is-revealing"
      )}
      style={{ width: W, height: H }}
    >
      {/* TOP — colored band */}
      <div
        className="absolute inset-x-0 top-0 overflow-hidden"
        style={{
          height: "62%",
          backgroundColor: isLocked ? "transparent" : teamColorVar(team.code),
        }}
      >
        {!isLocked && <div aria-hidden className="absolute inset-0 bg-chevrons" />}
        {!isLocked && foil && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 65%)",
            }}
          />
        )}

        {/* number top-left */}
        <span
          className={cn(
            "absolute left-2 top-2 font-mono font-extrabold tracking-wider",
            isLocked ? "text-ink/45" : "text-white/85"
          )}
          style={{ fontSize: size === "sm" ? 13 : 16 }}
        >
          #{String(number).padStart(3, "0")}
        </span>

        {/* team code chip top-right */}
        <span
          className={cn(
            "absolute right-2 top-2 rounded-md px-1.5 py-0.5 font-display font-extrabold",
            isLocked ? "bg-ink/10 text-ink/60" : "bg-black/25 text-white"
          )}
          style={{ fontSize: size === "sm" ? 10 : 12 }}
        >
          {team.code}
        </span>

        {/* central glyph (big number/silhouette) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "font-display font-black leading-none",
              isLocked ? "text-ink/20" : "text-white"
            )}
            style={{
              fontSize: size === "sm" ? 42 : 60,
              textShadow: isLocked ? "none" : "0 2px 0 rgba(0,0,0,.10)",
            }}
          >
            {number}
          </span>
        </div>
      </div>

      {/* BOTTOM — footer w/ name */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col justify-center gap-0.5 px-2.5 py-2",
          isLocked ? "" : "bg-white"
        )}
        style={{ height: "38%" }}
      >
        <span
          className={cn(
            "font-sans font-bold uppercase tracking-wider",
            isLocked ? "text-ink/45" : "text-ink-mute"
          )}
          style={{ fontSize: size === "sm" ? 9 : 10 }}
        >
          {team.name}
        </span>
        <span
          className={cn(
            "truncate font-display font-bold leading-tight",
            isLocked ? "text-ink/55" : "text-ink"
          )}
          style={{ fontSize: size === "sm" ? 11 : 13 }}
        >
          {label}
        </span>
      </div>

      {/* Duplicate badge */}
      {isDup && (
        <span
          className="absolute -right-1.5 -top-1.5 inline-flex h-7 min-w-[28px] items-center justify-center rounded-full border-[2.5px] border-white bg-magenta px-2 font-display text-[13px] font-extrabold text-white"
          style={{ boxShadow: "0 4px 12px rgba(226,51,107,.45)" }}
        >
          ×{count}
        </span>
      )}

      {/* Locked hint */}
      {isLocked && (
        <span
          aria-hidden
          className="absolute bottom-2 right-2 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-ink/55 text-[11px] text-white"
        >
          ?
        </span>
      )}
    </button>
  );
}
