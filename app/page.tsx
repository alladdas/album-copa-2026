import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FirstAccessClient } from "@/components/FirstAccessClient";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import type { User } from "@supabase/supabase-js";

// ── Helpers ───────────────────────────────────────────────────────────

function getGreetingName(user: User): string {
  const meta = user.user_metadata ?? {};
  // Try common metadata fields set by providers or by the user
  const fullName: string =
    meta.full_name ?? meta.name ?? meta.display_name ?? "";
  if (fullName.trim()) {
    return fullName.trim().split(/\s+/)[0]; // first name only
  }
  // Fall back to email local-part, capitalised
  const local = (user.email ?? "anônimo").split("@")[0];
  const first = local.split(/[._\-+]/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check for existing collection
  const { data: collection } = await supabase
    .from("collections")
    .select("id, name, total_stickers")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!collection) {
    return <FirstAccessClient userId={user.id} />;
  }

  // ── Parallel data fetching ────────────────────────────────────────
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [stickersRes, purchasesRes, revealedRes] = await Promise.all([
    // Minimal fields for aggregate stats
    supabase
      .from("stickers")
      .select("owned_count")
      .eq("collection_id", collection.id),

    // Purchases for financial totals
    supabase
      .from("purchases")
      .select("amount_cents, packs")
      .eq("collection_id", collection.id),

    // Revealed today with team info (small set)
    supabase
      .from("stickers")
      .select("id, number, label, is_foil, owned_count, teams(code, name)")
      .eq("collection_id", collection.id)
      .gte("owned_count", 1)
      .gte("updated_at", todayStart.toISOString())
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  // ── Aggregate stats ───────────────────────────────────────────────
  const stickers = stickersRes.data ?? [];
  const purchases = purchasesRes.data ?? [];

  const totalStickers = collection.total_stickers ?? 980;
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
  const totalPacks = purchases.reduce((acc, p) => acc + (p.packs ?? 0), 0);
  const avgCostPerStickerCents =
    owned > 0 && totalSpentCents > 0
      ? Math.round(totalSpentCents / owned)
      : null;
  const projectedRemainingCents =
    avgCostPerStickerCents != null
      ? Math.round(missing * avgCostPerStickerCents)
      : null;

  // ── Revealed today ────────────────────────────────────────────────
  type RevealedRow = {
    id: string;
    number: number;
    label: string;
    is_foil: boolean;
    owned_count: number;
    teams: { code: string; name: string } | null;
  };

  const revealedToday = ((revealedRes.data ?? []) as unknown as RevealedRow[]).map(
    (row) => ({
      id: row.id,
      number: row.number,
      label: row.label,
      is_foil: row.is_foil,
      owned_count: row.owned_count,
      teamCode: row.teams?.code ?? "SPECIAL",
      teamName: row.teams?.name ?? "Especiais",
    })
  );

  return (
    <DashboardContent
      userName={getGreetingName(user)}
      collectionName={collection.name}
      totalStickers={totalStickers}
      owned={owned}
      missing={missing}
      duplicates={duplicates}
      totalSpentCents={totalSpentCents}
      totalPacks={totalPacks}
      avgCostPerStickerCents={avgCostPerStickerCents}
      projectedRemainingCents={projectedRemainingCents}
      revealedToday={revealedToday}
    />
  );
}
