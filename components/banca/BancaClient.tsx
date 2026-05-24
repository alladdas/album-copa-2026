"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { X, Check, CornerDownLeft, MapPin } from "lucide-react";
import { incrementOwned, recordAcquisition } from "@/lib/queries";
import type { Source } from "@/types/database";

// ── Types ──────────────────────────────────────────────────────────────
export interface BancaSticker {
  id: string;
  number: number;
  owned_count: number;
  label: string;
  teamCode: string;
  teamName: string;
}

type ViewTab = "missing" | "duplicates";
type StatusFilter = "missing" | "all";

interface TeamGroup {
  teamCode: string;
  teamName: string;
  stickers: BancaSticker[];
}

// ── Helper ─────────────────────────────────────────────────────────────
function toGroups(list: BancaSticker[]): TeamGroup[] {
  const map = new Map<string, TeamGroup>();
  for (const s of list) {
    if (!map.has(s.teamCode)) {
      map.set(s.teamCode, { teamCode: s.teamCode, teamName: s.teamName, stickers: [] });
    }
    map.get(s.teamCode)!.stickers.push(s);
  }
  const result = Array.from(map.values());
  result.forEach((g) =>
    g.stickers.sort((a: BancaSticker, b: BancaSticker) => a.number - b.number)
  );
  return result;
}

// ── Keypad ─────────────────────────────────────────────────────────────
const PAD_ROWS: string[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["⌫", "0", "✓"],
];

function Keypad({
  onKey,
  canConfirm,
}: {
  onKey: (k: string) => void;
  canConfirm: boolean;
}) {
  return (
    <div className="px-4 pb-2 space-y-2">
      {PAD_ROWS.map((row, ri) => (
        <div key={ri} className="grid grid-cols-3 gap-2">
          {row.map((k) => {
            const isConfirm = k === "✓";
            const isBack = k === "⌫";
            const disabled = isConfirm && !canConfirm;
            return (
              <button
                key={k}
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (!disabled) onKey(k);
                }}
                disabled={disabled}
                className={[
                  "flex items-center justify-center rounded-2xl font-mono font-bold select-none",
                  "min-h-[64px] transition-transform active:scale-[.94]",
                  isConfirm
                    ? canConfirm
                      ? "bg-green text-white shadow-ground text-xl"
                      : "bg-elev text-ink-mute opacity-40 cursor-not-allowed text-xl"
                    : isBack
                    ? "bg-elev text-ink-soft"
                    : "bg-elev text-ink text-2xl",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={isConfirm ? "Confirmar" : isBack ? "Apagar" : k}
              >
                {isConfirm ? (
                  <Check size={26} strokeWidth={2.8} />
                ) : isBack ? (
                  <CornerDownLeft size={22} strokeWidth={2.2} />
                ) : (
                  k
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Numeric Display ────────────────────────────────────────────────────
function NumDisplay({ digits }: { digits: string }) {
  const MAX = 4;
  const chars = digits.padEnd(MAX, "_").split("");
  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      {chars.map((ch, i) => (
        <span
          key={i}
          className="font-mono font-extrabold leading-none"
          style={{
            fontSize: 56,
            color: ch === "_" ? "var(--ink-mute)" : "var(--ink)",
            minWidth: 34,
            textAlign: "center",
          }}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

// ── Source Picker ──────────────────────────────────────────────────────
function SourcePicker({
  sources,
  value,
  onChange,
}: {
  sources: Source[];
  value: string;
  onChange: (v: string) => void;
}) {
  if (sources.length === 0) return null;
  return (
    <div className="px-4 py-2">
      <div className="relative">
        <MapPin
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded-full pl-9 pr-4 font-sans text-sm text-ink bg-elev appearance-none focus:outline-none focus:ring-2 focus:ring-green"
          style={{ border: "1px solid var(--line)" }}
        >
          <option value="">— Origem (opcional) —</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Register Overlay ───────────────────────────────────────────────────
function RegisterOverlay({
  collectionId,
  sources,
  stickers,
  onClose,
  onIncrement,
  onDecrement,
}: {
  collectionId: string;
  sources: Source[];
  stickers: BancaSticker[];
  onClose: () => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}) {
  const [digits, setDigits] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [feedbackOk, setFeedbackOk] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const pending = useRef(new Set<string>());

  const handleKey = useCallback(
    async (k: string) => {
      if (k === "⌫") {
        setDigits((d) => d.slice(0, -1));
        return;
      }
      if (k === "✓") {
        const num = parseInt(digits, 10);
        if (!digits || isNaN(num)) return;

        const sticker = stickers.find((s) => s.number === num);
        if (!sticker) {
          setFeedbackOk(false);
          setFeedbackText(`#${num} não está no álbum`);
          return;
        }
        if (pending.current.has(sticker.id)) return;

        const wasNew = sticker.owned_count === 0;
        onIncrement(sticker.id);
        setFeedbackOk(true);
        setFeedbackText(
          `#${num} ${sticker.label} (${sticker.teamName})${wasNew ? " — NOVA! 🎉" : " — repetida"}`
        );
        setDigits("");

        pending.current.add(sticker.id);
        try {
          await incrementOwned(sticker.id);
          await recordAcquisition({
            collectionId,
            stickerId: sticker.id,
            wasNew,
            sourceId: sourceId || undefined,
          });
        } catch {
          onDecrement(sticker.id);
          setFeedbackOk(false);
          setFeedbackText(`Erro ao salvar #${num}. Tente novamente.`);
        } finally {
          pending.current.delete(sticker.id);
        }
        return;
      }
      if (digits.length < 4) {
        setDigits((d) => d + k);
        setFeedbackOk(null);
        setFeedbackText("");
      }
    },
    [digits, stickers, collectionId, sourceId, onIncrement, onDecrement]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Enter") { handleKey("✓"); return; }
      if (e.key === "Backspace") { handleKey("⌫"); return; }
      if (/^\d$/.test(e.key)) handleKey(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, handleKey]);

  return (
    <div data-theme="dark" className="fixed inset-0 z-50 flex flex-col bg-bg text-ink">
      <div className="flex items-center gap-3 px-4 pt-14 pb-2 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-elev text-ink-soft active:scale-95 transition-transform flex-shrink-0"
        >
          <X size={20} strokeWidth={2} />
        </button>
        <div>
          <h2 className="font-display font-bold text-xl text-ink leading-tight">
            Registrar figurinha
          </h2>
          <p className="font-sans text-xs text-ink-mute">Digite o número e confirme</p>
        </div>
      </div>

      <SourcePicker sources={sources} value={sourceId} onChange={setSourceId} />

      <div className="flex-1" />

      <NumDisplay digits={digits} />

      <div className="h-8 flex items-center justify-center px-5 flex-shrink-0">
        {feedbackOk !== null && feedbackText && (
          <p
            className="font-sans text-sm font-semibold text-center leading-snug"
            style={{ color: feedbackOk ? "var(--green)" : "var(--magenta)" }}
          >
            {feedbackText}
          </p>
        )}
      </div>

      <Keypad onKey={handleKey} canConfirm={digits.length > 0} />
      <div className="h-8 flex-shrink-0" />
    </div>
  );
}

// ── FALTAM view (grouped by team) ─────────────────────────────────────
function MissingView({ groups }: { groups: TeamGroup[] }) {
  const totalCount = groups.reduce((s, g) => s + g.stickers.length, 0);

  if (totalCount === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-8">
        <span className="text-5xl">🎉</span>
        <p className="font-display font-bold text-xl text-ink text-center">
          Álbum completo!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      <p className="font-sans text-xs text-ink-mute font-semibold uppercase tracking-widest mb-3">
        {totalCount.toLocaleString("pt-BR")} faltando · {groups.length} seleções
      </p>
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.teamCode}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display font-bold text-sm text-ink leading-none">
                {g.teamName}
              </span>
              <span className="font-mono text-[11px] text-ink-mute">
                ({g.stickers.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.stickers.map((s) => (
                <span
                  key={s.id}
                  className="font-mono text-sm font-bold bg-elev text-ink rounded-lg px-2.5 py-1.5"
                  style={{ border: "1px solid var(--line)" }}
                  title={s.label}
                >
                  {s.number}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── REPETIDAS view (grouped by team) ─────────────────────────────────
function DuplicatesView({ groups }: { groups: TeamGroup[] }) {
  const totalCount = groups.reduce((s, g) => s + g.stickers.length, 0);

  if (totalCount === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <p className="font-sans text-sm text-ink-mute text-center">
          Sem repetidas ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      <p className="font-sans text-xs text-ink-mute font-semibold uppercase tracking-widest mb-3">
        {totalCount.toLocaleString("pt-BR")} tipo{totalCount !== 1 ? "s" : ""} de repetida
        {" · "}{groups.length} seleções
      </p>
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.teamCode}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display font-bold text-sm text-ink leading-none">
                {g.teamName}
              </span>
              <span className="font-mono text-[11px] text-ink-mute">
                ({g.stickers.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {g.stickers.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-elev rounded-xl px-4 py-2.5"
                  style={{ border: "1px solid var(--line)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-extrabold text-xl text-ink w-9 flex-shrink-0">
                      {s.number}
                    </span>
                    <p className="font-sans text-sm font-semibold text-ink truncate leading-tight">
                      {s.label}
                    </p>
                  </div>
                  <span
                    className="font-mono font-bold text-sm rounded-full px-2.5 py-0.5 ml-2 flex-shrink-0"
                    style={{ background: "var(--magenta)", color: "white" }}
                  >
                    ×{s.owned_count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TODAS view (all stickers, color-coded by status) ───────────────────
// missing = dashed outline · owned×1 = green · owned×2+ = magenta
function AllStickersView({ groups }: { groups: TeamGroup[] }) {
  const totalCount = groups.reduce((s, g) => s + g.stickers.length, 0);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      <p className="font-sans text-xs text-ink-mute font-semibold uppercase tracking-widest mb-3">
        {totalCount.toLocaleString("pt-BR")} figurinhas · {groups.length} seleções
      </p>
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.teamCode}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display font-bold text-sm text-ink leading-none">
                {g.teamName}
              </span>
              <span className="font-mono text-[11px] text-ink-mute">
                ({g.stickers.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.stickers.map((s) => {
                const chipStyle =
                  s.owned_count === 0
                    ? { border: "1px dashed var(--line)", color: "var(--ink-mute)" }
                    : s.owned_count === 1
                    ? { background: "var(--green)", color: "white" }
                    : { background: "var(--magenta)", color: "white" };
                return (
                  <span
                    key={s.id}
                    className="font-mono text-sm font-bold rounded-lg px-2.5 py-1.5"
                    style={chipStyle}
                    title={`${s.label}${s.owned_count >= 2 ? ` ×${s.owned_count}` : ""}`}
                  >
                    {s.number}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
export interface BancaClientProps {
  collectionId: string;
  initialStickers: BancaSticker[];
  sources: Source[];
}

export function BancaClient({
  collectionId,
  initialStickers,
  sources,
}: BancaClientProps) {
  const [stickers, setStickers] = useState<BancaSticker[]>(initialStickers);
  const [tab, setTab] = useState<ViewTab>("missing");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("missing");
  const [registerOpen, setRegisterOpen] = useState(false);

  const missing = useMemo(() => stickers.filter((s) => s.owned_count === 0), [stickers]);
  const duplicates = useMemo(() => stickers.filter((s) => s.owned_count >= 2), [stickers]);

  const groups = useMemo(() => {
    if (tab === "missing") {
      return statusFilter === "all" ? toGroups(stickers) : toGroups(missing);
    }
    return toGroups(duplicates);
  }, [tab, statusFilter, stickers, missing, duplicates]);

  const onIncrement = useCallback((id: string) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, owned_count: s.owned_count + 1 } : s))
    );
  }, []);

  const onDecrement = useCallback((id: string) => {
    setStickers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, owned_count: Math.max(0, s.owned_count - 1) } : s
      )
    );
  }, []);

  return (
    <>
      <div data-theme="dark" className="flex flex-col min-h-screen bg-bg text-ink">

        {/* Header */}
        <div className="px-5 pt-14 pb-3 flex-shrink-0">
          <h1 className="font-display font-bold text-3xl text-ink leading-tight">
            Modo Banca
          </h1>
          <p className="font-sans text-xs text-ink-mute mt-0.5">
            Conferência rápida e registro de figurinhas
          </p>
        </div>

        {/* FALTAM / REPETIDAS — primary toggle showing live counts */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div
            className="flex rounded-2xl p-1 gap-1"
            style={{ background: "var(--bg-elev)", border: "1px solid var(--line)" }}
          >
            <button
              onClick={() => setTab("missing")}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-4 rounded-xl transition-colors",
                tab === "missing" ? "bg-green text-white" : "text-ink-mute",
              ].join(" ")}
            >
              <span className="font-mono font-extrabold text-3xl leading-none">
                {missing.length.toLocaleString("pt-BR")}
              </span>
              <span className="font-sans text-[11px] font-bold uppercase tracking-widest mt-0.5">
                FALTAM
              </span>
            </button>
            <button
              onClick={() => setTab("duplicates")}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-4 rounded-xl transition-colors",
                tab === "duplicates" ? "text-white" : "text-ink-mute",
              ].join(" ")}
              style={tab === "duplicates" ? { background: "var(--magenta)" } : {}}
            >
              <span className="font-mono font-extrabold text-3xl leading-none">
                {duplicates.length.toLocaleString("pt-BR")}
              </span>
              <span className="font-sans text-[11px] font-bold uppercase tracking-widest mt-0.5">
                REPETIDAS
              </span>
            </button>
          </div>
        </div>

        {/* Faltam / Todas — secondary filter, only in FALTAM tab */}
        {tab === "missing" && (
          <div className="px-4 pb-3 flex-shrink-0">
            <div
              className="inline-flex rounded-full p-0.5 gap-0.5"
              style={{ background: "var(--bg-elev)", border: "1px solid var(--line)" }}
            >
              <button
                onClick={() => setStatusFilter("missing")}
                className={[
                  "rounded-full px-4 py-1.5 font-sans text-sm font-semibold transition-colors",
                  statusFilter === "missing" ? "bg-green text-white" : "text-ink-mute",
                ].join(" ")}
              >
                Faltam
              </button>
              <button
                onClick={() => setStatusFilter("all")}
                className={[
                  "rounded-full px-4 py-1.5 font-sans text-sm font-semibold transition-colors",
                  statusFilter === "all" ? "bg-green text-white" : "text-ink-mute",
                ].join(" ")}
              >
                Todas
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {tab === "missing" ? (
          statusFilter === "all" ? (
            <AllStickersView groups={groups} />
          ) : (
            <MissingView groups={groups} />
          )
        ) : (
          <DuplicatesView groups={groups} />
        )}

        <div className="h-28 flex-shrink-0" />
      </div>

      {/* Registrar FAB */}
      {!registerOpen && (
        <button
          onClick={() => setRegisterOpen(true)}
          className="fixed bottom-24 right-4 z-30 h-14 px-6 rounded-full font-display font-bold text-base text-white flex items-center gap-2 shadow-ground active:scale-95 transition-transform"
          style={{ background: "var(--green)" }}
        >
          Registrar
        </button>
      )}

      {registerOpen && (
        <RegisterOverlay
          collectionId={collectionId}
          sources={sources}
          stickers={stickers}
          onClose={() => setRegisterOpen(false)}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      )}
    </>
  );
}
