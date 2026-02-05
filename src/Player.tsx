import React, { useState, useEffect, useRef, useCallback } from "react";
import type { VideoConfig } from "./animations";
import type { AudioTrack } from "./audio/types";
import { AudioPreview } from "./audio/preview";

interface PlayerProps {
  children: (frame: number) => React.ReactNode;
  config: VideoConfig;
  audioTrack?: AudioTrack;
}

export const Player: React.FC<PlayerProps> = ({ children, config, audioTrack }) => {
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actualFps, setActualFps] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const audioRef = useRef<AudioPreview | null>(null);

  const { fps, width, height, durationInFrames } = config;
  const scale = Math.min(420 / width, 750 / height);

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

  const handleReset = () => {
    setFrame(0);
    setIsPlaying(false);
    audioRef.current?.stop();
  };

  const currentTime = (frame / fps).toFixed(2);
  const totalTime = (durationInFrames / fps).toFixed(2);

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
          {children(frame)}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          width: width * scale,
          marginTop: 16,
          padding: 16,
          background: "#151515",
          borderRadius: 12,
        }}
      >
        {/* Timeline */}
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
            {isPlaying ? "⏸ Pause" : "▶ Play"}
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
            ⏮
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
              {isMuted ? "🔇" : "🔊"}
            </button>
          )}

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
    </div>
  );
};
