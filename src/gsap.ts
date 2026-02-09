// GSAP Integration for Framix
// Timeline'ları paused + seek(frame/fps) modunda kullanarak
// DOM'a dokunmadan plain JS object animate eder.

import gsap from "gsap";
import { useRef } from "react";

// ─── useTimeline ─────────────────────────────────────────
// GSAP timeline oluşturur, her frame'de seek ile senkron ilerletir.
// builder callback ile timeline'ı konfigüre et, target objesini animate et.

interface UseTimelineConfig<T extends Record<string, number>> {
  initial: T;
  fps: number;
  frame: number;
  builder: (tl: gsap.core.Timeline, target: T) => void;
}

export function useTimeline<T extends Record<string, number>>(
  config: UseTimelineConfig<T>,
): T {
  const { initial, fps, frame, builder } = config;

  const ref = useRef<{
    tl: gsap.core.Timeline;
    target: T;
  } | null>(null);

  if (!ref.current) {
    const target = { ...initial };
    const tl = gsap.timeline({ paused: true });
    builder(tl, target);
    ref.current = { tl, target };
  }

  ref.current.tl.seek(frame / fps);

  return { ...ref.current.target };
}

// ─── useStagger ──────────────────────────────────────────
// N adet item'ı stagger delay ile animate eder.

interface StaggerConfig {
  count: number;
  fps: number;
  frame: number;
  startFrame: number;
  duration: number; // seconds
  stagger: number; // seconds between each item
  ease?: string;
  from: Record<string, number>;
  to: Record<string, number>;
}

interface StaggerItem {
  [key: string]: number;
}

export function useStagger(config: StaggerConfig): StaggerItem[] {
  const {
    count,
    fps,
    frame,
    startFrame,
    duration,
    stagger,
    ease = "power3.out",
    from,
    to,
  } = config;

  const ref = useRef<{
    tl: gsap.core.Timeline;
    targets: StaggerItem[];
  } | null>(null);

  if (!ref.current) {
    const targets: StaggerItem[] = [];
    const tl = gsap.timeline({ paused: true });

    for (let i = 0; i < count; i++) {
      const item = { ...from };
      targets.push(item);
      tl.to(item, {
        ...to,
        duration,
        ease,
      }, i * stagger);
    }

    ref.current = { tl, targets };
  }

  // Convert frame offset to timeline time
  const localFrame = frame - startFrame;
  const time = Math.max(0, localFrame / fps);
  ref.current.tl.seek(time);

  return ref.current.targets.map((t) => ({ ...t }));
}
