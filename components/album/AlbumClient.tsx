"use client";

import { useState, useMemo, useCallback, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
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

export function AlbumClient({ teams, stickers: initialStickers }: Props) {
  const [stickers, setStickers] = useState<Sticker[]>(initialStickers);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id ?? "");
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
  const selectedTeam = teamsById.get(selectedTeamId);
  const selectedSticker = selectedStickerId
    ? stickers.find((s) => s.id === selectedStickerId) ?? null
    : null;
  const selectedStickerTeam = selectedSticker
    ? teamsById.get(selectedSticker.team_id)
    : undefined;

  const resetAutoClose = useCallback(() => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    autoCloseRef.current = setTimeout(() => setSelectedStickerId(null), STEPPER_TIMEOUT_MS);
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
    } else {
      list = list.filter((s) => s.team_id === selectedTeamId);
    }

    if (statusFilter === "missing")   list = list.filter((s) => s.owned_count === 0);
    else if (statusFilter === "owned") list = list.filter((s) => s.owned_count >= 1);
    else if (statusFilter === "duplicate") list = list.filter((s) => s.owned_count >= 2);

    return list.sort((a, b) => a.number - b.number);
  }, [stickers, selectedTeamId, search, statusFilter]);

  const teamStickers = useMemo(
    () => stickers.filter((s) => s.team_id === selectedTeamId),
    [stickers, selectedTeamId]
  );
  const teamOwned = teamStickers.filter((s) => s.owned_count >= 1).length;
  const teamTotal = teamStickers.length;

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
        revealTimerRef.current = setTimeout(() => setRevealingId(null), REVEAL_DURATION_MS);
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

  const globalMissing  = stickers.filter((s) => s.owned_count === 0).length;
  const globalOwned    = stickers.filter((s) => s.owned_count >= 1).length;
  const globalDup      = stickers.filter((s) => s.owned_count >= 2).length;

  const STATUS_CHIPS: { key: StatusFilter; label: string; count: number; tone?: string }[] = [
    { key: "all",       label: "Tudo",      count: stickers.length },
    { key: "missing",   label: "Falta",     count: globalMissing,  tone: "var(--ink-mute)" },
    { key: "owned",     label: "Tenho",     count: globalOwned,    tone: "var(--green)" },
    { key: "duplicate", label: "Repetida",  count: globalDup,      tone: "var(--magenta)" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ── Search bar ── */}
      <div className="sticky top-0 z-20 bg-bg border-b px-3 pt-3 pb-2 space-y-2" style={{ borderColor: "var(--line)" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" size={16} />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Buscar número ou nome..."
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
              {label} <span className="opacity-70 font-mono text-xs">{count}</span>
            </Chip>
          ))}
        </div>
      </div>

      {/* ── Team chips (horizontal scroll) ── */}
      {!search && (
        <div className="flex gap-2 overflow-x-auto px-3 py-2 scrollbar-none" style={{ borderBottom: "1px solid var(--line)" }}>
          {teams.map((team) => {
            const ts = stickers.filter((s) => s.team_id === team.id);
            const pct = Math.round(
              (ts.filter((s) => s.owned_count >= 1).length / (ts.length || 1)) * 100
            );
            const active = selectedTeamId === team.id;
            return (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors min-w-[56px]",
                  active
                    ? "bg-ink text-ink-invert border-ink"
                    : pct === 100
                    ? "bg-green-50 text-green-700 border-green-50"
                    : "bg-elev text-ink-soft border-[var(--line)]"
                )}
              >
                <span className="font-display font-bold">{team.code}</span>
                <span className="opacity-60 text-[9px] font-mono">{pct}%</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Team header / search result count ── */}
      <div className="px-3 py-2 flex items-center justify-between">
        {search ? (
          <p className="text-sm text-ink-mute">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <p className="font-display font-bold text-sm text-ink">{selectedTeam?.name}</p>
            <Badge variant="secondary" className="text-xs font-mono bg-sunken text-ink-mute border-0">
              {teamOwned}/{teamTotal}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Sticker grid ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-mute">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Nenhuma figurinha encontrada</p>
          </div>
        ) : (
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
        )}
      </div>

      {/* ── Legend ── */}
      <div className="px-3 py-2 flex gap-4 text-[10px] text-ink-mute justify-center" style={{ borderTop: "1px solid var(--line)" }}>
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
    </div>
  );
}
