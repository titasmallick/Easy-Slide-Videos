import React from "react";
import { Composition } from "remotion";
import { MainComposition } from "./Composition";
import { TeaserReelComposition } from "./TeaserReelComposition";
import { ShortsComposition } from "./ShortsComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={MainComposition}
        calculateMetadata={({ props }) => {
          const sections = (props.sections as any[]) || [];
          const fps = 30;
          const defaultSlideDuration = 120;
          const titleDuration = fps * 2;
          const endDuration = fps * 4;
          const totalSectionsDuration = sections.reduce((acc, section) => {
            return acc + (section.durationInFrames || defaultSlideDuration);
          }, 0);
          
          return {
            durationInFrames: titleDuration + totalSectionsDuration + endDuration,
          };
        }}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Biology Lesson",
          sections: [
            {
              heading: "Introduction",
              content: "Welcome to the world of Biology.",
            },
          ],
        } as any}
      />
      <Composition
        id="Shorts"
        component={ShortsComposition}
        calculateMetadata={({ props }) => {
          const sections = (props.sections as any[]) || [];
          const fps = 30;
          const totalDuration = sections.reduce((acc, s) => acc + (s.durationInFrames || 300), 0) + 150;
          return { durationInFrames: totalDuration };
        }}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
            title: "Question Topic",
            sections: [
                { heading: "Did You Know?", content: "Sample hook." },
                { heading: "The Science", content: "Sample explanation." },
                { heading: "Quick Tip", content: "Sample outro." }
            ]
        } as any}
      />
      <Composition
        id="Teaser"
        component={TeaserReelComposition}
        calculateMetadata={({ props }) => {
          const sections = (props.sections as any[]) || [];
          const fps = 30;
          const teaserSections = sections.slice(0, 2);
          const sectionDuration = fps * 6;
          const ctaDuration = fps * 6;
          
          return {
            durationInFrames: (teaserSections.length * sectionDuration) + ctaDuration,
          };
        }}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "Biology Quick Lesson",
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