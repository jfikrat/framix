#!/usr/bin/env bun
/**
 * Framix Template Manifest Generator
 *
 * Scans src/templates/*.tsx and extracts real meta from:
 *   1. defineTemplate({ meta: { id: "...", ... } })   — new style
 *   2. export const meta: ProjectMeta = { id: "...", ... }  — old style
 *
 * Output: src/templates/manifest.json
 */

import { readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const TEMPLATES_DIR = resolve("./src/templates");
const OUTPUT_FILE = resolve("./src/templates/manifest.json");

export interface ManifestEntry {
  id: string;
  name: string;
  category?: string;
  color?: string;
  brand?: string;
  file: string;
  hasInputs: boolean;
}

export interface Manifest {
  version: 1;
  generatedAt: string;
  templates: ManifestEntry[];
}

// ─── Brace-counting meta extractor ───────────────────

function extractMetaBlock(content: string, afterPos: number): string | null {
  // Find `meta: {` or `meta = {` from afterPos
  const slice = content.slice(afterPos);
  const match = slice.match(/\bmeta(?:\s*:\s*(?:ProjectMeta\s*)?)?\s*=?\s*:\s*\{|\bmeta\s*:\s*\{|\bconst meta[^=]*=\s*\{/);
  if (!match || match.index === undefined) return null;

  // Find the opening brace
  const braceStart = afterPos + match.index + match[0].lastIndexOf("{") + 1;

  // Extract body using brace counter
  let depth = 1;
  let i = braceStart;
  while (i < content.length && depth > 0) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") depth--;
    i++;
  }
  return content.slice(braceStart, i - 1);
}

function parseMetaBody(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [, key, value] of body.matchAll(/\b(\w+)\s*:\s*["']([^"']+)["']/g)) {
    result[key] = value;
  }
  return result;
}

async function resolveReExport(content: string, filename: string): Promise<string | null> {
  // Detect re-export: export { meta, ... } from "./xxx"
  const reExportMatch = content.match(/export\s*\{[^}]*\bmeta\b[^}]*\}\s*from\s*["'](\.[^"']+)["']/);
  if (!reExportMatch) return null;

  let targetPath = join(TEMPLATES_DIR, reExportMatch[1]);
  // Try .tsx, .ts, /index.tsx, /index.ts
  for (const ext of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    try {
      return await Bun.file(targetPath + ext).text();
    } catch {}
  }
  return null;
}

async function extractMeta(content: string, filename: string): Promise<ManifestEntry | null> {
  let metaBody: string | null = null;
  let resolvedContent = content;

  // Strategy 0: re-export file — follow the import
  const reExportContent = await resolveReExport(content, filename);
  if (reExportContent) {
    resolvedContent = reExportContent;
  }

  // Strategy 1: defineTemplate({ meta: { ... } })
  const definePos = resolvedContent.indexOf("defineTemplate(");
  if (definePos !== -1) {
    metaBody = extractMetaBlock(resolvedContent, definePos);
  }

  // Strategy 2: export const meta: ProjectMeta = { ... }
  if (!metaBody) {
    const exportMetaMatch = resolvedContent.search(/export\s+const\s+meta\b/);
    if (exportMetaMatch !== -1) {
      metaBody = extractMetaBlock(resolvedContent, exportMetaMatch);
    }
  }

  if (!metaBody) return null;

  const fields = parseMetaBody(metaBody);
  if (!fields.id) return null;

  const hasInputs =
    resolvedContent.includes("inputs:") &&
    (content.includes('type: "text"') ||
      content.includes('type: "number"') ||
      content.includes('type: "color"') ||
      content.includes('type: "select"') ||
      content.includes('type: "boolean"') ||
      content.includes('type: "image"'));

  return {
    id: fields.id,
    name: fields.name ?? fields.id,
    category: fields.category,
    color: fields.color,
    brand: fields.brand,
    file: filename,
    hasInputs,
  };
}

// ─── Main ─────────────────────────────────────────────

async function generateManifest(): Promise<void> {
  const files = (await readdir(TEMPLATES_DIR)).sort();
  const entries: ManifestEntry[] = [];
  const seenIds = new Set<string>();

  for (const file of files) {
    if (!file.endsWith(".tsx") && !file.endsWith(".ts")) continue;
    // Skip index/types/utility files
    if (file === "types.ts" || file === "index.ts") continue;

    try {
      const content = await Bun.file(join(TEMPLATES_DIR, file)).text();
      const entry = await extractMeta(content, file);

      if (!entry) {
        console.warn(`[manifest] No meta found in ${file} — skipping`);
        continue;
      }

      if (seenIds.has(entry.id)) {
        console.warn(`[manifest] Duplicate id "${entry.id}" in ${file} — skipping`);
        continue;
      }

      seenIds.add(entry.id);
      entries.push(entry);
    } catch (err) {
      console.warn(`[manifest] Failed to process ${file}:`, err);
    }
  }

  const manifest: Manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    templates: entries,
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`[manifest] ✓ ${entries.length} templates → src/templates/manifest.json`);
}

await generateManifest();
