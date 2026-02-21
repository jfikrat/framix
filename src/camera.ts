// Framix Camera System
// Keyframe paths, CatmullRom curves, orbit, shake
//
// İki kullanım modu:
//   computeCamera(opts) → pure fonksiyon, her yerde çalışır (2D CSS dahil)
//   useCamera(opts)     → r3f hook, Three.js kamerasını günceller

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { spring } from "./animations";

// ─── TYPES ──────────────────────────────────────────

export interface CameraKeyframe {
  frame: number;
  position: [number, number, number];
  lookAt?: [number, number, number];
  fov?: number;
}

export interface CameraShake {
  /** Max displacement (world units) */
  intensity: number;
  /** Oscillations per second (default 15) */
  frequency?: number;
  /** Active frame range [start, end] */
  frames?: [number, number];
  /** 0-1, how much intensity decays over the range (default 0) */
  decay?: number;
}

export interface CameraOrbit {
  target: [number, number, number];
  radius: number;
  /** Radians per second */
  speed: number;
  /** Vertical angle in radians, 0 = level, positive = above (default 0) */
  elevation?: number;
  /** Starting angle offset in radians (default 0) */
  startAngle?: number;
}

export interface CameraOptions {
  frame: number;
  fps: number;
  /** Keyframe array — minimum 2 points */
  keyframes?: CameraKeyframe[];
  /** Interpolation mode between keyframes (default "linear") */
  interpolation?: "linear" | "catmullrom" | "spring";
  /** Spring config, only used when interpolation="spring" */
  springConfig?: { damping?: number; stiffness?: number; mass?: number };
  /** Camera shake overlay */
  shake?: CameraShake;
  /** Orbit mode — overrides keyframes for position */
  orbit?: CameraOrbit;
}

export interface CameraState {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}

// ─── MATH HELPERS ───────────────────────────────────

import { noise, smoothNoise } from "./math";

/** Linear lerp for 3-tuple */
function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/** CatmullRom spline for single value */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

/** CatmullRom spline for 3-tuple */
function catmullRom3(
  p0: [number, number, number],
  p1: [number, number, number],
  p2: [number, number, number],
  p3: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    catmullRom(p0[0], p1[0], p2[0], p3[0], t),
    catmullRom(p0[1], p1[1], p2[1], p3[1], t),
    catmullRom(p0[2], p1[2], p2[2], p3[2], t),
  ];
}

// ─── KEYFRAME SEGMENT FINDER ────────────────────────

function findSegment(keyframes: CameraKeyframe[], frame: number) {
  if (frame <= keyframes[0].frame) return { index: 0, t: 0 };
  const last = keyframes.length - 1;
  if (frame >= keyframes[last].frame) return { index: Math.max(0, last - 1), t: 1 };

  for (let i = 0; i < last; i++) {
    if (frame >= keyframes[i].frame && frame < keyframes[i + 1].frame) {
      // Guard against zero-length segment (two keyframes with the same frame number)
      const span = keyframes[i + 1].frame - keyframes[i].frame;
      const t = span === 0 ? 0 : (frame - keyframes[i].frame) / span;
      return { index: i, t };
    }
  }
  return { index: 0, t: 0 };
}

// ─── COMPUTE CAMERA (pure) ──────────────────────────

export function computeCamera(options: CameraOptions): CameraState {
  const {
    frame,
    fps,
    keyframes,
    interpolation = "linear",
    springConfig,
    shake,
    orbit,
  } = options;
  const time = frame / fps;

  let position: [number, number, number] = [0, 0, 5];
  let lookAt: [number, number, number] = [0, 0, 0];
  let fov = 50;

  // ── Orbit ──
  if (orbit) {
    const angle = (orbit.startAngle ?? 0) + time * orbit.speed;
    const elev = orbit.elevation ?? 0;
    const cosElev = Math.cos(elev);
    position = [
      orbit.target[0] + orbit.radius * Math.cos(angle) * cosElev,
      orbit.target[1] + orbit.radius * Math.sin(elev),
      orbit.target[2] + orbit.radius * Math.sin(angle) * cosElev,
    ];
    lookAt = [orbit.target[0], orbit.target[1], orbit.target[2]];
  }

  // ── Keyframes ──
  // When orbit is active, it owns the position; keyframes may still supply lookAt and FOV.
  const orbitOverride = !!orbit;
  if (keyframes && keyframes.length >= 2) {
    const { index, t } = findSegment(keyframes, frame);
    const kA = keyframes[index];
    const kB = keyframes[Math.min(index + 1, keyframes.length - 1)];
    const lookA: [number, number, number] = kA.lookAt ?? [0, 0, 0];
    const lookB: [number, number, number] = kB.lookAt ?? [0, 0, 0];

    if (interpolation === "catmullrom") {
      const kPrev = keyframes[Math.max(0, index - 1)];
      const kNext = keyframes[Math.min(keyframes.length - 1, index + 2)];
      if (!orbitOverride) {
        position = catmullRom3(kPrev.position, kA.position, kB.position, kNext.position, t);
      }
      const lPrev: [number, number, number] = kPrev.lookAt ?? lookA;
      const lNext: [number, number, number] = kNext.lookAt ?? lookB;
      lookAt = catmullRom3(lPrev, lookA, lookB, lNext, t);
    } else if (interpolation === "spring") {
      const localFrame = frame - kA.frame;
      const s = spring({
        frame: localFrame,
        fps,
        damping: springConfig?.damping ?? 12,
        stiffness: springConfig?.stiffness ?? 80,
        mass: springConfig?.mass ?? 1,
      });
      if (!orbitOverride) {
        position = lerp3(kA.position, kB.position, s);
      }
      lookAt = lerp3(lookA, lookB, s);
    } else {
      if (!orbitOverride) {
        position = lerp3(kA.position, kB.position, t);
      }
      lookAt = lerp3(lookA, lookB, t);
    }

    // FOV interpolation applies regardless of orbit
    fov = (kA.fov ?? 50) + ((kB.fov ?? 50) - (kA.fov ?? 50)) * t;
  }

  // ── Shake ──
  if (shake) {
    const freq = shake.frequency ?? 15;
    let active = true;
    let intensity = shake.intensity;

    if (shake.frames) {
      const [start, end] = shake.frames;
      if (frame < start || frame > end) {
        active = false;
      } else {
        // Guard against start === end (zero-length range) to prevent division by zero
        const span = end - start;
        const progress = span === 0 ? 0 : (frame - start) / span;
        intensity *= 1 - progress * (shake.decay ?? 0);
      }
    }

    if (active && intensity > 0) {
      const st = time * freq;
      position = [
        position[0] + smoothNoise(st, 0) * intensity,
        position[1] + smoothNoise(st, 1) * intensity,
        position[2] + smoothNoise(st, 2) * intensity * 0.5,
      ];
    }
  }

  return { position, lookAt, fov };
}

// ─── USE CAMERA (r3f hook) ──────────────────────────

export function useCamera(options: CameraOptions): void {
  useFrame(({ camera }) => {
    const state = computeCamera(options);
    camera.position.set(state.position[0], state.position[1], state.position[2]);
    camera.lookAt(state.lookAt[0], state.lookAt[1], state.lookAt[2]);
    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(camera.fov - state.fov) > 0.01) {
        camera.fov = state.fov;
        camera.updateProjectionMatrix();
      }
    }
  });
}
