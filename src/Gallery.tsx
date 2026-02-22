import React, { useState, useMemo, useEffect, useRef } from "react";
import { RenderProgressModal } from "./components/RenderProgressModal";
import { presets, type VideoConfig, type AnimationProps } from "./animations";
import type { ProjectMeta, TimelineSegment } from "./templates/types";
import type { AudioTrack } from "./audio/types";
import type { InputSchema, InputValues } from "./inputs";
import { resolveInputs } from "./inputs";
import { FrameProvider } from "./Sequence";
import { usePlayback } from "./usePlayback";

// ─── Auto-discovery ──────────────────────────────────
const templateModules = import.meta.glob<{
  meta: ProjectMeta;
  audioTrack?: AudioTrack;
  timeline?: TimelineSegment[];
  default?: React.FC<AnimationProps>;
  [key: string]: React.FC<AnimationProps> | ProjectMeta | AudioTrack | TimelineSegment[] | undefined;
}>("./templates/*.tsx", { eager: true });

interface Project {
  id: string;
  name: string;
  brand?: string;
  category: string;
  color: string;
  component: React.FC<AnimationProps>;
  configOverride?: Partial<VideoConfig>;
  audioTrack?: AudioTrack;
  timeline?: TimelineSegment[];
  inputs?: InputSchema;
}

function loadProjects(): Project[] {
  const projects: Project[] = [];

  for (const [path, module] of Object.entries(templateModules)) {
    if (path.includes("types.ts")) continue;
    const meta = module.meta;
    if (!meta) continue;

    const explicitComponent = (module as Record<string, unknown>).Component as React.FC<AnimationProps> | undefined;
    const componentName = explicitComponent
      ? undefined
      : Object.keys(module).find(
          (key) =>
            key !== "meta" && key !== "default" && key !== "Component" && key !== "timeline" &&
            typeof module[key] === "function",
        );

    const component = explicitComponent ?? module.default ?? (componentName ? module[componentName] : null);
    if (!component || typeof component !== "function") continue;

    const templateConfig = (module as Record<string, unknown>).templateConfig as Partial<VideoConfig> | undefined;
    const audioTrack = (module as Record<string, unknown>).audioTrack as AudioTrack | undefined;
    const timeline = (module as Record<string, unknown>).timeline as TimelineSegment[] | undefined;

    projects.push({
      id: meta.id,
      name: meta.name,
      brand: meta.brand,
      category: meta.category,
      color: meta.color,
      component: component as React.FC<AnimationProps>,
      configOverride: templateConfig,
      audioTrack,
      timeline,
      inputs: meta.inputs,
    });
  }

  if (import.meta.env.DEV) {
    const seen = new Map<string, number>();
    for (const p of projects) seen.set(p.id, (seen.get(p.id) ?? 0) + 1);
    for (const [id, count] of seen.entries()) {
      if (count > 1) console.warn(`[Framix] Duplicate template id "${id}" (${count} templates)`);
    }
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

interface BrandGroup {
  brand: string;
  label: string;
  projects: Project[];
}

function groupByBrand(projects: Project[]): BrandGroup[] {
  const brandMap = new Map<string, Project[]>();
  for (const p of projects) {
    const key = p.brand || "__general__";
    if (!brandMap.has(key)) brandMap.set(key, []);
    brandMap.get(key)!.push(p);
  }
  const groups: BrandGroup[] = [];
  const brandKeys = [...brandMap.keys()].filter((k) => k !== "__general__").sort();
  for (const key of brandKeys) {
    groups.push({ brand: key, label: key.toUpperCase(), projects: brandMap.get(key)! });
  }
  if (brandMap.has("__general__")) {
    groups.push({ brand: "__general__", label: "GENEL", projects: brandMap.get("__general__")! });
  }
  return groups;
}

// ─── Timecode ────────────────────────────────────────
function toTimecode(frame: number, fps: number): string {
  const totalSec = Math.floor(frame / fps);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const ff = String(frame % fps).padStart(2, "0");
  return `${mm}:${ss}:${ff}`;
}

// ─── SequencerBar ────────────────────────────────────
const SequencerBar: React.FC<{
  timeline: TimelineSegment[];
  totalFrames: number;
  currentFrame: number;
  onSeek: (frame: number) => void;
}> = ({ timeline, totalFrames, currentFrame, onSeek }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", height: 20, overflow: "hidden", background: "#0a0a0a", cursor: "pointer" }}>
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
              opacity: isActive ? 1 : isHovered ? 0.8 : 0.45,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.12s",
              borderRight: i < timeline.length - 1 ? "1px solid #0a0a0a" : "none",
              boxShadow: isActive ? "inset 0 0 12px rgba(255,255,255,0.15)" : "none",
            }}
            title={`${seg.name} (${seg.from}–${segEnd})`}
          >
            {widthPct > 8 && (
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 4px", maxWidth: "100%" }}>
                {seg.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── InputsPanel ─────────────────────────────────────
const InputsPanel: React.FC<{
  schema: InputSchema;
  values: InputValues;
  onChange: (key: string, value: string | number | boolean) => void;
}> = ({ schema, values, onChange }) => {
  const entries = Object.entries(schema);
  if (!entries.length) return null;

  const inputStyle: React.CSSProperties = {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 5,
    color: "white",
    padding: "5px 7px",
    fontSize: 12,
    width: "100%",
    outline: "none",
  };

  return (
    <>
      <div style={{ height: 1, background: "#1a1a1a", margin: "16px 0 12px" }} />
      <div style={{ fontSize: 10, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
        Inputs
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map(([key, field]) => (
          <div key={key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 11, color: "#555" }}>{field.label}</label>
            {field.type === "text" && (
              <input type="text" value={String(values[key] ?? field.default)} placeholder={field.placeholder} onChange={(e) => onChange(key, e.target.value)} style={inputStyle} />
            )}
            {field.type === "number" && (
              <input type="number" value={Number(values[key] ?? field.default)} min={field.min} max={field.max} onChange={(e) => onChange(key, parseFloat(e.target.value))} style={inputStyle} />
            )}
            {field.type === "color" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="color" value={String(values[key] ?? field.default)} onChange={(e) => onChange(key, e.target.value)} style={{ width: 26, height: 26, border: "none", borderRadius: 4, cursor: "pointer", padding: 0 }} />
                <span style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>{String(values[key] ?? field.default)}</span>
              </div>
            )}
            {field.type === "boolean" && (
              <button
                onClick={() => onChange(key, !(values[key] ?? field.default))}
                style={{ width: 36, height: 20, borderRadius: 10, border: "none", background: (values[key] ?? field.default) ? "#8b5cf6" : "#2a2a2a", cursor: "pointer", position: "relative" }}
              >
                <span style={{ position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.15s", left: (values[key] ?? field.default) ? 17 : 2 }} />
              </button>
            )}
            {field.type === "select" && (
              <select value={String(values[key] ?? field.default)} onChange={(e) => onChange(key, e.target.value)} style={inputStyle}>
                {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

// ─── Default config ──────────────────────────────────
const defaultConfig: VideoConfig = presets.instagramStory;

// ─── Gallery ─────────────────────────────────────────
export const Gallery: React.FC = () => {
  const projects = useMemo(() => loadProjects(), []);
  const brandGroups = useMemo(() => groupByBrand(projects), [projects]);
  const [selectedId, setSelectedId] = useState(projects[0]?.id || "");
  const [renderJobId, setRenderJobId] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValues, setInputValues] = useState<InputValues>({});
  const [collapsedBrands, setCollapsedBrands] = useState<Set<string>>(new Set());
  const [viewportSize, setViewportSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  const selected = projects.find((t) => t.id === selectedId) || projects[0];
  const TemplateComponent = selected?.component;
  const activeConfig = selected?.configOverride ? { ...defaultConfig, ...selected.configOverride } : defaultConfig;
  const resolvedInputs = selected?.inputs ? resolveInputs(selected.inputs, inputValues) : {};

  const playback = usePlayback(activeConfig, selected?.audioTrack);
  const { frame, isPlaying, playbackSpeed, setPlaybackSpeed, isMuted, setIsMuted, actualFps, handlePlayPause, handleSeek, handleReset, handleSliderChange } = playback;

  const { fps, width, height, durationInFrames } = activeConfig;

  // Reset on template change
  useEffect(() => {
    handleReset();
    setInputValues({});
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Viewport resize
  useEffect(() => {
    const onResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleSeek(Math.max(0, frame - (e.shiftKey ? 10 : 1)));
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSeek(Math.min(durationInFrames - 1, frame + (e.shiftKey ? 10 : 1)));
          break;
        case "r":
        case "Home":
          handleReset();
          break;
        case "f":
          setIsFullscreen((v) => !v);
          break;
        case "Escape":
          if (isFullscreen) setIsFullscreen(false);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [frame, isFullscreen, durationInFrames, handlePlayPause, handleSeek, handleReset]);

  const filteredGroups = useMemo(
    () =>
      brandGroups
        .map((g) => ({
          ...g,
          projects: g.projects.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (p.brand ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((g) => g.projects.length > 0),
    [brandGroups, searchQuery],
  );

  const matchCount = searchQuery ? filteredGroups.reduce((sum, g) => sum + g.projects.length, 0) : null;

  const toggleBrand = (brand: string) => {
    setCollapsedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  };

  const handleCloseModal = () => {
    setRenderJobId(null);
    setIsRendering(false);
  };

  const handleRender = async () => {
    if (!selectedId || isRendering) return;
    setIsRendering(true);
    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedId }),
      });
      if (!response.ok) throw new Error("Render request failed");
      const data = await response.json();
      setRenderJobId(data.jobId);
    } catch (error) {
      console.error("Render error:", error);
      setIsRendering(false);
    }
  };

  // Scale for viewport
  const viewScale = isFullscreen
    ? Math.min(viewportSize.w / width, viewportSize.h / height) * 0.88
    : Math.min(600 / width, 750 / height);

  const formatAspect = (() => {
    if (width === height) return "1:1 · Square";
    if (width < height) return "9:16 · Vertical";
    return "16:9 · Horizontal";
  })();

  if (!projects.length) {
    return <div style={{ color: "white", padding: 40 }}>No projects found</div>;
  }

  // ─── Canvas content (shared between normal + fullscreen) ───
  const canvasContent = TemplateComponent ? (
    <div style={{ width: width * viewScale, height: height * viewScale, overflow: "hidden", flexShrink: 0 }}>
      <div style={{ transform: `scale(${viewScale})`, transformOrigin: "top left", width, height }}>
        <FrameProvider frame={frame} config={activeConfig}>
          {(() => {
            const C = TemplateComponent as React.FC<AnimationProps & { inputs?: InputValues }>;
            return <C frame={frame} config={activeConfig} inputs={resolvedInputs} />;
          })()}
        </FrameProvider>
      </div>
    </div>
  ) : null;

  // ─── Timeline bar content ─────────────────────────────────
  const timelineBar = (
    <div
      style={{
        gridArea: "bar",
        background: "#111",
        borderTop: "1px solid #1a1a1a",
        padding: "0 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 4,
        ...(isFullscreen ? {
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(16px)",
          padding: "6px 20px",
        } : {}),
      }}
    >
      {/* Sequencer */}
      {selected?.timeline && selected.timeline.length > 0 && (
        <SequencerBar
          timeline={selected.timeline}
          totalFrames={durationInFrames}
          currentFrame={frame}
          onSeek={handleSeek}
        />
      )}

      {/* Scrubber */}
      <input
        type="range"
        min={0}
        max={durationInFrames - 1}
        value={frame}
        onChange={handleSliderChange}
        style={{ width: "100%", height: 4, borderRadius: 2, cursor: "pointer", accentColor: "#e53e3e", margin: 0 }}
      />

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, height: 36 }}>
        {/* Reset */}
        <button onClick={handleReset} title="Reset [R]" style={ctrlBtnStyle}>
          ⏮
        </button>
        {/* -1 frame */}
        <button onClick={() => handleSeek(Math.max(0, frame - 1))} style={ctrlBtnStyle}>
          ‹
        </button>
        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          style={{
            ...ctrlBtnStyle,
            background: isPlaying ? "#e53e3e22" : "#22c55e22",
            border: `1px solid ${isPlaying ? "#e53e3e44" : "#22c55e44"}`,
            color: isPlaying ? "#e53e3e" : "#22c55e",
            width: 52,
            fontWeight: 700,
          }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        {/* +1 frame */}
        <button onClick={() => handleSeek(Math.min(durationInFrames - 1, frame + 1))} style={ctrlBtnStyle}>
          ›
        </button>

        {/* Speed */}
        <div style={{ display: "flex", gap: 2, marginLeft: 4 }}>
          {([0.5, 1, 2] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              style={{
                ...ctrlBtnStyle,
                background: playbackSpeed === speed ? "#8b5cf622" : "transparent",
                border: `1px solid ${playbackSpeed === speed ? "#8b5cf644" : "transparent"}`,
                color: playbackSpeed === speed ? "#8b5cf6" : "#555",
                fontSize: 11,
                padding: "0 6px",
              }}
            >
              {speed}×
            </button>
          ))}
        </div>

        {/* Mute (if audio) */}
        {selected?.audioTrack && (
          <button
            onClick={() => setIsMuted((m) => !m)}
            title={isMuted ? "Unmute" : "Mute"}
            style={{ ...ctrlBtnStyle, color: isMuted ? "#e53e3e" : "#555" }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={() => setIsFullscreen((v) => !v)}
          title={isFullscreen ? "Exit Fullscreen [ESC]" : "Fullscreen [F]"}
          style={{ ...ctrlBtnStyle, color: isFullscreen ? "#60a5fa" : "#555" }}
        >
          {isFullscreen ? "⊠" : "⊡"}
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* FPS counter (when playing) */}
        {isPlaying && (
          <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>
            {actualFps || fps}fps
          </span>
        )}

        {/* Timecode */}
        <span style={{ fontSize: 12, color: "#555", fontFamily: "monospace", letterSpacing: 0.5 }}>
          {toTimecode(frame, fps)}
        </span>

        {/* Render */}
        <button
          onClick={handleRender}
          disabled={isRendering || !selectedId}
          style={{
            padding: "0 14px",
            height: 28,
            fontSize: 12,
            fontWeight: 600,
            background: isRendering ? "#1a1a1a" : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            color: isRendering ? "#555" : "white",
            border: "none",
            borderRadius: 6,
            cursor: isRendering ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            boxShadow: isRendering ? "none" : "0 2px 8px rgba(34,197,94,0.3)",
            marginLeft: 4,
          }}
        >
          {isRendering ? "Rendering…" : "RENDER"}
        </button>
      </div>
    </div>
  );

  // ─── Fullscreen mode ──────────────────────────────────────
  if (isFullscreen) {
    return (
      <>
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {canvasContent}
        </div>
        {timelineBar}
        <RenderProgressModal jobId={renderJobId} templateId={selectedId} onClose={handleCloseModal} />
      </>
    );
  }

  // ─── Normal 4-panel layout ────────────────────────────────
  return (
    <div
      style={{
        display: "grid",
        gridTemplate: `"topbar topbar topbar" 32px "lib view ins" 1fr "lib bar ins" 108px / 280px 1fr 260px`,
        height: "100vh",
        overflow: "hidden",
        background: "#0a0a0a",
        color: "white",
      }}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          gridArea: "topbar",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid #1a1a1a",
          background: "#0d0d0d",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#444", letterSpacing: 1, fontFamily: "monospace" }}>
          FRAMIX
        </span>
        <span style={{ marginLeft: 12, fontSize: 11, color: "#2a2a2a" }}>
          {projects.length} templates · {formatAspect}
        </span>
      </div>

      {/* ── Library Panel ── */}
      <div
        style={{
          gridArea: "lib",
          background: "#0d0d0d",
          borderRight: "1px solid #1a1a1a",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Search */}
        <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
              Library
            </span>
            <span style={{ fontSize: 10, color: matchCount !== null ? "#8b5cf6" : "#333", fontVariantNumeric: "tabular-nums" }}>
              {matchCount !== null ? `${matchCount} / ${projects.length}` : projects.length}
            </span>
          </div>
          <input
            type="text"
            placeholder="Filter…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              fontSize: 12,
              padding: "6px 10px",
              background: "#111",
              border: "1px solid #222",
              borderRadius: 6,
              color: "white",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#444")}
            onBlur={(e) => (e.target.style.borderColor = "#222")}
          />
        </div>

        {/* Brand groups */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filteredGroups.map((group) => {
            const isCollapsed = collapsedBrands.has(group.brand);
            return (
              <div key={group.brand}>
                {/* Group header */}
                <button
                  onClick={() => toggleBrand(group.brand)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 12px",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid #151515",
                    color: "#444",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                  }}
                >
                  <span style={{ fontSize: 8, opacity: 0.7 }}>{isCollapsed ? "▶" : "▾"}</span>
                  {group.label}
                  <span style={{ marginLeft: "auto", fontSize: 9, color: "#333" }}>{group.projects.length}</span>
                </button>

                {/* Cards */}
                {!isCollapsed && group.projects.map((t) => {
                  const isActive = selectedId === t.id;
                  const isHovered = hoveredId === t.id;
                  const durationSec = ((t.configOverride?.durationInFrames ?? defaultConfig.durationInFrames) / (t.configOverride?.fps ?? defaultConfig.fps)).toFixed(1);
                  const aspect = (() => {
                    const w = t.configOverride?.width ?? defaultConfig.width;
                    const h = t.configOverride?.height ?? defaultConfig.height;
                    if (w === h) return "1:1";
                    if (w < h) return "9:16";
                    return "16:9";
                  })();

                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      onMouseEnter={() => setHoveredId(t.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        width: "calc(100% - 16px)",
                        padding: 0,
                        background: isActive ? `${t.color}10` : isHovered ? "#161616" : "transparent",
                        border: `1px solid ${isActive ? t.color + "50" : "transparent"}`,
                        borderRadius: 6,
                        margin: "3px 8px",
                        cursor: "pointer",
                        textAlign: "left",
                        overflow: "hidden",
                        transition: "all 0.1s",
                      }}
                    >
                      {/* Color band */}
                      <div style={{ height: 3, background: t.color, opacity: isActive ? 1 : 0.5 }} />
                      {/* Card body */}
                      <div style={{ padding: "6px 10px 8px" }}>
                        <div style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? "#fff" : "#bbb", marginBottom: 3, lineHeight: 1.3 }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: 10, color: "#444" }}>
                          {[t.brand, t.category, aspect, `${durationSec}s`].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {filteredGroups.length === 0 && (
            <div style={{ padding: "20px 12px", fontSize: 12, color: "#333", textAlign: "center" }}>No matches</div>
          )}
        </div>
      </div>

      {/* ── Viewport ── */}
      <div
        style={{
          gridArea: "view",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {canvasContent}
      </div>

      {/* ── Inspector Panel ── */}
      <div
        style={{
          gridArea: "ins",
          background: "#0d0d0d",
          borderLeft: "1px solid #1a1a1a",
          padding: 16,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selected && (
          <>
            {/* Template name */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f0", lineHeight: 1.3, marginBottom: 6 }}>
                {selected.name}
              </div>
              {selected.brand && (
                <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, color: selected.color, background: `${selected.color}18`, padding: "2px 8px", borderRadius: 20, letterSpacing: 0.5 }}>
                  {selected.brand.toUpperCase()}
                </span>
              )}
            </div>

            <div style={{ height: 1, background: "#1a1a1a", marginBottom: 14 }} />

            {/* Config rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Resolution", `${width} × ${height}`],
                ["FPS", String(fps)],
                ["Duration", `${(durationInFrames / fps).toFixed(1)}s (${durationInFrames}f)`],
                ["Format", formatAspect],
                ["Category", selected.category],
                ["Frame", `${frame} / ${durationInFrames}`],
                ["FPS (actual)", isPlaying ? String(actualFps || fps) : "—"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#444" }}>{label}</span>
                  <span style={{ fontSize: 11, color: "#888", fontFamily: "monospace", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Inputs */}
            {selected.inputs && Object.keys(selected.inputs).length > 0 ? (
              <InputsPanel
                schema={selected.inputs}
                values={resolvedInputs}
                onChange={(key, value) => setInputValues((prev) => ({ ...prev, [key]: value }))}
              />
            ) : (
              <>
                <div style={{ height: 1, background: "#1a1a1a", margin: "16px 0 12px" }} />
                <span style={{ fontSize: 11, color: "#333" }}>No template inputs</span>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Timeline Bar ── */}
      {timelineBar}

      <RenderProgressModal jobId={renderJobId} templateId={selectedId} onClose={handleCloseModal} />
    </div>
  );
};

// ─── Control button base style ────────────────────────
const ctrlBtnStyle: React.CSSProperties = {
  height: 28,
  minWidth: 28,
  padding: "0 8px",
  fontSize: 14,
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: 5,
  color: "#666",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.1s",
  lineHeight: 1,
};
