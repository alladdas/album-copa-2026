import { createClient } from "@/lib/supabase/client";
import type {
  Collection,
  Team,
  Sticker,
  Source,
  Purchase,
  Acquisition,
  SourceStats,
  DashboardStats,
  ExportData,
  InsertSource,
} from "@/types/database";

// ──────────────────────────────────────────────────
// COLEÇÃO — criação no primeiro acesso via RPC
// ──────────────────────────────────────────────────

/** Retorna a coleção existente ou cria uma nova chamando seed_copa_2026 via RPC. */
export async function getOrCreateCollection(
  userId: string
): Promise<Collection> {
  const supabase = createClient();

  // Verifica se já existe
  const { data: existing } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (existing) return existing as Collection;

  // Chama a função seed no Supabase (cria teams + 980 stickers)
  const { data: newId, error } = await supabase.rpc("seed_copa_2026", {
    p_user_id: userId,
  });

  if (error) throw new Error(`Erro ao criar álbum: ${error.message}`);

  const { data: created, error: fetchErr } = await supabase
    .from("collections")
    .select("*")
    .eq("id", newId as string)
    .single();

  if (fetchErr || !created) throw new Error("Coleção criada mas não encontrada");
  return created as Collection;
}

// ──────────────────────────────────────────────────
// DASHBOARD
// ──────────────────────────────────────────────────

export async function getDashboardStats(
  collectionId: string
): Promise<DashboardStats> {
  const supabase = createClient();

  const [stickersRes, purchasesRes] = await Promise.all([
    supabase
      .from("stickers")
      .select("owned_count")
      .eq("collection_id", collectionId),
    supabase
      .from("purchases")
      .select("amount_cents")
      .eq("collection_id", collectionId),
  ]);

  if (stickersRes.error) throw stickersRes.error;
  if (purchasesRes.error) throw purchasesRes.error;

  const stickers = stickersRes.data ?? [];
  const purchases = purchasesRes.data ?? [];

  const totalStickers = stickers.length;
  const owned = stickers.filter((s) => s.owned_count >= 1).length;
  const missing = stickers.filter((s) => s.owned_count === 0).length;
  const duplicates = stickers.reduce(
    (acc, s) => acc + Math.max(0, s.owned_count - 1),
    0
  );
  const totalSpentCents = purchases.reduce(
    (acc, p) => acc + (p.amount_cents ?? 0),
    0
  );

  return {
    totalStickers,
    owned,
    missing,
    duplicates,
    completionPct: totalStickers > 0 ? (owned / totalStickers) * 100 : 0,
    totalSpentCents,
    avgCostPerSticker:
      owned > 0 ? Math.round(totalSpentCents / owned) : null,
  };
}

// ──────────────────────────────────────────────────
// TIMES
// ──────────────────────────────────────────────────

export async function getTeams(collectionId: string): Promise<Team[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("collection_id", collectionId)
    .order("order_index");
  if (error) throw error;
  return (data ?? []) as Team[];
}

// ──────────────────────────────────────────────────
// FIGURINHAS
// ──────────────────────────────────────────────────

export async function getStickersByTeam(teamId: string): Promise<Sticker[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("stickers")
    .select("*")
    .eq("team_id", teamId)
    .order("number");
  if (error) throw error;
  return (data ?? []) as Sticker[];
}

export async function getAllStickers(collectionId: string): Promise<Sticker[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("stickers")
    .select("*")
    .eq("collection_id", collectionId)
    .order("number");
  if (error) throw error;
  return (data ?? []) as Sticker[];
}

/** Incrementa owned_count em +1 e retorna o novo valor. */
export async function incrementOwned(stickerId: string): Promise<number> {
  const supabase = createClient();

  // Lê o valor atual
  const { data: current, error: readErr } = await supabase
    .from("stickers")
    .select("owned_count")
    .eq("id", stickerId)
    .single();

  if (readErr || !current) throw readErr ?? new Error("Figurinha não encontrada");

  const newCount = current.owned_count + 1;

  const { error } = await supabase
    .from("stickers")
    .update({ owned_count: newCount, updated_at: new Date().toISOString() })
    .eq("id", stickerId);

  if (error) throw error;
  return newCount;
}

/** Decrementa owned_count em -1 (mínimo 0). Retorna o novo valor. */
export async function decrementOwned(stickerId: string): Promise<number> {
  const supabase = createClient();

  const { data: current, error: readErr } = await supabase
    .from("stickers")
    .select("owned_count")
    .eq("id", stickerId)
    .single();

  if (readErr || !current) throw readErr ?? new Error("Figurinha não encontrada");

  const newCount = Math.max(0, current.owned_count - 1);

  const { error } = await supabase
    .from("stickers")
    .update({ owned_count: newCount, updated_at: new Date().toISOString() })
    .eq("id", stickerId);

  if (error) throw error;
  return newCount;
}

export async function getMissing(collectionId: string): Promise<Sticker[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("stickers")
    .select("*, teams(name, code, kind)")
    .eq("collection_id", collectionId)
    .eq("owned_count", 0)
    .order("number");
  if (error) throw error;
  return (data ?? []) as unknown as Sticker[];
}

export async function getDuplicates(collectionId: string): Promise<Sticker[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("stickers")
    .select("*, teams(name, code, kind)")
    .eq("collection_id", collectionId)
    .gt("owned_count", 1)
    .order("number");
  if (error) throw error;
  return (data ?? []) as unknown as Sticker[];
}

// ──────────────────────────────────────────────────
// COMPRAS
// ──────────────────────────────────────────────────

export async function listPurchases(collectionId: string): Promise<Purchase[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*, sources(name, kind)")
    .eq("collection_id", collectionId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Purchase[];
}

export interface AddPurchaseInput {
  collectionId: string;
  date: string;
  description?: string;
  packs: number;
  stickersCount: number;
  amountCents: number;
  sourceId?: string;
}

export async function addPurchase(input: AddPurchaseInput): Promise<Purchase> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("purchases")
    .insert({
      user_id: user.id,
      collection_id: input.collectionId,
      source_id: input.sourceId ?? null,
      date: input.date,
      description: input.description ?? null,
      packs: input.packs,
      stickers_count: input.stickersCount,
      amount_cents: input.amountCents,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Purchase;
}

export async function deletePurchase(purchaseId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("purchases")
    .delete()
    .eq("id", purchaseId);
  if (error) throw error;
}

// ──────────────────────────────────────────────────
// ORIGENS (SOURCES)
// ──────────────────────────────────────────────────

export async function listSources(collectionId: string): Promise<Source[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .eq("collection_id", collectionId)
    .order("name");
  if (error) throw error;
  return (data ?? []) as Source[];
}

export async function addSource(
  input: Omit<InsertSource, "user_id">
): Promise<Source> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("sources")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Source;
}

export async function deleteSource(sourceId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("sources")
    .delete()
    .eq("id", sourceId);
  if (error) throw error;
}

// ──────────────────────────────────────────────────
// AQUISIÇÕES
// ──────────────────────────────────────────────────

export interface RecordAcquisitionInput {
  collectionId: string;
  stickerId: string;
  wasNew: boolean;
  sourceId?: string;
  purchaseId?: string;
}

export async function recordAcquisition(
  input: RecordAcquisitionInput
): Promise<Acquisition> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("acquisitions")
    .insert({
      user_id: user.id,
      collection_id: input.collectionId,
      sticker_id: input.stickerId,
      was_new: input.wasNew,
      source_id: input.sourceId ?? null,
      purchase_id: input.purchaseId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Acquisition;
}

// ──────────────────────────────────────────────────
// ESTATÍSTICAS DE ORIGENS (v_source_stats)
// ──────────────────────────────────────────────────

export async function getSourceStats(
  collectionId: string
): Promise<SourceStats[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_source_stats")
    .select("*")
    .eq("collection_id", collectionId)
    .order("total_obtidas", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SourceStats[];
}

// ──────────────────────────────────────────────────
// EXPORT / IMPORT JSON
// ──────────────────────────────────────────────────

export async function exportCollection(
  collectionId: string
): Promise<ExportData> {
  const supabase = createClient();

  const [colRes, stickersRes, purchasesRes] = await Promise.all([
    supabase
      .from("collections")
      .select("name")
      .eq("id", collectionId)
      .single(),
    supabase
      .from("stickers")
      .select("id, number, label, team_id, owned_count, notes, teams(code)")
      .eq("collection_id", collectionId)
      .order("number"),
    supabase
      .from("purchases")
      .select("id, collection_id, source_id, date, description, packs, stickers_count, amount_cents, created_at")
      .eq("collection_id", collectionId)
      .order("date"),
  ]);

  if (colRes.error) throw colRes.error;
  if (stickersRes.error) throw stickersRes.error;
  if (purchasesRes.error) throw purchasesRes.error;

  return {
    exportedAt: new Date().toISOString(),
    collectionName: colRes.data?.name ?? "",
    stickers: (stickersRes.data ?? []).map((s: unknown) => {
      const row = s as {
        id: string;
        number: number;
        label: string;
        owned_count: number;
        notes: string | null;
        teams: { code: string } | null;
      };
      return {
        id: row.id,
        number: row.number,
        label: row.label,
        team_code: row.teams?.code ?? "",
        owned_count: row.owned_count,
        notes: row.notes,
      };
    }),
    purchases: (purchasesRes.data ?? []) as unknown as ExportData["purchases"],
  };
}

export async function updateCollectionName(
  collectionId: string,
  name: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("collections")
    .update({ name })
    .eq("id", collectionId);
  if (error) throw error;
}

export async function updateStickerLabel(
  stickerId: string,
  collectionId: string,
  label: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("stickers")
    .update({ label, updated_at: new Date().toISOString() })
    .eq("id", stickerId)
    .eq("collection_id", collectionId);
  if (error) throw error;
}

export async function importCollection(
  collectionId: string,
  data: ExportData
): Promise<void> {
  const supabase = createClient();

  // Atualiza owned_count de cada figurinha pelo ID
  const updates = data.stickers.map((s) =>
    supabase
      .from("stickers")
      .update({ owned_count: s.owned_count, notes: s.notes, updated_at: new Date().toISOString() })
      .eq("id", s.id)
      .eq("collection_id", collectionId)
  );

  const results = await Promise.all(updates);
  const failed = results.filter((r) => r.error);
  if (failed.length > 0) {
    throw new Error(`${failed.length} figurinha(s) não atualizadas no import`);
  }
}
