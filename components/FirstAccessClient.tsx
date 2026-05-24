"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  userId: string;
}

const STEPS = [
  { icon: "📦", text: "48 seleções com jogadores reais já cadastrados" },
  { icon: "🔢", text: "980 figurinhas numeradas prontas para colecionar" },
  { icon: "📊", text: "Controle de gastos, trocas e progresso em tempo real" },
];

export function FirstAccessClient({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function criarAlbum() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("seed_copa_2026", { p_user_id: userId });
      if (error) throw error;
      toast.success("Álbum criado com 980 figurinhas!");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao criar álbum: ${msg}`);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-5 py-10">
      {/* Orange/gold gradient card */}
      <div
        className="w-full max-w-sm rounded-xl p-6 text-white space-y-5 shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--sunset) 0%, var(--gold) 100%)",
          boxShadow: "0 2px 0 var(--gold-700), 0 12px 32px rgba(242,120,61,.35)",
        }}
      >
        <div className="text-center space-y-2">
          <div className="text-5xl">📒</div>
          <h1 className="font-display font-bold text-2xl">Bem-vindo!</h1>
          <p className="text-sm text-white/80">
            Crie seu álbum digital com todas as figurinhas da Copa 2026.
          </p>
        </div>

        <ol className="space-y-3">
          {STEPS.map(({ icon, text }, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-xl leading-tight">{icon}</span>
              <span className="text-sm text-white/90 leading-snug">{text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 w-full max-w-sm space-y-3">
        <Button
          variant="primary"
          full
          size="lg"
          onClick={criarAlbum}
          disabled={loading}
        >
          {loading ? "Criando seu álbum..." : "Criar meu álbum Copa 2026"}
        </Button>

        {loading && (
          <p className="text-xs text-ink-mute text-center animate-pulse">
            Carregando 980 figurinhas, aguarde...
          </p>
        )}
      </div>
    </div>
  );
}
