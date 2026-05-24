import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FirstAccessClient } from "@/components/FirstAccessClient";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verifica se já tem coleção
  const { data: collection } = await supabase
    .from("collections")
    .select("id, name, total_stickers")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!collection) {
    return <FirstAccessClient userId={user.id} />;
  }

  // Coleção existe → placeholder do Dashboard (Fase 5)
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 gap-4">
      <h1 className="text-2xl font-bold text-center">🏆 Álbum Copa 2026</h1>
      <p className="text-muted-foreground text-center text-sm">
        {collection.name}
      </p>
      <p className="text-xs text-muted-foreground mt-4">
        Dashboard completo em breve (Fase 5)
      </p>
    </div>
  );
}
