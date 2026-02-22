import { useState, useEffect, useRef, useCallback } from "react";
import type { VideoConfig } from "./animations";
import type { AudioTrack } from "./audio/types";
import { AudioPreview } from "./audio/preview";

export interface PlaybackState {
  frame: number;
  setFrame: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  playbackSpeed: 0.5 | 1 | 2;
  setPlaybackSpeed: React.Dispatch<React.SetStateAction<0.5 | 1 | 2>>;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  actualFps: number;
  handlePlayPause: () => void;
  handleSeek: (targetFrame: number) => void;
  handleReset: () => void;
  handleSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  audioRef: React.MutableRefObject<AudioPreview | null>;
}

export function usePlayback(
  config: VideoConfig,
  audioTrack?: AudioTrack,
): PlaybackState {
  const { fps, durationInFrames } = config;

  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actualFps, setActualFps] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);

  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const audioRef = useRef<AudioPreview | null>(null);

  // Pause when tab goes to background
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setIsPlaying(false);
        audioRef.current?.pause();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

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
    const frameDuration = 1000 / fps / playbackSpeed;

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
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, fps, durationInFrames, playbackSpeed]);

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

  const handleSeek = useCallback((targetFrame: number) => {
    setFrame(targetFrame);
    setIsPlaying(false);
    audioRef.current?.pause();
    audioRef.current?.seekToFrame(targetFrame);
  }, []);

  const handleReset = useCallback(() => {
    setFrame(0);
    setIsPlaying(false);
    audioRef.current?.stop();
  }, []);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrame = parseInt(e.target.value, 10);
    setFrame(newFrame);
    setIsPlaying(false);
    audioRef.current?.pause();
    audioRef.current?.seekToFrame(newFrame);
  }, []);

  return {
    frame,
    setFrame,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isMuted,
    setIsMuted,
    actualFps,
    handlePlayPause,
    handleSeek,
    handleReset,
    handleSliderChange,
    audioRef,
  };
}
