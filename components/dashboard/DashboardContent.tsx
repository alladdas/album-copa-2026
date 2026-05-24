import Link from "next/link";
import { BookOpen, Store, ArrowLeftRight, Wallet, Telescope, Settings } from "lucide-react";
import { ProgressAlbum } from "@/components/ui/progress-album";
import { StickerCard } from "@/components/album/StickerCard";

// ── Helpers ───────────────────────────────────────────────────────────
function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

// ── Sub-components (all server-renderable) ────────────────────────────

function MiniStat({
  label,
  value,
  textColor = "text-ink",
}: {
  label: string;
  value: number;
  textColor?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-xl py-3 bg-elev shadow-sm"
      style={{ border: "1px solid var(--line)" }}
    >
      <span className={`font-mono font-extrabold text-xl leading-none ${textColor}`}>
        {value.toLocaleString("pt-BR")}
      </span>
      <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
        {label}
      </span>
    </div>
  );
}

function StatCard({
  label,
  primary,
  secondary,
  accentColor,
}: {
  label: string;
  primary: string;
  secondary?: string;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-xl p-4 bg-elev shadow-sm space-y-1"
      style={{ border: "1px solid var(--line)" }}
    >
      <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
        {label}
      </p>
      <p
        className="font-mono font-extrabold text-xl leading-tight"
        style={{ color: accentColor }}
      >
        {primary}
      </p>
      {secondary && (
        <p className="font-sans text-xs text-ink-mute">{secondary}</p>
      )}
    </div>
  );
}

function ShortcutBtn({
  href,
  icon: Icon,
  label,
  bg,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  bg: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 rounded-xl py-5 bg-elev shadow-sm hover:bg-sunken transition-colors active:scale-[.98]"
      style={{ border: "1px solid var(--line)" }}
    >
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: bg }}
      >
        <Icon size={18} className="text-white" strokeWidth={2.2} />
      </span>
      <span className="font-display font-semibold text-sm text-ink">{label}</span>
    </Link>
  );
}

// ── Props ─────────────────────────────────────────────────────────────
export interface DashboardContentProps {
  userName: string;
  collectionName: string;
  totalStickers: number;
  owned: number;
  missing: number;
  duplicates: number;
  totalSpentCents: number;
  totalPacks: number;
  avgCostPerStickerCents: number | null;
  projectedRemainingCents: number | null;
  revealedToday: Array<{
    id: string;
    number: number;
    label: string;
    is_foil: boolean;
    owned_count: number;
    teamCode: string;
    teamName: string;
  }>;
}

// ── Main component ────────────────────────────────────────────────────
export function DashboardContent({
  userName,
  collectionName,
  totalStickers,
  owned,
  missing,
  duplicates,
  totalSpentCents,
  totalPacks,
  avgCostPerStickerCents,
  projectedRemainingCents,
  revealedToday,
}: DashboardContentProps) {
  const hasFinancialData = totalSpentCents > 0 && owned > 0;

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* ── Greeting header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-green px-5 pt-14 pb-6 bg-chevrons">
        <Link
          href="/config"
          aria-label="Configurações"
          className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 text-white"
        >
          <Settings size={18} strokeWidth={2} />
        </Link>
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">
          {collectionName}
        </p>
        <h1 className="font-display font-bold text-2xl text-white leading-snug">
          Olá, {userName}! 👋
        </h1>
        <p className="text-white/70 text-sm mt-0.5">
          {owned.toLocaleString("pt-BR")} de {totalStickers.toLocaleString("pt-BR")} figurinhas
        </p>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* ── Progress bar ─────────────────────────────────────── */}
        <div
          className="rounded-xl p-4 bg-elev shadow-md"
          style={{ border: "1px solid var(--line)" }}
        >
          <ProgressAlbum value={owned} total={totalStickers} />
        </div>

        {/* ── Mini-stats row ────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2.5">
          <MiniStat label="Faltam"    value={missing}    textColor="text-ink" />
          <MiniStat label="Repetidas" value={duplicates}  textColor="text-magenta" />
          <MiniStat label="Únicas"    value={owned}       textColor="text-green-700" />
        </div>

        {/* ── Financial stat cards ─────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label="Total gasto"
            primary={hasFinancialData ? formatBRL(totalSpentCents) : "—"}
            secondary={totalPacks > 0 ? `${totalPacks} pacote${totalPacks !== 1 ? "s" : ""}` : undefined}
            accentColor="var(--gold-700)"
          />
          <StatCard
            label="Por figurinha"
            primary={
              avgCostPerStickerCents != null
                ? formatBRL(avgCostPerStickerCents)
                : "—"
            }
            secondary={avgCostPerStickerCents != null ? "custo médio" : "sem dados ainda"}
            accentColor="var(--sky)"
          />
        </div>

        {/* ── Dark projection card ──────────────────────────────── */}
        <div
          data-theme="dark"
          className="rounded-xl bg-bg text-ink p-5 space-y-3"
          style={{ border: "1px solid var(--line)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--green)" }}
            >
              <Telescope size={15} className="text-white" strokeWidth={2} />
            </span>
            <span className="font-display font-bold text-base text-ink">
              Projeção pra fechar
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-ink-soft">
              Faltam{" "}
              <span className="font-mono font-bold text-ink">
                {missing.toLocaleString("pt-BR")}
              </span>{" "}
              figurinhas
            </p>

            {projectedRemainingCents != null ? (
              <>
                <p className="font-mono font-extrabold text-2xl text-gold leading-none">
                  ≈ {formatBRL(projectedRemainingCents)}
                </p>
                <p className="text-xs text-ink-mute">
                  Estimativa · custo médio atual × faltantes
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-mute italic">
                Registre compras para calcular a estimativa.
              </p>
            )}
          </div>
        </div>

        {/* ── Quick-action shortcuts ────────────────────────────── */}
        <div>
          <p className="font-display font-bold text-base text-ink mb-3">Atalhos</p>
          <div className="grid grid-cols-2 gap-2.5">
            <ShortcutBtn href="/banca"    icon={Store}          label="Modo Banca"  bg="var(--green)" />
            <ShortcutBtn href="/album"    icon={BookOpen}        label="Meu Álbum"   bg="var(--sky)" />
            <ShortcutBtn href="/financas" icon={Wallet}          label="Gastos"      bg="var(--gold)" />
            <ShortcutBtn href="/trocas"   icon={ArrowLeftRight}  label="Trocas"      bg="var(--magenta)" />
          </div>
        </div>

        {/* ── Reveladas hoje ────────────────────────────────────── */}
        {revealedToday.length > 0 && (
          <div>
            <p className="font-display font-bold text-base text-ink mb-3">
              Reveladas hoje{" "}
              <span className="font-mono text-sm text-ink-mute font-normal">
                ({revealedToday.length})
              </span>
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {revealedToday.map((item) => (
                <div key={item.id} className="flex-shrink-0">
                  <StickerCard
                    state={item.owned_count >= 2 ? "duplicate" : "owned"}
                    team={{ code: item.teamCode, name: item.teamName }}
                    number={item.number}
                    label={item.label}
                    count={item.owned_count}
                    foil={item.is_foil}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom padding for nav */}
        <div className="h-2" />
      </div>
    </div>
  );
}
