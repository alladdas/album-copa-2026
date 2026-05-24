import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FirstAccessClient } from "@/components/FirstAccessClient";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: collection } = await supabase
    .from("collections")
    .select("id, name, total_stickers")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!collection) {
    return <FirstAccessClient userId={user.id} />;
  }

  // Dashboard placeholder (Fase 5)
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-5 py-10 gap-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl text-ink">🏆 Álbum Copa 2026</h1>
          <p className="text-ink-mute text-sm mt-1">{collection.name}</p>
        </div>

        <div
          className="rounded-xl p-5 space-y-2 bg-elev shadow-md"
          style={{ border: "1px solid var(--line)" }}
        >
          <p className="font-display font-bold text-ink">Dashboard em breve</p>
          <p className="text-sm text-ink-mute">
            O painel completo com estatísticas, gráficos e projeção chega na Fase 5.
            Use o menu abaixo para navegar.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/album",   icon: "📒", label: "Meu Álbum" },
            { href: "/banca",   icon: "🏪", label: "Modo Banca" },
            { href: "/trocas",  icon: "🔄", label: "Trocas" },
            { href: "/financas",icon: "💰", label: "Gastos" },
          ].map(({ href, icon, label }) => (
            <a
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-2 rounded-xl py-5 bg-elev shadow-sm hover:bg-sunken transition-colors"
              style={{ border: "1px solid var(--line)" }}
            >
              <span className="text-3xl">{icon}</span>
              <span className="font-display font-semibold text-sm text-ink">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
