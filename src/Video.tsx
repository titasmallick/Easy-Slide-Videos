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
  Img,
  Video as RemotionVideo,
  Sequence,
} from "remotion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";

// Inject KaTeX CSS once into the document head for LaTeX rendering
const KATEX_CSS = `
.katex { font-size: 1.1em; color: inherit; }
.katex-display { overflow-x: auto; overflow-y: hidden; padding: 8px 0; }
.katex .base { white-space: nowrap; }
.katex-html { display: inline; }
.katex .mfrac .frac-line { border-bottom-color: currentColor; }
`;
if (typeof document !== 'undefined' && !document.getElementById('katex-remotion-css')) {
  const style = document.createElement('style');
  style.id = 'katex-remotion-css';
  style.textContent = KATEX_CSS;
  document.head.appendChild(style);
}

const outfitFont = loadOutfit();

export const FONTS: Record<string, string> = {
  outfit: outfitFont.fontFamily,
  montserrat: outfitFont.fontFamily,
  playfair: outfitFont.fontFamily,
  inter: outfitFont.fontFamily,
  courier: outfitFont.fontFamily,
};

const fontFamily = outfitFont.fontFamily;

// Premium Theme definitions
export interface Theme {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  cardBg: string;
  border: string;
  fontFamily?: string;
  // Extended customization
  backgroundPattern?: 'none' | 'grid' | 'dots' | 'diagonal' | 'circuit';
  cardGlassIntensity?: number; // 0–100, controls backdrop-blur and opacity
  accentGradient?: string; // e.g. "linear-gradient(135deg, #ff6b6b, #ffd93d)"
  cornerDecorations?: boolean; // show/hide corner bracket decorations
}

export const THEMES: Record<string, Theme> = {
  "radiant-gold": { 
    background: "#1A150E", 
    cardBg: "rgba(35, 30, 25, 0.85)", 
    primary: "#FDE047", 
    secondary: "#FB923C", 
    accent: "#6EE7B7", 
    text: "#FFFAF0", 
    border: "rgba(253, 224, 71, 0.25)" 
  },
  "neon-emerald": { 
    background: "#062016", 
    cardBg: "rgba(10, 40, 30, 0.85)", 
    primary: "#34D399", 
    secondary: "#A7F3D0", 
    accent: "#FDE047", 
    text: "#ECFDF5", 
    border: "rgba(52, 211, 153, 0.25)" 
  },
  "electric-amethyst": { 
    background: "#1E0E30", 
    cardBg: "rgba(40, 20, 60, 0.85)", 
    primary: "#A78BFA", 
    secondary: "#DDD6FE", 
    accent: "#FB923C", 
    text: "#F5F3FF", 
    border: "rgba(167, 139, 250, 0.25)" 
  },
  "crimson-pulse": { 
    background: "#2D0A0A", 
    cardBg: "rgba(60, 20, 20, 0.85)", 
    primary: "#F87171", 
    secondary: "#FCA5A5", 
    accent: "#6EE7B7", 
    text: "#FEF2F2", 
    border: "rgba(248, 113, 113, 0.25)" 
  },
  "cyber-cyan": { 
    background: "#081E26", 
    cardBg: "rgba(10, 45, 55, 0.85)", 
    primary: "#22D3EE", 
    secondary: "#7DD3FC", 
    accent: "#F472B6", 
    text: "#ECFEFF", 
    border: "rgba(34, 211, 238, 0.25)" 
  },
  "midnight-magenta": { 
    background: "#2E0821", 
    cardBg: "rgba(60, 15, 45, 0.85)", 
    primary: "#E879F9", 
    secondary: "#F5D0FE", 
    accent: "#FDE047", 
    text: "#FDF4FF", 
    border: "rgba(232, 121, 249, 0.25)" 
  },
  "arctic-blue": { 
    background: "#0E1B2D", 
    cardBg: "rgba(25, 45, 75, 0.85)", 
    primary: "#60A5FA", 
    secondary: "#93C5FD", 
    accent: "#FB923C", 
    text: "#EFF6FF", 
    border: "rgba(96, 165, 250, 0.25)" 
  },
  "volcanic-orange": { 
    background: "#2D1509", 
    cardBg: "rgba(65, 30, 15, 0.85)", 
    primary: "#FB923C", 
    secondary: "#FDBA74", 
    accent: "#22D3EE", 
    text: "#FFF7ED", 
    border: "rgba(251, 146, 60, 0.25)" 
  },
  "slate-silver": { 
    background: "#1E293B", 
    cardBg: "rgba(51, 65, 85, 0.85)", 
    primary: "#CBD5E1", 
    secondary: "#94A3B8", 
    accent: "#FDE047", 
    text: "#F8FAFC", 
    border: "rgba(203, 213, 225, 0.25)" 
  },
  "royal-indigo": { 
    background: "#1E1B4B", 
    cardBg: "rgba(49, 46, 129, 0.85)", 
    primary: "#818CF8", 
    secondary: "#A5B4FC", 
    accent: "#F472B6", 
    text: "#EEF2FF", 
    border: "rgba(129, 140, 248, 0.25)" 
  }
};

export interface SlideData {
  id: string;
  folder: string;
  media: string | null;
  mediaType: 'image' | 'video' | null;
  heading: string;
  subheading?: string;
  content: string;
  startTime?: number;
  endTime?: number;
  durationInSeconds: number;
  mediaStartFromInSeconds?: number;
  layout: 'split-media-right' | 'split-media-left' | 'full-background-media' | 'text-only' | 'media-only' | 'grid-collage' | 'chart-only' | 'countdown' | 'code-block';
  transition: string;
  lines?: Array<Array<{ text: string; relStart: number; relEnd: number }>>;
  voiceover?: string;
  bgMusic?: string;       // Per-slide background music override path
  mediaList?: string[];
  fontWeight?: string;
  headingFontWeight?: string;
  subheadingFontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: number;
  headingFontSize?: number;
  subheadingFontSize?: number;
  textShadow?: string;
  textStroke?: string;
  transitionDurationInSeconds?: number;
  overlayOpacity?: number;
  chart?: ChartConfig;
  codeBlock?: {
    code: string;
    language?: string;    // e.g. "javascript", "python", "bash" (display-only label)
    showLineNumbers?: boolean;
  };
  countdownFrom?: number; // Used with layout: 'countdown' — counts down from this number
  // Per-slide overrides
  themeName?: string;          // Override global theme for this slide only
  theme?: Partial<Theme>;      // Fine-grained color overrides for this slide only
  accentColor?: string;        // Shorthand: overrides just theme.primary for this slide
  bgVideo?: string;            // Looping ambient video behind the glass card
  accentIcon?: string;         // Emoji or text rendered as a large ghost icon behind content
  ticker?: string;             // Scrolling marquee text strip at the bottom of the slide
  subtitleBurnIn?: boolean;    // Render current caption line as always-visible bottom bar
  textAnimation?: 'none' | 'stagger' | 'pop-in' | 'reveal'; // Heading word entrance animation
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'donut';
  data: ChartDataPoint[];
  color?: string;
}

export interface VideoProps {
  video: {
    width: number;
    height: number;
    fps: number;
    themeName?: string;
    theme?: Partial<Theme>;
    fontFamily?: string;
    fontWeight?: string;
    disableAnimations?: boolean;
    iconName?: string;
    progressBar?: {
      show: boolean;
      type?: 'line' | 'border' | 'radial';
      position?: 'top' | 'bottom';
      color?: string;
      height?: number;
      thickness?: number;
      glow?: boolean;
    };
    border?: {
      show: boolean;
      color?: string;
      width?: number;
      radius?: number;
      glow?: boolean;
    };
    slideCounter?: {
      show: boolean;
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
      style?: 'minimal' | 'pill' | 'fraction' | 'dots';
      color?: string;
    };
  };
  audio: {
    musicPath: string;
    volume: number;
    loop: boolean;
    fadeInInSeconds?: number;
    fadeOutInSeconds?: number;
  };
  branding: {
    showLogo: boolean;
    logoPath: string;
    logoText: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size: number;
    opacity: number;
    persistent: boolean;
    authorName?: string;
    badgeText?: string;
    watermarkImage?: string;   // Path to a semi-transparent watermark PNG rendered over every slide
    watermarkOpacity?: number; // 0–1, default 0.12
    watermarkSize?: number;    // px, default 200
    watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
  titlePage: {
    show: boolean;
    style?: 'standard' | 'minimalist' | 'thumbnail' | 'glassmorphic' | 'glassmorphic-media' | 'bold-brutalism' | 'cyberpunk-neon' | 'editorial-serif' | 'split-reveal';
    title: string;
    subtitle: string;
    media?: string;
    mediaType?: 'image' | 'video';
    durationInSeconds: number;
    theme: {
      background: string;
      textColor: string;
      subtitleColor: string;
    };
    fontWeight?: string;
    headingFontWeight?: string;
    subheadingFontWeight?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontSize?: number;
    headingFontSize?: number;
    subheadingFontSize?: number;
    textShadow?: string;
    textStroke?: string;
  };
  slides: SlideData[];
  endPage: {
    show: boolean;
    style?: 'standard' | 'minimalist' | 'thumbnail' | 'glassmorphic' | 'bold-brutalism' | 'cyberpunk-neon' | 'editorial-serif' | 'split-reveal';
    title: string;
    subtitle: string;
    contact: string;
    website: string;
    startTime?: number;
    durationInSeconds: number;
    theme: {
      background: string;
      textColor: string;
      subtitleColor: string;
    };
    fontWeight?: string;
    headingFontWeight?: string;
    subheadingFontWeight?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontSize?: number;
    headingFontSize?: number;
    subheadingFontSize?: number;
    textShadow?: string;
    textStroke?: string;
  };
}

// Background Blob component for smooth floating lights (Optimized out for performance)
const Blob: React.FC<{ color: string; size: number; x: number; y: number; delay: number }> = ({ color, size, x, y, delay }) => {
  return null;
};

// Premium dynamic background (Optimized to use native hardware CSS radial-gradients)
const BackgroundEffects: React.FC<{ theme: Theme }> = ({ theme }) => {
  const pattern = theme.backgroundPattern ?? 'grid';
  const showCorners = theme.cornerDecorations !== false; // default true

  const getPatternStyle = (): React.CSSProperties => {
    switch (pattern) {
      case 'none': return {};
      case 'dots': return {
        opacity: 0.07,
        backgroundImage: `radial-gradient(${theme.primary} 1.5px, transparent 1.5px)`,
        backgroundSize: '40px 40px',
      };
      case 'diagonal': return {
        opacity: 0.06,
        backgroundImage: `repeating-linear-gradient(45deg, ${theme.primary} 0, ${theme.primary} 1px, transparent 0, transparent 50%)`,
        backgroundSize: '30px 30px',
      };
      case 'circuit': return {
        opacity: 0.07,
        backgroundImage: [
          `linear-gradient(${theme.primary} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${theme.primary} 1px, transparent 1px)`,
          `radial-gradient(${theme.accent}60 1.5px, transparent 1.5px)`,
        ].join(', '),
        backgroundSize: '80px 80px, 80px 80px, 80px 80px',
        backgroundPosition: '0 0, 0 0, 40px 40px',
      };
      case 'grid':
      default: return {
        opacity: 0.08,
        backgroundImage: `linear-gradient(${theme.primary} 1px, transparent 1px), linear-gradient(90deg, ${theme.primary} 1px, transparent 1px)`,
        backgroundSize: '120px 120px',
      };
    }
  };

  return (
    <AbsoluteFill style={{ 
      background: `radial-gradient(circle at 10% 20%, ${theme.primary}12 0%, transparent 50%), radial-gradient(circle at 90% 80%, ${theme.secondary}12 0%, transparent 50%), radial-gradient(circle at 50% 10%, ${theme.accent}08 0%, transparent 40%), ${theme.background}`,
      overflow: "hidden" 
    }}>
      {/* Background pattern layer */}
      {pattern !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, ...getPatternStyle() }} />
      )}

      {/* Decorative corner brackets */}
      {showCorners && ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
        const isTop = pos.includes('top');
        const isLeft = pos.includes('left');
        return (
          <div key={pos} style={{ 
            position: 'absolute', 
            top: isTop ? 40 : 'auto', 
            bottom: isTop ? 'auto' : 40, 
            left: isLeft ? 40 : 'auto', 
            right: isLeft ? 'auto' : 40, 
            width: 80, 
            height: 80, 
            borderLeft: isLeft ? `5px solid ${theme.primary}` : 'none',
            borderRight: isLeft ? 'none' : `5px solid ${theme.primary}`,
            borderTop: isTop ? `5px solid ${theme.primary}` : 'none',
            borderBottom: isTop ? 'none' : `5px solid ${theme.primary}`,
            zIndex: 100,
            opacity: 0.35
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// Global Branding Overlay
const BrandingOverlay: React.FC<{ branding: VideoProps['branding']; theme: Theme; currentFrame: number; totalDuration: number; fps: number; titleShow: boolean; titleSecs: number; endShow: boolean; endSecs: number }> = ({ branding, theme, currentFrame, totalDuration, fps, titleShow, titleSecs, endShow, endSecs }) => {
  if (!branding.showLogo) return null;

  const titleDuration = titleShow ? titleSecs * fps : 0;
  const endDuration = endShow ? endSecs * fps : 0;
  
  const isTitleActive = titleShow && currentFrame < titleDuration;
  const isEndActive = endShow && currentFrame >= totalDuration - endDuration;

  if (!branding.persistent && (isTitleActive || isEndActive)) return null;

  // Position settings
  const positionStyles: React.CSSProperties = {};
  if (branding.position.includes('top')) positionStyles.top = 45;
  else positionStyles.bottom = 45;

  if (branding.position.includes('left')) positionStyles.left = 50;
  else positionStyles.right = 50;

  return (
    <div style={{
      position: 'absolute',
      ...positionStyles,
      zIndex: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      background: theme.cardBg,
      backdropFilter: 'blur(20px)',
      padding: '12px 24px',
      borderRadius: 40,
      border: `2px solid ${theme.primary}`,
      opacity: branding.opacity,
      transition: 'opacity 0.5s ease',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    }}>
      {branding.logoPath ? (
        <Img
          src={staticFile(branding.logoPath)}
          style={{
            height: branding.size,
            width: branding.size,
            objectFit: 'contain'
          }}
        />
      ) : (
        <div style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: theme.accent,
          boxShadow: `0 0 10px ${theme.accent}`
        }} />
      )}
      {branding.logoText && (
        <span style={{
          fontFamily,
          fontSize: 20,
          fontWeight: 900,
          color: theme.text,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>
          {branding.logoText}
        </span>
      )}
    </div>
  );
};

// Dynamic progress bar component
const ProgressBar: React.FC<{
  show: boolean;
  type?: 'line' | 'border' | 'radial';
  position: 'top' | 'bottom';
  color?: string;
  height?: number;
  thickness?: number;
  glow?: boolean;
  theme: Theme;
  currentFrame: number;
  totalDuration: number;
}> = ({ 
  show, 
  type = 'line', 
  position, 
  color, 
  height = 8, 
  thickness = 8, 
  glow = true, 
  theme, 
  currentFrame, 
  totalDuration 
}) => {
  if (!show) return null;
  const { width, height: videoHeight } = useVideoConfig();
  const progress = Math.min(1, Math.max(0, currentFrame / totalDuration));
  const barColor = color || theme.primary;

  // 1. BORDER LOADER TYPE
  if (type === 'border') {
    const borderThickness = thickness || height;
    const perimeter = 2 * (width + videoHeight);
    const strokeDasharray = perimeter;
    const strokeDashoffset = perimeter * (1 - progress);

    return (
      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
        viewBox={`0 0 ${width} ${videoHeight}`}
      >
        <rect
          x={borderThickness / 2}
          y={borderThickness / 2}
          width={width - borderThickness}
          height={videoHeight - borderThickness}
          fill="none"
          stroke={barColor}
          strokeWidth={borderThickness}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={glow ? {
            filter: `drop-shadow(0 0 ${borderThickness}px ${barColor})`,
          } : undefined}
        />
      </svg>
    );
  }

  // 2. RADIAL CORNER LOADER TYPE
  if (type === 'radial') {
    const radius = 60;
    const strokeWidth = thickness || height;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <div style={{
        position: 'absolute',
        top: 30,
        right: 30,
        zIndex: 1000,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={barColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={glow ? {
              filter: `drop-shadow(0 0 ${strokeWidth}px ${barColor})`,
            } : undefined}
          />
        </svg>
        <div style={{
          position: 'absolute',
          color: theme.text,
          fontSize: '20px',
          fontWeight: '900',
          fontFamily: 'sans-serif',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }}>
          {Math.round(progress * 100)}%
        </div>
      </div>
    );
  }

  // 3. CLASSICAL LINE TYPE (Default)
  const styles: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    height,
    background: barColor,
    transform: `scaleX(${progress})`,
    transformOrigin: 'left',
    zIndex: 600,
  };

  if (glow) {
    styles.boxShadow = `0 0 12px ${barColor}`;
  }

  if (position === 'top') {
    styles.top = 0;
  } else {
    styles.bottom = 0;
  }

  return <div style={styles} />;
};

const ScreenBorder: React.FC<{
  show: boolean;
  color?: string;
  width?: number;
  radius?: number;
  glow?: boolean;
  theme: Theme;
}> = ({ show, color, width = 12, radius = 24, glow = true, theme }) => {
  if (!show) return null;
  const borderColor = color || theme.border;

  return (
    <AbsoluteFill 
      style={{
        pointerEvents: 'none',
        zIndex: 550,
        boxSizing: 'border-box',
        border: `${width}px solid ${borderColor}`,
        borderRadius: radius,
        boxShadow: glow ? `inset 0 0 20px ${borderColor}40, 0 0 20px ${borderColor}40` : undefined,
      }}
    />
  );
};

const hasMarkdown = (text: string) => /~~|\*|_|`|\$/.test(text);

// Slide Counter Overlay Component
const SlideCounter: React.FC<{
  current: number;
  total: number;
  style?: 'minimal' | 'pill' | 'fraction' | 'dots';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  color?: string;
  theme: Theme;
}> = ({ current, total, style = 'pill', position = 'bottom-right', color, theme }) => {
  const c = color || theme.primary;

  const posStyle: React.CSSProperties = { position: 'absolute', zIndex: 480, pointerEvents: 'none' };
  if (position.includes('top')) posStyle.top = 48;
  else posStyle.bottom = 48;
  if (position.includes('left')) posStyle.left = 60;
  else if (position.includes('right')) posStyle.right = 60;
  else { posStyle.left = '50%'; posStyle.transform = 'translateX(-50%)'; }

  if (style === 'dots') {
    return (
      <div style={{ ...posStyle, display: 'flex', gap: 8, alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            width: i === current - 1 ? 20 : 8,
            height: 8,
            borderRadius: 4,
            background: i === current - 1 ? c : `${c}40`,
            transition: 'width 0.3s ease',
            boxShadow: i === current - 1 ? `0 0 8px ${c}` : undefined,
          }} />
        ))}
      </div>
    );
  }

  if (style === 'minimal') {
    return (
      <div style={{ ...posStyle, fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: c, letterSpacing: 2, opacity: 0.8 }}>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    );
  }

  if (style === 'fraction') {
    return (
      <div style={{ ...posStyle, display: 'flex', alignItems: 'center', gap: 4, background: theme.cardBg, backdropFilter: 'blur(12px)', borderRadius: 12, padding: '8px 16px', border: `1.5px solid ${c}40` }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: c }}>{current}</span>
        <span style={{ fontSize: 16, color: theme.secondary, margin: '0 2px' }}>/</span>
        <span style={{ fontSize: 16, color: theme.secondary }}>{total}</span>
      </div>
    );
  }

  // Default: 'pill'
  return (
    <div style={{
      ...posStyle,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: theme.cardBg,
      backdropFilter: 'blur(16px)',
      border: `1.5px solid ${c}50`,
      borderRadius: 40,
      padding: '8px 20px',
      boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}` }} />
      <span style={{ fontSize: 16, fontWeight: 700, color: theme.text, letterSpacing: 1 }}>
        Slide {current} of {total}
      </span>
    </div>
  );
};

// Watermark image overlay — persistent semi-transparent PNG stamped over every frame
const WatermarkOverlay: React.FC<{
  path: string;
  opacity?: number;
  size?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}> = ({ path, opacity = 0.12, size = 200, position = 'bottom-right' }) => {
  const posStyle: React.CSSProperties = { position: 'absolute', zIndex: 490, pointerEvents: 'none' };
  if (position === 'center') {
    posStyle.top = '50%'; posStyle.left = '50%'; posStyle.transform = 'translate(-50%, -50%)';
  } else {
    if (position.includes('top')) posStyle.top = 40; else posStyle.bottom = 40;
    if (position.includes('left')) posStyle.left = 40; else posStyle.right = 40;
  }
  return (
    <Img
      src={staticFile(path)}
      style={{ ...posStyle, width: size, height: size, objectFit: 'contain', opacity }}
    />
  );
};

// Countdown Slide Layout — animated large number countdown
const CountdownLayout: React.FC<{
  from?: number;
  heading?: string;
  theme: Theme;
  fontFamily: string;
  disableAnimations?: boolean;
}> = ({ from = 5, heading, theme, fontFamily, disableAnimations }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const totalSecs = durationInFrames / fps;
  const elapsed = frame / fps;
  const remaining = Math.max(0, Math.ceil(from - (elapsed / totalSecs) * from));
  const progress = elapsed / totalSecs;

  // Pulse beat per second
  const beatFrame = frame % fps;
  const pulse = disableAnimations ? 1 : interpolate(beatFrame, [0, fps * 0.15, fps * 0.3], [0.9, 1.08, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Circle stroke progress
  const circumference = 2 * Math.PI * 200;
  const strokeDash = circumference * (1 - progress);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', width: '100%', gap: 30,
    }}>
      {heading && (
        <h2 style={{ fontFamily, fontSize: 42, fontWeight: 800, color: theme.primary, margin: 0, letterSpacing: -1 }}>
          {heading}
        </h2>
      )}
      <div style={{ position: 'relative', width: 480, height: 480 }}>
        {/* Background circle */}
        <svg width="480" height="480" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx="240" cy="240" r="200" fill="none" stroke={`${theme.primary}18`} strokeWidth="12" />
          <circle
            cx="240" cy="240" r="200"
            fill="none"
            stroke={theme.primary}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference - strokeDash}`}
            style={{ filter: `drop-shadow(0 0 12px ${theme.primary})`, transformOrigin: '240px 240px', transform: 'rotate(-90deg)' }}
          />
        </svg>
        {/* Number */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily, fontWeight: 900, fontSize: 180,
          color: theme.primary,
          textShadow: `0 0 60px ${theme.primary}60`,
          transform: `scale(${pulse})`,
          letterSpacing: -8,
        }}>
          {remaining}
        </div>
      </div>
    </div>
  );
};

// Syntax colors for code block (dark-theme aware)
const CODE_COLORS = {
  keyword: '#ff79c6',
  string: '#f1fa8c',
  comment: '#6272a4',
  number: '#bd93f9',
  function: '#50fa7b',
  operator: '#ff79c6',
  default: '#f8f8f2',
};

// Lightweight CSS-only syntax highlighter
function highlightCode(code: string, _language?: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, li) => {
    // Tokenize with regex
    const tokens: React.ReactNode[] = [];
    const patterns: Array<{ re: RegExp; color: string }> = [
      { re: /(\/\/.*$)/g,                                             color: CODE_COLORS.comment },
      { re: /(#.*$)/g,                                                color: CODE_COLORS.comment },
      { re: /\b(const|let|var|function|return|import|from|export|default|class|extends|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|async|await|try|catch|finally|def|print|in|not|and|or|pass|None|True|False|lambda|yield|with|as|del|global|nonlocal|raise|assert|elif|import|from|is)\b/g, color: CODE_COLORS.keyword },
      { re: /(["'`])(.*?)\1/g,                                        color: CODE_COLORS.string },
      { re: /\b(\d+\.?\d*)\b/g,                                      color: CODE_COLORS.number },
      { re: /([a-zA-Z_$][\w$]*)(?=\s*\()/g,                         color: CODE_COLORS.function },
    ];

    // We'll just render the raw line with a simple regex pass
    // Split into segments by running all patterns against cleaned line
    let remaining = line;
    let key = 0;
    const lineNodes: React.ReactNode[] = [];

    // Single-pass: find earliest match
    while (remaining.length > 0) {
      let earliest: { index: number; len: number; color: string; text: string } | null = null;
      for (const { re, color } of patterns) {
        re.lastIndex = 0;
        const m = re.exec(remaining);
        if (m && (earliest === null || m.index < earliest.index)) {
          earliest = { index: m.index, len: m[0].length, color, text: m[0] };
        }
      }
      if (!earliest || earliest.index > 0) {
        const plain = earliest ? remaining.slice(0, earliest.index) : remaining;
        lineNodes.push(<span key={key++} style={{ color: CODE_COLORS.default }}>{plain}</span>);
        remaining = earliest ? remaining.slice(earliest.index) : '';
      } else {
        lineNodes.push(<span key={key++} style={{ color: earliest.color, fontWeight: 600 }}>{earliest.text}</span>);
        remaining = remaining.slice(earliest.len);
      }
    }

    return (
      <div key={li} style={{ display: 'flex', minHeight: '1.4em' }}>
        {lineNodes.length ? lineNodes : <span>&#8203;</span>}
      </div>
    );
  });
}

// Code Block Slide Layout
const CodeBlockLayout: React.FC<{
  heading?: string;
  subheading?: string;
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  theme: Theme;
  fontFamily: string;
  entrance: number;
}> = ({ heading, subheading, code, language, showLineNumbers = true, theme, fontFamily, entrance }) => {
  const lines = code.split('\n');
  const translateY = interpolate(entrance, [0, 1], [30, 0]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: 24,
      transform: `translateY(${translateY}px)`, opacity: entrance,
    }}>
      {/* Header */}
      {(heading || language) && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          {heading && (
            <h2 style={{
              fontFamily, fontSize: 46, fontWeight: 800, color: theme.primary,
              margin: 0, lineHeight: 1.1, letterSpacing: -1,
            }}>{heading}</h2>
          )}
          {language && (
            <span style={{
              fontFamily: 'monospace', fontSize: 16, fontWeight: 700,
              color: theme.accent, background: `${theme.accent}18`,
              border: `1.5px solid ${theme.accent}40`,
              padding: '4px 14px', borderRadius: 20, letterSpacing: 1, textTransform: 'uppercase',
            }}>{language}</span>
          )}
        </div>
      )}
      {subheading && (
        <p style={{ fontFamily, fontSize: 24, color: theme.secondary, margin: 0, fontWeight: 500 }}>{subheading}</p>
      )}

      {/* Code panel */}
      <div style={{
        flex: 1,
        background: 'rgba(10,10,18,0.85)',
        border: `2px solid ${theme.primary}30`,
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.3)`,
      }}>
        {/* Traffic-light title bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.04)',
          borderBottom: `1.5px solid ${theme.border}`,
        }}>
          {['#ff5f57','#ffbd2e','#28c840'].map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
          ))}
          {language && (
            <span style={{ marginLeft: 14, fontFamily: 'monospace', fontSize: 14, color: CODE_COLORS.comment }}>
              {language === 'javascript' || language === 'js' ? 'script.js'
                : language === 'python' || language === 'py' ? 'script.py'
                : language === 'bash' || language === 'sh' ? 'terminal.sh'
                : language === 'typescript' || language === 'ts' ? 'script.ts'
                : `code.${language}`}
            </span>
          )}
        </div>

        {/* Code content */}
        <div style={{ padding: '20px 24px', overflow: 'hidden', flex: 1, fontFamily: 'monospace', fontSize: 22, lineHeight: 1.65 }}>
          {lines.map((_, li) => (
            <div key={li} style={{ display: 'flex', gap: 20 }}>
              {showLineNumbers && (
                <span style={{ color: CODE_COLORS.comment, minWidth: 32, textAlign: 'right', userSelect: 'none', opacity: 0.6, fontSize: 18 }}>
                  {li + 1}
                </span>
              )}
              <div style={{ flex: 1 }}>{highlightCode(lines[li])}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MarkdownText: React.FC<{
  text: string;
  theme: Theme;
  primaryColor?: string;
  strongColor?: string;
  emColor?: string;
  useParagraphs?: boolean;
}> = ({ text, theme, primaryColor, strongColor, emColor, useParagraphs }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        strong: ({node, ...props}) => <span style={{color: strongColor || primaryColor || theme.primary, fontWeight: 900}} {...props} />,
        em: ({node, ...props}) => <span style={{color: emColor || theme.accent, fontWeight: 900, fontStyle: 'normal'}} {...props} />,
        del: ({node, ...props}) => (
          <span 
            style={{
              textDecoration: 'none', 
              background: `linear-gradient(120deg, ${theme.accent}35 0%, ${theme.accent}15 100%)`, 
              borderBottom: `3px solid ${theme.accent}`, 
              padding: '2px 6px', 
              borderRadius: '4px', 
              fontWeight: 900,
              WebkitTextFillColor: theme.text,
            }} 
            {...props} 
          />
        ),
        a: ({node, href, ...props}) => {
          if (href === 'highlight') {
            return (
              <span 
                style={{
                  textDecoration: 'none', 
                  background: `linear-gradient(120deg, ${theme.accent}35 0%, ${theme.accent}15 100%)`, 
                  borderBottom: `3px solid ${theme.accent}`, 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  fontWeight: 900,
                  WebkitTextFillColor: theme.text,
                }} 
                {...props} 
              />
            );
          }
          return <a href={href} style={{ color: theme.primary }} {...props} />;
        },
        code: ({node, ...props}) => <span style={{fontFamily: 'monospace', background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${theme.border}`, padding: '2px 6px', borderRadius: '6px', color: theme.primary, fontSize: '0.9em', fontWeight: 700}} {...props} />,
        p: ({node, ...props}) => useParagraphs ? <p style={{margin: '0 0 16px 0'}} {...props} /> : <span {...props} />,
        ul: ({node, ...props}) => <ul style={{ margin: '0 0 20px 0', paddingLeft: 30, listStyleType: 'square' }} {...props} />,
        ol: ({node, ...props}) => <ol style={{ margin: '0 0 20px 0', paddingLeft: 30, listStyleType: 'decimal' }} {...props} />,
        li: ({node, ...props}) => <li style={{marginBottom: 10}} {...props} />,
        table: ({node, ...props}) => (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: '20px 0',
            fontSize: '0.9em',
            background: theme.cardBg,
            border: `1.5px solid ${theme.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
          }} {...props} />
        ),
        thead: ({node, ...props}) => (
          <thead style={{
            background: `linear-gradient(120deg, ${theme.primary}20, ${theme.primary}10)`,
            borderBottom: `2.5px solid ${theme.primary}`,
          }} {...props} />
        ),
        tbody: ({node, ...props}) => <tbody {...props} />,
        tr: ({node, ...props}) => (
          <tr style={{
            borderBottom: `1px solid ${theme.border}`,
            transition: 'background 0.2s ease',
          }} {...props} />
        ),
        th: ({node, ...props}) => (
          <th style={{
            padding: '12px 16px',
            fontWeight: 800,
            textAlign: 'left',
            color: theme.primary,
            letterSpacing: '-0.5px',
          }} {...props} />
        ),
        td: ({node, ...props}) => (
          <td style={{
            padding: '12px 16px',
            color: theme.text,
            opacity: 0.95,
          }} {...props} />
        ),
      }}
    >
      {text.replace(/~~(.*?)~~/g, "[$1](highlight)")}
    </ReactMarkdown>
  );
};

// Title Page Component with Style Variations
const TitleSlide: React.FC<{ titlePage: VideoProps['titlePage']; theme: Theme; fontFamily: string; disableAnimations?: boolean }> = ({ titlePage, theme, fontFamily, disableAnimations }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const style = titlePage.style || 'standard';
  const isPortrait = width < height;
  
  const entrance = disableAnimations
    ? 1
    : spring({ frame, fps, config: { damping: 11, stiffness: 120 } });
  
  const exitStart = durationInFrames - 12;
  const opacity = disableAnimations
    ? 1
    : frame >= exitStart 
      ? interpolate(frame, [exitStart, durationInFrames - 1], [1, 0], { extrapolateLeft: 'clamp' })
      : 1;

  const bgStyle: React.CSSProperties = titlePage.theme.background.includes('gradient')
    ? { backgroundImage: titlePage.theme.background }
    : { backgroundColor: titlePage.theme.background };

  // 1. MINIMALIST STYLE
  if (style === 'minimalist') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", paddingLeft: isPortrait ? 60 : 120, opacity }}>
        <BackgroundEffects theme={theme} />
        <div style={{
          maxWidth: "80%",
          textAlign: 'left',
          fontFamily,
          borderLeft: `8px solid ${theme.primary}`,
          paddingLeft: isPortrait ? 25 : 40,
          transform: `translateX(${interpolate(entrance, [0, 1], [-50, 0])}px)`,
          opacity: entrance,
        }}>
          <h1 style={{ 
            fontSize: isPortrait ? 55 : 85, 
            fontWeight: 300, 
            margin: 0, 
            lineHeight: 1.1, 
            color: titlePage.theme.textColor || theme.text,
            letterSpacing: -1,
          }}>
            {hasMarkdown(titlePage.title) ? (
              <MarkdownText text={titlePage.title} theme={theme} />
            ) : (
              titlePage.title.split(' ').map((word, i) => i === 0 ? <strong key={i} style={{ fontWeight: 900, color: theme.primary }}>{word} </strong> : word + ' ')
            )}
          </h1>
          {titlePage.subtitle && (
            <p style={{
              fontSize: isPortrait ? 20 : 24,
              fontWeight: 400,
              color: titlePage.theme.subtitleColor || theme.secondary,
              marginTop: 20,
              letterSpacing: 1,
            }}>
              <MarkdownText text={titlePage.subtitle} theme={theme} />
            </p>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // 2. THUMBNAIL STYLE
  if (style === 'thumbnail') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center", opacity }}>
        <BackgroundEffects theme={theme} />
        
        {/* Border Corners */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
          const isTop = pos.includes('top');
          const isLeft = pos.includes('left');
          return (
            <div key={pos} style={{ 
              position: 'absolute', 
              top: isTop ? 40 : 'auto', 
              bottom: isTop ? 'auto' : 40, 
              left: isLeft ? 40 : 'auto', 
              right: isLeft ? 'auto' : 40, 
              width: isPortrait ? 60 : 120, 
              height: isPortrait ? 60 : 120, 
              borderLeft: isLeft ? `8px solid ${theme.primary}` : 'none',
              borderRight: isLeft ? 'none' : `8px solid ${theme.primary}`,
              borderTop: isTop ? `8px solid ${theme.primary}` : 'none',
              borderBottom: isTop ? 'none' : `8px solid ${theme.primary}`,
            }} />
          );
        })}

        <div style={{
          transform: `scale(${interpolate(entrance, [0, 1], [0.85, 1])})`,
          opacity: entrance,
          textAlign: "center",
          fontFamily,
          zIndex: 10,
          padding: isPortrait ? "40px 30px" : "60px 80px",
          background: 'rgba(0,0,0,0.4)',
          borderRadius: isPortrait ? 24 : 40,
          border: `6px solid ${theme.primary}`,
          boxShadow: `${isPortrait ? 10 : 20}px ${isPortrait ? 10 : 20}px 0px rgba(0,0,0,0.5)`,
          maxWidth: "85%",
          position: 'relative',
        }}>
          {/* Top Badge */}
          <div style={{
            position: 'absolute',
            top: -25,
            left: '50%',
            transform: 'translateX(-50%)',
            background: theme.primary,
            color: theme.background,
            padding: '6px 20px',
            borderRadius: 15,
            fontSize: isPortrait ? 14 : 20,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 3,
            boxShadow: `0 5px 15px rgba(0,0,0,0.3)`
          }}>
            PRESENTATION
          </div>

          <h1 style={{ 
            fontSize: isPortrait ? 50 : 85, 
            fontWeight: 900, 
            margin: '20px 0 0 0', 
            lineHeight: 1.0, 
            color: titlePage.theme.textColor || theme.text,
            letterSpacing: isPortrait ? -2 : -4,
            textShadow: `6px 6px 0px ${theme.background}`,
            textTransform: 'uppercase',
          }}>
            <MarkdownText text={titlePage.title} theme={theme} />
          </h1>
          
          {titlePage.subtitle && (
            <p style={{
              fontSize: isPortrait ? 18 : 24,
              fontWeight: 800,
              color: titlePage.theme.subtitleColor || theme.secondary,
              marginTop: 20,
              letterSpacing: isPortrait ? 3 : 6,
              textTransform: 'uppercase',
            }}>
              <MarkdownText text={titlePage.subtitle} theme={theme} />
            </p>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // 3. GLASSMORPHIC MEDIA STYLE
  if (style === 'glassmorphic-media') {
    const splitDirection = isPortrait ? 'column' : 'row';
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center", opacity }}>
        <BackgroundEffects theme={theme} />
        
        {/* Extra pulsing backglow */}
        <div style={{
          position: 'absolute',
          width: isPortrait ? 300 : 500,
          height: isPortrait ? 300 : 500,
          borderRadius: '50%',
          background: theme.accent,
          filter: 'blur(150px)',
          opacity: 0.2 + Math.sin(frame / 20) * 0.05,
          zIndex: 5,
        }} />

        <div style={{
          transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
          opacity: entrance,
          fontFamily,
          zIndex: 10,
          padding: isPortrait ? "40px 24px" : "65px 75px",
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: "blur(60px)",
          borderRadius: isPortrait ? 30 : 50,
          border: `2px solid rgba(255,255,255,0.25)`,
          boxShadow: `0 50px 100px rgba(0,0,0,0.45), inset 0 0 40px rgba(255,255,255,0.05)`,
          maxWidth: "90%",
          display: 'flex',
          flexDirection: splitDirection,
          gap: isPortrait ? 30 : 60,
          alignItems: 'center',
        }}>
          {/* Text container */}
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: isPortrait ? 'center' : 'left' }}>
            <h1 style={{ 
              fontSize: isPortrait ? 64 : 70, 
              fontWeight: 900, 
              margin: 0, 
              lineHeight: 1.15, 
              color: titlePage.theme.textColor || theme.text,
              letterSpacing: -1.5,
              background: `linear-gradient(to right, ${theme.text} 30%, ${theme.primary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              <MarkdownText text={titlePage.title} theme={theme} />
            </h1>
            {titlePage.subtitle && (
              <p style={{
                fontSize: isPortrait ? 28 : 30,
                fontWeight: 500,
                color: titlePage.theme.subtitleColor || theme.secondary,
                marginTop: 20,
                opacity: 0.8,
                whiteSpace: 'pre-wrap',
              }}>
                <MarkdownText text={titlePage.subtitle} theme={theme} />
              </p>
            )}
          </div>
          
          {/* Media Container */}
          {titlePage.media && (
            <div style={{
              flex: 0.8,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <div style={{
                width: isPortrait ? 260 : 340,
                height: isPortrait ? 260 : 340,
                borderRadius: '50%',
                border: `6px solid ${theme.primary}`,
                boxShadow: `0 15px 35px rgba(0,0,0,0.5)`,
                overflow: 'hidden',
                transform: `scale(${interpolate(entrance, [0, 1], [0.8, 1])})`,
              }}>
                <Img 
                  src={staticFile(titlePage.media)} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // 4. GLASSMORPHIC STYLE
  if (style === 'glassmorphic') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center", opacity }}>
        <BackgroundEffects theme={theme} />
        
        {/* Extra pulsing backglow */}
        <div style={{
          position: 'absolute',
          width: isPortrait ? 300 : 500,
          height: isPortrait ? 300 : 500,
          borderRadius: '50%',
          background: theme.accent,
          filter: 'blur(150px)',
          opacity: 0.2 + Math.sin(frame / 20) * 0.05,
          zIndex: 5,
        }} />

        <div style={{
          transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
          opacity: entrance,
          textAlign: "center",
          fontFamily,
          zIndex: 10,
          padding: isPortrait ? "50px 30px" : "90px 110px",
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: "blur(60px)",
          borderRadius: isPortrait ? 30 : 60,
          border: `2px solid rgba(255,255,255,0.25)`,
          boxShadow: `0 50px 100px rgba(0,0,0,0.45), inset 0 0 40px rgba(255,255,255,0.05)`,
          maxWidth: "85%",
        }}>
          <h1 style={{ 
            fontSize: isPortrait ? 55 : 95, 
            fontWeight: 900, 
            margin: 0, 
            lineHeight: 1.15, 
            color: titlePage.theme.textColor || theme.text,
            letterSpacing: -2,
            background: `linear-gradient(to right, ${theme.text} 30%, ${theme.primary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            <MarkdownText text={titlePage.title} theme={theme} />
          </h1>
          {titlePage.subtitle && (
            <p style={{
              fontSize: isPortrait ? 26 : 38,
              fontWeight: 500,
              color: titlePage.theme.subtitleColor || theme.secondary,
              marginTop: 25,
              opacity: 0.8,
            }}>
              <MarkdownText text={titlePage.subtitle} theme={theme} />
            </p>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // 4. BOLD-BRUTALISM STYLE
  if (style === 'bold-brutalism') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center", opacity }}>
        <BackgroundEffects theme={theme} />
        <div style={{
          transform: `scale(${interpolate(entrance, [0, 1], [0.8, 1])}) rotate(${interpolate(entrance, [0, 1], [-3, 0])}deg)`,
          opacity: entrance,
          textAlign: "left",
          fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
          zIndex: 10,
          padding: isPortrait ? "40px 30px" : "60px 80px",
          background: theme.primary,
          color: theme.background,
          border: `${isPortrait ? '6px' : '10px'} solid ${theme.text}`,
          boxShadow: `${isPortrait ? '12px' : '20px'} ${isPortrait ? '12px' : '20px'} 0px ${theme.text}`,
          maxWidth: "85%",
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <div style={{
            background: theme.text,
            color: theme.primary,
            padding: "6px 16px",
            fontSize: isPortrait ? 16 : 24,
            fontWeight: 900,
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
            transform: 'rotate(-2deg)',
          }}>
            WARNING // HIGH IMPACT
          </div>
          <h1 style={{
            fontSize: isPortrait ? 55 : 95,
            fontWeight: 900,
            margin: 0,
            lineHeight: 0.9,
            letterSpacing: -1,
            textTransform: 'uppercase',
            color: theme.background,
          }}>
            <MarkdownText text={titlePage.title} theme={theme} primaryColor={theme.accent} />
          </h1>
          {titlePage.subtitle && (
            <p style={{
              fontSize: isPortrait ? 20 : 28,
              fontWeight: 800,
              color: theme.background,
              margin: 0,
              textTransform: 'uppercase',
              borderTop: `4px solid ${theme.background}`,
              paddingTop: 15,
            }}>
              <MarkdownText text={titlePage.subtitle} theme={theme} primaryColor={theme.accent} />
            </p>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // 5. CYBERPUNK-NEON STYLE
  if (style === 'cyberpunk-neon') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center", opacity }}>
        <BackgroundEffects theme={theme} />
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(244, 114, 182, 0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(244, 114, 182, 0.08) 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
          opacity: 0.3,
        }} />
        <div style={{
          transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
          opacity: entrance,
          textAlign: "center",
          fontFamily: "monospace, Courier, 'Courier New'",
          zIndex: 10,
          padding: isPortrait ? "50px 30px" : "70px 90px",
          background: 'rgba(5, 5, 15, 0.9)',
          borderRadius: 8,
          border: `3px solid ${theme.primary}`,
          boxShadow: `0 0 30px ${theme.primary}, inset 0 0 15px rgba(255,255,255,0.05)`,
          maxWidth: "85%",
          position: 'relative',
        }}>
          {/* Cyberpunk corner elements */}
          <div style={{ position: 'absolute', top: -5, left: -5, width: 25, height: 25, borderTop: `6px solid ${theme.accent}`, borderLeft: `6px solid ${theme.accent}` }} />
          <div style={{ position: 'absolute', top: -5, right: -5, width: 25, height: 25, borderTop: `6px solid ${theme.accent}`, borderRight: `6px solid ${theme.accent}` }} />
          <div style={{ position: 'absolute', bottom: -5, left: -5, width: 25, height: 25, borderBottom: `6px solid ${theme.accent}`, borderLeft: `6px solid ${theme.accent}` }} />
          <div style={{ position: 'absolute', bottom: -5, right: -5, width: 25, height: 25, borderBottom: `6px solid ${theme.accent}`, borderRight: `6px solid ${theme.accent}` }} />
          
          <div style={{
            color: theme.accent,
            fontSize: isPortrait ? 12 : 18,
            fontWeight: 800,
            letterSpacing: 4,
            marginBottom: 20,
            textTransform: 'uppercase',
            textShadow: `0 0 8px ${theme.accent}`,
          }}>
            [ SYSTEM_BOOT_SEQUENCE // OK ]
          </div>
          
          <h1 style={{
            fontSize: isPortrait ? 50 : 80,
            fontWeight: 900,
            margin: 0,
            lineHeight: 1.1,
            color: theme.text,
            letterSpacing: isPortrait ? -1 : -2,
            textShadow: `0 0 15px ${theme.primary}, 0 0 30px ${theme.primary}`,
            textTransform: 'uppercase',
          }}>
            <MarkdownText text={titlePage.title} theme={theme} />
          </h1>
          
          {titlePage.subtitle && (
            <p style={{
              fontSize: isPortrait ? 16 : 22,
              fontWeight: 400,
              color: theme.secondary,
              marginTop: 30,
              letterSpacing: 2,
              textShadow: `0 0 8px ${theme.secondary}`,
            }}>
              &gt;&gt; <MarkdownText text={titlePage.subtitle} theme={theme} />
            </p>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // 6. EDITORIAL-SERIF STYLE
  if (style === 'editorial-serif') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", paddingLeft: isPortrait ? 40 : 160, paddingRight: isPortrait ? 40 : 160, opacity }}>
        <BackgroundEffects theme={theme} />
        <div style={{
          maxWidth: "85%",
          textAlign: 'left',
          fontFamily: "Georgia, 'Times New Roman', Times, serif",
          transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
          opacity: entrance,
        }}>
          <div style={{
            fontSize: isPortrait ? 14 : 20,
            fontWeight: 400,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: theme.secondary,
            marginBottom: 25,
            borderBottom: `1px solid ${theme.primary}50`,
            paddingBottom: 15,
          }}>
            Vol. I / Issue IV
          </div>
          <h1 style={{
            fontSize: isPortrait ? 55 : 90,
            fontWeight: 300,
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 1.05,
            color: theme.text,
            letterSpacing: -1,
          }}>
            <MarkdownText text={titlePage.title} theme={theme} />
          </h1>
          {titlePage.subtitle && (
            <p style={{
              fontFamily,
              fontSize: isPortrait ? 18 : 24,
              fontWeight: 400,
              color: theme.primary,
              marginTop: 25,
              letterSpacing: 1,
              lineHeight: 1.4,
              maxWidth: 600,
            }}>
              <MarkdownText text={titlePage.subtitle} theme={theme} />
            </p>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // 7. SPLIT-REVEAL STYLE
  if (style === 'split-reveal') {
    const leftWidth = isPortrait ? '100%' : '45%';
    const rightWidth = isPortrait ? '100%' : '55%';
    const leftHeight = isPortrait ? '35%' : '100%';
    const rightHeight = isPortrait ? '65%' : '100%';
    const splitDirection = isPortrait ? 'column' : 'row';

    return (
      <AbsoluteFill style={{ ...bgStyle, display: 'flex', flexDirection: splitDirection, opacity }}>
        {/* Left Side: Solid Accent Block */}
        <div style={{
          width: leftWidth,
          height: leftHeight,
          background: theme.primary,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
          position: 'relative',
          transform: isPortrait 
            ? `translateY(${interpolate(entrance, [0, 1], [-100, 0])}%)`
            : `translateX(${interpolate(entrance, [0, 1], [-100, 0])}%)`,
          boxShadow: '10px 0 30px rgba(0,0,0,0.3)',
          zIndex: 15,
        }}>
          <div style={{
            fontFamily,
            fontSize: isPortrait ? 30 : 50,
            fontWeight: 900,
            color: theme.background,
            textTransform: 'uppercase',
            textAlign: 'center',
            letterSpacing: 4,
            lineHeight: 1,
          }}>
            {titlePage.subtitle ? titlePage.subtitle.replace(/~~/g, '').split(' ')[0] : 'INTRO'}
          </div>
        </div>

        {/* Right Side: Title text */}
        <div style={{
          width: rightWidth,
          height: rightHeight,
          background: theme.background,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: isPortrait ? 30 : 80,
          transform: isPortrait
            ? `translateY(${interpolate(entrance, [0, 1], [100, 0])}%)`
            : `translateX(${interpolate(entrance, [0, 1], [100, 0])}%)`,
          zIndex: 10,
        }}>
          <BackgroundEffects theme={theme} />
          <div style={{ zIndex: 12 }}>
            <h1 style={{
              fontFamily,
              fontSize: isPortrait ? 48 : 80,
              fontWeight: 900,
              color: theme.text,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: -2,
            }}>
              <MarkdownText text={titlePage.title} theme={theme} />
            </h1>
            {titlePage.subtitle && (
              <p style={{
                fontFamily,
                fontSize: isPortrait ? 18 : 22,
                fontWeight: 600,
                color: theme.secondary,
                marginTop: 20,
              }}>
                <MarkdownText text={titlePage.subtitle} theme={theme} />
              </p>
            )}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // 4. STANDARD STYLE (Fallback)
  return (
    <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center", opacity }}>
      <BackgroundEffects theme={theme} />
      <div style={{
        transform: `scale(${interpolate(entrance, [0, 1], [0.85, 1])})`,
        opacity: entrance,
        textAlign: "center",
        fontFamily,
        zIndex: 10,
        padding: "80px 100px",
        background: theme.cardBg,
        backdropFilter: "blur(35px)",
        borderRadius: 50,
        border: `6px solid ${theme.primary}`,
        boxShadow: `0 30px 60px rgba(0, 0, 0, 0.5)`,
        maxWidth: "80%",
      }}>
        <h1 style={{ 
          fontSize: 90, 
          fontWeight: 900, 
          margin: 0, 
          lineHeight: 1.1, 
          color: titlePage.theme.textColor || theme.text,
          letterSpacing: -3,
          textShadow: `8px 8px 0px ${theme.background}`,
        }}>
          <MarkdownText text={titlePage.title} theme={theme} />
        </h1>
        {titlePage.subtitle && (
          <p style={{
            fontSize: 28,
            fontWeight: 700,
            color: titlePage.theme.subtitleColor || theme.secondary,
            marginTop: 30,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            <MarkdownText text={titlePage.subtitle} theme={theme} />
          </p>
        )}
        <div style={{
          height: 6,
          background: theme.accent,
          width: interpolate(entrance, [0, 1], [0, 250]),
          margin: "40px auto 0",
          borderRadius: 3,
          boxShadow: `0 0 15px ${theme.accent}`
        }} />
      </div>
    </AbsoluteFill>
  );
};

// Dynamic Media Component with startFrom support
const isGif = (path: string) => path.toLowerCase().endsWith('.gif');

const MediaRenderer: React.FC<{ path: string; type: 'image' | 'video'; startFromInSeconds?: number; style?: React.CSSProperties }> = ({ path, type, startFromInSeconds = 0, style }) => {
  const { fps } = useVideoConfig();
  const startFromFrames = Math.round(startFromInSeconds * fps);
  // GIFs must use <Video> in Chromium — <Img> renders only the first frame
  const effectiveType: 'image' | 'video' = isGif(path) ? 'video' : type;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      borderRadius: 24,
      overflow: 'hidden',
      border: '1.5px solid rgba(255, 255, 255, 0.1)',
      ...style
    }}>
      {/* Blurred background fill */}
      <div style={{ position: 'absolute', inset: -10, filter: 'blur(30px) brightness(0.4)', zIndex: 1 }}>
        {effectiveType === 'image' && (
          <Img src={staticFile(path)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      {/* Crisp foreground */}
      <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {effectiveType === 'image' ? (
          <Img src={staticFile(path)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <RemotionVideo src={staticFile(path)} volume={0} startFrom={startFromFrames} loop style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        )}
      </div>
    </div>
  );
};

const KaraokeText: React.FC<{
  lines: Array<Array<{ text: string; relStart: number; relEnd: number }>>;
  currentFrame: number;
  fps: number;
  theme: Theme;
  fontFamily: string;
  fontWeight: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: number;
}> = ({ lines, currentFrame, fps, theme, fontFamily, fontWeight, textAlign, fontSize }) => {
  const currentTime = currentFrame / fps;
  const { width, height } = useVideoConfig();
  const isPortrait = width < height;
  
  // Calculate total number of characters to decide font size
  const totalChars = lines.reduce((acc, line) => acc + line.reduce((lAcc, word) => lAcc + word.text.length, 0), 0);
  const calculatedFontSize = fontSize || (isPortrait
    ? (totalChars > 250 ? 38 : totalChars > 150 ? 46 : 54)
    : (totalChars > 250 ? 28 : totalChars > 150 ? 34 : 40));

  let flexAlign: 'flex-start' | 'center' | 'flex-end' | 'stretch' = 'flex-start';
  let flexJustify: 'flex-start' | 'center' | 'flex-end' | 'space-between' = 'flex-start';
  if (textAlign === 'center') {
    flexAlign = 'center';
    flexJustify = 'center';
  } else if (textAlign === 'right') {
    flexAlign = 'flex-end';
    flexJustify = 'flex-end';
  } else if (textAlign === 'justify') {
    flexAlign = 'stretch';
    flexJustify = 'space-between';
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      alignItems: flexAlign,
      width: '100%',
      justifyContent: 'center',
    }}>
      {lines.map((line, lineIdx) => (
        <div key={lineIdx} style={{
          display: 'flex',
          flexWrap: 'wrap',
          lineHeight: '1.4',
          fontFamily,
          fontSize: calculatedFontSize,
          fontWeight: fontWeight || 'bold',
          justifyContent: flexJustify,
        }}>
          {line.map((word, wordIdx) => {
            const isActive = currentTime >= word.relStart && currentTime <= word.relEnd;
            const isSpoken = currentTime > word.relEnd;
            
            // Smooth and easy to read active word highlight (no bouncy jumping animations)
            const scale = isActive ? 1.05 : 1;
            const translateY = 0;
            
            let color = 'rgba(255,255,255,0.35)';
            let textShadow = 'none';
            
            if (isActive) {
              color = theme.accent;
              textShadow = `0 0 8px ${theme.accent}aa`;
            } else if (isSpoken) {
              color = theme.text;
            }
            
            return (
              <span
                key={wordIdx}
                style={{
                  display: 'inline-block',
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  color,
                  textShadow,
                  marginRight: '12px',
                  transition: 'color 0.15s ease, text-shadow 0.15s ease',
                  transformOrigin: 'center bottom',
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// SVG Chart Renderer Component (Pure SVG - Zero dependencies, fits any resolution)
const SvgChart: React.FC<{
  chart: NonNullable<SlideData['chart']>;
  theme: Theme;
  fontFamily: string;
}> = ({ chart, theme, fontFamily }) => {
  const { type, data, color } = chart;
  const chartColor = color || theme.primary;
  const accentColor = theme.accent;
  const textColor = theme.text;
  const secondaryColor = theme.secondary;

  const width = 600;
  const height = 360;
  const padding = 50;

  if (!data || data.length === 0) return null;

  // 1. BAR CHART
  if (type === 'bar') {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    const barWidth = (graphWidth / data.length) * 0.6;
    const gap = (graphWidth / data.length) * 0.4;

    return (
      <svg width={width} height={height} style={{ overflow: 'visible', fontFamily }}>
        {/* Background Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + graphHeight * (1 - ratio);
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={theme.border}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding - 10}
                y={y + 4}
                fill={secondaryColor}
                fontSize={12}
                textAnchor="end"
              >
                {Math.round(maxVal * ratio)}
              </text>
            </g>
          );
        })}

        {/* Bars and Labels */}
        {data.map((item, idx) => {
          const x = padding + idx * (barWidth + gap) + gap / 2;
          const barHeight = (item.value / maxVal) * graphHeight;
          const y = padding + graphHeight - barHeight;

          return (
            <g key={idx}>
              {/* Glowing animated bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={`url(#barGrad-${idx})`}
                rx={6}
                style={{
                  filter: `drop-shadow(0 4px 8px ${chartColor}30)`,
                }}
              />
              <defs>
                <linearGradient id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} />
                  <stop offset="100%" stopColor={`${chartColor}40`} />
                </linearGradient>
              </defs>

              {/* Value on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                fill={textColor}
                fontSize={14}
                fontWeight={800}
                textAnchor="middle"
              >
                {item.value}
              </text>

              {/* Label at bottom */}
              <text
                x={x + barWidth / 2}
                y={padding + graphHeight + 20}
                fill={textColor}
                fontSize={13}
                fontWeight={600}
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          );
        })}

        {/* Axis line */}
        <line
          x1={padding}
          y1={padding + graphHeight}
          x2={width - padding}
          y2={padding + graphHeight}
          stroke={chartColor}
          strokeWidth={2}
        />
      </svg>
    );
  }

  // 2. LINE CHART
  if (type === 'line') {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    const stepX = graphWidth / (data.length - 1 || 1);

    const points = data.map((d, idx) => ({
      x: padding + idx * stepX,
      y: padding + graphHeight - (d.value / maxVal) * graphHeight
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + graphHeight} L ${points[0].x} ${padding + graphHeight} Z`;

    return (
      <svg width={width} height={height} style={{ overflow: 'visible', fontFamily }}>
        {/* Grids */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + graphHeight * (1 - ratio);
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={theme.border}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding - 10}
                y={y + 4}
                fill={secondaryColor}
                fontSize={12}
                textAnchor="end"
              >
                {Math.round(maxVal * ratio)}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
            <stop offset="100%" stopColor={chartColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Filled Area */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line Path */}
        <path
          d={linePath}
          fill="none"
          stroke={chartColor}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: `drop-shadow(0 4px 8px ${chartColor}40)`,
          }}
        />

        {/* Dots, Values and Labels */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r={6}
              fill={theme.background}
              stroke={accentColor}
              strokeWidth={3}
            />
            <text
              x={p.x}
              y={p.y - 12}
              fill={textColor}
              fontSize={14}
              fontWeight={800}
              textAnchor="middle"
            >
              {data[idx].value}
            </text>
            <text
              x={p.x}
              y={padding + graphHeight + 20}
              fill={textColor}
              fontSize={13}
              fontWeight={600}
              textAnchor="middle"
            >
              {data[idx].label}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  // 3. PIE / DONUT CHART
  if (type === 'pie' || type === 'donut') {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const radius = 90;
    const innerRadius = type === 'donut' ? 55 : 0;
    const centerX = width / 2 - 80;
    const centerY = height / 2;

    let accumulatedAngle = 0;

    const colors = [
      chartColor,
      accentColor,
      secondaryColor,
      '#EF4444',
      '#10B981',
      '#3B82F6',
      '#F59E0B'
    ];

    const wedges = data.map((item, idx) => {
      const percentage = total > 0 ? item.value / total : 0;
      const angle = percentage * 360;

      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle += angle;

      const rad = Math.PI / 180;
      const x1 = centerX + radius * Math.cos(startAngle * rad);
      const y1 = centerY + radius * Math.sin(startAngle * rad);
      const x2 = centerX + radius * Math.cos(endAngle * rad);
      const y2 = centerY + radius * Math.sin(endAngle * rad);

      const ix1 = centerX + innerRadius * Math.cos(startAngle * rad);
      const iy1 = centerY + innerRadius * Math.sin(startAngle * rad);
      const ix2 = centerX + innerRadius * Math.cos(endAngle * rad);
      const iy2 = centerY + innerRadius * Math.sin(endAngle * rad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      let d = '';
      if (innerRadius > 0) {
        d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z`;
      } else {
        d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      }

      const color = colors[idx % colors.length];

      return {
        d,
        color,
        item,
        percentage: Math.round(percentage * 100)
      };
    });

    return (
      <svg width={width} height={height} style={{ overflow: 'visible', fontFamily }}>
        {wedges.map((w, idx) => (
          <path
            key={idx}
            d={w.d}
            fill={w.color}
            stroke={theme.background}
            strokeWidth={2}
            style={{
              filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.15))`,
            }}
          />
        ))}

        {/* Legend */}
        <g transform={`translate(${centerX + radius + 40}, ${centerY - (data.length * 24) / 2})`}>
          {wedges.map((w, idx) => (
            <g key={idx} transform={`translate(0, ${idx * 24})`}>
              <rect width={16} height={16} rx={4} fill={w.color} />
              <text
                x={26}
                y={13}
                fill={textColor}
                fontSize={13}
                fontWeight={600}
              >
                {w.item.label} ({w.percentage}%)
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  }

  return null;
};

// Content Slide Component with Responsive Aspect-Ratio Support and Custom Transitions
const ContentSlide: React.FC<{ slide: SlideData; index: number; totalSlides: number; theme: Theme; fontFamily: string; fontWeight: string; disableAnimations?: boolean }> = ({ slide, index, totalSlides, theme: globalTheme, fontFamily, fontWeight, disableAnimations }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const isPortrait = width < height; // Check aspect ratio

  // ── Per-slide theme override ──────────────────────────────────────────────
  const slideThemeBase = slide.themeName ? (THEMES[slide.themeName] ?? globalTheme) : globalTheme;
  const theme: Theme = {
    ...slideThemeBase,
    ...(slide.theme ?? {}),
    ...(slide.accentColor ? { primary: slide.accentColor, border: `${slide.accentColor}40` } : {}),
  };

  const entrance = disableAnimations
    ? 1
    : spring({ frame, fps, config: { damping: 13, stiffness: 120 } });
  
  const exitFrames = Math.round((slide.transitionDurationInSeconds ?? 0.5) * fps);
  const exitStart = durationInFrames - exitFrames;

  const textTranslateY = interpolate(entrance, [0, 1], [40, 0]);
  const mediaScale = interpolate(entrance, [0, 1], [0.95, 1]);

  const isHeadingOnly = !slide.content && !slide.media;
  const contentFontSize = slide.content ? (slide.content.length > 200 ? 30 : slide.content.length > 100 ? 36 : 42) : 36;

  const renderTextContent = () => {
    if (!slide.heading && !slide.subheading && !slide.content) return null;
    return (
      <div style={{
        flex: 1.2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: slide.textAlign || 'left',
        transform: `translateY(${textTranslateY}px)`,
        paddingRight: isPortrait ? 0 : 20,
        zIndex: 10,
      }}>
        {slide.heading && (
          <h2 style={{
            fontFamily,
            fontSize: slide.headingFontSize || (isPortrait ? 48 : 56),
            fontWeight: (slide.headingFontWeight as any) || 800,
            color: theme.primary,
            margin: '0 0 16px 0',
            lineHeight: 1.1,
            letterSpacing: -1,
            textShadow: slide.textShadow || `0 4px 12px ${theme.primary}25`,
            WebkitTextStroke: slide.textStroke || 'none',
            ...(slide.textAnimation === 'pop-in' ? { opacity: entrance, transform: `scale(${0.8 + entrance * 0.2})` } : {}),
            ...(slide.textAnimation === 'reveal' ? { clipPath: `inset(0 ${(1 - entrance) * 100}% 0 0)` } : {}),
            ...(slide.textAnimation === 'stagger' ? { opacity: entrance, transform: `translateY(${(1 - entrance) * 30}px)` } : {}),
          }}>
            <MarkdownText text={slide.heading} theme={theme} strongColor={theme.accent} emColor={theme.secondary} />
          </h2>
        )}
        {slide.subheading && (
          <h3 style={{
            fontFamily,
            fontSize: slide.subheadingFontSize || (isPortrait ? 28 : 32),
            fontWeight: (slide.subheadingFontWeight as any) || 700,
            color: theme.secondary,
            margin: '-12px 0 24px 0',
            lineHeight: 1.2,
            letterSpacing: -0.5,
            opacity: 0.9,
            textShadow: slide.textShadow || 'none',
            WebkitTextStroke: slide.textStroke || 'none',
            ...(slide.textAnimation === 'pop-in' ? { opacity: entrance, transform: `scale(${0.8 + entrance * 0.2})` } : {}),
            ...(slide.textAnimation === 'reveal' ? { clipPath: `inset(0 ${(1 - entrance) * 100}% 0 0)` } : {}),
            ...(slide.textAnimation === 'stagger' ? { opacity: entrance, transform: `translateY(${(1 - entrance) * 30}px)` } : {}),
          }}>
            <MarkdownText text={slide.subheading} theme={theme} strongColor={theme.primary} emColor={theme.accent} />
          </h3>
        )}
        {slide.lines ? (
          <KaraokeText
            lines={slide.lines}
            currentFrame={frame}
            fps={fps}
            theme={theme}
            fontFamily={fontFamily}
            fontWeight={slide.fontWeight || fontWeight}
            textAlign={slide.textAlign}
            fontSize={slide.fontSize}
          />
        ) : slide.content && (
          <div style={{
            fontFamily,
            fontSize: slide.fontSize || (isPortrait ? contentFontSize * 0.85 : contentFontSize),
            color: theme.text,
            lineHeight: 1.5,
            fontWeight: (slide.fontWeight as any) || (fontWeight as any) || 600,
            opacity: 0.95,
            textShadow: slide.textShadow || 'none',
            WebkitTextStroke: slide.textStroke || 'none',
          }}>
            <MarkdownText text={slide.content} theme={theme} strongColor={theme.secondary} emColor={theme.accent} useParagraphs />
          </div>
        )}
      </div>
    );
  };

  const getSlideMediaType = (filename: string): 'image' | 'video' => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) return 'video';
    return 'image';
  };

  const renderMedia = () => {
    if (slide.chart) {
      return (
        <div style={{
          flex: 1,
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${mediaScale})`,
        }}>
          <SvgChart chart={slide.chart} theme={theme} fontFamily={fontFamily} />
        </div>
      );
    }
    if (!slide.media || !slide.mediaType) return null;
    return (
      <div style={{
        flex: 1,
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${mediaScale})`,
      }}>
        <MediaRenderer 
          path={slide.media} 
          type={slide.mediaType} 
          startFromInSeconds={slide.mediaStartFromInSeconds}
        />
      </div>
    );
  };

  const renderMediaCollage = () => {
    const list = slide.mediaList || (slide.media ? [slide.media] : []);
    if (list.length === 0) return null;
    if (list.length === 1) return renderMedia();

    let gridStyle: React.CSSProperties = {
      display: 'grid',
      gap: '20px',
      width: '100%',
      height: '100%',
      flex: 1,
    };
    
    if (list.length === 2) {
      gridStyle.gridTemplateColumns = '1fr 1fr';
    } else if (list.length === 3) {
      gridStyle.gridTemplateColumns = '1.2fr 1fr';
      gridStyle.gridTemplateRows = '1fr 1fr';
    } else {
      gridStyle.gridTemplateColumns = '1fr 1fr';
      gridStyle.gridTemplateRows = '1fr 1fr';
    }

    return (
      <div style={gridStyle}>
        {list.map((m, idx) => {
          const gridArea = (list.length === 3 && idx === 0) ? { gridRow: 'span 2' } : {};
          const isVideo = getSlideMediaType(m) === 'video';
          return (
            <div 
              key={idx} 
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                border: `2px solid ${theme.border}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                ...gridArea
              }}
            >
              <MediaRenderer 
                path={m} 
                type={isVideo ? 'video' : 'image'} 
                startFromInSeconds={0}
                style={{ width: '100%', height: '100%', borderRadius: 0, border: 'none' }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const getLayout = () => {
    // Responsive stacked view for portrait resolutions (like Shorts/Reels)
    if (isPortrait) {
      if (slide.layout === 'media-only') return <div style={{ height: '100%', width: '100%' }}>{renderMedia()}</div>;
      if (slide.layout === 'grid-collage') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30, height: '100%', width: '100%', alignItems: 'stretch' }}>
            {renderMediaCollage()}
            {renderTextContent()}
          </div>
        );
      }
      if (slide.layout === 'chart-only') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30, height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {renderTextContent()}
            {renderMedia()}
          </div>
        );
      }
      if (slide.layout === 'text-only') return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', textAlign: 'center', padding: 40 }}>{renderTextContent()}</div>;
      if (slide.layout === 'full-background-media') {
        return (
          <AbsoluteFill style={{ padding: 0 }}>
            {slide.media && slide.mediaType && <MediaRenderer path={slide.media} type={slide.mediaType} startFromInSeconds={slide.mediaStartFromInSeconds} style={{ borderRadius: 0, border: 'none' }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,13,20,0.95) 0%, rgba(10,13,20,0.6) 50%, rgba(10,13,20,0.85) 100%)', opacity: slide.overlayOpacity ?? 1, zIndex: 3 }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 4, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: theme.cardBg, backdropFilter: 'blur(30px)', padding: 40, borderRadius: 30, border: `2px solid ${theme.primary}`, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: '90%', textAlign: 'center' }}>
                {renderTextContent()}
              </div>
            </div>
          </AbsoluteFill>
        );
      }
      // split vertically for portrait
      const stackDirection = slide.layout === 'split-media-left' ? 'column' : 'column-reverse';
      return (
        <div style={{ display: 'flex', flexDirection: stackDirection, gap: 40, height: '100%', width: '100%', alignItems: 'stretch' }}>
          {renderMedia()}
          {renderTextContent()}
        </div>
      );
    }

    // Standard Landscape layout
    switch (slide.layout) {
      case 'grid-collage':
        return (
          <div style={{ display: 'flex', gap: 60, height: '100%', width: '100%', alignItems: 'stretch' }}>
            {renderTextContent()}
            {renderMediaCollage()}
          </div>
        );
      case 'split-media-left':
        return (
          <div style={{ display: 'flex', gap: 60, height: '100%', width: '100%', alignItems: 'stretch' }}>
            {renderMedia()}
            {renderTextContent()}
          </div>
        );
      case 'full-background-media':
        return (
          <AbsoluteFill style={{ padding: 0 }}>
            {slide.media && slide.mediaType && (
              <MediaRenderer 
                path={slide.media} 
                type={slide.mediaType} 
                startFromInSeconds={slide.mediaStartFromInSeconds}
                style={{ borderRadius: 0, border: 'none' }} 
              />
            )}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(10,13,20,0.95) 0%, rgba(10,13,20,0.6) 50%, rgba(10,13,20,0.85) 100%)',
              opacity: slide.overlayOpacity ?? 1,
              zIndex: 3
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 4,
              padding: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                background: theme.cardBg,
                backdropFilter: 'blur(30px)',
                padding: '60px 80px',
                borderRadius: 40,
                border: `4px solid ${theme.primary}`,
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                maxWidth: '85%',
                textAlign: 'center'
              }}>
                {renderTextContent()}
              </div>
            </div>
          </AbsoluteFill>
        );
      case 'media-only':
        return (
          <div style={{ height: '100%', width: '100%' }}>
            {renderMedia()}
          </div>
        );
      case 'countdown':
        return (
          <CountdownLayout
            from={slide.countdownFrom ?? 5}
            heading={slide.heading}
            theme={theme}
            fontFamily={fontFamily}
            disableAnimations={disableAnimations}
          />
        );
      case 'code-block':
        return slide.codeBlock ? (
          <CodeBlockLayout
            heading={slide.heading}
            subheading={slide.subheading}
            code={slide.codeBlock.code}
            language={slide.codeBlock.language}
            showLineNumbers={slide.codeBlock.showLineNumbers ?? true}
            theme={theme}
            fontFamily={fontFamily}
            entrance={entranceProgress}
          />
        ) : null;
      case 'chart-only':
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            padding: '40px 100px',
            gap: 20
          }}>
            {renderTextContent()}
            {renderMedia()}
          </div>
        );
      case 'text-only':
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            textAlign: 'center',
            padding: '40px 100px'
          }}>
            {renderTextContent()}
          </div>
        );
      case 'split-media-right':
      default:
        return (
          <div style={{ display: 'flex', gap: 60, height: '100%', width: '100%', alignItems: 'stretch' }}>
            {renderTextContent()}
            {renderMedia()}
          </div>
        );
    }
  };

  const entranceProgress = disableAnimations
    ? 1
    : spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  
  const exitProgress = disableAnimations
    ? 0
    : spring({ frame: Math.max(0, frame - exitStart), fps, config: { damping: 14, stiffness: 100 } });

  let combinedTranslateX = 0;
  let combinedTranslateY = 0;
  let combinedScale = 1;
  let combinedOpacity = 1;
  let combinedBlur = 0;

  const transition = slide.transition || 'fade';
  
  if (disableAnimations) {
    combinedTranslateX = 0;
    combinedTranslateY = 0;
    combinedScale = 1;
    combinedOpacity = 1;
  } else {
    // Basic Opacity calculations
    const entranceOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const exitOpacity = frame >= exitStart
      ? interpolate(frame, [exitStart, durationInFrames - 1], [1, 0], { extrapolateLeft: 'clamp' })
      : 1;
    combinedOpacity = entranceOpacity * exitOpacity;

    if (transition === 'slide-left') {
      const entranceTranslateX = interpolate(entranceProgress, [0, 1], [400, 0]);
      const exitTranslateX = interpolate(exitProgress, [0, 1], [0, -400]);
      combinedTranslateX = entranceTranslateX + exitTranslateX;
      combinedScale = interpolate(entranceProgress, [0, 1], [0.99, 1]) * interpolate(exitProgress, [0, 1], [1, 0.99]);
    } else if (transition === 'slide-right') {
      const entranceTranslateX = interpolate(entranceProgress, [0, 1], [-400, 0]);
      const exitTranslateX = interpolate(exitProgress, [0, 1], [0, 400]);
      combinedTranslateX = entranceTranslateX + exitTranslateX;
      combinedScale = interpolate(entranceProgress, [0, 1], [0.99, 1]) * interpolate(exitProgress, [0, 1], [1, 0.99]);
    } else if (transition === 'slide-up') {
      const entranceTranslateY = interpolate(entranceProgress, [0, 1], [400, 0]);
      const exitTranslateY = interpolate(exitProgress, [0, 1], [0, -400]);
      combinedTranslateY = entranceTranslateY + exitTranslateY;
      combinedScale = interpolate(entranceProgress, [0, 1], [0.99, 1]) * interpolate(exitProgress, [0, 1], [1, 0.99]);
    } else if (transition === 'slide-down') {
      const entranceTranslateY = interpolate(entranceProgress, [0, 1], [-400, 0]);
      const exitTranslateY = interpolate(exitProgress, [0, 1], [0, 400]);
      combinedTranslateY = entranceTranslateY + exitTranslateY;
      combinedScale = interpolate(entranceProgress, [0, 1], [0.99, 1]) * interpolate(exitProgress, [0, 1], [1, 0.99]);
    } else if (transition === 'zoom-reveal') {
      const entranceScale = interpolate(entranceProgress, [0, 1], [0.80, 1]);
      const exitScale = interpolate(exitProgress, [0, 1], [1, 1.20]);
      combinedScale = entranceScale * exitScale;
    } else if (transition === 'glitch-blur') {
      const entranceScale = interpolate(entranceProgress, [0, 1], [0.95, 1]);
      const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95]);
      combinedScale = entranceScale * exitScale;
      combinedBlur = frame < 12 
        ? interpolate(frame, [0, 12], [25, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) 
        : frame >= exitStart 
          ? interpolate(frame, [exitStart, durationInFrames - 1], [0, 25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          : 0;
    } else if (transition === 'wipe-right') {
      // Clip-path wipe: slide reveals from left edge, wipes out to right
      const entranceClip = interpolate(entranceProgress, [0, 1], [0, 100]);
      const exitClip = interpolate(exitProgress, [0, 1], [100, 0]);
      // We store wipe values in unused vars, return early with special JSX below
      combinedOpacity = 1;
      // handled via early return after this block
    } else if (transition === 'morph-scale') {
      // Zooms in from oversized, exits by shrinking to dot
      const entranceScale = interpolate(entranceProgress, [0, 1], [1.18, 1]);
      const exitScale = interpolate(exitProgress, [0, 1], [1, 0.82]);
      combinedScale = entranceScale * exitScale;
    } else if (transition === 'cube-rotate') {
      // 3D Y-axis cube rotation — handled via early return after this block
      combinedOpacity = 1;
    } else {
      // Default 'fade' / spring transition
      const entranceTranslateX = interpolate(entranceProgress, [0, 1], [40, 0]);
      const entranceScale = interpolate(entranceProgress, [0, 1], [0.98, 1]);
      const exitTranslateX = interpolate(exitProgress, [0, 1], [0, -40]);
      const exitScale = interpolate(exitProgress, [0, 1], [1, 0.98]);
      
      combinedTranslateX = entranceTranslateX + exitTranslateX;
      combinedScale = entranceScale * exitScale;
    }
  }

  // ── Early-return transitions that need custom JSX wrappers ──
  if (!disableAnimations && transition === 'wipe-right') {
    const entranceClip = interpolate(entranceProgress, [0, 1], [0, 100]);
    const exitClip = interpolate(exitProgress, [0, 1], [100, 0]);
    const clipVal = Math.min(entranceClip, exitClip);
    return (
      <AbsoluteFill style={{ padding: isPortrait ? 40 : 75, clipPath: `inset(0 ${100 - clipVal}% 0 0)` }}>
        <BackgroundEffects theme={theme} />
        {slide.voiceover && <Audio src={staticFile(slide.voiceover)} volume={1.0} />}
        {slide.bgMusic && <Audio src={staticFile(slide.bgMusic)} volume={0.6} loop />}
        {slide.layout !== 'full-background-media' && (
          <div style={{ width: '100%', height: '100%', background: theme.cardBg, backdropFilter: 'blur(35px)', borderRadius: isPortrait ? 36 : 48, border: `6px solid ${theme.primary}`, padding: isPortrait ? '40px 30px' : '60px 75px', boxShadow: '0 25px 50px rgba(0,0,0,0.45)', overflow: 'hidden', position: 'relative' }}>
            {getLayout()}
          </div>
        )}
        {slide.layout === 'full-background-media' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>{getLayout()}</div>
        )}
      </AbsoluteFill>
    );
  }

  if (!disableAnimations && transition === 'cube-rotate') {
    const entranceRot = interpolate(entranceProgress, [0, 1], [-90, 0]);
    const exitRot = interpolate(exitProgress, [0, 1], [0, 90]);
    const rot = entranceRot + exitRot;
    return (
      <AbsoluteFill style={{ padding: isPortrait ? 40 : 75, perspective: 1600 }}>
        <BackgroundEffects theme={theme} />
        {slide.voiceover && <Audio src={staticFile(slide.voiceover)} volume={1.0} />}
        {slide.bgMusic && <Audio src={staticFile(slide.bgMusic)} volume={0.6} loop />}
        {slide.layout !== 'full-background-media' && (
          <div style={{ width: '100%', height: '100%', background: theme.cardBg, backdropFilter: 'blur(35px)', borderRadius: isPortrait ? 36 : 48, border: `6px solid ${theme.primary}`, padding: isPortrait ? '40px 30px' : '60px 75px', boxShadow: '0 25px 50px rgba(0,0,0,0.45)', overflow: 'hidden', position: 'relative', transform: `rotateY(${rot}deg)`, opacity: combinedOpacity }}>
            {getLayout()}
          </div>
        )}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ padding: isPortrait ? 40 : 75 }}>
      <BackgroundEffects theme={theme} />
      
      {slide.voiceover && (
        <Audio src={staticFile(slide.voiceover)} volume={1.0} />
      )}

      {/* Per-slide background music override */}
      {slide.bgMusic && (
        <Audio src={staticFile(slide.bgMusic)} volume={0.6} loop />
      )}

      {/* Slide Glass Container */}
      {slide.layout !== 'full-background-media' && (
        <div style={{
          width: '100%',
          height: '100%',
          background: theme.cardBg,
          backdropFilter: combinedBlur > 0 ? `blur(${35 + combinedBlur}px)` : 'blur(35px)',
          borderRadius: isPortrait ? 36 : 48,
          border: `6px solid ${theme.primary}`,
          padding: isPortrait ? '40px 30px' : '60px 75px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          position: 'relative',
          transform: `translate(${combinedTranslateX}px, ${combinedTranslateY}px) scale(${combinedScale})`,
          opacity: combinedOpacity,
          filter: combinedBlur > 0 ? `blur(${combinedBlur}px)` : undefined,
        }}>
          {slide.bgVideo && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.15, filter: 'blur(10px) saturate(0.5)' }}>
              <MediaRenderer path={slide.bgVideo} type="video" />
            </div>
          )}
          {slide.accentIcon && (
            <div style={{ position: 'absolute', right: '-10%', bottom: '-10%', fontSize: '400px', opacity: 0.05, zIndex: 0, transform: 'rotate(-15deg)', userSelect: 'none' }}>
              {slide.accentIcon}
            </div>
          )}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
            {getLayout()}
          </div>
        </div>
      )}
      
      {slide.layout === 'full-background-media' && (
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transform: `translate(${combinedTranslateX}px, ${combinedTranslateY}px) scale(${combinedScale})`,
          opacity: combinedOpacity,
          filter: combinedBlur > 0 ? `blur(${combinedBlur}px)` : undefined,
        }}>
          {getLayout()}
        </div>
      )}



      {/* Subtitle Burn-In */}
      {slide.subtitleBurnIn && slide.lines && (
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          width: '100%',
          textAlign: 'center',
          zIndex: 100,
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0,0,0,0.8)',
            color: '#FFF',
            padding: '12px 24px',
            borderRadius: 8,
            fontFamily,
            fontSize: isPortrait ? 24 : 32,
            fontWeight: 700,
            border: `2px solid ${theme.primary}50`
          }}>
            {(() => {
              const currentTime = frame / fps;
              const activeLine = slide.lines?.find((line) => 
                line[0] && currentTime >= line[0].relStart && currentTime <= line[line.length - 1].relEnd
              );
              return activeLine ? activeLine.map(w => w.text).join(' ') : '';
            })()}
          </div>
        </div>
      )}

      {/* Ticker / Marquee */}
      {slide.ticker && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 40,
          background: theme.primary,
          color: theme.cardBg,
          display: 'flex',
          alignItems: 'center',
          fontFamily,
          fontSize: 20,
          fontWeight: 800,
          zIndex: 101,
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          <div style={{
            transform: `translateX(${100 - (frame % 300) * 0.5}%)`
          }}>
            {slide.ticker.repeat(10)}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// End Page Component with Style Variations
const EndSlide: React.FC<{ endPage: VideoProps['endPage']; theme: Theme; fontFamily: string; disableAnimations?: boolean }> = ({ endPage, theme, fontFamily, disableAnimations }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const style = endPage.style || 'standard';
  const isPortrait = width < height;

  const entrance = disableAnimations
    ? 1
    : spring({ frame, fps, config: { damping: 12, stiffness: 100 } });

  const bgStyle: React.CSSProperties = endPage.theme.background.includes('gradient')
    ? { backgroundImage: endPage.theme.background }
    : { backgroundColor: endPage.theme.background };

  // 1. MINIMALIST STYLE
  if (style === 'minimalist') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", paddingLeft: isPortrait ? 60 : 120, opacity: entrance }}>
        <BackgroundEffects theme={theme} />
        <div style={{
          maxWidth: "80%",
          textAlign: 'left',
          fontFamily,
          borderLeft: `8px solid ${theme.secondary}`,
          paddingLeft: isPortrait ? 25 : 40,
        }}>
          <h1 style={{ fontSize: isPortrait ? 50 : 76, fontWeight: 900, color: theme.primary, margin: 0, letterSpacing: -1 }}>
            <MarkdownText text={endPage.title} theme={theme} />
          </h1>
          {endPage.subtitle && (
            <p style={{ fontSize: isPortrait ? 20 : 28, fontWeight: 400, color: theme.text, marginTop: 15 }}>
              <MarkdownText text={endPage.subtitle} theme={theme} />
            </p>
          )}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 10, fontSize: isPortrait ? 18 : 22, color: theme.secondary }}>
            {endPage.contact && <div>📞 {endPage.contact}</div>}
            {endPage.website && <div>🌐 {endPage.website}</div>}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // 2. THUMBNAIL STYLE
  if (style === 'thumbnail') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center" }}>
        <BackgroundEffects theme={theme} />
        
        {/* Border Corners */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
          const isTop = pos.includes('top');
          const isLeft = pos.includes('left');
          return (
            <div key={pos} style={{ 
              position: 'absolute', 
              top: isTop ? 40 : 'auto', 
              bottom: isTop ? 'auto' : 40, 
              left: isLeft ? 40 : 'auto', 
              right: isLeft ? 'auto' : 40, 
              width: isPortrait ? 60 : 120, 
              height: isPortrait ? 60 : 120, 
              borderLeft: isLeft ? `8px solid ${theme.primary}` : 'none',
              borderRight: isLeft ? 'none' : `8px solid ${theme.primary}`,
              borderTop: isTop ? `8px solid ${theme.primary}` : 'none',
              borderBottom: isTop ? 'none' : `8px solid ${theme.primary}`,
            }} />
          );
        })}

        <div style={{
          transform: `scale(${entrance})`,
          textAlign: "center",
          fontFamily,
          zIndex: 10,
          padding: isPortrait ? "40px 30px" : "60px 80px",
          background: 'rgba(0,0,0,0.4)',
          borderRadius: isPortrait ? 24 : 40,
          border: `6px solid ${theme.primary}`,
          boxShadow: `${isPortrait ? 10 : 20}px ${isPortrait ? 10 : 20}px 0px rgba(0,0,0,0.5)`,
          maxWidth: "85%",
        }}>
          <h1 style={{ fontSize: isPortrait ? 48 : 80, fontWeight: 900, color: theme.primary, margin: 0, textShadow: `6px 6px 0px ${theme.background}`, textTransform: 'uppercase' }}>
            <MarkdownText text={endPage.title} theme={theme} />
          </h1>
          {endPage.subtitle && (
            <p style={{ fontSize: isPortrait ? 18 : 24, fontWeight: 800, color: theme.secondary, letterSpacing: isPortrait ? 2 : 4, textTransform: 'uppercase', marginTop: 15 }}>
              <MarkdownText text={endPage.subtitle} theme={theme} />
            </p>
          )}
          <div style={{ height: 2, background: theme.border, width: 100, margin: '25px auto' }} />
          <div style={{ fontSize: isPortrait ? 18 : 24, color: theme.text, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {endPage.contact && <div>{endPage.contact}</div>}
            {endPage.website && <div style={{ color: theme.accent, fontWeight: 900 }}>{endPage.website}</div>}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // 3. GLASSMORPHIC STYLE
  if (style === 'glassmorphic') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center" }}>
        <BackgroundEffects theme={theme} />
        
        {/* Pulsing backglow */}
        <div style={{
          position: 'absolute',
          width: isPortrait ? 300 : 500,
          height: isPortrait ? 300 : 500,
          borderRadius: '50%',
          background: theme.primary,
          filter: 'blur(150px)',
          opacity: 0.2,
          zIndex: 5,
        }} />

        <div style={{
          transform: `scale(${entrance})`,
          textAlign: "center",
          fontFamily,
          zIndex: 10,
          padding: isPortrait ? "50px 30px" : "70px 90px",
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: "blur(60px)",
          borderRadius: isPortrait ? 30 : 50,
          border: `2px solid rgba(255,255,255,0.25)`,
          boxShadow: `0 40px 80px rgba(0,0,0,0.45)`,
          maxWidth: "85%",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 25,
        }}>
          <div>
            <h1 style={{ fontSize: isPortrait ? 64 : 76, fontWeight: 900, color: theme.primary, margin: 0 }}>
              <MarkdownText text={endPage.title} theme={theme} />
            </h1>
            {endPage.subtitle && (
              <p style={{ fontSize: isPortrait ? 28 : 22, fontWeight: 700, color: theme.secondary, marginTop: 10 }}>
                <MarkdownText text={endPage.subtitle} theme={theme} />
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, width: '100%' }}>
            {endPage.contact && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: isPortrait ? '12px 20px' : '12px 24px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', fontSize: isPortrait ? 24 : 22, color: theme.text }}>
                {endPage.contact}
              </div>
            )}
            {endPage.website && (
              <div style={{ fontSize: isPortrait ? 24 : 20, color: theme.accent, fontWeight: 900 }}>
                {endPage.website}
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // 4. BOLD-BRUTALISM STYLE
  if (style === 'bold-brutalism') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center" }}>
        <BackgroundEffects theme={theme} />
        <div style={{
          transform: `scale(${entrance}) rotate(1deg)`,
          textAlign: "left",
          fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
          zIndex: 10,
          padding: isPortrait ? "40px 30px" : "60px 80px",
          background: theme.accent,
          color: theme.background,
          border: `${isPortrait ? '6px' : '10px'} solid ${theme.text}`,
          boxShadow: `${isPortrait ? '12px' : '20px'} ${isPortrait ? '12px' : '20px'} 0px ${theme.text}`,
          maxWidth: "85%",
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <h1 style={{
            fontSize: isPortrait ? 50 : 90,
            fontWeight: 900,
            margin: 0,
            lineHeight: 0.9,
            letterSpacing: -1,
            textTransform: 'uppercase',
            color: theme.background,
          }}>
            <MarkdownText text={endPage.title} theme={theme} primaryColor={theme.accent} />
          </h1>
          {endPage.subtitle && (
            <p style={{
              fontSize: isPortrait ? 18 : 28,
              fontWeight: 800,
              color: theme.background,
              margin: 0,
              textTransform: 'uppercase',
            }}>
              <MarkdownText text={endPage.subtitle} theme={theme} primaryColor={theme.accent} />
            </p>
          )}
          <div style={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            fontSize: isPortrait ? 18 : 24,
            fontWeight: 800,
            fontFamily,
            color: theme.background,
            borderTop: `4px solid ${theme.background}`,
            paddingTop: 15,
          }}>
            {endPage.contact && <div>📞 {endPage.contact}</div>}
            {endPage.website && <div style={{ textTransform: 'lowercase' }}>🌐 {endPage.website}</div>}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // 5. CYBERPUNK-NEON STYLE
  if (style === 'cyberpunk-neon') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center" }}>
        <BackgroundEffects theme={theme} />
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(244, 114, 182, 0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(244, 114, 182, 0.08) 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
          opacity: 0.3,
        }} />
        <div style={{
          transform: `scale(${entrance})`,
          textAlign: "center",
          fontFamily: "monospace, Courier, 'Courier New'",
          zIndex: 10,
          padding: isPortrait ? "50px 30px" : "70px 90px",
          background: 'rgba(5, 5, 15, 0.9)',
          borderRadius: 8,
          border: `3px solid ${theme.primary}`,
          boxShadow: `0 0 30px ${theme.primary}, inset 0 0 15px rgba(255,255,255,0.05)`,
          maxWidth: "85%",
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: -5, left: -5, width: 25, height: 25, borderTop: `6px solid ${theme.accent}`, borderLeft: `6px solid ${theme.accent}` }} />
          <div style={{ position: 'absolute', top: -5, right: -5, width: 25, height: 25, borderTop: `6px solid ${theme.accent}`, borderRight: `6px solid ${theme.accent}` }} />
          <div style={{ position: 'absolute', bottom: -5, left: -5, width: 25, height: 25, borderBottom: `6px solid ${theme.accent}`, borderLeft: `6px solid ${theme.accent}` }} />
          <div style={{ position: 'absolute', bottom: -5, right: -5, width: 25, height: 25, borderBottom: `6px solid ${theme.accent}`, borderRight: `6px solid ${theme.accent}` }} />
          
          <h1 style={{
            fontSize: isPortrait ? 44 : 70,
            fontWeight: 900,
            margin: 0,
            lineHeight: 1.1,
            color: theme.text,
            letterSpacing: isPortrait ? -1 : -2,
            textShadow: `0 0 15px ${theme.primary}`,
            textTransform: 'uppercase',
          }}>
            <MarkdownText text={endPage.title} theme={theme} />
          </h1>
          
          {endPage.subtitle && (
            <p style={{
              fontSize: isPortrait ? 14 : 20,
              fontWeight: 400,
              color: theme.secondary,
              marginTop: 20,
              letterSpacing: 2,
            }}>
              // <MarkdownText text={endPage.subtitle} theme={theme} />
            </p>
          )}

          <div style={{ height: 2, background: theme.primary, width: 150, margin: '30px auto', opacity: 0.5 }} />

          <div style={{
            fontSize: isPortrait ? 16 : 20,
            color: theme.accent,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            textShadow: `0 0 8px ${theme.accent}`,
          }}>
            {endPage.contact && <div>&gt; {endPage.contact}</div>}
            {endPage.website && <div>&gt; {endPage.website}</div>}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // 6. EDITORIAL-SERIF STYLE
  if (style === 'editorial-serif') {
    return (
      <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", paddingLeft: isPortrait ? 40 : 160, paddingRight: isPortrait ? 40 : 160 }}>
        <BackgroundEffects theme={theme} />
        <div style={{
          maxWidth: "85%",
          textAlign: 'left',
          fontFamily: "Georgia, 'Times New Roman', Times, serif",
          transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
          opacity: entrance,
        }}>
          <h1 style={{
            fontSize: isPortrait ? 48 : 80,
            fontWeight: 300,
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 1.1,
            color: theme.text,
          }}>
            <MarkdownText text={endPage.title} theme={theme} />
          </h1>
          {endPage.subtitle && (
            <p style={{
              fontFamily,
              fontSize: isPortrait ? 18 : 22,
              fontWeight: 400,
              color: theme.secondary,
              marginTop: 20,
              letterSpacing: 1,
            }}>
              <MarkdownText text={endPage.subtitle} theme={theme} />
            </p>
          )}

          <div style={{ marginTop: 40, borderTop: `1px solid ${theme.primary}50`, paddingTop: 30, display: 'flex', flexDirection: 'column', gap: 15, fontFamily, fontSize: isPortrait ? 18 : 20, color: theme.primary }}>
            {endPage.contact && <div>{endPage.contact}</div>}
            {endPage.website && <div style={{ fontWeight: 800 }}>{endPage.website}</div>}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // 7. SPLIT-REVEAL STYLE
  if (style === 'split-reveal') {
    const leftWidth = isPortrait ? '100%' : '45%';
    const rightWidth = isPortrait ? '100%' : '55%';
    const leftHeight = isPortrait ? '35%' : '100%';
    const rightHeight = isPortrait ? '65%' : '100%';
    const splitDirection = isPortrait ? 'column' : 'row';

    return (
      <AbsoluteFill style={{ ...bgStyle, display: 'flex', flexDirection: splitDirection }}>
        {/* Left Side: Solid Accent Block */}
        <div style={{
          width: leftWidth,
          height: leftHeight,
          background: theme.primary,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
          position: 'relative',
          transform: isPortrait 
            ? `translateY(${interpolate(entrance, [0, 1], [-100, 0])}%)`
            : `translateX(${interpolate(entrance, [0, 1], [-100, 0])}%)`,
          boxShadow: '10px 0 30px rgba(0,0,0,0.3)',
          zIndex: 15,
        }}>
          <div style={{
            fontFamily,
            fontSize: isPortrait ? 30 : 48,
            fontWeight: 900,
            color: theme.background,
            textTransform: 'uppercase',
            textAlign: 'center',
            letterSpacing: 4,
            lineHeight: 1,
          }}>
            THANK YOU
          </div>
        </div>

        {/* Right Side: End Page Details */}
        <div style={{
          width: rightWidth,
          height: rightHeight,
          background: theme.background,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: isPortrait ? 30 : 80,
          transform: isPortrait
            ? `translateY(${interpolate(entrance, [0, 1], [100, 0])}%)`
            : `translateX(${interpolate(entrance, [0, 1], [100, 0])}%)`,
          zIndex: 10,
        }}>
          <BackgroundEffects theme={theme} />
          <div style={{ zIndex: 12 }}>
            <h1 style={{
              fontFamily,
              fontSize: isPortrait ? 44 : 64,
              fontWeight: 900,
              color: theme.text,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: -2,
            }}>
              <MarkdownText text={endPage.title} theme={theme} />
            </h1>
            {endPage.subtitle && (
              <p style={{
                fontFamily,
                fontSize: isPortrait ? 18 : 20,
                fontWeight: 600,
                color: theme.secondary,
                marginTop: 15,
              }}>
                <MarkdownText text={endPage.subtitle} theme={theme} />
              </p>
            )}
            <div style={{
              marginTop: 35,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontFamily,
              fontSize: isPortrait ? 16 : 18,
              color: theme.primary,
            }}>
              {endPage.contact && <div>📞 {endPage.contact}</div>}
              {endPage.website && <div>🌐 {endPage.website}</div>}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // 4. STANDARD STYLE (Fallback)
  return (
    <AbsoluteFill style={{ ...bgStyle, justifyContent: "center", alignItems: "center" }}>
      <BackgroundEffects theme={theme} />
      <div style={{
        transform: `scale(${interpolate(entrance, [0, 1], [0.85, 1])})`,
        opacity: entrance,
        textAlign: "center",
        fontFamily,
        zIndex: 10,
        padding: "70px 90px",
        background: theme.cardBg,
        backdropFilter: "blur(40px)",
        borderRadius: 50,
        border: `6px solid ${theme.primary}`,
        boxShadow: `0 30px 60px rgba(0, 0, 0, 0.45)`,
        maxWidth: "80%",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 30,
      }}>
        <div>
          <h1 style={{ 
            fontSize: 76, 
            fontWeight: 900, 
            margin: 0, 
            lineHeight: 1.1, 
            color: theme.primary,
            letterSpacing: -2,
            textShadow: `6px 6px 0px ${theme.background}`,
          }}>
            <MarkdownText text={endPage.title} theme={theme} />
          </h1>
          {endPage.subtitle && (
            <p style={{
              fontSize: 24,
              fontWeight: 800,
              color: endPage.theme.subtitleColor || theme.secondary,
              textTransform: 'uppercase',
              letterSpacing: 3,
              marginTop: 15,
            }}>
              <MarkdownText text={endPage.subtitle} theme={theme} />
            </p>
          )}
        </div>

        <div style={{ height: 2, background: theme.border, width: 150, opacity: 0.5 }} />

        {endPage.contact && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '14px 28px',
            borderRadius: 20,
            border: `2px solid ${theme.primary}`,
            fontSize: 26,
            fontWeight: 700,
            color: theme.text,
          }}>
            {endPage.contact}
          </div>
        )}

        {endPage.website && (
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            color: theme.accent,
            letterSpacing: 1,
            textTransform: 'lowercase',
          }}>
            {endPage.website}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Main Video Assembler
export const Video: React.FC<VideoProps> = (config) => {
  const { video, audio, branding, titlePage, slides, endPage } = config;
  const { fps } = useVideoConfig();
  const currentFrame = useCurrentFrame();
  const totalDuration = useVideoConfig().durationInFrames;

  // Resolve Theme: use specified themeName from config, fallback to royal-indigo
  const activeThemeName = video.themeName || "royal-indigo";
  const defaultTheme = THEMES[activeThemeName] || THEMES["royal-indigo"];
  
  // Merge resolved theme with custom theme overrides from config
  const theme = {
    ...defaultTheme,
    ...video.theme
  } as Theme;

  // Resolve Custom Typography
  const resolvedFontFamily = video.fontFamily && FONTS[video.fontFamily.toLowerCase()] 
    ? FONTS[video.fontFamily.toLowerCase()] 
    : fontFamily;
  
  const resolvedFontWeight = video.fontWeight || "600";

  // Background Audio Fade-in / Fade-out interpolation
  const fadeInFrames = (audio.fadeInInSeconds ?? 2) * fps;
  const fadeOutFrames = (audio.fadeOutInSeconds ?? 2) * fps;
  
  // Precompute ranges
  const duckingRanges = React.useMemo(() => slides
    .map(slide => {
      if (!slide.voiceover) return null;
      const startFrame = Math.round((slide.startTime ?? 0) * fps);
      const endFrame = startFrame + Math.round(slide.durationInSeconds * fps);
      return { start: startFrame, end: endFrame };
    })
    .filter((r): r is { start: number; end: number } => r !== null), [slides, fps]);

  const slideRanges = React.useMemo(() => slides.map(slide => {
    const start = Math.round((slide.startTime ?? 0) * fps);
    const end = start + Math.round(slide.durationInSeconds * fps);
    return { start, end };
  }), [slides, fps]);

  const baseVolume = audio.volume ?? 0.1;
  const duckedVolume = baseVolume * 0.15; // Duck down to 15% volume
  const duckFadeFrames = 15; // Smooth 0.5s transition for ducking

  let currentDuckedVolume = baseVolume;
  const activeDuckedRange = duckingRanges.find(
    range => currentFrame >= range.start - duckFadeFrames && currentFrame <= range.end + duckFadeFrames
  );

  if (activeDuckedRange) {
    if (currentFrame < activeDuckedRange.start) {
      // Ducking fade-down
      currentDuckedVolume = interpolate(
        currentFrame,
        [activeDuckedRange.start - duckFadeFrames, activeDuckedRange.start],
        [baseVolume, duckedVolume],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
    } else if (currentFrame > activeDuckedRange.end) {
      // Ducking fade-up
      currentDuckedVolume = interpolate(
        currentFrame,
        [activeDuckedRange.end, activeDuckedRange.end + duckFadeFrames],
        [duckedVolume, baseVolume],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
    } else {
      currentDuckedVolume = duckedVolume;
    }
  }

  let musicVolume = baseVolume;

  if (currentFrame < fadeInFrames && fadeInFrames > 0) {
    // Fade in at start
    musicVolume = interpolate(
      currentFrame,
      [0, fadeInFrames],
      [0, currentDuckedVolume],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else if (currentFrame >= totalDuration - fadeOutFrames && fadeOutFrames > 0) {
    // Fade out at end
    musicVolume = interpolate(
      currentFrame,
      [totalDuration - fadeOutFrames, totalDuration - 5],
      [currentDuckedVolume, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else {
    musicVolume = currentDuckedVolume;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {/* Background Audio */}
      {audio.musicPath && (
        <Audio 
          src={staticFile(audio.musicPath)} 
          volume={musicVolume} 
          loop={audio.loop} 
        />
      )}

      {/* Global Logo/Branding Overlays */}
      <BrandingOverlay
        branding={branding}
        theme={theme}
        currentFrame={currentFrame}
        totalDuration={totalDuration}
        fps={fps}
        titleShow={titlePage.show}
        titleSecs={titlePage.durationInSeconds}
        endShow={endPage.show}
        endSecs={endPage.durationInSeconds}
      />

      {/* Screen Frame Border */}
      {video.border?.show && (
        <ScreenBorder
          show={video.border.show}
          color={video.border.color}
          width={video.border.width}
          radius={video.border.radius}
          glow={video.border.glow}
          theme={theme}
        />
      )}

      {/* Watermark Image Overlay */}
      {branding.watermarkImage && (
        <WatermarkOverlay
          path={branding.watermarkImage}
          opacity={branding.watermarkOpacity ?? 0.12}
          size={branding.watermarkSize ?? 200}
          position={branding.watermarkPosition ?? 'bottom-right'}
        />
      )}

      {/* Dynamic Progress Bar Overlay */}
      {video.progressBar?.show && (
        <ProgressBar
          show={video.progressBar.show}
          type={video.progressBar.type}
          position={video.progressBar.position || 'bottom'}
          color={video.progressBar.color}
          height={video.progressBar.height}
          thickness={video.progressBar.thickness}
          glow={video.progressBar.glow}
          theme={theme}
          currentFrame={currentFrame}
          totalDuration={totalDuration}
        />
      )}

      {/* Slide Counter Overlay — shown only during content slides */}
      {video.slideCounter?.show && (
        (() => {
          // Determine which slide we're on
          const titleDur = titlePage.show ? Math.round(titlePage.durationInSeconds * fps) : 0;
          const endDur = endPage.show ? Math.round(endPage.durationInSeconds * fps) : 0;
          const inSlides = currentFrame >= titleDur && currentFrame < totalDuration - endDur;
          if (!inSlides) return null;
          // Find current slide index
          let currentSlideIndex = 0;
          for (let i = 0; i < slideRanges.length; i++) {
            if (currentFrame >= slideRanges[i].start && currentFrame < slideRanges[i].end) {
              currentSlideIndex = i;
              break;
            }
          }
          return (
            <SlideCounter
              current={currentSlideIndex + 1}
              total={slides.length}
              style={video.slideCounter.style ?? 'pill'}
              position={video.slideCounter.position ?? 'bottom-right'}
              color={video.slideCounter.color}
              theme={theme}
            />
          );
        })()
      )}

      {/* Dynamic Slide Sequencing using Absolute Timeline Positioning */}
      {titlePage.show && (
        <Sequence 
          from={0} 
          durationInFrames={Math.round(titlePage.durationInSeconds * fps)}
        >
          <div style={{ width: '100%', height: '100%', display: 'contents' }} className="title-slide-container">
            {titlePage.textAlign || titlePage.fontWeight || titlePage.headingFontWeight || titlePage.subheadingFontWeight || titlePage.fontSize || titlePage.headingFontSize || titlePage.subheadingFontSize || titlePage.textShadow || titlePage.textStroke ? (
              <style dangerouslySetInnerHTML={{ __html: `
                .title-slide-container h1, .title-slide-container h2 {
                  ${titlePage.headingFontWeight ? `font-weight: ${titlePage.headingFontWeight} !important;` : ''}
                  ${titlePage.headingFontSize ? `font-size: ${titlePage.headingFontSize}px !important;` : ''}
                  ${titlePage.textShadow ? `text-shadow: ${titlePage.textShadow} !important;` : ''}
                  ${titlePage.textStroke ? `-webkit-text-stroke: ${titlePage.textStroke} !important;` : ''}
                }
                .title-slide-container h3, .title-slide-container p, .title-slide-container span, .title-slide-container a, .title-slide-container div {
                  ${titlePage.subheadingFontWeight ? `font-weight: ${titlePage.subheadingFontWeight} !important;` : titlePage.fontWeight ? `font-weight: ${titlePage.fontWeight} !important;` : ''}
                  ${titlePage.subheadingFontSize ? `font-size: ${titlePage.subheadingFontSize}px !important;` : titlePage.fontSize ? `font-size: ${titlePage.fontSize}px !important;` : ''}
                  ${titlePage.textShadow ? `text-shadow: ${titlePage.textShadow} !important;` : ''}
                  ${titlePage.textStroke ? `-webkit-text-stroke: ${titlePage.textStroke} !important;` : ''}
                }
                .title-slide-container div, .title-slide-container p, .title-slide-container h1, .title-slide-container h2, .title-slide-container h3, .title-slide-container span, .title-slide-container a {
                  ${titlePage.textAlign ? `text-align: ${titlePage.textAlign} !important;` : ''}
                }
              `}} />
            ) : null}
            <TitleSlide titlePage={titlePage} theme={theme} fontFamily={resolvedFontFamily} disableAnimations={video.disableAnimations} />
          </div>
        </Sequence>
      )}
      
      {slides.map((slide, index) => (
        <Sequence 
          key={slide.id} 
          from={Math.round((slide.startTime ?? 0) * fps)} 
          durationInFrames={Math.round(slide.durationInSeconds * fps)}
        >
          <ContentSlide slide={slide} index={index} totalSlides={slides.length} theme={theme} fontFamily={resolvedFontFamily} fontWeight={resolvedFontWeight} disableAnimations={video.disableAnimations} />
        </Sequence>
      ))}

      {endPage.show && (
        <Sequence 
          from={Math.round((endPage.startTime ?? 186.0) * fps)} 
          durationInFrames={Math.round(endPage.durationInSeconds * fps)}
        >
          <div style={{ width: '100%', height: '100%', display: 'contents' }} className="end-slide-container">
            {endPage.textAlign || endPage.fontWeight || endPage.headingFontWeight || endPage.subheadingFontWeight || endPage.fontSize || endPage.headingFontSize || endPage.subheadingFontSize || endPage.textShadow || endPage.textStroke ? (
              <style dangerouslySetInnerHTML={{ __html: `
                .end-slide-container h1, .end-slide-container h2 {
                  ${endPage.headingFontWeight ? `font-weight: ${endPage.headingFontWeight} !important;` : ''}
                  ${endPage.headingFontSize ? `font-size: ${endPage.headingFontSize}px !important;` : ''}
                  ${endPage.textShadow ? `text-shadow: ${endPage.textShadow} !important;` : ''}
                  ${endPage.textStroke ? `-webkit-text-stroke: ${endPage.textStroke} !important;` : ''}
                }
                .end-slide-container h3, .end-slide-container p, .end-slide-container span, .end-slide-container a, .end-slide-container div {
                  ${endPage.subheadingFontWeight ? `font-weight: ${endPage.subheadingFontWeight} !important;` : endPage.fontWeight ? `font-weight: ${endPage.fontWeight} !important;` : ''}
                  ${endPage.subheadingFontSize ? `font-size: ${endPage.subheadingFontSize}px !important;` : endPage.fontSize ? `font-size: ${endPage.fontSize}px !important;` : ''}
                  ${endPage.textShadow ? `text-shadow: ${endPage.textShadow} !important;` : ''}
                  ${endPage.textStroke ? `-webkit-text-stroke: ${endPage.textStroke} !important;` : ''}
                }
                .end-slide-container div, .end-slide-container p, .end-slide-container h1, .end-slide-container h2, .end-slide-container h3, .end-slide-container span, .end-slide-container a {
                  ${endPage.textAlign ? `text-align: ${endPage.textAlign} !important;` : ''}
                }
              `}} />
            ) : null}
            <EndSlide endPage={endPage} theme={theme} fontFamily={resolvedFontFamily} disableAnimations={video.disableAnimations} />
          </div>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
