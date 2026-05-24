// Shown instantly on client navigation to "/" while the server component fetches data.
// Prevents the 2-4s blank-screen freeze from auth + DB queries blocking render.

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-elev ${className ?? ""}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Green header band */}
      <div className="bg-green px-5 pt-14 pb-6 space-y-2">
        <Sk className="h-3 w-24 bg-white/20 rounded-full" />
        <Sk className="h-7 w-48 bg-white/30 rounded-lg" />
        <Sk className="h-3 w-32 bg-white/20 rounded-full" />
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Progress bar card */}
        <Sk className="h-16" />

        {/* Mini-stats row */}
        <div className="grid grid-cols-3 gap-2.5">
          <Sk className="h-16" />
          <Sk className="h-16" />
          <Sk className="h-16" />
        </div>

        {/* Financial cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <Sk className="h-20" />
          <Sk className="h-20" />
        </div>

        {/* Projection card */}
        <Sk className="h-28" />

        {/* Shortcuts */}
        <Sk className="h-5 w-16 rounded-full" />
        <div className="grid grid-cols-2 gap-2.5">
          <Sk className="h-24" />
          <Sk className="h-24" />
          <Sk className="h-24" />
          <Sk className="h-24" />
        </div>
      </div>
    </div>
  );
}
