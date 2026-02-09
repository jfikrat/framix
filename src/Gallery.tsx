import React, { useState, useMemo } from "react";
import { Player } from "./Player";
import { RenderProgressModal } from "./components/RenderProgressModal";
import { presets, type VideoConfig, type AnimationProps } from "./animations";
import type { TemplateMeta } from "./templates/types";
import type { AudioTrack } from "./audio/types";

// 🔥 OTOMATİK TEMPLATE TARAMA - Vite glob import
const templateModules = import.meta.glob<{
  meta: TemplateMeta;
  audioTrack?: AudioTrack;
  default?: React.FC<AnimationProps>;
  [key: string]: React.FC<AnimationProps> | TemplateMeta | AudioTrack | undefined;
}>("./templates/*.tsx", { eager: true });

// Template'leri parse et
interface Template {
  id: string;
  name: string;
  category: string;
  color: string;
  component: React.FC<AnimationProps>;
  configOverride?: Partial<VideoConfig>;
  audioTrack?: AudioTrack;
}

function loadTemplates(): Template[] {
  const templates: Template[] = [];

  for (const [path, module] of Object.entries(templateModules)) {
    // types.ts'i atla
    if (path.includes("types.ts")) continue;

    const meta = module.meta;
    if (!meta) continue;

    // Component'i bul (default export veya named export)
    const componentName = Object.keys(module).find(
      (key) => key !== "meta" && key !== "default" && typeof module[key] === "function"
    );

    const component = module.default || (componentName ? module[componentName] : null);
    if (!component || typeof component !== "function") continue;

    const templateConfig = (module as Record<string, unknown>).templateConfig as Partial<VideoConfig> | undefined;
    const audioTrack = (module as Record<string, unknown>).audioTrack as AudioTrack | undefined;

    templates.push({
      id: meta.id,
      name: meta.name,
      category: meta.category,
      color: meta.color,
      component: component as React.FC<AnimationProps>,
      configOverride: templateConfig,
      audioTrack,
    });
  }

  return templates.sort((a, b) => a.name.localeCompare(b.name));
}

const categoryBadge: Record<string, { label: string; color: string }> = {
  promo: { label: "P", color: "#8b5cf6" },
  dynamic: { label: "D", color: "#f59e0b" },
  celebration: { label: "C", color: "#ec4899" },
  memorial: { label: "M", color: "#6b7280" },
  social: { label: "S", color: "#3b82f6" },
};

const config: VideoConfig = presets.instagramStory;

export const Gallery: React.FC = () => {
  const templates = useMemo(() => loadTemplates(), []);
  const [selectedId, setSelectedId] = useState(templates[0]?.id || "");
  const [renderJobId, setRenderJobId] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleCloseModal = () => {
    setRenderJobId(null);
    setIsRendering(false);
  };

  const handleRender = async () => {
    if (!selectedId || isRendering) return;

    setIsRendering(true);
    try {
      const response = await fetch("http://localhost:3001/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedId }),
      });

      if (!response.ok) {
        throw new Error("Render request failed");
      }

      const data = await response.json();
      setRenderJobId(data.jobId);
    } catch (error) {
      console.error("Render error:", error);
      setIsRendering(false);
    }
  };

  const selected = templates.find((t) => t.id === selectedId) || templates[0];
  const TemplateComponent = selected?.component;
  const activeConfig = selected?.configOverride ? { ...config, ...selected.configOverride } : config;

  if (!templates.length) {
    return <div style={{ color: "white", padding: 40 }}>No templates found</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "white", padding: 20 }}>
      {/* Header */}
      {!isFullscreen && (
        <>
          <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            🎬 Framix
          </h1>
          <p style={{ textAlign: "center", fontSize: 14, color: "#666", marginBottom: 24 }}>
            Instagram Story • {templates.length} template •
            <span style={{ color: "#22c55e", marginLeft: 8 }}>✨ Auto-discovery</span>
          </p>
        </>
      )}

      {/* Main layout */}
      <div style={{ display: isFullscreen ? "block" : "flex", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
        {/* Sidebar */}
        {!isFullscreen && (
          <div
            style={{
              width: 250,
              background: "#111",
              borderRadius: 12,
              padding: "12px 8px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                fontSize: 11,
                color: "#555",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "0 8px",
              }}
            >
              Templates ({templates.length})
            </h3>

            <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)", flex: 1 }}>
              {templates.map((t) => {
                const isActive = selectedId === t.id;
                const isHovered = hoveredId === t.id;
                const badge = categoryBadge[t.category.toLowerCase()];

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    onMouseEnter={() => setHoveredId(t.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      marginBottom: 2,
                      background: isActive
                        ? `${t.color}12`
                        : isHovered
                          ? "#1a1a1a"
                          : "transparent",
                      border: "none",
                      borderLeft: `3px solid ${isActive ? t.color : "transparent"}`,
                      borderRadius: "0 6px 6px 0",
                      color: "white",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.12s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 13,
                        color: isActive ? "#fff" : "#bbb",
                      }}
                    >
                      {t.name}
                    </span>
                    {badge && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: badge.color,
                          background: `${badge.color}18`,
                          padding: "2px 5px",
                          borderRadius: 3,
                          letterSpacing: 0.5,
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        {badge.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info */}
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                background: "#0a0a0a",
                borderRadius: 8,
                fontSize: 11,
                color: "#444",
              }}
            >
              <span style={{ color: "#22c55e" }}>✨</span>{" "}
              <span style={{ color: "#555" }}>src/templates/*.tsx</span>
            </div>
          </div>
        )}

        {/* Player */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {TemplateComponent && (
            <Player
              config={activeConfig}
              audioTrack={selected.audioTrack}
              key={selected.id}
              isFullscreen={isFullscreen}
              onFullscreenChange={setIsFullscreen}
            >
              {(frame) => <TemplateComponent frame={frame} config={activeConfig} />}
            </Player>
          )}

          {/* Render Button */}
          {!isFullscreen && (
            <button
              onClick={handleRender}
              disabled={isRendering || !selectedId}
              style={{
                marginTop: 16,
                padding: "12px 32px",
                fontSize: 16,
                fontWeight: 600,
                background: isRendering ? "#333" : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: isRendering ? "not-allowed" : "pointer",
                opacity: isRendering ? 0.7 : 1,
                transition: "all 0.2s",
                boxShadow: isRendering ? "none" : "0 4px 14px rgba(34, 197, 94, 0.4)",
              }}
            >
              {isRendering ? "⏳ Rendering..." : "🎬 Render Video"}
            </button>
          )}
        </div>
      </div>

      {/* Render Progress Modal */}
      <RenderProgressModal jobId={renderJobId} onClose={handleCloseModal} />
    </div>
  );
};
