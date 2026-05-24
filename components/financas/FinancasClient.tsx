"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, Trash2, ChevronDown, X, ShoppingBag } from "lucide-react";
import { addPurchase, deletePurchase, addSource } from "@/lib/queries";
import type { Source, SourceKind } from "@/types/database";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────
export interface PurchaseWithSource {
  id: string;
  user_id: string;
  collection_id: string;
  source_id: string | null;
  date: string;
  description: string | null;
  packs: number;
  stickers_count: number;
  amount_cents: number;
  created_at: string;
  sources?: { name: string; kind: string } | null;
}

// ── Helpers ───────────────────────────────────────────────────────────
function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function parseBRL(value: string): number {
  const cleaned = value.replace(/[^\d,.]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDateShort(dateStr: string): { dayMonth: string; year: string } {
  const [year, month, day] = dateStr.split("-");
  return { dayMonth: `${day}/${month}`, year };
}

const SOURCE_KIND_LABELS: Record<SourceKind, string> = {
  banca: "Banca",
  mercado: "Mercado",
  online: "Online",
  troca: "Troca",
  presente: "Presente",
  outro: "Outro",
};

// ── Summary Card ──────────────────────────────────────────────────────
function SummaryCard({
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
      className="rounded-xl p-4 bg-elev shadow-sm space-y-0.5"
      style={{ border: "1px solid var(--line)" }}
    >
      <p className="font-sans text-[10px] font-semibold uppercase tracking-wide text-ink-mute">
        {label}
      </p>
      <p
        className="font-mono font-extrabold text-lg leading-tight"
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

// ── Purchase Row ──────────────────────────────────────────────────────
function PurchaseRow({
  purchase,
  onDelete,
}: {
  purchase: PurchaseWithSource;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const { dayMonth, year } = formatDateShort(purchase.date);

  return (
    <div
      className="bg-elev rounded-xl px-4 py-3 flex gap-3 items-start"
      style={{ border: "1px solid var(--line)" }}
    >
      {/* Date block */}
      <div className="flex-shrink-0 text-center min-w-[40px]">
        <span
          className="font-mono text-sm font-bold block leading-tight"
          style={{ color: "var(--gold-700)" }}
        >
          {dayMonth}
        </span>
        <span className="font-mono text-[10px] text-ink-mute leading-tight">{year}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {purchase.description ? (
          <p className="font-sans text-sm font-semibold text-ink leading-snug truncate">
            {purchase.description}
          </p>
        ) : (
          <p className="font-sans text-sm font-semibold text-ink leading-snug">
            {purchase.packs} pacote{purchase.packs !== 1 ? "s" : ""}
          </p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0 mt-0.5">
          <span className="font-sans text-xs text-ink-soft">
            {purchase.packs} pct · {purchase.stickers_count} fig.
          </span>
          {purchase.sources && (
            <span className="font-sans text-xs text-ink-mute truncate">
              {purchase.sources.name}
            </span>
          )}
        </div>
      </div>

      {/* Amount + delete */}
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        <span
          className="font-mono font-bold text-base leading-none"
          style={{ color: "var(--gold-700)" }}
        >
          {formatBRL(purchase.amount_cents)}
        </span>
        {confirming ? (
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(purchase.id)}
              className="text-[11px] font-semibold text-magenta hover:underline"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-[11px] font-semibold text-ink-mute hover:underline"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-ink-mute hover:text-magenta p-1 -m-1 rounded transition-colors"
            aria-label="Excluir compra"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── New Purchase Sheet ────────────────────────────────────────────────
interface FormState {
  date: string;
  description: string;
  packs: string;
  stickersCount: string;
  amountStr: string;
  sourceId: string;
  newSourceName: string;
  newSourceKind: string;
}

interface NewPurchaseSheetProps {
  collectionId: string;
  sources: Source[];
  onClose: () => void;
  onSaved: (purchase: PurchaseWithSource, newSource?: Source) => void;
}

function NewPurchaseSheet({
  collectionId,
  sources,
  onClose,
  onSaved,
}: NewPurchaseSheetProps) {
  const [form, setFormState] = useState<FormState>(() => ({
    date: todayStr(),
    description: "",
    packs: "",
    stickersCount: "",
    amountStr: "",
    sourceId: "",
    newSourceName: "",
    newSourceKind: "banca",
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showNewSource = form.sourceId === "__new__";

  function set(key: keyof FormState, value: string) {
    setFormState((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "packs") {
        const n = parseInt(value);
        if (!isNaN(n) && n >= 0) next.stickersCount = String(n * 7);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const packs = parseInt(form.packs) || 0;
    const stickersCount = parseInt(form.stickersCount) || packs * 7;
    const amountCents = parseBRL(form.amountStr);

    if (!form.date) return setError("Informe a data.");
    if (amountCents <= 0) return setError("Informe o valor gasto.");

    setLoading(true);
    try {
      let resolvedSourceId: string | undefined;
      let createdSource: Source | undefined;

      if (showNewSource && form.newSourceName.trim()) {
        createdSource = await addSource({
          collection_id: collectionId,
          name: form.newSourceName.trim(),
          kind: form.newSourceKind as SourceKind,
          notes: null,
        });
        resolvedSourceId = createdSource.id;
      } else if (form.sourceId && form.sourceId !== "__new__") {
        resolvedSourceId = form.sourceId;
      }

      const purchase = await addPurchase({
        collectionId,
        date: form.date,
        description: form.description.trim() || undefined,
        packs,
        stickersCount,
        amountCents,
        sourceId: resolvedSourceId,
      });

      const matchedSource = createdSource ?? sources.find((s) => s.id === resolvedSourceId);
      onSaved(
        {
          ...purchase,
          sources: matchedSource
            ? { name: matchedSource.name, kind: matchedSource.kind }
            : null,
        },
        createdSource
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl px-3 font-sans text-sm text-ink bg-elev placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-green";
  const inputStyle = { border: "1px solid var(--line)" };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-bg rounded-t-2xl shadow-lg overflow-y-auto max-h-[92dvh]"
        style={{ border: "1px solid var(--line)", borderBottom: "none" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-display font-bold text-xl text-ink">Nova Compra</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-sunken text-ink-mute transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-4">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-ink-soft">Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={`${inputCls} h-11`}
              style={inputStyle}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-ink-soft">
              Descrição{" "}
              <span className="font-normal text-ink-mute">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ex: Box 25 pacotes, banca da esquina…"
              className={`${inputCls} h-11`}
              style={inputStyle}
            />
          </div>

          {/* Packs + stickers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink-soft">Pacotes</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={form.packs}
                onChange={(e) => set("packs", e.target.value)}
                placeholder="0"
                className={`${inputCls} h-11 font-mono`}
                style={inputStyle}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink-soft">
                Figurinhas{" "}
                <span className="font-normal text-ink-mute">(×7)</span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={form.stickersCount}
                onChange={(e) => set("stickersCount", e.target.value)}
                placeholder="0"
                className={`${inputCls} h-11 font-mono`}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-ink-soft">
              Valor total (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm font-semibold text-ink-mute select-none">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={form.amountStr}
                onChange={(e) => set("amountStr", e.target.value)}
                placeholder="0,00"
                className={`${inputCls} h-11 font-mono pl-9`}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* Source select */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-ink-soft">
              Ponto de venda{" "}
              <span className="font-normal text-ink-mute">(opcional)</span>
            </label>
            <div className="relative">
              <select
                value={form.sourceId}
                onChange={(e) => set("sourceId", e.target.value)}
                className={`${inputCls} h-11 pr-9 appearance-none`}
                style={inputStyle}
              >
                <option value="">— Nenhum —</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({SOURCE_KIND_LABELS[s.kind]})
                  </option>
                ))}
                <option value="__new__">+ Nova origem…</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
              />
            </div>
          </div>

          {/* Inline new source */}
          {showNewSource && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "var(--sunken)", border: "1px solid var(--line)" }}
            >
              <p className="font-sans text-xs font-semibold text-ink-soft">Nova origem</p>
              <input
                type="text"
                value={form.newSourceName}
                onChange={(e) => set("newSourceName", e.target.value)}
                placeholder="Nome da banca / loja…"
                className="w-full h-10 rounded-lg px-3 font-sans text-sm text-ink bg-elev placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-green"
                style={{ border: "1px solid var(--line)" }}
                autoFocus
              />
              <div className="relative">
                <select
                  value={form.newSourceKind}
                  onChange={(e) => set("newSourceKind", e.target.value)}
                  className="w-full h-10 rounded-lg px-3 pr-9 font-sans text-sm text-ink bg-elev appearance-none focus:outline-none focus:ring-2 focus:ring-green"
                  style={{ border: "1px solid var(--line)" }}
                >
                  {(Object.entries(SOURCE_KIND_LABELS) as [SourceKind, string][]).map(
                    ([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm font-semibold text-center" style={{ color: "var(--magenta)" }}>
              {error}
            </p>
          )}

          <Button type="submit" variant="gold" size="lg" full disabled={loading}>
            {loading ? "Salvando…" : "Salvar Compra"}
          </Button>
        </form>
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export interface FinancasClientProps {
  collectionId: string;
  initialPurchases: PurchaseWithSource[];
  initialSources: Source[];
}

export function FinancasClient({
  collectionId,
  initialPurchases,
  initialSources,
}: FinancasClientProps) {
  const [purchases, setPurchases] = useState<PurchaseWithSource[]>(initialPurchases);
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [showForm, setShowForm] = useState(false);

  const stats = useMemo(() => {
    const totalSpentCents = purchases.reduce((a, p) => a + p.amount_cents, 0);
    const totalPacks = purchases.reduce((a, p) => a + p.packs, 0);
    const totalStickers = purchases.reduce((a, p) => a + p.stickers_count, 0);
    const costPerPack =
      totalPacks > 0 ? Math.round(totalSpentCents / totalPacks) : null;
    const costPerSticker =
      totalStickers > 0 ? Math.round(totalSpentCents / totalStickers) : null;
    return { totalSpentCents, totalPacks, totalStickers, costPerPack, costPerSticker };
  }, [purchases]);

  const handleDelete = useCallback(async (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
    try {
      await deletePurchase(id);
    } catch {
      window.location.reload();
    }
  }, []);

  const handleSaved = useCallback(
    (purchase: PurchaseWithSource, newSource?: Source) => {
      setPurchases((prev) => [purchase, ...prev]);
      if (newSource) {
        setSources((prev) =>
          [...prev, newSource].sort((a, b) => a.name.localeCompare(b.name))
        );
      }
      setShowForm(false);
    },
    []
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-5 pt-14 pb-6 bg-chevrons" style={{ background: "var(--gold)" }}>
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">
          Controle Financeiro
        </p>
        <h1 className="font-display font-bold text-2xl text-white leading-snug">
          Gastos
        </h1>
        <p className="text-white/70 text-sm mt-0.5">
          {stats.totalSpentCents > 0
            ? `${formatBRL(stats.totalSpentCents)} investidos`
            : "Nenhuma compra ainda"}
        </p>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* ── Summary ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5">
          <SummaryCard
            label="Total gasto"
            primary={stats.totalSpentCents > 0 ? formatBRL(stats.totalSpentCents) : "—"}
            secondary={
              stats.totalPacks > 0
                ? `${stats.totalPacks} pacote${stats.totalPacks !== 1 ? "s" : ""}`
                : undefined
            }
            accentColor="var(--gold-700)"
          />
          <SummaryCard
            label="Figurinhas"
            primary={
              stats.totalStickers > 0
                ? stats.totalStickers.toLocaleString("pt-BR")
                : "—"
            }
            secondary={stats.totalStickers > 0 ? "obtidas em compras" : undefined}
            accentColor="var(--sky)"
          />
          <SummaryCard
            label="Custo / pacote"
            primary={stats.costPerPack != null ? formatBRL(stats.costPerPack) : "—"}
            secondary={stats.costPerPack != null ? "médio por pacote" : undefined}
            accentColor="var(--green)"
          />
          <SummaryCard
            label="Custo / figurinha"
            primary={stats.costPerSticker != null ? formatBRL(stats.costPerSticker) : "—"}
            secondary={stats.costPerSticker != null ? "médio por figura" : undefined}
            accentColor="var(--magenta)"
          />
        </div>

        {/* ── Purchases list ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-base text-ink">
              Compras
              {purchases.length > 0 && (
                <span className="font-mono text-sm text-ink-mute font-normal ml-1">
                  ({purchases.length})
                </span>
              )}
            </p>
            <Button variant="gold" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={15} strokeWidth={2.5} />
              Nova compra
            </Button>
          </div>

          {purchases.length === 0 ? (
            <div
              className="rounded-xl py-14 flex flex-col items-center gap-3 bg-elev"
              style={{ border: "1px dashed var(--line)" }}
            >
              <span
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "var(--gold-50)" }}
              >
                <ShoppingBag
                  size={24}
                  strokeWidth={1.8}
                  style={{ color: "var(--gold-700)" }}
                />
              </span>
              <p className="font-sans text-sm text-ink-mute text-center max-w-[220px] leading-relaxed">
                Nenhuma compra registrada ainda.
                <br />
                Adicione sua primeira compra!
              </p>
              <Button
                variant="gold"
                size="sm"
                onClick={() => setShowForm(true)}
                className="mt-1"
              >
                <Plus size={15} strokeWidth={2.5} />
                Nova compra
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {purchases.map((p) => (
                <PurchaseRow key={p.id} purchase={p} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        <div className="h-2" />
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────── */}
      {purchases.length > 0 && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 text-white"
          style={{ background: "var(--gold)" }}
          aria-label="Nova compra"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* ── Form sheet ──────────────────────────────────────────────── */}
      {showForm && (
        <NewPurchaseSheet
          collectionId={collectionId}
          sources={sources}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
