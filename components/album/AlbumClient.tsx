"use client";

import { useState, useMemo, useCallback, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Search, X, Check, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { StickerCell } from "@/components/album/StickerCell";
import { StickerStepper } from "@/components/album/StickerStepper";
import { incrementOwned, decrementOwned } from "@/lib/queries";
import type { Team, Sticker } from "@/types/database";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "missing" | "owned" | "duplicate";

const STEPPER_TIMEOUT_MS = 4000;
const REVEAL_DURATION_MS = 420;

interface Props {
  teams: Team[];
  stickers: Sticker[];
}

// ── Team Picker Sheet ───────────────────────────────────────────────────
function TeamPickerSheet({
  teams,
  teamStats,
  selected,
  onToggle,
  onClear,
  onClose,
}: {
  teams: Team[];
  teamStats: Map<string, { owned: number; total: number }>;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");

  const visibleTeams = useMemo(() => {
    if (!q.trim()) return teams;
    const term = q.trim().toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.code.toLowerCase().includes(term)
    );
  }, [teams, q]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative flex flex-col bg-bg rounded-t-3xl"
        style={{
          maxHeight: "88vh",
          boxShadow: "0 -8px 32px rgba(0,0,0,.12)",
        }}
      >
        {/* Handle */}
        <div
          className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full flex-shrink-0"
          style={{ background: "var(--line)" }}
        />

        {/* Header */}
        <div className="px-4 pt-2 pb-2 flex items-center justify-between flex-shrink-0">
          <h2 className="font-display font-bold text-lg text-ink">Seleções</h2>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <button
                onClick={onClear}
                className="font-sans text-sm font-semibold text-ink-mute"
              >
                Limpar
              </button>
            )}
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-elev text-ink-mute"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Search within sheet */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar seleção…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              className="w-full h-9 pl-8 pr-8 rounded-full font-sans text-sm bg-elev text-ink focus:outline-none focus:ring-2 focus:ring-green"
              style={{ border: "1px solid var(--line)" }}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Teams grid */}
        <div className="overflow-y-auto px-4 pb-2 flex-1 min-h-0">
          {visibleTeams.length === 0 ? (
            <p className="text-center py-10 text-sm text-ink-mute">
              Nenhuma seleção encontrada
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 pb-2">
              {visibleTeams.map((team) => {
                const isSelected = selected.has(team.id);
                const stat = teamStats.get(team.id);
                const pct = stat
                  ? Math.round((stat.owned / (stat.total || 1)) * 100)
                  : 0;
                return (
                  <button
                    key={team.id}
                    onClick={() => onToggle(team.id)}
                    className={cn(
                      "relative flex flex-col items-center rounded-xl px-2 py-3 border transition-colors text-center min-h-[76px]",
                      isSelected
                        ? "bg-green-50 border-green-400"
                        : pct === 100
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-elev text-ink border-[var(--line)]"
                    )}
                  >
                    {isSelected && (
                      <Check
                        size={12}
                        strokeWidth={3}
                        className="absolute top-1.5 right-1.5 text-green-600"
                      />
                    )}
                    <span
                      className={cn(
                        "font-display font-bold text-sm",
                        isSelected ? "text-green-800" : ""
                      )}
                    >
                      {team.code}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] leading-tight mt-0.5 line-clamp-2",
                        isSelected ? "text-green-700" : "text-ink-mute"
                      )}
                    >
                      {team.name}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[9px] mt-1",
                        isSelected ? "text-green-600" : "text-ink-mute/60"
                      )}
                    >
                      {stat?.owned ?? 0}/{stat?.total ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm footer */}
        <div
          className="px-4 pt-2 pb-8 flex-shrink-0"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <button
            onClick={onClose}
            className="w-full h-12 rounded-full font-display font-bold text-base text-white"
            style={{ background: "var(--green)" }}
          >
            {selected.size === 0
              ? "Ver todas as seleções"
              : `Ver ${selected.size} seleção${selected.size !== 1 ? "ões" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────
export function AlbumClient({ teams, stickers: initialStickers }: Props) {
  const [stickers, setStickers] = useState<Sticker[]>(initialStickers);
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const pendingRef = useRef<Set<string>>(new Set());
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const teamsById = useMemo(
    () => new Map(teams.map((t) => [t.id, t])),
    [teams]
  );

  // Stable team order index for cross-team sorting
  const teamOrder = useMemo(() => {
    const map = new Map<string, number>();
    teams.forEach((t, i) => map.set(t.id, i));
    return map;
  }, [teams]);

  // Per-team owned/total — updates as stickers change (for badges + sheet)
  const teamStats = useMemo(() => {
    const map = new Map<string, { owned: number; total: number }>();
    for (const s of stickers) {
      const stat = map.get(s.team_id) ?? { owned: 0, total: 0 };
      stat.total++;
      if (s.owned_count >= 1) stat.owned++;
      map.set(s.team_id, stat);
    }
    return map;
  }, [stickers]);

  const toggleTeam = useCallback((id: string) => {
    setSelectedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearTeams = useCallback(() => setSelectedTeams(new Set()), []);

  const selectedSticker = selectedStickerId
    ? stickers.find((s) => s.id === selectedStickerId) ?? null
    : null;
  const selectedStickerTeam = selectedSticker
    ? teamsById.get(selectedSticker.team_id)
    : undefined;

  const resetAutoClose = useCallback(() => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    autoCloseRef.current = setTimeout(
      () => setSelectedStickerId(null),
      STEPPER_TIMEOUT_MS
    );
  }, []);

  const closeStepper = useCallback(() => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    setSelectedStickerId(null);
  }, []);

  useEffect(() => {
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  // Filtered sticker list — team filter or search; status on top
  const filtered = useMemo(() => {
    let list = stickers;

    if (search.trim()) {
      const num = parseInt(search.trim(), 10);
      if (!isNaN(num)) {
        list = list.filter((s) => s.number === num);
      } else {
        const q = search.trim().toLowerCase();
        list = list.filter((s) => s.label.toLowerCase().includes(q));
      }
    } else if (selectedTeams.size > 0) {
      list = list.filter((s) => selectedTeams.has(s.team_id));
    }

    if (statusFilter === "missing") list = list.filter((s) => s.owned_count === 0);
    else if (statusFilter === "owned") list = list.filter((s) => s.owned_count >= 1);
    else if (statusFilter === "duplicate") list = list.filter((s) => s.owned_count >= 2);

    return [...list].sort((a, b) => {
      const oa = teamOrder.get(a.team_id) ?? 0;
      const ob = teamOrder.get(b.team_id) ?? 0;
      if (oa !== ob) return oa - ob;
      return a.number - b.number;
    });
  }, [stickers, selectedTeams, search, statusFilter, teamOrder]);

  // Group filtered stickers by team (null during search → flat grid)
  const groups = useMemo(() => {
    if (search.trim()) return null;
    const map = new Map<string, Sticker[]>();
    for (const s of filtered) {
      const arr = map.get(s.team_id);
      if (arr) arr.push(s);
      else map.set(s.team_id, [s]);
    }
    return Array.from(map.entries())
      .map(([teamId, stks]) => ({ team: teamsById.get(teamId)!, stickers: stks }))
      .filter((g) => g.team !== undefined);
  }, [filtered, search, teamsById]);

  const updateSticker = useCallback(
    (id: string, delta: 1 | -1) => {
      if (pendingRef.current.has(id)) return;

      setStickers((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, owned_count: Math.max(0, s.owned_count + delta) }
            : s
        )
      );
      pendingRef.current.add(id);

      startTransition(async () => {
        try {
          if (delta === 1) {
            await incrementOwned(id);
          } else {
            const current = stickers.find((s) => s.id === id);
            if (!current || current.owned_count <= 0) return;
            await decrementOwned(id);
          }
        } catch {
          setStickers((prev) =>
            prev.map((s) =>
              s.id === id
                ? { ...s, owned_count: Math.max(0, s.owned_count - delta) }
                : s
            )
          );
          toast.error("Erro ao salvar. Tente novamente.");
        } finally {
          pendingRef.current.delete(id);
        }
      });
    },
    [stickers, startTransition]
  );

  const handleSelect = useCallback(
    (sticker: Sticker) => {
      const wasLocked = sticker.owned_count === 0;
      updateSticker(sticker.id, 1);
      setSelectedStickerId(sticker.id);
      if (wasLocked) {
        setRevealingId(sticker.id);
        if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
        revealTimerRef.current = setTimeout(
          () => setRevealingId(null),
          REVEAL_DURATION_MS
        );
      }
      resetAutoClose();
    },
    [updateSticker, resetAutoClose]
  );

  const handleStepperIncrement = useCallback(() => {
    if (!selectedStickerId) return;
    updateSticker(selectedStickerId, 1);
    resetAutoClose();
  }, [selectedStickerId, updateSticker, resetAutoClose]);

  const handleStepperDecrement = useCallback(() => {
    if (!selectedStickerId) return;
    updateSticker(selectedStickerId, -1);
    resetAutoClose();
  }, [selectedStickerId, updateSticker, resetAutoClose]);

  const globalMissing = stickers.filter((s) => s.owned_count === 0).length;
  const globalOwned = stickers.filter((s) => s.owned_count >= 1).length;
  const globalDup = stickers.filter((s) => s.owned_count >= 2).length;

  const STATUS_CHIPS: {
    key: StatusFilter;
    label: string;
    count: number;
    tone?: string;
  }[] = [
    { key: "all", label: "Tudo", count: stickers.length },
    { key: "missing", label: "Falta", count: globalMissing, tone: "var(--ink-mute)" },
    { key: "owned", label: "Tenho", count: globalOwned, tone: "var(--green)" },
    { key: "duplicate", label: "Repetida", count: globalDup, tone: "var(--magenta)" },
  ];

  // Selected teams in stable order (for chip bar)
  const selectedTeamList = useMemo(
    () => teams.filter((t) => selectedTeams.has(t.id)),
    [teams, selectedTeams]
  );

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky header: search + status chips ── */}
      <div
        className="sticky top-0 z-20 bg-bg border-b px-3 pt-3 pb-2 space-y-2"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
            size={16}
          />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Buscar número ou nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 text-base pr-9 bg-elev border-[var(--line)] rounded-md"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {STATUS_CHIPS.map(({ key, label, count, tone }) => (
            <Chip
              key={key}
              active={statusFilter === key}
              tone={tone}
              onClick={() => setStatusFilter(key)}
            >
              {label}{" "}
              <span className="opacity-70 font-mono text-xs">{count}</span>
            </Chip>
          ))}
        </div>
      </div>

      {/* ── Team filter bar (hidden during search) ── */}
      {!search && (
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          {/* Filter button */}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-full font-sans text-sm font-semibold border transition-colors",
              selectedTeams.size > 0
                ? "bg-ink text-ink-invert border-ink"
                : "bg-elev text-ink border-[var(--line)]"
            )}
          >
            <Filter size={13} strokeWidth={2.2} />
            {selectedTeams.size > 0
              ? `${selectedTeams.size} seleção${selectedTeams.size !== 1 ? "ões" : ""}`
              : "Seleções"}
          </button>

          {/* Active team chips + clear */}
          {selectedTeams.size > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 min-w-0">
              {selectedTeamList.map((t) => (
                <Chip
                  key={t.id}
                  active
                  tone="var(--green)"
                  onClick={() => toggleTeam(t.id)}
                  className="flex-shrink-0 gap-1"
                >
                  {t.code}
                  <X size={11} strokeWidth={2.5} className="opacity-80" />
                </Chip>
              ))}
              <button
                onClick={clearTeams}
                className="flex-shrink-0 text-xs text-ink-mute font-semibold whitespace-nowrap pl-1"
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Sticker grid ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-mute">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Nenhuma figurinha encontrada</p>
          </div>
        ) : search.trim() ? (
          // Flat grid during search
          <>
            <p className="py-2 text-sm text-ink-mute">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-4 gap-x-2 gap-y-3.5">
              {filtered.map((sticker) => (
                <StickerCell
                  key={sticker.id}
                  sticker={sticker}
                  team={teamsById.get(sticker.team_id)}
                  isSelected={sticker.id === selectedStickerId}
                  revealing={sticker.id === revealingId}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </>
        ) : (
          // Grouped view — team header sticks while team is in view
          <div className="space-y-1">
            {groups?.map(({ team, stickers: groupStickers }) => {
              const stat = teamStats.get(team.id);
              return (
                <div key={team.id} className="pt-2">
                  <div
                    className="sticky top-0 z-10 bg-bg flex items-center gap-2 py-1.5"
                  >
                    <p className="font-display font-bold text-sm text-ink">
                      {team.name}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono bg-sunken text-ink-mute border-0"
                    >
                      {stat?.owned ?? 0}/{stat?.total ?? 0}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-x-2 gap-y-3.5 pt-1 pb-3">
                    {groupStickers.map((sticker) => (
                      <StickerCell
                        key={sticker.id}
                        sticker={sticker}
                        team={teamsById.get(sticker.team_id)}
                        isSelected={sticker.id === selectedStickerId}
                        revealing={sticker.id === revealingId}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div
        className="px-3 py-2 flex gap-4 text-[10px] text-ink-mute justify-center"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-xs border border-dashed border-ink/30 bg-[#E8DFCB] inline-block" />
          Falta
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-xs bg-team-emerald inline-block" />
          Tenho
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-xs bg-magenta inline-block" />
          Repetida
        </span>
        <span className="text-ink-mute/60">| toque = +1</span>
      </div>

      {/* ── Floating stepper ── */}
      {selectedSticker && (
        <StickerStepper
          sticker={selectedSticker}
          team={selectedStickerTeam}
          onIncrement={handleStepperIncrement}
          onDecrement={handleStepperDecrement}
          onClose={closeStepper}
          onActivity={resetAutoClose}
        />
      )}

      {/* ── Team picker sheet ── */}
      {sheetOpen && (
        <TeamPickerSheet
          teams={teams}
          teamStats={teamStats}
          selected={selectedTeams}
          onToggle={toggleTeam}
          onClear={clearTeams}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
