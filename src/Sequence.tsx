import React, { createContext, useContext } from "react";
import type { VideoConfig } from "./animations";

// ─── Global Frame Context ────────────────────────────
// Holds the top-level (global) frame number.
// FrameProvider sets it; Sequence never overrides it.
const GlobalFrameContext = createContext<number | null>(null);

/**
 * Get the global (top-level) frame number from anywhere in the tree,
 * even when nested inside <Sequence> components.
 */
export function useGlobalFrame(): number {
  const globalFrame = useContext(GlobalFrameContext);
  if (globalFrame === null)
    throw new Error("useGlobalFrame must be used within a FrameProvider");
  return globalFrame;
}

// ─── Frame Context ───────────────────────────────────
interface FrameContextValue {
  frame: number;
  config: VideoConfig;
}

const FrameContext = createContext<FrameContextValue | null>(null);

/**
 * Provides frame + config to the component tree.
 * Wrap your template root with this in Player.
 */
export const FrameProvider: React.FC<{
  frame: number;
  config: VideoConfig;
  children: React.ReactNode;
}> = ({ frame, config, children }) => (
  <GlobalFrameContext.Provider value={frame}>
    <FrameContext.Provider value={{ frame, config }}>
      {children}
    </FrameContext.Provider>
  </GlobalFrameContext.Provider>
);

/**
 * Get the current (local) frame number.
 * Inside a <Sequence>, this returns the frame relative to that Sequence's start.
 */
export function useCurrentFrame(): number {
  const ctx = useContext(FrameContext);
  if (!ctx) throw new Error("useCurrentFrame must be used within a FrameProvider or Sequence");
  return ctx.frame;
}

/**
 * Get the video config from context.
 */
export function useVideoConfig(): VideoConfig {
  const ctx = useContext(FrameContext);
  if (!ctx) throw new Error("useVideoConfig must be used within a FrameProvider or Sequence");
  return ctx.config;
}

// ─── Sequence Component ──────────────────────────────
interface SequenceProps {
  /** Frame offset from parent (when this sequence starts) */
  from?: number;
  /** Duration in frames (how long this sequence lasts) */
  durationInFrames: number;
  children: React.ReactNode;
}

/**
 * A time slice of the video. Children receive a local frame (0-based)
 * and are only rendered when the parent frame is within range.
 *
 * Usage:
 *   <Sequence from={55} durationInFrames={50}>
 *     <Card />  // useCurrentFrame() returns 0-49
 *   </Sequence>
 */
export const Sequence: React.FC<SequenceProps> = ({ from = 0, durationInFrames, children }) => {
  const parentCtx = useContext(FrameContext);
  if (!parentCtx) throw new Error("Sequence must be used within a FrameProvider");

  const localFrame = parentCtx.frame - from;

  // Not in range — don't render
  if (localFrame < 0 || localFrame >= durationInFrames) return null;

  // Scope config.durationInFrames to this Sequence's local duration
  // so that presets using ctx.durationInFrames work correctly within the Sequence.
  const localConfig: VideoConfig = {
    ...parentCtx.config,
    durationInFrames,
  };

  return (
    <FrameContext.Provider value={{ frame: localFrame, config: localConfig }}>
      {children}
    </FrameContext.Provider>
  );
};
