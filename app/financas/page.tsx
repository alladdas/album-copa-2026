import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FinancasClient } from "@/components/financas/FinancasClient";
import type { PurchaseWithSource } from "@/components/financas/FinancasClient";
import type { Source } from "@/types/database";

export default async function FinancasPage() {
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

  const [purchasesRes, sourcesRes] = await Promise.all([
    supabase
      .from("purchases")
      .select("*, sources(name, kind)")
      .eq("collection_id", collection.id)
      .order("date", { ascending: false }),
    supabase
      .from("sources")
      .select("*")
      .eq("collection_id", collection.id)
      .order("name"),
  ]);

  return (
    <FinancasClient
      collectionId={collection.id}
      initialPurchases={(purchasesRes.data ?? []) as unknown as PurchaseWithSource[]}
      initialSources={(sourcesRes.data ?? []) as Source[]}
    />
  );
}
