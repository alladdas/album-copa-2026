"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Error message localisation ───────────────────────────────────────
function toAuthError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed"))        return "Confirme seu e-mail antes de entrar.";
  if (msg.includes("User already registered"))    return "Este e-mail já está cadastrado.";
  if (msg.includes("already registered"))         return "Este e-mail já está cadastrado.";
  if (msg.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("Signup requires a valid password")) return "Informe uma senha válida.";
  if (msg.includes("60 seconds"))                 return "Aguarde 60 segundos antes de tentar novamente.";
  if (msg.includes("rate limit") || msg.includes("too many")) return "Muitas tentativas. Aguarde um momento.";
  if (msg.includes("Unable to validate email"))   return "Formato de e-mail inválido.";
  if (msg.includes("weak_password"))              return "Senha fraca. Use pelo menos 6 caracteres.";
  return msg;
}

// ── Reusable sub-components ──────────────────────────────────────────
function ErrorBox({ msg }: { msg: string }) {
  return (
    <p className="text-sm text-magenta bg-magenta-50 rounded-md px-3 py-2 text-center">
      {msg}
    </p>
  );
}

// ── Hero (shared) ────────────────────────────────────────────────────
function Hero() {
  return (
    <div className="text-center space-y-3">
      <div className="mx-auto w-20 h-20 rounded-full bg-green flex items-center justify-center shadow-ground">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-11 h-11">
          <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="2.5" fill="none"/>
          <path d="M24 8 L30 16 L30 26 L24 30 L18 26 L18 16 Z" fill="white" fillOpacity="0.85"/>
          <path d="M24 30 L24 40 M30 26 L38 30 M18 26 L10 30" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h1 className="font-display font-bold text-3xl text-ink">Álbum Copa 2026</h1>
      <p className="text-sm text-ink-soft">Controle sua coleção de figurinhas</p>
    </div>
  );
}

// ── Sign-in form ─────────────────────────────────────────────────────
function SignInForm({ onSwitchView }: { onSwitchView: (v: View) => void }) {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(toAuthError(error.message)); return; }
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display font-bold text-xl text-ink">Entrar</h2>
        <p className="text-sm text-ink-mute">Acesse com e-mail e senha.</p>
      </div>

      {(linkError === "link_invalido") && (
        <ErrorBox msg="Link inválido ou expirado. Solicite um novo." />
      )}
      {error && <ErrorBox msg={error} />}

      <div className="space-y-3">
        <Input
          type="email" placeholder="seu@email.com" required autoComplete="email"
          inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="h-12 text-base bg-elev border-[var(--line-strong)] rounded-md"
        />
        <Input
          type="password" placeholder="Senha" required autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="h-12 text-base bg-elev border-[var(--line-strong)] rounded-md"
        />
      </div>

      <button
        type="button"
        className="text-xs text-ink-mute hover:text-ink underline underline-offset-2"
        onClick={() => onSwitchView("forgot")}
      >
        Esqueci minha senha
      </button>

      <Button type="submit" variant="primary" full size="lg" disabled={loading || !email || !password}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="flex flex-col items-center gap-2 pt-1">
        <button
          type="button"
          className="text-sm text-ink-soft hover:text-ink font-medium"
          onClick={() => onSwitchView("signup")}
        >
          Não tem conta? <span className="text-green font-semibold">Criar conta</span>
        </button>
        <button
          type="button"
          className="text-xs text-ink-mute hover:text-ink underline underline-offset-2"
          onClick={() => onSwitchView("magic")}
        >
          Entrar com link mágico
        </button>
      </div>
    </form>
  );
}

// ── Sign-up form ─────────────────────────────────────────────────────
function SignUpForm({ onSwitchView }: { onSwitchView: (v: View) => void }) {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6)  { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(toAuthError(error.message)); return; }
    // If session was returned → confirmation disabled, user is logged in
    if (data.session) { router.push("/"); return; }
    // Otherwise confirmation e-mail was sent
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="text-5xl">📬</div>
        <p className="font-display font-bold text-xl text-ink">Verifique seu e-mail!</p>
        <p className="text-sm text-ink-soft">
          Enviamos um link de confirmação para <strong className="text-ink">{email}</strong>.
          <br />Clique no link para ativar sua conta.
        </p>
        <button
          type="button"
          className="text-sm text-green font-semibold underline underline-offset-2"
          onClick={() => onSwitchView("signin")}
        >
          Voltar para entrar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display font-bold text-xl text-ink">Criar conta</h2>
        <p className="text-sm text-ink-mute">Crie sua conta com e-mail e senha.</p>
      </div>

      {error && <ErrorBox msg={error} />}

      <div className="space-y-3">
        <Input
          type="email" placeholder="seu@email.com" required autoComplete="email"
          inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="h-12 text-base bg-elev border-[var(--line-strong)] rounded-md"
        />
        <Input
          type="password" placeholder="Senha (mínimo 6 caracteres)" required
          autoComplete="new-password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 text-base bg-elev border-[var(--line-strong)] rounded-md"
        />
        <Input
          type="password" placeholder="Confirmar senha" required
          autoComplete="new-password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="h-12 text-base bg-elev border-[var(--line-strong)] rounded-md"
        />
      </div>

      <Button type="submit" variant="primary" full size="lg"
        disabled={loading || !email || !password || !confirm}
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>

      <div className="flex justify-center">
        <button
          type="button"
          className="text-sm text-ink-soft hover:text-ink font-medium"
          onClick={() => onSwitchView("signin")}
        >
          Já tenho conta — <span className="text-green font-semibold">Entrar</span>
        </button>
      </div>
    </form>
  );
}

// ── Forgot-password form ─────────────────────────────────────────────
function ForgotForm({ onSwitchView }: { onSwitchView: (v: View) => void }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/auth/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (error) { setError(toAuthError(error.message)); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="text-5xl">📧</div>
        <p className="font-display font-bold text-xl text-ink">Link enviado!</p>
        <p className="text-sm text-ink-soft">
          Enviamos um link de recuperação para <strong className="text-ink">{email}</strong>.
          <br />Clique no link para definir uma nova senha.
        </p>
        <button
          type="button"
          className="text-sm text-green font-semibold underline underline-offset-2"
          onClick={() => onSwitchView("signin")}
        >
          Voltar para entrar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display font-bold text-xl text-ink">Recuperar senha</h2>
        <p className="text-sm text-ink-mute">
          Informe seu e-mail para receber um link de recuperação.
        </p>
      </div>

      {error && <ErrorBox msg={error} />}

      <Input
        type="email" placeholder="seu@email.com" required autoComplete="email"
        inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)}
        className="h-12 text-base bg-elev border-[var(--line-strong)] rounded-md"
      />

      <Button type="submit" variant="primary" full size="lg" disabled={loading || !email}>
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </Button>

      <div className="flex justify-center">
        <button
          type="button"
          className="text-sm text-ink-mute hover:text-ink underline underline-offset-2"
          onClick={() => onSwitchView("signin")}
        >
          ← Voltar
        </button>
      </div>
    </form>
  );
}

// ── Magic-link form ──────────────────────────────────────────────────
function MagicForm({ onSwitchView }: { onSwitchView: (v: View) => void }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) { setError(toAuthError(error.message)); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="text-5xl">📬</div>
        <p className="font-display font-bold text-xl text-ink">Verifique seu e-mail!</p>
        <p className="text-sm text-ink-soft">
          Enviamos um link de acesso para <strong className="text-ink">{email}</strong>.
        </p>
        <button
          type="button"
          className="text-sm text-green font-semibold underline underline-offset-2"
          onClick={() => { setSent(false); setEmail(""); }}
        >
          Usar outro e-mail
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display font-bold text-xl text-ink">Link mágico</h2>
        <p className="text-sm text-ink-mute">
          Receba um link de acesso por e-mail, sem precisar de senha.
        </p>
      </div>

      {error && <ErrorBox msg={error} />}

      <Input
        type="email" placeholder="seu@email.com" required autoComplete="email"
        inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)}
        className="h-12 text-base bg-elev border-[var(--line-strong)] rounded-md"
      />

      <Button type="submit" variant="primary" full size="lg" disabled={loading || !email}>
        {loading ? "Enviando..." : "Receber link mágico"}
      </Button>

      <div className="flex justify-center">
        <button
          type="button"
          className="text-sm text-ink-mute hover:text-ink underline underline-offset-2"
          onClick={() => onSwitchView("signin")}
        >
          ← Voltar
        </button>
      </div>
    </form>
  );
}

// ── View tabs ────────────────────────────────────────────────────────
type View = "signin" | "signup" | "forgot" | "magic";

function LoginCard() {
  const [view, setView] = useState<View>("signin");

  const showTabs = view === "signin" || view === "signup";

  return (
    <div
      className="bg-elev rounded-xl shadow-lg p-6"
      style={{ border: "1px solid var(--line)" }}
    >
      {showTabs && (
        <div
          className="flex rounded-lg p-1 mb-5 bg-sunken"
        >
          {(["signin", "signup"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "flex-1 h-9 rounded-md text-sm font-semibold font-display transition-all",
                view === v
                  ? "bg-elev text-ink shadow-sm"
                  : "text-ink-mute hover:text-ink"
              )}
            >
              {v === "signin" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>
      )}

      {view === "signin"  && <SignInForm  onSwitchView={setView} />}
      {view === "signup"  && <SignUpForm  onSwitchView={setView} />}
      {view === "forgot"  && <ForgotForm  onSwitchView={setView} />}
      {view === "magic"   && <MagicForm   onSwitchView={setView} />}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 py-12 bg-bg">
      <div className="w-full max-w-sm space-y-7">
        <Hero />
        <Suspense>
          <LoginCard />
        </Suspense>
      </div>
    </div>
  );
}
