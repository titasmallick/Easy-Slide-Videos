import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Series,
  spring,
  Audio,
  staticFile,
} from "remotion";
import ReactMarkdown from "react-markdown";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

export interface Section {
  heading: string;
  content: string;
  svg?: string;
  audio?: string;
  durationInFrames?: number;
}

export interface Props {
  title: string;
  sections: Section[];
  category?: string;
  websiteUrl?: string;
  musicPath?: string;
}

const THEME = {
  background: "#0F172A",
  cardBg: "rgba(30, 41, 59, 0.95)",
  primary: "#C4B5FD",
  secondary: "#6EE7B7",
  accent: "#F472B6",
  warning: "#fdf800", // Vibrant Yellow from Biology Tuition project
  text: "#F8FAFC",
  subtext: "#CBD5E1",
  border: "#FFFFFF",
  shadow: "rgba(0, 0, 0, 0.6)",
};

const BackgroundMusic: React.FC<{ musicPath?: string }> = ({ musicPath }) => {
  return <Audio src={staticFile(musicPath || "music/background.mp3")} volume={0.15} loop />;
};

const BackgroundEffects: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.background, overflow: "hidden" }}>
       {/* Animated Gradient Background */}
       <div style={{
           position: 'absolute',
           inset: -200,
           background: `radial-gradient(circle at 30% 30%, ${THEME.primary}22 0%, transparent 50%),
                        radial-gradient(circle at 70% 70%, ${THEME.accent}22 0%, transparent 50%)`,
           filter: 'blur(80px)'
       }} />
      
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.1,
        backgroundImage: `radial-gradient(${THEME.border} 2px, transparent 2px)`,
        backgroundSize: '40px 40px',
      }} />
    </AbsoluteFill>
  );
};

const TeaserSlide: React.FC<{ section: Section; title: string }> = ({ section, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ padding: 40, justifyContent: 'center' }}>
      <BackgroundEffects />
      {section.audio && <Audio src={staticFile(section.audio)} playbackRate={2.2} />}
      
      <div style={{
        background: THEME.cardBg,
        backdropFilter: "blur(40px)",
        borderRadius: 40,
        border: `4px solid ${THEME.border}`,
        padding: "50px 30px",
        display: "flex",
        flexDirection: 'column',
        gap: 30,
        transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
        opacity: entrance,
        boxShadow: `0px 20px 50px ${THEME.shadow}`,
        textAlign: 'center'
      }}>
        <div style={{
            background: THEME.secondary,
            color: THEME.background,
            padding: '6px 16px',
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 900,
            alignSelf: 'center',
            textTransform: 'uppercase'
        }}>Quick Concept</div>

        <h1 style={{ fontSize: 50, color: THEME.primary, margin: 0, lineHeight: 1, fontWeight: 900 }}>{section.heading || title}</h1>
        
        <div style={{ fontSize: 32, color: THEME.text, fontWeight: 600, lineHeight: 1.3 }}>
           <ReactMarkdown>{section.content.substring(0, 150) + "..."}</ReactMarkdown>
        </div>

        <div style={{ height: 6, background: THEME.accent, width: '40%', alignSelf: 'center', borderRadius: 3 }} />
      </div>
    </AbsoluteFill>
  );
};

const CTASlide: React.FC<{ title: string; websiteUrl?: string }> = ({ title, websiteUrl }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const entrance = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 40 }}>
        <BackgroundEffects />
        <div style={{
          transform: `translateY(${interpolate(entrance, [0, 1], [100, 0])}px)`,
          opacity: entrance,
          textAlign: "center",
          fontFamily,
          zIndex: 10,
          padding: "60px 40px",
          background: THEME.cardBg,
          backdropFilter: "blur(60px)",
          borderRadius: 60,
          border: `6px solid ${THEME.warning}`,
          boxShadow: `0px 30px 60px ${THEME.shadow}`,
          width: "100%",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 30,
        }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: THEME.warning, margin: 0 }}>WANT THE FULL LECTURE?</h2>
          
          <div style={{ background: THEME.primary, padding: '15px 25px', borderRadius: 20, width: '100%' }}>
             <p style={{ fontSize: 24, fontWeight: 800, color: THEME.background, margin: 0 }}>Watch "{title}"</p>
             <p style={{ fontSize: 28, fontWeight: 900, color: THEME.background, marginTop: 5 }}>on YOUTUBE 📺</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, width: '100%' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: THEME.text }}>Get PDF Notes at:</div>
              <div style={{ background: 'white', color: '#000', padding: '12px', borderRadius: 15, fontWeight: 900, fontSize: 18 }}>{websiteUrl || "bionotes-liard.vercel.app"}</div>
          </div>

          <div style={{ 
            marginTop: 10,
            background: THEME.accent,
            color: 'white',
            padding: '12px 30px',
            borderRadius: 30,
            fontSize: 24,
            fontWeight: 900,
            animation: 'pulse 1s infinite'
          }}>LINK IN BIO 👆</div>
        </div>
      </AbsoluteFill>
    );
};

export const TeaserReelComposition: React.FC<Props> = ({ title, sections, websiteUrl, musicPath }) => {
  const { fps } = useVideoConfig();
  
  // --- SMART SECTION SELECTION ---
  // Goal: Find the "Meat" of the note to hook the viewer.
  
  const getInterestingSections = () => {
    // 1. Filter out very short or empty sections
    const candidates = sections.filter(s => s.content && s.content.length > 50);
    
    // 2. Look for "Gold" sections (Mechanisms, Phases, Significance, or SVG visuals)
    const goldKeywords = ['mechanism', 'phase', 'process', 'significance', 'structure', 'function', 'cycle'];
    const goldSections = candidates.filter(s => 
        s.svg || 
        goldKeywords.some(k => s.heading.toLowerCase().includes(k))
    );

    // 3. Selection Strategy:
    let selected = [];
    if (goldSections.length >= 2) {
        // Take the first two interesting detailed sections
        selected = goldSections.slice(0, 2);
    } else if (goldSections.length === 1) {
        // Take the gold one + the one after it (or before if it's the last)
        const idx = candidates.indexOf(goldSections[0]);
        selected = [goldSections[0], candidates[idx + 1] || candidates[idx - 1]].filter(Boolean);
    } else {
        // Fallback: Skip the "Introduction" (index 0) and take the next two
        selected = candidates.slice(1, 3);
    }

    // Final safety check: if we somehow got nothing, take the first two
    return selected.length > 0 ? selected.slice(0, 2) : sections.slice(0, 2);
  };

  const teaserSections = getInterestingSections();
  const sectionDuration = fps * 7; // Slightly longer (7s) to read detailed content
  const ctaDuration = fps * 6;     
  
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.background }}>
      <BackgroundMusic musicPath={musicPath} />
      <Series>
        {teaserSections.map((section, index) => (
          <Series.Sequence key={index} durationInFrames={sectionDuration}>
            <TeaserSlide section={section} title={title} />
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={ctaDuration}>
          <CTASlide title={title} websiteUrl={websiteUrl} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
