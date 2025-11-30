/**
 * Utilitaire pour extraire les couleurs dominantes d'une image (logo)
 * et générer une palette de marque cohérente
 */

export interface BrandPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  buttonBg: string;
  buttonText: string;
  // Couleurs additionnelles pour les segments de roue, etc.
  palette: string[];
}

/**
 * Extrait les couleurs dominantes d'une image
 */
export async function extractColorsFromImage(imageUrl: string, numColors: number = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Réduire la taille pour accélérer le traitement
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Collecter les couleurs (ignorer les pixels transparents et très clairs/foncés)
        const colorCounts: Map<string, number> = new Map();
        
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          
          // Ignorer les pixels transparents
          if (a < 128) continue;
          
          // Ignorer les couleurs très claires (blanc) ou très foncées (noir)
          const brightness = (r + g + b) / 3;
          if (brightness > 240 || brightness < 15) continue;
          
          // Quantifier les couleurs (réduire la précision pour grouper les similaires)
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          
          const colorKey = `${qr},${qg},${qb}`;
          colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
        }

        // Trier par fréquence et prendre les N premières
        const sortedColors = Array.from(colorCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, numColors)
          .map(([color]) => {
            const [r, g, b] = color.split(',').map(Number);
            return rgbToHex(r, g, b);
          });

        resolve(sortedColors.length > 0 ? sortedColors : ['#6366f1']);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

/**
 * Génère une palette de marque complète à partir des couleurs extraites
 */
export function generateBrandPalette(dominantColors: string[]): BrandPalette {
  const primary = dominantColors[0] || '#6366f1';
  const secondary = dominantColors[1] || adjustColor(primary, -30);
  const accent = dominantColors[2] || getComplementaryColor(primary);
  
  // Déterminer si le thème doit être clair ou foncé basé sur la couleur primaire
  const isDark = isColorDark(primary);
  
  return {
    primary,
    secondary,
    accent,
    background: isDark ? '#ffffff' : '#0f0f0f',
    text: isDark ? '#1f2937' : '#ffffff',
    buttonBg: primary,
    buttonText: isDark ? '#ffffff' : '#000000',
    palette: generateColorPalette(primary, 6),
  };
}

/**
 * Génère une palette de couleurs pour les segments de roue, etc.
 */
function generateColorPalette(baseColor: string, count: number): string[] {
  const colors: string[] = [baseColor];
  const hsl = hexToHsl(baseColor);
  
  // Générer des variations de teinte
  for (let i = 1; i < count; i++) {
    const newHue = (hsl.h + (360 / count) * i) % 360;
    colors.push(hslToHex(newHue, hsl.s, hsl.l));
  }
  
  return colors;
}

/**
 * Obtient la couleur complémentaire
 */
function getComplementaryColor(hex: string): string {
  const hsl = hexToHsl(hex);
  const complementaryHue = (hsl.h + 180) % 360;
  return hslToHex(complementaryHue, hsl.s, hsl.l);
}

/**
 * Ajuste la luminosité d'une couleur
 */
function adjustColor(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  const newL = Math.max(0, Math.min(100, hsl.l + amount));
  return hslToHex(hsl.h, hsl.s, newL);
}

/**
 * Détermine si une couleur est foncée
 */
function isColorDark(hex: string): boolean {
  const rgb = hexToRgb(hex);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness < 128;
}

/**
 * Convertit RGB en HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convertit HEX en RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 99, g: 102, b: 241 };
}

/**
 * Convertit HEX en HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convertit HSL en HEX
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

/**
 * Suggère une police adaptée au style de la marque
 */
export function suggestFontStyle(palette: BrandPalette): {
  headingFont: string;
  bodyFont: string;
  style: 'modern' | 'classic' | 'playful' | 'elegant' | 'bold';
} {
  const hsl = hexToHsl(palette.primary);
  
  // Déterminer le style basé sur les caractéristiques de la couleur
  if (hsl.s < 20) {
    // Couleurs désaturées = élégant/minimaliste
    return { headingFont: 'Playfair Display', bodyFont: 'Inter', style: 'elegant' };
  } else if (hsl.l > 60) {
    // Couleurs claires = playful
    return { headingFont: 'Nunito', bodyFont: 'Open Sans', style: 'playful' };
  } else if (hsl.h >= 0 && hsl.h <= 30) {
    // Rouge/Orange = bold
    return { headingFont: 'Montserrat', bodyFont: 'Roboto', style: 'bold' };
  } else if (hsl.h >= 200 && hsl.h <= 260) {
    // Bleu = corporate/modern
    return { headingFont: 'Poppins', bodyFont: 'Inter', style: 'modern' };
  } else {
    // Autres = classic
    return { headingFont: 'Merriweather', bodyFont: 'Source Sans Pro', style: 'classic' };
  }
}
