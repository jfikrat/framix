import puppeteer, { Browser, Page } from "puppeteer";
import { execSync } from "child_process";
import { mkdirSync, rmSync, existsSync } from "fs";
import { cpus } from "os";
import { defaultConfig } from "./src/animations";

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
  onProgress?: (info: ProgressInfo) => void;
}

// ============================================================
// Constants
// ============================================================

const config = defaultConfig;
const DEFAULT_FRAMES_DIR = "/tmp/framix-frames";
const DEFAULT_OUTPUT_FILE = "./output.mp4";
const WORKER_COUNT = Math.min(cpus().length, 8); // Max 8 worker

// HTML template
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: ${config.width}px; height: ${config.height}px; overflow: hidden; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    function interpolate(value, inputRange, outputRange, options) {
      const [inputMin, inputMax] = inputRange;
      const [outputMin, outputMax] = outputRange;
      let progress = (value - inputMin) / (inputMax - inputMin);
      if (options && options.clamp) progress = Math.max(0, Math.min(1, progress));
      return outputMin + progress * (outputMax - outputMin);
    }

    function spring(opts) {
      var frame = opts.frame, fps = opts.fps;
      var damping = opts.damping || 10, stiffness = opts.stiffness || 100, mass = opts.mass || 1;
      if (frame < 0) return 0;
      var time = frame / fps;
      var omega = Math.sqrt(stiffness / mass);
      var zeta = damping / (2 * Math.sqrt(stiffness * mass));
      var value;
      if (zeta < 1) {
        var omegaD = omega * Math.sqrt(1 - zeta * zeta);
        value = 1 - Math.exp(-zeta * omega * time) *
          (Math.cos(omegaD * time) + (zeta * omega / omegaD) * Math.sin(omegaD * time));
      } else if (zeta === 1) {
        value = 1 - Math.exp(-omega * time) * (1 + omega * time);
      } else {
        var s1 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
        var s2 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
        value = 1 + (s2 * Math.exp(s1 * time) - s1 * Math.exp(s2 * time)) / (s1 - s2);
      }
      return Math.max(0, Math.min(1, value));
    }

    var config = ${JSON.stringify(config)};
    var fps = config.fps, width = config.width, height = config.height, durationInFrames = config.durationInFrames;

    function renderFrame(frame) {
      var logoScale = spring({ frame: frame, fps: fps, damping: 12, stiffness: 100 });
      var logoRotation = interpolate(frame, [0, 30], [0, 360], { clamp: true });
      var titleProgress = spring({ frame: frame - 25, fps: fps, damping: 15 });
      var titleY = interpolate(titleProgress, [0, 1], [50, 0]);
      var titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
      var subtitleOpacity = interpolate(frame, [50, 70], [0, 1], { clamp: true });
      var fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0], { clamp: true });

      document.getElementById("root").innerHTML =
        '<div style="width: ' + width + 'px; height: ' + height + 'px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: system-ui; opacity: ' + fadeOut + '; overflow: hidden; position: relative;">' +
          '<div style="position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(229,62,62,0.3) 0%, transparent 70%); transform: scale(' + (logoScale * 1.5) + '); filter: blur(40px);"></div>' +
          '<div style="width: 120px; height: 120px; background: linear-gradient(135deg, #e53e3e 0%, #f6ad55 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; transform: scale(' + logoScale + ') rotate(' + logoRotation + 'deg); box-shadow: 0 20px 60px rgba(229,62,62,0.4); margin-bottom: 40px;">' +
            '<span style="font-size: 48px; color: white;">▶</span>' +
          '</div>' +
          '<h1 style="font-size: 72px; font-weight: 800; color: white; margin: 0; opacity: ' + titleOpacity + '; transform: translateY(' + titleY + 'px); text-shadow: 0 4px 20px rgba(0,0,0,0.3);">Framix</h1>' +
          '<p style="font-size: 28px; color: rgba(255,255,255,0.7); margin: 0; margin-top: 16px; opacity: ' + subtitleOpacity + '; letter-spacing: 2px;">Paralel Video Render</p>' +
          '<div style="position: absolute; bottom: 20px; right: 20px; color: rgba(255,255,255,0.3); font-size: 14px; font-family: monospace;">Frame: ' + frame + ' / ' + durationInFrames + '</div>' +
        '</div>';
    }

    window.renderFrame = renderFrame;
    window.renderFrame(0);
  </script>
</body>
</html>`;

// Worker: Belirli frame aralığını render eder
async function renderWorker(
  workerId: number,
  frames: number[],
  progress: { done: number; total: number },
  framesDir: string
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

  await page.setContent(html);
  await page.waitForFunction(() => typeof (window as any).renderFrame === "function");

  for (const frame of frames) {
    await page.evaluate((f) => (window as any).renderFrame(f), frame);
    await new Promise((r) => setTimeout(r, 5));

    const frameNumber = String(frame).padStart(5, "0");
    await page.screenshot({
      path: `${framesDir}/frame-${frameNumber}.png`,
      type: "png",
    });

    progress.done++;
  }

  await browser.close();
}

// Frame'leri worker'lara dağıt
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
    outputPath = DEFAULT_OUTPUT_FILE,
    onProgress,
  } = options;

  const framesDir = DEFAULT_FRAMES_DIR;
  const startTime = Date.now();

  // TODO: Template loading based on templateId
  // For now, uses hardcoded template (html variable above)
  if (templateId) {
    // Future: Load template by ID
    // const template = await loadTemplate(templateId);
  }

  // Clean up and create frames directory
  if (existsSync(framesDir)) {
    rmSync(framesDir, { recursive: true });
  }
  mkdirSync(framesDir, { recursive: true });

  const frameDistribution = distributeFrames(config.durationInFrames, WORKER_COUNT);

  // Progress tracking
  const progress = { done: 0, total: config.durationInFrames };

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
    // Start all workers in parallel
    await Promise.all(
      frameDistribution.map((frames, i) => renderWorker(i, frames, progress, framesDir))
    );

    if (progressInterval) {
      clearInterval(progressInterval);
      // Final progress callback
      onProgress?.({
        frame: progress.total,
        total: progress.total,
        percent: 100,
        eta: "0s",
      });
    }

    // FFmpeg encode
    execSync(
      `ffmpeg -y -framerate ${config.fps} -i ${framesDir}/frame-%05d.png -c:v libx264 -pix_fmt yuv420p -preset fast ${outputPath}`,
      { stdio: "pipe" }
    );

    // Cleanup
    rmSync(framesDir, { recursive: true });

    const duration = (Date.now() - startTime) / 1000;

    return {
      success: true,
      outputPath,
      duration,
    };
  } catch (error) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    // Cleanup on error
    if (existsSync(framesDir)) {
      rmSync(framesDir, { recursive: true });
    }

    return {
      success: false,
      outputPath,
      duration: (Date.now() - startTime) / 1000,
    };
  }
}

// ============================================================
// CLI Function (for direct execution)
// ============================================================

async function runCLI(): Promise<void> {
  console.log("");
  console.log("Framix Parallel Renderer");
  console.log("---------------------------------------------------");
  console.log("   Resolution: " + config.width + "x" + config.height);
  console.log("   FPS: " + config.fps);
  console.log("   Duration: " + config.durationInFrames + " frames (" + (config.durationInFrames / config.fps).toFixed(1) + "s)");
  console.log("   Workers: " + WORKER_COUNT + " parallel browsers");
  console.log("   Output: " + DEFAULT_OUTPUT_FILE);
  console.log("---------------------------------------------------");
  console.log("");

  console.log("Launching " + WORKER_COUNT + " browser workers...");
  console.log("Rendering frames in parallel...\n");

  const result = await renderVideo({
    onProgress: (info) => {
      const fps = info.frame > 0 ? (info.frame / (Date.now() / 1000 - cliStartTime)).toFixed(1) : "0";
      process.stdout.write(
        `\r   ${info.frame}/${info.total} frames (${info.percent}%) | ${fps} fps | ETA: ${info.eta}   `
      );
    },
  });

  if (result.success) {
    console.log(`\n\nEncoding complete!`);
    console.log("Done! Video saved to: " + result.outputPath);
    const avgFps = (config.durationInFrames / result.duration).toFixed(1);
    console.log("Total time: " + result.duration.toFixed(1) + "s (" + avgFps + " fps average)");
  } else {
    console.error("\nRender failed. Check FFmpeg installation.");
    process.exit(1);
  }
}

let cliStartTime = Date.now() / 1000;

// ============================================================
// CLI Entry Point
// ============================================================

if (import.meta.main) {
  cliStartTime = Date.now() / 1000;
  runCLI().catch(console.error);
}
