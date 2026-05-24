"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-4xl">📬</div>
        <p className="font-semibold text-lg">Verifique seu e-mail!</p>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de acesso para <strong>{email}</strong>.
          <br />
          Clique no link para entrar no app.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => { setSent(false); setEmail(""); }}
        >
          Usar outro e-mail
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {linkError === "link_invalido" && (
        <p className="text-sm text-destructive text-center">
          Link inválido ou expirado. Solicite um novo.
        </p>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          inputMode="email"
          className="h-12 text-base"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={loading || !email}
      >
        {loading ? "Enviando..." : "Entrar com magic link"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Você receberá um link no e-mail para entrar sem senha.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-2xl font-bold">Álbum Copa 2026</h1>
          <p className="text-sm text-muted-foreground">
            Figurinhas Panini Copa do Mundo FIFA
          </p>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Entrar</CardTitle>
            <CardDescription>
              Digite seu e-mail para receber o link de acesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
