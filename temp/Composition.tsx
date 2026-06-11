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
  svg?: string;
  audio?: string;
  durationInFrames?: number;
  lucideIcon?: string;
}

export interface Props {
  title: string;
  sections: Section[];
  category?: string;
}

const THEME_VARIANTS = {
  standard: {
    background: "#0F172A",
    cardBg: "rgba(30, 41, 59, 0.8)",
    primary: "#C4B5FD",
    secondary: "#6EE7B7",
    accent: "#F472B6",
    warning: "#FBBF24",
    text: "#F8FAFC",
    subtext: "#CBD5E1",
    border: "#FFFFFF",
    shadow: "rgba(0, 0, 0, 0.4)",
  },
  auto_forest: {
    background: "#064E3B", // Emerald Deep
    cardBg: "rgba(6, 78, 59, 0.8)",
    primary: "#FDE047", // Yellow
    secondary: "#BBF7D0", // Light Green
    accent: "#34D399", // Green
    warning: "#FDBA74", // Orange
    text: "#F0FDF4",
    subtext: "#BBF7D0",
    border: "#FDE047",
    shadow: "rgba(0, 0, 0, 0.5)",
  },
  auto_ocean: {
    background: "#0C4A6E", // Deep Sea Blue
    cardBg: "rgba(12, 74, 110, 0.8)",
    primary: "#7DD3FC", // Sky Blue
    secondary: "#38BDF8", // Blue
    accent: "#FDE047", // Yellow
    warning: "#F472B6", // Pink
    text: "#F0F9FF",
    subtext: "#BAE6FD",
    border: "#7DD3FC",
    shadow: "rgba(0, 0, 0, 0.5)",
  },
  auto_sunset: {
    background: "#450A0A", // Deep Maroon
    cardBg: "rgba(69, 10, 10, 0.8)",
    primary: "#FDE047", // Yellow
    secondary: "#FB923C", // Orange
    accent: "#F43F5E", // Rose
    warning: "#6EE7B7", // Mint
    text: "#FFF1F2",
    subtext: "#FECDD3",
    border: "#FDE047",
    shadow: "rgba(0, 0, 0, 0.5)",
  },
  auto_cyber: {
    background: "#2E1065", // Deep Purple
    cardBg: "rgba(46, 16, 101, 0.8)",
    primary: "#FDE047", 
    secondary: "#6EE7B7", 
    accent: "#F472B6", 
    warning: "#FDBA74", 
    text: "#F5F3FF",
    subtext: "#DDD6FE",
    border: "#FDE047",
    shadow: "rgba(0, 0, 0, 0.5)",
  },
  auto_classic: {
    background: "#4C0519", // Deep Red
    cardBg: "rgba(76, 5, 25, 0.8)",
    primary: "#FDE047", 
    secondary: "#38BDF8", 
    accent: "#FBBF24", 
    warning: "#6EE7B7", 
    text: "#FFF1F2",
    subtext: "#FECDD3",
    border: "#FDE047",
    shadow: "rgba(0, 0, 0, 0.5)",
  },
  auto_gold: {
    background: "#422006", // Deep Brown/Gold
    cardBg: "rgba(66, 32, 6, 0.8)",
    primary: "#FDE047", 
    secondary: "#EAB308", 
    accent: "#6EE7B7", 
    warning: "#FB923C", 
    text: "#FEFCE8",
    subtext: "#FEF9C3",
    border: "#FDE047",
    shadow: "rgba(0, 0, 0, 0.5)",
  }
};

type ThemeVariant = keyof typeof THEME_VARIANTS;
const getTheme = (variant: ThemeVariant) => THEME_VARIANTS[variant] || THEME_VARIANTS["standard"];

// Helper to render lucide icon safely
const DynamicIcon: React.FC<{ name: string; size: number; color: string; style?: React.CSSProperties }> = ({ name, size, color, style }) => {
  const IconComponent = (Icons as any)[name] || Icons.Microscope;
  return <IconComponent size={size} color={color} style={style} />;
};

const Branding: React.FC<{ variant: ThemeVariant }> = ({ variant }) => {
  const theme = getTheme(variant);
  return (
    <div style={{
      position: 'absolute',
      top: 50,
      left: 60,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      background: theme.border,
      padding: '12px 28px',
      borderRadius: 40,
      border: `4px solid ${theme.background}`,
      boxShadow: `8px 8px 0px ${theme.shadow}`,
    }}>
      <div style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: theme.accent,
      }} />
      <span style={{
        fontFamily,
        fontSize: 24,
        fontWeight: 900,
        color: theme.background,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>
        {(variant === 'standard') ? 'BioNotes' : 'Biofacts'} <span style={{ opacity: 0.7 }}>• Titas Sir</span>
      </span>
    </div>
  );
};

const BackgroundMusic: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // Fade out music in the last 60 frames (2 seconds at 30fps)
  const volume = interpolate(
    frame,
    [durationInFrames - 60, durationInFrames],
    [0.08, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <Audio 
      src={staticFile("music/background.mp3")} 
      volume={volume} 
      loop 
    />
  );
};

const Blob: React.FC<{ color: string; size: number; x: number; y: number; delay: number }> = ({ color, size, x, y, delay }) => {
  const frame = useCurrentFrame();
  const scale = 1 + Math.sin((frame + delay) / 30) * 0.1;
  const moveX = Math.sin((frame + delay) / 40) * 50;
  const moveY = Math.cos((frame + delay) / 50) * 50;

  return (
    <div style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      filter: 'blur(100px)',
      opacity: 0.15,
      left: x + moveX,
      top: y + moveY,
      transform: `scale(${scale})`,
    }} />
  );
};

const BackgroundEffects: React.FC<{ variant: ThemeVariant }> = ({ variant }) => {
  const theme = getTheme(variant);
  const isAuto = variant !== 'standard';

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, overflow: "hidden" }}>
      <Blob color={theme.primary} size={1000} x={-200} y={-200} delay={0} />
      <Blob color={theme.secondary} size={800} x={1200} y={400} delay={1000} />
      <Blob color={theme.accent} size={900} x={400} y={-300} delay={2000} />
      <Blob color={theme.warning} size={700} x={800} y={800} delay={3000} />
      
      {isAuto ? (
        <>
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: `linear-gradient(${theme.border} 1px, transparent 1px), linear-gradient(90deg, ${theme.border} 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }} />
          <div style={{ position: 'absolute', top: 40, left: 40, width: 40, height: 40, borderLeft: `2px solid ${theme.border}`, borderTop: `2px solid ${theme.border}`, opacity: 0.3 }} />
          <div style={{ position: 'absolute', top: 40, right: 40, width: 40, height: 40, borderRight: `2px solid ${theme.border}`, borderTop: `2px solid ${theme.border}`, opacity: 0.3 }} />
          <div style={{ position: 'absolute', bottom: 40, left: 40, width: 40, height: 40, borderLeft: `2px solid ${theme.border}`, borderBottom: `2px solid ${theme.border}`, opacity: 0.3 }} />
          <div style={{ position: 'absolute', bottom: 40, right: 40, width: 40, height: 40, borderRight: `2px solid ${theme.border}`, borderBottom: `2px solid ${theme.border}`, opacity: 0.3 }} />
        </>
      ) : (
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          backgroundImage: `radial-gradient(${theme.border} 2px, transparent 2px)`,
          backgroundSize: '60px 60px',
        }} />
      )}
    </AbsoluteFill>
  );
};

const TitleSlide: React.FC<{ title: string; category?: string; variant: ThemeVariant }> = ({ title, category, variant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = getTheme(variant);
  const entrance = spring({ frame, fps, config: { damping: 10, stiffness: 140 } });

  const getTitleFontSize = (text: string) => {
    if (text.length > 80) return 70;
    if (text.length > 50) return 90;
    if (text.length > 30) return 110;
    return 140;
  };

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <BackgroundEffects variant={variant} />
      <div style={{
        transform: `scale(${interpolate(entrance, [0, 1], [0.8, 1])}) rotate(${interpolate(entrance, [0, 1], [-3, 0])}deg)`,
        opacity: entrance,
        textAlign: "center",
        fontFamily,
        zIndex: 10,
        padding: "100px 120px",
        background: theme.cardBg,
        backdropFilter: "blur(40px)",
        borderRadius: 80,
        border: `6px solid ${theme.border}`,
        boxShadow: `20px 20px 0px ${theme.shadow}`,
        maxWidth: "85%",
        position: 'relative',
      }}>
        {category && (
          <div style={{
            display: 'inline-block',
            background: theme.secondary,
            color: theme.background,
            padding: '8px 24px',
            borderRadius: 20,
            fontSize: 24,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 4,
            marginBottom: 40,
            boxShadow: `6px 6px 0px ${theme.background}`,
          }}>
            {category.startsWith("Biofacts") ? "Biofacts" : (category === "docs" || category === "Trial" ? "BioNotes" : category)}
          </div>
        )}
        <h1 style={{ 
            fontSize: getTitleFontSize(title), 
            fontWeight: 900, 
            margin: 0, 
            lineHeight: 1, 
            color: theme.text,
            letterSpacing: -4,
        }}>
          {title}
        </h1>
        <div style={{
          height: 12,
          background: theme.accent,
          width: interpolate(entrance, [0, 1], [0, 400]),
          margin: "60px auto 0",
          borderRadius: 6,
          boxShadow: `6px 6px 0px ${theme.background}`,
        }} />
      </div>
    </AbsoluteFill>
  );
};

const ContentSlide: React.FC<{ section: Section; index: number; totalSlides: number; variant: ThemeVariant }> = ({ section, index, totalSlides, variant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = getTheme(variant);
  const entrance = spring({ frame, fps, config: { damping: 12, stiffness: 160 } });

  const isHeadingOnly = !section.content && !section.svg;
  const isQuestion = section.heading.toLowerCase().includes("question") || /^[Qq]\d+/.test(section.heading);

  const getFontSize = (text: string) => {
    const len = text.length;
    if (len < 120) return 56;
    if (len < 250) return 44;
    return 38;
  };

  const fontSize = getFontSize(section.content || "");
  const iconFloat = Math.sin(frame / 20) * 10;

  return (
    <AbsoluteFill style={{ padding: 60 }}>
      <BackgroundEffects variant={variant} />
      {section.audio && <Audio src={staticFile(section.audio)} playbackRate={2} />}
      
      {section.lucideIcon && (
        <div style={{
          position: 'absolute',
          right: -50,
          bottom: -50,
          opacity: 0.1,
          transform: `scale(5) rotate(${-20 + iconFloat}deg)`,
          pointerEvents: 'none',
        }}>
          <DynamicIcon name={section.lucideIcon} size={200} color={theme.primary} />
        </div>
      )}

      <div style={{
        width: "100%",
        height: "100%",
        background: theme.cardBg,
        backdropFilter: "blur(30px)",
        borderRadius: 60,
        border: `5px solid ${theme.border}`,
        padding: "80px 100px",
        display: "flex",
        gap: 100,
        transform: `translateY(${interpolate(entrance, [0, 1], [40, 0])}px)`,
        opacity: entrance,
        boxShadow: `16px 16px 0px ${theme.shadow}`,
        position: 'relative',
        overflow: 'hidden',
        flexDirection: isHeadingOnly ? "column" : "row",
        justifyContent: isHeadingOnly ? "center" : "flex-start",
        alignItems: isHeadingOnly ? "center" : "stretch",
      }}>
        <div style={{ 
          flex: isHeadingOnly ? "none" : 1.6, 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center",
          textAlign: isHeadingOnly ? "center" : "left",
          width: isHeadingOnly ? "100%" : "auto"
        }}>
          {section.heading && (
            <div style={{ marginBottom: isHeadingOnly ? 0 : 50, display: 'flex', alignItems: 'center', gap: 30, justifyContent: isHeadingOnly ? 'center' : 'flex-start' }}>
               {section.lucideIcon && !isHeadingOnly && (
                  <div style={{ transform: `translateY(${iconFloat/2}px)` }}>
                    <DynamicIcon name={section.lucideIcon} size={80} color={theme.accent} />
                  </div>
               )}
               <h2 style={{
                  fontSize: isHeadingOnly ? (isQuestion ? 140 : 100) : 72,
                  fontWeight: 900,
                  color: theme.primary,
                  margin: 0,
                  fontFamily,
                  lineHeight: 1,
                  letterSpacing: -2,
                }}>{section.heading}</h2>
            </div>
          )}
          {section.content && (
            <div style={{
                fontSize: fontSize,
                lineHeight: 1.5,
                fontWeight: 600,
                color: theme.text,
                fontFamily,
                maxHeight: "80vh",
                overflow: "hidden",
                letterSpacing: -0.5,
            }}>
              <ReactMarkdown
                components={{
                  strong: ({node, ...props}) => <span style={{color: theme.warning, fontWeight: 900}} {...props} />,
                  p: ({node, ...props}) => <p style={{margin: '0 0 24px 0'}} {...props} />,
                  h1: ({node, ...props}) => <h1 style={{color: theme.primary, fontSize: fontSize * 1.3, margin: '0 0 24px 0', fontWeight: 900}} {...props} />,
                  h2: ({node, ...props}) => <h2 style={{color: theme.secondary, fontSize: fontSize * 1.15, margin: '0 0 20px 0', fontWeight: 900}} {...props} />,
                  h3: ({node, ...props}) => <h3 style={{color: theme.accent, fontSize: fontSize * 1.05, margin: '0 0 16px 0', fontWeight: 800}} {...props} />,
                  ul: ({node, ...props}) => <ul style={{ margin: '0 0 24px 0', paddingLeft: 40, listStyleType: 'square' }} {...props} />,
                  ol: ({node, ...props}) => <ol style={{ margin: '0 0 24px 0', paddingLeft: 40, listStyleType: 'decimal' }} {...props} />,
                  li: ({node, ...props}) => <li style={{marginBottom: 16, paddingLeft: 10}} {...props} />,
                }}
              >{section.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {section.svg && (
          <div style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 40,
              padding: 40,
              border: `4px solid ${theme.border}`,
              transform: `rotate(${interpolate(entrance, [0, 1], [3, 0])}deg)`,
              boxShadow: `12px 12px 0px ${theme.shadow}`,
            }}
            dangerouslySetInnerHTML={{ __html: section.svg.replace('width="100%"', 'width="100%" height="100%"') }}
          />
        )}
        
        <div style={{ 
          position: "absolute", 
          bottom: 40, 
          left: 100, 
          right: 100, 
          height: 20, 
          background: theme.background,
          border: `3px solid ${theme.border}`,
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          <div style={{ 
            height: "100%", 
            background: theme.accent, 
            width: `${((index + 1) / totalSlides) * 100}%`, 
          }} />
        </div>
        
        <div style={{
          position: 'absolute',
          top: 30,
          right: 40,
          fontFamily,
          fontSize: 20,
          fontWeight: 900,
          color: theme.background,
          background: theme.primary,
          padding: '6px 16px',
          borderRadius: 12,
          border: `3px solid ${theme.border}`,
          boxShadow: `4px 4px 0px ${theme.shadow}`,
        }}>
          {index + 1} / {totalSlides}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EndSlide: React.FC<{ variant: ThemeVariant }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = getTheme(variant);
  const entrance = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <BackgroundEffects variant={variant} />
      <div style={{
        transform: `scale(${interpolate(entrance, [0, 1], [0.8, 1])})`,
        opacity: entrance,
        textAlign: "center",
        fontFamily,
        zIndex: 10,
        padding: "80px 100px",
        background: theme.cardBg,
        backdropFilter: "blur(50px)",
        borderRadius: 80,
        border: `8px solid ${theme.border}`,
        boxShadow: `24px 24px 0px ${theme.shadow}`,
        maxWidth: "85%",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 40,
      }}>
        <div>
          <h1 style={{ 
              fontSize: 100, 
              fontWeight: 900, 
              margin: 0, 
              lineHeight: 1, 
              color: theme.primary,
              letterSpacing: -4,
          }}>
            Titas Sir
          </h1>
          <p style={{
            fontSize: 32,
            fontWeight: 800,
            color: theme.secondary,
            textTransform: 'uppercase',
            letterSpacing: 4,
            marginTop: 20,
          }}>ICSE • ISC • CBSE Biology</p>
        </div>

        <div style={{ height: 4, background: theme.subtext, width: 200, opacity: 0.3 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center' }}>
            <div style={{ background: theme.accent, padding: '10px 20px', borderRadius: 15, border: `3px solid ${theme.background}` }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: theme.background }}>📞 9123774239</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
            <div style={{ background: theme.cardBg, padding: '15px 30px', borderRadius: 20, border: `3px solid ${theme.primary}` }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: theme.text }}>📝 bionotes-liard.vercel.app</span>
            </div>
            <div style={{ background: theme.cardBg, padding: '15px 30px', borderRadius: 20, border: `3px solid ${theme.secondary}` }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: theme.text }}>🌐 titassir.eugenicserudite.xyz</span>
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: 20,
          background: theme.warning,
          color: theme.background,
          padding: '12px 40px',
          borderRadius: 40,
          fontSize: 28,
          fontWeight: 900,
          boxShadow: `8px 8px 0px ${theme.shadow}`,
        }}>
          Search "Titas Sir" on Google
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const MainComposition: React.FC<Props> = ({ title, sections, category }) => {
  const { fps } = useVideoConfig();
  
  let variant: ThemeVariant = "standard";
  if (category?.startsWith("Biofacts-")) {
    const themeName = category.split("-")[1]?.toLowerCase();
    variant = `auto_${themeName}` as ThemeVariant;
  } else if (category?.startsWith("Auto-Generated")) {
    variant = "auto_forest";
  }

  const theme = getTheme(variant);
  const DEFAULT_SLIDE_DURATION = 120;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      <BackgroundMusic />
      <Branding variant={variant} />
      <Series>
        <Series.Sequence durationInFrames={fps * 2}>
          <TitleSlide title={title} category={category} variant={variant} />
        </Series.Sequence>
        {sections.map((section, index) => (
          <Series.Sequence key={index} durationInFrames={section.durationInFrames || DEFAULT_SLIDE_DURATION}>
            <ContentSlide section={section} index={index} totalSlides={sections.length} variant={variant} />
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={fps * 4}>
          <EndSlide variant={variant} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
