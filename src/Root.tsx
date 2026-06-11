import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { InstagramPostComposition } from "./InstagramPostComposition";
import { ThumbnailComposition } from "./ThumbnailComposition";
import { ShortsComposition } from "./ShortsComposition";
import { TeaserReelComposition } from "./TeaserReelComposition";
import config from "../config.json";

export const RemotionRoot: React.FC = () => {
  const fps = config.video.fps || 30;
  
  // Calculate dynamic duration for MainVideo
  const titleDuration = config.titlePage.show ? (config.titlePage.durationInSeconds || 3) * fps : 0;
  const endDuration = config.endPage.show ? (config.endPage.durationInSeconds || 4) * fps : 0;
  const slidesDuration = config.slides.reduce((acc, slide) => {
    return acc + (slide.durationInSeconds || 5) * fps;
  }, 0);
  const totalDurationInFrames = titleDuration + slidesDuration + endDuration;

  return (
    <>
      {/* 1. Dynamic Customizable Presentation Video */}
      <Composition
        id="MainVideo"
        component={Video as any}
        durationInFrames={totalDurationInFrames > 0 ? totalDurationInFrames : 150}
        fps={fps}
        width={config.video.width || 1920}
        height={config.video.height || 1080}
        defaultProps={config}
      />

      {/* 2. Instagram Post (1080x1080) */}
      <Composition
        id="InstagramPost"
        component={InstagramPostComposition as any}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          id: "insta-post",
          title: config.titlePage.title || "Biology Fact",
          heading: config.titlePage.subtitle || "Did You Know?",
          content: config.slides[0]?.content || "Sample content goes here.",
          type: "content"
        } as any}
      />

      {/* 3. Landscape Thumbnail (1920x1080) */}
      <Composition
        id="Thumbnail"
        component={ThumbnailComposition as any}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          id: "thumb",
          title: config.titlePage.title || "Cell Cycle",
          subtitle: config.titlePage.subtitle || "And Cell Division",
          className: config.branding.logoText || "TITAS SIR"
        }}
      />

      {/* 4. Shorts (1080x1920) */}
      <Composition
        id="Shorts"
        component={ShortsComposition as any}
        calculateMetadata={({ props }) => {
          const sections = (props.sections as any[]) || [];
          const totalDuration = sections.reduce((acc, s) => acc + (s.durationInFrames || 300), 0) + 150;
          return { durationInFrames: totalDuration };
        }}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          id: "shorts-default",
          title: config.titlePage.title || "Question Topic",
          sections: [
            { heading: "Did You Know?", content: "Sample hook.", durationInFrames: 300 },
            { heading: "The Science", content: "Sample explanation.", durationInFrames: 300 },
            { heading: "Quick Tip", content: "Sample outro.", durationInFrames: 300 }
          ]
        } as any}
      />

      {/* 5. Teaser Reels (1080x1920) */}
      <Composition
        id="Teaser"
        component={TeaserReelComposition as any}
        calculateMetadata={({ props }) => {
          const sections = (props.sections as any[]) || [];
          const teaserSections = sections.slice(0, 2);
          const localFps = 30;
          const sectionDuration = localFps * 6;
          const ctaDuration = localFps * 6;
          return {
            durationInFrames: (teaserSections.length * sectionDuration) + ctaDuration,
          };
        }}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: config.titlePage.title || "Biology Quick Lesson",
          sections: [
            {
              heading: "Prophase",
              content: "Chromosomes condense and become visible.",
            },
          ],
        } as any}
      />
    </>
  );
};
