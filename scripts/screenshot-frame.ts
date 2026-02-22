/**
 * screenshot-frame.ts
 * Take a Puppeteer screenshot of specific frame(s) without full render.
 *
 * Usage:
 *   bun run scripts/screenshot-frame.ts <templateId> [frames...]
 *   bun run scripts/screenshot-frame.ts internet-pulse-v2 90 180 270 339
 *
 * Output: /tmp/framix-ss/<templateId>-<frame>.jpg
 */

import puppeteer from "puppeteer";
import { mkdirSync } from "fs";

const DEV_SERVER = "http://localhost:4200";
const OUT_DIR = "/tmp/framix-ss";

const [templateId, ...frameArgs] = process.argv.slice(2);

if (!templateId) {
  console.error("Usage: bun run scripts/screenshot-frame.ts <templateId> [frames...]");
  process.exit(1);
}

const frames = frameArgs.length > 0
  ? frameArgs.map(Number)
  : [0, 90, 180, 270];

mkdirSync(OUT_DIR, { recursive: true });

console.log(`📸 Screenshotting ${templateId} at frames: ${frames.join(", ")}`);

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
});

const page = await browser.newPage();

// Get config first to set viewport correctly
await page.goto(`${DEV_SERVER}?render=${templateId}`, {
  waitUntil: "networkidle0",
  timeout: 30000,
});

await page.waitForFunction(() => (window as any).__renderReady === true, { timeout: 10000 });

const config: { width: number; height: number } = await page.evaluate(
  () => (window as any).__config
);

await page.setViewport({ width: config.width, height: config.height, deviceScaleFactor: 1 });

// Take screenshot for each frame
for (const f of frames) {
  await page.evaluate((n) => (window as any).__setFrame(n), f);
  await new Promise((r) => setTimeout(r, 20)); // wait for re-render

  const outPath = `${OUT_DIR}/${templateId}-frame${String(f).padStart(4, "0")}.jpg`;
  await page.screenshot({ path: outPath, type: "jpeg", quality: 95 });
  console.log(`  ✓ frame ${f} → ${outPath}`);
}

await browser.close();
console.log("Done.");
