function Sk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-xl bg-elev ${className ?? ""}`} style={style} />;
}

// Simulates the album grid: status filters + team header + sticker card grid
export default function AlbumLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-bg">
      {/* Search + status filter row */}
      <div className="px-4 pt-4 pb-3 space-y-3 flex-shrink-0">
        <Sk className="h-10 rounded-full" />
        <div className="flex gap-2">
          {[72, 56, 72, 80].map((w, i) => (
            <Sk key={i} className="h-8 rounded-full flex-shrink-0" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Sticker grid */}
      <div className="flex-1 overflow-hidden px-4">
        {/* Team header */}
        <Sk className="h-4 w-20 rounded-full mb-3" />
        {/* Grid rows */}
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <Sk key={i} className="rounded-md" style={{ aspectRatio: "76/106" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
