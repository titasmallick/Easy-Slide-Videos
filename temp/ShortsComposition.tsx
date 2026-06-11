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
import * as Icons from "lucide-react";

const { fontFamily } = loadFont();

export interface Section {
  heading: string;
  content: string;
  durationInFrames?: number;
}

export interface Props {
  id: string;
  title: string;
  sections: Section[];
  category?: string;
}

// 10 PREMIUM CATCHY THEMES
const THEMES = [
  { // 0: RADIANT GOLD
    background: "#1A150E",
    cardBg: "rgba(35, 30, 25, 0.85)",
    primary: "#FDE047", 
    secondary: "#FB923C",
    accent: "#6EE7B7",
    text: "#FFFAF0",
    border: "#FDE047",
  },
  { // 1: NEON EMERALD
    background: "#062016",
    cardBg: "rgba(10, 40, 30, 0.85)",
    primary: "#34D399",
    secondary: "#A7F3D0",
    accent: "#FDE047",
    text: "#ECFDF5",
    border: "#34D399",
  },
  { // 2: ELECTRIC AMETHYST
    background: "#1E0E30",
    cardBg: "rgba(40, 20, 60, 0.85)",
    primary: "#A78BFA",
    secondary: "#DDD6FE",
    accent: "#FB923C",
    text: "#F5F3FF",
    border: "#A78BFA",
  },
  { // 3: CRIMSON PULSE
    background: "#2D0A0A",
    cardBg: "rgba(60, 20, 20, 0.85)",
    primary: "#F87171",
    secondary: "#FCA5A5",
    accent: "#6EE7B7",
    text: "#FEF2F2",
    border: "#F87171",
  },
  { // 4: CYBER CYAN
    background: "#081E26",
    cardBg: "rgba(10, 45, 55, 0.85)",
    primary: "#22D3EE",
    secondary: "#7DD3FC",
    accent: "#F472B6",
    text: "#ECFEFF",
    border: "#22D3EE",
  },
  { // 5: MIDNIGHT MAGENTA
    background: "#2E0821",
    cardBg: "rgba(60, 15, 45, 0.85)",
    primary: "#E879F9",
    secondary: "#F5D0FE",
    accent: "#FDE047",
    text: "#FDF4FF",
    border: "#E879F9",
  },
  { // 6: ARCTIC BLUE
    background: "#0E1B2D",
    cardBg: "rgba(25, 45, 75, 0.85)",
    primary: "#60A5FA",
    secondary: "#93C5FD",
    accent: "#FB923C",
    text: "#EFF6FF",
    border: "#60A5FA",
  },
  { // 7: VOLCANIC ORANGE
    background: "#2D1509",
    cardBg: "rgba(65, 30, 15, 0.85)",
    primary: "#FB923C",
    secondary: "#FDBA74",
    accent: "#22D3EE",
    text: "#FFF7ED",
    border: "#FB923C",
  },
  { // 8: SLATE SILVER
    background: "#1E293B",
    cardBg: "rgba(51, 65, 85, 0.85)",
    primary: "#CBD5E1",
    secondary: "#94A3B8",
    accent: "#FDE047",
    text: "#F8FAFC",
    border: "#CBD5E1",
  },
  { // 9: ROYAL INDIGO
    background: "#1E1B4B",
    cardBg: "rgba(49, 46, 129, 0.85)",
    primary: "#818CF8",
    secondary: "#A5B4FC",
    accent: "#F472B6",
    text: "#EEF2FF",
    border: "#818CF8",
  }
];

const getThemeForId = (id: string, title: string) => {
    const key = id || title || "default";
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % THEMES.length;
    return THEMES[index];
};

const DynamicIcon: React.FC<{ name: string; size: number; color: string; style?: React.CSSProperties }> = ({ name, size, color, style }) => {
  const IconComponent = (Icons as any)[name] || Icons.Microscope;
  return <IconComponent size={size} color={color} style={style} />;
};

const BackgroundEffects: React.FC<{ theme: any }> = ({ theme }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, overflow: "hidden" }}>
      <div style={{
          position: 'absolute',
          width: 1400,
          height: 1400,
          borderRadius: '50%',
          background: theme.primary,
          filter: 'blur(120px)',
          opacity: 0.12,
          top: -300,
          right: -300,
          transform: `scale(${1 + Math.sin(frame / 70) * 0.12})`,
      }} />
      <div style={{
          position: 'absolute',
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          background: theme.secondary,
          filter: 'blur(120px)',
          opacity: 0.1,
          bottom: -300,
          left: -300,
          transform: `scale(${1 + Math.cos(frame / 50) * 0.1})`,
      }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.08,
        backgroundImage: `linear-gradient(${theme.primary} 1px, transparent 1px), linear-gradient(90deg, ${theme.primary} 1px, transparent 1px)`,
        backgroundSize: '120px 120px',
      }} />

      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
        const isTop = pos.includes('top');
        const isLeft = pos.includes('left');
        return (
          <div key={pos} style={{ 
            position: 'absolute', 
            top: isTop ? 60 : 'auto', 
            bottom: isTop ? 'auto' : 60, 
            left: isLeft ? 60 : 'auto', 
            right: isLeft ? 'auto' : 60, 
            width: 50, 
            height: 50, 
            borderLeft: isLeft ? `3px solid ${theme.primary}` : 'none',
            borderRight: isLeft ? 'none' : `3px solid ${theme.primary}`,
            borderTop: isTop ? `3px solid ${theme.primary}` : 'none',
            borderBottom: isTop ? 'none' : `3px solid ${theme.primary}`,
            opacity: 0.4 + Math.sin(frame / 15) * 0.2
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

const Header: React.FC<{ title: string; theme: any }> = ({ title, theme }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 120,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      background: theme.primary,
      padding: '12px 32px',
      borderRadius: 40,
      border: `4px solid ${theme.background}`,
      boxShadow: `10px 10px 0px rgba(0,0,0,0.5)`,
    }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: theme.background }} />
      <span style={{
        fontFamily,
        fontSize: 26,
        fontWeight: 900,
        color: theme.background,
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        {title}
      </span>
    </div>
  );
};

const LoadingBars: React.FC<{ progress: number; theme: any }> = ({ progress, theme }) => {
  return (
    <>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.05)', zIndex: 200 }}>
            <div style={{ height: '100%', background: theme.primary, width: `${progress * 100}%`, boxShadow: `0 0 20px ${theme.primary}` }} />
        </div>
    </>
  );
};

const ShortSlide: React.FC<{ 
  section: Section; 
  title: string; 
  index: number; 
  progressAtStart: number; 
  totalDuration: number;
  theme: any 
}> = ({ section, title, index, progressAtStart, totalDuration, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = section.durationInFrames || 300;
  const slideProgress = frame / duration;
  
  // Dynamic overall progress: start of slide + (current frame / total)
  const overallProgress = progressAtStart + (frame / totalDuration);
  
  const entrance = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  
  const icons = ["Zap", "Atom", "Brain", "Dna", "Activity", "Search", "Microscope", "Heart", "Stethoscope", "Leaf"];
  const currentIcon = icons[index % icons.length];

  return (
    <AbsoluteFill style={{ padding: 60, justifyContent: 'center', alignItems: 'center' }}>
      <BackgroundEffects theme={theme} />
      <Header title={title} theme={theme} />
      <LoadingBars progress={overallProgress} theme={theme} />

      {/* Bottom slide progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.05)', zIndex: 200 }}>
          <div style={{ height: '100%', background: theme.secondary, width: `${slideProgress * 100}%`, boxShadow: `0 0 20px ${theme.secondary}` }} />
      </div>

      <div style={{
          position: 'absolute',
          right: -40,
          top: '30%',
          opacity: 0.05,
          transform: `rotate(${frame / 2}deg) scale(6)`,
          pointerEvents: 'none',
      }}>
          <DynamicIcon name={currentIcon} size={150} color={theme.primary} />
      </div>

      <div style={{
        width: "100%",
        background: theme.cardBg,
        backdropFilter: "blur(50px)",
        borderRadius: 60,
        border: `6px solid ${theme.primary}`,
        padding: "80px 50px",
        display: "flex",
        flexDirection: 'column',
        gap: 40,
        transform: `translateY(${interpolate(entrance, [0, 1], [60, 0])}px) scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
        opacity: entrance,
        boxShadow: `25px 25px 0px rgba(0,0,0,0.4)`,
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ alignSelf: 'center', marginBottom: -10 }}>
            <DynamicIcon name={currentIcon} size={80} color={theme.primary} />
        </div>

        <h2 style={{
          fontSize: 72,
          fontWeight: 900,
          color: theme.primary,
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: -3,
        }}>{section.heading}</h2>

        <div style={{
          fontSize: 44,
          lineHeight: 1.4,
          fontWeight: 700,
          color: theme.text,
          fontFamily,
          letterSpacing: -1,
        }}>
           <ReactMarkdown components={{
               strong: ({node, ...props}) => <span style={{color: theme.secondary, fontWeight: 900}} {...props} />,
           }}>{section.content}</ReactMarkdown>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ShortsCTA: React.FC<{ progressAtStart: number; totalDuration: number; theme: any }> = ({ progressAtStart, totalDuration, theme }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const entrance = spring({ frame, fps, config: { damping: 10, stiffness: 100 } });
    const overallProgress = progressAtStart + (frame / totalDuration);

    return (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 60 }}>
            <BackgroundEffects theme={theme} />
            <LoadingBars progress={overallProgress} theme={theme} />
            
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.05)', zIndex: 200 }}>
                <div style={{ height: '100%', background: theme.secondary, width: `${(frame/150) * 100}%`, boxShadow: `0 0 20px ${theme.secondary}` }} />
            </div>
            
            <div style={{
                transform: `scale(${interpolate(entrance, [0, 1], [0.8, 1])})`,
                opacity: entrance,
                textAlign: "center",
                fontFamily,
                padding: "80px 50px",
                background: theme.cardBg,
                backdropFilter: "blur(60px)",
                borderRadius: 80,
                border: `8px solid ${theme.primary}`,
                boxShadow: `30px 30px 0px rgba(0,0,0,0.5)`,
                width: "100%",
                display: 'flex',
                flexDirection: 'column',
                gap: 50,
            }}>
                <h1 style={{ fontSize: 90, fontWeight: 900, color: theme.primary, margin: 0, letterSpacing: -5 }}>
                    Titas Sir
                </h1>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ background: theme.primary, padding: '20px 30px', borderRadius: 25, border: `4px solid ${theme.background}` }}>
                        <span style={{ fontSize: 42, fontWeight: 900, color: theme.background }}>📞 9123774239</span>
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: theme.secondary, textTransform: 'uppercase', letterSpacing: 4 }}>
                        BIOLOGY 2026-27
                    </div>
                </div>

                <div style={{ 
                    marginTop: 20,
                    background: 'white',
                    color: 'black',
                    padding: '20px 60px',
                    borderRadius: 50,
                    fontSize: 32,
                    fontWeight: 900,
                }}>
                    SEARCH GOOGLE 🔍
                </div>
            </div>
        </AbsoluteFill>
    );
};

export const ShortsComposition: React.FC<Props> = ({ id, title, sections }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const ctaDuration = 150;
  const totalFrames = sections.reduce((acc, s) => acc + (s.durationInFrames || 300), 0) + ctaDuration;
  const theme = getThemeForId(id, title);

  // Fade out music in the last 60 frames
  const volume = interpolate(
    frame,
    [durationInFrames - 60, durationInFrames],
    [0.12, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  let currentStart = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      <Audio src={staticFile("music/background.mp3")} volume={volume} loop />
      <Series>
        {sections.map((section, index) => {
          const duration = section.durationInFrames || 300;
          const startFrame = currentStart;
          currentStart += duration;
          return (
            <Series.Sequence key={index} durationInFrames={duration}>
              <ShortSlide 
                section={section} 
                title={title} 
                index={index} 
                progressAtStart={startFrame / totalFrames} 
                totalDuration={totalFrames}
                theme={theme} 
              />
            </Series.Sequence>
          );
        })}
        <Series.Sequence durationInFrames={ctaDuration}>
            <ShortsCTA 
                progressAtStart={currentStart / totalFrames} 
                totalDuration={totalFrames}
                theme={theme} 
            />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
