# ✅ Checklist de implementação — restyle Album Copa

> Marca progresso conforme implementa. Cada item NÃO toca em lógica de negócio.

## Setup
- [ ] `app/fonts.ts` criado (next/font: Space Grotesk + DM Sans + JetBrains Mono).
- [ ] `app/layout.tsx` aplica `${spaceGrotesk.variable} ${dmSans.variable} ${jetbrains.variable}` no `<html>` e `className="bg-bg text-ink font-sans antialiased"` no `<body>`.
- [ ] `app/globals.css` substituído pelo arquivo do pacote (mantém `@tailwind ...` no topo).
- [ ] `tailwind.config.ts` mesclado com o recorte de `tailwind.config.snippet.ts`.
- [ ] `lib/team-colors.ts` criado.

## Componentes
- [ ] `components/ui/button.tsx` substituído (variantes: primary, gold, secondary, ghost, danger, dark).
- [ ] `components/ui/chip.tsx` criado.
- [ ] `components/ui/progress-album.tsx` criado.
- [ ] `components/sticker-card.tsx` substituído. Tap rápido continua chamando o handler atual; só animar com classe `is-revealing` durante 420ms quando `owned_count: 0 → 1`.
- [ ] `components/bottom-nav.tsx` substituído.

## Telas
- [ ] **Login** (`app/(auth)/login`): hero com ícone genérico de futebol (NÃO copiar logo), input grande, CTA verde "Receber link mágico".
- [ ] **Onboarding** (primeiro acesso): card laranja-degradê + 3 passos + CTA "Criar meu álbum Copa 2026".
- [ ] **Dashboard** (`app/(app)/page.tsx`): hero `ProgressAlbum` + 3 mini-stats (Faltam/Repetidas/Únicas) + 2 StatCards (Total gasto / Custo por figura) + card escuro de Projeção + 4 atalhos + "Reveladas hoje" (scroll H).
- [ ] **Álbum** (`app/(app)/album`): chips de status (Tudo/Falta/Tenho/Repetida/Foil) + chips de time (scroll H) + header de seleção + grid `grid-cols-4 gap-y-3.5 justify-between` com `StickerCard size="sm"`.
- [ ] **Modo Banca** (`app/(app)/banca`): wrapper `<div data-theme="dark">`, toggle gigante FALTAM ↔ REPETIDAS, display numérico (54px mono), teclado numérico 60×60.
- [ ] **Trocas** (`app/(app)/trocas`): CTA WhatsApp verde-degradê, toggle Repetidas/Faltantes, `<pre>` com a lista, chips das repetidas com badge ×N.

## Acessibilidade & comportamento
- [ ] Todos os botões/links com alvo ≥ 44px.
- [ ] Foco visível em todos os interativos (já configurado em `:focus-visible`).
- [ ] Contraste AA verificado nas combinações verde/branco, gold/ink, magenta/branco.
- [ ] Strings em pt-BR.
- [ ] PWA: nada a mudar (já configurado).

## Validação final
- [ ] Login → magic link → entra no app.
- [ ] Botão "Criar meu álbum Copa 2026" → roda `seed_copa_2026` → grid populado.
- [ ] Toque em figurinha "falta" → vira "tenho" com animação `sc-reveal`.
- [ ] Segundo toque em "tenho" → vira "×2" com badge magenta.
- [ ] Long-press / botão "−" → decrementa.
- [ ] Busca por número funciona.
- [ ] Filtros (status, tipo, seleção) funcionam.
- [ ] Modo Banca abre em tema escuro.
- [ ] Geração de lista de troca + copiar funcionam.
- [ ] Tudo otimista (UI atualiza antes do servidor).

## NÃO fazer
- ❌ Não alterar schema, RLS, RPC, rotas, auth.
- ❌ Não embarcar imagens oficiais Panini/FIFA.
- ❌ Não copiar logos/emblemas/tipografia oficiais.
- ❌ Não trocar libs (Next, Tailwind, shadcn, recharts, Supabase) — só layout/estilo.
