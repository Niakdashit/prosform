import { motion, AnimatePresence } from "framer-motion";
import { WheelConfig } from "./WheelBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Smartphone, Sparkles, Upload, ImagePlus, Edit3, Clock } from "lucide-react";
import { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import SmartWheel from "./SmartWheel/SmartWheel";
import { LayoutWrapper } from "./layouts/LayoutWrapper";
import { WelcomeLayouts } from "./layouts/WelcomeLayouts";
import { ContactLayouts } from "./layouts/ContactLayouts";
import { WheelLayouts } from "./layouts/WheelLayouts";
import { EndingLayouts } from "./layouts/EndingLayouts";
import { ImageUploadModal } from "./ImageUploadModal";
import { ImageEditorModal } from "./ImageEditorModal";

interface WheelPreviewProps {
  config: WheelConfig;
  activeView: 'welcome' | 'contact' | 'wheel' | 'ending';
  onUpdateConfig: (updates: Partial<WheelConfig>) => void;
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: () => void;
  isMobileResponsive?: boolean;
  onNext: () => void;
}

export const WheelPreview = ({ 
  config, 
  activeView, 
  onUpdateConfig, 
  viewMode, 
  onToggleViewMode, 
  isMobileResponsive = false,
  onNext 
}: WheelPreviewProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '' });
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [variableTarget, setVariableTarget] = useState<'title' | 'subtitle' | null>(null);
  const [menuView, setMenuView] = useState<'main' | 'variables'>('main');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageRotation, setImageRotation] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

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
        setUploadedImage(reader.result as string);
        setImageRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (imageData: string) => {
    setUploadedImage(imageData);
    setImageRotation(0);
  };

  const handleImageEdit = (rotation: number) => {
    setImageRotation(rotation);
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
    } else if (editingField === 'ending-title') {
      onUpdateConfig({ 
        endingScreen: { 
          ...config.endingScreen, 
          title: config.endingScreen.title + `{{${variableKey}}}` 
        } 
      });
    } else if (editingField === 'ending-subtitle') {
      onUpdateConfig({ 
        endingScreen: { 
          ...config.endingScreen, 
          subtitle: config.endingScreen.subtitle + `{{${variableKey}}}` 
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
    } else if (field === 'ending-title' && value.trim() !== config.endingScreen.title) {
      onUpdateConfig({ endingScreen: { ...config.endingScreen, title: value.trim() } });
    }
    setEditingField(null);
    setShowVariableMenu(false);
  };

  const handleSubtitleBlur = (field: string, value: string) => {
    if (field === 'welcome-subtitle' && value.trim() !== config.welcomeScreen.subtitle) {
      onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, subtitle: value.trim() } });
    } else if (field === 'contact-subtitle' && value.trim() !== config.contactForm.subtitle) {
      onUpdateConfig({ contactForm: { ...config.contactForm, subtitle: value.trim() } });
    } else if (field === 'ending-subtitle' && value.trim() !== config.endingScreen.subtitle) {
      onUpdateConfig({ endingScreen: { ...config.endingScreen, subtitle: value.trim() } });
    }
    setEditingField(null);
    setShowVariableMenu(false);
  };

  const getCurrentLayout = () => {
    const layoutKey = viewMode === 'desktop' ? 'desktopLayout' : 'mobileLayout';
    switch (activeView) {
      case 'welcome':
        return config.welcomeScreen[layoutKey];
      case 'contact':
        return config.contactForm[layoutKey];
      case 'wheel':
        return config.wheelScreen[layoutKey];
      case 'ending':
        return config.endingScreen[layoutKey];
      default:
        return viewMode === 'desktop' ? 'desktop-centered' : 'mobile-vertical';
    }
  };

  const handleSpin = () => {
    setIsSpinning(true);
    
    // Calculer le gagnant basé sur les probabilités
    const random = Math.random() * 100;
    let cumulative = 0;
    let winner = config.segments[0];
    
    for (const segment of config.segments) {
      cumulative += segment.probability || 0;
      if (random <= cumulative) {
        winner = segment;
        break;
      }
    }
    
    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(winner.label);
      onNext();
    }, 3000);
  };

  const renderContent = () => {
    const currentLayout = getCurrentLayout();

    switch (activeView) {
      case 'welcome':
        return (
          <div
            className="flex w-full h-full"
            style={{
              alignItems: viewMode === "desktop" ? "center" : "flex-start",
              justifyContent: viewMode === "desktop" ? "center" : "flex-start",
              padding:
                viewMode === "desktop"
                  ? currentLayout === "desktop-card" || currentLayout === "desktop-panel"
                    ? "0"
                    : "0 64px"
                  : currentLayout === "mobile-centered"
                  ? "0"
                  : "24px 20px",
              paddingLeft:
                viewMode === "mobile" && currentLayout === "mobile-centered"
                  ? 0
                  : viewMode === "desktop" && (currentLayout === "desktop-card" || currentLayout === "desktop-panel")
                  ? 0
                  : "7%",
              paddingRight:
                viewMode === "mobile" && currentLayout === "mobile-centered"
                  ? 0
                  : viewMode === "desktop" && (currentLayout === "desktop-card" || currentLayout === "desktop-panel")
                  ? 0
                  : "7%",
            }}
          >
            {(() => {
              const desktopLayout = config.welcomeScreen.desktopLayout || "desktop-left-right";
              const mobileLayout = config.welcomeScreen.mobileLayout || "mobile-vertical";
              const currentLayoutType = viewMode === "desktop" ? desktopLayout : mobileLayout;

              // Image component with upload functionality
              const ImageBlock = () => (
                <div
                  className="overflow-hidden relative group"
                  style={{ 
                    borderRadius: "36px",
                    width: viewMode === 'desktop' ? '420px' : currentLayoutType === 'mobile-horizontal' ? '140px' : '280px',
                    height: viewMode === 'desktop' ? '420px' : currentLayoutType === 'mobile-horizontal' ? '140px' : '280px',
                    maxWidth: '100%',
                    flexShrink: 0
                  }}
                >
                  {uploadedImage ? (
                    <>
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                        style={{
                          transform: `rotate(${imageRotation}deg)`,
                          transition: 'transform 0.3s ease'
                        }}
                      />
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
                    </>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Upload className="w-12 h-12 mb-3" style={{ color: theme.buttonColor }} />
                      <p className="text-sm font-medium" style={{ color: theme.buttonColor }}>
                        Upload Image
                      </p>
                      <p className="text-xs mt-1" style={{ color: theme.systemColor }}>
                        Click to browse
                      </p>
                    </div>
                  )}
                </div>
              );

              // Text content component  
              const TextContent = ({ centered = false }: { centered?: boolean }) => (
                <div className={centered && viewMode === 'desktop' ? 'text-center' : ''}>
                  <div className="relative">
                    {editingField === 'welcome-title' && (
                      <>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setVariableTarget('title'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
                          className="absolute -top-3 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50 animate-fade-in"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        {showVariableMenu && variableTarget === 'title' && (
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
                      </>
                    )}

                    <h1 
                      className="font-bold cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                        color: theme.accentColor, 
                        fontWeight: 700, 
                        fontSize: viewMode === 'desktop' ? '64px' : '32px',
                        lineHeight: '1.05',
                        letterSpacing: '-0.02em',
                        marginBottom: `${24}px`,
                        outline: editingField === 'welcome-title' ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
                        padding: '4px',
                        marginTop: '-4px',
                        marginLeft: '-4px',
                        marginRight: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('welcome-title')}
                      onBlur={(e) => handleTitleBlur('welcome-title', e.currentTarget.textContent || '')}
                    >
                      {config.welcomeScreen.title}
                    </h1>
                  </div>
                  
                  <div className="relative">
                    {editingField === 'welcome-subtitle' && (
                      <>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setVariableTarget('subtitle'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
                          className="absolute -top-3 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50 animate-fade-in"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        {showVariableMenu && variableTarget === 'subtitle' && (
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
                      </>
                    )}

                    <p 
                      className="text-[16px] cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                        color: '#B8A892',
                        fontSize: viewMode === 'desktop' ? '16px' : '14px',
                        lineHeight: '1.6',
                        marginBottom: `${32}px`,
                        outline: editingField === 'welcome-subtitle' ? '2px solid rgba(184, 168, 146, 0.5)' : 'none',
                        padding: '4px',
                        marginTop: '-4px',
                        marginLeft: '-4px',
                        marginRight: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('welcome-subtitle')}
                      onBlur={(e) => handleSubtitleBlur('welcome-subtitle', e.currentTarget.textContent || '')}
                    >
                      {config.welcomeScreen.subtitle}
                    </p>
                  </div>
                  
                  <button
                    onClick={onNext}
                    className="flex items-center gap-3 px-7 font-semibold transition-opacity hover:opacity-90"
                    style={{ 
                      backgroundColor: '#F5CA3C', 
                      color: '#3D3731',
                      height: '56px',
                      borderRadius: '28px',
                      fontSize: '17px',
                      border: 'none',
                      boxShadow: 'none'
                    }}
                  >
                    <span>{config.welcomeScreen.buttonText || "Start"}</span>
                    <span className="font-normal" style={{ color: 'rgba(61, 55, 49, 0.55)', fontSize: '14px' }}>
                      press <strong style={{ fontWeight: 600 }}>Enter</strong> ↵
                    </span>
                  </button>
                  <div className="flex items-center gap-2.5 mt-5" style={{ color: '#A89A8A', fontSize: '14px' }}>
                    <Clock className="w-4 h-4" />
                    <span>Takes X minutes</span>
                  </div>
                </div>
              );

              // Desktop layouts - COPIÉ EXACTEMENT DE FORMPREVIEW
              if (viewMode === 'desktop') {
                if (desktopLayout === 'desktop-left-right') {
                  const alignment = 'left';
                  const alignmentClass = 'items-start';
                  
                  return (
                    <div className={`w-full h-full flex flex-col ${alignmentClass} justify-start gap-10 px-24 py-12 overflow-y-auto scrollbar-hide`}>
                      <ImageBlock />
                      <TextContent />
                    </div>
                  );
                }

                if (desktopLayout === 'desktop-right-left') {
                  return (
                    <div className="w-full h-full flex items-center justify-between gap-12 px-16">
                      <div className="flex-1 max-w-md">
                        <TextContent />
                      </div>
                      <ImageBlock />
                    </div>
                  );
                }

                if (desktopLayout === 'desktop-centered') {
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-8 px-16">
                      <ImageBlock />
                      <div className="max-w-2xl w-full">
                        <TextContent centered={true} />
                      </div>
                    </div>
                  );
                }

                if (desktopLayout === 'desktop-card') {
                  return (
                    <div className="w-full h-full flex items-center justify-center p-8">
                      <div 
                        className="flex items-center gap-8 p-12 rounded-3xl shadow-2xl max-w-5xl"
                        style={{ backgroundColor: theme.backgroundColor }}
                      >
                        <ImageBlock />
                        <div className="flex-1">
                          <TextContent />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (desktopLayout === 'desktop-panel') {
                  return (
                    <div className="w-full h-full flex">
                      <div className="flex-1 flex items-center justify-center p-12">
                        <TextContent />
                      </div>
                      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                        <ImageBlock />
                      </div>
                    </div>
                  );
                }

                if (desktopLayout === 'desktop-split') {
                  return (
                    <div className="w-full h-full flex">
                      <div className="w-1/2 flex items-center justify-center p-12">
                        <ImageBlock />
                      </div>
                      <div className="w-1/2 flex items-center justify-center p-12" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                        <TextContent />
                      </div>
                    </div>
                  );
                }

                if (desktopLayout === 'desktop-wallpaper') {
                  return (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <div className="absolute inset-0 overflow-hidden">
                        {uploadedImage && (
                          <img
                            src={uploadedImage}
                            alt="Background"
                            className="w-full h-full object-cover opacity-30"
                          />
                        )}
                      </div>
                      <div className="relative z-10 max-w-2xl px-12">
                        <TextContent centered={true} />
                      </div>
                    </div>
                  );
                }
              }

              // Mobile layouts - COPIÉ EXACTEMENT DE FORMPREVIEW
              if (viewMode === 'mobile') {
                if (mobileLayout === 'mobile-vertical') {
                  return (
                    <div className="w-full h-full flex flex-col items-start justify-start gap-6 px-5 py-8 overflow-y-auto">
                      <ImageBlock />
                      <TextContent />
                    </div>
                  );
                }

                if (mobileLayout === 'mobile-horizontal') {
                  return (
                    <div className="w-full h-full flex flex-col justify-center px-5 py-8 gap-4">
                      <div className="flex items-center gap-4">
                        <ImageBlock />
                        <div className="flex-1">
                          <h1 
                            className="text-2xl font-bold mb-2 cursor-text" 
                            style={{ color: theme.accentColor }}
                            contentEditable
                            suppressContentEditableWarning
                            onFocus={() => setEditingField('welcome-title')}
                            onBlur={(e) => handleTitleBlur('welcome-title', e.currentTarget.textContent || '')}
                          >
                            {config.welcomeScreen.title}
                          </h1>
                        </div>
                      </div>
                      <p 
                        className="text-sm mb-4 cursor-text" 
                        style={{ color: '#B8A892' }}
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => setEditingField('welcome-subtitle')}
                        onBlur={(e) => handleSubtitleBlur('welcome-subtitle', e.currentTarget.textContent || '')}
                      >
                        {config.welcomeScreen.subtitle}
                      </p>
                      <button
                        onClick={onNext}
                        className="w-full py-3 rounded-full font-semibold"
                        style={{ backgroundColor: theme.buttonColor, color: '#3D3731' }}
                      >
                        {config.welcomeScreen.buttonText || "Start"}
                      </button>
                    </div>
                  );
                }

                if (mobileLayout === 'mobile-centered') {
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center px-6 py-8 gap-6">
                      <ImageBlock />
                      <TextContent centered={true} />
                    </div>
                  );
                }

                if (mobileLayout === 'mobile-minimal') {
                  return (
                    <div className="w-full h-full flex flex-col justify-center px-6 py-8">
                      <TextContent />
                    </div>
                  );
                }
              }

              return <TextContent />;
            })()}
          </div>
        );

      case 'contact':
        if (!config.contactForm.enabled) {
          onNext();
          return null;
        }
        return (
          <ContactLayouts
            layout={currentLayout}
            viewMode={viewMode}
            title={config.contactForm.title}
            subtitle={config.contactForm.subtitle}
            fields={config.contactForm.fields}
            contactData={contactData}
            onFieldChange={(type, value) => setContactData(prev => ({ ...prev, [type]: value }))}
            onSubmit={onNext}
            backgroundColor={theme.backgroundColor}
            textColor={theme.textColor}
            buttonColor={theme.buttonColor}
            editingField={editingField}
            onFocusTitle={() => setEditingField('contact-title')}
            onFocusSubtitle={() => setEditingField('contact-subtitle')}
            onBlurTitle={(value) => handleTitleBlur('contact-title', value)}
            onBlurSubtitle={(value) => handleSubtitleBlur('contact-subtitle', value)}
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
          />
        );

      case 'wheel':
        return (
          <WheelLayouts
            layout={currentLayout}
            viewMode={viewMode}
            title={config.welcomeScreen.title}
            subtitle={config.welcomeScreen.subtitle}
            segments={config.segments}
            isSpinning={isSpinning}
            onSpin={() => setIsSpinning(true)}
            onResult={(segment) => console.log('Segment gagné:', segment)}
            onComplete={(prize) => {
              setIsSpinning(false);
              setWonPrize(prize);
              setTimeout(() => onNext(), 1000);
            }}
            backgroundColor={theme.backgroundColor}
            textColor={theme.textColor}
            buttonColor={theme.buttonColor}
          />
        );

      case 'ending':
        return (
          <EndingLayouts
            layout={currentLayout}
            viewMode={viewMode}
            title={config.endingScreen.title}
            subtitle={config.endingScreen.subtitle}
            wonPrize={wonPrize}
            backgroundColor={theme.backgroundColor}
            textColor={theme.textColor}
            buttonColor={theme.buttonColor}
            editingField={editingField}
            onFocusTitle={() => setEditingField('ending-title')}
            onFocusSubtitle={() => setEditingField('ending-subtitle')}
            onBlurTitle={(value) => handleTitleBlur('ending-title', value)}
            onBlurSubtitle={(value) => handleSubtitleBlur('ending-subtitle', value)}
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
            onRestart={() => {
              setWonPrize(null);
              setContactData({ name: "", email: "", phone: "" });
            }}
          />
        );
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100">
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
        onSave={handleImageEdit}
      />

      {!isMobileResponsive && (
        <button
          onClick={onToggleViewMode}
          className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105"
          style={{
            backgroundColor: '#4A4138',
            border: '1px solid rgba(245, 184, 0, 0.3)',
            color: '#F5CA3C'
          }}
        >
          {viewMode === 'desktop' ? (
            <>
              <Monitor className="w-4 h-4" />
              <span className="text-xs font-medium">Desktop</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-medium">Mobile</span>
            </>
          )}
        </button>
      )}

      <div 
        className="relative overflow-hidden transition-all duration-300" 
        style={{ 
          backgroundColor: theme.backgroundColor, 
          width: viewMode === 'desktop' ? '1100px' : '375px', 
          height: viewMode === 'desktop' ? '620px' : '667px' 
        }}
      >
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <div className="grid grid-cols-2 gap-1">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5CA3C]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5CA3C]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5CA3C]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5CA3C]" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <LayoutWrapper
              layout={getCurrentLayout()}
              viewMode={viewMode}
              backgroundColor={theme.backgroundColor}
            >
              {renderContent()}
            </LayoutWrapper>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
