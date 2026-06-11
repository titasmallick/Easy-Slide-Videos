import React from "react";
import {
  AbsoluteFill,
  useVideoConfig,
  staticFile,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import * as Icons from "lucide-react";

const { fontFamily } = loadFont();

export interface Props {
  id: string;
  title: string;
  subtitle?: string;
  className?: string;
}

const THEMES = [
  { background: "#1A150E", cardBg: "rgba(35, 30, 25, 0.85)", primary: "#FDE047", secondary: "#FB923C", accent: "#6EE7B7", text: "#FFFAF0", border: "#FDE047" },
  { background: "#062016", cardBg: "rgba(10, 40, 30, 0.85)", primary: "#34D399", secondary: "#A7F3D0", accent: "#FDE047", text: "#ECFDF5", border: "#34D399" },
  { background: "#1E0E30", cardBg: "rgba(40, 20, 60, 0.85)", primary: "#A78BFA", secondary: "#DDD6FE", accent: "#FB923C", text: "#F5F3FF", border: "#A78BFA" },
  { background: "#2D0A0A", cardBg: "rgba(60, 20, 20, 0.85)", primary: "#F87171", secondary: "#FCA5A5", accent: "#6EE7B7", text: "#FEF2F2", border: "#F87171" },
  { background: "#081E26", cardBg: "rgba(10, 45, 55, 0.85)", primary: "#22D3EE", secondary: "#7DD3FC", accent: "#F472B6", text: "#ECFEFF", border: "#22D3EE" },
  { background: "#2E0821", cardBg: "rgba(60, 15, 45, 0.85)", primary: "#E879F9", secondary: "#F5D0FE", accent: "#FDE047", text: "#FDF4FF", border: "#E879F9" },
  { background: "#0E1B2D", cardBg: "rgba(25, 45, 75, 0.85)", primary: "#60A5FA", secondary: "#93C5FD", accent: "#FB923C", text: "#EFF6FF", border: "#60A5FA" },
  { background: "#2D1509", cardBg: "rgba(65, 30, 15, 0.85)", primary: "#FB923C", secondary: "#FDBA74", accent: "#22D3EE", text: "#FFF7ED", border: "#FB923C" },
  { background: "#1E293B", cardBg: "rgba(51, 65, 85, 0.85)", primary: "#CBD5E1", secondary: "#94A3B8", accent: "#FDE047", text: "#F8FAFC", border: "#CBD5E1" },
  { background: "#1E1B4B", cardBg: "rgba(49, 46, 129, 0.85)", primary: "#818CF8", secondary: "#A5B4FC", accent: "#F472B6", text: "#EEF2FF", border: "#818CF8" }
];

const getThemeForClass = (className: string) => {
    if (!className) return THEMES[0];
    const classNum = className.match(/\d+/)?.[0];
    if (classNum) {
        const mapping: Record<string, number> = {
            "5": 1,
            "6": 4,
            "7": 6,
            "8": 9,
            "9": 2,
            "10": 0,
            "11": 3,
            "12": 5,
        };
        return THEMES[mapping[classNum] % THEMES.length] || THEMES[0];
    }
    return THEMES[0];
};

const DynamicIcon: React.FC<{ name: string; size: number; color: string; style?: React.CSSProperties }> = ({ name, size, color, style }) => {
  const IconComponent = (Icons as any)[name] || Icons.Microscope;
  return <IconComponent size={size} color={color} style={style} />;
};

export const ThumbnailComposition: React.FC<Props> = ({ id, title, subtitle, className }) => {
  const theme = getThemeForClass(className || "");
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, overflow: "hidden", fontFamily }}>
      {/* Background blobs */}
      <div style={{
          position: 'absolute',
          width: 1400,
          height: 1400,
          borderRadius: '50%',
          background: theme.primary,
          filter: 'blur(120px)',
          opacity: 0.15,
          top: -300,
          right: -300,
      }} />
      <div style={{
          position: 'absolute',
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          background: theme.secondary,
          filter: 'blur(120px)',
          opacity: 0.12,
          bottom: -300,
          left: -300,
      }} />

      {/* Grid Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.1,
        backgroundImage: `linear-gradient(${theme.primary} 1px, transparent 1px), linear-gradient(90deg, ${theme.primary} 1px, transparent 1px)`,
        backgroundSize: '100px 100px',
      }} />

      {/* Main Container */}
      <div style={{
          position: 'absolute',
          inset: 60,
          background: theme.cardBg,
          backdropFilter: "blur(40px)",
          borderRadius: 60,
          border: `8px solid ${theme.primary}`,
          padding: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: `30px 30px 0px rgba(0,0,0,0.5)`,
      }}>
          {/* Top Label */}
          {className && (
              <div style={{
                  display: 'inline-block',
                  background: theme.primary,
                  color: theme.background,
                  padding: '12px 36px',
                  borderRadius: 20,
                  fontSize: 32,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: 4,
                  marginBottom: 60,
                  alignSelf: 'flex-start',
                  boxShadow: `8px 8px 0px rgba(0,0,0,0.3)`,
              }}>
                  {className}
              </div>
          )}

          {/* Title Container with flexible sizing */}
          <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              marginBottom: 140,
          }}>
              {/* Title */}
              <h1 style={{
                  fontSize: title.length > 40 ? 100 : (title.length > 25 ? 120 : 160),
                  fontWeight: 900,
                  color: theme.text,
                  lineHeight: 0.95,
                  letterSpacing: title.length > 40 ? -4 : -6,
                  margin: 0,
                  textShadow: `10px 10px 0px ${theme.background}`,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
              }}>
                  {title}
              </h1>

              {/* Subtitle */}
              {subtitle && (
                  <h2 style={{
                      fontSize: title.length > 40 ? 50 : (title.length > 25 ? 60 : 80),
                      fontWeight: 700,
                      color: theme.secondary,
                      marginTop: title.length > 40 ? 15 : 20,
                      marginBottom: 0,
                      lineHeight: 1.1,
                      letterSpacing: -2,
                  }}>
                      {subtitle}
                  </h2>
              )}
          </div>

          {/* Bottom Bar */}
          <div style={{
              position: 'absolute',
              bottom: 80,
              left: 80,
              right: 80,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
          }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ background: theme.accent, width: 30, height: 30, borderRadius: '50%' }} />
                  <span style={{ fontSize: 40, fontWeight: 900, color: theme.primary, textTransform: 'uppercase' }}>
                      Titas Sir Biology
                  </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                  <div style={{ transform: 'rotate(-5deg)' }}>
                      <DynamicIcon name="Microscope" size={100} color={theme.primary} />
                  </div>
                  <div style={{
                      background: theme.primary,
                      color: theme.background,
                      padding: '8px 24px',
                      borderRadius: 12,
                      fontSize: 44,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: 2,
                      boxShadow: `8px 8px 0px rgba(0,0,0,0.3)`,
                  }}>
                      BIONOTES
                  </div>
              </div>
          </div>
      </div>

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
            width: 100, 
            height: 100, 
            borderLeft: isLeft ? `6px solid ${theme.primary}` : 'none',
            borderRight: isLeft ? 'none' : `6px solid ${theme.primary}`,
            borderTop: isTop ? `6px solid ${theme.primary}` : 'none',
            borderBottom: isTop ? 'none' : `6px solid ${theme.primary}`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
