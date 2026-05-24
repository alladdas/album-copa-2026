"use client";

import { useState, useMemo, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  updateCollectionName,
  updateStickerLabel,
  exportCollection,
  importCollection,
} from "@/lib/queries";
import type { Collection, Sticker, Team, ExportData } from "@/types/database";
import { ChevronLeft, Download, Upload, LogOut, Pencil, Check, X } from "lucide-react";
import Link from "next/link";

interface Props {
  collection: Collection;
  teams: Team[];
  stickers: Sticker[];
}

// ── Small sub-components ──────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-bold text-xs uppercase tracking-widest text-ink-mute mb-2 mt-6 first:mt-0 px-1">
      {children}
    </h2>
  );
}

function SettingsRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl bg-elev px-4 py-3.5 ${className ?? ""}`}
      style={{ border: "1px solid var(--line)" }}
    >
      {children}
    </div>
  );
}

// ── Album name editor ─────────────────────────────────────────────────

function AlbumNameRow({ collection }: { collection: Collection }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(collection.name);
  const [saved, setSaved] = useState(collection.name);
  const [pending, startTransition] = useTransition();

  function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === saved) { setEditing(false); setValue(saved); return; }
    startTransition(async () => {
      try {
        await updateCollectionName(collection.id, trimmed);
        setSaved(trimmed);
        setEditing(false);
        toast.success("Nome atualizado");
      } catch {
        toast.error("Erro ao salvar");
        setValue(saved);
        setEditing(false);
      }
    });
  }

  function cancel() {
    setValue(saved);
    setEditing(false);
  }

  if (editing) {
    return (
      <SettingsRow>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          className="flex-1 bg-transparent font-sans text-base text-ink outline-none"
          maxLength={80}
        />
        <button
          onClick={save}
          disabled={pending}
          aria-label="Confirmar"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-green"
        >
          <Check size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={cancel}
          aria-label="Cancelar"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-mute"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </SettingsRow>
    );
  }

  return (
    <SettingsRow>
      <span className="flex-1 font-sans text-base text-ink truncate">{saved}</span>
      <button
        onClick={() => setEditing(true)}
        aria-label="Editar nome"
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-mute"
      >
        <Pencil size={16} strokeWidth={2} />
      </button>
    </SettingsRow>
  );
}

// ── Sticker label editor row ──────────────────────────────────────────

function StickerLabelRow({
  sticker,
  collectionId,
}: {
  sticker: Sticker;
  collectionId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(sticker.label);
  const [saved, setSaved] = useState(sticker.label);
  const [pending, startTransition] = useTransition();
  const numStr = String(sticker.number).padStart(3, "0");

  function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === saved) { setEditing(false); setValue(saved); return; }
    startTransition(async () => {
      try {
        await updateStickerLabel(sticker.id, collectionId, trimmed);
        setSaved(trimmed);
        setEditing(false);
        toast.success(`#${numStr} atualizada`);
      } catch {
        toast.error("Erro ao salvar");
        setValue(saved);
        setEditing(false);
      }
    });
  }

  function cancel() {
    setValue(saved);
    setEditing(false);
  }

  return (
    <div
      className="flex items-center gap-2 py-2.5 px-4"
      style={{ borderBottom: "1px solid var(--line)" }}
    >
      <span className="font-mono text-xs text-ink-mute w-10 shrink-0">#{numStr}</span>
      {editing ? (
        <>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
            className="flex-1 bg-transparent font-sans text-sm text-ink outline-none min-w-0"
            maxLength={120}
          />
          <button
            onClick={save}
            disabled={pending}
            aria-label="Confirmar"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 text-green"
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={cancel}
            aria-label="Cancelar"
            className="min-w-[36px] min-h-[44px] flex items-center justify-center shrink-0 text-ink-mute"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 font-sans text-sm text-ink truncate min-w-0">{saved}</span>
          <button
            onClick={() => setEditing(true)}
            aria-label="Editar rótulo"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 text-ink-mute"
          >
            <Pencil size={14} strokeWidth={2} />
          </button>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export function ConfigClient({ collection, teams, stickers }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [exportPending, startExport] = useTransition();
  const [importPending, startImport] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const teamById = useMemo(
    () => new Map(teams.map((t) => [t.id, t])),
    [teams]
  );

  const filteredStickers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stickers;
    return stickers.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        String(s.number).includes(q) ||
        (teamById.get(s.team_id)?.code ?? "").toLowerCase().includes(q) ||
        (teamById.get(s.team_id)?.name ?? "").toLowerCase().includes(q)
    );
  }, [search, stickers, teamById]);

  // ── Export ──
  function handleExport() {
    startExport(async () => {
      try {
        const data = await exportCollection(collection.id);
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `album-copa-2026-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Backup exportado");
      } catch {
        toast.error("Erro ao exportar");
      }
    });
  }

  // ── Import ──
  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      startImport(async () => {
        try {
          const data: ExportData = JSON.parse(reader.result as string);
          if (!data.stickers || !Array.isArray(data.stickers)) {
            toast.error("Arquivo inválido");
            return;
          }
          const confirmed = window.confirm(
            `Importar backup de ${data.exportedAt?.slice(0, 10) ?? "data desconhecida"}?\n\nIsso vai sobrescrever os contadores atuais.`
          );
          if (!confirmed) return;
          await importCollection(collection.id, data);
          toast.success("Backup importado com sucesso");
          router.refresh();
        } catch {
          toast.error("Erro ao importar — verifique o arquivo");
        }
      });
    };
    reader.readAsText(file);
  }

  // ── Logout ──
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-bg px-4 pt-safe-top pb-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <Link
          href="/"
          aria-label="Voltar"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-ink"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </Link>
        <h1 className="font-display font-bold text-lg text-ink">Configurações</h1>
      </div>

      <div className="px-4 py-5 space-y-1 pb-24">
        {/* ── Álbum ── */}
        <SectionTitle>Álbum</SectionTitle>
        <AlbumNameRow collection={collection} />

        {/* ── Backup ── */}
        <SectionTitle>Backup</SectionTitle>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            disabled={exportPending}
            className="w-full flex items-center gap-3 rounded-xl bg-elev px-4 py-3.5 text-left min-h-[52px] active:opacity-70 transition-opacity"
            style={{ border: "1px solid var(--line)" }}
          >
            <Download size={18} className="text-green shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="font-sans font-semibold text-sm text-ink">Exportar JSON</p>
              <p className="font-sans text-xs text-ink-mute">Baixa um backup completo da coleção</p>
            </div>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={importPending}
            className="w-full flex items-center gap-3 rounded-xl bg-elev px-4 py-3.5 text-left min-h-[52px] active:opacity-70 transition-opacity"
            style={{ border: "1px solid var(--line)" }}
          >
            <Upload size={18} className="text-sky shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="font-sans font-semibold text-sm text-ink">Importar JSON</p>
              <p className="font-sans text-xs text-ink-mute">Restaura contadores de um backup</p>
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>

        {/* ── Figurinhas ── */}
        <SectionTitle>Figurinhas</SectionTitle>
        <p className="font-sans text-xs text-ink-mute px-1 mb-2">
          Edite nomes/rótulos manualmente. Útil se o seed tiver erros ou variações regionais.
        </p>

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl bg-elev px-3 py-2 mb-2"
          style={{ border: "1px solid var(--line)" }}
        >
          <input
            type="search"
            placeholder="Buscar por nº, nome ou seleção…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent font-sans text-sm text-ink placeholder:text-ink-mute outline-none min-h-[44px]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Limpar busca"
              className="text-ink-mute p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div
          className="rounded-xl bg-elev overflow-hidden"
          style={{ border: "1px solid var(--line)" }}
        >
          {filteredStickers.length === 0 ? (
            <p className="py-8 text-center font-sans text-sm text-ink-mute">
              Nenhuma figurinha encontrada
            </p>
          ) : (
            filteredStickers.map((s) => (
              <StickerLabelRow
                key={s.id}
                sticker={s}
                collectionId={collection.id}
              />
            ))
          )}
        </div>

        {/* ── Conta ── */}
        <SectionTitle>Conta</SectionTitle>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl bg-elev px-4 py-3.5 text-left min-h-[52px] active:opacity-70 transition-opacity"
          style={{ border: "1px solid var(--line)" }}
        >
          <LogOut size={18} className="text-magenta shrink-0" strokeWidth={2} />
          <span className="font-sans font-semibold text-sm text-magenta">Sair da conta</span>
        </button>
      </div>
    </div>
  );
}
