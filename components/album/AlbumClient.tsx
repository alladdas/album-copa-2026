"use client";

import { useState, useMemo, useCallback, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StickerCell } from "@/components/album/StickerCell";
import { incrementOwned, decrementOwned } from "@/lib/queries";
import type { Team, Sticker } from "@/types/database";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "missing" | "owned" | "duplicate";

interface Props {
  teams: Team[];
  stickers: Sticker[];
}

export function AlbumClient({ teams, stickers: initialStickers }: Props) {
  const [stickers, setStickers] = useState<Sticker[]>(initialStickers);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [, startTransition] = useTransition();
  const pendingRef = useRef<Set<string>>(new Set());

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  // Filtra stickers conforme team/busca/status
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

    if (statusFilter === "missing") list = list.filter((s) => s.owned_count === 0);
    else if (statusFilter === "owned") list = list.filter((s) => s.owned_count >= 1);
    else if (statusFilter === "duplicate") list = list.filter((s) => s.owned_count >= 2);

    return list.sort((a, b) => a.number - b.number);
  }, [stickers, selectedTeamId, search, statusFilter]);

  // Contadores do time selecionado
  const teamStickers = useMemo(
    () => stickers.filter((s) => s.team_id === selectedTeamId),
    [stickers, selectedTeamId]
  );
  const teamOwned = teamStickers.filter((s) => s.owned_count >= 1).length;
  const teamTotal = teamStickers.length;

  const updateSticker = useCallback(
    (id: string, delta: 1 | -1) => {
      if (pendingRef.current.has(id)) return; // debounce se já está pendente

      // Atualização otimista
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
            // Não decrementa se já está em 0 (otimismo já protege, mas confirma)
            const current = stickers.find((s) => s.id === id);
            if (!current || current.owned_count <= 0) return;
            await decrementOwned(id);
          }
        } catch {
          // Reverte se falhar
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

  const handleIncrement = useCallback((id: string) => updateSticker(id, 1), [updateSticker]);
  const handleDecrement = useCallback((id: string) => updateSticker(id, -1), [updateSticker]);

  // Totais globais para exibir no filtro
  const globalMissing = stickers.filter((s) => s.owned_count === 0).length;
  const globalOwned = stickers.filter((s) => s.owned_count >= 1).length;
  const globalDup = stickers.filter((s) => s.owned_count >= 2).length;

  const statusOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: stickers.length },
    { key: "missing", label: "Faltam", count: globalMissing },
    { key: "owned", label: "Tenho", count: globalOwned },
    { key: "duplicate", label: "Repetidas", count: globalDup },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ── Busca ── */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-3 pt-3 pb-2 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Buscar número ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 text-base pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Filtros de status ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {statusOptions.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={cn(
                "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                statusFilter === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-transparent hover:border-border"
              )}
            >
              {label} <span className="opacity-70">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chips de times ── */}
      {!search && (
        <div className="flex gap-2 overflow-x-auto px-3 py-2 border-b border-border scrollbar-none">
          {teams.map((team) => {
            const ts = stickers.filter((s) => s.team_id === team.id);
            const pct = Math.round(
              (ts.filter((s) => s.owned_count >= 1).length / (ts.length || 1)) * 100
            );
            return (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center rounded-xl px-3 py-1.5 text-xs font-medium border transition-colors min-w-[56px]",
                  selectedTeamId === team.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : pct === 100
                    ? "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-200"
                    : "bg-muted text-muted-foreground border-transparent"
                )}
              >
                <span className="font-bold">{team.code}</span>
                <span className="opacity-60 text-[9px]">{pct}%</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Header do time / resultado de busca ── */}
      <div className="px-3 py-2 flex items-center justify-between">
        {search ? (
          <p className="text-sm text-muted-foreground">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{selectedTeam?.name}</p>
            <Badge variant="secondary" className="text-xs">
              {teamOwned}/{teamTotal}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Grid de figurinhas ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Nenhuma figurinha encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            {filtered.map((sticker) => (
              <StickerCell
                key={sticker.id}
                sticker={sticker}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Legenda ── */}
      <div className="px-3 py-2 border-t border-border flex gap-3 text-[10px] text-muted-foreground justify-center">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-muted border inline-block" /> Falta
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-200 dark:bg-green-900 inline-block" /> Tenho
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-900 inline-block" /> Repetida
        </span>
        <span className="text-muted-foreground/60">| toque=+1 · segure=−1</span>
      </div>
    </div>
  );
}
