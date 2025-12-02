import { motion, AnimatePresence } from "framer-motion";
import { ScratchConfig, ScratchPrize } from "./ScratchBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Smartphone, Sparkles, Upload, ImagePlus, Edit3, Clock, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme, getButtonStyles } from "@/contexts/ThemeContext";
import { SmartScratch } from "./SmartScratch";
import { ImageUploadModal } from "./ImageUploadModal";
import { ImageEditorModal, ImageSettings, defaultSettings } from "./ImageEditorModal";
import { ContactLayouts } from "./layouts/ContactLayouts";
import { EndingLayouts } from "./layouts/EndingLayouts";
import { EditableTextBlock } from "./EditableTextBlock";
import { determineWinningSegment, consumePrize, DrawResult } from "@/utils/prizeDrawing";
import { CampaignHeader, CampaignFooter } from "./campaign";

// Variable pour stocker le résultat du tirage Scratch
let globalScratchDrawResult: DrawResult | null = null;

interface ScratchPreviewProps {
  config: ScratchConfig;
  activeView: 'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose';
  onUpdateConfig: (updates: Partial<ScratchConfig>) => void;
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: () => void;
  isMobileResponsive?: boolean;
  isReadOnly?: boolean;
  onNext: () => void;
  onGoToEnding?: (isWin: boolean) => void;
  onContactDataChange?: (data: Record<string, string>) => void;
  prizes?: ScratchPrize[];
  onUpdatePrize?: (prize: ScratchPrize) => void;
}

export const ScratchPreview = ({ 
  config, 
  activeView, 
  onUpdateConfig, 
  viewMode, 
  onToggleViewMode, 
  isMobileResponsive = false,
  isReadOnly = false,
  onNext,
  onGoToEnding,
  onContactDataChange,
  prizes = [],
  onUpdatePrize
}: ScratchPreviewProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [contactData, setContactDataInternal] = useState<Record<string, string>>({ name: '', email: '', phone: '' });
  
  // Wrapper pour mettre à jour le contactData et notifier le parent
  const setContactData = (updater: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
    setContactDataInternal(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      if (onContactDataChange) {
        onContactDataChange(newData);
      }
      return newData;
    });
  };
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [variableTarget, setVariableTarget] = useState<'title' | 'subtitle' | null>(null);
  const [menuView, setMenuView] = useState<'main' | 'variables'>('main');
  const [startedCardIndex, setStartedCardIndex] = useState<number | null>(null);
  // Utiliser l'image de la config si disponible
  const [uploadedImage, setUploadedImage] = useState<string | null>(config.welcomeScreen.image || null);
  const [imageRotation, setImageRotation] = useState(config.welcomeScreen.imageSettings?.rotation || 0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [hardcodedImageHidden, setHardcodedImageHidden] = useState(false);
  const [imageSettings, setImageSettings] = useState<ImageSettings>(
    config.welcomeScreen.imageSettings ? {
      ...defaultSettings,
      borderRadius: config.welcomeScreen.imageSettings.borderRadius,
      borderWidth: config.welcomeScreen.imageSettings.borderWidth,
      borderColor: config.welcomeScreen.imageSettings.borderColor,
    } : defaultSettings
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const unifiedButtonStyles = getButtonStyles(theme, viewMode);

  // Listen for FloatingToolbar style updates
  useEffect(() => {
    const handleStyleUpdate = (e: CustomEvent) => {
      const { field, updates } = e.detail;
      
      const getStyleKey = () => {
        if (field === 'title') return 'titleStyle';
        if (field === 'subtitle') return 'subtitleStyle';
        return null;
      };
      
      const styleKey = getStyleKey();
      if (!styleKey) return;

      let screenKey: 'welcomeScreen' | 'contactForm' | 'scratchScreen' | 'endingWin' | 'endingLose';
      if (activeView === 'welcome') screenKey = 'welcomeScreen';
      else if (activeView === 'contact') screenKey = 'contactForm';
      else if (activeView === 'scratch') screenKey = 'scratchScreen';
      else if (activeView === 'ending-win') screenKey = 'endingWin';
      else screenKey = 'endingLose';

      const currentScreen = config[screenKey] as any;
      const currentStyle = currentScreen?.[styleKey] || {};
      const newStyle = { ...currentStyle };
      
      for (const [key, value] of Object.entries(updates)) {
        if (value === 'toggle') {
          newStyle[key] = !currentStyle[key];
        } else {
          newStyle[key] = value;
        }
      }
      
      onUpdateConfig({ 
        [screenKey]: { 
          ...currentScreen, 
          [styleKey]: newStyle 
        } 
      });
    };

    document.addEventListener('floatingToolbarStyle', handleStyleUpdate as EventListener);
    return () => document.removeEventListener('floatingToolbarStyle', handleStyleUpdate as EventListener);
  }, [config, activeView, onUpdateConfig]);

  // État local pour le résultat du tirage (plus fiable que variable globale)
  const [scratchDrawResult, setScratchDrawResult] = useState<DrawResult | null>(null);
  const hasDrawnRef = useRef(false);
  const previousViewRef = useRef<string | null>(null);

  // Effectuer le tirage quand on entre dans la vue scratch
  useEffect(() => {
    // Détecter si on vient d'entrer dans la vue scratch
    const justEnteredScratch = activeView === 'scratch' && previousViewRef.current !== 'scratch';
    previousViewRef.current = activeView;
    
    // Reset startedCardIndex when entering scratch view
    if (justEnteredScratch) {
      setStartedCardIndex(null);
    }
    
    if (justEnteredScratch && prizes.length > 0) {
      hasDrawnRef.current = true;
      
      // Créer un segment fictif pour le tirage (Scratch n'a qu'une seule carte)
      const dummySegment = {
        id: 'scratch-card',
        label: 'Carte à gratter',
        isWinning: true
      };

      // Convertir les prizes pour le tirage avec les bons types
      const prizesForDraw = prizes.map(p => ({
        ...p,
        assignedSegments: [] as string[], // Scratch n'utilise pas de segments assignés
      }));

      
      console.log('🎫 [ScratchPreview] Lots:', prizesForDraw.map(p => ({
        name: p.name,
        method: p.attributionMethod,
        prob: p.winProbability,
        status: p.status,
        remaining: p.remaining
      })));

      // Effectuer le tirage
      const result = determineWinningSegment({
        prizes: prizesForDraw as any,
        segments: [dummySegment],
        playTime: new Date()
      });

      console.log('🎫 [ScratchPreview] Tirage effectué:', result);
      setScratchDrawResult(result);
      globalScratchDrawResult = result;
    }
  }, [activeView, prizes]);

  // Reset le tirage quand on quitte la vue scratch
  useEffect(() => {
    if (activeView !== 'scratch') {
      hasDrawnRef.current = false;
      setScratchDrawResult(null);
      globalScratchDrawResult = null;
    }
  }, [activeView]);

  const availableVariables = [
    { key: 'first_name', label: 'First name', description: "User's first name" },
    { key: 'email', label: 'Email', description: "User's email address" },
    { key: 'prize', label: 'Prize', description: "Won prize" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setUploadedImage(imageData);
        setImageRotation(0);
        // Sauvegarder dans la config
        onUpdateConfig({ 
          welcomeScreen: { 
            ...config.welcomeScreen, 
            image: imageData,
            imageSettings: { ...imageSettings, rotation: 0 }
          } 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (imageData: string) => {
    setUploadedImage(imageData);
    setImageRotation(0);
    // Sauvegarder dans la config
    onUpdateConfig({ 
      welcomeScreen: { 
        ...config.welcomeScreen, 
        image: imageData,
        imageSettings: { ...imageSettings, rotation: 0 }
      } 
    });
  };

  const handleImageEdit = (settings: ImageSettings) => {
    setImageSettings(settings);
    setImageRotation(settings.rotation);
    // Sauvegarder dans la config
    onUpdateConfig({ 
      welcomeScreen: { 
        ...config.welcomeScreen, 
        imageSettings: {
          borderRadius: settings.borderRadius,
          borderWidth: settings.borderWidth,
          borderColor: settings.borderColor,
          rotation: settings.rotation
        }
      } 
    });
  };

  const insertVariable = (variableKey: string) => {
    if (!editingField) return;

    if (editingField === 'welcome-title') {
      onUpdateConfig({ 
        welcomeScreen: { 
          ...config.welcomeScreen, 
          title: config.welcomeScreen.title + `{{${variableKey}}}` 
        } 
      });
    } else if (editingField === 'welcome-subtitle') {
      onUpdateConfig({ 
        welcomeScreen: { 
          ...config.welcomeScreen, 
          subtitle: config.welcomeScreen.subtitle + `{{${variableKey}}}` 
        } 
      });
    } else if (editingField === 'contact-title') {
      onUpdateConfig({ 
        contactForm: { 
          ...config.contactForm, 
          title: config.contactForm.title + `{{${variableKey}}}` 
        } 
      });
    } else if (editingField === 'contact-subtitle') {
      onUpdateConfig({ 
        contactForm: { 
          ...config.contactForm, 
          subtitle: config.contactForm.subtitle + `{{${variableKey}}}` 
        } 
      });
    } else if (editingField === 'ending-win-title') {
      onUpdateConfig({ 
        endingWin: { 
          ...config.endingWin, 
          title: config.endingWin.title + `{{${variableKey}}}` 
        } 
      });
    } else if (editingField === 'ending-win-subtitle') {
      onUpdateConfig({ 
        endingWin: { 
          ...config.endingWin, 
          subtitle: config.endingWin.subtitle + `{{${variableKey}}}` 
        } 
      });
    } else if (editingField === 'ending-lose-title') {
      onUpdateConfig({ 
        endingLose: { 
          ...config.endingLose, 
          title: config.endingLose.title + `{{${variableKey}}}` 
        } 
      });
    } else if (editingField === 'ending-lose-subtitle') {
      onUpdateConfig({ 
        endingLose: { 
          ...config.endingLose, 
          subtitle: config.endingLose.subtitle + `{{${variableKey}}}` 
        } 
      });
    }

    setShowVariableMenu(false);
    setMenuView('main');
  };

  const handleTitleBlur = (field: string, value: string) => {
    if (field === 'welcome-title' && value.trim() !== config.welcomeScreen.title) {
      onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, title: value.trim() } });
    } else if (field === 'contact-title' && value.trim() !== config.contactForm.title) {
      onUpdateConfig({ contactForm: { ...config.contactForm, title: value.trim() } });
    } else if (field === 'ending-win-title' && value.trim() !== config.endingWin.title) {
      onUpdateConfig({ endingWin: { ...config.endingWin, title: value.trim() } });
    } else if (field === 'ending-lose-title' && value.trim() !== config.endingLose.title) {
      onUpdateConfig({ endingLose: { ...config.endingLose, title: value.trim() } });
    }
    setEditingField(null);
    setShowVariableMenu(false);
  };

  const handleSubtitleBlur = (field: string, value: string) => {
    if (field === 'welcome-subtitle' && value.trim() !== config.welcomeScreen.subtitle) {
      onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, subtitle: value.trim() } });
    } else if (field === 'contact-subtitle' && value.trim() !== config.contactForm.subtitle) {
      onUpdateConfig({ contactForm: { ...config.contactForm, subtitle: value.trim() } });
    } else if (field === 'ending-win-subtitle' && value.trim() !== config.endingWin.subtitle) {
      onUpdateConfig({ endingWin: { ...config.endingWin, subtitle: value.trim() } });
    } else if (field === 'ending-lose-subtitle' && value.trim() !== config.endingLose.subtitle) {
      onUpdateConfig({ endingLose: { ...config.endingLose, subtitle: value.trim() } });
    }
    setEditingField(null);
    setShowVariableMenu(false);
  };

  const handleScratch = () => {
    // Calculer le gagnant basé sur les probabilités des cartes
    const random = Math.random() * 100;
    let cumulative = 0;
    let winner = config.cards[0];
    
    for (const card of config.cards) {
      cumulative += card.probability || 0;
      if (random <= cumulative) {
        winner = card;
        break;
      }
    }
    
    setTimeout(() => {
      setWonPrize(winner.revealText);
      onNext();
    }, 3000);
  };

  const renderContent = () => {
    // Calculate current layout for non-welcome views
    const getCurrentLayout = () => {
      const layoutKey = viewMode === 'desktop' ? 'desktopLayout' : 'mobileLayout';
      switch (activeView) {
        case 'contact':
          return config.contactForm[layoutKey];
        case 'scratch':
          return config.scratchScreen[layoutKey];
        case 'ending-win':
          return config.endingWin[layoutKey];
        case 'ending-lose':
          return config.endingLose[layoutKey];
        default:
          return viewMode === 'desktop' ? 'desktop-centered' : 'mobile-vertical';
      }
    };
    
    const currentLayout = getCurrentLayout();

    switch (activeView) {
      case 'welcome':
        return (
          <div
            className="flex w-full h-full"
            style={{
              alignItems: viewMode === "desktop" && (config.welcomeScreen.desktopLayout === "desktop-left-right" || !config.welcomeScreen.desktopLayout) ? "flex-start" : viewMode === "desktop" ? "center" : "flex-start",
              justifyContent: viewMode === "desktop" ? "center" : "flex-start",
              padding: "0",
            }}
          >
            {(() => {
              const desktopLayout = config.welcomeScreen.desktopLayout || "desktop-left-right";
              const mobileLayout = config.welcomeScreen.mobileLayout || "mobile-vertical";
              const currentLayoutType = viewMode === "desktop" ? desktopLayout : mobileLayout;

              // Image component with upload functionality
              const baseSize = viewMode === 'desktop' ? 320 : 280;
              const scaledSize = baseSize * (imageSettings.size / 100);
              
              const ImageBlock = () => (
                <div
                  className="overflow-hidden relative group"
                  style={{ 
                    borderRadius: `${imageSettings.borderRadius}px`,
                    width: `${scaledSize}px`,
                    height: `${scaledSize}px`,
                    maxWidth: '100%',
                    flexShrink: 0,
                    border: imageSettings.borderWidth > 0 ? `${imageSettings.borderWidth}px solid ${imageSettings.borderColor}` : 'none',
                  }}
                >
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                      style={{
                        transform: `rotate(${imageSettings.rotation}deg) scaleX(${imageSettings.flipH ? -1 : 1}) scaleY(${imageSettings.flipV ? -1 : 1})`,
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Upload className="w-12 h-12 mb-3" style={{ color: theme.accentColor }} />
                      <p className="text-sm font-medium" style={{ color: theme.accentColor }}>
                        Upload Image
                      </p>
                      <p className="text-xs mt-1" style={{ color: theme.textSecondaryColor }}>
                        Click to browse
                      </p>
                    </div>
                  )}
                  
                  {/* Boutons au survol */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => setShowEditorModal(true)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: 'rgba(61, 55, 49, 0.9)' }}
                      title="Éditer l'image"
                    >
                      <Edit3 className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setImageSettings(defaultSettings);
                        onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, showImage: false, image: undefined, imageSettings: undefined } });
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 bg-red-500 hover:bg-red-600"
                      title="Supprimer l'image"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              );

              // Text content component  
              const alignment = config.welcomeScreen.alignment || 'left';
              const alignmentClass = alignment === 'center' ? 'text-center items-center' : alignment === 'right' ? 'text-right items-end' : 'text-left items-start';
              
              const TextContent = ({ centered = false }: { centered?: boolean }) => (
                <div className={`flex flex-col ${alignmentClass}`}>
                  {config.welcomeScreen.title && (
                    <EditableTextBlock
                      value={config.welcomeScreen.titleHtml || config.welcomeScreen.title}
                      onChange={(value, html) => onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, title: value, titleHtml: html } })}
                      onClear={() => onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, title: '', titleHtml: '' } })}
                      className="font-bold"
                      style={{ 
                        color: config.welcomeScreen.titleStyle?.textColor || theme.accentColor, 
                        fontFamily: config.welcomeScreen.titleStyle?.fontFamily || 'inherit',
                        fontWeight: config.welcomeScreen.titleStyle?.isBold ? 'bold' : undefined,
                        fontStyle: config.welcomeScreen.titleStyle?.isItalic ? 'italic' : undefined,
                        textDecoration: config.welcomeScreen.titleStyle?.isUnderline ? 'underline' : undefined,
                        textAlign: config.welcomeScreen.titleStyle?.textAlign || alignment,
                        fontSize: config.welcomeScreen.titleStyle?.fontSize ? `${config.welcomeScreen.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '42px' : '28px'),
                        lineHeight: '1.2'
                      }}
                      isEditing={!isReadOnly && editingField === 'welcome-title'}
                      isReadOnly={isReadOnly}
                      onFocus={() => !isReadOnly && setEditingField('welcome-title')}
                      onBlur={() => setEditingField(null)}
                      fieldType="title"
                      width={config.welcomeScreen.titleWidth || 100}
                      onWidthChange={(width) => onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, titleWidth: width } })}
                      marginBottom="16px"
                    />
                  )}
                  
                  {config.welcomeScreen.subtitle && (
                    <EditableTextBlock
                      value={config.welcomeScreen.subtitleHtml || config.welcomeScreen.subtitle}
                      onChange={(value, html) => onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, subtitle: value, subtitleHtml: html } })}
                      onClear={() => onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, subtitle: '', subtitleHtml: '' } })}
                      className=""
                      style={{ 
                        color: config.welcomeScreen.subtitleStyle?.textColor || theme.textSecondaryColor, 
                        fontFamily: config.welcomeScreen.subtitleStyle?.fontFamily || 'inherit',
                        fontWeight: config.welcomeScreen.subtitleStyle?.isBold ? 'bold' : undefined,
                        fontStyle: config.welcomeScreen.subtitleStyle?.isItalic ? 'italic' : undefined,
                        textDecoration: config.welcomeScreen.subtitleStyle?.isUnderline ? 'underline' : undefined,
                        textAlign: config.welcomeScreen.subtitleStyle?.textAlign || alignment,
                        opacity: 0.9, 
                        fontSize: config.welcomeScreen.subtitleStyle?.fontSize ? `${config.welcomeScreen.subtitleStyle.fontSize}px` : (viewMode === 'desktop' ? '18px' : '14px'),
                        lineHeight: '1.4'
                      }}
                      isEditing={!isReadOnly && editingField === 'welcome-subtitle'}
                      isReadOnly={isReadOnly}
                      onFocus={() => !isReadOnly && setEditingField('welcome-subtitle')}
                      onBlur={() => setEditingField(null)}
                      fieldType="subtitle"
                      width={config.welcomeScreen.subtitleWidth || 100}
                      onWidthChange={(width) => onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, subtitleWidth: width } })}
                      marginBottom="32px"
                    />
                  )}

                  <button
                    onClick={onNext}
                    className="font-medium transition-all hover:opacity-90"
                    style={unifiedButtonStyles}
                  >
                    <span>{config.welcomeScreen.buttonText || "Commencer"}</span>
                  </button>

                  </div>
                );

              // Desktop layouts
              if (viewMode === 'desktop') {
                // Horizontal alignment for the whole content block
                const horizontalAlign = alignment === 'center' ? 'items-center' : alignment === 'right' ? 'items-end' : 'items-start';
                
                if (desktopLayout === 'desktop-left-right') {
                  const align = config.welcomeScreen.splitAlignment || 'left';
                  const alignmentClass =
                    align === 'center'
                      ? 'items-center'
                      : align === 'right'
                      ? 'items-end'
                      : 'items-start';
                  const justifyClass = config.welcomeScreen.showImage === false ? 'justify-center' : 'justify-start';
                  const textContainerClass =
                    align === 'center'
                      ? 'max-w-[700px] mx-auto'
                      : align === 'right'
                      ? 'max-w-[700px] ml-auto'
                      : 'max-w-[700px]';

                  return (
                    <div className={`w-full h-full flex flex-col ${horizontalAlign} ${justifyClass} gap-10 overflow-y-auto scrollbar-hide`} style={{ padding: '35px 75px' }}>
                      {(config.welcomeScreen.showImage !== false) && <ImageBlock />}
                      <div className={textContainerClass}>
                        <TextContent />
                      </div>
                    </div>
                  );
                } else if (desktopLayout === 'desktop-right-left') {
                  const justifyContent = alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start';
                  return (
                    <div className={`w-full h-full flex ${justifyContent} items-center gap-16 px-24`}>
                      <div className="max-w-[500px]">
                        <TextContent />
                      </div>
                      <ImageBlock />
                    </div>
                  );
                } else if (desktopLayout === 'desktop-centered') {
                  const justifyContent = alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start';
                  return (
                    <div className={`w-full h-full flex ${justifyContent} items-center gap-16 px-24`}>
                      <ImageBlock />
                      <div className="max-w-[500px]">
                        <TextContent />
                      </div>
                    </div>
                  );
                } else if (desktopLayout === 'desktop-split') {
                  const justifyContent = alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start';
                  return (
                    <div className="absolute inset-0">
                      {config.welcomeScreen.wallpaperImage ? (
                        <img
                          src={config.welcomeScreen.wallpaperImage}
                          alt="Background"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: theme.backgroundColor }} />
                      )}
                      <div className={`relative z-10 flex ${justifyContent} items-center h-full px-16`}>
                        <div className="max-w-[700px]">
                          <TextContent />
                        </div>
                      </div>
                    </div>
                  );
                } else if (desktopLayout === 'desktop-card') {
                  const justifyContent = alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start';
                  return (
                    <div className="relative w-full h-full flex">
                      <div className={`w-1/2 flex ${justifyContent} items-center px-24 z-10`}>
                        <div className="max-w-[500px]">
                          <TextContent />
                        </div>
                      </div>
                      <div className="absolute right-0 top-0 w-1/2 h-full group">
                        {uploadedImage ? (
                          <>
                            <img
                              src={uploadedImage}
                              alt="Feedback illustration"
                              className="w-full h-full object-cover"
                              style={{
                                transform: `rotate(${imageRotation}deg)`,
                                transition: 'transform 0.3s ease'
                              }}
                            />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
                              <button
                                onClick={() => setShowEditorModal(true)}
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                                title="Edit image"
                              >
                                <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                              </button>
                              <button
                                onClick={() => {
                                  setUploadedImage(null);
                                  setHardcodedImageHidden(true);
                                  onUpdateConfig({
                                    welcomeScreen: {
                                      ...config.welcomeScreen,
                                      image: undefined,
                                      imageSettings: undefined,
                                    }
                                  });
                                }}
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                style={{ backgroundColor: 'rgba(220, 38, 38, 0.85)' }}
                                title="Delete image"
                              >
                                <X className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Upload className="w-16 h-16 mb-4" style={{ color: '#F5B800' }} />
                            <p className="text-lg font-medium" style={{ color: '#F5B800' }}>
                              Upload Image
                            </p>
                            <p className="text-sm mt-2" style={{ color: '#A89A8A' }}>
                              Click to browse
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else if (desktopLayout === 'desktop-panel') {
                  return (
                    <div className="relative w-full h-full flex">
                        <div className="absolute left-0 top-0 w-1/2 h-full group">
                          {uploadedImage ? (
                            <>
                              <img
                                src={uploadedImage}
                                alt="Feedback illustration"
                                className="w-full h-full object-cover"
                                style={{
                                  transform: `rotate(${imageRotation}deg)`,
                                  transition: 'transform 0.3s ease'
                                }}
                              />
                              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
                                <button
                                  onClick={() => setShowEditorModal(true)}
                                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                  style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                                  title="Edit image"
                                >
                                  <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    setUploadedImage(null);
                                    setHardcodedImageHidden(true);
                                    onUpdateConfig({
                                      welcomeScreen: {
                                        ...config.welcomeScreen,
                                        image: undefined,
                                        imageSettings: undefined,
                                      }
                                    });
                                  }}
                                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                  style={{ backgroundColor: 'rgba(220, 38, 38, 0.85)' }}
                                  title="Delete image"
                                >
                                  <X className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                                </button>
                              </div>
                            </>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Upload className="w-16 h-16 mb-4" style={{ color: '#F5B800' }} />
                            <p className="text-lg font-medium" style={{ color: '#F5B800' }}>
                              Upload Image
                            </p>
                            <p className="text-sm mt-2" style={{ color: '#A89A8A' }}>
                              Click to browse
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="w-1/2 ml-auto flex items-center justify-center px-24 z-10">
                        <div className="max-w-[500px]">
                          <TextContent />
                        </div>
                      </div>
                    </div>
                  );
                }
              }

              // Mobile layouts
              if (mobileLayout === 'mobile-vertical') {
                return (
                  <div className="flex flex-col gap-6 w-full max-w-[700px] overflow-y-auto" style={{ padding: '35px' }}>
                    <ImageBlock />
                    <TextContent />
                  </div>
                );
              } else if (mobileLayout === 'mobile-centered') {
                return (
                  <div className="flex flex-col w-full h-full">
                    <div className="w-full relative group" style={{ height: '40%', minHeight: '250px' }}>
                      {uploadedImage ? (
                        <>
                          <img
                            src={uploadedImage}
                            alt="Banner"
                            className="w-full h-full object-cover"
                            style={{
                              transform: `rotate(${imageRotation}deg)`,
                              transition: 'transform 0.3s ease'
                            }}
                          />
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
                            <button
                              onClick={() => setShowEditorModal(true)}
                              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                              style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                              title="Edit image"
                            >
                              <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                            </button>
                            <button
                              onClick={() => {
                                setUploadedImage(null);
                                setHardcodedImageHidden(true);
                                onUpdateConfig({
                                  welcomeScreen: {
                                    ...config.welcomeScreen,
                                    image: undefined,
                                    imageSettings: undefined,
                                  }
                                });
                              }}
                              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                              style={{ backgroundColor: 'rgba(220, 38, 38, 0.85)' }}
                              title="Delete image"
                            >
                              <X className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <Upload className="w-12 h-12 mb-3" style={{ color: '#F5B800' }} />
                          <p className="text-sm font-medium" style={{ color: '#F5B800' }}>
                            Upload Banner
                          </p>
                          <p className="text-xs mt-1" style={{ color: '#A89A8A' }}>
                            Click to browse
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex items-start justify-center pt-6 pb-24" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
                      <div className="w-full max-w-[700px]">
                        <TextContent />
                      </div>
                    </div>
                  </div>
                );
              } else if (mobileLayout === 'mobile-minimal') {
                return (
                  <div className="absolute inset-0">
                    {config.welcomeScreen.wallpaperImage ? (
                      <img
                        src={config.welcomeScreen.wallpaperImage}
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: theme.backgroundColor }} />
                    )}
                    <div className="relative z-10 flex items-center justify-center h-full px-8">
                      <div className="w-full max-w-[700px] text-center">
                        <TextContent centered />
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })()}
          </div>
        );

      case 'contact':
        if (!config.contactForm.enabled) {
          onNext();
          return null;
        }
        
        // Définir ContactForm une seule fois pour être accessible à tous les layouts
        const ContactForm = () => (
          <div className="w-full max-w-md text-center px-4">
            <EditableTextBlock
              value={config.contactForm.titleHtml || config.contactForm.title}
              onChange={(value, html) => onUpdateConfig({ contactForm: { ...config.contactForm, title: value, titleHtml: html } })}
              onClear={() => onUpdateConfig({ contactForm: { ...config.contactForm, title: '', titleHtml: '' } })}
              onSparklesClick={() => {
                setVariableTarget('title');
                setShowVariableMenu(prev => !prev);
                setMenuView('main');
              }}
              className="font-bold"
              style={{
                color: config.contactForm.titleStyle?.textColor || theme.textColor,
                fontFamily: config.contactForm.titleStyle?.fontFamily || 'inherit',
                fontSize: viewMode === 'mobile' ? '28px' : '42px',
                lineHeight: '1.2',
              }}
              isEditing={!isReadOnly && editingField === 'contact-title'}
              isReadOnly={isReadOnly}
              onFocus={() => !isReadOnly && setEditingField('contact-title')}
              onBlur={() => handleTitleBlur('contact-title', config.contactForm.title)}
              fieldType="title"
              marginBottom="16px"
            />
            
            <EditableTextBlock
              value={config.contactForm.subtitleHtml || config.contactForm.subtitle}
              onChange={(value, html) => onUpdateConfig({ contactForm: { ...config.contactForm, subtitle: value, subtitleHtml: html } })}
              onClear={() => onUpdateConfig({ contactForm: { ...config.contactForm, subtitle: '', subtitleHtml: '' } })}
              onSparklesClick={() => {
                setVariableTarget('subtitle');
                setShowVariableMenu(prev => !prev);
                setMenuView('main');
              }}
              className=""
              style={{
                color: config.contactForm.subtitleStyle?.textColor || theme.textColor,
                fontFamily: config.contactForm.subtitleStyle?.fontFamily || 'inherit',
                fontSize: viewMode === 'mobile' ? '14px' : '18px',
                lineHeight: '1.4',
                opacity: 0.8,
              }}
              isEditing={!isReadOnly && editingField === 'contact-subtitle'}
              isReadOnly={isReadOnly}
              onFocus={() => !isReadOnly && setEditingField('contact-subtitle')}
              onBlur={() => handleSubtitleBlur('contact-subtitle', config.contactForm.subtitle)}
              fieldType="subtitle"
              marginBottom="32px"
            />
            
            <div className="space-y-4">
              {config.contactForm.fields.map((field, index) => {
                if (field.type === 'checkbox') {
                  return (
                    <label key={index} className="flex items-start gap-3 cursor-pointer text-left">
                      <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 rounded border-2 transition-colors flex-shrink-0"
                        style={{ 
                          accentColor: theme.buttonColor,
                          borderColor: theme.textColor
                        }}
                        onChange={(e) => setContactData(prev => ({ ...prev, [field.id || field.type]: e.target.checked ? 'true' : 'false' }))}
                        required={field.required}
                      />
                      <span className="text-sm" style={{ color: theme.textColor }}>
                        {field.label}
                        {field.helpText && (
                          <span className="block text-xs opacity-70 mt-1">{field.helpText}</span>
                        )}
                      </span>
                    </label>
                  );
                }

                if (field.type === 'select' && field.options) {
                  return (
                    <div key={index} className="text-left">
                      <label className="block mb-2 text-sm font-normal" style={{ color: theme.textColor }}>
                        {field.label}
                      </label>
                      <select
                        onChange={(e) => setContactData(prev => ({ ...prev, [field.id || field.type]: e.target.value }))}
                        className="w-full h-10 text-sm px-3"
                        style={{
                          backgroundColor: theme.backgroundColor,
                          borderColor: theme.textColor,
                          borderWidth: '1px',
                          color: theme.textColor,
                          borderRadius: theme.buttonStyle === 'square' ? '0px' : '8px',
                        }}
                      >
                        <option value="">Sélectionnez une option</option>
                        {field.options.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <div key={index} className="text-left">
                      <label className="block mb-2 text-sm font-normal" style={{ color: theme.textColor }}>
                        {field.label}
                      </label>
                      <textarea
                        className="w-full text-sm px-3 py-2 min-h-[80px] resize-none"
                        style={{
                          backgroundColor: theme.backgroundColor,
                          borderColor: theme.textColor,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          color: theme.textColor,
                          borderRadius: theme.buttonStyle === 'square' ? '0px' : '8px',
                        }}
                        onChange={(e) => setContactData(prev => ({ ...prev, [field.id || field.type]: e.target.value }))}
                        required={field.required}
                      />
                    </div>
                  );
                }

                return (
                  <div key={index} className="text-left">
                    <label className="block mb-2 text-sm font-normal" style={{ color: theme.textColor }}>
                      {field.label}
                    </label>
                    <Input
                      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : 'text'}
                      value={contactData[field.type as keyof typeof contactData] || ''}
                      onChange={(e) => setContactData(prev => ({ ...prev, [field.id || field.type]: e.target.value }))}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="h-10 text-sm"
                      style={{
                        backgroundColor: theme.backgroundColor,
                        borderColor: theme.textColor,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: theme.textColor,
                        borderRadius: theme.buttonStyle === 'square' ? '0px' : '8px',
                      }}
                    />
                  </div>
                );
              })}
              
              <button 
                onClick={onNext}
                className="w-full flex items-center justify-center font-medium transition-all hover:opacity-90"
                style={unifiedButtonStyles}
              >
                Continuer
              </button>
            </div>
          </div>
        );
        
        // Mobile-centered layout avec bannière (même système que Welcome)
        if (viewMode === 'mobile' && currentLayout === 'mobile-centered') {
          const contactBannerImage = config.contactForm.backgroundImageMobile || config.contactForm.backgroundImage;
          
          return (
            <div className="flex flex-col w-full h-full">
              <div className="w-full relative group" style={{ height: '40%', minHeight: '250px' }}>
                {contactBannerImage ? (
                  <>
                    <img
                      src={contactBannerImage}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    {!isReadOnly && (
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                          title="Change image"
                        >
                          <ImagePlus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                        </button>
                        <button
                          onClick={() => setShowEditorModal(true)}
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                          title="Edit image"
                        >
                          <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    onClick={() => !isReadOnly && fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Upload className="w-12 h-12 mb-3" style={{ color: '#F5B800' }} />
                    <p className="text-sm font-medium" style={{ color: '#F5B800' }}>
                      Upload Banner
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#A89A8A' }}>
                      Click to browse
                    </p>
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-start justify-center pt-6 pb-24 overflow-y-auto" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
                <div className="w-full max-w-[700px]">
                  <ContactForm />
                </div>
              </div>
            </div>
          );
        }
        
        // Desktop-card (Split right) layout avec image
        if (viewMode === 'desktop' && currentLayout === 'desktop-card') {
          const contactImageDesktop = config.contactForm.backgroundImage;
          
          return (
            <div className="relative w-full h-full flex">
              <div className="w-1/2 flex items-center justify-center px-24 z-10">
                <div className="max-w-[500px]">
                  <ContactForm />
                </div>
              </div>
              <div className="absolute right-0 top-0 w-1/2 h-full group">
                {contactImageDesktop ? (
                  <>
                    <img
                      src={contactImageDesktop}
                      alt="Contact illustration"
                      className="w-full h-full object-cover"
                    />
                    {!isReadOnly && (
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                          title="Change image"
                        >
                          <ImagePlus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                        </button>
                        <button
                          onClick={() => setShowEditorModal(true)}
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                          title="Edit image"
                        >
                          <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    onClick={() => !isReadOnly && fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Upload className="w-16 h-16 mb-4" style={{ color: '#F5B800' }} />
                    <p className="text-lg font-medium" style={{ color: '#F5B800' }}>
                      Upload Image
                    </p>
                    <p className="text-sm mt-2" style={{ color: '#A89A8A' }}>
                      Click to browse
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }
        
        // Desktop-panel (Split left) layout avec image
        if (viewMode === 'desktop' && currentLayout === 'desktop-panel') {
          const contactImageDesktop = config.contactForm.backgroundImage;
          
          return (
            <div className="relative w-full h-full flex">
              <div className="absolute left-0 top-0 w-1/2 h-full group">
                {contactImageDesktop ? (
                  <>
                    <img
                      src={contactImageDesktop}
                      alt="Contact illustration"
                      className="w-full h-full object-cover"
                    />
                    {!isReadOnly && (
                      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                          title="Change image"
                        >
                          <ImagePlus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                        </button>
                        <button
                          onClick={() => setShowEditorModal(true)}
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                          title="Edit image"
                        >
                          <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    onClick={() => !isReadOnly && fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Upload className="w-16 h-16 mb-4" style={{ color: '#F5B800' }} />
                    <p className="text-lg font-medium" style={{ color: '#F5B800' }}>
                      Upload Image
                    </p>
                    <p className="text-sm mt-2" style={{ color: '#A89A8A' }}>
                      Click to browse
                    </p>
                  </div>
                )}
              </div>
              <div className="w-1/2 ml-auto flex items-center justify-center px-24 z-10">
                <div className="max-w-[500px]">
                  <ContactForm />
                </div>
              </div>
            </div>
          );
        }
        
        // Tous les autres layouts (utiliser ContactLayouts)
        return (
          <ContactLayouts
            layout={currentLayout}
            viewMode={viewMode}
            title={config.contactForm.titleHtml || config.contactForm.title}
            subtitle={config.contactForm.subtitleHtml || config.contactForm.subtitle}
            fields={config.contactForm.fields}
            contactData={contactData}
            onFieldChange={(type, value) => setContactData(prev => ({ ...prev, [type]: value }))}
            onSubmit={onNext}
            backgroundColor={theme.backgroundColor}
            textColor={theme.textColor}
            buttonColor={theme.buttonColor}
            backgroundImage={viewMode === 'desktop' ? config.contactForm.backgroundImage : config.contactForm.backgroundImageMobile}
            editingField={editingField}
            isReadOnly={isReadOnly}
            onFocusTitle={() => !isReadOnly && setEditingField('contact-title')}
            onFocusSubtitle={() => !isReadOnly && setEditingField('contact-subtitle')}
            onBlurTitle={(value) => handleTitleBlur('contact-title', value)}
            onBlurSubtitle={(value) => handleSubtitleBlur('contact-subtitle', value)}
            onChangeTitle={(value, html) => onUpdateConfig({ contactForm: { ...config.contactForm, title: value, titleHtml: html } })}
            onChangeSubtitle={(value, html) => onUpdateConfig({ contactForm: { ...config.contactForm, subtitle: value, subtitleHtml: html } })}
            onClearTitle={() => onUpdateConfig({ contactForm: { ...config.contactForm, title: '', titleHtml: '' } })}
            onClearSubtitle={() => onUpdateConfig({ contactForm: { ...config.contactForm, subtitle: '', subtitleHtml: '' } })}
            showVariableMenu={showVariableMenu}
            variableTarget={variableTarget}
            menuView={menuView}
            onToggleVariableMenu={(target) => {
              setVariableTarget(target);
              setShowVariableMenu(prev => !prev);
              setMenuView('main');
            }}
            onSetMenuView={setMenuView}
            availableVariables={availableVariables}
            onInsertVariable={insertVariable}
            titleStyle={config.contactForm.titleStyle}
            subtitleStyle={config.contactForm.subtitleStyle}
          />
        );

      case 'scratch':
        return (
          <div
            className="w-full h-full"
            style={{
              padding: 0,
            }}
          >
            {(() => {
              const desktopLayout = config.scratchScreen.desktopLayout || "desktop-left-right";
              const mobileLayout = config.scratchScreen.mobileLayout || "mobile-vertical";
              const currentLayoutType = viewMode === "desktop" ? desktopLayout : mobileLayout;

              // Scratch component: render up to 4 cards on a single centered row
              const ScratchBlock = () => {
                const visibleCards = config.cards.slice(0, 4);

                const isMobileThreeCards = viewMode === 'mobile' && visibleCards.length === 3;
                const isMobileFourCards = viewMode === 'mobile' && visibleCards.length === 4;

                // Desktop: toujours une seule ligne. Mobile:
                // - 3 cartes -> grille 2x1 (2 en haut, 1 centrée en bas)
                // - autre cas -> flex avec wrap
                const containerClass = viewMode === 'desktop'
                  ? 'flex justify-center items-center gap-1'
                  : isMobileThreeCards
                  ? 'grid grid-cols-2 gap-x-6 gap-y-14 justify-items-center'
                  : isMobileFourCards
                  ? 'grid grid-cols-2 gap-x-6 gap-y-10 justify-items-center'
                  : 'flex justify-center items-center gap-6 flex-wrap';

                return (
                  <div className={containerClass}>
                    {visibleCards.map((card, index) => {
                      const isLastInThree = isMobileThreeCards && index === 2;

                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-center ${isLastInThree ? 'col-span-2' : ''} ${startedCardIndex !== null && startedCardIndex !== index ? 'opacity-40 pointer-events-none' : ''}`}
                          style={{ 
                            width:
                              viewMode === 'desktop'
                                ? '260px'
                                : visibleCards.length >= 3
                                ? '160px'
                                : '200px',
                            height:
                              viewMode === 'desktop'
                                ? '260px'
                                : visibleCards.length >= 3
                                ? '190px'
                                : '220px',
                            maxWidth: '100%',
                            flexShrink: 0,
                          }}
                        >
                          {(() => {
                          // Utiliser le résultat du tirage (état local ou global)
                          const drawResult = scratchDrawResult || globalScratchDrawResult;
                          const isWinner = drawResult?.won === true;
                          const wonPrizeData = drawResult?.prize;
                          
                          // Déterminer le contenu révélé en fonction du résultat du tirage
                          let finalRevealText = card.revealText;
                          let finalRevealImage = card.revealImage;
                          
                          if (wonPrizeData) {
                            // Un lot a été gagné
                            finalRevealText = (wonPrizeData as any).scratchWinText || '🎉 Gagné !';
                            finalRevealImage = (wonPrizeData as any).scratchWinImage;
                          } else if (prizes.length > 0) {
                            // Pas de gain - utiliser le texte/image perdant du premier lot configuré
                            const firstPrize = prizes[0];
                            finalRevealText = firstPrize?.scratchLoseText || 'Dommage...';
                            finalRevealImage = firstPrize?.scratchLoseImage;
                          }
                          
                          return (
                            <SmartScratch
                              width={config.scratchScreen.cardWidth}
                              height={config.scratchScreen.cardHeight}
                              scratchColor={config.scratchScreen.scratchColor}
                              scratchImage={config.scratchScreen.scratchImage}
                              threshold={config.scratchScreen.threshold}
                              brushSize={config.scratchScreen.brushSize}
                              borderRadius={config.scratchScreen.cardBorderRadius}
                              borderWidth={config.scratchScreen.cardBorderWidth}
                              borderColor={config.scratchScreen.cardBorderColor}
                              revealText={finalRevealText}
                              revealImage={finalRevealImage}
                              disabled={startedCardIndex !== null && startedCardIndex !== index}
                              onStart={() => {
                                if (startedCardIndex === null) {
                                  setStartedCardIndex(index);
                                }
                              }}
                              onComplete={() => {
                                console.log('🎫 [ScratchPreview] Carte grattée, résultat:', drawResult);
                                
                                if (isWinner && wonPrizeData) {
                                  console.log('🎫 [ScratchPreview] ✅ Gain confirmé:', wonPrizeData.name);
                                  setWonPrize(wonPrizeData.name);
                                  
                                  // Stocker le lot à mettre à jour
                                  const prizeToUpdate = consumePrize(wonPrizeData) as ScratchPrize;
                                  
                                  setTimeout(() => {
                                    // Mettre à jour le stock APRÈS la navigation
                                    if (onUpdatePrize) {
                                      onUpdatePrize(prizeToUpdate);
                                    }
                                    globalScratchDrawResult = null;
                                    setScratchDrawResult(null);
                                    hasDrawnRef.current = false;
                                    if (onGoToEnding) onGoToEnding(true);
                                    else onNext();
                                  }, 1000);
                                } else {
                                  
                                  setWonPrize(null);
                                  setTimeout(() => {
                                    globalScratchDrawResult = null;
                                    setScratchDrawResult(null);
                                    hasDrawnRef.current = false;
                                    if (onGoToEnding) onGoToEnding(false);
                                    else onNext();
                                  }, 1000);
                                }
                              }}
                            />
                          );
                        })()}
                        </div>
                      );
                    })}
                  </div>
                );
              };

              // Text content component : only a single title above the cards
              const TextContent = () => (
                <div className="text-center">
                  <EditableTextBlock
                    value={config.scratchScreen.titleHtml || config.scratchScreen.title}
                    onChange={(value, html) => onUpdateConfig({ scratchScreen: { ...config.scratchScreen, title: value, titleHtml: html } })}
                    onClear={() => onUpdateConfig({ scratchScreen: { ...config.scratchScreen, title: '', titleHtml: '' } })}
                    isEditing={!isReadOnly && editingField === 'scratch-title'}
                    isReadOnly={isReadOnly}
                    onFocus={() => !isReadOnly && setEditingField('scratch-title')}
                    onBlur={() => setEditingField(null)}
                    className=""
                    style={{ 
                      color: config.scratchScreen.titleStyle?.textColor || theme.accentColor, 
                      fontFamily: config.scratchScreen.titleStyle?.fontFamily || 'inherit',
                      fontWeight: config.scratchScreen.titleStyle?.isBold ? 'bold' : 500,
                      fontStyle: config.scratchScreen.titleStyle?.isItalic ? 'italic' : undefined,
                      textDecoration: config.scratchScreen.titleStyle?.isUnderline ? 'underline' : undefined,
                      textAlign: config.scratchScreen.titleStyle?.textAlign || 'center',
                      fontSize: config.scratchScreen.titleStyle?.fontSize ? `${config.scratchScreen.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '48px' : '28px'),
                      lineHeight: '1.1',
                      letterSpacing: '-0.02em',
                    }}
                    fieldType="title"
                    width={config.scratchScreen.titleWidth || 100}
                    onWidthChange={(width) => onUpdateConfig({ scratchScreen: { ...config.scratchScreen, titleWidth: width } })}
                  />
                </div>
              );

              // Single layout for both desktop and mobile: title at top, cards centered in remaining space
              return (
                <div
                  className="w-full h-full flex flex-col px-6"
                  style={{ paddingTop: viewMode === 'desktop' ? '72px' : '40px', paddingBottom: viewMode === 'desktop' ? '40px' : '32px' }}
                >
                  {/* Titre en haut (un peu plus bas visuellement) */}
                  <div className="flex-shrink-0 text-center mb-8">
                    <TextContent />
                  </div>
                  
                  {/* Cartes centrées verticalement dans l'espace restant */}
                  <div className="flex-1 flex items-center justify-center overflow-y-auto">
                    <ScratchBlock />
                  </div>
                </div>
              );
            })()}
          </div>
        );

      case 'ending-win':
        const winTitle = config.endingWin.title.replace('{{prize}}', wonPrize || 'votre lot');
        const winSubtitle = config.endingWin.subtitle.replace('{{prize}}', wonPrize || 'votre lot');
        
        return (
          <div className="w-full h-full flex items-center justify-center" style={{ padding: viewMode === 'desktop' ? '35px 75px' : '24px' }}>
            <div className="w-full max-w-[700px] text-center">
              <EditableTextBlock
                value={config.endingWin.titleHtml || winTitle}
                onChange={(value, html) => onUpdateConfig({ endingWin: { ...config.endingWin, title: value, titleHtml: html } })}
                onClear={() => onUpdateConfig({ endingWin: { ...config.endingWin, title: '', titleHtml: '' } })}
                className="font-bold"
                style={{ 
                  color: config.endingWin.titleStyle?.textColor || theme.textColor,
                  fontFamily: config.endingWin.titleStyle?.fontFamily || 'inherit',
                  fontWeight: config.endingWin.titleStyle?.isBold ? 'bold' : 700,
                  fontStyle: config.endingWin.titleStyle?.isItalic ? 'italic' : undefined,
                  textDecoration: config.endingWin.titleStyle?.isUnderline ? 'underline' : undefined,
                  textAlign: config.endingWin.titleStyle?.textAlign || 'center',
                  fontSize: config.endingWin.titleStyle?.fontSize ? `${config.endingWin.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '42px' : '28px'),
                  lineHeight: 1.2,
                }}
                isEditing={!isReadOnly && editingField === 'ending-win-title'}
                isReadOnly={isReadOnly}
                onFocus={() => !isReadOnly && setEditingField('ending-win-title')}
                onBlur={() => setEditingField(null)}
                fieldType="title"
                width={config.endingWin.titleWidth || 100}
                onWidthChange={(width) => onUpdateConfig({ endingWin: { ...config.endingWin, titleWidth: width } })}
                marginBottom={viewMode === 'desktop' ? '16px' : '8px'}
              />
              <EditableTextBlock
                value={config.endingWin.subtitleHtml || winSubtitle}
                onChange={(value, html) => onUpdateConfig({ endingWin: { ...config.endingWin, subtitle: value, subtitleHtml: html } })}
                onClear={() => onUpdateConfig({ endingWin: { ...config.endingWin, subtitle: '', subtitleHtml: '' } })}
                className=""
                style={{ 
                  color: config.endingWin.subtitleStyle?.textColor || theme.textSecondaryColor, 
                  fontFamily: config.endingWin.subtitleStyle?.fontFamily || 'inherit',
                  fontWeight: config.endingWin.subtitleStyle?.isBold ? 'bold' : 400,
                  fontStyle: config.endingWin.subtitleStyle?.isItalic ? 'italic' : undefined,
                  textDecoration: config.endingWin.subtitleStyle?.isUnderline ? 'underline' : undefined,
                  textAlign: config.endingWin.subtitleStyle?.textAlign || 'center',
                  fontSize: config.endingWin.subtitleStyle?.fontSize ? `${config.endingWin.subtitleStyle.fontSize}px` : (viewMode === 'desktop' ? '18px' : '14px'),
                  lineHeight: 1.5,
                  opacity: 0.8 
                }}
                isEditing={!isReadOnly && editingField === 'ending-win-subtitle'}
                isReadOnly={isReadOnly}
                onFocus={() => !isReadOnly && setEditingField('ending-win-subtitle')}
                onBlur={() => setEditingField(null)}
                fieldType="subtitle"
                width={config.endingWin.subtitleWidth || 100}
                onWidthChange={(width) => onUpdateConfig({ endingWin: { ...config.endingWin, subtitleWidth: width } })}
                marginBottom={viewMode === 'desktop' ? '48px' : '32px'}
              />
              
              <button
                onClick={() => {
                  setWonPrize(null);
                  setContactData({ name: '', email: '', phone: '' });
                }}
                className="font-semibold transition-opacity hover:opacity-90"
                style={unifiedButtonStyles}
              >
                Rejouer
              </button>
            </div>
          </div>
        );

      case 'ending-lose':
        const loseTitle = config.endingLose.title;
        const loseSubtitle = config.endingLose.subtitle;
        
        return (
          <div className="w-full h-full flex items-center justify-center" style={{ padding: viewMode === 'desktop' ? '35px 75px' : '24px' }}>
            <div className="w-full max-w-[700px] text-center">
              <EditableTextBlock
                value={config.endingLose.titleHtml || loseTitle}
                onChange={(value, html) => onUpdateConfig({ endingLose: { ...config.endingLose, title: value, titleHtml: html } })}
                onClear={() => onUpdateConfig({ endingLose: { ...config.endingLose, title: '', titleHtml: '' } })}
                className="font-bold"
                style={{ 
                  color: config.endingLose.titleStyle?.textColor || theme.textColor,
                  fontFamily: config.endingLose.titleStyle?.fontFamily || 'inherit',
                  fontWeight: config.endingLose.titleStyle?.isBold ? 'bold' : 700,
                  fontStyle: config.endingLose.titleStyle?.isItalic ? 'italic' : undefined,
                  textDecoration: config.endingLose.titleStyle?.isUnderline ? 'underline' : undefined,
                  textAlign: config.endingLose.titleStyle?.textAlign || 'center',
                  fontSize: config.endingLose.titleStyle?.fontSize ? `${config.endingLose.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '42px' : '28px'),
                  lineHeight: 1.2,
                }}
                isEditing={!isReadOnly && editingField === 'ending-lose-title'}
                isReadOnly={isReadOnly}
                onFocus={() => !isReadOnly && setEditingField('ending-lose-title')}
                onBlur={() => setEditingField(null)}
                fieldType="title"
                width={config.endingLose.titleWidth || 100}
                onWidthChange={(width) => onUpdateConfig({ endingLose: { ...config.endingLose, titleWidth: width } })}
                marginBottom={viewMode === 'desktop' ? '16px' : '8px'}
              />
              <EditableTextBlock
                value={config.endingLose.subtitleHtml || loseSubtitle}
                onChange={(value, html) => onUpdateConfig({ endingLose: { ...config.endingLose, subtitle: value, subtitleHtml: html } })}
                onClear={() => onUpdateConfig({ endingLose: { ...config.endingLose, subtitle: '', subtitleHtml: '' } })}
                className=""
                style={{ 
                  color: config.endingLose.subtitleStyle?.textColor || theme.textSecondaryColor, 
                  fontFamily: config.endingLose.subtitleStyle?.fontFamily || 'inherit',
                  fontWeight: config.endingLose.subtitleStyle?.isBold ? 'bold' : 400,
                  fontStyle: config.endingLose.subtitleStyle?.isItalic ? 'italic' : undefined,
                  textDecoration: config.endingLose.subtitleStyle?.isUnderline ? 'underline' : undefined,
                  textAlign: config.endingLose.subtitleStyle?.textAlign || 'center',
                  fontSize: config.endingLose.subtitleStyle?.fontSize ? `${config.endingLose.subtitleStyle.fontSize}px` : (viewMode === 'desktop' ? '18px' : '14px'),
                  lineHeight: 1.5,
                  opacity: 0.8 
                }}
                isEditing={!isReadOnly && editingField === 'ending-lose-subtitle'}
                isReadOnly={isReadOnly}
                onFocus={() => !isReadOnly && setEditingField('ending-lose-subtitle')}
                onBlur={() => setEditingField(null)}
                fieldType="subtitle"
                width={config.endingLose.subtitleWidth || 100}
                onWidthChange={(width) => onUpdateConfig({ endingLose: { ...config.endingLose, subtitleWidth: width } })}
                marginBottom={viewMode === 'desktop' ? '48px' : '32px'}
              />
              
              <button
                onClick={() => {
                  setWonPrize(null);
                  setContactData({ name: '', email: '', phone: '' });
                }}
                className="font-semibold transition-opacity hover:opacity-90"
                style={unifiedButtonStyles}
              >
                Rejouer
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={isMobileResponsive ? "w-full h-full relative overflow-hidden" : "flex items-center justify-center relative overflow-hidden"}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Image Upload Modal */}
      <ImageUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onImageSelect={handleImageSelect}
      />

      {/* Image Editor Modal */}
      <ImageEditorModal
        open={showEditorModal}
        onOpenChange={setShowEditorModal}
        imageUrl={uploadedImage || ''}
        settings={imageSettings}
        onSave={handleImageEdit}
      />

      <div 
        key={`preview-container-${viewMode}`}
        className="relative overflow-hidden transition-all duration-300 flex-shrink-0 flex flex-col" 
        style={{ 
          backgroundColor: (() => {
            const hasBackgroundImage = (() => {
              const applyToAll = config.welcomeScreen.applyBackgroundToAll;
              const welcomeDesktop = config.welcomeScreen.backgroundImage;
              const welcomeMobile = config.welcomeScreen.backgroundImageMobile;
              if (applyToAll && (welcomeDesktop || welcomeMobile)) return true;
              switch (activeView) {
                case 'welcome': return !!(welcomeDesktop || welcomeMobile);
                case 'contact': return !!(config.contactForm.backgroundImage || config.contactForm.backgroundImageMobile);
                case 'scratch': return !!(config.scratchScreen.backgroundImage || config.scratchScreen.backgroundImageMobile);
                case 'ending-win': return !!(config.endingWin.backgroundImage || config.endingWin.backgroundImageMobile);
                case 'ending-lose': return !!(config.endingLose.backgroundImage || config.endingLose.backgroundImageMobile);
                default: return false;
              }
            })();
            return hasBackgroundImage ? 'transparent' : theme.backgroundColor;
          })(),
          width: isMobileResponsive ? '100%' : (viewMode === 'desktop' ? '1100px' : '375px'), 
          minWidth: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '1100px' : '375px'),
          maxWidth: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '1100px' : '375px'),
          height: isMobileResponsive ? '100%' : (viewMode === 'desktop' ? '620px' : '667px'),
          minHeight: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '620px' : '667px'),
          maxHeight: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '620px' : '667px'),
        }}
      >
        {/* Background image from config settings */}
        {(() => {
          const getScreenBackground = () => {
            const applyToAll = config.welcomeScreen.applyBackgroundToAll;
            const welcomeDesktop = config.welcomeScreen.backgroundImage;
            const welcomeMobile = config.welcomeScreen.backgroundImageMobile;
            
            if (applyToAll && (welcomeDesktop || welcomeMobile)) {
              return viewMode === 'mobile' && welcomeMobile ? welcomeMobile : welcomeDesktop;
            }
            
            switch (activeView) {
              case 'welcome':
                return viewMode === 'mobile' && welcomeMobile ? welcomeMobile : welcomeDesktop;
              case 'contact':
                return viewMode === 'mobile' && config.contactForm.backgroundImageMobile 
                  ? config.contactForm.backgroundImageMobile 
                  : config.contactForm.backgroundImage;
              case 'scratch':
                return viewMode === 'mobile' && config.scratchScreen.backgroundImageMobile 
                  ? config.scratchScreen.backgroundImageMobile 
                  : config.scratchScreen.backgroundImage;
              case 'ending-win':
                return viewMode === 'mobile' && config.endingWin.backgroundImageMobile 
                  ? config.endingWin.backgroundImageMobile 
                  : config.endingWin.backgroundImage;
              case 'ending-lose':
                return viewMode === 'mobile' && config.endingLose.backgroundImageMobile 
                  ? config.endingLose.backgroundImageMobile 
                  : config.endingLose.backgroundImage;
              default:
                return undefined;
            }
          };
          
          const bgImage = getScreenBackground();
          
          if (!bgImage) return null;
          
          return (
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          );
        })()}

        {/* Header en overlay fixe au-dessus du contenu */}
        {config.layout?.header?.enabled && (
          <div className="absolute top-0 left-0 right-0 z-30">
            <CampaignHeader config={config.layout.header} isPreview />
          </div>
        )}

        {/* Contenu principal */}
        <div className="flex-1 relative overflow-auto z-10 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={activeView === 'contact' ? "w-full min-h-full relative z-10 flex flex-col" : "w-full h-full relative z-10"}
              onClick={(e) => {
                // Ne pas blur si on clique sur un input, textarea ou button
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.closest('input') || target.closest('textarea') || target.closest('button')) {
                  return;
                }
                setEditingField(null);
                if (document.activeElement instanceof HTMLElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                  document.activeElement.blur();
                }
              }}
            >
              {(() => {
                if (activeView !== 'contact') {
                  return renderContent();
                }
                
                // Pour la vue contact uniquement
                const getCurrentLayout = () => {
                  const layoutKey = viewMode === 'desktop' ? 'desktopLayout' : 'mobileLayout';
                  return config.contactForm[layoutKey];
                };
                
                const currentLayout = getCurrentLayout();
                const isContactWithGrid = viewMode === 'desktop' && (
                  currentLayout === 'desktop-left-right' || 
                  currentLayout === 'desktop-right-left' || 
                  currentLayout === 'desktop-panel' || 
                  currentLayout === 'desktop-card'
                );
                
                if (isContactWithGrid) {
                  return (
                    <div className="flex-1 grid grid-cols-2">
                      {renderContent()}
                    </div>
                  );
                }
                
                return renderContent();
              })()}
            </motion.div>
          </AnimatePresence>

          {/* Footer dans la zone scrollable */}
          {config.layout?.footer?.enabled && (
            <div className="relative z-10">
              <CampaignFooter config={config.layout.footer} isPreview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
