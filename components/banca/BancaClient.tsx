"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { X, Check, CornerDownLeft, MapPin, Camera } from "lucide-react";
import { CameraScanner } from "./CameraScanner";
import { toast } from "sonner";
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
  const MAX = 2; // numbers 1-20, always 2 digits max
  const chars = digits.padEnd(MAX, "_").split("");
  return (
    <div className="flex items-center justify-center gap-3 py-3">
      {chars.map((ch, i) => (
        <span
          key={i}
          className="font-mono font-extrabold leading-none"
          style={{
            fontSize: 80,
            color: ch === "_" ? "var(--ink-mute)" : "var(--ink)",
            minWidth: 48,
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

// ── History entry ─────────────────────────────────────────────────────
interface HistoryEntry {
  key: string;
  number: number;
  label: string;
  teamCode: string;
  wasNew: boolean;
  count: number; // owned_count AFTER increment
}

// ── Team Picker Panel ─────────────────────────────────────────────────
function TeamPickerPanel({
  teams,
  currentCode,
  onSelect,
  onClose,
}: {
  teams: { code: string; name: string }[];
  currentCode: string | null;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // small delay so the absolute overlay is painted before focusing
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(
      (t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)
    );
  }, [search, teams]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-bg text-ink">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-3 flex-shrink-0">
        <button
          onClick={onClose}
          disabled={!currentCode}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-elev text-ink-soft active:scale-95 transition-transform flex-shrink-0 disabled:opacity-30 disabled:pointer-events-none"
        >
          <X size={20} strokeWidth={2} />
        </button>
        <div>
          <h2 className="font-display font-bold text-xl text-ink leading-tight">
            Escolher seleção
          </h2>
          <p className="font-sans text-xs text-ink-mute">
            {teams.length} seleções disponíveis
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-0"
          style={{ background: "var(--elev)", border: "1px solid var(--line)" }}
        >
          <input
            ref={inputRef}
            type="search"
            placeholder="Buscar seleção ou código…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent font-sans text-base text-ink placeholder:text-ink-mute outline-none min-h-[44px]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-ink-mute shrink-0 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Team list */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-1">
        {filtered.length === 0 ? (
          <p className="text-center py-8 font-sans text-sm text-ink-mute">
            Nenhuma seleção encontrada
          </p>
        ) : (
          filtered.map((t) => {
            const active = t.code === currentCode;
            return (
              <button
                key={t.code}
                onClick={() => { onSelect(t.code); onClose(); }}
                className="w-full flex items-center gap-3 rounded-xl px-4 text-left min-h-[52px] transition-colors active:scale-[.98]"
                style={{
                  background: active ? "var(--green)" : "var(--elev)",
                  border: "1px solid var(--line)",
                  color: active ? "white" : "var(--ink)",
                }}
              >
                <span
                  className="font-mono font-extrabold text-xs rounded-md px-2 py-1 flex-shrink-0 min-w-[44px] text-center"
                  style={
                    active
                      ? { background: "rgba(255,255,255,0.22)", color: "white" }
                      : { background: "var(--bg)", color: "var(--ink-mute)" }
                  }
                >
                  {t.code}
                </span>
                <span className="font-display font-semibold text-base flex-1 truncate">
                  {t.name}
                </span>
                {active && <Check size={18} strokeWidth={2.5} className="shrink-0" />}
              </button>
            );
          })
        )}
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
  const [selectedTeamCode, setSelectedTeamCode] = useState<string | null>(null);
  // Open picker immediately on mount — user must choose a team first
  const [pickerOpen, setPickerOpen] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const pending = useRef(new Set<string>());

  // Derive sorted unique team list from stickers
  const teams = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    for (const s of stickers) {
      if (!map.has(s.teamCode)) map.set(s.teamCode, { code: s.teamCode, name: s.teamName });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [stickers]);

  const selectedTeam = selectedTeamCode ? (teams.find((t) => t.code === selectedTeamCode) ?? null) : null;

  // Live preview: team + number → unique sticker
  const preview = useMemo(() => {
    if (!selectedTeamCode || !digits) return null;
    const num = parseInt(digits, 10);
    if (isNaN(num) || num < 1) return null;
    return stickers.find((s) => s.teamCode === selectedTeamCode && s.number === num) ?? null;
  }, [selectedTeamCode, digits, stickers]);

  const handleKey = useCallback(
    async (k: string) => {
      if (k === "⌫") {
        setDigits((d) => d.slice(0, -1));
        return;
      }
      if (k === "✓") {
        if (!preview) return;
        const sticker = preview;
        if (pending.current.has(sticker.id)) return;

        const wasNew = sticker.owned_count === 0;
        const newCount = sticker.owned_count + 1;
        const entryKey = `${sticker.id}-${Date.now()}`;

        // Optimistic update — keep team, clear number only
        onIncrement(sticker.id);
        setHistory((h) => [
          { key: entryKey, number: sticker.number, label: sticker.label, teamCode: sticker.teamCode, wasNew, count: newCount },
          ...h,
        ].slice(0, 10));
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
          setHistory((h) => h.filter((e) => e.key !== entryKey));
          toast.error(`Erro ao salvar ${sticker.teamCode} #${sticker.number} — tente novamente`);
        } finally {
          pending.current.delete(sticker.id);
        }
        return;
      }
      if (digits.length < 2) {
        setDigits((d) => d + k);
      }
    },
    [preview, digits, collectionId, sourceId, onIncrement, onDecrement]
  );

  // Physical keyboard — disabled when picker is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (pickerOpen) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Enter") { handleKey("✓"); return; }
      if (e.key === "Backspace") { handleKey("⌫"); return; }
      if (/^\d$/.test(e.key)) handleKey(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, handleKey, pickerOpen]);

  return (
    <div data-theme="dark" className="fixed inset-0 z-50 flex flex-col bg-bg text-ink overflow-hidden">

      {/* ── Main register panel ─────────────────────────────────── */}
      {/* Header */}
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
          <p className="font-sans text-xs text-ink-mute">
            Seleção + número do verso da figurinha
          </p>
        </div>
      </div>

      {/* Team row — tappable pill to select/change team */}
      <div className="px-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full flex items-center gap-3 rounded-2xl px-4 min-h-[52px] text-left transition-colors active:opacity-75"
          style={{ background: "var(--elev)", border: selectedTeam ? "1px solid var(--green)" : "1px dashed var(--line)" }}
        >
          {selectedTeam ? (
            <>
              <span
                className="font-mono font-extrabold text-xs rounded-md px-2 py-1 shrink-0"
                style={{ background: "var(--green)", color: "white" }}
              >
                {selectedTeam.code}
              </span>
              <span className="font-display font-bold text-base text-ink flex-1 truncate">
                {selectedTeam.name}
              </span>
              <span className="font-sans text-xs text-ink-mute shrink-0">Trocar</span>
            </>
          ) : (
            <>
              <span className="font-sans font-semibold text-base text-ink-mute flex-1">
                Escolher seleção…
              </span>
              <span className="font-mono text-ink-mute text-sm">→</span>
            </>
          )}
        </button>
      </div>

      <SourcePicker sources={sources} value={sourceId} onChange={setSourceId} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Number display */}
      <NumDisplay digits={digits} />

      {/* Live preview — fixed height keeps layout stable */}
      <div className="h-14 flex items-center justify-center px-5 flex-shrink-0">
        {preview ? (
          <div className="flex items-center gap-3 w-full max-w-sm">
            <span
              className="font-mono font-extrabold text-xs rounded-md px-2 py-1 flex-shrink-0"
              style={{ background: "var(--elev)", border: "1px solid var(--line)", color: "var(--ink-mute)" }}
            >
              {preview.teamCode} #{preview.number}
            </span>
            <span className="font-sans font-semibold text-sm text-ink truncate flex-1 min-w-0">
              {preview.label}
            </span>
            {preview.owned_count === 0 ? (
              <span
                className="font-display font-extrabold text-xs rounded-full px-3 py-1 flex-shrink-0 whitespace-nowrap"
                style={{ background: "var(--green)", color: "white" }}
              >
                FALTAVA!
              </span>
            ) : (
              <span
                className="font-display font-extrabold text-xs rounded-full px-3 py-1 flex-shrink-0 whitespace-nowrap"
                style={{ background: "var(--magenta)", color: "white" }}
              >
                JÁ TENHO ×{preview.owned_count}
              </span>
            )}
          </div>
        ) : selectedTeamCode && digits.length > 0 ? (
          <p className="font-sans text-sm text-ink-mute">
            {selectedTeamCode} #{digits} — número não encontrado
          </p>
        ) : !selectedTeamCode ? (
          <p className="font-sans text-sm text-ink-mute">
            Selecione uma seleção para começar
          </p>
        ) : null}
      </div>

      {/* Keypad — confirm only when preview has a valid sticker */}
      <Keypad onKey={handleKey} canConfirm={preview !== null} />

      {/* Session history */}
      {history.length > 0 && (
        <div className="flex-shrink-0 px-4 pt-2 pb-1">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-ink-mute mb-1.5">
            Acabei de marcar
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {history.map((e) => (
              <div
                key={e.key}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2"
                style={{ background: "var(--elev)", border: "1px solid var(--line)" }}
              >
                <span className="font-mono text-[11px] text-ink-mute flex-shrink-0">
                  {e.teamCode}·{e.number}
                </span>
                <span className="font-sans text-xs text-ink truncate max-w-[80px]">
                  {e.label}
                </span>
                {e.wasNew ? (
                  <span
                    className="font-display font-extrabold text-[10px] rounded-full px-2 py-0.5 flex-shrink-0"
                    style={{ background: "var(--green)", color: "white" }}
                  >
                    NOVA
                  </span>
                ) : (
                  <span
                    className="font-mono font-extrabold text-[10px] rounded-full px-2 py-0.5 flex-shrink-0"
                    style={{ background: "var(--magenta)", color: "white" }}
                  >
                    ×{e.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-6 flex-shrink-0" />

      {/* ── Team picker panel — absolute overlay ─────────────── */}
      {pickerOpen && (
        <TeamPickerPanel
          teams={teams}
          currentCode={selectedTeamCode}
          onSelect={setSelectedTeamCode}
          onClose={() => setPickerOpen(false)}
        />
      )}
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
  const [scannerOpen, setScannerOpen] = useState(false);

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

      {/* FABs — camera scan + manual register */}
      {!registerOpen && !scannerOpen && (
        <div className="fixed bottom-24 left-0 right-0 z-30 flex justify-center gap-3 px-4">
          <button
            onClick={() => setScannerOpen(true)}
            className="h-14 px-5 rounded-full font-display font-semibold text-sm text-ink flex items-center gap-2 shadow-ground active:scale-95 transition-transform"
            style={{ background: "var(--elev)", border: "1px solid var(--line)" }}
            aria-label="Registrar com câmera"
          >
            <Camera size={18} strokeWidth={2} />
            Câmera
          </button>
          <button
            onClick={() => setRegisterOpen(true)}
            className="h-14 px-6 rounded-full font-display font-bold text-base text-white flex items-center gap-2 shadow-ground active:scale-95 transition-transform"
            style={{ background: "var(--green)" }}
            aria-label="Registrar com teclado"
          >
            Registrar
          </button>
        </div>
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

      {scannerOpen && (
        <CameraScanner
          collectionId={collectionId}
          stickers={stickers}
          onClose={() => setScannerOpen(false)}
          onSwitchToManual={() => { setScannerOpen(false); setRegisterOpen(true); }}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      )}
    </>
  );
}
