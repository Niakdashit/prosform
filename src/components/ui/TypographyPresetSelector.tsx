import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  TYPOGRAPHY_PRESETS, 
  PRESET_CATEGORIES, 
  TypographyPreset,
  getPresetsByCategory 
} from '@/utils/typographyPresets';
import { Check, Shuffle } from 'lucide-react';

// Liste des polices Google Fonts utilisées dans les presets
const GOOGLE_FONTS_TO_LOAD = [
  'Inter:wght@400;500;600;700;800',
  'Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700',
  'Poppins:wght@400;500;600;700;800',
  'Nunito:wght@400;600;700;800',
  'Space+Grotesk:wght@400;500;600;700',
  'Lato:wght@300;400;700',
  'Merriweather:wght@400;700',
  'Montserrat:wght@400;500;600;700;800;900',
  'Roboto:wght@300;400;500;700',
  'Open+Sans:wght@400;600;700',
  'Raleway:wght@400;500;600;700',
  'Lora:wght@400;500;600;700',
  'Work+Sans:wght@400;500;600;700',
  'DM+Sans:wght@400;500;600;700',
];

// Hook pour charger les Google Fonts
const useGoogleFonts = () => {
  useEffect(() => {
    const linkId = 'typography-presets-fonts';
    
    // Vérifier si le lien existe déjà
    if (document.getElementById(linkId)) return;
    
    // Créer le lien pour charger les fonts
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${GOOGLE_FONTS_TO_LOAD.map(f => `family=${f}`).join('&')}&display=swap`;
    
    document.head.appendChild(link);
    
    return () => {
      // Ne pas supprimer le lien au démontage pour éviter le rechargement
    };
  }, []);
};

interface TypographyPresetSelectorProps {
  selectedPresetId?: string;
  onSelectPreset: (preset: TypographyPreset) => void;
  className?: string;
}

export const TypographyPresetSelector = ({
  selectedPresetId,
  onSelectPreset,
  className,
}: TypographyPresetSelectorProps) => {
  // Charger les Google Fonts au montage du composant
  useGoogleFonts();
  
  const [activeCategory, setActiveCategory] = useState<'dark' | 'light' | 'colorful' | 'professional'>('dark');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = searchQuery
    ? TYPOGRAPHY_PRESETS.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getPresetsByCategory(activeCategory);

  const handleRandomPreset = () => {
    const randomIndex = Math.floor(Math.random() * TYPOGRAPHY_PRESETS.length);
    onSelectPreset(TYPOGRAPHY_PRESETS[randomIndex]);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher un thème..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 px-3 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={handleRandomPreset}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted/50 transition-colors"
          title="Thème aléatoire"
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>

      {/* Category tabs */}
      {!searchQuery && (
        <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
          {PRESET_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
              className={cn(
                'flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all',
                activeCategory === cat.id
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Presets grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
        {filteredPresets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isSelected={selectedPresetId === preset.id}
            onClick={() => onSelectPreset(preset)}
          />
        ))}
      </div>
    </div>
  );
};

interface PresetCardProps {
  preset: TypographyPreset;
  isSelected: boolean;
  onClick: () => void;
}

// Helper pour obtenir le font-family CSS correct
const getFontFamilyCSS = (fontName: string): string => {
  // Map des noms de polices vers leur font-family CSS
  const fontMap: Record<string, string> = {
    'Inter': '"Inter", sans-serif',
    'Playfair Display': '"Playfair Display", serif',
    'Poppins': '"Poppins", sans-serif',
    'Nunito': '"Nunito", sans-serif',
    'Space Grotesk': '"Space Grotesk", sans-serif',
    'Lato': '"Lato", sans-serif',
    'Merriweather': '"Merriweather", serif',
    'Montserrat': '"Montserrat", sans-serif',
    'Roboto': '"Roboto", sans-serif',
    'Open Sans': '"Open Sans", sans-serif',
    'Raleway': '"Raleway", sans-serif',
    'Lora': '"Lora", serif',
    'Work Sans': '"Work Sans", sans-serif',
    'DM Sans': '"DM Sans", sans-serif',
  };
  return fontMap[fontName] || `"${fontName}", sans-serif`;
};

const PresetCard = ({ preset, isSelected, onClick }: PresetCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative group rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.02]',
        isSelected 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'border-transparent hover:border-muted-foreground/30'
      )}
    >
      {/* Preview card */}
      <div
        className="aspect-[4/3] p-3 flex flex-col justify-center"
        style={{
          background: preset.preview.backgroundImage || preset.preview.background,
        }}
      >
        {/* Card inner (if has cardBg) */}
        {preset.preview.cardBg ? (
          <div
            className="rounded-lg p-2.5 flex flex-col gap-1"
            style={{
              backgroundColor: preset.preview.cardBg,
              border: preset.preview.borderColor ? `1px solid ${preset.preview.borderColor}` : undefined,
            }}
          >
            <span
              className="text-sm leading-tight"
              style={{
                color: preset.preview.titleColor,
                fontFamily: getFontFamilyCSS(preset.typography.titleFont),
                fontWeight: preset.typography.titleWeight,
                fontStyle: preset.typography.titleStyle,
              }}
            >
              Title
            </span>
            <span
              className="text-[10px] leading-tight"
              style={{
                color: preset.preview.bodyColor,
                fontFamily: getFontFamilyCSS(preset.typography.bodyFont),
                fontWeight: preset.typography.bodyWeight,
              }}
            >
              Body & <span style={{ color: preset.preview.linkColor, textDecoration: 'underline' }}>link</span>
            </span>
          </div>
        ) : (
          <>
            <span
              className="text-base leading-tight"
              style={{
                color: preset.preview.titleColor,
                fontFamily: getFontFamilyCSS(preset.typography.titleFont),
                fontWeight: preset.typography.titleWeight,
                fontStyle: preset.typography.titleStyle,
                textShadow: preset.effects?.titleShadow,
              }}
            >
              Title
            </span>
            <span
              className="text-[11px] mt-1"
              style={{
                color: preset.preview.bodyColor,
                fontFamily: getFontFamilyCSS(preset.typography.bodyFont),
                fontWeight: preset.typography.bodyWeight,
              }}
            >
              Body & <span style={{ color: preset.preview.linkColor, textDecoration: 'underline' }}>link</span>
            </span>
          </>
        )}
      </div>

      {/* Name label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
        <span className="text-[10px] font-medium text-white flex items-center gap-1">
          {isSelected && <Check className="w-3 h-3" />}
          {preset.name}
        </span>
      </div>
    </button>
  );
};

export default TypographyPresetSelector;
