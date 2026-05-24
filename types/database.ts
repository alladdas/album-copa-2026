// Tipos gerados a partir de supabase/schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ──────────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────────

export type TeamKind = "team" | "special" | "coca_cola";

export type StickerType =
  | "player"
  | "crest"
  | "team_photo"
  | "special"
  | "history"
  | "coca_cola"
  | "stadium"
  | "mascot"
  | "trophy"
  | "emblem";

export type SourceKind =
  | "banca"
  | "mercado"
  | "online"
  | "troca"
  | "presente"
  | "outro";

// ──────────────────────────────────────────────────
// Tabelas — Row types (exatamente como vêm do banco)
// ──────────────────────────────────────────────────

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  total_stickers: number;
  created_at: string;
}

export interface Team {
  id: string;
  user_id: string;
  collection_id: string;
  name: string;
  code: string;
  kind: TeamKind;
  order_index: number;
}

export interface Sticker {
  id: string;
  user_id: string;
  collection_id: string;
  team_id: string;
  number: number;
  label: string;
  sticker_type: StickerType;
  is_foil: boolean;
  owned_count: number; // 0=falta, 1=tenho, >=2=repetidas
  image_url: string | null;
  source_id: string | null;
  notes: string | null;
  updated_at: string;
}

export interface Source {
  id: string;
  user_id: string;
  collection_id: string;
  name: string;
  kind: SourceKind;
  notes: string | null;
  created_at: string;
}

export interface Purchase {
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
}

export interface Acquisition {
  id: string;
  user_id: string;
  collection_id: string;
  sticker_id: string;
  source_id: string | null;
  purchase_id: string | null;
  was_new: boolean;
  created_at: string;
}

export interface TradeLog {
  id: string;
  user_id: string;
  collection_id: string;
  date: string;
  partner: string | null;
  gave_numbers: number[];
  got_numbers: number[];
  notes: string | null;
  created_at: string;
}

// ──────────────────────────────────────────────────
// View v_source_stats
// ──────────────────────────────────────────────────

export interface SourceStats {
  source_id: string;
  collection_id: string;
  user_id: string;
  name: string;
  kind: SourceKind;
  total_obtidas: number;
  novas: number;
  repetidas: number;
  pct_aproveitamento: number | null;
}

// ──────────────────────────────────────────────────
// Insert / Update helpers
// ──────────────────────────────────────────────────

export type InsertCollection = Omit<Collection, "id" | "created_at">;
export type InsertTeam = Omit<Team, "id">;
export type InsertSticker = Omit<Sticker, "id" | "updated_at">;
export type InsertSource = Omit<Source, "id" | "created_at">;
export type InsertPurchase = Omit<Purchase, "id" | "created_at">;
export type InsertAcquisition = Omit<Acquisition, "id" | "created_at">;
export type InsertTradeLog = Omit<TradeLog, "id" | "created_at">;

// ──────────────────────────────────────────────────
// Tipos de domínio usados nas queries
// ──────────────────────────────────────────────────

export interface DashboardStats {
  totalStickers: number;   // total no álbum (980)
  owned: number;           // owned_count >= 1
  missing: number;         // owned_count === 0
  duplicates: number;      // soma de (owned_count - 1) onde owned_count > 1
  completionPct: number;   // owned / totalStickers * 100
  totalSpentCents: number; // soma de amount_cents em purchases
  avgCostPerSticker: number | null; // totalSpentCents / owned (centavos)
}

export interface StickerWithTeam extends Sticker {
  teams: Pick<Team, "name" | "code" | "kind">;
}

export interface ExportData {
  exportedAt: string;
  collectionName: string;
  stickers: Array<{
    id: string;
    number: number;
    label: string;
    team_code: string;
    owned_count: number;
    notes: string | null;
  }>;
  purchases: Array<Omit<Purchase, "user_id">>;
}
