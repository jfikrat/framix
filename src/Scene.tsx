import React from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "./Sequence";
import type { VideoConfig, AnimationProps } from "./animations";

interface SceneProps {
  /** The template component to render as a scene */
  component: React.FC<AnimationProps>;
  /** Start frame in parent timeline */
  from?: number;
  /** Duration of this scene in frames */
  durationInFrames: number;
  /** Optional config overrides for the embedded template */
  config?: Partial<VideoConfig>;
}

/**
 * Embed a template as a scene within another template's timeline.
 * Wraps the component in a Sequence, provides local frame + merged config.
 *
 * Usage:
 *   <Scene component={IntroTemplate} from={0} durationInFrames={90} />
 *   <Scene component={OutroTemplate} from={90} durationInFrames={60}
 *          config={{ width: 1080, height: 1080 }} />
 */
export const Scene: React.FC<SceneProps> = ({
  component: Component,
  from = 0,
  durationInFrames,
  config: configOverrides,
}) => {
  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      <SceneInner component={Component} config={configOverrides} durationInFrames={durationInFrames} />
    </Sequence>
  );
};

/** Inner component that uses hooks inside the Sequence context */
const SceneInner: React.FC<{
  component: React.FC<AnimationProps>;
  config?: Partial<VideoConfig>;
  durationInFrames: number;
}> = ({ component: Component, config: configOverrides, durationInFrames }) => {
  const frame = useCurrentFrame();
  const parentConfig = useVideoConfig();

  const mergedConfig: VideoConfig = {
    ...parentConfig,
    durationInFrames,
    ...configOverrides,
  };

  return <Component frame={frame} config={mergedConfig} />;
};
