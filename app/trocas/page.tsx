import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrocasClient } from "@/components/trocas/TrocasClient";
import type { TrocasSticker } from "@/components/trocas/TrocasClient";
import type { SourceStats } from "@/types/database";

type StickerRow = {
  id: string;
  number: number;
  owned_count: number;
  label: string;
  teams: { code: string; name: string } | null;
};

export default async function TrocasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: collection } = await supabase
    .from("collections")
    .select("id, name")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!collection) redirect("/");

  const [duplicatesRes, missingRes, sourceStatsRes] = await Promise.all([
    supabase
      .from("stickers")
      .select("id, number, owned_count, label, teams(code, name)")
      .eq("collection_id", collection.id)
      .gt("owned_count", 1)
      .order("number"),
    supabase
      .from("stickers")
      .select("id, number, owned_count, label, teams(code, name)")
      .eq("collection_id", collection.id)
      .eq("owned_count", 0)
      .order("number"),
    supabase
      .from("v_source_stats")
      .select("*")
      .eq("collection_id", collection.id)
      .order("total_obtidas", { ascending: false }),
  ]);

  function toTrocasStickers(rows: StickerRow[]): TrocasSticker[] {
    return rows.map((row) => ({
      id: row.id,
      number: row.number,
      owned_count: row.owned_count,
      label: row.label,
      teamCode: row.teams?.code ?? "SPECIAL",
      teamName: row.teams?.name ?? "Especiais",
    }));
  }

  return (
    <TrocasClient
      collectionName={collection.name}
      duplicates={toTrocasStickers(
        (duplicatesRes.data ?? []) as unknown as StickerRow[]
      )}
      missing={toTrocasStickers(
        (missingRes.data ?? []) as unknown as StickerRow[]
      )}
      sourceStats={(sourceStatsRes.data ?? []) as SourceStats[]}
    />
  );
}
