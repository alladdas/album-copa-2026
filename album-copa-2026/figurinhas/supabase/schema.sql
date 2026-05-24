-- ============================================================
-- schema.sql — Album Tracker Copa 2026 (Panini)
-- Cole no SQL Editor do Supabase e clique em RUN.
-- Depois rode seed_data.sql.
-- ============================================================

-- Extensão p/ uuid
create extension if not exists "pgcrypto";

-- ---------- TABELAS ----------

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  total_stickers int not null default 980,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  name text not null,
  code text not null,
  kind text not null check (kind in ('team','special','coca_cola')),
  order_index int not null default 0
);

create table if not exists stickers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  number int not null,
  label text not null,
  sticker_type text not null check (sticker_type in
    ('player','crest','team_photo','special','history','coca_cola','stadium','mascot','trophy','emblem')),
  is_foil boolean not null default false,
  owned_count int not null default 0,           -- 0=falta, 1=tenho, >=2 repetidas
  image_url text,                                -- foto própria do usuário (Storage), opcional
  source_id uuid,                                -- de onde veio (preenchido no registro), opcional
  notes text,
  updated_at timestamptz not null default now()
);

-- Pontos de venda / origem das figurinhas (o "dado geek")
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  name text not null,                            -- "Banca do Zé", "Mercado X", "Amazon"
  kind text not null default 'banca'             -- banca, mercado, online, troca, presente, outro
    check (kind in ('banca','mercado','online','troca','presente','outro')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  source_id uuid references sources(id) on delete set null,  -- onde comprou
  date date not null default current_date,
  description text,
  packs int not null default 0,
  stickers_count int not null default 0,
  amount_cents int not null default 0,           -- valor em centavos (BRL)
  created_at timestamptz not null default now()
);

-- Registro de cada figurinha obtida, com origem (alimenta os rankings por local)
create table if not exists acquisitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  sticker_id uuid not null references stickers(id) on delete cascade,
  source_id uuid references sources(id) on delete set null,
  purchase_id uuid references purchases(id) on delete set null,
  was_new boolean not null,                      -- true se na hora era figurinha nova; false se já era repetida
  created_at timestamptz not null default now()
);

create table if not exists trade_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  date date not null default current_date,
  partner text,
  gave_numbers int[] default '{}',
  got_numbers int[] default '{}',
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- ÍNDICES ----------
create index if not exists idx_teams_collection on teams(collection_id, order_index);
create index if not exists idx_stickers_collection on stickers(collection_id);
create index if not exists idx_stickers_team on stickers(team_id, number);
create index if not exists idx_stickers_owned on stickers(collection_id, owned_count);
create index if not exists idx_purchases_collection on purchases(collection_id, date);
create index if not exists idx_acq_collection on acquisitions(collection_id);
create index if not exists idx_acq_source on acquisitions(source_id);
create index if not exists idx_acq_sticker on acquisitions(sticker_id);

-- ---------- RLS (cada usuário só vê o que é seu) ----------
alter table collections  enable row level security;
alter table teams        enable row level security;
alter table stickers     enable row level security;
alter table sources      enable row level security;
alter table purchases    enable row level security;
alter table acquisitions enable row level security;
alter table trade_log    enable row level security;

-- Policies genéricas: owner full access. (uma por tabela, cobrindo all)
do $$
declare t text;
begin
  foreach t in array array['collections','teams','stickers','sources','purchases','acquisitions','trade_log']
  loop
    execute format('drop policy if exists %I_owner on %I;', t, t);
    execute format($f$
      create policy %I_owner on %I
        for all
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id);
    $f$, t, t);
  end loop;
end $$;

-- ---------- VIEW de estatísticas por origem (ranking de bancas) ----------
create or replace view v_source_stats as
select
  s.id as source_id,
  s.collection_id,
  s.user_id,
  s.name,
  s.kind,
  count(a.id)                                   as total_obtidas,
  count(a.id) filter (where a.was_new)          as novas,
  count(a.id) filter (where not a.was_new)      as repetidas,
  round(100.0 * count(a.id) filter (where a.was_new)
        / nullif(count(a.id),0), 1)             as pct_aproveitamento
from sources s
left join acquisitions a on a.source_id = s.id
group by s.id, s.collection_id, s.user_id, s.name, s.kind;
