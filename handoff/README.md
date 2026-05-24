# 🎨 Album Copa — Pacote de Handoff de UX/UI

> Identidade visual **Carnaval de Bandeiras** — restyle puramente visual do app.
> **NÃO altere lógica.** Nenhuma rota, schema, RLS, RPC, autenticação, tap rápido,
> filtro ou busca deve mudar. Este pacote troca apenas a camada estética.

## 📦 O que tem aqui

| Arquivo                                   | O que é                                            | Onde vai no projeto                          |
|-------------------------------------------|----------------------------------------------------|----------------------------------------------|
| `visual-reference.html`                   | Telas finais + design system completo (abrir no navegador) | (referência, não vai pro repo)        |
| `globals.css`                             | Bloco `:root` com TODOS os tokens + keyframes      | substitui `app/globals.css`                  |
| `tailwind.config.snippet.ts`              | Recorte do `theme.extend`                          | mesclar com `tailwind.config.ts` existente   |
| `app/fonts.ts`                            | Loader das fontes (next/font)                      | criar em `app/fonts.ts`                      |
| `lib/team-colors.ts`                      | Lookup `code → CSS var` para as 48 seleções        | criar em `lib/team-colors.ts`                |
| `components/sticker-card.tsx`             | **Núcleo visual** — 3 estados + foil + animação    | substitui o componente atual                 |
| `components/bottom-nav.tsx`               | Navegação inferior (5 destinos)                    | substitui                                    |
| `components/ui/button.tsx`                | Variantes primary/gold/secondary/ghost/danger      | mesclar com shadcn (mantém Radix)            |
| `components/ui/chip.tsx`                  | Chip de filtro (status/seleção)                    | criar                                        |
| `components/ui/progress-album.tsx`        | Barra de progresso com chevron                     | criar                                        |
| `CHECKLIST.md`                            | Lista marcável tarefa-a-tarefa                     | (apoio)                                      |

## 🚀 Passo-a-passo

### 1. Fontes (Google Fonts via `next/font`)
- Adicione `app/fonts.ts` (incluso).
- Em `app/layout.tsx`, importe e aplique as CSS vars no `<html>`:

```tsx
import { spaceGrotesk, dmSans, jetbrains } from "./fonts";

<html lang="pt-BR" className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrains.variable}`}>
  <body className="bg-bg text-ink font-sans antialiased">{children}</body>
</html>
```

### 2. Tokens (CSS vars)
- Substitua `app/globals.css` pelo arquivo aqui — ou cole apenas o bloco `:root` e os `@keyframes`.

### 3. Tailwind
- Em `tailwind.config.ts`, mescle o recorte de `tailwind.config.snippet.ts` dentro de `theme.extend`.
- Não remova o que já existe — só adicione cores, fonts, radii e shadows.

### 4. Componentes
- Cole os arquivos `components/*.tsx` e `lib/team-colors.ts` nos respectivos caminhos.
- **`StickerCard`** mantém a MESMA assinatura usada hoje na grid; só muda o visual.
  Se o seu componente atual recebe `sticker` (do tipo do banco) e um `onTap`,
  adapte o prop drill — não mexa no handler.

### 5. Restyle das páginas
Aplique nas rotas existentes (referência visual = `visual-reference.html`):

| Rota                       | O que muda                                                                  |
|----------------------------|-----------------------------------------------------------------------------|
| `app/(auth)/login`         | Hero genérico (ícone original, NÃO copiar logo FIFA/Panini) + input grande  |
| `app/(app)/page.tsx`       | Hero `ProgressAlbum` + 3 mini-stats + 2 stat cards + projeção (card dark) + 4 atalhos + "Reveladas hoje" |
| `app/(app)/album`          | Chips status + chips time (scroll H) + grid 4-col 76px de `StickerCard sm`  |
| `app/(app)/banca`          | Tema escuro local (`<div data-theme="dark">`), toggle FALTAM/REPETIDAS, teclado numérico gigante |
| `app/(app)/trocas`         | CTA WhatsApp verde-degradê, `<pre>` com a lista, chips das repetidas        |
| `components/bottom-nav.tsx`| 5 destinos: Início · Álbum · Banca · Trocas · Gastos                        |

### 6. Validação
- Smoke test: login + criar álbum (seed) + marcar 1 figurinha + abrir Modo Banca.
- Todas as funções devem se comportar **idênticas** — só o visual mudou.
- Acessibilidade: contraste >= AA, alvos de toque >= 44px, foco visível (já no CSS).

## 🚫 Restrições importantes

- **Sem marcas registradas.** Nada de logo/emblema/mascote/tipografia FIFA ou Panini.
  Os ícones inclusos são geométricos e originais.
- **Não embarcar imagens oficiais** das figurinhas. As cores dos times no
  `lib/team-colors.ts` são 12 tokens curados; mapeamento livre.
- **Português (pt-BR)** em toda a interface.

## 🎨 Mood

**Carnaval de Bandeiras**: creme quente como base, verde-bandeira como ação,
dourado-troféu como conquista, magenta para repetidas. Tipografia: **Space Grotesk**
(títulos), **DM Sans** (corpo), **JetBrains Mono** (números).

Detalhes visuais distintivos:
- Padrão de chevrons sutil em headers e topo dos cards (fita comemorativa).
- Sombras "ground" (com `0 2px 0 cor-escura`) nos CTAs principais, dão peso.
- Cards de figurinha com banda colorida (~62%) + footer branco com número/nome.
- `StickerCard` no estado bloqueado: dashed border + saturação reduzida + glyph cinza.
- Animação `sc-reveal` ao virar tenho: scale + flash dourado em ~420ms.

---

Dúvidas: abra a `visual-reference.html` que tudo está documentado lá.
