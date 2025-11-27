// Design System Tokens for Form Templates
// These tokens define reusable styles across all templates

export type LayoutStyle = 
  | "typeform"      // Split-screen with background images
  | "gradient"      // Gradient background with centered content
  | "minimal"       // Clean white/light with subtle accents
  | "bold"          // Strong colors, large typography
  | "elegant"       // Sophisticated with serif fonts
  | "modern"        // Geometric shapes, contemporary feel
  | "glassmorphism" // Frosted glass effect
  | "default";      // Standard form layout

export type ButtonStyle = 
  | "rounded"       // Fully rounded pill
  | "soft"          // Slightly rounded corners
  | "sharp"         // No border radius
  | "outline"       // Border only
  | "ghost"         // Transparent with hover
  | "gradient";     // Gradient background

export type FontStyle = 
  | "sans"          // Clean sans-serif
  | "serif"         // Elegant serif
  | "mono"          // Technical monospace
  | "display";      // Bold display font

export interface DesignTokens {
  // Colors
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  
  // Gradients
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  
  // Typography
  fontStyle: FontStyle;
  headingWeight: number;
  bodyWeight: number;
  
  // Spacing
  contentPadding: number;
  blockSpacing: number;
  
  // Borders
  borderRadius: number;
  borderWidth: number;
  
  // Effects
  shadowIntensity: 'none' | 'soft' | 'medium' | 'strong';
  blur?: number;
  
  // Layout
  layoutStyle: LayoutStyle;
  buttonStyle: ButtonStyle;
  
  // Images
  backgroundImages?: string[];
  brandName?: string;
  brandLogo?: string;
}

// Pre-built theme presets
export const themePresets: Record<string, Partial<DesignTokens>> = {
  // Dental/Healthcare - Teal professional
  dental: {
    primary: "#0F4C5C",
    secondary: "#9CAEA9",
    accent: "#E7F6F2",
    background: "#0F4C5C",
    surface: "rgba(255,255,255,0.1)",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.7)",
    layoutStyle: "typeform",
    buttonStyle: "rounded",
    fontStyle: "sans",
    headingWeight: 300,
    borderRadius: 8,
    shadowIntensity: "soft",
  },
  
  // NPS/Feedback - Fresh green gradient
  feedback: {
    primary: "#10B981",
    secondary: "#34D399",
    accent: "#D1FAE5",
    background: "linear-gradient(135deg, #065F46 0%, #10B981 100%)",
    gradientStart: "#065F46",
    gradientEnd: "#10B981",
    gradientAngle: 135,
    surface: "rgba(255,255,255,0.15)",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.8)",
    layoutStyle: "gradient",
    buttonStyle: "soft",
    fontStyle: "sans",
    headingWeight: 600,
    borderRadius: 12,
    shadowIntensity: "medium",
  },
  
  // CSAT - Deep blue elegant
  satisfaction: {
    primary: "#1E3A8A",
    secondary: "#3B82F6",
    accent: "#DBEAFE",
    background: "#0F172A",
    surface: "rgba(59, 130, 246, 0.1)",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    layoutStyle: "elegant",
    buttonStyle: "soft",
    fontStyle: "serif",
    headingWeight: 500,
    borderRadius: 4,
    shadowIntensity: "strong",
  },
  
  // Lead Gen - Warm orange bold
  leadgen: {
    primary: "#F97316",
    secondary: "#FB923C",
    accent: "#FED7AA",
    background: "#1C1917",
    gradientStart: "#F97316",
    gradientEnd: "#FBBF24",
    gradientAngle: 45,
    surface: "rgba(249, 115, 22, 0.1)",
    text: "#FAFAF9",
    textMuted: "#A8A29E",
    layoutStyle: "bold",
    buttonStyle: "gradient",
    fontStyle: "display",
    headingWeight: 800,
    borderRadius: 16,
    shadowIntensity: "strong",
  },
  
  // Quiz - Vibrant purple modern
  quiz: {
    primary: "#8B5CF6",
    secondary: "#A78BFA",
    accent: "#EDE9FE",
    background: "#18181B",
    gradientStart: "#7C3AED",
    gradientEnd: "#EC4899",
    gradientAngle: 135,
    surface: "rgba(139, 92, 246, 0.15)",
    text: "#FAFAFA",
    textMuted: "#A1A1AA",
    layoutStyle: "modern",
    buttonStyle: "rounded",
    fontStyle: "sans",
    headingWeight: 700,
    borderRadius: 20,
    shadowIntensity: "medium",
  },
  
  // Contact - Minimal slate
  contact: {
    primary: "#475569",
    secondary: "#64748B",
    accent: "#F1F5F9",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0F172A",
    textMuted: "#64748B",
    layoutStyle: "minimal",
    buttonStyle: "sharp",
    fontStyle: "sans",
    headingWeight: 500,
    borderRadius: 2,
    borderWidth: 1,
    shadowIntensity: "none",
  },
  
  // Event - Cyan glassmorphism
  event: {
    primary: "#06B6D4",
    secondary: "#22D3EE",
    accent: "#CFFAFE",
    background: "linear-gradient(180deg, #0E7490 0%, #164E63 100%)",
    gradientStart: "#0E7490",
    gradientEnd: "#164E63",
    gradientAngle: 180,
    surface: "rgba(255,255,255,0.1)",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.7)",
    layoutStyle: "glassmorphism",
    buttonStyle: "soft",
    fontStyle: "sans",
    headingWeight: 600,
    borderRadius: 16,
    blur: 20,
    shadowIntensity: "soft",
  },
  
  // HR/Jobs - Professional rose
  hr: {
    primary: "#E11D48",
    secondary: "#FB7185",
    accent: "#FFE4E6",
    background: "#18181B",
    surface: "rgba(225, 29, 72, 0.1)",
    text: "#FAFAFA",
    textMuted: "#A1A1AA",
    layoutStyle: "bold",
    buttonStyle: "soft",
    fontStyle: "sans",
    headingWeight: 700,
    borderRadius: 8,
    shadowIntensity: "medium",
  },
};

// Background image collections by theme
export const backgroundImageCollections: Record<string, string[]> = {
  dental: [
    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=900&q=80",
    "https://images.unsplash.com/photo-1606813902913-8a53b050f82d?w=900&q=80",
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=900&q=80",
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&q=80",
  ],
  feedback: [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
    "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=900&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
  ],
  satisfaction: [
    "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=900&q=80",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=80",
  ],
  leadgen: [
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80",
  ],
  quiz: [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80",
    "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=900&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80",
  ],
  contact: [
    "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=900&q=80",
  ],
  event: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&q=80",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=900&q=80",
  ],
  hr: [
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80",
  ],
};

// Picture choice image collections
export const pictureChoiceCollections: Record<string, string[]> = {
  workspace: [
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80",
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  ],
  dental: [
    "https://images.unsplash.com/photo-1606813902913-8a53b050f82d?w=400&q=80",
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&q=80",
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&q=80",
  ],
  abstract: [
    "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&q=80",
    "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80",
    "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=400&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
  ],
};

// Helper to get CSS for gradient backgrounds
export const getGradientCSS = (tokens: Partial<DesignTokens>): string => {
  if (tokens.gradientStart && tokens.gradientEnd) {
    return `linear-gradient(${tokens.gradientAngle || 135}deg, ${tokens.gradientStart} 0%, ${tokens.gradientEnd} 100%)`;
  }
  return tokens.background || "#000000";
};

// Helper to get button styles
export const getButtonStyles = (style: ButtonStyle, primary: string, text: string = "#FFFFFF") => {
  const base = {
    color: text,
    fontWeight: 500,
    transition: "all 0.2s ease",
  };
  
  switch (style) {
    case "rounded":
      return { ...base, backgroundColor: primary, borderRadius: "9999px", padding: "12px 24px" };
    case "soft":
      return { ...base, backgroundColor: primary, borderRadius: "12px", padding: "12px 24px" };
    case "sharp":
      return { ...base, backgroundColor: primary, borderRadius: "0px", padding: "14px 28px" };
    case "outline":
      return { ...base, backgroundColor: "transparent", border: `2px solid ${primary}`, color: primary, borderRadius: "8px", padding: "10px 22px" };
    case "ghost":
      return { ...base, backgroundColor: "transparent", color: primary, padding: "12px 24px" };
    case "gradient":
      return { ...base, background: `linear-gradient(135deg, ${primary} 0%, ${text} 100%)`, borderRadius: "12px", padding: "12px 24px" };
    default:
      return { ...base, backgroundColor: primary, borderRadius: "8px", padding: "12px 24px" };
  }
};
