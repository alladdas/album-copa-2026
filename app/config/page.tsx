import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConfigClient } from "@/components/config/ConfigClient";
import type { Collection, Sticker, Team } from "@/types/database";

export default async function ConfigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!collection) redirect("/");

  const [teamsRes, stickersRes] = await Promise.all([
    supabase
      .from("teams")
      .select("id, code, name, order_index")
      .eq("collection_id", collection.id)
      .order("order_index"),
    supabase
      .from("stickers")
      .select("id, number, label, team_id, is_foil, sticker_type")
      .eq("collection_id", collection.id)
      .order("number"),
  ]);

  return (
    <ConfigClient
      collection={collection as Collection}
      teams={(teamsRes.data ?? []) as Team[]}
      stickers={(stickersRes.data ?? []) as Sticker[]}
    />
  );
}
