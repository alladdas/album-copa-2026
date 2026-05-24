"use client";

import { StickerCard } from "./StickerCard";
import type { Sticker } from "@/types/database";

interface Props {
  sticker: Sticker;
  team: { code: string; name: string } | undefined;
  isSelected: boolean;
  revealing: boolean;
  onSelect: (sticker: Sticker) => void;
}

export function StickerCell({ sticker, team, isSelected, revealing, onSelect }: Props) {
  const state =
    sticker.owned_count === 0 ? "locked" :
    sticker.owned_count === 1 ? "owned" :
    "duplicate" as const;

  return (
    <StickerCard
      state={state}
      team={team ?? { code: "SPECIAL", name: "Especiais" }}
      number={sticker.number}
      label={sticker.label}
      imageUrl={sticker.image_url}
      count={sticker.owned_count}
      foil={sticker.is_foil}
      size="sm"
      revealing={revealing}
      selected={isSelected}
      onClick={() => onSelect(sticker)}
    />
  );
}
