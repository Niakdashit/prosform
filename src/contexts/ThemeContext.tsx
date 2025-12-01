import React, { createContext, useContext, useState, ReactNode } from 'react';

// Google Fonts disponibles
export const GOOGLE_FONTS = [
  { value: 'inter', label: 'Inter', category: 'sans-serif' },
  { value: 'roboto', label: 'Roboto', category: 'sans-serif' },
  { value: 'open-sans', label: 'Open Sans', category: 'sans-serif' },
  { value: 'lato', label: 'Lato', category: 'sans-serif' },
  { value: 'montserrat', label: 'Montserrat', category: 'sans-serif' },
  { value: 'poppins', label: 'Poppins', category: 'sans-serif' },
  { value: 'nunito', label: 'Nunito', category: 'sans-serif' },
  { value: 'raleway', label: 'Raleway', category: 'sans-serif' },
  { value: 'playfair-display', label: 'Playfair Display', category: 'serif' },
  { value: 'merriweather', label: 'Merriweather', category: 'serif' },
  { value: 'lora', label: 'Lora', category: 'serif' },
  { value: 'source-serif-pro', label: 'Source Serif Pro', category: 'serif' },
  { value: 'space-grotesk', label: 'Space Grotesk', category: 'sans-serif' },
  { value: 'dm-sans', label: 'DM Sans', category: 'sans-serif' },
  { value: 'work-sans', label: 'Work Sans', category: 'sans-serif' },
];

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
  buttonStyle: 'rounded',
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
    fontFamily: theme.fontFamily,
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
