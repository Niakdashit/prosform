import { useState, useRef, useEffect } from "react";
import { Send, Mic, Loader2, X, Check, ImagePlus, Palette, Sparkles, Layers, ChevronDown, Eye } from "lucide-react";
import { AIService, AIAction, UploadedMedia } from "@/services/AIService";
import { toast } from "sonner";
import { extractColorsFromImage, generateBrandPalette, suggestFontStyle, BrandPalette } from "@/utils/colorExtractor";
import { BRAND_STYLES, BrandStyle, getRecommendedStyle, applyBrandStyleToConfig } from "@/utils/brandStyles";

// Re-export pour utilisation dans les builders
export type { BrandPalette, BrandStyle };

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: AIAction[];
  actionsApplied?: boolean;
  attachedMedia?: UploadedMedia[];
}

interface ChatToCreateProps {
  onSend?: (message: string) => void;
  onApplyActions?: (actions: AIAction[]) => void;
  onBrandPaletteExtracted?: (palette: BrandPalette) => void;
  onBrandStyleApplied?: (style: BrandStyle) => void;
  placeholder?: string;
  context?: string;
}

// Helper pour afficher les actions de manière lisible
const getActionDescription = (action: AIAction): { icon: React.ReactNode; label: string; detail?: string } => {
  switch (action.type) {
    case 'update_title':
      return { icon: null, label: 'Titre', detail: `"${action.value}"` };
    case 'update_subtitle':
      return { icon: null, label: 'Sous-titre', detail: `"${action.value}"` };
    case 'update_button':
      return { icon: null, label: 'Bouton', detail: `"${action.value}"` };
    case 'add_field':
      return { icon: null, label: 'Ajouter champ', detail: typeof action.value === 'object' && 'label' in action.value ? action.value.label : '' };
    case 'remove_field':
      return { icon: null, label: 'Supprimer champ', detail: `"${action.value}"` };
    case 'update_fields':
      return { icon: null, label: 'Formulaire', detail: `${Array.isArray(action.value) ? action.value.length : 0} champs` };
    case 'update_segments':
      return { icon: <Palette className="w-3 h-3" />, label: 'Segments roue', detail: `${Array.isArray(action.value) ? action.value.length : 0} segments` };
    case 'update_quiz_questions':
      return { icon: <Layers className="w-3 h-3" />, label: 'Questions quiz', detail: `${Array.isArray(action.value) ? action.value.length : 0} questions` };
    case 'update_scratch_cards':
      return { icon: <Layers className="w-3 h-3" />, label: 'Cartes scratch', detail: `${Array.isArray(action.value) ? action.value.length : 0} cartes` };
    case 'update_jackpot_symbols':
      return { icon: <Layers className="w-3 h-3" />, label: 'Symboles jackpot', detail: `${Array.isArray(action.value) ? action.value.length : 0} symboles` };
    case 'apply_template':
      return { icon: <Sparkles className="w-3 h-3" />, label: 'Template', detail: action.value };
    case 'update_theme_colors':
      return { icon: <Palette className="w-3 h-3" />, label: 'Thème couleurs', detail: 'palette personnalisée' };
    case 'set_logo':
      return { icon: <ImagePlus className="w-3 h-3" />, label: 'Logo', detail: 'ajouté' };
    case 'set_background_image':
      return { icon: <ImagePlus className="w-3 h-3" />, label: 'Image fond', detail: action.view || '' };
    case 'update_prizes':
      return { icon: <Sparkles className="w-3 h-3" />, label: 'Prix', detail: `${Array.isArray(action.value) ? action.value.length : 0} prix configurés` };
    case 'full_config':
      const config = action.value as any;
      const parts = [];
      if (config?.template) parts.push(`Style ${config.template}`);
      if (config?.segments) parts.push(`${config.segments.length} segments`);
      if (config?.prizes) parts.push(`${config.prizes.length} prix`);
      if (config?.questions) parts.push(`${config.questions.length} questions`);
      return { 
        icon: <Sparkles className="w-3 h-3" />, 
        label: 'Campagne complète', 
        detail: parts.length > 0 ? parts.join(', ') : 'configuration personnalisée'
      };
    default:
      return { icon: null, label: action.type, detail: '' };
  }
};

export const ChatToCreate = ({ onSend, onApplyActions, onBrandPaletteExtracted, onBrandStyleApplied, placeholder = "Chat to create", context }: ChatToCreateProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [extractedPalette, setExtractedPalette] = useState<BrandPalette | null>(null);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<BrandStyle | null>(null);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [previewStyle, setPreviewStyle] = useState<BrandStyle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fermer quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expanded && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  // Gérer l'upload de fichiers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        const isLogo = file.name.toLowerCase().includes('logo');
        const isVideo = file.type.startsWith('video/');
        
        const media: UploadedMedia = {
          id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: isLogo ? 'logo' : (isVideo ? 'video' : 'image'),
          url,
          name: file.name
        };
        
        setUploadedMedia(prev => [...prev, media]);
        
        // Si c'est un logo, extraire les couleurs de la marque
        if (isLogo && !isVideo) {
          setIsExtractingColors(true);
          try {
            const colors = await extractColorsFromImage(url, 5);
            const palette = generateBrandPalette(colors);
            const fontStyle = suggestFontStyle(palette);
            
            setExtractedPalette(palette);
            
            // Notifier le parent de la palette extraite
            if (onBrandPaletteExtracted) {
              onBrandPaletteExtracted(palette);
            }
            
            toast.success(
              <div className="flex flex-col gap-1">
                <span className="font-medium">🎨 Couleurs de marque extraites !</span>
                <div className="flex gap-1">
                  {palette.palette.slice(0, 5).map((color, i) => (
                    <div 
                      key={i} 
                      className="w-4 h-4 rounded-full border border-white/20" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Style suggéré: {fontStyle.style}</span>
              </div>
            );
          } catch (err) {
            console.warn('Impossible d\'extraire les couleurs:', err);
            toast.error('Impossible d\'extraire les couleurs du logo');
          } finally {
            setIsExtractingColors(false);
          }
        } else {
          toast.success(`${isLogo ? 'Logo' : 'Image'} ajouté(e) !`);
        }
      };
      
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (id: string) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Construire le contexte enrichi avec les médias ET la palette de marque
    let enrichedContext = context || '';
    
    // Ajouter les informations sur les médias
    if (uploadedMedia.length > 0) {
      const logo = uploadedMedia.find(m => m.type === 'logo');
      const images = uploadedMedia.filter(m => m.type === 'image');
      const videos = uploadedMedia.filter(m => m.type === 'video');
      
      let mediaContext = '\n\n## MÉDIAS FOURNIS PAR L\'UTILISATEUR:';
      
      if (logo) {
        mediaContext += `\n- LOGO: "${logo.name}" - Utilise-le comme image principale sur l'écran d'accueil`;
      }
      
      if (images.length > 0) {
        mediaContext += `\n- IMAGES (${images.length}):`;
        images.forEach((img, i) => {
          const views = ['welcome', 'contact', 'ending-win'];
          mediaContext += `\n  • "${img.name}" → Utiliser sur l'écran ${views[i % views.length]}`;
        });
      }
      
      if (videos.length > 0) {
        mediaContext += `\n- VIDÉOS: ${videos.map(v => v.name).join(', ')}`;
      }
      
      enrichedContext += mediaContext;
    }
    
    // Ajouter la palette de marque extraite du logo
    if (extractedPalette) {
      enrichedContext += `\n\n## PALETTE DE MARQUE EXTRAITE DU LOGO:
- Couleur primaire: ${extractedPalette.primary}
- Couleur secondaire: ${extractedPalette.secondary}
- Couleur accent: ${extractedPalette.accent}
- Fond: ${extractedPalette.background}
- Texte: ${extractedPalette.text}
- Palette pour segments: ${extractedPalette.palette.join(', ')}

IMPORTANT: Utilise ces couleurs pour brander toute la campagne:
- Segments de roue avec les couleurs de la palette
- Boutons avec la couleur primaire
- Textes avec les bonnes couleurs de contraste
- Univers visuel cohérent avec la marque`;
    }
    
    // Ajouter le style prédéfini sélectionné
    if (selectedStyle) {
      enrichedContext += `\n\n## STYLE PRÉDÉFINI SÉLECTIONNÉ: ${selectedStyle.name}
- Couleur primaire: ${selectedStyle.colors.primary}
- Couleur secondaire: ${selectedStyle.colors.secondary}
- Couleur accent: ${selectedStyle.colors.accent}
- Fond: ${selectedStyle.colors.background}
- Texte: ${selectedStyle.colors.text}
- Couleurs des segments: ${selectedStyle.segmentColors.join(', ')}
- Police titres: ${selectedStyle.typography.headingFont}
- Police corps: ${selectedStyle.typography.bodyFont}
- Style boutons: fond ${selectedStyle.colors.buttonBg}, texte ${selectedStyle.colors.buttonText}

IMPORTANT: Applique ce style à TOUTE la campagne pour une cohérence visuelle parfaite!`;
    }

    const userMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: trimmed,
      attachedMedia: uploadedMedia.length > 0 ? [...uploadedMedia] : undefined,
    };

    setExpanded(true);
    setInput("");
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Appel à l'IA avec contexte enrichi
    const response = await AIService.chat(trimmed, enrichedContext);
    
    // Enrichir les actions avec les médias et la palette
    let actions = response.actions || [];
    
    if (actions.length > 0) {
      const logo = uploadedMedia.find(m => m.type === 'logo');
      const images = uploadedMedia.filter(m => m.type === 'image');
      
      actions = actions.map(action => {
        if (action.type === 'full_config' && typeof action.value === 'object') {
          const config = action.value as any;
          
          // Ajouter le logo comme image principale
          if (logo) {
            config.logo = logo.url;
            if (config.welcomeScreen) {
              config.welcomeScreen.image = logo.url;
              config.welcomeScreen.showImage = true;
            }
          }
          
          // Distribuer les images intelligemment
          if (images.length > 0) {
            // Première image = background pour tous les écrans
            const bgImage = images[0]?.url;
            if (bgImage) {
              if (config.welcomeScreen) {
                config.welcomeScreen.backgroundImage = bgImage;
                config.welcomeScreen.applyBackgroundToAll = true;
                // Si pas de logo, utiliser l'image comme image principale aussi
                if (!logo) {
                  config.welcomeScreen.image = bgImage;
                  config.welcomeScreen.showImage = true;
                }
              }
              // Appliquer à tous les écrans
              if (config.contactForm) config.contactForm.backgroundImage = bgImage;
              if (config.wheelScreen) config.wheelScreen.backgroundImage = bgImage;
              if (config.endingWin) config.endingWin.backgroundImage = bgImage;
              if (config.endingLose) config.endingLose.backgroundImage = bgImage;
            }
            
            // Images supplémentaires pour les écrans de fin
            if (images[1] && config.endingWin) {
              config.endingWin.image = images[1].url;
              config.endingWin.showImage = true;
            }
            if (images[2] && config.endingLose) {
              config.endingLose.image = images[2].url;
              config.endingLose.showImage = true;
            }
          }
          
          // Appliquer la palette de marque extraite (priorité sur le style)
          if (extractedPalette) {
            config.themeColors = {
              primary: extractedPalette.primary,
              secondary: extractedPalette.secondary,
              accent: extractedPalette.accent,
              background: extractedPalette.background,
              text: extractedPalette.text,
            };
            
            // Appliquer les couleurs aux segments
            if (config.segments) {
              config.segments = config.segments.map((seg: any, i: number) => ({
                ...seg,
                color: extractedPalette.palette[i % extractedPalette.palette.length],
                textColor: extractedPalette.text === '#ffffff' ? '#ffffff' : '#000000'
              }));
            }
          } 
          // Sinon appliquer le style prédéfini sélectionné
          else if (selectedStyle) {
            config.themeColors = {
              primary: selectedStyle.colors.primary,
              secondary: selectedStyle.colors.secondary,
              accent: selectedStyle.colors.accent,
              background: selectedStyle.colors.background,
              text: selectedStyle.colors.text,
            };
            config.brandStyle = {
              headingFont: selectedStyle.typography.headingFont,
              bodyFont: selectedStyle.typography.bodyFont,
              buttonBg: selectedStyle.colors.buttonBg,
              buttonText: selectedStyle.colors.buttonText,
              borderRadius: selectedStyle.borderRadius,
            };
            
            // Appliquer les couleurs aux segments
            if (config.segments) {
              config.segments = config.segments.map((seg: any, i: number) => ({
                ...seg,
                color: selectedStyle.segmentColors[i % selectedStyle.segmentColors.length],
                textColor: selectedStyle.segmentTextColor
              }));
            }
          }
        }
        
        return action;
      });
      
      // Ajouter des actions pour les médias si pas de full_config
      if (!actions.some(a => a.type === 'full_config')) {
        if (logo) {
          actions.push({ type: 'set_logo', field: 'logo', value: logo.url });
        }
        
        // Distribuer les images sur différents écrans
        images.forEach((img, i) => {
          const views = ['welcome', 'ending-win', 'ending-lose'];
          if (i < views.length) {
            actions.push({ 
              type: 'set_game_image', 
              field: 'image', 
              value: img.url, 
              view: views[i] 
            });
          }
        });
        
        // Appliquer la palette si extraite
        if (extractedPalette) {
          actions.push({
            type: 'update_theme_colors',
            field: 'colors',
            value: {
              primary: extractedPalette.primary,
              secondary: extractedPalette.secondary,
              accent: extractedPalette.accent,
              background: extractedPalette.background,
              text: extractedPalette.text,
            }
          });
        }
        // Sinon appliquer le style prédéfini
        else if (selectedStyle) {
          actions.push({
            type: 'apply_template',
            field: 'template',
            value: selectedStyle.id
          });
          actions.push({
            type: 'update_theme_colors',
            field: 'colors',
            value: {
              primary: selectedStyle.colors.primary,
              secondary: selectedStyle.colors.secondary,
              accent: selectedStyle.colors.accent,
              background: selectedStyle.colors.background,
              text: selectedStyle.colors.text,
            }
          });
        }
      }
    }
    
    const assistantMessage: ChatMessage = {
      id: `m-${Date.now()}-assistant`,
      role: "assistant",
      content: response.success ? response.message : `Erreur: ${response.error}`,
      actions: actions.length > 0 ? actions : undefined,
      actionsApplied: false,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    
    // Clear les médias et la palette après envoi
    setUploadedMedia([]);
    setExtractedPalette(null);

    if (onSend) {
      onSend(trimmed);
    }
  };

  const handleApplyActions = (messageId: string, actions: AIAction[]) => {
    if (onApplyActions) {
      onApplyActions(actions);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, actionsApplied: true } : m
      ));
      toast.success("Modifications appliquées !");
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50" ref={containerRef}>
      {/* Version étendue avec historique */}
      {expanded && (
        <div className="mb-2 w-[520px] max-w-[90vw] rounded-2xl border border-border bg-background shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary">
                AI
              </div>
              <span className="font-medium text-foreground">Campaign AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Beta</span>
            </div>
            <button
              onClick={() => {
                setExpanded(false);
                setMessages([]);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="px-4 pt-3 pb-2 space-y-3 max-h-64 overflow-y-auto text-xs bg-background">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "flex justify-end"
                    : "flex flex-col items-start gap-2"
                }
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-xl bg-primary/10 px-3 py-2 text-foreground"
                      : "max-w-[85%] rounded-xl bg-muted px-3 py-2 text-foreground whitespace-pre-wrap"
                  }
                >
                  {m.content}
                </div>
                
                {/* Afficher les médias attachés au message utilisateur */}
                {m.role === "user" && m.attachedMedia && m.attachedMedia.length > 0 && (
                  <div className="flex gap-1 mt-1 justify-end">
                    {m.attachedMedia.map(media => (
                      <div key={media.id} className="relative group">
                        <img 
                          src={media.url} 
                          alt={media.name}
                          className="w-10 h-10 rounded-lg object-cover border border-border"
                        />
                        {media.type === 'logo' && (
                          <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-primary-foreground px-1 rounded">Logo</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Afficher les actions suggérées */}
                {m.role === "assistant" && m.actions && m.actions.length > 0 && (
                  <div className="w-full max-w-[85%] rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                    <div className="text-[10px] text-muted-foreground mb-2 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {m.actions.some(a => a.type === 'full_config') ? 'Campagne personnalisée :' : 'Modifications suggérées :'}
                    </div>
                    {m.actions.map((action, idx) => {
                      const { icon, label, detail } = getActionDescription(action);
                      return (
                        <div key={idx} className="flex items-start gap-2 text-foreground mb-1">
                          {icon || <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />}
                          <span className="text-[11px]">
                            <span className="font-medium">{label}</span>
                            {detail && <span className="text-muted-foreground ml-1">{detail}</span>}
                          </span>
                        </div>
                      );
                    })}
                    {!m.actionsApplied ? (
                      <button
                        onClick={() => handleApplyActions(m.id, m.actions!)}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Appliquer
                      </button>
                    ) : (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-green-600 font-medium">
                        <Check className="w-3 h-3" />
                        Appliqué
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl bg-muted px-3 py-2 text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Médias uploadés en attente */}
          {uploadedMedia.length > 0 && (
            <div className="px-3 pb-2 flex gap-2 flex-wrap items-center">
              {uploadedMedia.map(media => (
                <div key={media.id} className="relative group">
                  <img 
                    src={media.url} 
                    alt={media.name}
                    className="w-12 h-12 rounded-lg object-cover border border-border"
                  />
                  <button
                    onClick={() => removeMedia(media.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {media.type === 'logo' && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-primary text-primary-foreground px-1 rounded">Logo</span>
                  )}
                </div>
              ))}
              
              {/* Indicateur d'extraction de couleurs */}
              {isExtractingColors && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Extraction couleurs...
                </div>
              )}
            </div>
          )}
          
          {/* Palette de marque extraite */}
          {extractedPalette && (
            <div className="px-3 pb-2">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <Palette className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-medium text-foreground">Palette de marque détectée</span>
                </div>
                <div className="flex gap-1">
                  {extractedPalette.palette.slice(0, 6).map((color, i) => (
                    <div 
                      key={i}
                      className="w-6 h-6 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">
                  Ces couleurs seront appliquées à toute la campagne
                </p>
              </div>
            </div>
          )}
          
          {/* Sélecteur de style prédéfini */}
          {selectedStyle && (
            <div className="px-3 pb-2">
              <div 
                className="rounded-lg border p-2 transition-all"
                style={{ 
                  borderColor: selectedStyle.colors.primary + '40',
                  backgroundColor: selectedStyle.colors.background + '10'
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{selectedStyle.preview}</span>
                    <span className="text-[10px] font-medium text-foreground">{selectedStyle.name}</span>
                  </div>
                  <button
                    onClick={() => setSelectedStyle(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex gap-1 mb-1">
                  {selectedStyle.segmentColors.map((color, i) => (
                    <div 
                      key={i}
                      className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground">
                  {selectedStyle.description} • Police: {selectedStyle.typography.headingFont}
                </p>
              </div>
            </div>
          )}
          
          {/* Picker de styles */}
          {showStylePicker && (
            <div className="px-3 pb-2">
              <div className="rounded-lg border border-border bg-card p-2 max-h-48 overflow-y-auto">
                <p className="text-[10px] font-medium text-foreground mb-2">Choisir un style prédéfini</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.values(BRAND_STYLES).map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setSelectedStyle(style);
                        setShowStylePicker(false);
                        if (onBrandStyleApplied) {
                          onBrandStyleApplied(style);
                        }
                        toast.success(`Style "${style.name}" sélectionné !`);
                      }}
                      onMouseEnter={() => setPreviewStyle(style)}
                      onMouseLeave={() => setPreviewStyle(null)}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                      style={{
                        border: previewStyle?.id === style.id ? `2px solid ${style.colors.primary}` : '1px solid transparent'
                      }}
                    >
                      <span className="text-base">{style.preview}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium truncate">{style.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {style.segmentColors.slice(0, 4).map((color, i) => (
                            <div 
                              key={i}
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Prévisualisation du style au survol */}
          {previewStyle && !selectedStyle && (
            <div className="px-3 pb-2">
              <div 
                className="rounded-lg border p-2 transition-all"
                style={{ 
                  borderColor: previewStyle.colors.primary,
                  background: previewStyle.colors.backgroundGradient || previewStyle.colors.background
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{previewStyle.preview}</span>
                  <div>
                    <p className="text-[11px] font-medium" style={{ color: previewStyle.colors.text }}>
                      {previewStyle.name}
                    </p>
                    <p className="text-[9px]" style={{ color: previewStyle.colors.textMuted }}>
                      {previewStyle.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {previewStyle.segmentColors.map((color, i) => (
                    <div 
                      key={i}
                      className="w-6 h-6 rounded-md shadow-sm"
                      style={{ backgroundColor: color, boxShadow: previewStyle.effects.shadow }}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{ 
                      backgroundColor: previewStyle.colors.buttonBg,
                      color: previewStyle.colors.buttonText,
                      borderRadius: previewStyle.borderRadius.button
                    }}
                  >
                    Bouton
                  </span>
                  <span className="text-[9px]" style={{ color: previewStyle.colors.textMuted }}>
                    Police: {previewStyle.typography.headingFont}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Input dans la version étendue */}
          <div className="px-3 pb-3 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-primary/30 bg-background/80 p-[3px]"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-background px-3 h-10">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                  title="Ajouter des images/logo"
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowStylePicker(!showStylePicker)}
                  className={`transition-colors flex items-center justify-center ${showStylePicker || selectedStyle ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                  title="Choisir un style prédéfini"
                >
                  <Palette className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-border" />
                <input
                  className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground"
                  placeholder={
                    selectedStyle 
                      ? `Style ${selectedStyle.name} • Décris ta campagne...`
                      : uploadedMedia.length > 0 
                        ? "Décris ta campagne avec ces médias..." 
                        : placeholder
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Input compact - seulement visible quand pas expanded */}
      {!expanded && (
        <div className="w-[420px] max-w-[90vw]">
          {/* Médias uploadés en version compacte */}
          {uploadedMedia.length > 0 && (
            <div className="mb-2 flex gap-2 justify-center">
              {uploadedMedia.map(media => (
                <div key={media.id} className="relative group">
                  <img 
                    src={media.url} 
                    alt={media.name}
                    className="w-10 h-10 rounded-lg object-cover border border-border shadow-md"
                  />
                  <button
                    onClick={() => removeMedia(media.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {media.type === 'logo' && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] bg-primary text-primary-foreground px-1 rounded">Logo</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <input
            ref={!expanded ? fileInputRef : undefined}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-primary/30 bg-background/95 backdrop-blur-sm p-[3px] shadow-lg"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-background px-3 h-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                title="Ajouter logo/images"
              >
                <ImagePlus className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
              >
                <Mic className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-border" />
              <input
                className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground"
                placeholder={uploadedMedia.length > 0 ? "Décris ta campagne..." : placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
