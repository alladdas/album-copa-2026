"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function toPasswordError(msg: string): string {
  if (msg.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("New password should be different")) return "A nova senha deve ser diferente da atual.";
  if (msg.includes("weak_password")) return "Senha fraca. Use pelo menos 6 caracteres.";
  return msg;
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6)  { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(toPasswordError(error.message)); return; }
    setDone(true);
    setTimeout(() => router.push("/"), 2000);
  }

  // Waiting for session check
  if (hasSession === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <p className="text-ink-mute text-sm animate-pulse">Verificando sessão...</p>
      </div>
    );
  }

  // No session — link expired or invalid
  if (hasSession === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 bg-bg gap-5">
        <div className="text-5xl">⏱️</div>
        <h1 className="font-display font-bold text-xl text-ink text-center">
          Sessão expirada
        </h1>
        <p className="text-sm text-ink-soft text-center max-w-xs">
          O link de recuperação expirou ou já foi usado. Solicite um novo.
        </p>
        <Button variant="primary" size="md" onClick={() => router.push("/login")}>
          Voltar para o login
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 bg-bg gap-5">
        <div className="text-5xl">✅</div>
        <h1 className="font-display font-bold text-xl text-ink">Senha atualizada!</h1>
        <p className="text-sm text-ink-soft">Redirecionando para o app...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 py-12 bg-bg">
      <div className="w-full max-w-sm space-y-7">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-green flex items-center justify-center shadow-ground">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <path d="M12 2a4 4 0 0 1 4 4v2H8V6a4 4 0 0 1 4-4Z" stroke="white" strokeWidth="2"/>
              <rect x="4" y="8" width="16" height="14" rx="2" fill="white" fillOpacity="0.9"/>
              <circle cx="12" cy="15" r="2" fill="#1FB257"/>
            </svg>
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">Nova senha</h1>
          <p className="text-sm text-ink-soft">Escolha uma senha forte para sua conta.</p>
        </div>

        {/* Form card */}
        <div
          className="bg-elev rounded-xl shadow-lg p-6 space-y-4"
          style={{ border: "1px solid var(--line)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-magenta bg-magenta-50 rounded-md px-3 py-2 text-center">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Nova senha (mínimo 6 caracteres)"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base bg-elev border-[var(--line-strong)] rounded-md"
              />
              <Input
                type="password"
                placeholder="Confirmar nova senha"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 text-base bg-elev border-[var(--line-strong)] rounded-md"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              full
              size="lg"
              disabled={loading || !password || !confirm}
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
