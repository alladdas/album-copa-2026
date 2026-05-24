import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlbumClient } from "@/components/album/AlbumClient";
import type { Team, Sticker } from "@/types/database";

export default async function AlbumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!collection) redirect("/");

  const [teamsRes, stickersRes] = await Promise.all([
    supabase
      .from("teams")
      .select("*")
      .eq("collection_id", collection.id)
      .order("order_index"),
    supabase
      .from("stickers")
      .select("*")
      .eq("collection_id", collection.id)
      .order("number"),
  ]);

  if (teamsRes.error) throw teamsRes.error;
  if (stickersRes.error) throw stickersRes.error;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <AlbumClient
        teams={(teamsRes.data ?? []) as Team[]}
        stickers={(stickersRes.data ?? []) as Sticker[]}
      />
    </div>
  );
}
