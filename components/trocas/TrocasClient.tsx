"use client";

import { useState, useMemo } from "react";
import { Copy, Share2, X, ArrowLeftRight, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { SourceStats } from "@/types/database";

// ── Types ──────────────────────────────────────────────────────────────
export interface TrocasSticker {
  id: string;
  number: number;
  owned_count: number;
  label: string;
  teamCode: string;
  teamName: string;
}

export interface TrocasClientProps {
  collectionName: string;
  duplicates: TrocasSticker[];
  missing: TrocasSticker[];
  sourceStats: SourceStats[];
}

type Tab = "duplicates" | "missing" | "origins";

// ── Helpers ───────────────────────────────────────────────────────────
function generateWhatsAppText(
  collectionName: string,
  duplicates: TrocasSticker[],
  missing: TrocasSticker[]
): string {
  const dupPart = duplicates
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((s) => {
      const extras = s.owned_count - 1;
      return extras > 1 ? `${s.number}x${extras}` : String(s.number);
    })
    .join(", ");

  const missPart = missing
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((s) => s.number)
    .join(", ");

  return (
    `📕 Álbum Copa 2026 — ${collectionName}\n` +
    `✅ TENHO (repetidas): ${dupPart || "—"}\n` +
    `❌ PRECISO: ${missPart || "—"}`
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────
function TabBar({
  tab,
  onChange,
  dupCount,
  missCount,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  dupCount: number;
  missCount: number;
}) {
  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "duplicates", label: "Repetidas", badge: dupCount },
    { id: "missing", label: "Faltantes", badge: missCount },
    { id: "origins", label: "Origens" },
  ];
  return (
    <div
      className="flex gap-0 border-b"
      style={{ borderColor: "var(--line)" }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={[
            "flex-1 flex flex-col items-center justify-center py-3 text-center transition-colors relative",
            tab === t.id ? "text-green-700" : "text-ink-mute",
          ].join(" ")}
        >
          <span className="font-sans text-xs font-semibold leading-tight">{t.label}</span>
          {t.badge !== undefined && (
            <span
              className="font-mono text-[10px] font-bold leading-tight"
              style={{ color: tab === t.id ? "var(--green-700)" : "var(--ink-mute)" }}
            >
              {t.badge.toLocaleString("pt-BR")}
            </span>
          )}
          {tab === t.id && (
            <span
              className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
              style={{ background: "var(--green)" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Duplicates tab ────────────────────────────────────────────────────
function DuplicatesTab({ stickers }: { stickers: TrocasSticker[] }) {
  if (stickers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 px-6">
        <p className="font-sans text-sm text-ink-mute text-center">
          Sem repetidas ainda. Registre figurinhas no Modo Banca para vê-las aqui.
        </p>
      </div>
    );
  }
  return (
    <div className="px-4 py-4 space-y-1.5">
      {stickers
        .slice()
        .sort((a, b) => a.number - b.number)
        .map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 bg-elev rounded-xl px-4 py-2.5"
            style={{ border: "1px solid var(--line)" }}
          >
            <span className="font-mono font-extrabold text-xl text-ink w-11 flex-shrink-0">
              {s.number}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-semibold text-ink truncate leading-tight">
                {s.label}
              </p>
              <p className="font-sans text-xs text-ink-mute truncate leading-tight">
                {s.teamName}
              </p>
            </div>
            <span
              className="font-mono font-bold text-sm rounded-full px-2.5 py-0.5 flex-shrink-0"
              style={{ background: "var(--magenta-50)", color: "var(--magenta)" }}
            >
              ×{s.owned_count - 1} para trocar
            </span>
          </div>
        ))}
    </div>
  );
}

// ── Missing tab ────────────────────────────────────────────────────────
function MissingTab({ stickers }: { stickers: TrocasSticker[] }) {
  // Group by team
  const byTeam = useMemo(() => {
    const map = new Map<string, { teamName: string; numbers: number[] }>();
    for (const s of stickers) {
      const key = s.teamCode;
      if (!map.has(key)) map.set(key, { teamName: s.teamName, numbers: [] });
      map.get(key)!.numbers.push(s.number);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.teamName.localeCompare(b.teamName)
    );
  }, [stickers]);

  if (stickers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 px-6">
        <span className="text-4xl">🏆</span>
        <p className="font-sans text-sm text-ink-mute text-center">
          Nenhuma faltante! Álbum completo!
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {byTeam.map(({ teamName, numbers }) => (
        <div key={teamName}>
          <p className="font-display font-bold text-sm text-ink mb-2 flex items-center gap-2">
            {teamName}
            <span className="font-mono text-xs font-normal text-ink-mute">
              ({numbers.length})
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {numbers.sort((a, b) => a - b).map((n) => (
              <span
                key={n}
                className="font-mono text-sm font-bold rounded-lg px-2.5 py-1.5"
                style={{
                  background: "var(--bg-sunken)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Origins tab ────────────────────────────────────────────────────────
const KIND_LABELS: Record<string, string> = {
  banca: "Banca",
  mercado: "Mercado",
  online: "Online",
  troca: "Troca",
  presente: "Presente",
  outro: "Outro",
};

function OriginsTab({ stats }: { stats: SourceStats[] }) {
  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 px-6">
        <span className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "var(--green-50)" }}>
          <BarChart2 size={24} style={{ color: "var(--green-700)" }} strokeWidth={1.8} />
        </span>
        <p className="font-sans text-sm text-ink-mute text-center max-w-[240px] leading-relaxed">
          Nenhuma origem cadastrada. Registre figurinhas no Modo Banca escolhendo um ponto de venda para ver o ranking aqui.
        </p>
      </div>
    );
  }

  const chartData = stats.map((s) => ({
    name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
    novas: s.novas,
    repetidas: s.repetidas,
  }));

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Bar chart */}
      {stats.some((s) => s.total_obtidas > 0) && (
        <div
          className="rounded-xl p-4 bg-elev shadow-sm"
          style={{ border: "1px solid var(--line)" }}
        >
          <p className="font-display font-bold text-sm text-ink mb-3">
            Figurinhas por origem
          </p>
          <ResponsiveContainer width="100%" height={Math.max(120, stats.length * 48)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
            >
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--ink-mute)" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11, fill: "var(--ink)" }}
              />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name === "novas" ? "Novas" : "Repetidas",
                ]}
                contentStyle={{
                  background: "var(--bg-elev)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Legend
                formatter={(v) => (v === "novas" ? "Novas" : "Repetidas")}
                iconSize={10}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="novas" stackId="a" fill="var(--green)" radius={[0, 0, 0, 0]} />
              <Bar
                dataKey="repetidas"
                stackId="a"
                fill="var(--magenta)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stat rows */}
      <div className="space-y-2">
        {stats.map((s) => (
          <div
            key={s.source_id}
            className="rounded-xl p-4 bg-elev shadow-sm space-y-2.5"
            style={{ border: "1px solid var(--line)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display font-bold text-base text-ink leading-tight">
                  {s.name}
                </p>
                <p className="font-sans text-xs text-ink-mute capitalize">
                  {KIND_LABELS[s.kind] ?? s.kind}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className="font-mono font-extrabold text-xl leading-none"
                  style={{ color: "var(--green-700)" }}
                >
                  {s.pct_aproveitamento ?? 0}%
                </p>
                <p className="font-sans text-[10px] text-ink-mute">aproveitamento</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Total", value: s.total_obtidas, color: "var(--ink)" },
                { label: "Novas", value: s.novas, color: "var(--green-700)" },
                { label: "Rept.", value: s.repetidas, color: "var(--magenta)" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-lg py-2"
                  style={{ background: "var(--bg-sunken)" }}
                >
                  <p
                    className="font-mono font-bold text-base leading-none"
                    style={{ color }}
                  >
                    {value}
                  </p>
                  <p className="font-sans text-[10px] text-ink-mute uppercase tracking-wide mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {/* Progress bar: novas vs repetidas */}
            {s.total_obtidas > 0 && (
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--bg-sunken)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(s.novas / s.total_obtidas) * 100}%`,
                    background: "var(--green)",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WhatsApp List Modal ────────────────────────────────────────────────
function ListModal({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    try {
      await navigator.share({ text });
    } catch {
      // user cancelled or not supported
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-bg rounded-t-2xl shadow-lg"
        style={{ border: "1px solid var(--line)", borderBottom: "none" }}
      >
        {/* Handle */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-display font-bold text-xl text-ink">Lista para WhatsApp</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-sunken text-ink-mute transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Text preview */}
        <div className="px-5 pb-4">
          <pre
            className="font-mono text-sm text-ink bg-sunken rounded-xl p-4 whitespace-pre-wrap break-words max-h-[240px] overflow-y-auto"
            style={{ border: "1px solid var(--line)" }}
          >
            {text}
          </pre>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-8 flex gap-3">
          <Button
            variant="secondary"
            size="md"
            full
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy size={16} strokeWidth={2} />
            {copied ? "Copiado!" : "Copiar"}
          </Button>
          {canShare && (
            <Button
              variant="primary"
              size="md"
              full
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 size={16} strokeWidth={2} />
              Compartilhar
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export function TrocasClient({
  collectionName,
  duplicates,
  missing,
  sourceStats,
}: TrocasClientProps) {
  const [tab, setTab] = useState<Tab>("duplicates");
  const [showList, setShowList] = useState(false);

  const listText = useMemo(
    () => generateWhatsAppText(collectionName, duplicates, missing),
    [collectionName, duplicates, missing]
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header with green gradient */}
      <div
        className="relative overflow-hidden px-5 pt-14 pb-5"
        style={{
          background: "linear-gradient(135deg, var(--green) 0%, var(--green-700) 100%)",
        }}
      >
        {/* Chevron background */}
        <div className="absolute inset-0 bg-chevrons opacity-30 pointer-events-none" />
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">
          Álbum Copa 2026
        </p>
        <h1 className="font-display font-bold text-2xl text-white leading-snug">
          Trocas
        </h1>
        <p className="text-white/70 text-sm mt-0.5">
          {duplicates.length} repetida{duplicates.length !== 1 ? "s" : ""} ·{" "}
          {missing.length} faltante{missing.length !== 1 ? "s" : ""}
        </p>

        {/* Generate list CTA */}
        <button
          onClick={() => setShowList(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 h-12 rounded-full font-display font-bold text-base active:scale-[.98] transition-transform"
          style={{ background: "rgba(255,255,255,.18)", color: "white", border: "1px solid rgba(255,255,255,.3)" }}
        >
          <ArrowLeftRight size={18} strokeWidth={2.2} />
          Gerar lista de troca
        </button>
      </div>

      {/* Tab bar */}
      <div className="bg-elev flex-shrink-0" style={{ borderBottom: "1px solid var(--line)" }}>
        <TabBar
          tab={tab}
          onChange={setTab}
          dupCount={duplicates.length}
          missCount={missing.length}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "duplicates" && <DuplicatesTab stickers={duplicates} />}
        {tab === "missing" && <MissingTab stickers={missing} />}
        {tab === "origins" && <OriginsTab stats={sourceStats} />}
      </div>

      <div className="h-6" />

      {/* WhatsApp list modal */}
      {showList && <ListModal text={listText} onClose={() => setShowList(false)} />}
    </div>
  );
}
