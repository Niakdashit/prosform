/**
 * Styles de marque prédéfinis avec couleurs, polices et univers visuel
 */

export interface BrandStyle {
  id: string;
  name: string;
  description: string;
  preview: string; // Emoji ou icône pour la prévisualisation
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundGradient?: string;
    text: string;
    textMuted: string;
    buttonBg: string;
    buttonText: string;
    inputBg: string;
    inputBorder: string;
    cardBg: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: number;
    bodyWeight: number;
    headingStyle?: 'normal' | 'italic';
  };
  borderRadius: {
    button: string;
    card: string;
    input: string;
  };
  effects: {
    shadow: string;
    glow?: string;
  };
  // Couleurs pour les segments de roue
  segmentColors: string[];
  segmentTextColor: string;
}

export const BRAND_STYLES: Record<string, BrandStyle> = {
  modern: {
    id: 'modern',
    name: 'Moderne',
    description: 'Design épuré et professionnel',
    preview: '✨',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#ffffff',
      backgroundGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      text: '#1f2937',
      textMuted: '#6b7280',
      buttonBg: '#6366f1',
      buttonText: '#ffffff',
      inputBg: '#f9fafb',
      inputBorder: '#e5e7eb',
      cardBg: '#ffffff',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: 700,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '12px',
      card: '16px',
      input: '8px',
    },
    effects: {
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    segmentColors: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#5b21b6'],
    segmentTextColor: '#ffffff',
  },

  elegant: {
    id: 'elegant',
    name: 'Élégant',
    description: 'Luxe et raffinement',
    preview: '👑',
    colors: {
      primary: '#d4af37',
      secondary: '#1a1a1a',
      accent: '#ffffff',
      background: '#0a0a0a',
      backgroundGradient: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      text: '#ffffff',
      textMuted: '#a3a3a3',
      buttonBg: '#d4af37',
      buttonText: '#000000',
      inputBg: '#1a1a1a',
      inputBorder: '#404040',
      cardBg: '#171717',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Lato',
      headingWeight: 600,
      bodyWeight: 400,
      headingStyle: 'italic',
    },
    borderRadius: {
      button: '4px',
      card: '8px',
      input: '4px',
    },
    effects: {
      shadow: '0 4px 20px rgba(212, 175, 55, 0.2)',
      glow: '0 0 20px rgba(212, 175, 55, 0.3)',
    },
    segmentColors: ['#d4af37', '#1a1a1a', '#c0c0c0', '#2d2d2d', '#b8860b', '#404040'],
    segmentTextColor: '#ffffff',
  },

  playful: {
    id: 'playful',
    name: 'Fun & Coloré',
    description: 'Dynamique et joyeux',
    preview: '🎨',
    colors: {
      primary: '#f472b6',
      secondary: '#a78bfa',
      accent: '#34d399',
      background: '#fef3c7',
      backgroundGradient: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%)',
      text: '#1f2937',
      textMuted: '#6b7280',
      buttonBg: '#f472b6',
      buttonText: '#ffffff',
      inputBg: '#ffffff',
      inputBorder: '#f9a8d4',
      cardBg: '#ffffff',
    },
    typography: {
      headingFont: 'Nunito',
      bodyFont: 'Nunito',
      headingWeight: 800,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '24px',
      card: '24px',
      input: '12px',
    },
    effects: {
      shadow: '0 8px 16px rgba(244, 114, 182, 0.2)',
    },
    segmentColors: ['#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#60a5fa', '#f87171'],
    segmentTextColor: '#ffffff',
  },

  christmas: {
    id: 'christmas',
    name: 'Noël',
    description: 'Esprit festif de Noël',
    preview: '🎄',
    colors: {
      primary: '#dc2626',
      secondary: '#15803d',
      accent: '#fbbf24',
      background: '#fef2f2',
      backgroundGradient: 'linear-gradient(135deg, #fef2f2 0%, #dcfce7 100%)',
      text: '#1f2937',
      textMuted: '#6b7280',
      buttonBg: '#dc2626',
      buttonText: '#ffffff',
      inputBg: '#ffffff',
      inputBorder: '#fca5a5',
      cardBg: '#ffffff',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Open Sans',
      headingWeight: 700,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '8px',
      card: '12px',
      input: '8px',
    },
    effects: {
      shadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
      glow: '0 0 30px rgba(251, 191, 36, 0.3)',
    },
    segmentColors: ['#dc2626', '#15803d', '#fbbf24', '#b91c1c', '#166534', '#f59e0b'],
    segmentTextColor: '#ffffff',
  },

  blackfriday: {
    id: 'blackfriday',
    name: 'Black Friday',
    description: 'Promos et urgence',
    preview: '🏷️',
    colors: {
      primary: '#000000',
      secondary: '#fbbf24',
      accent: '#ef4444',
      background: '#18181b',
      backgroundGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
      text: '#ffffff',
      textMuted: '#a1a1aa',
      buttonBg: '#fbbf24',
      buttonText: '#000000',
      inputBg: '#27272a',
      inputBorder: '#3f3f46',
      cardBg: '#27272a',
    },
    typography: {
      headingFont: 'Montserrat',
      bodyFont: 'Roboto',
      headingWeight: 900,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '4px',
      card: '8px',
      input: '4px',
    },
    effects: {
      shadow: '0 4px 20px rgba(251, 191, 36, 0.3)',
      glow: '0 0 40px rgba(251, 191, 36, 0.2)',
    },
    segmentColors: ['#000000', '#fbbf24', '#ef4444', '#27272a', '#f59e0b', '#dc2626'],
    segmentTextColor: '#ffffff',
  },

  halloween: {
    id: 'halloween',
    name: 'Halloween',
    description: 'Ambiance effrayante',
    preview: '🎃',
    colors: {
      primary: '#f97316',
      secondary: '#7c3aed',
      accent: '#22c55e',
      background: '#1c1917',
      backgroundGradient: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
      text: '#ffffff',
      textMuted: '#a8a29e',
      buttonBg: '#f97316',
      buttonText: '#000000',
      inputBg: '#292524',
      inputBorder: '#44403c',
      cardBg: '#292524',
    },
    typography: {
      headingFont: 'Creepster',
      bodyFont: 'Open Sans',
      headingWeight: 400,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '8px',
      card: '12px',
      input: '8px',
    },
    effects: {
      shadow: '0 4px 20px rgba(249, 115, 22, 0.3)',
      glow: '0 0 30px rgba(124, 58, 237, 0.3)',
    },
    segmentColors: ['#f97316', '#7c3aed', '#000000', '#ea580c', '#6d28d9', '#1c1917'],
    segmentTextColor: '#ffffff',
  },

  summer: {
    id: 'summer',
    name: 'Été',
    description: 'Vacances et soleil',
    preview: '☀️',
    colors: {
      primary: '#f59e0b',
      secondary: '#3b82f6',
      accent: '#f97316',
      background: '#fef3c7',
      backgroundGradient: 'linear-gradient(135deg, #fef3c7 0%, #dbeafe 100%)',
      text: '#1f2937',
      textMuted: '#6b7280',
      buttonBg: '#f59e0b',
      buttonText: '#000000',
      inputBg: '#ffffff',
      inputBorder: '#fcd34d',
      cardBg: '#ffffff',
    },
    typography: {
      headingFont: 'Poppins',
      bodyFont: 'Poppins',
      headingWeight: 700,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '20px',
      card: '20px',
      input: '10px',
    },
    effects: {
      shadow: '0 8px 20px rgba(245, 158, 11, 0.2)',
    },
    segmentColors: ['#f59e0b', '#3b82f6', '#f97316', '#fbbf24', '#60a5fa', '#ea580c'],
    segmentTextColor: '#000000',
  },

  valentine: {
    id: 'valentine',
    name: 'Saint-Valentin',
    description: 'Amour et romantisme',
    preview: '💕',
    colors: {
      primary: '#ec4899',
      secondary: '#f43f5e',
      accent: '#ffffff',
      background: '#fdf2f8',
      backgroundGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      text: '#1f2937',
      textMuted: '#6b7280',
      buttonBg: '#ec4899',
      buttonText: '#ffffff',
      inputBg: '#ffffff',
      inputBorder: '#f9a8d4',
      cardBg: '#ffffff',
    },
    typography: {
      headingFont: 'Dancing Script',
      bodyFont: 'Lato',
      headingWeight: 700,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '24px',
      card: '16px',
      input: '12px',
    },
    effects: {
      shadow: '0 4px 15px rgba(236, 72, 153, 0.2)',
      glow: '0 0 20px rgba(236, 72, 153, 0.2)',
    },
    segmentColors: ['#ec4899', '#f43f5e', '#fb7185', '#f472b6', '#e11d48', '#be185d'],
    segmentTextColor: '#ffffff',
  },

  newyear: {
    id: 'newyear',
    name: 'Nouvel An',
    description: 'Célébration et fête',
    preview: '🎆',
    colors: {
      primary: '#fbbf24',
      secondary: '#000000',
      accent: '#c0c0c0',
      background: '#0a0a0a',
      backgroundGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      text: '#ffffff',
      textMuted: '#a3a3a3',
      buttonBg: '#fbbf24',
      buttonText: '#000000',
      inputBg: '#1a1a1a',
      inputBorder: '#404040',
      cardBg: '#171717',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      headingWeight: 700,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '8px',
      card: '12px',
      input: '8px',
    },
    effects: {
      shadow: '0 4px 20px rgba(251, 191, 36, 0.3)',
      glow: '0 0 40px rgba(251, 191, 36, 0.2)',
    },
    segmentColors: ['#fbbf24', '#000000', '#c0c0c0', '#f59e0b', '#1a1a1a', '#d4d4d4'],
    segmentTextColor: '#ffffff',
  },

  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professionnel et sérieux',
    preview: '💼',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#10b981',
      background: '#f8fafc',
      backgroundGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      text: '#1e293b',
      textMuted: '#64748b',
      buttonBg: '#3b82f6',
      buttonText: '#ffffff',
      inputBg: '#ffffff',
      inputBorder: '#cbd5e1',
      cardBg: '#ffffff',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: 600,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '6px',
      card: '8px',
      input: '6px',
    },
    effects: {
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    segmentColors: ['#3b82f6', '#1e40af', '#60a5fa', '#2563eb', '#1d4ed8', '#93c5fd'],
    segmentTextColor: '#ffffff',
  },

  eco: {
    id: 'eco',
    name: 'Éco / Nature',
    description: 'Naturel et responsable',
    preview: '🌿',
    colors: {
      primary: '#22c55e',
      secondary: '#15803d',
      accent: '#84cc16',
      background: '#f0fdf4',
      backgroundGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      text: '#14532d',
      textMuted: '#166534',
      buttonBg: '#22c55e',
      buttonText: '#ffffff',
      inputBg: '#ffffff',
      inputBorder: '#86efac',
      cardBg: '#ffffff',
    },
    typography: {
      headingFont: 'Merriweather',
      bodyFont: 'Open Sans',
      headingWeight: 700,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '12px',
      card: '16px',
      input: '8px',
    },
    effects: {
      shadow: '0 4px 12px rgba(34, 197, 94, 0.15)',
    },
    segmentColors: ['#22c55e', '#15803d', '#84cc16', '#16a34a', '#166534', '#4ade80'],
    segmentTextColor: '#ffffff',
  },

  tech: {
    id: 'tech',
    name: 'Tech / Startup',
    description: 'Innovant et moderne',
    preview: '🚀',
    colors: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      accent: '#f43f5e',
      background: '#0f172a',
      backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      buttonBg: '#8b5cf6',
      buttonText: '#ffffff',
      inputBg: '#1e293b',
      inputBorder: '#334155',
      cardBg: '#1e293b',
    },
    typography: {
      headingFont: 'Space Grotesk',
      bodyFont: 'Inter',
      headingWeight: 700,
      bodyWeight: 400,
    },
    borderRadius: {
      button: '8px',
      card: '12px',
      input: '8px',
    },
    effects: {
      shadow: '0 4px 20px rgba(139, 92, 246, 0.2)',
      glow: '0 0 30px rgba(6, 182, 212, 0.2)',
    },
    segmentColors: ['#8b5cf6', '#06b6d4', '#f43f5e', '#a78bfa', '#22d3ee', '#fb7185'],
    segmentTextColor: '#ffffff',
  },
};

/**
 * Génère les variables CSS pour un style de marque
 */
export function generateCSSVariables(style: BrandStyle): Record<string, string> {
  return {
    '--brand-primary': style.colors.primary,
    '--brand-secondary': style.colors.secondary,
    '--brand-accent': style.colors.accent,
    '--brand-background': style.colors.background,
    '--brand-background-gradient': style.colors.backgroundGradient || style.colors.background,
    '--brand-text': style.colors.text,
    '--brand-text-muted': style.colors.textMuted,
    '--brand-button-bg': style.colors.buttonBg,
    '--brand-button-text': style.colors.buttonText,
    '--brand-input-bg': style.colors.inputBg,
    '--brand-input-border': style.colors.inputBorder,
    '--brand-card-bg': style.colors.cardBg,
    '--brand-heading-font': style.typography.headingFont,
    '--brand-body-font': style.typography.bodyFont,
    '--brand-heading-weight': style.typography.headingWeight.toString(),
    '--brand-body-weight': style.typography.bodyWeight.toString(),
    '--brand-radius-button': style.borderRadius.button,
    '--brand-radius-card': style.borderRadius.card,
    '--brand-radius-input': style.borderRadius.input,
    '--brand-shadow': style.effects.shadow,
    '--brand-glow': style.effects.glow || 'none',
  };
}

/**
 * Applique un style de marque à une configuration de campagne
 */
export function applyBrandStyleToConfig(config: any, style: BrandStyle): any {
  const updatedConfig = { ...config };
  
  // Appliquer aux écrans
  const screens = ['welcomeScreen', 'contactForm', 'contactScreen', 'wheelScreen', 'scratchScreen', 'jackpotScreen', 'endingWin', 'endingLose', 'resultScreen'];
  
  screens.forEach(screenKey => {
    if (updatedConfig[screenKey]) {
      updatedConfig[screenKey] = {
        ...updatedConfig[screenKey],
        // Couleurs de texte
        titleStyle: {
          ...updatedConfig[screenKey].titleStyle,
          color: style.colors.text,
          fontFamily: style.typography.headingFont,
          fontWeight: style.typography.headingWeight,
        },
        subtitleStyle: {
          ...updatedConfig[screenKey].subtitleStyle,
          color: style.colors.textMuted,
          fontFamily: style.typography.bodyFont,
          fontWeight: style.typography.bodyWeight,
        },
      };
    }
  });
  
  // Appliquer aux segments
  if (updatedConfig.segments) {
    updatedConfig.segments = updatedConfig.segments.map((seg: any, i: number) => ({
      ...seg,
      color: style.segmentColors[i % style.segmentColors.length],
      textColor: style.segmentTextColor,
    }));
  }
  
  return updatedConfig;
}

/**
 * Obtient un style recommandé basé sur le contexte
 */
export function getRecommendedStyle(context: string): BrandStyle {
  const lowerContext = context.toLowerCase();
  
  if (lowerContext.includes('noël') || lowerContext.includes('noel') || lowerContext.includes('christmas')) {
    return BRAND_STYLES.christmas;
  }
  if (lowerContext.includes('black friday') || lowerContext.includes('blackfriday') || lowerContext.includes('promo')) {
    return BRAND_STYLES.blackfriday;
  }
  if (lowerContext.includes('halloween')) {
    return BRAND_STYLES.halloween;
  }
  if (lowerContext.includes('été') || lowerContext.includes('summer') || lowerContext.includes('vacances')) {
    return BRAND_STYLES.summer;
  }
  if (lowerContext.includes('valentin') || lowerContext.includes('amour') || lowerContext.includes('love')) {
    return BRAND_STYLES.valentine;
  }
  if (lowerContext.includes('nouvel an') || lowerContext.includes('new year') || lowerContext.includes('réveillon')) {
    return BRAND_STYLES.newyear;
  }
  if (lowerContext.includes('luxe') || lowerContext.includes('premium') || lowerContext.includes('bijou')) {
    return BRAND_STYLES.elegant;
  }
  if (lowerContext.includes('enfant') || lowerContext.includes('fun') || lowerContext.includes('jeu')) {
    return BRAND_STYLES.playful;
  }
  if (lowerContext.includes('tech') || lowerContext.includes('startup') || lowerContext.includes('digital')) {
    return BRAND_STYLES.tech;
  }
  if (lowerContext.includes('eco') || lowerContext.includes('bio') || lowerContext.includes('nature')) {
    return BRAND_STYLES.eco;
  }
  if (lowerContext.includes('entreprise') || lowerContext.includes('b2b') || lowerContext.includes('corporate')) {
    return BRAND_STYLES.corporate;
  }
  
  return BRAND_STYLES.modern;
}
