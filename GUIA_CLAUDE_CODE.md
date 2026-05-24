# 🤖 GUIA DE EXECUÇÃO NO CLAUDE CODE — Album Tracker Copa 2026

Este guia tem **prompts prontos** para colar no Claude Code, em ordem. A ideia é
que o Claude Code faça ~95% sozinho. Sua intervenção manual está marcada com 🙋.

> **Antes de começar:** crie uma pasta vazia, coloque o arquivo `PROJECT.md`
> dentro dela, abra essa pasta no VS Code e rode o Claude Code ali (`claude`).

---

## 🙋 PASSO 0 — Criar projeto no Supabase (você faz, ~5 min)

1. Acesse https://supabase.com → New Project.
2. Nome: `album-copa-2026`. Defina uma senha de banco (anote).
3. Região: escolha "South America (São Paulo)".
4. Após criar, vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key**
5. Guarde — você vai colar no `.env.local` no Passo 2.
6. Em **Authentication → Providers**, deixe "Email" ativado (magic link).

> Não rode SQL ainda. O Claude Code vai gerar o `schema.sql` e o `seed.sql`
> na Fase 2, e aí você cola no **SQL Editor** do Supabase.

---

## FASE 1 — Bootstrap do projeto

Cole no Claude Code:

```
Leia o arquivo PROJECT.md por completo. Ele é a especificação oficial e a fonte
da verdade deste projeto — siga-o à risca em todas as fases.

Nesta Fase 1, faça o bootstrap do projeto:
1. Crie um app Next.js 14 (App Router) com TypeScript e Tailwind, na pasta atual.
2. Instale e configure: @supabase/supabase-js, @supabase/ssr, shadcn/ui,
   lucide-react, recharts.
3. Configure shadcn/ui e adicione os componentes base que vamos usar
   (button, card, input, dialog, tabs, progress, badge, sonner/toast).
4. Crie a estrutura de pastas: app/ (rotas), components/, lib/ (incl.
   lib/supabase client + server), types/.
5. Crie um .env.local.example com NEXT_PUBLIC_SUPABASE_URL e
   NEXT_PUBLIC_SUPABASE_ANON_KEY.
6. Configure o tema mobile-first em pt-BR e um layout com bottom navigation
   (Home, Álbum, Banca, Trocas, $) — pode deixar as páginas como placeholders.
7. Garanta que `npm run dev` sobe sem erros.

Ao final, me mostre a árvore de arquivos e confirme que compila.
```

---

## FASE 2 — Banco de dados  🙋 você roda os SQLs prontos

> ⚡ O `schema.sql` e o `seed_data.sql` **já estão prontos** (entregues nesta
> pasta). Você não precisa pedir pro Claude Code gerá-los. Só faça o seguinte:

🙋 **Sua ação no Supabase:**
1. Abra o **SQL Editor** → New query → cole TODO o `supabase/schema.sql` → **Run**.
2. New query → cole TODO o `supabase/seed_data.sql` → **Run** (cria a função `seed_copa_2026`).
3. Em **Table Editor**, confirme que as tabelas apareceram (ainda vazias de figurinhas
   — elas são criadas por usuário quando você logar e clicar em "Criar meu álbum").
4. Em **Storage**, crie um bucket público chamado `sticker-photos` (para as fotos
   próprias das figurinhas, feature opcional).

🙋 **Sua ação no projeto:** crie `.env.local` (copie do `.env.local.example`) e
cole sua Project URL + anon key do Passo 0.

Depois, cole no Claude Code:

```
Os arquivos supabase/schema.sql e supabase/seed_data.sql JÁ existem e já foram
rodados no Supabase por mim. NÃO os recrie. Baseando-se no esquema deles
(tabelas: collections, teams, stickers, sources, purchases, acquisitions,
trade_log, e a view v_source_stats; função seed_copa_2026(uuid)):

1. Gere os tipos TypeScript em types/database.ts compatíveis com esse esquema.
2. Crie lib/queries.ts com funções tipadas: getDashboardStats, getTeams,
   getStickersByTeam, incrementOwned, decrementOwned, getMissing, getDuplicates,
   listPurchases, addPurchase, listSources, addSource, recordAcquisition,
   getSourceStats (lê v_source_stats), exportCollection, importCollection.
3. Garanta que a criação do álbum no primeiro acesso chame a função
   seed_copa_2026 via rpc do supabase-js.

Leia o PROJECT.md para os detalhes de cada função.
```

---

## FASE 3 — Autenticação + criação do álbum

```
Implemente, seguindo as seções 5.1 do PROJECT.md:
1. Login com Supabase Auth via magic link (e-mail). Páginas de login e callback.
2. Middleware de sessão (@supabase/ssr) protegendo as rotas internas.
3. Tela de "primeiro acesso": se o usuário logado ainda não tem collection,
   mostrar botão "Criar meu álbum Copa 2026" que chama o seed (a função
   seed_copa_2026 ou insere via queries) e redireciona pro dashboard.
4. Logout.

Teste o fluxo completo e me diga como testar localmente.
```

🙋 Faça login com seu e-mail, clique no magic link, e crie o álbum.

---

## FASE 4 — Álbum (grid) + tap rápido  ⭐ coração do app

```
Implemente a tela de Álbum, seção 5.3 do PROJECT.md:
1. Chips de seleção/seção no topo (filtra por team).
2. Grid de números, célula colorida por status (cinza=falta, verde=tenho,
   badge "x2/x3" para repetidas).
3. Tap rápido com atualização OTIMISTA:
   - tap em falta → owned_count 0→1
   - tap em tenho → incrementa repetida
   - long-press ou botão "−" → decrementa
   Atualiza a UI na hora e persiste no Supabase; reverte se a chamada falhar.
4. Busca por número (input numérico grande) e filtros (status, tipo).
Garanta que é confortável de usar com uma mão no celular.
```

---

## FASE 5 — Dashboard + finanças

```
Implemente o Dashboard (5.2) e a tela de Finanças (5.6) do PROJECT.md:
1. Dashboard: cards de % completo, faltam, repetidas, total gasto, custo médio
   por figurinha, projeção pra fechar o álbum. Gráfico recharts de gasto
   acumulado no tempo + progresso.
2. Finanças: CRUD de purchases (form rápido: data, descrição, pacotes, valor em
   R$). stickers_count = packs*7 (editável). Resumo com totais e custo médio
   por pacote e por figurinha.
Use as funções de lib/queries.ts; crie as que faltarem.
```

---

## FASE 6 — Modo Banca + Trocas + Origens

```
Implemente o Modo Banca (5.4), Trocas (5.5) e Origens (5.6b) do PROJECT.md:
1. Modo Banca: tela cheia alto contraste, toggle "FALTAM" / "REPETIDAS" com
   números grandes; campo de "registrar" rápido pra somar figurinhas em
   sequência. Ao registrar, permitir escolher a origem (source); cada figurinha
   registrada grava uma acquisition com was_new (era nova naquele momento?).
2. Trocas: listas de repetidas (com qtd) e faltantes; botão "Gerar lista de
   troca" que monta o texto pro WhatsApp (formato do PROJECT.md) com botões
   Copiar e Compartilhar (Web Share API).
3. Origens: CRUD de sources + tela de ranking que lê a view v_source_stats
   (total obtidas, novas, repetidas, % de aproveitamento por local) com gráfico
   de barras comparando bancas/pontos de venda.
4. (Opcional) registrar troca no trade_log.
```

---

## FASE 7 — PWA + Configurações + revelar + polish

```
Finalize, seguindo seções 5.3b, 5.7, 5.8 e 6 do PROJECT.md:
1. Mecânica "bloqueado → revela": card embaçado (cor do time + número + nome)
   quando owned_count=0; ao marcar tenho, anima desembaçando (blur→nítido). Se
   houver image_url mostra a foto; senão, fica o card colorido nítido. A animação
   NÃO depende de imagem.
2. PWA: manifest.json + service worker, ícones, instalável no celular.
3. Configurações: editar nome do álbum, editar figurinhas (rótulos/nomes),
   Export/Import JSON do acervo, logout.
4. Polish mobile: feedback otimista, toasts, loading/empty states, toque >=44px.
5. Atualize o README com setup do Supabase, .env e deploy na Vercel.
Rode o checklist final contra a "Definição de pronto" (seção 8).

NÃO implemente ainda a seção 5.8 (imagens reais via foto/import de PDF) — é
opcional e futura. Deixe o image_url no schema (já existe) e o app funcionando
100% sem imagens. Faremos a 5.8 numa fase posterior, separada.
```

## FASE 8 (OPCIONAL / FUTURA) — Imagens reais das figurinhas

> Só faça quando o app já estiver redondo e você quiser o enfeite das imagens.

```
Implemente a seção 5.8 do PROJECT.md, começando pela forma mais simples:
1. "Anexar foto ao marcar tenho": botão de câmera/upload no card da figurinha
   que envia a imagem para o bucket sticker-photos do Storage e grava image_url.
2. (Se quiser depois) Tela de importação assistida de PDF: renderizar páginas
   com pdf.js, grade ajustável por página, recorte em canvas, preview de
   conferência ao lado do número/nome esperado, upload pro Storage.
As imagens ficam no Storage pessoal; não embuta nenhuma arte no repositório.
```

---

## 🙋 PASSO FINAL — Deploy na Vercel (você faz, ~5 min)

1. Suba o projeto pro GitHub (o Claude Code pode gerar os comandos git).
2. Em https://vercel.com → Import Project → selecione o repo.
3. Em Environment Variables, cole `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. Pegue a URL e, no Supabase → Authentication → URL Configuration,
   adicione a URL da Vercel em "Site URL" e "Redirect URLs" (pro magic link
   funcionar em produção).
5. Abra no celular → "Adicionar à tela inicial" → pronto, app instalado.

---

## Dicas de uso do Claude Code
- Rode uma fase por vez; revise antes de seguir.
- Se algo quebrar, cole o erro e peça pra corrigir — não pule pra próxima fase.
- Sempre que ele divagar, lembre: "siga o PROJECT.md".
- Faça commits ao fim de cada fase (peça pro Claude Code criar a mensagem).
