function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-elev ${className ?? ""}`} />;
}

export default function FinancasLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <div className="px-4 pt-14 pb-4 space-y-2">
        <Sk className="h-7 w-32 rounded-lg" />
        <Sk className="h-3 w-48 rounded-full" />
      </div>

      <div className="px-4 space-y-4">
        {/* Summary card */}
        <Sk className="h-28" />

        {/* "Nova compra" button */}
        <Sk className="h-12 rounded-2xl" />

        {/* Purchase list */}
        <Sk className="h-4 w-24 rounded-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Sk key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}
