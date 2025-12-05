import React, { createContext, useContext, useState, ReactNode } from 'react';

// Google Fonts disponibles - Collection complète
export const GOOGLE_FONTS = [
  // ═══════════════════════════════════════════════════════════
  // SANS-SERIF - Modern & Clean
  // ═══════════════════════════════════════════════════════════
  { value: 'inter', label: 'Inter', category: 'sans-serif' },
  { value: 'poppins', label: 'Poppins', category: 'sans-serif' },
  { value: 'nunito', label: 'Nunito', category: 'sans-serif' },
  { value: 'montserrat', label: 'Montserrat', category: 'sans-serif' },
  { value: 'roboto', label: 'Roboto', category: 'sans-serif' },
  { value: 'open-sans', label: 'Open Sans', category: 'sans-serif' },
  { value: 'lato', label: 'Lato', category: 'sans-serif' },
  { value: 'raleway', label: 'Raleway', category: 'sans-serif' },
  { value: 'work-sans', label: 'Work Sans', category: 'sans-serif' },
  { value: 'dm-sans', label: 'DM Sans', category: 'sans-serif' },
  { value: 'space-grotesk', label: 'Space Grotesk', category: 'sans-serif' },
  { value: 'outfit', label: 'Outfit', category: 'sans-serif' },
  { value: 'plus-jakarta-sans', label: 'Plus Jakarta Sans', category: 'sans-serif' },
  { value: 'manrope', label: 'Manrope', category: 'sans-serif' },
  { value: 'sora', label: 'Sora', category: 'sans-serif' },
  { value: 'urbanist', label: 'Urbanist', category: 'sans-serif' },
  { value: 'quicksand', label: 'Quicksand', category: 'sans-serif' },
  { value: 'rubik', label: 'Rubik', category: 'sans-serif' },
  { value: 'karla', label: 'Karla', category: 'sans-serif' },
  { value: 'josefin-sans', label: 'Josefin Sans', category: 'sans-serif' },
  { value: 'cabin', label: 'Cabin', category: 'sans-serif' },
  { value: 'barlow', label: 'Barlow', category: 'sans-serif' },
  { value: 'mulish', label: 'Mulish', category: 'sans-serif' },
  { value: 'figtree', label: 'Figtree', category: 'sans-serif' },
  { value: 'albert-sans', label: 'Albert Sans', category: 'sans-serif' },
  { value: 'red-hat-display', label: 'Red Hat Display', category: 'sans-serif' },
  { value: 'lexend', label: 'Lexend', category: 'sans-serif' },
  
  // ═══════════════════════════════════════════════════════════
  // SERIF - Elegant & Classic
  // ═══════════════════════════════════════════════════════════
  { value: 'playfair-display', label: 'Playfair Display', category: 'serif' },
  { value: 'merriweather', label: 'Merriweather', category: 'serif' },
  { value: 'lora', label: 'Lora', category: 'serif' },
  { value: 'cormorant-garamond', label: 'Cormorant Garamond', category: 'serif' },
  { value: 'libre-baskerville', label: 'Libre Baskerville', category: 'serif' },
  { value: 'crimson-text', label: 'Crimson Text', category: 'serif' },
  { value: 'source-serif-4', label: 'Source Serif 4', category: 'serif' },
  { value: 'eb-garamond', label: 'EB Garamond', category: 'serif' },
  { value: 'spectral', label: 'Spectral', category: 'serif' },
  { value: 'bitter', label: 'Bitter', category: 'serif' },
  { value: 'fraunces', label: 'Fraunces', category: 'serif' },
  { value: 'dm-serif-display', label: 'DM Serif Display', category: 'serif' },
  { value: 'bodoni-moda', label: 'Bodoni Moda', category: 'serif' },
  { value: 'cardo', label: 'Cardo', category: 'serif' },
  { value: 'noto-serif', label: 'Noto Serif', category: 'serif' },
  
  // ═══════════════════════════════════════════════════════════
  // DISPLAY - Bold & Impactful
  // ═══════════════════════════════════════════════════════════
  { value: 'bebas-neue', label: 'Bebas Neue', category: 'display' },
  { value: 'anton', label: 'Anton', category: 'display' },
  { value: 'oswald', label: 'Oswald', category: 'display' },
  { value: 'archivo-black', label: 'Archivo Black', category: 'display' },
  { value: 'righteous', label: 'Righteous', category: 'display' },
  { value: 'abril-fatface', label: 'Abril Fatface', category: 'display' },
  { value: 'alfa-slab-one', label: 'Alfa Slab One', category: 'display' },
  { value: 'titan-one', label: 'Titan One', category: 'display' },
  { value: 'bungee', label: 'Bungee', category: 'display' },
  { value: 'bangers', label: 'Bangers', category: 'display' },
  { value: 'comfortaa', label: 'Comfortaa', category: 'display' },
  { value: 'fredoka', label: 'Fredoka', category: 'display' },
  { value: 'baloo-2', label: 'Baloo 2', category: 'display' },
  
  // ═══════════════════════════════════════════════════════════
  // HANDWRITING - Personal & Creative
  // ═══════════════════════════════════════════════════════════
  { value: 'permanent-marker', label: 'Permanent Marker', category: 'handwriting' },
  { value: 'pacifico', label: 'Pacifico', category: 'handwriting' },
  { value: 'lobster', label: 'Lobster', category: 'handwriting' },
  { value: 'satisfy', label: 'Satisfy', category: 'handwriting' },
  { value: 'dancing-script', label: 'Dancing Script', category: 'handwriting' },
  { value: 'great-vibes', label: 'Great Vibes', category: 'handwriting' },
  { value: 'caveat', label: 'Caveat', category: 'handwriting' },
  { value: 'kalam', label: 'Kalam', category: 'handwriting' },
  { value: 'shadows-into-light', label: 'Shadows Into Light', category: 'handwriting' },
  { value: 'indie-flower', label: 'Indie Flower', category: 'handwriting' },
  { value: 'amatic-sc', label: 'Amatic SC', category: 'handwriting' },
  
  // ═══════════════════════════════════════════════════════════
  // FUTURISTIC - Tech & Gaming
  // ═══════════════════════════════════════════════════════════
  { value: 'orbitron', label: 'Orbitron', category: 'display' },
  { value: 'audiowide', label: 'Audiowide', category: 'display' },
  { value: 'russo-one', label: 'Russo One', category: 'display' },
  { value: 'black-ops-one', label: 'Black Ops One', category: 'display' },
  { value: 'press-start-2p', label: 'Press Start 2P', category: 'display' },
  { value: 'monoton', label: 'Monoton', category: 'display' },
  { value: 'fascinate-inline', label: 'Fascinate Inline', category: 'display' },
  
  // ═══════════════════════════════════════════════════════════
  // MONOSPACE - Code & Technical
  // ═══════════════════════════════════════════════════════════
  { value: 'jetbrains-mono', label: 'JetBrains Mono', category: 'monospace' },
  { value: 'fira-code', label: 'Fira Code', category: 'monospace' },
  { value: 'source-code-pro', label: 'Source Code Pro', category: 'monospace' },
  { value: 'ibm-plex-mono', label: 'IBM Plex Mono', category: 'monospace' },
  { value: 'space-mono', label: 'Space Mono', category: 'monospace' },
];

// Helper pour convertir le nom de police en font-family CSS
export const getFontFamily = (fontValue: string): string => {
  const font = GOOGLE_FONTS.find(f => f.value === fontValue);
  return font ? `"${font.label}", ${font.category}` : fontValue;
};

// Palette de couleurs prédéfinies
// Structure: accent (foncé) = éléments importants, primary (moyen) = titres, secondary (clair) = fonds
export const COLOR_PRESETS = {
  neutral: { accent: '#1F2937', primary: '#374151', secondary: '#F9FAFB' },
  blue: { accent: '#1D4ED8', primary: '#2563EB', secondary: '#EFF6FF' },
  green: { accent: '#047857', primary: '#059669', secondary: '#ECFDF5' },
  purple: { accent: '#6D28D9', primary: '#7C3AED', secondary: '#F5F3FF' },
  red: { accent: '#B91C1C', primary: '#DC2626', secondary: '#FEF2F2' },
  orange: { accent: '#C2410C', primary: '#EA580C', secondary: '#FFF7ED' },
  pink: { accent: '#BE185D', primary: '#DB2777', secondary: '#FDF2F8' },
  teal: { accent: '#0F766E', primary: '#0D9488', secondary: '#ECFEFF' },
};

export interface ThemeSettings {
  // ═══════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════
  fontFamily: string;
  headingFontFamily: string;
  fontSize: number;
  headingSize: number;
  subheadingSize: number;
  bodySize: number;
  captionSize: number;
  fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  headingWeight: 'medium' | 'semibold' | 'bold' | 'extrabold';
  lineHeight: number;
  letterSpacing: number;
  
  // ═══════════════════════════════════════════════════════════
  // COLOR PALETTE (White-Label Ready)
  // ═══════════════════════════════════════════════════════════
  // Primary colors
  primaryColor: string;
  primaryLightColor: string;
  primaryDarkColor: string;
  // Secondary colors
  secondaryColor: string;
  secondaryLightColor: string;
  // Accent colors
  accentColor: string;
  // Text colors
  textColor: string;
  textSecondaryColor: string;
  textMutedColor: string;
  // Background colors
  backgroundColor: string;
  backgroundSecondaryColor: string;
  surfaceColor: string;
  // System colors (legacy support)
  buttonColor: string;
  systemColor: string;
  
  // ═══════════════════════════════════════════════════════════
  // GRADIENTS
  // ═══════════════════════════════════════════════════════════
  enableGradient: boolean;
  gradientType: 'linear' | 'radial';
  gradientAngle: number;
  gradientStartColor: string;
  gradientEndColor: string;
  
  // ═══════════════════════════════════════════════════════════
  // BUTTONS (Unified)
  // ═══════════════════════════════════════════════════════════
  buttonStyle: 'square' | 'rounded' | 'pill';
  buttonSize: 'small' | 'medium' | 'large';
  buttonBorderWidth: number;
  buttonShadow: 'none' | 'sm' | 'md' | 'lg';
  buttonTextColor: string;
  
  // ═══════════════════════════════════════════════════════════
  // BORDERS & SHAPES
  // ═══════════════════════════════════════════════════════════
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  cardRadius: number;
  inputRadius: number;
  
  // ═══════════════════════════════════════════════════════════
  // SPACING & LAYOUT
  // ═══════════════════════════════════════════════════════════
  questionSpacing: number;
  inputPadding: number;
  pageMargins: number;
  cardPadding: number;
  
  // ═══════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════
  shadowIntensity: number;
  shadowColor: string;
  animationSpeed: 'none' | 'slow' | 'normal' | 'fast';
  backdropBlur: number;
  
  // ═══════════════════════════════════════════════════════════
  // GAME-SPECIFIC (Wheel, Jackpot, etc.)
  // ═══════════════════════════════════════════════════════════
  wheelBorderStyle: 'gold' | 'silver' | 'neonBlue' | 'neonPink' | 'rainbow' | 'custom';
  wheelBorderCustomColor?: string;
  wheelSizeDesktop: number;
  wheelSizeMobile: number;
  jackpotTemplate: 'jackpot-1' | 'jackpot-2' | 'jackpot-3' | 'jackpot-4' | 'jackpot-5' | 'jackpot-6' | 'jackpot-7' | 'jackpot-8' | 'jackpot-9' | 'jackpot-10' | 'jackpot-11';
  customJackpotFrame?: string;
  modernJackpotFrameColor: string;
  modernJackpotInnerColor: string;
  gameAccentColor: string;
}

// Default White-Label Neutral Theme
const defaultTheme: ThemeSettings = {
  // Typography
  fontFamily: 'inter',
  headingFontFamily: 'inter',
  fontSize: 16,
  headingSize: 32,
  subheadingSize: 20,
  bodySize: 16,
  captionSize: 14,
  fontWeight: 'normal',
  headingWeight: 'semibold',
  lineHeight: 1.5,
  letterSpacing: 0,
  
  // Color Palette - Neutral/Brandable
  primaryColor: '#374151',
  primaryLightColor: '#6B7280',
  primaryDarkColor: '#1F2937',
  secondaryColor: '#9CA3AF',
  secondaryLightColor: '#D1D5DB',
  accentColor: '#4B5563',
  textColor: '#1a1a1a',
  textSecondaryColor: '#4B5563',
  textMutedColor: '#9CA3AF',
  backgroundColor: '#ffffff',
  backgroundSecondaryColor: '#F9FAFB',
  surfaceColor: '#F3F4F6',
  buttonColor: '#374151',
  systemColor: '#1a1a1a',
  
  // Gradients
  enableGradient: false,
  gradientType: 'linear',
  gradientAngle: 135,
  gradientStartColor: '#374151',
  gradientEndColor: '#1F2937',
  
  // Buttons
  buttonStyle: 'square',
  buttonSize: 'medium',
  buttonBorderWidth: 0,
  buttonShadow: 'none',
  buttonTextColor: '#ffffff',
  
  // Borders
  borderColor: '#E5E7EB',
  borderWidth: 1,
  borderRadius: 12,
  cardRadius: 16,
  inputRadius: 8,
  
  // Spacing
  questionSpacing: 1,
  inputPadding: 12,
  pageMargins: 32,
  cardPadding: 24,
  
  // Effects
  shadowIntensity: 10,
  shadowColor: 'rgba(0,0,0,0.1)',
  animationSpeed: 'normal',
  backdropBlur: 0,
  
  // Game-specific
  wheelBorderStyle: 'custom',
  wheelBorderCustomColor: '#1F2937',
  wheelSizeDesktop: 400,
  wheelSizeMobile: 320,
  jackpotTemplate: 'jackpot-3',
  customJackpotFrame: undefined,
  modernJackpotFrameColor: '#F59E0B',
  modernJackpotInnerColor: '#312E38',
  gameAccentColor: '#374151',
};

// Fonction utilitaire pour générer le CSS du bouton
export const getButtonStyles = (theme: ThemeSettings, viewMode: 'desktop' | 'mobile' = 'desktop') => {
  // Tailles adaptées au viewMode
  const desktopSizes = {
    small: { height: '36px', padding: '0 16px', fontSize: '13px' },
    medium: { height: '44px', padding: '0 24px', fontSize: '15px' },
    large: { height: '52px', padding: '0 32px', fontSize: '16px' },
  };
  
  const mobileSizes = {
    small: { height: '32px', padding: '0 12px', fontSize: '12px' },
    medium: { height: '40px', padding: '0 20px', fontSize: '14px' },
    large: { height: '48px', padding: '0 24px', fontSize: '15px' },
  };
  
  const sizes = viewMode === 'mobile' ? mobileSizes : desktopSizes;
  
  const radiusMap = {
    square: '0px',
    rounded: `${theme.borderRadius}px`,
    pill: '9999px',
  };
  
  const shadowMap = {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  };
  
  const background = theme.enableGradient 
    ? `linear-gradient(${theme.gradientAngle}deg, ${theme.gradientStartColor}, ${theme.gradientEndColor})`
    : theme.buttonColor;
  
  return {
    background,
    color: theme.buttonTextColor,
    border: theme.buttonBorderWidth > 0 ? `${theme.buttonBorderWidth}px solid ${theme.borderColor}` : 'none',
    borderRadius: radiusMap[theme.buttonStyle],
    boxShadow: shadowMap[theme.buttonShadow],
    ...sizes[theme.buttonSize],
    fontWeight: 500,
    fontFamily: getFontFamily(theme.fontFamily),
    transition: 'all 0.2s ease',
  };
};

// Fonction pour générer le gradient CSS
export const getGradientCSS = (theme: ThemeSettings) => {
  if (!theme.enableGradient) return theme.backgroundColor;
  
  if (theme.gradientType === 'linear') {
    return `linear-gradient(${theme.gradientAngle}deg, ${theme.gradientStartColor}, ${theme.gradientEndColor})`;
  }
  return `radial-gradient(circle, ${theme.gradientStartColor}, ${theme.gradientEndColor})`;
};

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children, initialTheme }: { children: ReactNode; initialTheme?: ThemeSettings | null }) => {
  const [theme, setTheme] = useState<ThemeSettings>(initialTheme || defaultTheme);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
