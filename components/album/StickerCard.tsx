"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { teamColorVar } from "@/lib/team-colors";

export type StickerState = "locked" | "owned" | "duplicate";

export interface StickerCardProps {
  state: StickerState;
  team: { code: string; name: string };
  number: number;
  label: string;
  count?: number;
  foil?: boolean;
  size?: "sm" | "md";
  revealing?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

// URL is derived from team.code + number so every collection shares the same images.
// Storage path format: sticker-photos/{CODE}_{NN:02d}.webp  (no collection prefix)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function derivedStickerUrl(teamCode: string, number: number): string | null {
  if (!SUPABASE_URL) return null;
  const pad = String(number).padStart(2, "0");
  return `${SUPABASE_URL}/storage/v1/object/public/sticker-photos/${teamCode}_${pad}.webp`;
}

export function StickerCard({
  state,
  team,
  number,
  label,
  count = 1,
  foil = false,
  size = "md",
  revealing = false,
  selected = false,
  onClick,
}: StickerCardProps) {
  // Falls back to placeholder when the image 404s or hasn't been uploaded yet
  const [imgError, setImgError] = useState(false);

  const isLocked  = state === "locked";
  const isDup     = state === "duplicate";
  const imageUrl  = derivedStickerUrl(team.code, number);
  const hasImage  = !!imageUrl && !imgError;
  const numStr    = String(number).padStart(3, "0");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`#${numStr} ${label} — ${
        isLocked ? "faltando" : isDup ? `repetida ×${count}` : "tenho"
      }`}
      className={cn(
        "sticker-card relative overflow-hidden rounded-md border bg-white p-0 text-left",
        "w-full transition focus-visible:shadow-focus active:scale-95 select-none",
        // Locked: dashed border + saturate only for placeholder (image handles its own filter)
        isLocked && !hasImage && "border-dashed border-ink/20 bg-[#E8DFCB] saturate-50",
        isLocked &&  hasImage && "border-dashed border-ink/20",
        !isLocked && "border-line shadow-md",
        isDup && "shadow-[0_2px_0_rgba(0,0,0,.06),0_8px_18px_rgba(226,51,107,.18)]",
        revealing && "is-revealing",
        selected && "ring-2 ring-green ring-offset-1"
      )}
      style={size === "sm" ? { aspectRatio: "76 / 106" } : { width: 108, height: 151 }}
    >
      {hasImage ? (
        // ── IMAGE CARD ──────────────────────────────────────────────────
        // CSS filter drives locked (grayscale+dim) → owned (full color) effect.
        // The sc-reveal animation on the card handles scale+glow; the image's
        // own transition handles grayscale→color independently at 420ms.
        // onError falls back silently to the placeholder branch via imgError state.
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              filter: isLocked
                ? "grayscale(100%) brightness(55%)"
                : "grayscale(0%) brightness(100%)",
              transition: "filter 420ms ease",
            }}
            draggable={false}
          />

          {/* Foil shimmer over image */}
          {!isLocked && foil && (
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0) 65%)",
              }}
            />
          )}

          {/* Number badge — top-left */}
          <span
            className="absolute left-1.5 top-1.5 font-mono font-extrabold tracking-wider leading-none"
            style={{
              fontSize: size === "sm" ? 11 : 14,
              color: "rgba(255,255,255,0.92)",
              textShadow: "0 1px 3px rgba(0,0,0,.70)",
            }}
          >
            #{numStr}
          </span>

          {/* Team code chip — top-right */}
          <span
            className="absolute right-1.5 top-1.5 rounded-xs px-1 py-0.5 font-display font-extrabold leading-none"
            style={{
              fontSize: size === "sm" ? 9 : 11,
              background: "rgba(0,0,0,0.40)",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {team.code}
          </span>

          {/* Bottom gradient overlay + name */}
          <div
            className="absolute inset-x-0 bottom-0 flex flex-col justify-end gap-0.5 px-2 py-1.5 pointer-events-none"
            style={{
              height: "38%",
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.68))",
            }}
          >
            <span
              className="font-sans font-bold uppercase tracking-wider truncate leading-none"
              style={{
                fontSize: size === "sm" ? 8 : 10,
                color: "rgba(255,255,255,0.60)",
              }}
            >
              {team.name}
            </span>
            <span
              className="truncate font-display font-bold leading-tight"
              style={{
                fontSize: size === "sm" ? 10 : 12,
                color: "rgba(255,255,255,0.95)",
              }}
            >
              {label}
            </span>
          </div>
        </>
      ) : (
        // ── PLACEHOLDER CARD (image not uploaded or failed to load) ────
        <>
          {/* TOP — colored band (62% height) */}
          <div
            className="absolute inset-x-0 top-0 overflow-hidden"
            style={{
              height: "62%",
              backgroundColor: isLocked ? "transparent" : teamColorVar(team.code),
            }}
          >
            {!isLocked && <div aria-hidden className="absolute inset-0 bg-chevrons opacity-70" />}
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
                "absolute left-1.5 top-1.5 font-mono font-extrabold tracking-wider leading-none",
                isLocked ? "text-ink/45" : "text-white/85"
              )}
              style={{ fontSize: size === "sm" ? 11 : 14 }}
            >
              #{numStr}
            </span>

            {/* team code chip top-right */}
            <span
              className={cn(
                "absolute right-1.5 top-1.5 rounded-xs px-1 py-0.5 font-display font-extrabold leading-none",
                isLocked ? "bg-ink/10 text-ink/60" : "bg-black/25 text-white"
              )}
              style={{ fontSize: size === "sm" ? 9 : 11 }}
            >
              {team.code}
            </span>

            {/* central large number */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={cn(
                  "font-display font-black leading-none",
                  isLocked ? "text-ink/20" : "text-white"
                )}
                style={{
                  fontSize: size === "sm" ? 36 : 52,
                  textShadow: isLocked ? "none" : "0 2px 0 rgba(0,0,0,.10)",
                }}
              >
                {number}
              </span>
            </div>
          </div>

          {/* BOTTOM — white footer with name */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 flex flex-col justify-center gap-0.5 px-2 py-1.5",
              isLocked ? "" : "bg-white"
            )}
            style={{ height: "38%" }}
          >
            <span
              className={cn(
                "font-sans font-bold uppercase tracking-wider truncate leading-none",
                isLocked ? "text-ink/45" : "text-ink-mute"
              )}
              style={{ fontSize: size === "sm" ? 8 : 10 }}
            >
              {team.name}
            </span>
            <span
              className={cn(
                "truncate font-display font-bold leading-tight",
                isLocked ? "text-ink/55" : "text-ink"
              )}
              style={{ fontSize: size === "sm" ? 10 : 12 }}
            >
              {label}
            </span>
          </div>
        </>
      )}

      {/* ── Common badges ─────────────────────────────────────────────── */}

      {/* Duplicate count badge */}
      {isDup && (
        <span
          className="absolute -right-1.5 -top-1.5 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-white bg-magenta px-1.5 font-display text-[11px] font-extrabold text-white"
          style={{ boxShadow: "0 4px 12px rgba(226,51,107,.45)" }}
        >
          ×{count}
        </span>
      )}

      {/* Locked hint */}
      {isLocked && (
        <span
          aria-hidden
          className="absolute bottom-1.5 right-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink/55 text-[10px] text-white"
        >
          ?
        </span>
      )}
    </button>
  );
}
