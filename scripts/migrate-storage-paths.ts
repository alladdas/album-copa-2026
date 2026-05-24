/**
 * scripts/migrate-storage-paths.ts
 *
 * One-time migration: moves sticker images from collection-UUID subfolders
 * to the shared root so all users can access them via team.code + number.
 *
 * Before: sticker-photos/{uuid}/BRA_04.webp
 * After:  sticker-photos/BRA_04.webp
 *
 * Usage:
 *   npm run migrate-storage
 *
 * Safe to re-run: skips files already at root.
 */

import dotenv from "dotenv";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET       = "sticker-photos";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env.local");
  process.exit(1);
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // List bucket root — folders appear with id === null
  const { data: rootItems, error: rootErr } = await supabase.storage
    .from(BUCKET)
    .list("", { limit: 100, offset: 0 });

  if (rootErr) throw rootErr;

  const folders = (rootItems ?? []).filter((item) => item.id === null);

  if (folders.length === 0) {
    console.log("No collection folders found — images may already be at root level.");
    return;
  }

  let totalMoved = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  for (const folder of folders) {
    console.log(`\nFolder: ${folder.name}`);

    // List all files inside this folder (up to 1000 — album has 980)
    const { data: files, error: listErr } = await supabase.storage
      .from(BUCKET)
      .list(folder.name, { limit: 1000, offset: 0 });

    if (listErr) {
      console.error(`  ✗  Failed to list ${folder.name}: ${listErr.message}`);
      continue;
    }

    // Build set of names already at root to skip efficiently
    const { data: rootFiles } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: 1000, offset: 0 });
    const atRoot = new Set((rootFiles ?? []).filter((f) => f.id !== null).map((f) => f.name));

    for (const file of (files ?? [])) {
      if (atRoot.has(file.name)) {
        console.log(`  ↩  ${file.name.padEnd(16)} already at root`);
        totalSkipped++;
        continue;
      }

      const oldPath = `${folder.name}/${file.name}`;
      const newPath = file.name;

      const { error: moveErr } = await supabase.storage.from(BUCKET).move(oldPath, newPath);

      if (moveErr) {
        console.error(`  ✗  ${file.name}: ${moveErr.message}`);
        errors.push(`${file.name}: ${moveErr.message}`);
      } else {
        console.log(`  ✓  ${file.name}`);
        totalMoved++;
        atRoot.add(file.name);
      }
    }
  }

  console.log("\n──────────────────────────────────────────────");
  console.log(`  Moved:   ${totalMoved}`);
  console.log(`  Skipped: ${totalSkipped}`);
  console.log(`  Errors:  ${errors.length}`);
  console.log("──────────────────────────────────────────────");

  if (errors.length > 0) {
    console.log("\n  Errors:");
    errors.forEach((e) => console.log(`    - ${e}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("✗", e instanceof Error ? e.message : e);
  process.exit(1);
});
