// ═══════════════════════════════════════════════════════════
// BIBLIOTHÈQUE D'EFFETS DE TEXTE
// Effets réutilisables pour les titres et sous-titres
// ═══════════════════════════════════════════════════════════

export interface TextEffect {
  id: string;
  name: string;
  description: string;
  category: 'outline' | 'highlight' | 'shadow' | 'gradient' | 'stack' | 'badge';
  preview: string;
  generateHtml: (text: string, options?: TextEffectOptions) => string;
  defaultOptions: TextEffectOptions;
  disabled?: boolean;
}

export interface TextEffectOptions {
  // Couleurs
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  strokeColor?: string;
  gradientAngle?: number;
  // Typographie
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  letterSpacing?: string;
  // Effets spécifiques
  strokeWidth?: string;
  shadowColor?: string;
  shadowBlur?: string;
  shadowOffset?: string;
  shadowType?: 'soft' | 'hard' | 'glow' | 'neon';
  opacity?: number;
  borderRadius?: string;
  padding?: string;
  // Stack effect
  repeatCount?: number;
  stackGap?: string;
  // Rotation / Transform
  rotation?: number;
  skewX?: number;
  skewY?: number;
}

// ═══════════════════════════════════════════════════════════
// EFFETS DISPONIBLES (consolidés 2-en-1)
// ═══════════════════════════════════════════════════════════

export const TEXT_EFFECTS: TextEffect[] = [
  // ─────────────────────────────────────────────────────────
  // CONTOUR (unifié)
  // ─────────────────────────────────────────────────────────
  {
    id: 'outline',
    name: 'Contour',
    description: 'Texte avec contour (épaisseur réglable)',
    category: 'outline',
    preview: 'color: transparent; -webkit-text-stroke: 2px #000;',
    defaultOptions: {
      strokeColor: '#000000',
      strokeWidth: '2px',
      fontWeight: '800',
    },
    generateHtml: (text, options = {}) => {
      const effect = TEXT_EFFECTS.find(e => e.id === 'outline')!;
      const opts = { ...effect.defaultOptions, ...options };
      return `<span style="
        color: transparent;
        -webkit-text-stroke: ${opts.strokeWidth} ${opts.strokeColor};
        font-weight: ${opts.fontWeight};
      ">${text}</span>`;
    },
  },

  // ─────────────────────────────────────────────────────────
  // SURLIGNÉ (unifié - arrondi configurable)
  // ─────────────────────────────────────────────────────────
  {
    id: 'highlight',
    name: 'Surligné',
    description: 'Texte avec fond coloré (arrondi et rotation réglables)',
    category: 'highlight',
    preview: 'background: #a3e635; color: #1a1a1a; padding: 4px 12px;',
    defaultOptions: {
      backgroundColor: '#a3e635',
      primaryColor: '#1a1a1a',
      padding: '4px 12px',
      borderRadius: '0px',
      fontWeight: '800',
      rotation: 0,
    },
    generateHtml: (text, options = {}) => {
      const effect = TEXT_EFFECTS.find(e => e.id === 'highlight')!;
      const opts = { ...effect.defaultOptions, ...options };
      const rotation = opts.rotation ?? 0;
      const transformStyle = rotation !== 0 ? `transform: rotate(${rotation}deg);` : '';
      return `<span style="
        background: ${opts.backgroundColor};
        color: ${opts.primaryColor};
        padding: ${opts.padding};
        border-radius: ${opts.borderRadius};
        font-weight: ${opts.fontWeight};
        display: inline-block;
        ${transformStyle}
      ">${text}</span>`;
    },
  },

  // ─────────────────────────────────────────────────────────
  // OMBRE / NÉON (unifié - type configurable)
  // ─────────────────────────────────────────────────────────
  {
    id: 'shadow',
    name: 'Ombre / Néon',
    description: 'Ombre ou lueur (type: douce, dure, glow, néon)',
    category: 'shadow',
    preview: 'text-shadow: 0 0 20px #ff00de;',
    defaultOptions: {
      primaryColor: '#ffffff',
      shadowColor: '#ff00de',
      shadowBlur: '20px',
      shadowOffset: '4px',
      shadowType: 'glow',
      fontWeight: '700',
    },
    generateHtml: (text, options = {}) => {
      const effect = TEXT_EFFECTS.find(e => e.id === 'shadow')!;
      const opts = { ...effect.defaultOptions, ...options };
      const type = opts.shadowType || 'glow';
      
      let shadowStyle = '';
      switch (type) {
        case 'soft':
          shadowStyle = `0 ${opts.shadowOffset} ${opts.shadowBlur} ${opts.shadowColor}`;
          break;
        case 'hard':
          shadowStyle = `${opts.shadowOffset} ${opts.shadowOffset} 0 ${opts.shadowColor}`;
          break;
        case 'glow':
          shadowStyle = `0 0 20px ${opts.shadowColor}, 0 0 40px ${opts.shadowColor}, 0 0 60px ${opts.shadowColor}`;
          break;
        case 'neon':
          shadowStyle = `0 0 5px ${opts.primaryColor}, 0 0 10px ${opts.primaryColor}, 0 0 20px ${opts.shadowColor}, 0 0 40px ${opts.shadowColor}, 0 0 80px ${opts.shadowColor}`;
          break;
      }
      
      return `<span style="
        color: ${opts.primaryColor};
        text-shadow: ${shadowStyle};
        font-weight: ${opts.fontWeight};
      ">${text}</span>`;
    },
  },

  // ─────────────────────────────────────────────────────────
  // DÉGRADÉ (unifié - angle configurable)
  // ─────────────────────────────────────────────────────────
  {
    id: 'gradient',
    name: 'Dégradé',
    description: 'Dégradé 2 couleurs (horizontal ou vertical)',
    category: 'gradient',
    preview: 'background: linear-gradient(90deg, #f472b6, #8b5cf6); -webkit-background-clip: text; color: transparent;',
    defaultOptions: {
      primaryColor: '#f472b6',
      secondaryColor: '#8b5cf6',
      fontWeight: '800',
      gradientAngle: 90,
    },
    generateHtml: (text, options = {}) => {
      const effect = TEXT_EFFECTS.find(e => e.id === 'gradient')!;
      const opts = { ...effect.defaultOptions, ...options };
      const angle = opts.gradientAngle ?? 90;
      return `<span style="
        background: linear-gradient(${angle}deg, ${opts.primaryColor}, ${opts.secondaryColor || opts.primaryColor});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: ${opts.fontWeight};
      ">${text}</span>`;
    },
  },

  // ─────────────────────────────────────────────────────────
  // EXTRUSION 3D
  // ─────────────────────────────────────────────────────────
  {
    id: '3d-extrude',
    name: 'Extrusion 3D',
    description: 'Effet de texte 3D extrudé',
    category: 'shadow',
    preview: 'text-shadow: 1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000;',
    defaultOptions: {
      primaryColor: '#fbbf24',
      shadowColor: '#92400e',
      fontWeight: '900',
    },
    generateHtml: (text, options = {}) => {
      const effect = TEXT_EFFECTS.find(e => e.id === '3d-extrude')!;
      const opts = { ...effect.defaultOptions, ...options };
      return `<span style="
        color: ${opts.primaryColor};
        text-shadow: 
          1px 1px 0 ${opts.shadowColor},
          2px 2px 0 ${opts.shadowColor},
          3px 3px 0 ${opts.shadowColor},
          4px 4px 0 ${opts.shadowColor};
        font-weight: ${opts.fontWeight};
      ">${text}</span>`;
    },
  },

];

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

export const getEffectById = (id: string): TextEffect | undefined => {
  return TEXT_EFFECTS.find(effect => effect.id === id);
};

export const getEffectsByCategory = (category: TextEffect['category']): TextEffect[] => {
  return TEXT_EFFECTS.filter(effect => effect.category === category);
};

export const applyEffect = (
  effectId: string, 
  text: string, 
  customOptions?: Partial<TextEffectOptions>
): string => {
  const effect = getEffectById(effectId);
  if (!effect) return text;
  return effect.generateHtml(text, { ...effect.defaultOptions, ...customOptions });
};

// Catégories disponibles pour le sélecteur
export const EFFECT_CATEGORIES = [
  { id: 'outline', label: 'Contours', icon: '○' },
  { id: 'highlight', label: 'Surlignage', icon: '█' },
  { id: 'shadow', label: 'Ombres', icon: '◐' },
  { id: 'gradient', label: 'Dégradés', icon: '◑' },
] as const;
