# 📒 Album Tracker — Copa do Mundo 2026 (Panini)

App pessoal (mobile-first / PWA) para controle total da coleção de figurinhas do
álbum oficial Panini da Copa 2026: o que tenho, o que falta, repetidas, gasto,
trocas e origem das figurinhas. Uso individual.

> Construído com Next.js + Supabase. Pensado para ser desenvolvido em fases pelo
> Claude Code — veja `GUIA_CLAUDE_CODE.md`.

## Stack
Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Supabase (Postgres +
Auth + Storage + RLS) · recharts · PWA · Deploy na Vercel.

## Funcionalidades
- Grid do álbum (980 figurinhas) com status: falta / tenho / repetida.
- Tap rápido (1 toque = tenho; toques extras = repetidas; "−" corrige).
- Dashboard: % completo, faltam, repetidas, total gasto, custo médio/figurinha,
  projeção pra fechar, gráfico de gasto no tempo.
- Modo Banca: tela cheia com "FALTAM" / "REPETIDAS" pra usar em trocas.
- Trocas: gera lista pronta pro WhatsApp (copiar/compartilhar).
- Finanças: registro de compras (data, pacotes, valor, ponto de venda).
- Origens ("dado geek"): ranking de bancas por % de figurinha nova vs. repetida.
- Mecânica "bloqueado → revela" ao marcar que tem.
- Export/Import JSON (backup).
- (Opcional/futuro) Imagens reais das figurinhas via foto no app.

## Setup (passo a passo)

### 1. Pré-requisitos
- Node.js 18+ e npm.
- Conta no Supabase (https://supabase.com) e na Vercel (https://vercel.com).

### 2. Criar projeto no Supabase
1. New Project → nome `album-copa-2026`, região South America (São Paulo).
2. **Project Settings → API**: copie a *Project URL* e a *anon public key*.
3. **Authentication → Providers**: deixe "Email" ativo (login por magic link).
4. **SQL Editor**: rode na ordem:
   - cole e execute `supabase/schema.sql`
   - cole e execute `supabase/seed_data.sql` (cria a função `seed_copa_2026`)
5. **Storage**: crie um bucket público chamado `sticker-photos`
   (usado só na fase opcional de imagens).

### 3. Variáveis de ambiente
Copie `.env.local.example` para `.env.local` e preencha:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4. Rodar localmente
```bash
npm install
npm run dev
```
Abra http://localhost:3000, faça login (magic link no seu e-mail) e clique em
**"Criar meu álbum Copa 2026"** — isso chama `seed_copa_2026` e popula as 980
figurinhas.

### 5. Deploy na Vercel
1. Suba o repositório para o GitHub.
2. Vercel → Import Project → selecione o repo.
3. Em *Environment Variables*, adicione `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. Pegue a URL e, em **Supabase → Authentication → URL Configuration**,
   inclua a URL da Vercel em *Site URL* e *Redirect URLs* (para o magic link
   funcionar em produção).
5. No celular: abra a URL → "Adicionar à tela inicial" → app instalado (PWA).

## Estrutura dos dados
Tabelas: `collections`, `teams`, `stickers`, `sources`, `purchases`,
`acquisitions`, `trade_log` + view `v_source_stats`. Todas com RLS (cada usuário
só vê o que é seu). Detalhes em `PROJECT.md` (seção 4).

## Sobre as imagens das figurinhas
O app funciona 100% sem as artes oficiais (usa cor do time + número + nome). As
artes da Panini/FIFA são de terceiros e **não são embutidas no projeto**. Se
quiser imagens, a fase opcional permite que VOCÊ anexe suas próprias fotos pelo
app, armazenadas no seu Storage pessoal. Ver `PROJECT.md` (seção 5.8).

## Documentos do projeto
- `PROJECT.md` — especificação completa (fonte da verdade).
- `GUIA_CLAUDE_CODE.md` — passo a passo de prompts para o Claude Code.
- `supabase/schema.sql` — esquema do banco (rodar 1º).
- `supabase/seed_data.sql` — popula as 980 figurinhas (rodar 2º).
