"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sticker, Team } from "@/types/database";

interface Props {
  sticker: Sticker;
  team: Team | undefined;
  onIncrement: () => void;
  onDecrement: () => void;
  onClose: () => void;
  onActivity: () => void;
}

export function StickerStepper({
  sticker,
  team,
  onIncrement,
  onDecrement,
  onClose,
  onActivity,
}: Props) {
  const { owned_count, number, label, is_foil } = sticker;

  const statusLabel =
    owned_count === 0 ? "Faltando" :
    owned_count === 1 ? "Tenho" :
    `Tenho + ${owned_count - 1} repetida(s)`;

  const statusColor =
    owned_count === 0 ? "text-ink-mute" :
    owned_count === 1 ? "text-green-700" :
    "text-magenta";

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-3"
    >
      <div
        className="overflow-hidden rounded-xl shadow-lg"
        style={{ background: "var(--bg-elev)", border: "1px solid var(--line-strong)" }}
      >
        {/* Sticker info header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono font-bold text-lg leading-none text-ink">{number}</span>
            {is_foil && (
              <span className="text-gold text-xs font-bold">★ Foil</span>
            )}
            <div className="min-w-0">
              <p className="font-display font-semibold text-sm truncate leading-tight text-ink">
                {label}
              </p>
              <p className="text-xs text-ink-mute truncate">{team?.name ?? ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn("text-xs font-semibold", statusColor)}>{statusLabel}</span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sunken text-ink-mute"
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* − count + controls */}
        <div className="flex items-stretch" style={{ borderTop: "1px solid var(--line)" }}>
          <button
            onClick={() => { onDecrement(); onActivity(); }}
            disabled={owned_count <= 0}
            aria-label="Remover uma figurinha"
            className={cn(
              "flex-1 flex items-center justify-center text-2xl font-bold h-14 transition-colors select-none rounded-none",
              owned_count <= 0
                ? "text-ink-mute/30 cursor-not-allowed"
                : "text-magenta hover:bg-magenta-50 active:bg-magenta/10"
            )}
          >
            −
          </button>

          <div
            className="flex flex-col items-center justify-center w-20 h-14"
            style={{ borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)" }}
          >
            <span className="font-mono text-2xl font-bold leading-none text-ink">{owned_count}</span>
            <span className="text-[10px] text-ink-mute mt-0.5">
              {owned_count === 0 ? "falta" : owned_count === 1 ? "tenho" : "total"}
            </span>
          </div>

          <button
            onClick={() => { onIncrement(); onActivity(); }}
            aria-label="Adicionar uma figurinha"
            className="flex-1 flex items-center justify-center text-2xl font-bold h-14 text-green-700 hover:bg-green-50 active:bg-green-50 transition-colors select-none rounded-none"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
