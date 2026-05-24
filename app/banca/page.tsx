import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BancaClient } from "@/components/banca/BancaClient";
import type { BancaSticker } from "@/components/banca/BancaClient";
import type { Source } from "@/types/database";

type StickerRow = {
  id: string;
  number: number;
  owned_count: number;
  label: string;
  teams: { code: string; name: string } | null;
};

export default async function BancaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!collection) redirect("/");

  const [stickersRes, sourcesRes] = await Promise.all([
    supabase
      .from("stickers")
      .select("id, number, owned_count, label, teams!left(code, name)")
      .eq("collection_id", collection.id)
      .order("number"),
    supabase
      .from("sources")
      .select("*")
      .eq("collection_id", collection.id)
      .order("name"),
  ]);

  const stickers: BancaSticker[] = ((stickersRes.data ?? []) as unknown as StickerRow[]).map(
    (row) => ({
      id: row.id,
      number: row.number,
      owned_count: row.owned_count,
      label: row.label,
      teamCode: row.teams?.code ?? "SPECIAL",
      teamName: row.teams?.name ?? "Especiais",
    })
  );

  return (
    <BancaClient
      collectionId={collection.id}
      initialStickers={stickers}
      sources={(sourcesRes.data ?? []) as Source[]}
    />
  );
}
