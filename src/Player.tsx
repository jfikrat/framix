import React, { useState, useEffect, useRef, useCallback } from "react";
import type { VideoConfig } from "./animations";
import type { AudioTrack } from "./audio/types";
import type { TimelineSegment } from "./templates/types";
import { AudioPreview } from "./audio/preview";
import { FrameProvider } from "./Sequence";

interface PlayerProps {
  children: (frame: number) => React.ReactNode;
  config: VideoConfig;
  audioTrack?: AudioTrack;
  timeline?: TimelineSegment[];
  isFullscreen?: boolean;
  onFullscreenChange?: (fs: boolean) => void;
}

// ─── Sequencer Bar ──────────────────────────────────
const SequencerBar: React.FC<{
  timeline: TimelineSegment[];
  totalFrames: number;
  currentFrame: number;
  onSeek: (frame: number) => void;
  width: number;
}> = ({ timeline, totalFrames, currentFrame, onSeek, width }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div
      style={{
        width,
        display: "flex",
        height: 28,
        borderRadius: 6,
        overflow: "hidden",
        background: "#0a0a0a",
        border: "1px solid #222",
        marginTop: 12,
        cursor: "pointer",
      }}
    >
      {timeline.map((seg, i) => {
        const widthPct = (seg.durationInFrames / totalFrames) * 100;
        const segEnd = seg.from + seg.durationInFrames;
        const isActive = currentFrame >= seg.from && currentFrame < segEnd;
        const isHovered = hoveredIdx === i;

        return (
          <div
            key={i}
            onClick={() => onSeek(seg.from)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              width: `${widthPct}%`,
              height: "100%",
              background: seg.color,
              opacity: isActive ? 1 : isHovered ? 0.8 : 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "opacity 0.15s",
              borderRight: i < timeline.length - 1 ? "1px solid #0a0a0a" : "none",
              boxShadow: isActive ? `inset 0 0 12px rgba(255,255,255,0.15)` : "none",
            }}
            title={`${seg.name} (${seg.from}–${segEnd})`}
          >
            {widthPct > 8 && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  letterSpacing: 0.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  padding: "0 4px",
                  maxWidth: "100%",
                }}
              >
                {seg.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Player ─────────────────────────────────────────
export const Player: React.FC<PlayerProps> = ({
  children,
  config,
  audioTrack,
  timeline,
  isFullscreen = false,
  onFullscreenChange,
}) => {
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actualFps, setActualFps] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const audioRef = useRef<AudioPreview | null>(null);

  const { fps, width, height, durationInFrames } = config;

  const scale = isFullscreen
    ? Math.min(viewportSize.w / width, viewportSize.h / height) * 0.88
    : Math.min(600 / width, 750 / height);

  // Viewport resize tracking (for fullscreen)
  useEffect(() => {
    const onResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ESC to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFullscreenChange?.(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, onFullscreenChange]);

  // Audio preview init
  useEffect(() => {
    if (!audioTrack) return;
    const preview = new AudioPreview(audioTrack, durationInFrames, fps);
    audioRef.current = preview;
    return () => {
      preview.dispose();
      audioRef.current = null;
    };
  }, [audioTrack, durationInFrames, fps]);

  // Sync mute state
  useEffect(() => {
    audioRef.current?.setMuted(isMuted);
  }, [isMuted]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    let animationId: number;
    let lastFrameTime = performance.now();
    const frameDuration = 1000 / fps;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTime;

      if (elapsed >= frameDuration) {
        setFrame((prev) => {
          const next = prev + 1;
          if (next >= durationInFrames) {
            setIsPlaying(false);
            audioRef.current?.stop();
            return 0;
          }
          return next;
        });
        lastFrameTime = currentTime - (elapsed % frameDuration);

        frameCountRef.current++;
        if (currentTime - lastTimeRef.current >= 1000) {
          setActualFps(frameCountRef.current);
          frameCountRef.current = 0;
          lastTimeRef.current = currentTime;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, fps, durationInFrames]);

  const handlePlayPause = useCallback(() => {
    if (frame >= durationInFrames - 1) {
      setFrame(0);
      audioRef.current?.seekToFrame(0);
    }
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        audioRef.current?.play(frame >= durationInFrames - 1 ? 0 : frame);
      } else {
        audioRef.current?.pause();
      }
      return next;
    });
  }, [frame, durationInFrames]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrame = parseInt(e.target.value, 10);
    setFrame(newFrame);
    setIsPlaying(false);
    audioRef.current?.pause();
    audioRef.current?.seekToFrame(newFrame);
  };

  const handleSeek = (targetFrame: number) => {
    setFrame(targetFrame);
    setIsPlaying(false);
    audioRef.current?.pause();
    audioRef.current?.seekToFrame(targetFrame);
  };

  const handleReset = () => {
    setFrame(0);
    setIsPlaying(false);
    audioRef.current?.stop();
  };

  const currentTime = (frame / fps).toFixed(2);
  const totalTime = (durationInFrames / fps).toFixed(2);

  const controlsWidth = isFullscreen ? Math.min(width * scale, viewportSize.w * 0.9) : width * scale;

  const sequencerBar = timeline && timeline.length > 0 ? (
    <SequencerBar
      timeline={timeline}
      totalFrames={durationInFrames}
      currentFrame={frame}
      onSeek={handleSeek}
      width={controlsWidth}
    />
  ) : null;

  const controlsContent = (
    <div
      style={{
        width: controlsWidth,
        marginTop: isFullscreen ? 0 : sequencerBar ? 0 : 16,
        padding: isFullscreen ? "12px 20px" : 16,
        background: isFullscreen ? "rgba(15,15,15,0.85)" : "#151515",
        borderRadius: isFullscreen ? 16 : 12,
        backdropFilter: isFullscreen ? "blur(12px)" : undefined,
      }}
    >
      {/* Timeline slider */}
      <input
        type="range"
        min={0}
        max={durationInFrames - 1}
        value={frame}
        onChange={handleSliderChange}
        style={{
          width: "100%",
          height: 6,
          borderRadius: 4,
          cursor: "pointer",
          accentColor: "#e53e3e",
        }}
      />

      {/* Time display */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#666",
          marginTop: 6,
          marginBottom: 12,
        }}
      >
        <span>{currentTime}s</span>
        <span>{totalTime}s</span>
      </div>

      {/* Buttons & Stats */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={handlePlayPause}
          style={{
            padding: "10px 24px",
            fontSize: 15,
            background: isPlaying ? "#e53e3e" : "#22c55e",
            border: "none",
            borderRadius: 8,
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
            transition: "background 0.15s",
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: "10px 14px",
            fontSize: 15,
            background: "#2a2a2a",
            border: "none",
            borderRadius: 8,
            color: "white",
            cursor: "pointer",
          }}
        >
          Reset
        </button>

        {audioTrack && (
          <button
            onClick={() => setIsMuted((m) => !m)}
            style={{
              padding: "10px 14px",
              fontSize: 15,
              background: isMuted ? "#4a1a1a" : "#2a2a2a",
              border: "none",
              borderRadius: 8,
              color: isMuted ? "#e53e3e" : "white",
              cursor: "pointer",
            }}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? "Muted" : "Sound"}
          </button>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={() => onFullscreenChange?.(!isFullscreen)}
          style={{
            padding: "10px 14px",
            fontSize: 15,
            background: isFullscreen ? "#1a2a4a" : "#2a2a2a",
            border: "none",
            borderRadius: 8,
            color: isFullscreen ? "#60a5fa" : "white",
            cursor: "pointer",
          }}
          title={isFullscreen ? "Exit Fullscreen (ESC)" : "Fullscreen"}
        >
          {isFullscreen ? "Exit" : "Full"}
        </button>

        {/* Stats */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 16, fontSize: 13, color: "#888" }}>
          <span>
            Frame: <strong style={{ color: "white" }}>{frame}</strong> / {durationInFrames}
          </span>
          <span>
            FPS: <strong style={{ color: isPlaying ? "#22c55e" : "#666" }}>{actualFps || fps}</strong>
          </span>
        </div>
      </div>
    </div>
  );

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Video */}
        <div
          style={{
            width: width * scale,
            height: height * scale,
            background: "#000",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width,
              height,
            }}
          >
            <FrameProvider frame={frame} config={config}>
              {children(frame)}
            </FrameProvider>
          </div>
        </div>

        {/* Controls overlay at bottom */}
        <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {sequencerBar}
          {controlsContent}
        </div>
      </div>
    );
  }

  // Normal mode
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Video container */}
      <div
        style={{
          width: width * scale,
          height: height * scale,
          background: "#000",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width,
            height,
          }}
        >
          <FrameProvider frame={frame} config={config}>
            {children(frame)}
          </FrameProvider>
        </div>
      </div>

      {/* Sequencer bar */}
      {sequencerBar}

      {/* Controls */}
      <div style={{ marginTop: sequencerBar ? 0 : undefined }}>
        {controlsContent}
      </div>
    </div>
  );
};
