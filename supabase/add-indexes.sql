-- Performance indexes — run once in Supabase SQL Editor.
-- These do NOT change any schema logic (no tables, columns, RLS or RPC modified).

-- 1. Every page lookup: collections WHERE user_id = $1
--    Without this, Postgres scans all collections (tiny table today, grows with users).
create index if not exists idx_collections_user
  on collections(user_id);

-- 2. Dashboard "reveladas hoje" query filters by (collection_id, updated_at) and
--    sorts by updated_at DESC. The existing idx_stickers_collection covers collection_id
--    but forces a re-sort of all 980 rows. A composite index eliminates the sort.
create index if not exists idx_stickers_updated
  on stickers(collection_id, updated_at desc);

-- 3. Sources are queried by collection_id on every Financas, Banca, and Config page.
create index if not exists idx_sources_collection
  on sources(collection_id);

-- 4. Purchases are queried by collection_id + sorted by date on every Financas page.
--    idx_purchases_collection(collection_id, date) already covers this — verify it
--    was applied; if not, run:
-- create index if not exists idx_purchases_collection
--   on purchases(collection_id, date);
