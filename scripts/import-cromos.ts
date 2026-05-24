/**
 * scripts/import-cromos.ts
 *
 * Lê cromos/, casa cada arquivo com a figurinha no banco, comprime para WebP
 * e faz upload pro bucket "sticker-photos" no Supabase Storage.
 * Grava a URL pública em stickers.image_url.
 *
 * Uso:
 *   npm run import-cromos -- <collection-id>
 *
 * Requer no .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Formato dos arquivos em cromos/:
 *   CODIGO_NUMERO.{png,jpg,jpeg,webp}
 *   Ex.: BRA_17.png  ARG_05.jpg  SPECIAL_03.png
 */

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

// ── Config ──────────────────────────────────────────────────────────────
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const COLLECTION_ID = process.argv[2] ?? "";

const BUCKET     = "sticker-photos";
const CROMOS_DIR = path.join(process.cwd(), "cromos");
const MAX_WIDTH  = 600;   // px — não faz upscale
const WEBP_QUALITY = 80;  // 0-100

// ── Validação ────────────────────────────────────────────────────────────
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("\n✗ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios em .env.local\n");
  process.exit(1);
}
if (!COLLECTION_ID) {
  console.error("\nUso: npm run import-cromos -- <collection-id>\n");
  process.exit(1);
}
if (!fs.existsSync(CROMOS_DIR)) {
  console.error(`\n✗ Diretório 'cromos/' não encontrado em ${process.cwd()}\n`);
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────
function pad2(n: number) { return String(n).padStart(2, "0"); }
function kb(bytes: number) { return (bytes / 1024).toFixed(0) + " KB"; }
function mb(bytes: number) { return (bytes / 1024 / 1024).toFixed(2) + " MB"; }

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // ── Bucket: cria se não existir (público) ────────────────────────────
  const { data: existingBucket } = await supabase.storage.getBucket(BUCKET);
  if (!existingBucket) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`Erro ao criar bucket '${BUCKET}': ${error.message}`);
    console.log(`  Bucket '${BUCKET}' criado como público.`);
  }

  // ── Busca times e figurinhas da coleção ──────────────────────────────
  const [{ data: teams, error: teamsErr }, { data: stickers, error: stickersErr }] =
    await Promise.all([
      supabase.from("teams").select("id, code").eq("collection_id", COLLECTION_ID),
      supabase.from("stickers").select("id, team_id, number, image_url").eq("collection_id", COLLECTION_ID),
    ]);

  if (teamsErr) throw new Error(`Erro ao buscar times: ${teamsErr.message}`);
  if (stickersErr) throw new Error(`Erro ao buscar figurinhas: ${stickersErr.message}`);
  if (!teams?.length)    { console.error("Nenhum time encontrado para essa coleção."); process.exit(1); }
  if (!stickers?.length) { console.error("Nenhuma figurinha encontrada para essa coleção."); process.exit(1); }

  const teamByCode = new Map(teams.map((t) => [t.code.toUpperCase(), t.id as string]));
  // chave: `${team_id}:${number}` → sticker
  const stickerByKey = new Map(
    stickers.map((s) => [`${s.team_id}:${s.number}`, s])
  );

  // ── Lê arquivos ──────────────────────────────────────────────────────
  const files = fs.readdirSync(CROMOS_DIR).filter((f) =>
    /\.(png|jpe?g|webp)$/i.test(f)
  );
  console.log(`\nEncontrados ${files.length} arquivo(s) em cromos/\n`);

  const report = {
    uploaded: 0,
    skipped:  0,
    noMatch:  [] as string[],
    errors:   [] as string[],
    totalBytes: 0,
  };

  for (const file of files) {
    const baseName = path.basename(file, path.extname(file));
    // Aceita: "BRA_17", "SPECIAL_03", "ARG_05"
    const match = /^([A-Za-z0-9]+)_(\d+)$/.exec(baseName);
    if (!match) {
      console.warn(`  ⚠  Nome inválido: ${file}  (esperado: CODIGO_NUMERO.ext)`);
      report.noMatch.push(file);
      continue;
    }

    const code   = match[1].toUpperCase();
    const number = parseInt(match[2], 10);
    const teamId = teamByCode.get(code);

    if (!teamId) {
      console.warn(`  ⚠  Time não encontrado: ${code}  →  ${file}`);
      report.noMatch.push(file);
      continue;
    }

    const sticker = stickerByKey.get(`${teamId}:${number}`);
    if (!sticker) {
      console.warn(`  ⚠  Figurinha sem match: ${code} #${number}  →  ${file}`);
      report.noMatch.push(file);
      continue;
    }

    // Idempotente: pula se já tem URL
    if (sticker.image_url) {
      console.log(`  ↩  ${file}  já importada, pulando`);
      report.skipped++;
      continue;
    }

    try {
      // Comprimir
      const inputPath  = path.join(CROMOS_DIR, file);
      const compressed = await sharp(inputPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      report.totalBytes += compressed.length;

      // Upload (upsert = idempotente se rodar de novo com --force removendo a URL)
      const storagePath = `${COLLECTION_ID}/${code}_${pad2(number)}.webp`;
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, compressed, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadErr) throw new Error(uploadErr.message);

      // URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      // Grava no banco
      const { error: updateErr } = await supabase
        .from("stickers")
        .update({ image_url: publicUrl })
        .eq("id", sticker.id);

      if (updateErr) throw new Error(updateErr.message);

      console.log(`  ✓  ${file.padEnd(24)}→  ${kb(compressed.length).padStart(8)}  WebP`);
      report.uploaded++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  ✗  ${file}: ${msg}`);
      report.errors.push(`${file}: ${msg}`);
    }
  }

  // ── Conta figurinhas sem imagem (pós-import) ─────────────────────────
  const { count: remaining } = await supabase
    .from("stickers")
    .select("id", { count: "exact", head: true })
    .eq("collection_id", COLLECTION_ID)
    .is("image_url", null);

  // ── Relatório ────────────────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────");
  console.log(`  Enviadas:              ${report.uploaded}`);
  console.log(`  Já existiam (puladas): ${report.skipped}`);
  console.log(`  Sem match no banco:    ${report.noMatch.length}`);
  console.log(`  Erros:                 ${report.errors.length}`);
  console.log(`  Total enviado:         ${mb(report.totalBytes)}`);
  console.log(`  Figurinhas sem imagem: ${remaining ?? "?"}`);
  console.log("──────────────────────────────────────────────");

  if (report.noMatch.length > 0) {
    console.log("\n  Arquivos sem match:");
    report.noMatch.forEach((f) => console.log(`    - ${f}`));
  }
  if (report.errors.length > 0) {
    console.log("\n  Erros:");
    report.errors.forEach((e) => console.log(`    - ${e}`));
  }

  console.log();
}

main().catch((e) => {
  console.error("\n✗", e instanceof Error ? e.message : e);
  process.exit(1);
});
