import React, { useState, useEffect } from "react";
import { defaultConfig, type VideoConfig, type AnimationProps } from "./animations";
import type { TemplateMeta } from "./templates/types";
import type { AudioTrack } from "./audio/types";

// Same glob pattern as Gallery
const templateModules = import.meta.glob<{
  meta: TemplateMeta;
  audioTrack?: AudioTrack;
  default?: React.FC<AnimationProps>;
  [key: string]: React.FC<AnimationProps> | TemplateMeta | AudioTrack | undefined;
}>("./templates/*.tsx", { eager: true });

function findTemplate(templateId: string) {
  for (const [path, module] of Object.entries(templateModules)) {
    if (path.includes("types.ts")) continue;
    const meta = module.meta;
    if (!meta || meta.id !== templateId) continue;

    const componentName = Object.keys(module).find(
      (key) => key !== "meta" && key !== "default" && typeof module[key] === "function"
    );
    const component = module.default || (componentName ? module[componentName] : null);
    if (!component || typeof component !== "function") continue;

    const templateConfig = (module as Record<string, unknown>).templateConfig as
      | Partial<VideoConfig>
      | undefined;

    return {
      component: component as React.FC<AnimationProps>,
      config: { ...defaultConfig, ...templateConfig } as VideoConfig,
    };
  }
  return null;
}

interface RenderViewProps {
  templateId: string;
}

export const RenderView: React.FC<RenderViewProps> = ({ templateId }) => {
  const [frame, setFrame] = useState(0);
  const template = findTemplate(templateId);

  useEffect(() => {
    if (!template) return;
    // Expose controls to Puppeteer
    (window as any).__setFrame = (f: number) => setFrame(f);
    (window as any).__config = template.config;
    (window as any).__renderReady = true;
  }, [template]);

  if (!template) {
    return (
      <div style={{ color: "red", padding: 20, fontFamily: "monospace" }}>
        Template not found: {templateId}
      </div>
    );
  }

  const { component: Component, config } = template;

  return (
    <div style={{ width: config.width, height: config.height, overflow: "hidden" }}>
      <Component frame={frame} config={config} />
    </div>
  );
};
