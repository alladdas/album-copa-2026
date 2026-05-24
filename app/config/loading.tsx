function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-elev ${className ?? ""}`} />;
}

export default function ConfigLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header with back arrow */}
      <div className="px-4 pt-14 pb-3 flex items-center gap-3 border-b border-line">
        <Sk className="h-10 w-10 rounded-full flex-shrink-0" />
        <Sk className="h-6 w-36 rounded-lg" />
      </div>

      <div className="px-4 py-5 space-y-3">
        <Sk className="h-3 w-16 rounded-full" />
        <Sk className="h-14" />

        <Sk className="h-3 w-16 rounded-full mt-2" />
        <Sk className="h-14" />
        <Sk className="h-14" />

        <Sk className="h-3 w-24 rounded-full mt-2" />
        <Sk className="h-12 rounded-2xl" />
        <Sk className="h-52" />

        <Sk className="h-3 w-12 rounded-full mt-2" />
        <Sk className="h-14" />
      </div>
    </div>
  );
}
