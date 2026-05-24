function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-elev ${className ?? ""}`} />;
}

export default function TrocasLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <div className="px-4 pt-14 pb-4 space-y-2">
        <Sk className="h-7 w-28 rounded-lg" />
      </div>

      <div className="px-4 space-y-4">
        {/* Share button */}
        <Sk className="h-12 rounded-2xl" />

        {/* Two-column chips (missing / duplicates) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Sk className="h-4 w-20 rounded-full" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <Sk key={i} className="h-7 w-9 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Sk className="h-4 w-20 rounded-full" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Sk key={i} className="h-10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
