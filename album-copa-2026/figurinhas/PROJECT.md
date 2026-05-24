# 📒 ALBUM TRACKER — Copa do Mundo 2026 (Panini)

> Documento-mestre do projeto. Este arquivo é a fonte da verdade. O Claude Code
> deve ler este documento por completo ANTES de escrever qualquer código e
> consultá-lo a cada fase.

---

## 1. Visão geral

App pessoal (single-user) para **controle total** da coleção de figurinhas do
álbum oficial Panini da Copa do Mundo FIFA 2026. Uso principal: **celular**, na
banca e em trocas. Precisa ser rápido de operar com uma mão.

**Objetivos do usuário:**
- Saber exatamente o que tem, o que falta e o que está repetido.
- Controlar quanto já gastou (pacotes, valores) e o custo médio por figurinha.
- Facilitar trocas: ver rapidamente faltantes e repetidas, gerar lista pra WhatsApp.
- Acompanhar o progresso (% geral, por seleção, por tipo).

**Não-objetivos (fora de escopo nesta versão):**
- Reconhecimento de figurinha por foto/scan/IA.
- Multiusuário / comunidade de trocas online.
- Pagamentos.

---

## 2. Stack técnica (fixa — não trocar sem avisar o usuário)

| Camada        | Tecnologia                                              |
|---------------|---------------------------------------------------------|
| Framework     | **Next.js 14+ (App Router)** + TypeScript               |
| Estilo        | **Tailwind CSS** + **shadcn/ui**                        |
| Ícones        | lucide-react                                            |
| Banco + Auth  | **Supabase** (Postgres + Auth + RLS)                    |
| Cliente DB    | `@supabase/supabase-js` + `@supabase/ssr`               |
| Gráficos      | **recharts**                                            |
| Deploy        | **Vercel**                                              |
| PWA           | manifest + service worker (instalável no celular)       |

**Gerenciador de pacotes:** npm.

---

## 3. Dados do álbum oficial (Copa 2026 Panini)

Use isto para gerar o **seed inicial**:

- **Total: 980 figurinhas**, em **112 páginas**.
- **48 seleções**, cada uma com **20 figurinhas**:
  - nº 1 = escudo/emblema do time (shiny)
  - nº 13 = foto oficial da equipe
  - demais (18) = jogadores
- **68 figurinhas especiais**: emblema do torneio, mascote, troféu, taças,
  estádios das cidades-sede, e a série "World Cup History" (FOIL).
- **12 figurinhas Coca-Cola** (parceria/exclusivas).
- Pacotes vêm com **7 figurinhas**.

> ✅ O seed já vem **COMPLETO e populado**: os arquivos `supabase/schema.sql` e
> `supabase/seed_data.sql` (entregues junto) criam as 980 figurinhas reais — as
> 48 seleções na ordem do álbum, cada uma com escudo (nº1), foto da equipe (nº13)
> e os 18 jogadores com nomes corretos, mais o bloco de 20 especiais (emblema,
> mascote, bola, slogan, cidades-sede e a série World Cup History). O usuário NÃO
> precisa cadastrar nada à mão — só pode EDITAR rótulos depois se quiser.
> A numeração pode variar levemente entre a versão NA e a internacional; por isso
> a tela de Configurações permite editar qualquer rótulo/nome.

### Imagens das figurinhas (importante)
As artes oficiais Panini/FIFA são **conteúdo protegido** e NÃO devem ser
baixadas/empacotadas no app. Em vez disso:
- Cada sticker tem `image_url` (Supabase Storage) que o **próprio usuário** pode
  preencher tirando foto da sua figurinha.
- A UI representa cada figurinha visualmente por cor/identidade da seleção +
  número + nome — fica rica e identificável SEM depender da arte oficial.
- NÃO usar URLs de imagens da Panini nem de sites de terceiros.

---

## 4. Modelo de dados (Supabase / Postgres)

> Toda tabela tem `user_id uuid` referenciando `auth.users` e **RLS ativo**
> (cada usuário só enxerga as próprias linhas). Single-user, mas com auth real.

### 4.1 `collections`
Permite ter mais de um álbum no futuro (ex.: versão dele + de um filho).
- `id uuid pk`
- `user_id uuid`
- `name text` (ex.: "Copa 2026 — meu álbum")
- `total_stickers int` (default 980)
- `created_at timestamptz`

### 4.2 `teams` (seções do álbum: 48 seleções + bloco de especiais)
- `id uuid pk`
- `user_id uuid`
- `collection_id uuid fk`
- `name text` (ex.: "Brasil", "Especiais", "Coca-Cola")
- `code text` (ex.: "BRA", "SPECIAL", "COKE")
- `kind text` check in ('team','special','coca_cola')
- `order_index int` (ordem no álbum)

### 4.3 `stickers`
- `id uuid pk`
- `user_id uuid`
- `collection_id uuid fk`
- `team_id uuid fk`
- `number int` (número impresso; para especiais pode ser código string → ver `label`)
- `label text` (rótulo editável: "Escudo", "Foto da equipe", nome do jogador, "Mascote"…)
- `sticker_type text` check in ('player','crest','team_photo','special','history','coca_cola','stadium','mascot','trophy','emblem')
- `is_foil boolean default false`
- `owned_count int default 0`  ← quantas o usuário possui (0 = falta; 1 = tem; >1 = repetidas)
- `notes text null`
- `updated_at timestamptz`

> **Regra de negócio central:**
> - `owned_count = 0` → **FALTANDO**
> - `owned_count = 1` → **TENHO**
> - `owned_count >= 2` → **TENHO + (owned_count - 1) REPETIDAS**

### 4.3b `sources` (pontos de venda / origem — "dado geek")
- `id uuid pk`, `user_id`, `collection_id`
- `name text` (ex.: "Banca do Zé", "Mercado X", "Amazon")
- `kind text` in ('banca','mercado','online','troca','presente','outro')

### 4.3c `acquisitions` (cada figurinha obtida e de onde veio)
- `id`, `user_id`, `collection_id`, `sticker_id fk`, `source_id fk`, `purchase_id fk`
- `was_new boolean` (era nova na hora? alimenta o ranking de aproveitamento por local)
> Alimenta a view `v_source_stats`: total obtidas, novas, repetidas e
> % de aproveitamento POR ponto de venda. Permite responder "qual banca me deu
> mais figurinha nova vs. repetida".

### 4.4 `purchases` (controle financeiro)
- `id uuid pk`
- `user_id uuid`
- `collection_id uuid fk`
- `date date`
- `description text` (ex.: "Box 25 pacotes", "5 pacotes na banca")
- `packs int` (qtd de pacotes)
- `stickers_count int` (packs * 7, mas editável)
- `amount_cents int` (valor em centavos, BRL)
- `created_at timestamptz`

### 4.5 (Opcional) `trade_log`
Histórico de trocas feitas (registra figurinhas que saíram/entraram).
- `id uuid pk`, `user_id`, `collection_id`, `date`, `gave_numbers int[]`, `got_numbers int[]`, `partner text`, `notes text`

> O Claude Code deve gerar TODO o SQL (criação de tabelas, RLS policies,
> índices e a função/seed) num arquivo `supabase/schema.sql` e um
> `supabase/seed.sql` separado, prontos para colar no SQL Editor do Supabase.

---

## 5. Telas / funcionalidades

### 5.1 Onboarding / Login
- Login via Supabase Auth (e-mail+senha OU magic link — escolher magic link p/ simplicidade).
- No primeiro acesso: botão "Criar meu álbum Copa 2026" → roda o seed para o usuário
  (cria collection + 48 teams + bloco especiais + 980 stickers com owned_count=0).

### 5.2 Dashboard (home)
Cards no topo (grandes, mobile-first):
- **% completo** (barra de progresso) — ex.: "412 / 980 (42%)"
- **Faltam:** N · **Repetidas:** N · **Total gasto:** R$ X
- **Custo médio por figurinha colada** = total gasto / figurinhas únicas obtidas
- **Projeção:** estimativa de quanto falta gastar p/ fechar (com base no custo médio por pacote e nas faltantes)
- Gráfico (recharts): gasto acumulado ao longo do tempo + linha de progresso %.
- Atalhos grandes: "Modo Banca", "Registrar repetida", "Nova compra".

### 5.3 Álbum (grid)
- Lista de seleções/seções (chips no topo p/ filtrar).
- Grid de números. Cada célula mostra o número e cor por status:
  - cinza = falta · verde = tenho · azul/badge = repetida (mostra "x2", "x3"…)
- **Tap rápido (regra de ouro do app):**
  - 1 tap em falta → vira "tenho" (owned_count 0→1)
  - tap em "tenho" → incrementa repetida (1→2→3…)
  - long-press / botão "−" → decrementa (corrige erro)
- Busca por número (input numérico grande).
- Filtros: status (falta/tenho/repetida), tipo, seleção.

### 5.3b Mecânica "bloqueado → revela" (visual)
Cada figurinha tem dois estados visuais:
- **Bloqueada** (`owned_count = 0`): card embaçado/escurecido mostrando a cor da
  seleção, o número grande e o nome (do seed). Visual de "silhueta a conquistar".
- **Revelada** (`owned_count >= 1`): ao marcar que tem, o card "desembaça" com uma
  animação curta (blur→nítido + leve brilho/scale). Mostra:
  - se houver `image_url` (foto sua, opcional) → exibe a imagem;
  - se não houver → o card colorido fica nítido com número + nome destacados.
> A animação não depende de imagem: funciona só com a identidade visual gerada.
> O preenchimento das imagens reais é OPCIONAL e FUTURO (ver 5.8) — o app é
> totalmente funcional e bonito sem elas.

### 5.4 Modo Banca (tela cheia, alto contraste)
Pensada para usar NA banca/troca, rápido:
- Toggle entre duas visões enormes:
  - **"FALTAM"** → lista grande dos números que faltam (fácil de mostrar/conferir)
  - **"REPETIDAS"** → números repetidos com quantidade
- Botão "registrar" gigante para somar figurinhas recém-compradas em sequência
  (digita número → confirma → soma; ideal pra abrir pacote e ir batendo).

### 5.5 Trocas
- Lista de repetidas (com qtd) e lista de faltantes.
- Botão **"Gerar lista de troca"** → texto pronto pra WhatsApp:
  ```
  📕 Álbum Copa 2026 — João
  ✅ TENHO (repetidas): 12, 45, 102x2, 230, ...
  ❌ PRECISO: 3, 88, 150, 301, ...
  ```
  com botão "Copiar" e "Compartilhar" (Web Share API no celular).
- (Opcional) registrar troca feita no `trade_log`.

### 5.6 Finanças
- Lista de compras (CRUD): data, descrição, pacotes, valor, **e ponto de venda (source)**.
- Form rápido de nova compra. Calcula stickers_count = packs*7 (editável).
- Resumo: total gasto, nº de pacotes, custo médio por pacote, custo por figurinha.

### 5.6b Origem / Pontos de venda ("dado geek")
- CRUD de `sources` (bancas, mercados, online…).
- Ao registrar figurinhas no Modo Banca, dá pra escolher de qual source vieram;
  cada figurinha vira uma `acquisition` com `was_new` (era nova naquele momento?).
- Tela de **ranking de origens** (usa a view `v_source_stats`): por local,
  mostra total obtidas, novas, repetidas e **% de aproveitamento**. Gráfico de
  barras comparando bancas. Responde "qual ponto me dá mais figurinha nova".

### 5.8 (OPCIONAL / FUTURO) Imagens reais das figurinhas
Não é necessário para o app funcionar — pode ser adicionado depois, no ritmo do
usuário. Duas formas, ambas operadas PELO usuário dentro do app (as imagens vão
para o bucket pessoal `sticker-photos` do Storage, vinculadas via `image_url`):
- **Anexar foto ao marcar "tenho"**: botão de câmera/upload no card; a foto entra
  naturalmente conforme o usuário coleciona.
- **Importar de um PDF/galeria (assistido)**: tela que renderiza cada página com
  pdf.js, deixa o usuário ajustar uma grade por página (o layout costuma ser
  irregular), recorta em canvas, mostra cada recorte ao lado do número/nome
  esperado para conferência, e salva no Storage. O usuário valida e ajusta.
> Implementar isto por último e como desabilitável. Se ficar complexo, manter
> apenas "anexar foto ao marcar tenho". O app NÃO deve embutir artes de terceiros
> no código/repositório; imagens vivem no Storage pessoal do usuário.

### 5.7 Configurações
- Editar nome do álbum.
- **Editar figurinhas** (rótulos/nomes dos jogadores, tipos) — modo manual.
- **Export/Import JSON** (backup completo da coleção).
- Logout.

---

## 6. Regras de UX mobile-first
- Alvos de toque ≥ 44px. Botões principais largos.
- Bottom navigation fixo: Home · Álbum · Banca · Trocas · $.
- Feedback imediato/otimista no tap (atualiza UI antes da confirmação do servidor; reverte se falhar).
- Funciona offline-friendly o máximo possível (cache do estado; PWA).
- Português (pt-BR) em toda a interface.

---

## 7. Variáveis de ambiente (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
> A ÚNICA intervenção manual do usuário: criar o projeto no Supabase, colar
> essas 2 chaves, e rodar `schema.sql` + `seed.sql` no SQL Editor. Tudo o mais
> deve ser feito pelo Claude Code.

---

## 8. Definição de pronto (Definition of Done)
- [ ] App roda local com `npm run dev` sem erros.
- [ ] Login funciona (magic link).
- [ ] Seed cria as 980 figurinhas estruturadas no primeiro acesso.
- [ ] Tap rápido altera owned_count e reflete na UI na hora.
- [ ] Dashboard mostra %, faltam, repetidas, gasto e gráfico corretos.
- [ ] Modo Banca utilizável com uma mão.
- [ ] Geração de lista de troca + copiar/compartilhar.
- [ ] CRUD de compras com totais corretos.
- [ ] Export/Import JSON.
- [ ] PWA instalável no celular.
- [ ] README com passo-a-passo de Supabase + deploy na Vercel.
