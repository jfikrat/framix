import puppeteer from "puppeteer";
import { execSync } from "child_process";
import { mkdirSync, rmSync, existsSync } from "fs";
import { cpus } from "os";

// ============================================================
// Config
// ============================================================

const VITE_URL = "http://localhost:4200";
const FRAMES_DIR = "/tmp/framix-frames";
const WORKER_COUNT = Math.min(cpus().length, 8);

// Parse CLI args
const templateId = process.argv[2] || "ai-timeline";
const outputPath = process.argv[3] || "./output.mp4";

// ============================================================
// Worker: renders a range of frames
// ============================================================

async function renderWorker(
  workerId: number,
  frames: number[],
  config: { width: number; height: number; fps: number; durationInFrames: number },
  progress: { done: number; total: number },
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: config.width,
    height: config.height,
    deviceScaleFactor: 1,
  });

  // Navigate to render mode
  await page.goto(`${VITE_URL}/?render=${templateId}`, {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  // Wait for React to mount and expose __renderReady
  await page.waitForFunction(() => (window as any).__renderReady === true, {
    timeout: 15000,
  });

  // Wait a bit for fonts/images to load
  await new Promise((r) => setTimeout(r, 500));

  for (const frame of frames) {
    // Set frame via exposed function
    await page.evaluate((f) => (window as any).__setFrame(f), frame);

    // Wait for React re-render
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );

    const frameNumber = String(frame).padStart(5, "0");
    await page.screenshot({
      path: `${FRAMES_DIR}/frame-${frameNumber}.png`,
      type: "png",
      clip: { x: 0, y: 0, width: config.width, height: config.height },
    });

    progress.done++;
  }

  await browser.close();
}

// ============================================================
// Frame distribution
// ============================================================

function distributeFrames(totalFrames: number, workerCount: number): number[][] {
  const frames: number[][] = Array.from({ length: workerCount }, () => []);
  for (let i = 0; i < totalFrames; i++) {
    frames[i % workerCount].push(i);
  }
  return frames;
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("");
  console.log("Framix Template Renderer");
  console.log("---------------------------------------------------");

  // First, get the template config by opening a single browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(`${VITE_URL}/?render=${templateId}`, {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  await page.waitForFunction(() => (window as any).__renderReady === true, {
    timeout: 15000,
  });

  const config = await page.evaluate(() => (window as any).__config);
  await browser.close();

  console.log(`   Template: ${templateId}`);
  console.log(`   Resolution: ${config.width}x${config.height}`);
  console.log(`   FPS: ${config.fps}`);
  console.log(`   Duration: ${config.durationInFrames} frames (${(config.durationInFrames / config.fps).toFixed(1)}s)`);
  console.log(`   Workers: ${WORKER_COUNT} parallel browsers`);
  console.log(`   Output: ${outputPath}`);
  console.log("---------------------------------------------------");
  console.log("");

  // Clean up and create frames directory
  if (existsSync(FRAMES_DIR)) {
    rmSync(FRAMES_DIR, { recursive: true });
  }
  mkdirSync(FRAMES_DIR, { recursive: true });

  const frameDistribution = distributeFrames(config.durationInFrames, WORKER_COUNT);
  const progress = { done: 0, total: config.durationInFrames };
  const startTime = Date.now();

  // Progress reporter
  const progressInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const fps = progress.done / elapsed;
    const remaining = progress.total - progress.done;
    const eta = fps > 0 ? (remaining / fps).toFixed(0) : "?";
    const percent = Math.round((progress.done / progress.total) * 100);
    process.stdout.write(
      `\r   ${progress.done}/${progress.total} frames (${percent}%) | ${fps.toFixed(1)} fps | ETA: ${eta}s   `,
    );
  }, 300);

  // Start all workers in parallel
  console.log(`Launching ${WORKER_COUNT} browser workers...`);
  await Promise.all(
    frameDistribution.map((frames, i) => renderWorker(i, frames, config, progress)),
  );

  clearInterval(progressInterval);
  console.log(`\n\n   All ${progress.total} frames captured.`);

  // FFmpeg encode
  console.log("   Encoding video with FFmpeg...");
  execSync(
    `ffmpeg -y -framerate ${config.fps} -i ${FRAMES_DIR}/frame-%05d.png -c:v libx264 -pix_fmt yuv420p -preset fast -crf 18 ${outputPath}`,
    { stdio: "pipe" },
  );

  // Cleanup
  rmSync(FRAMES_DIR, { recursive: true });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n   Done! Video saved to: ${outputPath}`);
  console.log(`   Total time: ${duration}s`);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
