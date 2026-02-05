import puppeteer from "puppeteer";
import { execSync } from "child_process";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "fs";
import { mixTrack } from "./src/audio/mix";
import { stereoToWav } from "./src/audio/wav";
import { audioTrack } from "./src/templates/BrutalMotion";

const FRAMES_DIR = "/tmp/framix-capture";
const OUTPUT_FILE = "./output.mp4";
const TOTAL_FRAMES = 450;
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

async function capture() {
  console.log("🎬 Brutal Motion Capture - 450 frames @ 30fps");

  // Clean up
  if (existsSync(FRAMES_DIR)) rmSync(FRAMES_DIR, { recursive: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  console.log("📡 Loading localhost:4200...");
  await page.goto("http://localhost:4200", { waitUntil: "networkidle2" });

  // Click Brutal Motion template
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find((b) => b.textContent?.includes("Brutal Motion"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // Find the template component container and capture it directly
  // We'll render the component at full size by injecting it
  console.log("🎯 Setting up full-size render...");

  // Override: render template at full resolution without Player chrome
  await page.evaluate(
    (w, h) => {
      // Hide everything except the video container
      document.body.style.overflow = "hidden";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.background = "#000";

      // Find the inner render div (transform: scale(...) container)
      const scaleDiv = document.querySelector('[style*="transform-origin: top left"]') as HTMLElement;
      if (scaleDiv) {
        // Remove the scale transform to render at full size
        scaleDiv.style.transform = "none";
        // Find the parent container and make it full viewport
        const parent = scaleDiv.parentElement as HTMLElement;
        if (parent) {
          parent.style.width = w + "px";
          parent.style.height = h + "px";
          parent.style.borderRadius = "0";
          parent.style.boxShadow = "none";
        }
      }

      // Hide sidebar, header, controls
      const mainDiv = document.querySelector('[style*="min-height: 100vh"]') as HTMLElement;
      if (mainDiv) {
        mainDiv.style.padding = "0";
        mainDiv.style.background = "#000";
      }

      // Hide all children except the player area
      const flex = document.querySelector('[style*="display: flex"][style*="gap: 20px"]') as HTMLElement;
      if (flex) {
        // Hide sidebar
        const sidebar = flex.children[0] as HTMLElement;
        if (sidebar) sidebar.style.display = "none";
        // Make player area full
        const playerArea = flex.children[1] as HTMLElement;
        if (playerArea) {
          playerArea.style.flex = "none";
          playerArea.style.width = w + "px";
          playerArea.style.position = "fixed";
          playerArea.style.top = "0";
          playerArea.style.left = "0";
          playerArea.style.zIndex = "9999";
        }
      }

      // Hide the controls below the video
      const controls = document.querySelector('[style*="background: #151515"]') as HTMLElement;
      if (controls) controls.style.display = "none";

      // Hide render button and header
      const h1 = document.querySelector("h1");
      if (h1) h1.style.display = "none";
      const p = document.querySelector("p");
      if (p) p.style.display = "none";
      const renderBtn = document.querySelector('[style*="linear-gradient"]') as HTMLElement;
      if (renderBtn?.tagName === "BUTTON") renderBtn.style.display = "none";
    },
    WIDTH,
    HEIGHT
  );

  await new Promise((r) => setTimeout(r, 300));

  const startTime = Date.now();

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    // Set frame via slider
    await page.evaluate((f) => {
      const slider = document.querySelector('input[type="range"]') as HTMLInputElement;
      if (slider) {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )!.set!;
        nativeSetter.call(slider, String(f));
        slider.dispatchEvent(new Event("input", { bubbles: true }));
        slider.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, frame);

    // Brief wait for React to re-render
    await new Promise((r) => setTimeout(r, 10));

    const frameStr = String(frame).padStart(5, "0");
    await page.screenshot({
      path: `${FRAMES_DIR}/frame-${frameStr}.png`,
      type: "png",
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });

    if (frame % 30 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const fps = frame / elapsed || 0;
      const eta = frame > 0 ? Math.round((TOTAL_FRAMES - frame) / fps) : "?";
      console.log(
        `  📸 Frame ${frame}/${TOTAL_FRAMES} (${Math.round((frame / TOTAL_FRAMES) * 100)}%) - ${fps.toFixed(1)} fps - ETA: ${eta}s`
      );
    }
  }

  await browser.close();
  console.log(`\n✅ All ${TOTAL_FRAMES} frames captured!`);

  // Generate audio WAV if audioTrack exists
  const AUDIO_FILE = `${FRAMES_DIR}/audio.wav`;
  let hasAudio = false;

  if (audioTrack) {
    console.log("🔊 Generating stereo audio track...");
    const stereo = mixTrack(audioTrack, TOTAL_FRAMES, FPS, 44100);
    const wavData = stereoToWav(stereo);
    writeFileSync(AUDIO_FILE, wavData);
    hasAudio = true;
    console.log("✅ Stereo audio WAV generated");
  }

  // Encode with FFmpeg
  console.log("🎞️  Encoding MP4...");
  const ffmpegCmd = hasAudio
    ? `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame-%05d.png" -i "${AUDIO_FILE}" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "${OUTPUT_FILE}"`
    : `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame-%05d.png" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -movflags +faststart "${OUTPUT_FILE}"`;
  execSync(ffmpegCmd, { stdio: "inherit" });

  // Cleanup
  rmSync(FRAMES_DIR, { recursive: true });

  console.log(`\n🎬 Done! Output: ${OUTPUT_FILE}`);
  console.log(`   Duration: ${TOTAL_FRAMES / FPS}s @ ${FPS}fps`);
  if (hasAudio) console.log("   Audio: AAC 192kbps");
}

capture().catch(console.error);
