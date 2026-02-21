import React from 'react';
import { useCurrentFrame, useVideoConfig } from './Sequence';
import { 
  type SceneGraphDocument, 
  type Layer, 
  getActiveScenes, 
  resolveLayerProps 
} from './scene-graph';

interface GraphRendererProps {
  doc: SceneGraphDocument;
  frame?: number;
}

const LayerRenderer: React.FC<{ layer: Layer }> = ({ layer }) => {
  // Common styles
  const style: React.CSSProperties = {
    position: 'absolute',
    left: layer.x ?? 0,
    top: layer.y ?? 0,
    width: layer.width,
    height: layer.height,
    opacity: layer.opacity ?? 1,
    transform: `
      translate(-50%, -50%) 
      scale(${layer.scale ?? 1}) 
      rotate(${layer.rotation ?? 0}deg)
    `,
    transformOrigin: 'center center',
    // Ensure layers don't overflow if not desired, though usually visible
    display: layer.visible === false ? 'none' : 'block',
  };

  if (layer.type === 'text') {
    return (
      <div style={{
        ...style,
        fontSize: layer.fontSize ?? 40,
        fontWeight: layer.fontWeight ?? 400,
        fontFamily: layer.fontFamily ?? 'sans-serif',
        color: layer.color ?? '#fff',
        textAlign: layer.textAlign ?? 'left',
        letterSpacing: layer.letterSpacing,
        lineHeight: layer.lineHeight,
        textTransform: layer.textTransform,
        whiteSpace: 'pre-wrap', // Handle newlines
      }}>
        {layer.content}
      </div>
    );
  }

  if (layer.type === 'image') {
    return (
      <img 
        src={layer.src} 
        alt={layer.label || 'layer'}
        style={{
          ...style,
          objectFit: layer.objectFit ?? 'cover',
          borderRadius: layer.borderRadius,
        }} 
      />
    );
  }

  if (layer.type === 'shape') {
    const shapeStyle: React.CSSProperties = {
      ...style,
      backgroundColor: layer.fill ?? 'transparent',
      border: layer.stroke ? `${layer.strokeWidth ?? 1}px solid ${layer.stroke}` : 'none',
      borderRadius: layer.borderRadius ?? (layer.shape === 'circle' ? '50%' : 0),
    };
    
    // Line handling could be SVG or thin div. Div is easier for simple lines.
    if (layer.shape === 'line') {
      // For line, width is length, height is thickness usually
      // If user provided width/height, use them.
      return <div style={shapeStyle} />;
    }

    return <div style={shapeStyle} />;
  }

  return null;
};

export const GraphRenderer: React.FC<GraphRendererProps> = ({ doc, frame: propFrame }) => {
  const currentFrame = useCurrentFrame();
  const config = useVideoConfig(); // Used mostly if we needed to fallback defaults
  
  const frameToRender = propFrame ?? currentFrame;
  const activeScenes = getActiveScenes(doc, frameToRender);

  // Outer container defines the stage
  return (
    <div style={{
      position: 'relative',
      width: doc.config.width,
      height: doc.config.height,
      overflow: 'hidden',
      backgroundColor: 'transparent', // Or configurable?
    }}>
      {activeScenes.map(scene => {
        // Calculate scene-local frame for track evaluation if tracks are relative?
        // Our evaluateTrack implementation uses absolute frames from keys.
        // But usually keyframes in a scene are relative to scene start 0?
        // 
        // Let's re-read the spec/implementation.
        // In `scene-graph.ts`, `evaluateTrack` compares `frame` vs `keyframe.frame`.
        // If keyframes are defined as 0..duration, we need to pass `frameToRender - scene.from`.
        // If keyframes are absolute, we pass `frameToRender`.
        // 
        // Standard practice for Scene Graphs:
        // - Scenes are placed at 'from'.
        // - Inside the scene, time is usually relative (0 to duration).
        // 
        // Let's check `createTextScene` in `scene-graph.ts`.
        // `keyframes: [{ frame: 0, ... }, { frame: 30, ... }]`
        // It creates a scene with `from: ...`.
        // So keyframes seem to be Relative to Scene Start.
        // 
        // However, `evaluateTrack` takes `frame`.
        // So we should pass `localFrame` to `evaluateTrack`.
        // 
        // Wait, `resolveLayerProps` calls `evaluateTrack(track, frame, fps)`.
        // So in `GraphRenderer`, we must calculate localFrame.
        
        const localFrame = frameToRender - scene.from;

        return (
          <div key={scene.id} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}>
            {scene.layers.map(layer => {
              // Combine scene tracks and global tracks?
              // Spec said "Scene: tracks?", "SceneGraphDocument: globalTracks?".
              // We should probably filter global tracks for this layer too.
              
              const sceneTracks = scene.tracks || [];
              const globalTracks = doc.globalTracks || [];
              
              // Resolve props using LOCAL frame for scene tracks?
              // If global tracks exist, are they absolute or relative? 
              // Usually global tracks are absolute time. Scene tracks are relative.
              // This complication suggests we might need to handle them differently.
              // 
              // For now, let's assume ALL tracks in a scene are relative to that scene.
              // And Global tracks are absolute.
              
              // Resolve scene tracks (Relative Time)
              let resolvedLayer = resolveLayerProps(layer, sceneTracks, localFrame, doc.config.fps);
              
              // Resolve global tracks (Absolute Time)
              // Note: This overrides scene tracks if they target the same property
              resolvedLayer = resolveLayerProps(resolvedLayer, globalTracks, frameToRender, doc.config.fps);

              return <LayerRenderer key={layer.id} layer={resolvedLayer} />;
            })}
          </div>
        );
      })}
    </div>
  );
};
