import puppeteer from "puppeteer";
import { spawnSync } from "child_process";
import { mkdirSync, rmSync, existsSync } from "fs";
import { cpus } from "os";
import { defaultConfig, type VideoConfig } from "./src/animations";

// ============================================================
// Types & Interfaces
// ============================================================

export interface ProgressInfo {
  frame: number;
  total: number;
  percent: number;
  eta: string;
}

export interface RenderResult {
  success: boolean;
  outputPath: string;
  duration: number;
  error?: string;
}

export interface RenderOptions {
  templateId?: string;
  outputPath?: string;
  devServerUrl?: string;
  config?: Partial<VideoConfig>;
  audioPath?: string;
  onProgress?: (info: ProgressInfo) => void;
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_DEV_SERVER = "http://localhost:4200";
const DEFAULT_FRAMES_DIR = "/tmp/framix-frames";
const DEFAULT_OUTPUT_DIR = "./output";
const WORKER_COUNT = Math.min(cpus().length, 8);

// ============================================================
// Validation
// ============================================================

function isValidTemplateId(id: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(id) && id.length <= 64;
}

// ============================================================
// Template Config Fetcher
// ============================================================

async function fetchTemplateConfig(
  devServerUrl: string,
  templateId: string,
): Promise<VideoConfig> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(`${devServerUrl}?render=${templateId}`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for RenderView to signal ready
    await page.waitForFunction(
      () => (window as any).__renderReady === true,
      { timeout: 15000 },
    );

    // Read template config from window
    const config = await page.evaluate(() => (window as any).__config);
    return config as VideoConfig;
  } finally {
    await browser.close();
  }
}

// ============================================================
// Worker: Renders a subset of frames via dev server
// ============================================================

async function renderWorker(
  workerId: number,
  frames: number[],
  progress: { done: number; total: number },
  framesDir: string,
  devServerUrl: string,
  templateId: string,
  videoConfig: VideoConfig,
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: videoConfig.width,
    height: videoConfig.height,
    deviceScaleFactor: 1,
  });

  // Navigate to RenderView with the template
  await page.goto(`${devServerUrl}?render=${templateId}`, {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  // Wait for React to mount and signal ready
  await page.waitForFunction(
    () => (window as any).__renderReady === true,
    { timeout: 15000 },
  );

  for (const frame of frames) {
    // Set frame via exposed __setFrame function
    await page.evaluate((f) => (window as any).__setFrame(f), frame);

    // Small delay for React re-render
    await new Promise((r) => setTimeout(r, 16));

    const frameNumber = String(frame).padStart(5, "0");
    await page.screenshot({
      path: `${framesDir}/frame-${frameNumber}.png`,
      type: "png",
    });

    progress.done++;
  }

  await browser.close();
}

// ============================================================
// Frame Distribution
// ============================================================

function distributeFrames(totalFrames: number, workerCount: number): number[][] {
  const frames: number[][] = Array.from({ length: workerCount }, () => []);
  for (let i = 0; i < totalFrames; i++) {
    frames[i % workerCount].push(i);
  }
  return frames;
}

// ============================================================
// Main Render Function (Module API)
// ============================================================

export async function renderVideo(options: RenderOptions = {}): Promise<RenderResult> {
  const {
    templateId,
    outputPath: customOutputPath,
    devServerUrl = DEFAULT_DEV_SERVER,
    config: configOverride,
    audioPath,
    onProgress,
  } = options;

  const startTime = Date.now();

  // Validate templateId to prevent shell injection / path traversal
  if (templateId && !isValidTemplateId(templateId)) {
    return {
      success: false,
      outputPath: "",
      duration: 0,
      error: `Invalid templateId: "${templateId}". Must match ^[a-z0-9][a-z0-9-]*[a-z0-9]$ and be <= 64 chars.`,
    };
  }

  // Resolve template config
  let videoConfig: VideoConfig;

  if (templateId) {
    // Fetch config from the actual template via dev server — let errors propagate
    const templateConfig = await fetchTemplateConfig(devServerUrl, templateId);
    videoConfig = { ...templateConfig, ...configOverride };
  } else {
    videoConfig = { ...defaultConfig, ...configOverride };
  }

  // Output path: ./output/{templateId}.mp4 or custom
  if (!existsSync(DEFAULT_OUTPUT_DIR)) {
    mkdirSync(DEFAULT_OUTPUT_DIR, { recursive: true });
  }
  const outputPath = customOutputPath || `${DEFAULT_OUTPUT_DIR}/${templateId || "output"}.mp4`;

  // Frames directory: unique per job to avoid collisions
  const framesDir = `${DEFAULT_FRAMES_DIR}-${templateId || "default"}-${Date.now()}`;

  // Clean up and create frames directory
  if (existsSync(framesDir)) {
    rmSync(framesDir, { recursive: true });
  }
  mkdirSync(framesDir, { recursive: true });

  const frameDistribution = distributeFrames(videoConfig.durationInFrames, WORKER_COUNT);

  // Progress tracking
  const progress = { done: 0, total: videoConfig.durationInFrames };

  // Progress callback interval
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  if (onProgress) {
    progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const framesPerSecond = progress.done / elapsed;
      const remainingFrames = progress.total - progress.done;
      const etaSeconds = framesPerSecond > 0 ? remainingFrames / framesPerSecond : 0;

      onProgress({
        frame: progress.done,
        total: progress.total,
        percent: Math.round((progress.done / progress.total) * 100),
        eta: etaSeconds > 0 ? `${Math.round(etaSeconds)}s` : "calculating...",
      });
    }, 200);
  }

  try {
    if (templateId) {
      // Real template render via dev server
      await Promise.all(
        frameDistribution.map((frames, i) =>
          renderWorker(i, frames, progress, framesDir, devServerUrl, templateId, videoConfig)
        ),
      );
    } else {
      // No template specified — error
      throw new Error("templateId is required for rendering");
    }

    if (progressInterval) {
      clearInterval(progressInterval);
      onProgress?.({
        frame: progress.total,
        total: progress.total,
        percent: 100,
        eta: "0s",
      });
    }

    // FFmpeg encode — use arg array (not shell string) to prevent injection
    const useAudio = audioPath && existsSync(audioPath);
    const ffmpegArgs = useAudio
      ? [
          "-y", "-framerate", String(videoConfig.fps),
          "-i", `${framesDir}/frame-%05d.png`,
          "-i", audioPath,
          "-c:v", "libx264", "-c:a", "aac",
          "-pix_fmt", "yuv420p", "-shortest", outputPath,
        ]
      : [
          "-y", "-framerate", String(videoConfig.fps),
          "-i", `${framesDir}/frame-%05d.png`,
          "-c:v", "libx264", "-pix_fmt", "yuv420p",
          "-preset", "fast", outputPath,
        ];
    const ffmpegResult = spawnSync("ffmpeg", ffmpegArgs, { stdio: "pipe" });
    if (ffmpegResult.status !== 0) {
      throw new Error(`FFmpeg failed: ${ffmpegResult.stderr?.toString() || "unknown error"}`);
    }

    // Cleanup frames
    rmSync(framesDir, { recursive: true });

    return {
      success: true,
      outputPath,
      duration: (Date.now() - startTime) / 1000,
    };
  } catch (error) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    if (existsSync(framesDir)) {
      rmSync(framesDir, { recursive: true });
    }

    return {
      success: false,
      outputPath,
      duration: (Date.now() - startTime) / 1000,
      error: error instanceof Error ? error.message : "Unknown render error",
    };
  }
}

// ============================================================
// CLI Function (for direct execution)
// ============================================================

async function runCLI(): Promise<void> {
  const args = process.argv.slice(2);
  const templateId = args[0];

  if (!templateId) {
    console.error("Usage: bun render.ts <templateId>");
    console.error("Example: bun render.ts cobrain-tweet");
    console.error("\nMake sure dev server is running: bun run dev");
    process.exit(1);
  }

  if (!isValidTemplateId(templateId)) {
    console.error(`Error: Invalid templateId "${templateId}".`);
    console.error("Must match ^[a-z0-9][a-z0-9-]*[a-z0-9]$ and be at most 64 characters.");
    process.exit(1);
  }

  console.log("");
  console.log("Framix Parallel Renderer");
  console.log("---------------------------------------------------");
  console.log(`   Template: ${templateId}`);
  console.log(`   Workers: ${WORKER_COUNT} parallel browsers`);
  console.log(`   Dev Server: ${DEFAULT_DEV_SERVER}`);
  console.log("---------------------------------------------------");
  console.log("");

  // Fetch template config first
  console.log("Fetching template config...");
  let videoConfig: VideoConfig;
  try {
    videoConfig = await fetchTemplateConfig(DEFAULT_DEV_SERVER, templateId);
  } catch {
    console.error("Failed to fetch template config. Is dev server running? (bun run dev)");
    process.exit(1);
  }

  console.log(`   Resolution: ${videoConfig.width}x${videoConfig.height}`);
  console.log(`   FPS: ${videoConfig.fps}`);
  console.log(`   Duration: ${videoConfig.durationInFrames} frames (${(videoConfig.durationInFrames / videoConfig.fps).toFixed(1)}s)`);
  console.log(`   Output: ${DEFAULT_OUTPUT_DIR}/${templateId}.mp4`);
  console.log("");
  console.log("Rendering frames in parallel...\n");

  const cliStartTime = Date.now() / 1000;

  const result = await renderVideo({
    templateId,
    onProgress: (info) => {
      const fps = info.frame > 0
        ? (info.frame / (Date.now() / 1000 - cliStartTime)).toFixed(1)
        : "0";
      process.stdout.write(
        `\r   ${info.frame}/${info.total} frames (${info.percent}%) | ${fps} fps | ETA: ${info.eta}   `,
      );
    },
  });

  if (result.success) {
    console.log(`\n\nEncoding complete!`);
    console.log("Done! Video saved to: " + result.outputPath);
    const avgFps = (videoConfig.durationInFrames / result.duration).toFixed(1);
    console.log(`Total time: ${result.duration.toFixed(1)}s (${avgFps} fps average)`);
  } else {
    console.error(`\nRender failed: ${result.error}`);
    process.exit(1);
  }
}

// ============================================================
// CLI Entry Point
// ============================================================

if (import.meta.main) {
  runCLI().catch(console.error);
}
