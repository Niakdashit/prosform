/**
 * Presets de typographie inspirés de Gamma App
 * Styles prédéfinis pour les Welcome Screens de concours
 */

export interface TypographyPreset {
  id: string;
  name: string;
  category: 'dark' | 'light' | 'colorful' | 'professional';
  preview: {
    background: string;
    backgroundImage?: string;
    titleColor: string;
    bodyColor: string;
    linkColor: string;
    cardBg?: string;
    borderColor?: string;
  };
  typography: {
    titleFont: string;
    bodyFont: string;
    titleWeight: number;
    bodyWeight: number;
    titleStyle?: 'normal' | 'italic';
    letterSpacing?: number;
  };
  // Styles des boutons et éléments UI (optionnel - valeurs par défaut basées sur la catégorie)
  ui?: {
    buttonStyle?: 'square' | 'rounded' | 'pill';
    buttonBorderWidth?: number;
    borderRadius?: number;
    cardRadius?: number;
    inputRadius?: number;
    shadowIntensity?: number;
  };
  effects?: {
    titleShadow?: string;
    glow?: string;
    blur?: number;
  };
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  // ═══════════════════════════════════════════════════════════
  // DARK THEMES
  // ═══════════════════════════════════════════════════════════
  {
    id: 'cornflower',
    name: 'Cornflower',
    category: 'dark',
    preview: {
      background: '#4361EE',
      titleColor: '#FFFFFF',
      bodyColor: '#E0E7FF',
      linkColor: '#93C5FD',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 12, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'alien',
    name: 'Alien',
    category: 'dark',
    preview: {
      background: '#000000',
      backgroundImage: 'linear-gradient(135deg, #000000 0%, #0a1a0a 50%, #001a00 100%)',
      titleColor: '#FFFFFF',
      bodyColor: '#A3E635',
      linkColor: '#84CC16',
    },
    typography: {
      titleFont: 'Space Grotesk',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 0, buttonBorderWidth: 2, shadowIntensity: 0 },
    effects: {
      glow: '0 0 30px rgba(163, 230, 53, 0.3)',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'dark',
    preview: {
      background: '#1E1B4B',
      backgroundImage: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
      titleColor: '#C4B5FD',
      bodyColor: '#A5B4FC',
      linkColor: '#818CF8',
    },
    typography: {
      titleFont: 'Poppins',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 24, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 25 },
    effects: {
      glow: '0 0 40px rgba(139, 92, 246, 0.3)',
    },
  },
  {
    id: 'velvet-tides',
    name: 'Velvet Tides',
    category: 'dark',
    preview: {
      background: '#1F2937',
      backgroundImage: 'linear-gradient(135deg, #1F2937 0%, #374151 30%, #4B5563 60%, #6B7280 100%)',
      titleColor: '#F9FAFB',
      bodyColor: '#D1D5DB',
      linkColor: '#9CA3AF',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Lato',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 1, shadowIntensity: 10 },
  },
  {
    id: 'piano',
    name: 'Piano',
    category: 'dark',
    preview: {
      background: '#000000',
      titleColor: '#FFFFFF',
      bodyColor: '#A3A3A3',
      linkColor: '#737373',
      cardBg: '#FFFFFF',
      borderColor: '#000000',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 0, inputRadius: 0, buttonBorderWidth: 2, shadowIntensity: 0 },
  },
  {
    id: 'atacama',
    name: 'Atacama',
    category: 'dark',
    preview: {
      background: '#1C1917',
      backgroundImage: 'linear-gradient(135deg, #1C1917 0%, #292524 50%, #44403C 100%)',
      titleColor: '#FAFAF9',
      bodyColor: '#D6D3D1',
      linkColor: '#F472B6',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Lato',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'pill', borderRadius: 16, cardRadius: 20, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 20 },
  },
  {
    id: 'vortex',
    name: 'Vortex',
    category: 'dark',
    preview: {
      background: '#0F172A',
      backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      titleColor: '#F8FAFC',
      bodyColor: '#CBD5E1',
      linkColor: '#60A5FA',
    },
    typography: {
      titleFont: 'Space Grotesk',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'stratos',
    name: 'Stratos',
    category: 'dark',
    preview: {
      background: '#0C1222',
      backgroundImage: 'linear-gradient(135deg, #0C1222 0%, #1A2744 50%, #2D3F5F 100%)',
      titleColor: '#FFFFFF',
      bodyColor: '#94A3B8',
      linkColor: '#38BDF8',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 30 },
    effects: {
      glow: '0 0 50px rgba(56, 189, 248, 0.2)',
    },
  },
  {
    id: 'shadow',
    name: 'Shadow',
    category: 'dark',
    preview: {
      background: '#18181B',
      backgroundImage: 'linear-gradient(180deg, #18181B 0%, #27272A 50%, #3F3F46 100%)',
      titleColor: '#FAFAFA',
      bodyColor: '#A1A1AA',
      linkColor: '#71717A',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 6, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 1, shadowIntensity: 5 },
  },
  {
    id: 'slate',
    name: 'Slate',
    category: 'dark',
    preview: {
      background: '#1E293B',
      backgroundImage: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
      titleColor: '#F1F5F9',
      bodyColor: '#CBD5E1',
      linkColor: '#F59E0B',
    },
    typography: {
      titleFont: 'Montserrat',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 10, cardRadius: 14, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 20 },
  },
  {
    id: 'moss-mist',
    name: 'Moss & Mist',
    category: 'dark',
    preview: {
      background: '#1A2E1A',
      backgroundImage: 'linear-gradient(135deg, #1A2E1A 0%, #2D4A2D 100%)',
      titleColor: '#ECFDF5',
      bodyColor: '#A7F3D0',
      linkColor: '#6EE7B7',
    },
    typography: {
      titleFont: 'Nunito',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'basic-dark',
    name: 'Basic Dark',
    category: 'dark',
    preview: {
      background: '#000000',
      titleColor: '#FFFFFF',
      bodyColor: '#A3A3A3',
      linkColor: '#F59E0B',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 0, shadowIntensity: 10 },
  },
  {
    id: 'aurum',
    name: 'Aurum',
    category: 'dark',
    preview: {
      background: '#1C1917',
      backgroundImage: 'linear-gradient(135deg, #1C1917 0%, #292524 30%, #3D3A35 100%)',
      titleColor: '#FCD34D',
      bodyColor: '#D4D4D4',
      linkColor: '#FBBF24',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Lato',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'rounded', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 2, shadowIntensity: 25 },
    effects: {
      glow: '0 0 30px rgba(251, 191, 36, 0.2)',
    },
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    category: 'dark',
    preview: {
      background: '#3D2B1F',
      backgroundImage: 'linear-gradient(135deg, #3D2B1F 0%, #5D4037 100%)',
      titleColor: '#FFF8E1',
      bodyColor: '#D7CCC8',
      linkColor: '#FFAB91',
    },
    typography: {
      titleFont: 'Merriweather',
      bodyFont: 'Lato',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'wine',
    name: 'Wine',
    category: 'dark',
    preview: {
      background: '#4A1942',
      backgroundImage: 'linear-gradient(135deg, #4A1942 0%, #6B2C5B 100%)',
      titleColor: '#FDF2F8',
      bodyColor: '#F9A8D4',
      linkColor: '#F472B6',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 20 },
  },

  // ═══════════════════════════════════════════════════════════
  // LIGHT THEMES
  // ═══════════════════════════════════════════════════════════
  {
    id: 'vanilla',
    name: 'Vanilla',
    category: 'light',
    preview: {
      background: '#FEFCE8',
      titleColor: '#422006',
      bodyColor: '#78716C',
      linkColor: '#CA8A04',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Lato',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 1, shadowIntensity: 8 },
  },
  {
    id: 'breeze',
    name: 'Breeze',
    category: 'light',
    preview: {
      background: '#F0F9FF',
      titleColor: '#0C4A6E',
      bodyColor: '#64748B',
      linkColor: '#0284C7',
      cardBg: '#FFFFFF',
      borderColor: '#BAE6FD',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 16, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 12 },
  },
  {
    id: 'wireframe',
    name: 'Wireframe',
    category: 'light',
    preview: {
      background: '#F5F5F4',
      titleColor: '#1C1917',
      bodyColor: '#57534E',
      linkColor: '#44403C',
      cardBg: '#FFFFFF',
      borderColor: '#D6D3D1',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 2, shadowIntensity: 0 },
  },
  {
    id: 'leimoon',
    name: 'Leimoon',
    category: 'light',
    preview: {
      background: '#FFFBEB',
      backgroundImage: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      titleColor: '#1F2937',
      bodyColor: '#6B7280',
      linkColor: '#F97316',
      cardBg: '#FFFFFF',
    },
    typography: {
      titleFont: 'Poppins',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 12, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 10 },
  },
  {
    id: 'linen',
    name: 'Linen',
    category: 'light',
    preview: {
      background: '#FAF5F0',
      titleColor: '#292524',
      bodyColor: '#78716C',
      linkColor: '#57534E',
      cardBg: '#FAFAF9',
      borderColor: '#E7E5E4',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Lato',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'rounded', borderRadius: 6, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 1, shadowIntensity: 5 },
  },
  {
    id: 'pearl',
    name: 'Pearl',
    category: 'light',
    preview: {
      background: '#FAFAFA',
      titleColor: '#171717',
      bodyColor: '#525252',
      linkColor: '#404040',
      cardBg: '#FFFFFF',
      borderColor: '#E5E5E5',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 500,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 1, shadowIntensity: 3 },
  },
  {
    id: 'clementa',
    name: 'Clementa',
    category: 'light',
    preview: {
      background: '#FFFBEB',
      backgroundImage: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)',
      titleColor: '#92400E',
      bodyColor: '#78716C',
      linkColor: '#D97706',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'basic-light',
    name: 'Basic Light',
    category: 'light',
    preview: {
      background: '#FFFFFF',
      titleColor: '#000000',
      bodyColor: '#525252',
      linkColor: '#3B82F6',
      cardBg: '#F9FAFB',
      borderColor: '#E5E7EB',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 10 },
  },
  {
    id: 'twilight',
    name: 'Twilight',
    category: 'light',
    preview: {
      background: '#FDF4FF',
      backgroundImage: 'linear-gradient(180deg, #FDF4FF 0%, #FAE8FF 50%, #F5D0FE 100%)',
      titleColor: '#701A75',
      bodyColor: '#86198F',
      linkColor: '#A21CAF',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 18 },
  },

  // ═══════════════════════════════════════════════════════════
  // COLORFUL THEMES
  // ═══════════════════════════════════════════════════════════
  {
    id: 'malibu',
    name: 'Malibu',
    category: 'colorful',
    preview: {
      background: '#EC4899',
      backgroundImage: 'linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #FB7185 100%)',
      titleColor: '#FFFFFF',
      bodyColor: '#FDF2F8',
      linkColor: '#FDE047',
    },
    typography: {
      titleFont: 'Poppins',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 20 },
  },
  {
    id: 'sprout',
    name: 'Sprout',
    category: 'colorful',
    preview: {
      background: '#86EFAC',
      backgroundImage: 'linear-gradient(135deg, #86EFAC 0%, #4ADE80 50%, #22C55E 100%)',
      titleColor: '#14532D',
      bodyColor: '#166534',
      linkColor: '#15803D',
    },
    typography: {
      titleFont: 'Nunito',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 16, cardRadius: 20, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'bee-happy',
    name: 'Bee Happy',
    category: 'colorful',
    preview: {
      background: '#1F2937',
      titleColor: '#FDE047',
      bodyColor: '#FEF9C3',
      linkColor: '#FACC15',
    },
    typography: {
      titleFont: 'Nunito',
      bodyFont: 'Inter',
      titleWeight: 800,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 2, shadowIntensity: 0 },
  },
  {
    id: 'nova',
    name: 'Nova',
    category: 'colorful',
    preview: {
      background: '#FEE2E2',
      backgroundImage: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 50%, #FCA5A5 100%)',
      titleColor: '#7F1D1D',
      bodyColor: '#991B1B',
      linkColor: '#B91C1C',
    },
    typography: {
      titleFont: 'Poppins',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 12, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 12 },
  },

  // ═══════════════════════════════════════════════════════════
  // PROFESSIONAL THEMES
  // ═══════════════════════════════════════════════════════════
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    category: 'professional',
    preview: {
      background: '#F8FAFC',
      titleColor: '#1E40AF',
      bodyColor: '#475569',
      linkColor: '#2563EB',
      cardBg: '#FFFFFF',
      borderColor: '#CBD5E1',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 6, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 0, shadowIntensity: 8 },
  },
  {
    id: 'executive',
    name: 'Executive',
    category: 'professional',
    preview: {
      background: '#1F2937',
      titleColor: '#F9FAFB',
      bodyColor: '#D1D5DB',
      linkColor: '#60A5FA',
      cardBg: '#374151',
      borderColor: '#4B5563',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 4, cardRadius: 6, inputRadius: 4, buttonBorderWidth: 0, shadowIntensity: 12 },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'professional',
    preview: {
      background: '#FFFFFF',
      titleColor: '#18181B',
      bodyColor: '#71717A',
      linkColor: '#3F3F46',
      cardBg: '#FAFAFA',
      borderColor: '#E4E4E7',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 500,
      bodyWeight: 400,
      letterSpacing: 0.5,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 2, inputRadius: 0, buttonBorderWidth: 1, shadowIntensity: 0 },
  },
  {
    id: 'startup',
    name: 'Startup',
    category: 'professional',
    preview: {
      background: '#0F172A',
      backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      titleColor: '#F8FAFC',
      bodyColor: '#94A3B8',
      linkColor: '#8B5CF6',
    },
    typography: {
      titleFont: 'Space Grotesk',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 16, cardRadius: 12, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 20 },
    effects: {
      glow: '0 0 40px rgba(139, 92, 246, 0.2)',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // ADDITIONAL GAMMA-INSPIRED THEMES
  // ═══════════════════════════════════════════════════════════
  
  // Iris - Purple gradient header
  {
    id: 'iris',
    name: 'Iris',
    category: 'colorful',
    preview: {
      background: '#FFFFFF',
      backgroundImage: 'linear-gradient(180deg, #6366F1 0%, #8B5CF6 30%, #FFFFFF 30%)',
      titleColor: '#1F2937',
      bodyColor: '#6B7280',
      linkColor: '#6366F1',
    },
    typography: {
      titleFont: 'Poppins',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  
  // Keepsake - Teal gradient header
  {
    id: 'keepsake',
    name: 'Keepsake',
    category: 'colorful',
    preview: {
      background: '#FFFFFF',
      backgroundImage: 'linear-gradient(180deg, #14B8A6 0%, #5EEAD4 30%, #FFFFFF 30%)',
      titleColor: '#1F2937',
      bodyColor: '#6B7280',
      linkColor: '#14B8A6',
    },
    typography: {
      titleFont: 'Nunito',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 12, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 12 },
  },

  // Coral Sunset
  {
    id: 'coral-sunset',
    name: 'Coral Sunset',
    category: 'colorful',
    preview: {
      background: '#FFF5F5',
      backgroundImage: 'linear-gradient(135deg, #FFF5F5 0%, #FED7D7 50%, #FEB2B2 100%)',
      titleColor: '#742A2A',
      bodyColor: '#9B2C2C',
      linkColor: '#E53E3E',
    },
    typography: {
      titleFont: 'Poppins',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 18 },
  },

  // Ocean Deep
  {
    id: 'ocean-deep',
    name: 'Ocean Deep',
    category: 'dark',
    preview: {
      background: '#0C4A6E',
      backgroundImage: 'linear-gradient(135deg, #0C4A6E 0%, #075985 50%, #0369A1 100%)',
      titleColor: '#F0F9FF',
      bodyColor: '#BAE6FD',
      linkColor: '#38BDF8',
    },
    typography: {
      titleFont: 'Montserrat',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 10, cardRadius: 14, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 20 },
  },

  // Lavender Dreams
  {
    id: 'lavender-dreams',
    name: 'Lavender Dreams',
    category: 'light',
    preview: {
      background: '#FAF5FF',
      backgroundImage: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 50%, #E9D5FF 100%)',
      titleColor: '#581C87',
      bodyColor: '#7E22CE',
      linkColor: '#A855F7',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 12 },
  },

  // Mint Fresh
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    category: 'light',
    preview: {
      background: '#ECFDF5',
      backgroundImage: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      titleColor: '#065F46',
      bodyColor: '#047857',
      linkColor: '#10B981',
    },
    typography: {
      titleFont: 'Nunito',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 14, cardRadius: 18, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 10 },
  },

  // Midnight Purple
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    category: 'dark',
    preview: {
      background: '#1E1B4B',
      backgroundImage: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #3730A3 100%)',
      titleColor: '#E0E7FF',
      bodyColor: '#A5B4FC',
      linkColor: '#818CF8',
    },
    typography: {
      titleFont: 'Space Grotesk',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 25 },
    effects: {
      glow: '0 0 50px rgba(129, 140, 248, 0.3)',
    },
  },

  // Rose Gold
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    category: 'light',
    preview: {
      background: '#FDF2F8',
      backgroundImage: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FBCFE8 100%)',
      titleColor: '#831843',
      bodyColor: '#9D174D',
      linkColor: '#DB2777',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Lato',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 15 },
  },

  // Cyber Punk
  {
    id: 'cyber-punk',
    name: 'Cyber Punk',
    category: 'dark',
    preview: {
      background: '#0F0F0F',
      backgroundImage: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A2E 100%)',
      titleColor: '#00FF88',
      bodyColor: '#00D4FF',
      linkColor: '#FF00FF',
    },
    typography: {
      titleFont: 'Space Grotesk',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 0, buttonBorderWidth: 2, shadowIntensity: 0 },
    effects: {
      glow: '0 0 30px rgba(0, 255, 136, 0.4)',
      titleShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
    },
  },

  // Warm Sand
  {
    id: 'warm-sand',
    name: 'Warm Sand',
    category: 'light',
    preview: {
      background: '#FFFBEB',
      backgroundImage: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)',
      titleColor: '#78350F',
      bodyColor: '#92400E',
      linkColor: '#D97706',
    },
    typography: {
      titleFont: 'Merriweather',
      bodyFont: 'Lato',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 1, shadowIntensity: 8 },
  },

  // Forest Night
  {
    id: 'forest-night',
    name: 'Forest Night',
    category: 'dark',
    preview: {
      background: '#14532D',
      backgroundImage: 'linear-gradient(135deg, #14532D 0%, #166534 50%, #15803D 100%)',
      titleColor: '#ECFDF5',
      bodyColor: '#BBF7D0',
      linkColor: '#4ADE80',
    },
    typography: {
      titleFont: 'Merriweather',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 10, cardRadius: 14, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 18 },
  },

  // Neon Nights
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    category: 'dark',
    preview: {
      background: '#0A0A0A',
      backgroundImage: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
      titleColor: '#F472B6',
      bodyColor: '#A78BFA',
      linkColor: '#22D3EE',
    },
    typography: {
      titleFont: 'Poppins',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 16, cardRadius: 12, inputRadius: 8, buttonBorderWidth: 2, shadowIntensity: 0 },
    effects: {
      glow: '0 0 40px rgba(244, 114, 182, 0.3)',
      titleShadow: '0 0 30px rgba(244, 114, 182, 0.5)',
    },
  },

  // Arctic Blue
  {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    category: 'light',
    preview: {
      background: '#F0F9FF',
      backgroundImage: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)',
      titleColor: '#0C4A6E',
      bodyColor: '#075985',
      linkColor: '#0284C7',
    },
    typography: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 12, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 12 },
  },

  // Sunset Vibes
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    category: 'colorful',
    preview: {
      background: '#FFF7ED',
      backgroundImage: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 30%, #FED7AA 60%, #FDBA74 100%)',
      titleColor: '#7C2D12',
      bodyColor: '#9A3412',
      linkColor: '#EA580C',
    },
    typography: {
      titleFont: 'Poppins',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 18, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 15 },
  },

  // Elegant Noir
  {
    id: 'elegant-noir',
    name: 'Elegant Noir',
    category: 'dark',
    preview: {
      background: '#0A0A0A',
      titleColor: '#FAFAFA',
      bodyColor: '#A3A3A3',
      linkColor: '#D4AF37',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Lato',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 1, shadowIntensity: 0 },
    effects: {
      glow: '0 0 30px rgba(212, 175, 55, 0.2)',
    },
  },

  // Cotton Candy
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    category: 'colorful',
    preview: {
      background: '#FDF2F8',
      backgroundImage: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 30%, #DBEAFE 70%, #EFF6FF 100%)',
      titleColor: '#BE185D',
      bodyColor: '#6B7280',
      linkColor: '#2563EB',
    },
    typography: {
      titleFont: 'Nunito',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 18 },
  },

  // Emerald City
  {
    id: 'emerald-city',
    name: 'Emerald City',
    category: 'dark',
    preview: {
      background: '#022C22',
      backgroundImage: 'linear-gradient(135deg, #022C22 0%, #064E3B 50%, #065F46 100%)',
      titleColor: '#D1FAE5',
      bodyColor: '#A7F3D0',
      linkColor: '#34D399',
    },
    typography: {
      titleFont: 'Space Grotesk',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 22 },
    effects: {
      glow: '0 0 40px rgba(52, 211, 153, 0.2)',
    },
  },

  // Peach Blossom
  {
    id: 'peach-blossom',
    name: 'Peach Blossom',
    category: 'light',
    preview: {
      background: '#FFF7ED',
      backgroundImage: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
      titleColor: '#9A3412',
      bodyColor: '#C2410C',
      linkColor: '#EA580C',
      cardBg: '#FFFFFF',
      borderColor: '#FED7AA',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 10, cardRadius: 14, inputRadius: 6, buttonBorderWidth: 1, shadowIntensity: 10 },
  },

  // Royal Navy
  {
    id: 'royal-navy',
    name: 'Royal Navy',
    category: 'dark',
    preview: {
      background: '#0F172A',
      backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      titleColor: '#F8FAFC',
      bodyColor: '#CBD5E1',
      linkColor: '#FCD34D',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 6, cardRadius: 10, inputRadius: 4, buttonBorderWidth: 0, shadowIntensity: 20 },
    effects: {
      glow: '0 0 30px rgba(252, 211, 77, 0.15)',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // NEW THEMES WITH DIVERSE FONTS
  // ═══════════════════════════════════════════════════════════

  // DISPLAY FONTS - Bold & Impactful
  {
    id: 'retro-arcade',
    name: 'Retro Arcade',
    category: 'dark',
    preview: {
      background: '#0F0F23',
      backgroundImage: 'linear-gradient(135deg, #0F0F23 0%, #1A1A3E 100%)',
      titleColor: '#00FF88',
      bodyColor: '#FF00FF',
      linkColor: '#00FFFF',
    },
    typography: {
      titleFont: 'Press Start 2P',
      bodyFont: 'Space Mono',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 0, inputRadius: 0, buttonBorderWidth: 3, shadowIntensity: 0 },
    effects: { glow: '0 0 20px rgba(0, 255, 136, 0.5)' },
  },
  {
    id: 'neon-tokyo',
    name: 'Neon Tokyo',
    category: 'dark',
    preview: {
      background: '#0D0D0D',
      backgroundImage: 'linear-gradient(135deg, #0D0D0D 0%, #1A0A2E 100%)',
      titleColor: '#FF2D95',
      bodyColor: '#00D4FF',
      linkColor: '#FFE500',
    },
    typography: {
      titleFont: 'Orbitron',
      bodyFont: 'Urbanist',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 2, shadowIntensity: 0 },
    effects: { glow: '0 0 30px rgba(255, 45, 149, 0.4)' },
  },
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    category: 'dark',
    preview: {
      background: '#1A1A1A',
      titleColor: '#FFFFFF',
      bodyColor: '#B0B0B0',
      linkColor: '#FF4444',
    },
    typography: {
      titleFont: 'Bebas Neue',
      bodyFont: 'Roboto',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 0, shadowIntensity: 10 },
  },
  {
    id: 'sports-energy',
    name: 'Sports Energy',
    category: 'colorful',
    preview: {
      background: '#FF6B00',
      backgroundImage: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFF5E6',
      linkColor: '#1A1A1A',
    },
    typography: {
      titleFont: 'Anton',
      bodyFont: 'Barlow',
      titleWeight: 400,
      bodyWeight: 500,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 0, shadowIntensity: 20 },
  },
  {
    id: 'movie-poster',
    name: 'Movie Poster',
    category: 'dark',
    preview: {
      background: '#0A0A0A',
      titleColor: '#D4AF37',
      bodyColor: '#C0C0C0',
      linkColor: '#D4AF37',
    },
    typography: {
      titleFont: 'Oswald',
      bodyFont: 'Source Serif 4',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 2, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 1, shadowIntensity: 15 },
  },

  // HANDWRITING FONTS - Personal & Creative
  {
    id: 'creative-journal',
    name: 'Creative Journal',
    category: 'light',
    preview: {
      background: '#FDF6E3',
      titleColor: '#2D3748',
      bodyColor: '#4A5568',
      linkColor: '#E53E3E',
    },
    typography: {
      titleFont: 'Caveat',
      bodyFont: 'Karla',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 20, cardRadius: 16, inputRadius: 12, buttonBorderWidth: 2, shadowIntensity: 8 },
  },
  {
    id: 'wedding-elegance',
    name: 'Wedding Elegance',
    category: 'light',
    preview: {
      background: '#FFF9F5',
      backgroundImage: 'linear-gradient(180deg, #FFF9F5 0%, #FFF0E8 100%)',
      titleColor: '#8B7355',
      bodyColor: '#6B5B4F',
      linkColor: '#C9A87C',
    },
    typography: {
      titleFont: 'Great Vibes',
      bodyFont: 'Cormorant Garamond',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 30, cardRadius: 20, inputRadius: 16, buttonBorderWidth: 1, shadowIntensity: 5 },
  },
  {
    id: 'kids-party',
    name: 'Kids Party',
    category: 'colorful',
    preview: {
      background: '#FFE135',
      backgroundImage: 'linear-gradient(135deg, #FFE135 0%, #FFA500 100%)',
      titleColor: '#FF1493',
      bodyColor: '#4B0082',
      linkColor: '#00CED1',
    },
    typography: {
      titleFont: 'Fredoka',
      bodyFont: 'Quicksand',
      titleWeight: 600,
      bodyWeight: 500,
    },
    ui: { buttonStyle: 'pill', borderRadius: 30, cardRadius: 24, inputRadius: 16, buttonBorderWidth: 0, shadowIntensity: 20 },
  },
  {
    id: 'summer-vibes',
    name: 'Summer Vibes',
    category: 'colorful',
    preview: {
      background: '#87CEEB',
      backgroundImage: 'linear-gradient(180deg, #87CEEB 0%, #FFB6C1 100%)',
      titleColor: '#FF6347',
      bodyColor: '#2F4F4F',
      linkColor: '#FF4500',
    },
    typography: {
      titleFont: 'Pacifico',
      bodyFont: 'Nunito',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'handmade-craft',
    name: 'Handmade Craft',
    category: 'light',
    preview: {
      background: '#F5F0E6',
      titleColor: '#5D4E37',
      bodyColor: '#7A6B5A',
      linkColor: '#B8860B',
    },
    typography: {
      titleFont: 'Kalam',
      bodyFont: 'Mulish',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 12, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 2, shadowIntensity: 5 },
  },

  // MODERN SANS-SERIF - Clean & Contemporary
  {
    id: 'startup-fresh',
    name: 'Startup Fresh',
    category: 'light',
    preview: {
      background: '#FFFFFF',
      titleColor: '#111827',
      bodyColor: '#6B7280',
      linkColor: '#6366F1',
    },
    typography: {
      titleFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 12, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 12 },
  },
  {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    category: 'dark',
    preview: {
      background: '#09090B',
      titleColor: '#FAFAFA',
      bodyColor: '#A1A1AA',
      linkColor: '#22D3EE',
    },
    typography: {
      titleFont: 'Sora',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 1, shadowIntensity: 0 },
  },
  {
    id: 'saas-modern',
    name: 'SaaS Modern',
    category: 'light',
    preview: {
      background: '#F8FAFC',
      titleColor: '#0F172A',
      bodyColor: '#64748B',
      linkColor: '#8B5CF6',
    },
    typography: {
      titleFont: 'Manrope',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 10, cardRadius: 14, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 10 },
  },
  {
    id: 'fintech-trust',
    name: 'Fintech Trust',
    category: 'professional',
    preview: {
      background: '#F1F5F9',
      titleColor: '#0F172A',
      bodyColor: '#475569',
      linkColor: '#0EA5E9',
    },
    typography: {
      titleFont: 'Lexend',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 8 },
  },
  {
    id: 'health-wellness',
    name: 'Health Wellness',
    category: 'light',
    preview: {
      background: '#F0FDF4',
      backgroundImage: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)',
      titleColor: '#166534',
      bodyColor: '#4D7C0F',
      linkColor: '#22C55E',
    },
    typography: {
      titleFont: 'Outfit',
      bodyFont: 'Mulish',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 10 },
  },

  // ELEGANT SERIF - Luxury & Sophistication
  {
    id: 'luxury-brand',
    name: 'Luxury Brand',
    category: 'dark',
    preview: {
      background: '#1A1A1A',
      titleColor: '#D4AF37',
      bodyColor: '#B8B8B8',
      linkColor: '#D4AF37',
    },
    typography: {
      titleFont: 'Bodoni Moda',
      bodyFont: 'Lato',
      titleWeight: 500,
      bodyWeight: 300,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 0, inputRadius: 0, buttonBorderWidth: 1, shadowIntensity: 0 },
  },
  {
    id: 'editorial-chic',
    name: 'Editorial Chic',
    category: 'light',
    preview: {
      background: '#FFFEF5',
      titleColor: '#1A1A1A',
      bodyColor: '#4A4A4A',
      linkColor: '#C41E3A',
    },
    typography: {
      titleFont: 'DM Serif Display',
      bodyFont: 'Source Serif 4',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 1, shadowIntensity: 5 },
  },
  {
    id: 'wine-cellar',
    name: 'Wine Cellar',
    category: 'dark',
    preview: {
      background: '#2D1B2E',
      backgroundImage: 'linear-gradient(135deg, #2D1B2E 0%, #4A2C4D 100%)',
      titleColor: '#E8D5B7',
      bodyColor: '#C9B896',
      linkColor: '#C9A87C',
    },
    typography: {
      titleFont: 'Cormorant Garamond',
      bodyFont: 'EB Garamond',
      titleWeight: 600,
      bodyWeight: 400,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'rounded', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 1, shadowIntensity: 15 },
  },
  {
    id: 'classic-novel',
    name: 'Classic Novel',
    category: 'light',
    preview: {
      background: '#FBF7F0',
      titleColor: '#2C1810',
      bodyColor: '#5C4033',
      linkColor: '#8B4513',
    },
    typography: {
      titleFont: 'Libre Baskerville',
      bodyFont: 'Crimson Text',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 1, shadowIntensity: 5 },
  },

  // PLAYFUL & FUN
  {
    id: 'candy-pop',
    name: 'Candy Pop',
    category: 'colorful',
    preview: {
      background: '#FF69B4',
      backgroundImage: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 50%, #FF6EB4 100%)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFF0F5',
      linkColor: '#FFD700',
    },
    typography: {
      titleFont: 'Baloo 2',
      bodyFont: 'Quicksand',
      titleWeight: 700,
      bodyWeight: 500,
    },
    ui: { buttonStyle: 'pill', borderRadius: 30, cardRadius: 24, inputRadius: 16, buttonBorderWidth: 0, shadowIntensity: 20 },
  },
  {
    id: 'comic-hero',
    name: 'Comic Hero',
    category: 'colorful',
    preview: {
      background: '#FFE135',
      titleColor: '#FF0000',
      bodyColor: '#000080',
      linkColor: '#0000FF',
    },
    typography: {
      titleFont: 'Bangers',
      bodyFont: 'Cabin',
      titleWeight: 400,
      bodyWeight: 500,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 3, shadowIntensity: 25 },
  },
  {
    id: 'retro-groovy',
    name: 'Retro Groovy',
    category: 'colorful',
    preview: {
      background: '#F4A460',
      backgroundImage: 'linear-gradient(135deg, #F4A460 0%, #FF8C00 50%, #FF6347 100%)',
      titleColor: '#8B4513',
      bodyColor: '#2F1810',
      linkColor: '#FFD700',
    },
    typography: {
      titleFont: 'Righteous',
      bodyFont: 'Josefin Sans',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 15 },
  },

  // TECH & CODING
  {
    id: 'developer-dark',
    name: 'Developer Dark',
    category: 'dark',
    preview: {
      background: '#1E1E1E',
      titleColor: '#4EC9B0',
      bodyColor: '#9CDCFE',
      linkColor: '#CE9178',
    },
    typography: {
      titleFont: 'JetBrains Mono',
      bodyFont: 'Fira Code',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 1, shadowIntensity: 0 },
  },
  {
    id: 'terminal-green',
    name: 'Terminal Green',
    category: 'dark',
    preview: {
      background: '#0D0D0D',
      titleColor: '#00FF00',
      bodyColor: '#00CC00',
      linkColor: '#00FF00',
    },
    typography: {
      titleFont: 'Source Code Pro',
      bodyFont: 'IBM Plex Mono',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 1, shadowIntensity: 0 },
    effects: { glow: '0 0 10px rgba(0, 255, 0, 0.3)' },
  },

  // NATURE & ORGANIC
  {
    id: 'forest-retreat',
    name: 'Forest Retreat',
    category: 'dark',
    preview: {
      background: '#1B3D2F',
      backgroundImage: 'linear-gradient(135deg, #1B3D2F 0%, #2D5A45 100%)',
      titleColor: '#A8E6CF',
      bodyColor: '#88D8B0',
      linkColor: '#FFD93D',
    },
    typography: {
      titleFont: 'Fraunces',
      bodyFont: 'Cabin',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 12, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'ocean-calm',
    name: 'Ocean Calm',
    category: 'light',
    preview: {
      background: '#E0F7FA',
      backgroundImage: 'linear-gradient(180deg, #E0F7FA 0%, #B2EBF2 100%)',
      titleColor: '#006064',
      bodyColor: '#00838F',
      linkColor: '#00ACC1',
    },
    typography: {
      titleFont: 'Spectral',
      bodyFont: 'Rubik',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 10 },
  },

  // ARTISTIC & CREATIVE
  {
    id: 'art-gallery',
    name: 'Art Gallery',
    category: 'light',
    preview: {
      background: '#FFFFFF',
      titleColor: '#000000',
      bodyColor: '#333333',
      linkColor: '#E63946',
    },
    typography: {
      titleFont: 'Abril Fatface',
      bodyFont: 'Raleway',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 0, inputRadius: 0, buttonBorderWidth: 2, shadowIntensity: 0 },
  },
  {
    id: 'bohemian-dream',
    name: 'Bohemian Dream',
    category: 'light',
    preview: {
      background: '#FDF5E6',
      backgroundImage: 'linear-gradient(135deg, #FDF5E6 0%, #FAEBD7 100%)',
      titleColor: '#8B4513',
      bodyColor: '#A0522D',
      linkColor: '#CD853F',
    },
    typography: {
      titleFont: 'Amatic SC',
      bodyFont: 'Bitter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 16, cardRadius: 12, inputRadius: 8, buttonBorderWidth: 2, shadowIntensity: 8 },
  },

  // FUTURISTIC
  {
    id: 'space-odyssey',
    name: 'Space Odyssey',
    category: 'dark',
    preview: {
      background: '#0B0B1A',
      backgroundImage: 'linear-gradient(135deg, #0B0B1A 0%, #1A1A3E 50%, #2D2D5A 100%)',
      titleColor: '#E0E7FF',
      bodyColor: '#A5B4FC',
      linkColor: '#818CF8',
    },
    typography: {
      titleFont: 'Audiowide',
      bodyFont: 'Sora',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 1, shadowIntensity: 25 },
    effects: { glow: '0 0 40px rgba(129, 140, 248, 0.3)' },
  },
  {
    id: 'matrix-code',
    name: 'Matrix Code',
    category: 'dark',
    preview: {
      background: '#000000',
      titleColor: '#00FF41',
      bodyColor: '#008F11',
      linkColor: '#00FF41',
    },
    typography: {
      titleFont: 'Black Ops One',
      bodyFont: 'Space Mono',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 1, shadowIntensity: 0 },
    effects: { glow: '0 0 20px rgba(0, 255, 65, 0.4)' },
  },

  // ═══════════════════════════════════════════════════════════
  // ULTRA CREATIVE THEMES - Inspired by Canva/Design Tools
  // ═══════════════════════════════════════════════════════════

  // BOLD & RETRO STYLES
  {
    id: 'bold-retro',
    name: 'Bold & Retro',
    category: 'dark',
    preview: {
      background: '#2D2D2D',
      titleColor: '#FF4136',
      bodyColor: '#FFD700',
      linkColor: '#FF851B',
    },
    typography: {
      titleFont: 'Alfa Slab One',
      bodyFont: 'Dancing Script',
      titleWeight: 400,
      bodyWeight: 700,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 20 },
  },
  {
    id: 'new-product-alert',
    name: 'Product Alert',
    category: 'dark',
    preview: {
      background: '#3D3D3D',
      titleColor: '#FFDC00',
      bodyColor: '#FF4136',
      linkColor: '#FFFFFF',
    },
    typography: {
      titleFont: 'Bangers',
      bodyFont: 'Roboto',
      titleWeight: 400,
      bodyWeight: 700,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 16, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'you-are-best',
    name: 'You Are The Best',
    category: 'dark',
    preview: {
      background: '#3A3A3A',
      titleColor: '#2ECC40',
      bodyColor: '#FFFFFF',
      linkColor: '#01FF70',
    },
    typography: {
      titleFont: 'Titan One',
      bodyFont: 'Montserrat',
      titleWeight: 400,
      bodyWeight: 300,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 16, cardRadius: 20, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 25 },
  },
  {
    id: 'scary-story',
    name: 'Scary Story',
    category: 'dark',
    preview: {
      background: '#1A1A1A',
      titleColor: '#666666',
      bodyColor: '#FF6B6B',
      linkColor: '#FF4757',
    },
    typography: {
      titleFont: 'Creepster',
      bodyFont: 'Satisfy',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 2, shadowIntensity: 0 },
  },
  {
    id: 'sale-neon',
    name: 'Sale Neon',
    category: 'dark',
    preview: {
      background: '#2B2B2B',
      titleColor: '#39FF14',
      bodyColor: '#FF1493',
      linkColor: '#00FFFF',
    },
    typography: {
      titleFont: 'Bebas Neue',
      bodyFont: 'Oswald',
      titleWeight: 400,
      bodyWeight: 500,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 3, shadowIntensity: 0 },
    effects: { glow: '0 0 20px rgba(57, 255, 20, 0.5)' },
  },
  {
    id: 'rock-grunge',
    name: 'Rock Grunge',
    category: 'dark',
    preview: {
      background: '#2C2C2C',
      titleColor: '#00CED1',
      bodyColor: '#FFFFFF',
      linkColor: '#FF6347',
    },
    typography: {
      titleFont: 'Permanent Marker',
      bodyFont: 'Roboto',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'great-work',
    name: 'Great Work!',
    category: 'dark',
    preview: {
      background: '#333333',
      titleColor: '#FF69B4',
      bodyColor: '#00BFFF',
      linkColor: '#FFD700',
    },
    typography: {
      titleFont: 'Bungee',
      bodyFont: 'Nunito',
      titleWeight: 400,
      bodyWeight: 600,
    },
    ui: { buttonStyle: 'pill', borderRadius: 30, cardRadius: 20, inputRadius: 14, buttonBorderWidth: 0, shadowIntensity: 20 },
  },
  {
    id: 'wow-pop',
    name: 'WOW Pop!',
    category: 'dark',
    preview: {
      background: '#404040',
      titleColor: '#FF1493',
      bodyColor: '#FFFFFF',
      linkColor: '#FFD700',
    },
    typography: {
      titleFont: 'Monoton',
      bodyFont: 'Poppins',
      titleWeight: 400,
      bodyWeight: 500,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 25 },
    effects: { glow: '0 0 30px rgba(255, 20, 147, 0.4)' },
  },

  // KAWAII & CUTE STYLES
  {
    id: 'super-kawaii',
    name: 'Super Kawaii',
    category: 'colorful',
    preview: {
      background: '#FFB6C1',
      backgroundImage: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)',
      titleColor: '#FFFFFF',
      bodyColor: '#FF1493',
      linkColor: '#FF69B4',
    },
    typography: {
      titleFont: 'Fredoka',
      bodyFont: 'Quicksand',
      titleWeight: 700,
      bodyWeight: 500,
    },
    ui: { buttonStyle: 'pill', borderRadius: 30, cardRadius: 24, inputRadius: 16, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'awesome-news',
    name: 'Awesome News',
    category: 'dark',
    preview: {
      background: '#3B3B3B',
      titleColor: '#FF69B4',
      bodyColor: '#FFFFFF',
      linkColor: '#FFB6C1',
    },
    typography: {
      titleFont: 'Pacifico',
      bodyFont: 'Montserrat',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 12, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 10 },
  },

  // CHRISTMAS & HOLIDAY STYLES
  {
    id: 'merry-christmas',
    name: 'Merry Christmas',
    category: 'dark',
    preview: {
      background: '#2F2F2F',
      titleColor: '#FFFFFF',
      bodyColor: '#A0A0A0',
      linkColor: '#C41E3A',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Montserrat',
      titleWeight: 400,
      bodyWeight: 300,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 10 },
  },
  {
    id: 'white-christmas',
    name: 'White Christmas',
    category: 'dark',
    preview: {
      background: '#2A2A2A',
      titleColor: '#FFFFFF',
      bodyColor: '#E8E8E8',
      linkColor: '#87CEEB',
    },
    typography: {
      titleFont: 'Great Vibes',
      bodyFont: 'Lora',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'love-and-joy',
    name: 'Love & Joy',
    category: 'dark',
    preview: {
      background: '#363636',
      titleColor: '#FFFFFF',
      bodyColor: '#B0B0B0',
      linkColor: '#FF6B6B',
    },
    typography: {
      titleFont: 'Dancing Script',
      bodyFont: 'Raleway',
      titleWeight: 700,
      bodyWeight: 300,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 10, cardRadius: 14, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 8 },
  },
  {
    id: 'happy-birthday',
    name: 'Happy Birthday',
    category: 'dark',
    preview: {
      background: '#3C3C3C',
      titleColor: '#FFD700',
      bodyColor: '#FFFFFF',
      linkColor: '#FF69B4',
    },
    typography: {
      titleFont: 'Lobster',
      bodyFont: 'Oswald',
      titleWeight: 400,
      bodyWeight: 500,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 20 },
  },

  // WESTERN & VINTAGE STYLES
  {
    id: 'rodeo-western',
    name: 'Rodeo Western',
    category: 'dark',
    preview: {
      background: '#2E2E2E',
      titleColor: '#D4A574',
      bodyColor: '#C0A080',
      linkColor: '#8B4513',
    },
    typography: {
      titleFont: 'Rye',
      bodyFont: 'Bitter',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 2, shadowIntensity: 10 },
  },
  {
    id: 'school-rules',
    name: 'School Rules!',
    category: 'colorful',
    preview: {
      background: '#4A4A4A',
      titleColor: '#32CD32',
      bodyColor: '#FFD700',
      linkColor: '#FF6347',
    },
    typography: {
      titleFont: 'Bangers',
      bodyFont: 'Comic Neue',
      titleWeight: 400,
      bodyWeight: 700,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 16, cardRadius: 20, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 15 },
  },

  // ELEGANT & SOPHISTICATED
  {
    id: 'love-peace-joy',
    name: 'Love Peace Joy',
    category: 'dark',
    preview: {
      background: '#4A4A4A',
      titleColor: '#FFFFFF',
      bodyColor: '#B8B8B8',
      linkColor: '#D4AF37',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Montserrat',
      titleWeight: 400,
      bodyWeight: 300,
      titleStyle: 'italic',
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 1, shadowIntensity: 5 },
  },
  {
    id: 'cold-smooth-tasty',
    name: 'Cold & Tasty',
    category: 'dark',
    preview: {
      background: '#3A3A3A',
      titleColor: '#FFFFFF',
      bodyColor: '#A0A0A0',
      linkColor: '#87CEEB',
    },
    typography: {
      titleFont: 'Bebas Neue',
      bodyFont: 'Lato',
      titleWeight: 400,
      bodyWeight: 300,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 10 },
  },
  {
    id: 'start-investing',
    name: 'Start Investing',
    category: 'dark',
    preview: {
      background: '#454545',
      titleColor: '#2ECC71',
      bodyColor: '#FFFFFF',
      linkColor: '#9B59B6',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Inter',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 12, inputRadius: 8, buttonBorderWidth: 1, shadowIntensity: 8 },
  },

  // GRADIENT & MODERN
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    category: 'colorful',
    preview: {
      background: '#FF6B6B',
      backgroundImage: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FEC89A 100%)',
      titleColor: '#FFFFFF',
      bodyColor: '#FFF5E6',
      linkColor: '#FFFFFF',
    },
    typography: {
      titleFont: 'Righteous',
      bodyFont: 'Nunito',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 20 },
  },
  {
    id: 'ocean-gradient',
    name: 'Ocean Gradient',
    category: 'colorful',
    preview: {
      background: '#667eea',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      titleColor: '#FFFFFF',
      bodyColor: '#E8E8FF',
      linkColor: '#FFD700',
    },
    typography: {
      titleFont: 'Poppins',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 20, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 25 },
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    category: 'colorful',
    preview: {
      background: '#11998e',
      backgroundImage: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      titleColor: '#FFFFFF',
      bodyColor: '#E8FFF5',
      linkColor: '#1A1A1A',
    },
    typography: {
      titleFont: 'Comfortaa',
      bodyFont: 'Quicksand',
      titleWeight: 700,
      bodyWeight: 500,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 15 },
  },
  {
    id: 'purple-haze',
    name: 'Purple Haze',
    category: 'dark',
    preview: {
      background: '#1a0a2e',
      backgroundImage: 'linear-gradient(135deg, #1a0a2e 0%, #3d1a5c 50%, #5c2a8a 100%)',
      titleColor: '#E040FB',
      bodyColor: '#CE93D8',
      linkColor: '#FF4081',
    },
    typography: {
      titleFont: 'Audiowide',
      bodyFont: 'Urbanist',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 12, cardRadius: 16, inputRadius: 8, buttonBorderWidth: 0, shadowIntensity: 30 },
    effects: { glow: '0 0 40px rgba(224, 64, 251, 0.3)' },
  },

  // MINIMALIST & CLEAN
  {
    id: 'pure-white',
    name: 'Pure White',
    category: 'light',
    preview: {
      background: '#FFFFFF',
      titleColor: '#000000',
      bodyColor: '#666666',
      linkColor: '#000000',
    },
    typography: {
      titleFont: 'Playfair Display',
      bodyFont: 'Inter',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 0, inputRadius: 0, buttonBorderWidth: 2, shadowIntensity: 0 },
  },
  {
    id: 'soft-beige',
    name: 'Soft Beige',
    category: 'light',
    preview: {
      background: '#F5F5DC',
      titleColor: '#4A4A4A',
      bodyColor: '#6B6B6B',
      linkColor: '#8B7355',
    },
    typography: {
      titleFont: 'Cormorant Garamond',
      bodyFont: 'Lato',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 1, shadowIntensity: 5 },
  },

  // BOLD TYPOGRAPHY
  {
    id: 'headline-bold',
    name: 'Headline Bold',
    category: 'dark',
    preview: {
      background: '#1A1A1A',
      titleColor: '#FFFFFF',
      bodyColor: '#888888',
      linkColor: '#FF4444',
    },
    typography: {
      titleFont: 'Anton',
      bodyFont: 'Roboto',
      titleWeight: 400,
      bodyWeight: 300,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 0, shadowIntensity: 10 },
  },
  {
    id: 'impact-statement',
    name: 'Impact Statement',
    category: 'dark',
    preview: {
      background: '#0D0D0D',
      titleColor: '#FFFFFF',
      bodyColor: '#CCCCCC',
      linkColor: '#00FF00',
    },
    typography: {
      titleFont: 'Archivo Black',
      bodyFont: 'Space Grotesk',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 0, shadowIntensity: 15 },
  },

  // PLAYFUL & DYNAMIC
  {
    id: 'party-time',
    name: 'Party Time!',
    category: 'colorful',
    preview: {
      background: '#FF1493',
      backgroundImage: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 50%, #FFB6C1 100%)',
      titleColor: '#FFFF00',
      bodyColor: '#FFFFFF',
      linkColor: '#00FFFF',
    },
    typography: {
      titleFont: 'Bungee',
      bodyFont: 'Nunito',
      titleWeight: 400,
      bodyWeight: 600,
    },
    ui: { buttonStyle: 'pill', borderRadius: 30, cardRadius: 24, inputRadius: 16, buttonBorderWidth: 0, shadowIntensity: 25 },
  },
  {
    id: 'game-on',
    name: 'Game On!',
    category: 'dark',
    preview: {
      background: '#0a0a0a',
      backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      titleColor: '#00FF88',
      bodyColor: '#00CCFF',
      linkColor: '#FF00FF',
    },
    typography: {
      titleFont: 'Press Start 2P',
      bodyFont: 'Orbitron',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 2, shadowIntensity: 0 },
    effects: { glow: '0 0 20px rgba(0, 255, 136, 0.5)' },
  },
  {
    id: 'disco-fever',
    name: 'Disco Fever',
    category: 'dark',
    preview: {
      background: '#1a1a2e',
      backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      titleColor: '#FFD700',
      bodyColor: '#FF69B4',
      linkColor: '#00CED1',
    },
    typography: {
      titleFont: 'Fascinate Inline',
      bodyFont: 'Poppins',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 16, inputRadius: 10, buttonBorderWidth: 0, shadowIntensity: 30 },
    effects: { glow: '0 0 30px rgba(255, 215, 0, 0.4)' },
  },

  // PROFESSIONAL & CORPORATE
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    category: 'professional',
    preview: {
      background: '#F8FAFC',
      titleColor: '#1E3A5F',
      bodyColor: '#4A5568',
      linkColor: '#2563EB',
    },
    typography: {
      titleFont: 'Lexend',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 6, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 0, shadowIntensity: 8 },
  },
  {
    id: 'law-firm',
    name: 'Law Firm',
    category: 'professional',
    preview: {
      background: '#FAFAFA',
      titleColor: '#1A1A1A',
      bodyColor: '#4A4A4A',
      linkColor: '#8B4513',
    },
    typography: {
      titleFont: 'Libre Baskerville',
      bodyFont: 'Source Serif 4',
      titleWeight: 700,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'square', borderRadius: 0, cardRadius: 4, inputRadius: 2, buttonBorderWidth: 1, shadowIntensity: 5 },
  },
  {
    id: 'medical-trust',
    name: 'Medical Trust',
    category: 'professional',
    preview: {
      background: '#F0F9FF',
      titleColor: '#0C4A6E',
      bodyColor: '#334155',
      linkColor: '#0891B2',
    },
    typography: {
      titleFont: 'Outfit',
      bodyFont: 'Inter',
      titleWeight: 600,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 0, shadowIntensity: 6 },
  },

  // ARTISTIC & EXPRESSIVE
  {
    id: 'street-art',
    name: 'Street Art',
    category: 'colorful',
    preview: {
      background: '#FF6B35',
      backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%)',
      titleColor: '#1A1A1A',
      bodyColor: '#2D2D2D',
      linkColor: '#FFFFFF',
    },
    typography: {
      titleFont: 'Permanent Marker',
      bodyFont: 'Barlow',
      titleWeight: 400,
      bodyWeight: 500,
    },
    ui: { buttonStyle: 'square', borderRadius: 4, cardRadius: 8, inputRadius: 4, buttonBorderWidth: 3, shadowIntensity: 15 },
  },
  {
    id: 'watercolor-dream',
    name: 'Watercolor Dream',
    category: 'light',
    preview: {
      background: '#FFF0F5',
      backgroundImage: 'linear-gradient(135deg, #FFF0F5 0%, #E6E6FA 50%, #F0FFF0 100%)',
      titleColor: '#8B4513',
      bodyColor: '#696969',
      linkColor: '#DA70D6',
    },
    typography: {
      titleFont: 'Satisfy',
      bodyFont: 'Lora',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'pill', borderRadius: 24, cardRadius: 20, inputRadius: 12, buttonBorderWidth: 0, shadowIntensity: 8 },
  },
  {
    id: 'neon-sign',
    name: 'Neon Sign',
    category: 'dark',
    preview: {
      background: '#0a0a0a',
      titleColor: '#FF00FF',
      bodyColor: '#00FFFF',
      linkColor: '#FFFF00',
    },
    typography: {
      titleFont: 'Monoton',
      bodyFont: 'Urbanist',
      titleWeight: 400,
      bodyWeight: 400,
    },
    ui: { buttonStyle: 'rounded', borderRadius: 8, cardRadius: 12, inputRadius: 6, buttonBorderWidth: 2, shadowIntensity: 0 },
    effects: { glow: '0 0 30px rgba(255, 0, 255, 0.5), 0 0 60px rgba(255, 0, 255, 0.3)' },
  },
];

/**
 * Obtenir les presets par catégorie
 */
export const getPresetsByCategory = (category: TypographyPreset['category']): TypographyPreset[] => {
  return TYPOGRAPHY_PRESETS.filter(preset => preset.category === category);
};

/**
 * Obtenir un preset par son ID
 */
export const getPresetById = (id: string): TypographyPreset | undefined => {
  return TYPOGRAPHY_PRESETS.find(preset => preset.id === id);
};

/**
 * Valeurs UI par défaut selon la catégorie du preset
 */
export const getDefaultUIForCategory = (category: TypographyPreset['category']) => {
  switch (category) {
    case 'dark':
      return {
        buttonStyle: 'rounded' as const,
        buttonBorderWidth: 0,
        borderRadius: 12,
        cardRadius: 16,
        inputRadius: 8,
        shadowIntensity: 20,
      };
    case 'light':
      return {
        buttonStyle: 'rounded' as const,
        buttonBorderWidth: 1,
        borderRadius: 8,
        cardRadius: 12,
        inputRadius: 6,
        shadowIntensity: 10,
      };
    case 'colorful':
      return {
        buttonStyle: 'pill' as const,
        buttonBorderWidth: 0,
        borderRadius: 16,
        cardRadius: 20,
        inputRadius: 12,
        shadowIntensity: 15,
      };
    case 'professional':
      return {
        buttonStyle: 'square' as const,
        buttonBorderWidth: 0,
        borderRadius: 4,
        cardRadius: 8,
        inputRadius: 4,
        shadowIntensity: 5,
      };
    default:
      return {
        buttonStyle: 'rounded' as const,
        buttonBorderWidth: 0,
        borderRadius: 12,
        cardRadius: 16,
        inputRadius: 8,
        shadowIntensity: 10,
      };
  }
};

/**
 * Obtenir les valeurs UI complètes pour un preset (avec fallback sur les valeurs par défaut)
 */
export const getPresetUI = (preset: TypographyPreset) => {
  const defaults = getDefaultUIForCategory(preset.category);
  return {
    buttonStyle: preset.ui?.buttonStyle ?? defaults.buttonStyle,
    buttonBorderWidth: preset.ui?.buttonBorderWidth ?? defaults.buttonBorderWidth,
    borderRadius: preset.ui?.borderRadius ?? defaults.borderRadius,
    cardRadius: preset.ui?.cardRadius ?? defaults.cardRadius,
    inputRadius: preset.ui?.inputRadius ?? defaults.inputRadius,
    shadowIntensity: preset.ui?.shadowIntensity ?? defaults.shadowIntensity,
  };
};

/**
 * Appliquer un preset de typographie à une configuration
 */
export const applyTypographyPreset = (preset: TypographyPreset) => {
  const ui = getPresetUI(preset);
  
  return {
    // Pour le titre
    titleStyle: {
      textColor: preset.preview.titleColor,
      fontFamily: preset.typography.titleFont,
      fontWeight: preset.typography.titleWeight,
      isItalic: preset.typography.titleStyle === 'italic',
    },
    // Pour le sous-titre
    subtitleStyle: {
      textColor: preset.preview.bodyColor,
      fontFamily: preset.typography.bodyFont,
      fontWeight: preset.typography.bodyWeight,
    },
    // Couleurs de fond
    backgroundColor: preset.preview.background,
    backgroundGradient: preset.preview.backgroundImage,
    // Couleur des liens/accents
    linkColor: preset.preview.linkColor,
    // UI
    ui,
  };
};

/**
 * Catégories disponibles avec labels
 */
export const PRESET_CATEGORIES = [
  { id: 'dark', label: 'Sombre', icon: '🌙' },
  { id: 'light', label: 'Clair', icon: '☀️' },
  { id: 'colorful', label: 'Coloré', icon: '🎨' },
  { id: 'professional', label: 'Professionnel', icon: '💼' },
] as const;
