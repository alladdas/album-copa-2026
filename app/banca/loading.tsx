function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-elev ${className ?? ""}`} />;
}

export default function BancaLoading() {
  return (
    <div data-theme="dark" className="flex flex-col min-h-screen bg-bg text-ink">
      {/* Header */}
      <div className="px-5 pt-14 pb-3">
        <Sk className="h-8 w-40 bg-elev rounded-lg mb-2" />
        <Sk className="h-3 w-56 rounded-full" />
      </div>

      {/* Primary FALTAM / REPETIDAS toggle */}
      <div className="px-4 pb-3">
        <div className="flex rounded-2xl p-1 gap-1 bg-elev">
          <Sk className="flex-1 h-20 rounded-xl" />
          <Sk className="flex-1 h-20 rounded-xl" />
        </div>
      </div>

      {/* Secondary filter pill */}
      <div className="px-4 pb-3">
        <Sk className="h-8 w-32 rounded-full" />
      </div>

      {/* Number chips */}
      <div className="px-4 space-y-4 pt-2">
        <Sk className="h-4 w-28 rounded-full" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <Sk key={i} className="h-8 w-10 rounded-lg" />
          ))}
        </div>
        <Sk className="h-4 w-20 rounded-full" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 15 }).map((_, i) => (
            <Sk key={i} className="h-8 w-10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
