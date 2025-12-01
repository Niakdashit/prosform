import { motion, AnimatePresence } from "framer-motion";
import { QuizConfig } from "./QuizBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Smartphone, Clock, CheckCircle2, XCircle, X, Upload, Edit3, ImagePlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ImageEditorModal, ImageSettings, defaultSettings } from "./ImageEditorModal";
import { ImageUploadModal } from "./ImageUploadModal";
import { useTheme, getButtonStyles } from "@/contexts/ThemeContext";
import { WelcomeLayouts } from "./layouts/WelcomeLayouts";
import { EndingLayouts } from "./layouts/EndingLayouts";
import { ContactLayouts } from "./layouts/ContactLayouts";
import { EditableTextBlock } from "./EditableTextBlock";
import { cn } from "@/lib/utils";
import { CampaignHeader, CampaignFooter } from "./campaign";

interface QuizPreviewProps {
  config: QuizConfig;
  activeView: 'welcome' | 'contact' | 'question' | 'result';
  activeQuestionIndex: number;
  onUpdateConfig: (updates: Partial<QuizConfig>) => void;
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: () => void;
  isMobileResponsive?: boolean;
  isReadOnly?: boolean;
  onNext: () => void;
}

export const QuizPreview = ({ 
  config, 
  activeView,
  activeQuestionIndex,
  onUpdateConfig, 
  viewMode, 
  onToggleViewMode, 
  isMobileResponsive = false,
  isReadOnly = false,
  onNext 
}: QuizPreviewProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [variableTarget, setVariableTarget] = useState<'title' | 'subtitle' | null>(null);
  const [menuView, setMenuView] = useState<'main' | 'variables'>('main');
  const [imageSettings, setImageSettings] = useState<ImageSettings>(defaultSettings);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageRotation, setImageRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contactData, setContactData] = useState({ name: "", email: "", phone: "" });
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

      let screenKey: 'welcomeScreen' | 'contactScreen' | 'resultScreen';
      if (activeView === 'welcome') screenKey = 'welcomeScreen';
      else if (activeView === 'contact') screenKey = 'contactScreen';
      else screenKey = 'resultScreen';

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

  const availableVariables = [
    { key: 'score', label: 'Score', description: "Points gagnés" },
    { key: 'total', label: 'Total', description: "Points totaux possibles" },
  ];

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
    } else if (editingField === 'result-title') {
      onUpdateConfig({ 
        resultScreen: { 
          ...config.resultScreen, 
          title: config.resultScreen.title + `{{${variableKey}}}` 
        } 
      });
    } else if (editingField === 'result-subtitle') {
      onUpdateConfig({ 
        resultScreen: { 
          ...config.resultScreen, 
          subtitle: config.resultScreen.subtitle + `{{${variableKey}}}` 
        } 
      });
    }
    
    setShowVariableMenu(false);
    setMenuView('main');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onUpdateConfig({
        welcomeScreen: {
          ...config.welcomeScreen,
          wallpaperImage: result,
          showImage: true,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleTitleBlur = (field: string, value: string) => {
    if (field === 'welcome-title' && value.trim() !== config.welcomeScreen.title) {
      onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, title: value.trim() } });
    } else if (field === 'contact-title' && value.trim() !== config.contactScreen.title) {
      onUpdateConfig({ contactScreen: { ...config.contactScreen, title: value.trim() } });
    } else if (field === 'result-title' && value.trim() !== config.resultScreen.title) {
      onUpdateConfig({ resultScreen: { ...config.resultScreen, title: value.trim() } });
    }
    setEditingField(null);
  };

  const handleSubtitleBlur = (field: string, value: string) => {
    if (field === 'welcome-subtitle' && value.trim() !== config.welcomeScreen.subtitle) {
      onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, subtitle: value.trim() } });
    } else if (field === 'contact-subtitle' && value.trim() !== config.contactScreen.subtitle) {
      onUpdateConfig({ contactScreen: { ...config.contactScreen, subtitle: value.trim() } });
    } else if (field === 'result-subtitle' && value.trim() !== config.resultScreen.subtitle) {
      onUpdateConfig({ resultScreen: { ...config.resultScreen, subtitle: value.trim() } });
    }
    setEditingField(null);
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [activeQuestionIndex]: answerId
    });
  };

  const renderContent = () => {
    switch (activeView) {
      case 'welcome':
        const desktopLayout = config.welcomeScreen.desktopLayout || "desktop-left-right";
        const mobileLayout = config.welcomeScreen.mobileLayout || "mobile-vertical";
        
        // Image component (toujours même taille, même place)
        const baseSize = viewMode === 'desktop' ? 320 : 280;
        const scaledSize = baseSize * (imageSettings.size / 100);
        
        const ImageBlock = () => {
          const hasImage = config.welcomeScreen.wallpaperImage;
          
          return (
            <div
              className="overflow-hidden flex-shrink-0 relative group"
              style={{ 
                borderRadius: `${imageSettings.borderRadius}px`,
                width: `${scaledSize}px`,
                height: `${scaledSize}px`,
                maxWidth: '100%',
                border: imageSettings.borderWidth > 0 ? `${imageSettings.borderWidth}px solid ${imageSettings.borderColor}` : 'none',
              }}
            >
              {hasImage ? (
                <img
                  src={config.welcomeScreen.wallpaperImage}
                  alt="Quiz illustration"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `rotate(${imageSettings.rotation}deg) scaleX(${imageSettings.flipH ? -1 : 1}) scaleY(${imageSettings.flipV ? -1 : 1})`,
                    transition: 'transform 0.3s ease'
                  }}
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                  onClick={() => fileInputRef.current?.click()}
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
                  type="button"
                  onClick={() => setShowEditorModal(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: 'rgba(61, 55, 49, 0.9)' }}
                  title="Éditer l'image"
                >
                  <Edit3 className="w-4 h-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateConfig({
                      welcomeScreen: { ...config.welcomeScreen, showImage: false, wallpaperImage: undefined },
                    });
                    setImageSettings(defaultSettings);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 bg-red-500 hover:bg-red-600"
                  title="Supprimer l'image"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          );
        };

        // Alignment for the whole content block
        const alignment = config.welcomeScreen.alignment || 'left';
        const alignmentClass = alignment === 'center' ? 'text-center items-center' : alignment === 'right' ? 'text-right items-end' : 'text-left items-start';
        
        // Text content component
        const TextContent = ({ centered = false }: { centered?: boolean }) => {
          return (
            <div className={`flex flex-col ${alignmentClass}`}>
              {config.welcomeScreen.title && (
                <div className="relative">
                  <EditableTextBlock
                    value={config.welcomeScreen.titleHtml || config.welcomeScreen.title}
                    onChange={(value, html) => onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, title: value, titleHtml: html } })}
                    onClear={() => onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, title: '', titleHtml: '' } })}
                    onSparklesClick={() => { setVariableTarget('title'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
                    className="font-bold"
                    style={{ 
                      color: config.welcomeScreen.titleStyle?.textColor || theme.textColor,
                      fontFamily: config.welcomeScreen.titleStyle?.fontFamily || 'inherit',
                      fontWeight: config.welcomeScreen.titleStyle?.isBold ? 'bold' : undefined,
                      fontStyle: config.welcomeScreen.titleStyle?.isItalic ? 'italic' : undefined,
                      textDecoration: config.welcomeScreen.titleStyle?.isUnderline ? 'underline' : undefined,
                      textAlign: config.welcomeScreen.titleStyle?.textAlign || alignment,
                      fontSize: config.welcomeScreen.titleStyle?.fontSize ? `${config.welcomeScreen.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '42px' : '28px'),
                      lineHeight: '1.2',
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
                  {showVariableMenu && variableTarget === 'title' && editingField === 'welcome-title' && (
                    <div
                      className="absolute z-50 w-72 p-2 rounded-md shadow-xl animate-fade-in"
                      style={{
                        top: '32px',
                        right: 0,
                        backgroundColor: '#4A4138',
                        border: '1px solid rgba(245, 184, 0, 0.3)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                      }}
                    >
                      {menuView === 'main' ? (
                        <div className="space-y-1">
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => console.log('Réécriture AI')}
                            className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                          >
                            <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Réécriture</div>
                            <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Améliorer le texte avec l'IA</div>
                          </button>
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setMenuView('variables')}
                            className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                          >
                            <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Variable</div>
                            <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Insérer une variable dynamique</div>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setMenuView('main')}
                            className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2"
                          >
                            <div className="text-xs" style={{ color: '#A89A8A' }}>← Retour</div>
                          </button>
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>{variable.label}</div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>{variable.description} • {`{{${variable.key}}}`}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {config.welcomeScreen.subtitle && (
                <div className="relative">
                  <EditableTextBlock
                    value={config.welcomeScreen.subtitleHtml || config.welcomeScreen.subtitle}
                    onChange={(value, html) => onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, subtitle: value, subtitleHtml: html } })}
                    onClear={() => onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, subtitle: '', subtitleHtml: '' } })}
                    onSparklesClick={() => { setVariableTarget('subtitle'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
                    className=""
                    style={{ 
                      color: config.welcomeScreen.subtitleStyle?.textColor || theme.textSecondaryColor, 
                      fontFamily: config.welcomeScreen.subtitleStyle?.fontFamily || 'inherit',
                      fontWeight: config.welcomeScreen.subtitleStyle?.isBold ? 'bold' : undefined,
                      fontStyle: config.welcomeScreen.subtitleStyle?.isItalic ? 'italic' : undefined,
                      textDecoration: config.welcomeScreen.subtitleStyle?.isUnderline ? 'underline' : undefined,
                      textAlign: config.welcomeScreen.subtitleStyle?.textAlign || 'left',
                      fontSize: config.welcomeScreen.subtitleStyle?.fontSize ? `${config.welcomeScreen.subtitleStyle.fontSize}px` : (viewMode === 'desktop' ? '18px' : '14px'),
                      lineHeight: '1.4',
                      opacity: 0.9 
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
                  {showVariableMenu && variableTarget === 'subtitle' && editingField === 'welcome-subtitle' && (
                    <div
                      className="absolute z-50 w-72 p-2 rounded-md shadow-xl animate-fade-in"
                      style={{
                        top: '32px',
                        right: 0,
                        backgroundColor: '#4A4138',
                        border: '1px solid rgba(245, 184, 0, 0.3)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                      }}
                    >
                      {menuView === 'main' ? (
                        <div className="space-y-1">
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => console.log('Réécriture AI')}
                            className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                          >
                            <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Réécriture</div>
                            <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Améliorer le texte avec l'IA</div>
                          </button>
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setMenuView('variables')}
                            className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                          >
                            <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Variable</div>
                            <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Insérer une variable dynamique</div>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setMenuView('main')}
                            className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2"
                          >
                            <div className="text-xs" style={{ color: '#A89A8A' }}>← Retour</div>
                          </button>
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>{variable.label}</div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>{variable.description} • {`{{${variable.key}}}`}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            
            <button 
              onClick={onNext}
              className="flex items-center justify-center font-medium transition-all hover:opacity-90"
              style={unifiedButtonStyles}
            >
              <span>{config.welcomeScreen.buttonText || "Commencer"}</span>
            </button>
          </div>
          );
        };

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
            const textAlign = align;
            const textContainerClass =
              textAlign === 'center'
                ? 'max-w-[700px] mx-auto'
                : textAlign === 'right'
                ? 'max-w-[700px] ml-auto'
                : 'max-w-[700px]';

            return (
              <div
                className={`w-full h-full flex flex-col ${horizontalAlign} ${justifyClass} gap-10 px-24 py-12 overflow-y-auto scrollbar-hide`}
                style={{ padding: '35px 75px' }}
              >
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
                {config.welcomeScreen.wallpaperImage && (
                  <img
                    src={config.welcomeScreen.wallpaperImage}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className={`relative w-full h-full flex ${justifyContent} items-center px-24`}>
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
                <div className="absolute right-0 top-0 w-1/2 h-full">
                  <img
                    src={config.welcomeScreen.wallpaperImage || "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1600&h=1600&fit=crop"}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            );
          } else if (desktopLayout === 'desktop-panel') {
            return (
              <div className="relative w-full h-full flex">
                <div className="absolute left-0 top-0 w-1/2 h-full">
                  <img
                    src={config.welcomeScreen.wallpaperImage || "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1600&h=1600&fit=crop"}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-1/2 ml-auto flex items-center justify-center px-24 z-10">
                  <div className="max-w-[500px]">
                    <TextContent />
                  </div>
                </div>
              </div>
            );
          }
        } else {
          // Mobile layouts
          const imageAlignment = alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';
          if (mobileLayout === 'mobile-vertical') {
            return (
              <div className="flex flex-col gap-6 w-full max-w-[700px]" style={{ padding: '35px' }}>
                <div className="flex w-full" style={{ justifyContent: imageAlignment }}>
                  <ImageBlock />
                </div>
                <TextContent />
              </div>
            );
            return (
              <div className="flex gap-4 w-full max-w-[700px]" style={{ padding: '35px' }}>
                <div className="flex-1">
                  <TextContent />
                </div>
                <ImageBlock />
              </div>
            );
          } else if (mobileLayout === 'mobile-centered') {
            return (
              <div className="flex flex-col w-full h-full">
                <div className="w-full relative" style={{ height: '40%', minHeight: '250px' }}>
                  <img
                    src={config.welcomeScreen.wallpaperImage || "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1600&h=1600&fit=crop"}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex items-start justify-center px-5 pt-6 pb-24">
                  <div className="w-full max-w-[500px]">
                    <TextContent centered />
                  </div>
                </div>
              </div>
            );
          } else if (mobileLayout === 'mobile-minimal') {
            return (
              <div className="absolute inset-0">
                {config.welcomeScreen.wallpaperImage && (
                  <img
                    src={config.welcomeScreen.wallpaperImage}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="relative w-full h-full flex items-center justify-center px-5">
                  <div className="w-full max-w-[500px]">
                    <TextContent centered />
                  </div>
                </div>
              </div>
            );
          }
        }

        // Fallback
        return (
          <div className="w-full h-full flex flex-col items-start justify-start gap-10 px-24 py-12">
            <ImageBlock />
            <div className="max-w-[700px]">
              <TextContent />
            </div>
          </div>
        );

      case 'contact': {
        const layoutKey = viewMode === 'desktop' ? 'desktopLayout' : 'mobileLayout';
        const currentLayout = config.contactScreen[layoutKey];
        
        // Définir ContactForm une seule fois pour être accessible à tous les layouts
        const ContactForm = () => (
          <div className="w-full max-w-md text-center px-4">
            <EditableTextBlock
              value={config.contactScreen.title}
              onChange={(value, html) => onUpdateConfig({ contactScreen: { ...config.contactScreen, title: value, titleHtml: html } })}
              onClear={() => onUpdateConfig({ contactScreen: { ...config.contactScreen, title: '', titleHtml: '' } })}
              onSparklesClick={() => {
                setVariableTarget('title');
                setShowVariableMenu(prev => !prev);
                setMenuView('main');
              }}
              className="font-bold"
              style={{
                color: config.contactScreen.titleStyle?.textColor || theme.textColor,
                fontFamily: config.contactScreen.titleStyle?.fontFamily || 'inherit',
                fontSize: viewMode === 'mobile' ? '28px' : '42px',
                lineHeight: '1.2',
              }}
              isEditing={!isReadOnly && editingField === 'contact-title'}
              isReadOnly={isReadOnly}
              onFocus={() => !isReadOnly && setEditingField('contact-title')}
              onBlur={() => handleTitleBlur('contact-title', config.contactScreen.title)}
              fieldType="title"
              marginBottom="16px"
            />
            
            <EditableTextBlock
              value={config.contactScreen.subtitle}
              onChange={(value, html) => onUpdateConfig({ contactScreen: { ...config.contactScreen, subtitle: value, titleHtml: html } })}
              onClear={() => onUpdateConfig({ contactScreen: { ...config.contactScreen, subtitle: '', subtitleHtml: '' } })}
              onSparklesClick={() => {
                setVariableTarget('subtitle');
                setShowVariableMenu(prev => !prev);
                setMenuView('main');
              }}
              className=""
              style={{
                color: config.contactScreen.subtitleStyle?.textColor || theme.textColor,
                fontFamily: config.contactScreen.subtitleStyle?.fontFamily || 'inherit',
                fontSize: viewMode === 'mobile' ? '14px' : '18px',
                lineHeight: '1.4',
                opacity: 0.8,
              }}
              isEditing={!isReadOnly && editingField === 'contact-subtitle'}
              isReadOnly={isReadOnly}
              onFocus={() => !isReadOnly && setEditingField('contact-subtitle')}
              onBlur={() => handleSubtitleBlur('contact-subtitle', config.contactScreen.subtitle)}
              fieldType="subtitle"
              marginBottom="32px"
            />
            
            <div className="space-y-4">
              {config.contactScreen.fields.map((field, index) => {
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
          const contactBannerImage = config.contactScreen.backgroundImageMobile || config.contactScreen.backgroundImage;
          
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
          const contactImageDesktop = config.contactScreen.backgroundImage;
          
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
          const contactImageDesktop = config.contactScreen.backgroundImage;
          
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
            title={config.contactScreen.title}
            subtitle={config.contactScreen.subtitle}
            fields={config.contactScreen.fields}
            contactData={contactData}
            onFieldChange={(type, value) =>
              setContactData(prev => ({ ...prev, [type]: value }))
            }
            onSubmit={onNext}
            backgroundColor={theme.backgroundColor}
            textColor={theme.textColor}
            buttonColor={theme.buttonColor}
            backgroundImage={viewMode === 'desktop' ? config.contactScreen.backgroundImage : config.contactScreen.backgroundImageMobile}
            editingField={editingField}
            isReadOnly={isReadOnly}
            onFocusTitle={() => !isReadOnly && setEditingField('contact-title')}
            onFocusSubtitle={() => !isReadOnly && setEditingField('contact-subtitle')}
            onBlurTitle={(value) => handleTitleBlur('contact-title', value)}
            onBlurSubtitle={(value) => handleSubtitleBlur('contact-subtitle', value)}
            onChangeTitle={(value, html) => onUpdateConfig({ contactScreen: { ...config.contactScreen, title: value, titleHtml: html } })}
            onChangeSubtitle={(value, html) => onUpdateConfig({ contactScreen: { ...config.contactScreen, subtitle: value, subtitleHtml: html } })}
            onClearTitle={() => onUpdateConfig({ contactScreen: { ...config.contactScreen, title: '', titleHtml: '' } })}
            onClearSubtitle={() => onUpdateConfig({ contactScreen: { ...config.contactScreen, subtitle: '', subtitleHtml: '' } })}
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
            titleStyle={config.contactScreen.titleStyle}
            subtitleStyle={config.contactScreen.subtitleStyle}
          />
        );
      }

      case 'question':
        const question = config.questions[activeQuestionIndex];
        if (!question) return null;

        const selectedAnswer = selectedAnswers[activeQuestionIndex];
        const isAnswered = !!selectedAnswer;

        return (
          <div className="flex w-full h-full items-center justify-center" style={{ padding: viewMode === 'desktop' ? '32px 64px' : '24px 20px' }}>
            <div className="w-full max-w-3xl space-y-6">
              {/* Progress bar */}
              {config.settings.showProgressBar && (
                <div className="w-full rounded-full h-2" style={{ backgroundColor: theme.surfaceColor || 'rgba(0,0,0,0.1)' }}>
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((activeQuestionIndex + 1) / config.questions.length) * 100}%`,
                      backgroundColor: theme.accentColor
                    }}
                  />
                </div>
              )}

              {/* Question header */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold" style={{ color: theme.accentColor }}>
                  Question {activeQuestionIndex + 1} / {config.questions.length}
                </div>
                {question.timeLimit && (
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: theme.textSecondaryColor }}>
                    <Clock className="w-4 h-4" />
                    <span>{question.timeLimit}s</span>
                  </div>
                )}
              </div>

              {/* Question */}
              <div>
                <h2 
                  className="font-bold mb-2 leading-tight"
                  style={{ 
                    color: theme.textColor,
                    fontSize: viewMode === 'desktop' ? '28px' : '22px',
                    fontFamily: theme.fontFamily === 'inter' ? 'Inter, sans-serif' : 
                               theme.fontFamily === 'roboto' ? 'Roboto, sans-serif' :
                               theme.fontFamily === 'poppins' ? 'Poppins, sans-serif' :
                               'Montserrat, sans-serif'
                  }}
                >
                  {question.question}
                </h2>
                <p className="text-sm font-medium" style={{ color: theme.accentColor }}>
                  {question.points} points
                </p>
              </div>

              {/* Answers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.answers.map((answer) => {
                  const isSelected = selectedAnswer === answer.id;
                  const showCorrect = isAnswered && answer.isCorrect;
                  const showIncorrect = isAnswered && isSelected && !answer.isCorrect;

                  const answerStyle = config.settings.answerStyle || 'filled';

                  // Base style selon le display style choisi
                  let baseBg = theme.buttonColor;
                  let baseBorderColor = 'transparent';
                  let baseTextColor = theme.buttonTextColor;

                  if (answerStyle === 'outline') {
                    baseBg = theme.surfaceColor;
                    baseBorderColor = theme.buttonColor;
                    baseTextColor = theme.buttonColor;
                  } else if (answerStyle === 'soft') {
                    // Cadre avec coins carrés (0px de border radius)
                    baseBg = theme.surfaceColor;
                    baseBorderColor = theme.buttonColor;
                    baseTextColor = theme.primaryColor;
                  }

                  // États spéciaux (correct / incorrect / sélectionné)
                  let finalBg = baseBg;
                  let finalBorderColor = baseBorderColor;
                  let finalTextColor = baseTextColor;

                  if (showCorrect) {
                    finalBg = '#22c55e';
                    finalBorderColor = 'transparent';
                    finalTextColor = '#ffffff';
                  } else if (showIncorrect) {
                    finalBg = '#ef4444';
                    finalBorderColor = 'transparent';
                    finalTextColor = '#ffffff';
                  } else if (isSelected && !isAnswered) {
                    if (answerStyle === 'outline' || answerStyle === 'soft') {
                      finalBg = theme.accentColor;
                      finalBorderColor = 'transparent';
                      finalTextColor = theme.buttonTextColor;
                    } else {
                      finalBg = theme.accentColor;
                    }
                  }

                  return (
                    <motion.button
                      key={answer.id}
                      onClick={() => !isAnswered && handleAnswerSelect(answer.id)}
                      disabled={isAnswered}
                      whileHover={!isAnswered ? { scale: 1.01 } : {}}
                      whileTap={!isAnswered ? { scale: 0.99 } : {}}
                      className={cn(
                        "px-5 py-4 transition-all text-left relative",
                        "flex items-center gap-4",
                        isAnswered && "cursor-not-allowed"
                      )}
                      style={{
                        backgroundColor: finalBg,
                        borderWidth: (answerStyle === 'outline' || answerStyle === 'soft') && !showCorrect && !showIncorrect ? '2px' : '0px',
                        borderStyle: 'solid',
                        borderColor: finalBorderColor,
                        borderRadius: (answerStyle === 'soft' || answerStyle === 'filled-square') ? 0 : `${theme.borderRadius}px`,
                        opacity: isAnswered && !isSelected && !showCorrect ? 0.6 : 1
                      }}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor: answerStyle === 'filled' ? 'rgba(255,255,255,0.5)' : baseBorderColor || theme.borderColor,
                          backgroundColor: isSelected && !isAnswered ? (answerStyle === 'filled' ? 'rgba(255,255,255,0.3)' : 'transparent') : 'transparent'
                        }}
                      >
                        {isSelected && !isAnswered && answerStyle === 'filled' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                        {showCorrect && <CheckCircle2 className="w-4 h-4 text-white" />}
                        {showIncorrect && <XCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span 
                        className="text-base font-medium flex-1"
                        style={{ color: finalTextColor }}
                      >
                        {answer.text}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isAnswered && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <p className="text-base font-semibold mb-2" style={{ color: theme.textColor }}>
                    Explication
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: theme.textSecondaryColor }}>
                    {question.explanation}
                  </p>
                </motion.div>
              )}

              {/* Next button */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end pt-4"
                >
                  <button
                    onClick={onNext}
                    className="flex items-center justify-center font-medium transition-all hover:opacity-90"
                    style={unifiedButtonStyles}
                  >
                    {activeQuestionIndex < config.questions.length - 1 ? 'Question suivante →' : 'Voir les résultats 🎉'}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 'result':
        // Calculate score
        const totalQuestions = config.questions.length;
        const correctAnswers = Object.entries(selectedAnswers).filter(([index, answerId]) => {
          const question = config.questions[parseInt(index)];
          return question?.answers.find(a => a.id === answerId)?.isCorrect;
        }).length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const totalPoints = config.questions.reduce((sum, q) => sum + q.points, 0);
        const earnedPoints = Object.entries(selectedAnswers).reduce((sum, [index, answerId]) => {
          const question = config.questions[parseInt(index)];
          const answer = question?.answers.find(a => a.id === answerId);
          return sum + (answer?.isCorrect ? question.points : 0);
        }, 0);

        const resultTitle = config.resultScreen.title
          .replace('{{score}}', earnedPoints.toString())
          .replace('{{total}}', totalPoints.toString());
        const resultSubtitle = config.resultScreen.subtitle
          .replace('{{score}}', earnedPoints.toString())
          .replace('{{total}}', totalPoints.toString());

        return (
          <div className="w-full h-full flex items-center justify-center" style={{ padding: viewMode === 'desktop' ? '35px 75px' : '24px' }}>
            <div className="w-full max-w-[700px] text-center relative">
              {resultTitle && (
                <div className="relative">
                  <EditableTextBlock
                    value={config.resultScreen.titleHtml || resultTitle}
                    onChange={(value, html) => onUpdateConfig({ resultScreen: { ...config.resultScreen, title: value, titleHtml: html } })}
                    onClear={() => onUpdateConfig({ resultScreen: { ...config.resultScreen, title: '', titleHtml: '' } })}
                    onSparklesClick={() => { setVariableTarget('title'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
                    className="font-bold"
                    style={{ 
                      color: config.resultScreen.titleStyle?.textColor || theme.textColor,
                      fontFamily: config.resultScreen.titleStyle?.fontFamily || 'inherit',
                      fontWeight: config.resultScreen.titleStyle?.isBold ? 'bold' : 700,
                      fontStyle: config.resultScreen.titleStyle?.isItalic ? 'italic' : undefined,
                      textDecoration: config.resultScreen.titleStyle?.isUnderline ? 'underline' : undefined,
                      textAlign: config.resultScreen.titleStyle?.textAlign || 'center',
                      fontSize: config.resultScreen.titleStyle?.fontSize ? `${config.resultScreen.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '42px' : '28px'),
                      lineHeight: 1.2,
                    }}
                    isEditing={!isReadOnly && editingField === 'result-title'}
                    isReadOnly={isReadOnly}
                    onFocus={() => !isReadOnly && setEditingField('result-title')}
                    onBlur={() => setEditingField(null)}
                    fieldType="title"
                    width={config.resultScreen.titleWidth || 100}
                    onWidthChange={(width) => onUpdateConfig({ resultScreen: { ...config.resultScreen, titleWidth: width } })}
                    marginBottom={viewMode === 'desktop' ? '16px' : '8px'}
                  />
                  {showVariableMenu && variableTarget === 'title' && editingField === 'result-title' && (
                    <div
                      className="absolute z-50 w-72 p-2 rounded-md shadow-xl animate-fade-in"
                      style={{
                        top: '32px',
                        right: 0,
                        backgroundColor: '#4A4138',
                        border: '1px solid rgba(245, 184, 0, 0.3)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                      }}
                    >
                      {menuView === 'main' ? (
                        <div className="space-y-1">
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => console.log('Réécriture AI')}
                            className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                          >
                            <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Réécriture</div>
                            <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Améliorer le texte avec l'IA</div>
                          </button>
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setMenuView('variables')}
                            className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                          >
                            <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Variable</div>
                            <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Insérer une variable dynamique</div>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setMenuView('main')}
                            className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2"
                          >
                            <div className="text-xs" style={{ color: '#A89A8A' }}>← Retour</div>
                          </button>
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>{variable.label}</div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>{variable.description} • {`{{${variable.key}}}`}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {resultSubtitle && (
                <div className="relative">
                  <EditableTextBlock
                    value={config.resultScreen.subtitleHtml || resultSubtitle}
                    onChange={(value, html) => onUpdateConfig({ resultScreen: { ...config.resultScreen, subtitle: value, subtitleHtml: html } })}
                    onClear={() => onUpdateConfig({ resultScreen: { ...config.resultScreen, subtitle: '', subtitleHtml: '' } })}
                    onSparklesClick={() => { setVariableTarget('subtitle'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
                    className=""
                    style={{ 
                      color: config.resultScreen.subtitleStyle?.textColor || theme.textSecondaryColor, 
                      fontFamily: config.resultScreen.subtitleStyle?.fontFamily || 'inherit',
                      fontWeight: config.resultScreen.subtitleStyle?.isBold ? 'bold' : 400,
                      fontStyle: config.resultScreen.subtitleStyle?.isItalic ? 'italic' : undefined,
                      textDecoration: config.resultScreen.subtitleStyle?.isUnderline ? 'underline' : undefined,
                      textAlign: config.resultScreen.subtitleStyle?.textAlign || 'center',
                      fontSize: config.resultScreen.subtitleStyle?.fontSize ? `${config.resultScreen.subtitleStyle.fontSize}px` : (viewMode === 'desktop' ? '18px' : '14px'),
                      lineHeight: 1.5,
                      opacity: 0.8 
                    }}
                    isEditing={!isReadOnly && editingField === 'result-subtitle'}
                    isReadOnly={isReadOnly}
                    onFocus={() => !isReadOnly && setEditingField('result-subtitle')}
                    onBlur={() => setEditingField(null)}
                    fieldType="subtitle"
                    width={config.resultScreen.subtitleWidth || 100}
                    onWidthChange={(width) => onUpdateConfig({ resultScreen: { ...config.resultScreen, subtitleWidth: width } })}
                    marginBottom={viewMode === 'desktop' ? '48px' : '32px'}
                  />
                  {showVariableMenu && variableTarget === 'subtitle' && editingField === 'result-subtitle' && (
                    <div
                      className="absolute z-50 w-72 p-2 rounded-md shadow-xl animate-fade-in"
                      style={{
                        top: '32px',
                        right: 0,
                        backgroundColor: '#4A4138',
                        border: '1px solid rgba(245, 184, 0, 0.3)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                      }}
                    >
                      {menuView === 'main' ? (
                        <div className="space-y-1">
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => console.log('Réécriture AI')}
                            className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                          >
                            <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Réécriture</div>
                            <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Améliorer le texte avec l'IA</div>
                          </button>
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setMenuView('variables')}
                            className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                          >
                            <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Variable</div>
                            <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Insérer une variable dynamique</div>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setMenuView('main')}
                            className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2"
                          >
                            <div className="text-xs" style={{ color: '#A89A8A' }}>← Retour</div>
                          </button>
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>{variable.label}</div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>{variable.description} • {`{{${variable.key}}}`}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center font-medium transition-all hover:opacity-90"
                  style={unifiedButtonStyles}
                >
                  Recommencer
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={isMobileResponsive ? "w-full h-full relative overflow-hidden" : "flex items-center justify-center relative overflow-hidden"}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <div 
        key={`preview-container-${viewMode}`}
        className="relative overflow-hidden transition-all duration-300 flex flex-col" 
        style={{ 
          backgroundColor: (() => {
            const hasBackgroundImage = (() => {
              const applyToAll = config.welcomeScreen.applyBackgroundToAll;
              const welcomeDesktop = config.welcomeScreen.backgroundImage;
              const welcomeMobile = config.welcomeScreen.backgroundImageMobile;
              if (applyToAll && (welcomeDesktop || welcomeMobile)) return true;
              switch (activeView) {
                case 'welcome': return !!(welcomeDesktop || welcomeMobile);
                case 'contact': return !!(config.contactScreen.backgroundImage || config.contactScreen.backgroundImageMobile);
                case 'result': return !!(config.resultScreen.backgroundImage || config.resultScreen.backgroundImageMobile);
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
                return viewMode === 'mobile' && config.contactScreen.backgroundImageMobile 
                  ? config.contactScreen.backgroundImageMobile 
                  : config.contactScreen.backgroundImage;
              case 'result':
                return viewMode === 'mobile' && config.resultScreen.backgroundImageMobile 
                  ? config.resultScreen.backgroundImageMobile 
                  : config.resultScreen.backgroundImage;
              default:
                return undefined;
            }
          };
          
          const bgImage = getScreenBackground();
          
          if (!bgImage) return null;
          
          return (
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 0,
              }}
            />
          );
        })()}

        {/* Header */}
        {config.layout?.header?.enabled && (
          <div className="relative z-20 flex-shrink-0">
            <CampaignHeader config={config.layout.header} isPreview />
          </div>
        )}

        {/* Contenu principal */}
        <div className="flex-1 relative overflow-auto z-10 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeView}-${activeQuestionIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full relative z-10"
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
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Footer en bas, en dehors de la zone scrollable */}
        {config.layout?.footer?.enabled && (
          <div className="flex-shrink-0 relative z-10">
            <CampaignFooter config={config.layout.footer} isPreview />
          </div>
        )}
      </div>

      {/* Image Editor Modal */}
      <ImageEditorModal
        open={showEditorModal}
        onOpenChange={setShowEditorModal}
        imageUrl={config.welcomeScreen.wallpaperImage || ''}
        settings={imageSettings}
        onSave={(settings) => setImageSettings(settings)}
      />
    </div>
  );
};
