import React, { useState, useMemo } from "react";
import { Player } from "./Player";
import { RenderProgressModal } from "./components/RenderProgressModal";
import { presets, type VideoConfig, type AnimationProps } from "./animations";
import type { TemplateMeta } from "./templates/types";

// 🔥 OTOMATİK TEMPLATE TARAMA - Vite glob import
const templateModules = import.meta.glob<{
  meta: TemplateMeta;
  default?: React.FC<AnimationProps>;
  [key: string]: React.FC<AnimationProps> | TemplateMeta | undefined;
}>("./templates/*.tsx", { eager: true });

// Template'leri parse et
interface Template {
  id: string;
  name: string;
  category: string;
  color: string;
  component: React.FC<AnimationProps>;
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

    templates.push({
      id: meta.id,
      name: meta.name,
      category: meta.category,
      color: meta.color,
      component: component as React.FC<AnimationProps>,
    });
  }

  return templates.sort((a, b) => a.name.localeCompare(b.name));
}

const config: VideoConfig = presets.instagramStory;

export const Gallery: React.FC = () => {
  const templates = useMemo(() => loadTemplates(), []);
  const [selectedId, setSelectedId] = useState(templates[0]?.id || "");
  const [renderJobId, setRenderJobId] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

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

  if (!templates.length) {
    return <div style={{ color: "white", padding: 40 }}>No templates found</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "white", padding: 20 }}>
      {/* Header */}
      <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        🎬 Framix
      </h1>
      <p style={{ textAlign: "center", fontSize: 14, color: "#666", marginBottom: 24 }}>
        Instagram Story • {templates.length} template •
        <span style={{ color: "#22c55e", marginLeft: 8 }}>✨ Auto-discovery</span>
      </p>

      {/* Main layout */}
      <div style={{ display: "flex", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
        {/* Sidebar */}
        <div style={{ width: 260, background: "#111", borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 12, color: "#666", marginBottom: 16, textTransform: "uppercase", letterSpacing: 2 }}>
            Templates ({templates.length})
          </h3>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              style={{
                width: "100%",
                padding: 14,
                marginBottom: 8,
                background: selectedId === t.id ? "#222" : "transparent",
                border: selectedId === t.id ? `2px solid ${t.color}` : "2px solid transparent",
                borderRadius: 8,
                color: "white",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: t.color }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</span>
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4, marginLeft: 24, textTransform: "uppercase" }}>
                {t.category}
              </div>
            </button>
          ))}

          {/* Info */}
          <div style={{ marginTop: 20, padding: 12, background: "#0a0a0a", borderRadius: 8, fontSize: 12, color: "#555" }}>
            <div style={{ color: "#22c55e", marginBottom: 6 }}>✨ Otomatik Tarama</div>
            <div>src/templates/*.tsx</div>
            <div style={{ marginTop: 4, color: "#444" }}>Yeni dosya ekle → anında görünür</div>
          </div>
        </div>

        {/* Player */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {TemplateComponent && (
            <Player config={config}>
              {(frame) => <TemplateComponent frame={frame} config={config} />}
            </Player>
          )}

          {/* Render Button */}
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
        </div>
      </div>

      {/* Render Progress Modal */}
      <RenderProgressModal jobId={renderJobId} onClose={handleCloseModal} />
    </div>
  );
};
