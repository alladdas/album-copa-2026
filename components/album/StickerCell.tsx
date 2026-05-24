"use client";

import { useLongPress } from "@/hooks/useLongPress";
import { cn } from "@/lib/utils";
import type { Sticker } from "@/types/database";

interface Props {
  sticker: Sticker;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export function StickerCell({ sticker, onIncrement, onDecrement }: Props) {
  const { owned_count, number, label, is_foil } = sticker;

  const isMissing = owned_count === 0;
  const isOwned = owned_count === 1;
  const isDuplicate = owned_count >= 2;

  const handlers = useLongPress({
    onTap: () => onIncrement(sticker.id),
    onLongPress: () => onDecrement(sticker.id),
    delay: 500,
  });

  // Etiqueta curta: primeiro nome ou até 8 chars
  const shortLabel = label.length > 9 ? label.split(" ")[0] : label;

  return (
    <button
      {...handlers}
      type="button"
      aria-label={`Figurinha ${number} — ${label} — ${
        isMissing ? "faltando" : isDuplicate ? `tenho ${owned_count}` : "tenho"
      }`}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border select-none",
        "min-h-[64px] w-full gap-0.5 px-1 py-2 text-center transition-all active:scale-95",
        // Status colors
        isMissing && "bg-muted/60 border-border text-muted-foreground",
        isOwned && "bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800 text-green-900 dark:text-green-100",
        isDuplicate && "bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100",
        is_foil && !isMissing && "ring-1 ring-yellow-400/60"
      )}
    >
      {/* Número */}
      <span className={cn("font-bold leading-none", isMissing ? "text-base" : "text-sm")}>
        {number}
      </span>

      {/* Nome curto */}
      <span className="text-[9px] leading-tight opacity-80 max-w-full truncate px-0.5">
        {shortLabel}
      </span>

      {/* Badge de repetidas */}
      {isDuplicate && (
        <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
          x{owned_count}
        </span>
      )}

      {/* Indicador foil */}
      {is_foil && !isMissing && (
        <span className="absolute top-0.5 left-1 text-[8px] leading-none text-yellow-500">★</span>
      )}
    </button>
  );
}
