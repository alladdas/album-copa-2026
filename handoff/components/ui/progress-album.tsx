"use client";

/**
 * components/ui/progress-album.tsx — barra de progresso do álbum
 * com label/contagem + chevron pattern interno.
 */
export interface ProgressAlbumProps {
  value: number;
  total: number;
  color?: string; // default: var(--green)
}

export function ProgressAlbum({ value, total, color = "var(--green)" }: ProgressAlbumProps) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-sans text-[13px] font-semibold uppercase tracking-wide text-ink-soft">
          Coleção
        </span>
        <span className="font-mono text-[13px] font-semibold text-ink-soft">
          {value} / {total}
        </span>
      </div>
      <div className="relative h-3.5 overflow-hidden rounded-full bg-sunken">
        <div
          className="relative h-full rounded-full bg-chevrons"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: "inset 0 -2px 0 rgba(0,0,0,.15)",
          }}
        />
      </div>
      <div className="mt-1.5 font-display text-sm font-extrabold text-green-700">
        {pct}% completo
      </div>
    </div>
  );
}
