import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { InstagramPostComposition } from "./InstagramPostComposition";
import { ThumbnailComposition } from "./ThumbnailComposition";
import { ShortsComposition } from "./ShortsComposition";
import { TeaserReelComposition } from "./TeaserReelComposition";
import config from "../config.json";
import configReels from "../config-reels.json";

export const RemotionRoot: React.FC = () => {
  const fps = config.video.fps || 30;
  
  // Calculate dynamic duration for MainVideo using absolute timeline bounds
  const calculateTotalFrames = (cfg: any, fpsRate: number) => {
    if (cfg.endPage?.show) {
      const start = cfg.endPage.startTime ?? 0;
      const duration = cfg.endPage.durationInSeconds ?? 0;
      return Math.round((start + duration) * fpsRate);
    }
    // fallback to sum of slide durations or max end time
    if (cfg.slides && cfg.slides.length > 0) {
      const lastSlide = cfg.slides[cfg.slides.length - 1];
      const start = lastSlide.startTime ?? 0;
      const duration = lastSlide.durationInSeconds ?? 5;
      return Math.round((start + duration) * fpsRate);
    }
    return 150;
  };

  const totalDurationInFrames = calculateTotalFrames(config, fps);

  const reelsFps = configReels.video?.fps || 30;
  const reelsDurationInFrames = calculateTotalFrames(configReels, reelsFps);

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

      {/* 1b. Portrait Reels Video (1080x1920) */}
      <Composition
        id="Reels"
        component={Video as any}
        durationInFrames={reelsDurationInFrames > 0 ? reelsDurationInFrames : 150}
        fps={reelsFps}
        width={configReels.video.width || 1080}
        height={configReels.video.height || 1920}
        defaultProps={configReels as any}
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
          title: config.titlePage.title || "Slideshow Title",
          heading: config.titlePage.subtitle || "Introduction",
          content: config.slides[0]?.content || "Sample content goes here.",
          type: "content",
          footerText: config.branding.authorName || config.branding.logoText || "SLIDESHOW ENGINE"
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
          title: config.titlePage.title || "Slideshow Title",
          subtitle: config.branding.authorName || config.titlePage.subtitle || "Easy-Slide-Videos",
          className: config.branding.logoText || "SLIDESHOW ENGINE",
          authorName: config.branding.authorName || "Easy-Slide-Videos",
          badgeText: config.branding.badgeText || "DEMO",
          iconName: config.video.iconName || "Video",
          themeName: config.video.themeName || "neon-emerald"
        }}
      />

      {/* 3b. Portrait Reels Thumbnail (1080x1920) */}
      <Composition
        id="ReelsThumbnail"
        component={ThumbnailComposition as any}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          id: "reels-thumb",
          title: configReels.titlePage?.title || "Slideshow Title",
          subtitle: configReels.branding?.authorName || configReels.titlePage?.subtitle || "Easy-Slide-Videos",
          className: configReels.branding?.logoText || "SLIDESHOW ENGINE",
          authorName: configReels.branding?.authorName || "Easy-Slide-Videos",
          badgeText: configReels.branding?.badgeText || "DEMO",
          iconName: configReels.video?.iconName || "Video",
          themeName: configReels.video?.themeName || "radiant-gold"
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
          ],
          authorName: config.branding.logoText || "Author",
          phoneNumber: config.endPage.contact || "Easy-Slide-Videos",
          extraText: config.endPage.subtitle || "SLIDESHOW",
          musicPath: config.audio.musicPath || "assets/music/background.mp3"
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
          websiteUrl: config.endPage.website || "bionotes-liard.vercel.app",
          musicPath: config.audio.musicPath || "assets/music/background.mp3"
        } as any}
      />
    </>
  );
};
