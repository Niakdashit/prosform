import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Palette, Type, Square, Sparkles, Layout, 
  Sun, Moon, Droplets, ChevronRight, Frame, Layers, Wand2
} from "lucide-react";
import { useTheme, GOOGLE_FONTS, COLOR_PRESETS, ThemeSettings } from "@/contexts/ThemeContext";
import { TypographyPresetSelector } from "./TypographyPresetSelector";
import { TypographyPreset, getPresetUI } from "@/utils/typographyPresets";

// Templates prédéfinis pour les jeux
const GAME_TEMPLATES = [
  { id: 'classic-gold', name: 'Classic Gold', colors: { primary: '#F5CA3C', secondary: '#3D3731', accent: '#FFD700' } },
  { id: 'neon-blue', name: 'Neon Blue', colors: { primary: '#00D4FF', secondary: '#0A1628', accent: '#00BFFF' } },
  { id: 'royal-purple', name: 'Royal Purple', colors: { primary: '#8B5CF6', secondary: '#1E1B4B', accent: '#A78BFA' } },
  { id: 'emerald-green', name: 'Emerald Green', colors: { primary: '#10B981', secondary: '#064E3B', accent: '#34D399' } },
  { id: 'sunset-orange', name: 'Sunset Orange', colors: { primary: '#F97316', secondary: '#431407', accent: '#FB923C' } },
  { id: 'cherry-red', name: 'Cherry Red', colors: { primary: '#EF4444', secondary: '#450A0A', accent: '#F87171' } },
  { id: 'ocean-teal', name: 'Ocean Teal', colors: { primary: '#14B8A6', secondary: '#042F2E', accent: '#2DD4BF' } },
  { id: 'midnight-dark', name: 'Midnight Dark', colors: { primary: '#374151', secondary: '#111827', accent: '#6B7280' } },
];

// Styles de bordures pour les éléments de jeu
const BORDER_STYLES = [
  { id: 'gold', name: 'Gold', preview: 'border-4 border-yellow-400 shadow-lg' },
  { id: 'silver', name: 'Silver', preview: 'border-4 border-gray-300' },
  { id: 'neonBlue', name: 'Neon Blue', preview: 'border-4 border-cyan-400 shadow-cyan-400/50' },
  { id: 'neonPink', name: 'Neon Pink', preview: 'border-4 border-pink-500 shadow-pink-500/50' },
  { id: 'rainbow', name: 'Rainbow', preview: 'border-4 border-gradient' },
  { id: 'custom', name: 'Custom', preview: 'border-4 border-dashed' },
];

// Templates Jackpot (frames SVG)
const JACKPOT_TEMPLATES = [
  { id: 'jackpot-3', name: 'Neon Glow', file: 'Jackpot 3.svg' },
  { id: 'jackpot-5', name: 'Retro', file: 'Jackpot 5.svg' },
  { id: 'jackpot-6', name: 'Modern', file: 'Jackpot 6.svg' },
  { id: 'jackpot-8', name: 'Minimal', file: 'Jackpot 8.svg' },
  { id: 'jackpot-9', name: 'Cyber', file: 'Jackpot 9.svg' },
  { id: 'jackpot-10', name: 'Royal', file: 'Jackpot 10.svg' },
  { id: 'jackpot-11', name: 'Diamond', file: 'Jackpot 11.svg' },
];

const ColorPicker = ({ 
  label, 
  value, 
  onChange,
  presets = ['#000000', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#ffffff']
}: { 
  label: string; 
  value: string; 
  onChange: (color: string) => void;
  presets?: string[];
}) => (
  <div className="space-y-2">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <div className="flex gap-2 items-center">
      <div className="flex gap-1 flex-wrap flex-1">
        {presets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
              value === color ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
            }`}
            style={{ backgroundColor: color, boxShadow: color === '#ffffff' ? 'inset 0 0 0 1px #e5e7eb' : 'none' }}
          />
        ))}
      </div>
      <Input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 p-0 border-0 cursor-pointer"
      />
    </div>
  </div>
);

interface ThemeStylePanelProps {
  hideBorders?: boolean;
  hideJackpotSections?: boolean;
}

export const ThemeStylePanel = ({ hideBorders, hideJackpotSections }: ThemeStylePanelProps) => {
  const { theme, updateTheme } = useTheme();
  const [openSections, setOpenSections] = useState<string | undefined>(undefined);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);

  // Helper pour convertir le nom de police en valeur compatible ThemeContext
  const fontNameToValue = (fontName: string): string => {
    const fontMap: Record<string, string> = {
      // Sans-Serif
      'Inter': 'inter',
      'Poppins': 'poppins',
      'Nunito': 'nunito',
      'Montserrat': 'montserrat',
      'Roboto': 'roboto',
      'Open Sans': 'open-sans',
      'Lato': 'lato',
      'Raleway': 'raleway',
      'Work Sans': 'work-sans',
      'DM Sans': 'dm-sans',
      'Space Grotesk': 'space-grotesk',
      'Outfit': 'outfit',
      'Plus Jakarta Sans': 'plus-jakarta-sans',
      'Manrope': 'manrope',
      'Sora': 'sora',
      'Urbanist': 'urbanist',
      'Quicksand': 'quicksand',
      'Rubik': 'rubik',
      'Karla': 'karla',
      'Josefin Sans': 'josefin-sans',
      'Cabin': 'cabin',
      'Barlow': 'barlow',
      'Mulish': 'mulish',
      'Figtree': 'figtree',
      'Albert Sans': 'albert-sans',
      'Red Hat Display': 'red-hat-display',
      'Lexend': 'lexend',
      // Serif
      'Playfair Display': 'playfair-display',
      'Merriweather': 'merriweather',
      'Lora': 'lora',
      'Cormorant Garamond': 'cormorant-garamond',
      'Libre Baskerville': 'libre-baskerville',
      'Crimson Text': 'crimson-text',
      'Source Serif 4': 'source-serif-4',
      'EB Garamond': 'eb-garamond',
      'Spectral': 'spectral',
      'Bitter': 'bitter',
      'Fraunces': 'fraunces',
      'DM Serif Display': 'dm-serif-display',
      'Bodoni Moda': 'bodoni-moda',
      'Cardo': 'cardo',
      'Noto Serif': 'noto-serif',
      // Display
      'Bebas Neue': 'bebas-neue',
      'Anton': 'anton',
      'Oswald': 'oswald',
      'Archivo Black': 'archivo-black',
      'Righteous': 'righteous',
      'Abril Fatface': 'abril-fatface',
      'Alfa Slab One': 'alfa-slab-one',
      'Titan One': 'titan-one',
      'Bungee': 'bungee',
      'Bangers': 'bangers',
      'Comfortaa': 'comfortaa',
      'Fredoka': 'fredoka',
      'Baloo 2': 'baloo-2',
      // Handwriting
      'Permanent Marker': 'permanent-marker',
      'Pacifico': 'pacifico',
      'Lobster': 'lobster',
      'Satisfy': 'satisfy',
      'Dancing Script': 'dancing-script',
      'Great Vibes': 'great-vibes',
      'Caveat': 'caveat',
      'Kalam': 'kalam',
      'Shadows Into Light': 'shadows-into-light',
      'Indie Flower': 'indie-flower',
      'Amatic SC': 'amatic-sc',
      // Futuristic
      'Orbitron': 'orbitron',
      'Audiowide': 'audiowide',
      'Russo One': 'russo-one',
      'Black Ops One': 'black-ops-one',
      'Press Start 2P': 'press-start-2p',
      'Monoton': 'monoton',
      'Fascinate Inline': 'fascinate-inline',
      // Extra
      'Creepster': 'creepster',
      'Rye': 'rye',
      'Comic Neue': 'comic-neue',
      // Monospace
      'JetBrains Mono': 'jetbrains-mono',
      'Fira Code': 'fira-code',
      'Source Code Pro': 'source-code-pro',
      'IBM Plex Mono': 'ibm-plex-mono',
      'Space Mono': 'space-mono',
    };
    return fontMap[fontName] || fontName.toLowerCase().replace(/ /g, '-');
  };

  // Appliquer un preset de typographie
  const handleApplyPreset = (preset: TypographyPreset) => {
    setSelectedPresetId(preset.id);
    
    // Obtenir les valeurs UI du preset (avec fallback sur les valeurs par défaut de la catégorie)
    const ui = getPresetUI(preset);
    
    // Déterminer la couleur du texte du bouton selon le thème
    const isDarkTheme = preset.category === 'dark';
    const isColorfulTheme = preset.category === 'colorful';
    // Pour les thèmes sombres et colorés, le texte du bouton est souvent noir ou blanc selon la couleur du bouton
    const buttonTextColor = isDarkTheme || isColorfulTheme ? '#FFFFFF' : '#FFFFFF';
    
    // Convertir les noms de polices
    const headingFont = fontNameToValue(preset.typography.titleFont);
    const bodyFont = fontNameToValue(preset.typography.bodyFont);
    
    console.log('Applying preset:', preset.name, '| Heading font:', headingFont, '| Body font:', bodyFont);
    
    // Appliquer toutes les propriétés du preset
    updateTheme({
      // ═══════════════════════════════════════════════════════════
      // COULEURS
      // ═══════════════════════════════════════════════════════════
      // Couleurs principales
      textColor: preset.preview.titleColor,
      textSecondaryColor: preset.preview.bodyColor,
      accentColor: preset.preview.linkColor,
      primaryColor: preset.preview.linkColor,
      backgroundColor: preset.preview.background,
      // Couleurs du bouton
      buttonColor: preset.preview.linkColor,
      buttonTextColor: buttonTextColor,
      // Couleurs de surface
      surfaceColor: preset.preview.cardBg || preset.preview.background,
      borderColor: preset.preview.borderColor || preset.preview.bodyColor + '30',
      
      // ═══════════════════════════════════════════════════════════
      // TYPOGRAPHIE
      // ═══════════════════════════════════════════════════════════
      headingFontFamily: headingFont,
      fontFamily: bodyFont,
      headingWeight: preset.typography.titleWeight >= 700 ? 'bold' : preset.typography.titleWeight >= 600 ? 'semibold' : 'medium',
      
      // ═══════════════════════════════════════════════════════════
      // BOUTONS & BORDURES
      // ═══════════════════════════════════════════════════════════
      buttonStyle: ui.buttonStyle,
      buttonBorderWidth: ui.buttonBorderWidth,
      borderRadius: ui.borderRadius,
      cardRadius: ui.cardRadius,
      inputRadius: ui.inputRadius,
      
      // ═══════════════════════════════════════════════════════════
      // EFFETS
      // ═══════════════════════════════════════════════════════════
      shadowIntensity: ui.shadowIntensity,
    });
  };

  return (
      <div className="p-4 space-y-2">
        <Accordion
          type="single"
          collapsible
          value={openSections}
          onValueChange={setOpenSections}
          className="space-y-2"
        >
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* THÈMES PRÉDÉFINIS (Style Gamma) */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <AccordionItem value="themes" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Thèmes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <TypographyPresetSelector
                selectedPresetId={selectedPresetId}
                onSelectPreset={handleApplyPreset}
              />
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PALETTE DE COULEURS */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <AccordionItem value="colors" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Couleurs</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              {/* Presets rapides */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Thèmes prédéfinis</Label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(COLOR_PRESETS).map(([name, colors]) => (
                    <button
                      key={name}
                      onClick={() => updateTheme({
                        // Foncé (accent) = boutons, éléments importants
                        accentColor: colors.accent,
                        buttonColor: colors.accent,
                        // Moyen (primary) = titres, texte principal
                        primaryColor: colors.primary,
                        textColor: colors.primary,
                        textSecondaryColor: colors.primary + '99', // 60% opacity
                        // Clair (secondary) = fonds, surfaces
                        secondaryColor: colors.secondary,
                        surfaceColor: colors.secondary,
                        backgroundColor: colors.secondary,
                      })}
                      className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                        theme.accentColor === colors.accent ? 'border-primary' : 'border-muted'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        <div className="w-3 h-6 rounded-l" style={{ backgroundColor: colors.accent }} />
                        <div className="w-3 h-6" style={{ backgroundColor: colors.primary }} />
                        <div className="w-3 h-6 rounded-r" style={{ backgroundColor: colors.secondary }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground capitalize mt-1 block">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <ColorPicker 
                label="Couleur d'accent (foncé)" 
                value={theme.accentColor} 
                onChange={(c) => updateTheme({ accentColor: c, buttonColor: c })} 
              />
              <ColorPicker 
                label="Couleur des titres (moyen)" 
                value={theme.primaryColor} 
                onChange={(c) => updateTheme({ primaryColor: c, textColor: c })} 
              />
              <ColorPicker 
                label="Couleur des sous-titres" 
                value={theme.textSecondaryColor} 
                onChange={(c) => updateTheme({ textSecondaryColor: c })} 
              />
              <ColorPicker 
                label="Couleur de fond" 
                value={theme.backgroundColor} 
                onChange={(c) => updateTheme({ backgroundColor: c, surfaceColor: c, secondaryColor: c })} 
              />
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TYPOGRAPHIE */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <AccordionItem value="typography" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Typographie</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Police principale</Label>
                <Select value={theme.fontFamily} onValueChange={(v) => updateTheme({ fontFamily: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.label }}>{font.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">({font.category})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Police des titres</Label>
                <Select value={theme.headingFontFamily} onValueChange={(v) => updateTheme({ headingFontFamily: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.label }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Taille des titres: {theme.headingSize}px</Label>
                <Slider
                  value={[theme.headingSize]}
                  onValueChange={([v]) => updateTheme({ headingSize: v })}
                  min={24} max={48} step={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Graisse des titres</Label>
                <Select value={theme.headingWeight} onValueChange={(v: any) => updateTheme({ headingWeight: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="semibold">Semi-bold</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="extrabold">Extra-bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* BOUTONS */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <AccordionItem value="buttons" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Boutons</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['square', 'rounded', 'pill'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => updateTheme({ buttonStyle: style })}
                      className={`p-3 transition-all ${
                        theme.buttonStyle === style ? 'bg-primary/10' : ''
                      }`}
                      style={{ borderRadius: '8px' }}
                    >
                      <div 
                        className={`h-6 ${theme.buttonStyle === style ? 'bg-primary/40' : 'bg-muted-foreground/20'}`}
                        style={{ borderRadius: style === 'square' ? '0px' : style === 'rounded' ? '4px' : '9999px' }}
                      />
                      <span className={`text-[10px] capitalize mt-1 block ${theme.buttonStyle === style ? 'text-primary' : 'text-muted-foreground'}`}>{style}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Taille</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateTheme({ buttonSize: size })}
                      className={`py-2 px-3 border-2 rounded-lg transition-all text-xs ${
                        theme.buttonSize === size ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                    >
                      {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
                    </button>
                  ))}
                </div>
              </div>

              <ColorPicker 
                label="Couleur du bouton" 
                value={theme.buttonColor} 
                onChange={(c) => updateTheme({ buttonColor: c })} 
              />
              <ColorPicker 
                label="Couleur du texte" 
                value={theme.buttonTextColor} 
                onChange={(c) => updateTheme({ buttonTextColor: c })} 
                presets={['#ffffff', '#000000', '#374151', '#f3f4f6']}
              />

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Bordure: {theme.buttonBorderWidth}px</Label>
                <Slider
                  value={[theme.buttonBorderWidth]}
                  onValueChange={([v]) => updateTheme({ buttonBorderWidth: v })}
                  min={0} max={4} step={1}
                />
              </div>

              {theme.buttonBorderWidth > 0 && (
                <ColorPicker 
                  label="Couleur de bordure" 
                  value={theme.borderColor} 
                  onChange={(c) => updateTheme({ borderColor: c })} 
                  presets={['#ffffff', '#000000', '#374151', '#e5e7eb']}
                />
              )}

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Ombre</Label>
                <Select value={theme.buttonShadow} onValueChange={(v: any) => updateTheme({ buttonShadow: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="sm">Légère</SelectItem>
                    <SelectItem value="md">Moyenne</SelectItem>
                    <SelectItem value="lg">Forte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* DÉGRADÉS */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <AccordionItem value="gradients" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Dégradés</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Activer les dégradés</Label>
                <Switch 
                  checked={theme.enableGradient} 
                  onCheckedChange={(v) => updateTheme({ enableGradient: v })}
                />
              </div>

              {theme.enableGradient && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['linear', 'radial'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => updateTheme({ gradientType: type })}
                          className={`py-2 px-3 border-2 rounded-lg transition-all text-xs capitalize ${
                            theme.gradientType === type ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                        >
                          {type === 'linear' ? 'Linéaire' : 'Radial'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {theme.gradientType === 'linear' && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Angle: {theme.gradientAngle}°</Label>
                      <Slider
                        value={[theme.gradientAngle]}
                        onValueChange={([v]) => updateTheme({ gradientAngle: v })}
                        min={0} max={360} step={15}
                      />
                    </div>
                  )}

                  <ColorPicker 
                    label="Couleur de départ" 
                    value={theme.gradientStartColor} 
                    onChange={(c) => updateTheme({ gradientStartColor: c })} 
                  />
                  <ColorPicker 
                    label="Couleur d'arrivée" 
                    value={theme.gradientEndColor} 
                    onChange={(c) => updateTheme({ gradientEndColor: c })} 
                  />

                  <div 
                    className="h-12 rounded-lg"
                    style={{
                      background: theme.gradientType === 'linear'
                        ? `linear-gradient(${theme.gradientAngle}deg, ${theme.gradientStartColor}, ${theme.gradientEndColor})`
                        : `radial-gradient(circle, ${theme.gradientStartColor}, ${theme.gradientEndColor})`
                    }}
                  />
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ESPACEMENT & LAYOUT */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <AccordionItem value="spacing" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Espacement</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Border radius: {theme.borderRadius}px</Label>
                <Slider
                  value={[theme.borderRadius]}
                  onValueChange={([v]) => updateTheme({ borderRadius: v })}
                  min={0} max={24} step={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Padding des cartes: {theme.cardPadding}px</Label>
                <Slider
                  value={[theme.cardPadding]}
                  onValueChange={([v]) => updateTheme({ cardPadding: v })}
                  min={12} max={48} step={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Marges: {theme.pageMargins}px</Label>
                <Slider
                  value={[theme.pageMargins]}
                  onValueChange={([v]) => updateTheme({ pageMargins: v })}
                  min={16} max={64} step={8}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* EFFETS */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <AccordionItem value="effects" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Effets</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Intensité des ombres: {theme.shadowIntensity}%</Label>
                <Slider
                  value={[theme.shadowIntensity]}
                  onValueChange={([v]) => updateTheme({ shadowIntensity: v })}
                  min={0} max={50} step={5}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Vitesse des animations</Label>
                <Select value={theme.animationSpeed} onValueChange={(v: any) => updateTheme({ animationSpeed: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Désactivées</SelectItem>
                    <SelectItem value="slow">Lentes</SelectItem>
                    <SelectItem value="normal">Normales</SelectItem>
                    <SelectItem value="fast">Rapides</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TEMPLATES JACKPOT */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {!hideJackpotSections && (
          <AccordionItem value="jackpot-templates" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Templates Jackpot</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Style de machine</Label>
                <div className="grid grid-cols-2 gap-3">
                  {JACKPOT_TEMPLATES.map((template) => {
                    const isModernActive = template.id === 'jackpot-6' && theme.jackpotTemplate === 'jackpot-6';
                    return (
                      <>
                        <div key={template.id} className="space-y-2">
                          <button
                            onClick={() => updateTheme({ jackpotTemplate: template.id as any })}
                            className={`w-full p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                              theme.jackpotTemplate === template.id ? 'border-primary bg-primary/5' : 'border-muted'
                            }`}
                          >
                            <div className="w-full h-16 flex items-center justify-center overflow-hidden rounded">
                              <img 
                                src={`/assets/slot-frames/${template.file}`} 
                                alt={template.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 block text-center font-medium">{template.name}</span>
                          </button>
                        </div>

                        {/* Panneau de couleurs Moderne sur une ligne entière juste après la ligne Rétro/Moderne */}
                        {isModernActive && (
                          <div className="col-span-2 space-y-2 rounded-lg border border-dashed border-muted p-2 bg-muted/30">
                            <Label className="text-[10px] text-muted-foreground block mb-1">Couleurs du template Moderne</Label>
                            <ColorPicker
                              label="Couleur du cadre"
                              value={theme.modernJackpotFrameColor}
                              onChange={(c) => updateTheme({ modernJackpotFrameColor: c })}
                            />
                            <ColorPicker
                              label="Couleur intérieure"
                              value={theme.modernJackpotInnerColor}
                              onChange={(c) => updateTheme({ modernJackpotInnerColor: c })}
                            />
                          </div>
                        )}
                      </>
                    );
                  })}
                </div>
              </div>

              {/* Kit personnalisé */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Kit personnalisé</Label>
                <div className="space-y-2">
                  <label className="block">
                    <div
                      className="w-full h-16 rounded-lg border border-dashed border-muted flex items-center justify-center bg-muted/40 cursor-pointer overflow-hidden"
                      onClick={() => {
                        const input = document.getElementById('custom-jackpot-frame-input') as HTMLInputElement | null;
                        input?.click();
                      }}
                    >
                      {theme.customJackpotFrame ? (
                        <img
                          src={theme.customJackpotFrame}
                          alt="Kit personnalisé"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-muted-foreground text-center px-4">
                          Importer un kit visuel (500x500) pour votre machine personnalisée
                        </span>
                      )}
                    </div>
                    <input
                      id="custom-jackpot-frame-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const dataUrl = reader.result as string;
                          updateTheme({ customJackpotFrame: dataUrl, jackpotTemplate: 'jackpot-custom' as any });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* STYLES DE BORDURES */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <AccordionItem value="borders" className="border rounded-lg px-3">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Frame className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Bordures</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Style de bordure (Roue/Jackpot)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {BORDER_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => updateTheme({ wheelBorderStyle: style.id as any })}
                      className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                        theme.wheelBorderStyle === style.id ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                    >
                      <div 
                        className="w-full h-8 rounded-md"
                        style={{ 
                          borderWidth: '3px',
                          borderStyle: style.id === 'custom' ? 'dashed' : 'solid',
                          borderColor: style.id === 'gold' ? '#F5CA3C' 
                            : style.id === 'silver' ? '#C0C0C0'
                            : style.id === 'neonBlue' ? '#00D4FF'
                            : style.id === 'neonPink' ? '#EC4899'
                            : style.id === 'rainbow' ? '#F5CA3C'
                            : style.id === 'royalRoulette' ? '#B45309'
                            : style.id === 'custom' ? theme.wheelBorderCustomColor || '#374151'
                            : '#F5CA3C',
                          boxShadow: style.id === 'neonBlue' ? '0 0 10px #00D4FF'
                            : style.id === 'neonPink' ? '0 0 10px #EC4899'
                            : 'none'
                        }}
                      />
                      <span className="text-[9px] text-muted-foreground mt-1 block text-center">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {theme.wheelBorderStyle === 'custom' && (
                <ColorPicker 
                  label="Couleur personnalisée" 
                  value={theme.wheelBorderCustomColor || '#374151'} 
                  onChange={(c) => updateTheme({ wheelBorderCustomColor: c })} 
                />
              )}

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Épaisseur des bordures: {theme.borderWidth}px</Label>
                <Slider
                  value={[theme.borderWidth]}
                  onValueChange={([v]) => updateTheme({ borderWidth: v })}
                  min={0} max={8} step={1}
                />
              </div>

              <ColorPicker 
                label="Couleur des bordures" 
                value={theme.borderColor} 
                onChange={(c) => updateTheme({ borderColor: c })} 
              />
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
  );
};

export default ThemeStylePanel;
