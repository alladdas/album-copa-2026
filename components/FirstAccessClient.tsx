"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  userId: string;
}

export function FirstAccessClient({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function criarAlbum() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("seed_copa_2026", {
        p_user_id: userId,
      });
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 gap-6">
      <div className="text-center space-y-2">
        <div className="text-6xl mb-4">📒</div>
        <h1 className="text-2xl font-bold">Bem-vindo!</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          Crie seu álbum digital com todas as 980 figurinhas da Copa do Mundo
          2026 já organizadas — 48 seleções mais os especiais.
        </p>
      </div>

      <Button
        size="lg"
        className="w-full max-w-xs h-14 text-base font-semibold"
        onClick={criarAlbum}
        disabled={loading}
      >
        {loading ? "Criando seu álbum..." : "🏆 Criar meu álbum Copa 2026"}
      </Button>

      {loading && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Carregando 980 figurinhas, aguarde...
        </p>
      )}
    </div>
  );
}
