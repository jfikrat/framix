import React, { useState, useEffect, useMemo } from "react";
import { defaultConfig, type VideoConfig, type AnimationProps } from "./animations";
import { FrameProvider } from "./Sequence";
import type { TemplateMeta } from "./templates/types";
import type { AudioTrack } from "./audio/types";
import { preloadAssets, type AssetManifest } from "./preloader";

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

    // Prefer explicit "Component" export, then default, then first function found
    const explicitComponent = (module as Record<string, unknown>).Component as React.FC<AnimationProps> | undefined;
    const componentName = explicitComponent
      ? undefined
      : Object.keys(module).find(
          (key) =>
            key !== "meta" &&
            key !== "default" &&
            key !== "Component" &&
            typeof module[key] === "function",
        );
    const component = explicitComponent ?? module.default ?? (componentName ? module[componentName] : null);
    if (!component || typeof component !== "function") continue;

    const templateConfig = (module as Record<string, unknown>).templateConfig as
      | Partial<VideoConfig>
      | undefined;

    const assets = (module as Record<string, unknown>).assets as AssetManifest | undefined;

    return {
      component: component as React.FC<AnimationProps>,
      config: { ...defaultConfig, ...templateConfig } as VideoConfig,
      assets,
    };
  }
  return null;
}

interface RenderViewProps {
  templateId: string;
}

export const RenderView: React.FC<RenderViewProps> = ({ templateId }) => {
  const [frame, setFrame] = useState(0);
  // Memoize so findTemplate only re-runs when templateId changes,
  // not on every frame re-render (fixes useEffect re-run on every frame).
  const template = useMemo(() => findTemplate(templateId), [templateId]);

  useEffect(() => {
    if (!template) return;
    // Expose controls to Puppeteer
    (window as any).__setFrame = (f: number) => setFrame(f);
    (window as any).__config = template.config;

    // Preload assets if declared, then signal ready
    if (template.assets) {
      preloadAssets(template.assets).then(() => {
        (window as any).__renderReady = true;
      }).catch(() => {
        // Signal ready even on failure — render with missing assets is better than hanging
        (window as any).__renderReady = true;
      });
    } else {
      (window as any).__renderReady = true;
    }
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
    <FrameProvider frame={frame} config={config}>
      <div style={{ width: config.width, height: config.height, overflow: "hidden" }}>
        <Component frame={frame} config={config} />
      </div>
    </FrameProvider>
  );
};
