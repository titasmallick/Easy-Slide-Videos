import React from "react";
import {
  AbsoluteFill,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import * as Icons from "lucide-react";
import ReactMarkdown from "react-markdown";

const { fontFamily } = loadFont();

export interface Props {
  id: string;
  title: string;
  heading: string;
  content: string;
  type: "title" | "content" | "cta" | "hook";
  index?: number;
  total?: number;
  footerText?: string;
}

const THEMES = [
  { background: "#1A150E", cardBg: "rgba(30, 25, 20, 0.95)", primary: "#FDE047", secondary: "#FB923C", accent: "#6EE7B7", text: "#FFFAF0", border: "#FDE047" },
  { background: "#062016", cardBg: "rgba(10, 30, 25, 0.95)", primary: "#34D399", secondary: "#A7F3D0", accent: "#FDE047", text: "#ECFDF5", border: "#34D399" },
  { background: "#1E0E30", cardBg: "rgba(30, 15, 50, 0.95)", primary: "#A78BFA", secondary: "#DDD6FE", accent: "#FB923C", text: "#F5F3FF", border: "#A78BFA" },
  { background: "#2D0A0A", cardBg: "rgba(50, 15, 15, 0.95)", primary: "#F87171", secondary: "#FCA5A5", accent: "#6EE7B7", text: "#FEF2F2", border: "#F87171" },
  { background: "#081E26", cardBg: "rgba(10, 35, 45, 0.95)", primary: "#22D3EE", secondary: "#7DD3FC", accent: "#F472B6", text: "#ECFEFF", border: "#22D3EE" },
  { background: "#2E0821", cardBg: "rgba(50, 10, 35, 0.95)", primary: "#E879F9", secondary: "#F5D0FE", accent: "#FDE047", text: "#FDF4FF", border: "#E879F9" },
  { background: "#0E1B2D", cardBg: "rgba(20, 35, 60, 0.95)", primary: "#60A5FA", secondary: "#93C5FD", accent: "#FB923C", text: "#EFF6FF", border: "#60A5FA" },
  { background: "#2D1509", cardBg: "rgba(55, 25, 10, 0.95)", primary: "#FB923C", secondary: "#FDBA74", accent: "#22D3EE", text: "#FFF7ED", border: "#FB923C" },
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

export const InstagramPostComposition: React.FC<Props> = ({ id, title, heading, content, type, index, total, footerText }) => {
  const theme = getThemeForId(id, title);
  const { width, height } = useVideoConfig();

  // ULTRA-SAFE DYNAMIC FONT SCALING
  const getFontSize = (text: string, isPoppy: boolean) => {
    const charCount = text.length;
    if (isPoppy) {
        if (charCount < 15) return 120;
        if (charCount < 30) return 90;
        if (charCount < 60) return 70;
        if (charCount < 100) return 55;
        return 45;
    }
    // Content Scaling
    if (charCount < 100) return 48;
    if (charCount < 250) return 38;
    if (charCount < 400) return 32;
    if (charCount < 600) return 26;
    if (charCount < 850) return 22;
    return 18;
  };

  const isPoppy = type === "title" || type === "hook" || type === "cta";
  const fontSize = getFontSize(content, isPoppy);

  // Constraints
  const TOP_SAFE = 160;
  const BOTTOM_SAFE = 220; // Clear footer branding
  const SIDE_SAFE = 120;

  const currentIcon = ["Dna", "Zap", "Brain", "Microscope", "Activity", "Heart", "Leaf"][(index || 0) % 7];

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, overflow: "hidden", fontFamily }}>
      {/* 1. BACKGROUND */}
      <div style={{ position: 'absolute', width: 1400, height: 1400, borderRadius: '50%', background: theme.primary, filter: 'blur(180px)', opacity: 0.15, top: -400, right: -400 }} />
      <div style={{ position: 'absolute', width: 1200, height: 1200, borderRadius: '50%', background: theme.secondary, filter: 'blur(180px)', opacity: 0.12, bottom: -400, left: -400 }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: `linear-gradient(${theme.primary} 2px, transparent 2px), linear-gradient(90deg, ${theme.primary} 2px, transparent 2px)`, backgroundSize: '100px 100px' }} />

      {/* Decorative Corners */}
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
            width: 80, height: 80, 
            borderLeft: isLeft ? `6px solid ${theme.primary}` : 'none',
            borderRight: isLeft ? 'none' : `6px solid ${theme.primary}`,
            borderTop: isTop ? `6px solid ${theme.primary}` : 'none',
            borderBottom: isTop ? 'none' : `6px solid ${theme.primary}`,
            zIndex: 100,
            opacity: 0.4
          }} />
        );
      })}

      {/* 2. HEADER BADGE */}
      <div style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: theme.primary,
          color: theme.background,
          padding: '10px 40px',
          borderRadius: 40,
          border: `4px solid ${theme.background}`,
          fontSize: 22,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: 4,
          boxShadow: `8px 8px 0px rgba(0,0,0,0.5)`,
      }}>
          {title.split(' - ')[0]}
      </div>

      {/* 3. CONTENT AREA */}
      <div style={{
          position: 'absolute',
          top: TOP_SAFE,
          bottom: BOTTOM_SAFE,
          left: SIDE_SAFE,
          right: SIDE_SAFE,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isPoppy ? 'center' : 'flex-start',
          alignItems: 'center',
          zIndex: 50,
      }}>
          {isPoppy ? (
              <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 30 }}>
                  <h1 style={{
                      fontSize,
                      fontWeight: 900,
                      color: theme.text,
                      margin: 0,
                      lineHeight: 0.85,
                      letterSpacing: -5,
                      textShadow: `12px 12px 0px ${theme.background}`,
                      wordBreak: 'break-word',
                  }}>
                      {content.toUpperCase()}
                  </h1>
                  <div style={{ fontSize: 36, fontWeight: 800, color: theme.secondary, textTransform: 'uppercase', letterSpacing: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                      <div style={{ height: 4, width: 50, background: theme.secondary }} />
                      {heading}
                      <div style={{ height: 4, width: 50, background: theme.secondary }} />
                  </div>
              </div>
          ) : (
              <div style={{
                  width: "100%",
                  height: "100%",
                  background: theme.cardBg,
                  backdropFilter: "blur(60px)",
                  borderRadius: 50,
                  border: `6px solid ${theme.primary}`,
                  padding: "45px 40px",
                  display: "flex",
                  flexDirection: 'column',
                  gap: 15,
                  boxShadow: `25px 25px 0px rgba(0,0,0,0.4)`,
                  position: 'relative',
                  overflow: 'hidden',
              }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 15, flexShrink: 0, marginBottom: 10 }}>
                      <DynamicIcon name={currentIcon} size={44} color={theme.primary} />
                      <h2 style={{ fontSize: 44, fontWeight: 900, color: theme.primary, margin: 0, letterSpacing: -1 }}>{heading.toUpperCase() || "BIOLOGY"}</h2>
                  </div>
                  
                  <div style={{ 
                      fontSize, 
                      lineHeight: 1.3, 
                      fontWeight: 700, 
                      color: theme.text, 
                      flex: 1,
                      overflow: 'hidden',
                      letterSpacing: -0.5,
                  }}>
                      <ReactMarkdown components={{
                          strong: ({node, ...props}) => <span style={{color: theme.secondary, fontWeight: 900}} {...props} />,
                          p: ({node, ...props}) => <p style={{margin: '0 0 15px 0'}} {...props} />,
                          ul: ({node, ...props}) => <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: '15px 0' }} {...props} />,
                          li: ({node, ...props}) => (
                            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <span style={{ color: theme.primary, fontSize: '1.2em' }}>•</span>
                                <span>{props.children}</span>
                            </li>
                          ),
                      }}>{content}</ReactMarkdown>
                  </div>

                  {total && (
                      <div style={{
                          background: theme.primary,
                          color: theme.background,
                          padding: '5px 20px',
                          borderRadius: 12,
                          fontSize: 22,
                          fontWeight: 900,
                          alignSelf: 'center',
                          marginTop: 'auto',
                          flexShrink: 0,
                      }}>
                          {index} / {total}
                      </div>
                  )}
              </div>
          )}
      </div>

      {/* 4. FOOTER */}
      <div style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(0,0,0,0.4)',
          padding: '12px 60px',
          borderRadius: 100,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          width: 'max-content',
          whiteSpace: 'nowrap',
      }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: theme.text, margin: 0, letterSpacing: -2, textShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}>
              {(() => {
                const words = (footerText || "SLIDESHOW ENGINE").split(" ");
                const lastWord = words.pop() || "";
                const leadingWords = words.join(" ");
                return (
                  <>
                    {leadingWords} <span style={{ color: theme.primary }}>{lastWord}</span>
                  </>
                );
              })()}
          </h1>
      </div>
    </AbsoluteFill>
  );
};
