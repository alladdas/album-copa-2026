// Tipos gerados a partir do schema Supabase (supabase/schema.sql)
// Serão completados na Fase 2

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          total_stickers: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["collections"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["collections"]["Insert"]>;
      };
      teams: {
        Row: {
          id: string;
          user_id: string;
          collection_id: string;
          name: string;
          code: string;
          kind: "team" | "special" | "coca_cola";
          order_index: number;
        };
        Insert: Omit<Database["public"]["Tables"]["teams"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
      };
      stickers: {
        Row: {
          id: string;
          user_id: string;
          collection_id: string;
          team_id: string;
          number: number;
          label: string;
          sticker_type: StickerType;
          is_foil: boolean;
          owned_count: number;
          notes: string | null;
          image_url: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["stickers"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["stickers"]["Insert"]>;
      };
      sources: {
        Row: {
          id: string;
          user_id: string;
          collection_id: string;
          name: string;
          kind: SourceKind;
        };
        Insert: Omit<Database["public"]["Tables"]["sources"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["sources"]["Insert"]>;
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          collection_id: string;
          date: string;
          description: string;
          packs: number;
          stickers_count: number;
          amount_cents: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["purchases"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["purchases"]["Insert"]>;
      };
      acquisitions: {
        Row: {
          id: string;
          user_id: string;
          collection_id: string;
          sticker_id: string;
          source_id: string | null;
          purchase_id: string | null;
          was_new: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["acquisitions"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["acquisitions"]["Insert"]>;
      };
      trade_log: {
        Row: {
          id: string;
          user_id: string;
          collection_id: string;
          date: string;
          gave_numbers: number[];
          got_numbers: number[];
          partner: string | null;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["trade_log"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["trade_log"]["Insert"]>;
      };
    };
    Views: {
      v_source_stats: {
        Row: {
          source_id: string;
          source_name: string;
          kind: SourceKind;
          total: number;
          new_count: number;
          duplicates: number;
          efficiency_pct: number;
        };
      };
    };
    Functions: {
      seed_copa_2026: {
        Args: { p_user_id: string };
        Returns: string;
      };
    };
  };
}

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

// Tipos de conveniência
export type Collection = Database["public"]["Tables"]["collections"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Sticker = Database["public"]["Tables"]["stickers"]["Row"];
export type Source = Database["public"]["Tables"]["sources"]["Row"];
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
export type Acquisition = Database["public"]["Tables"]["acquisitions"]["Row"];
export type TradeLog = Database["public"]["Tables"]["trade_log"]["Row"];
export type SourceStats = Database["public"]["Views"]["v_source_stats"]["Row"];
