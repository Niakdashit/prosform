import { motion, AnimatePresence } from "framer-motion";
import { WheelConfig } from "./WheelBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Smartphone, Sparkles, Upload, ImagePlus, Edit3, Clock } from "lucide-react";
import { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import SmartWheel from "./SmartWheel/SmartWheel";
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
    // Calculate current layout for non-welcome views
    const getCurrentLayout = () => {
      const layoutKey = viewMode === 'desktop' ? 'desktopLayout' : 'mobileLayout';
      switch (activeView) {
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
                  ? config.welcomeScreen.desktopLayout === "desktop-card" || config.welcomeScreen.desktopLayout === "desktop-panel"
                    ? "0"
                    : "0 64px"
                  : config.welcomeScreen.mobileLayout === "mobile-centered"
                  ? "0"
                  : "24px 20px",
              paddingLeft:
                viewMode === "mobile" && config.welcomeScreen.mobileLayout === "mobile-centered"
                  ? 0
                  : viewMode === "desktop" && (config.welcomeScreen.desktopLayout === "desktop-card" || config.welcomeScreen.desktopLayout === "desktop-panel")
                  ? 0
                  : "7%",
              paddingRight:
                viewMode === "mobile" && config.welcomeScreen.mobileLayout === "mobile-centered"
                  ? 0
                  : viewMode === "desktop" && (config.welcomeScreen.desktopLayout === "desktop-card" || config.welcomeScreen.desktopLayout === "desktop-panel")
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
                    width: viewMode === 'desktop' ? '420px' : '280px',
                    height: viewMode === 'desktop' ? '420px' : '280px',
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
                        marginBottom: `${(config.welcomeScreen.blockSpacing || 1) * 24}px`,
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
                        marginBottom: `${(config.welcomeScreen.blockSpacing || 1) * 32}px`,
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

              // Desktop layouts
              if (viewMode === 'desktop') {
                if (desktopLayout === 'desktop-left-right') {
                  return (
                    <div className="w-full h-full flex flex-col items-start justify-start gap-10 px-24 py-12 overflow-y-auto scrollbar-hide">
                      <div
                        className="overflow-hidden flex-shrink-0"
                        style={{ 
                          borderRadius: "36px",
                          width: '320px',
                          height: '320px',
                        }}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=1600&h=1600&fit=crop"
                          alt="Feedback illustration"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="max-w-[700px]">
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
                            className="text-4xl md:text-5xl font-bold mb-4 cursor-text hover:opacity-80 transition-opacity" 
                            style={{ 
                              color: '#F5CA3C',
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
                            className="text-base mb-8 cursor-text hover:opacity-80 transition-opacity" 
                            style={{ 
                              color: '#B8A892',
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
                        
                        <div className="mt-10" style={{ marginTop: `${(config.welcomeScreen.blockSpacing || 1) * 32}px` }}>
                          <button 
                            onClick={onNext}
                            className="group px-6 py-3 text-base font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-3"
                            style={{ 
                              backgroundColor: '#F5CA3C',
                              color: '#3D3731'
                            }}
                          >
                            <span>{config.welcomeScreen.buttonText || "Start"}</span>
                            <span className="font-normal" style={{ color: 'rgba(61, 55, 49, 0.55)', fontSize: '14px' }}>
                              press <strong style={{ fontWeight: 600 }}>Enter</strong> ↵
                            </span>
                          </button>
                          <div className="inline-flex items-center gap-2.5 mt-2" style={{ color: '#A89A8A', fontSize: '14px' }}>
                            <Clock className="w-4 h-4" />
                            <span>Takes X minutes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else if (desktopLayout === 'desktop-right-left') {
                  return (
                    <div className="w-full h-full flex items-center gap-16 px-24">
                      <div className="flex-1">
                        <TextContent />
                      </div>
                      <ImageBlock />
                    </div>
                  );
                } else if (desktopLayout === 'desktop-centered') {
                  return (
                    <div className="w-full h-full flex items-center gap-16 px-24">
                      <ImageBlock />
                      <div className="flex-1">
                        <TextContent />
                      </div>
                    </div>
                  );
                } else if (desktopLayout === 'desktop-split') {
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
                      <div 
                        className="absolute inset-0 bg-black" 
                        style={{ opacity: config.welcomeScreen.overlayOpacity ?? 0.6 }}
                      />
                      <div className="relative z-10 flex items-center justify-center h-full px-16">
                        <div className="max-w-[700px] text-center">
                          <TextContent centered />
                        </div>
                      </div>
                    </div>
                  );
                } else if (desktopLayout === 'desktop-card') {
                  return (
                    <div className="relative w-full h-full flex">
                      <div className="w-1/2 flex items-center justify-center px-24 z-10">
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
                  <div className="flex flex-col gap-6 py-6 px-5 w-full max-w-[700px]">
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
                    <div className="flex-1 flex items-center justify-center py-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
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
                    <div 
                      className="absolute inset-0 bg-black" 
                      style={{ opacity: config.welcomeScreen.overlayOpacity ?? 0.6 }}
                    />
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
          <div
            className="flex w-full h-full"
            style={{
              alignItems: viewMode === "desktop" ? "center" : "flex-start",
              justifyContent: viewMode === "desktop" ? "center" : "flex-start",
              padding:
                viewMode === "desktop"
                  ? config.wheelScreen.desktopLayout === "desktop-card" || config.wheelScreen.desktopLayout === "desktop-panel"
                    ? "0"
                    : "0 64px"
                  : config.wheelScreen.mobileLayout === "mobile-centered"
                  ? "0"
                  : "24px 20px",
              paddingLeft:
                viewMode === "mobile" && config.wheelScreen.mobileLayout === "mobile-centered"
                  ? 0
                  : viewMode === "desktop" && (config.wheelScreen.desktopLayout === "desktop-card" || config.wheelScreen.desktopLayout === "desktop-panel")
                  ? 0
                  : "7%",
              paddingRight:
                viewMode === "mobile" && config.wheelScreen.mobileLayout === "mobile-centered"
                  ? 0
                  : viewMode === "desktop" && (config.wheelScreen.desktopLayout === "desktop-card" || config.wheelScreen.desktopLayout === "desktop-panel")
                  ? 0
                  : "7%",
            }}
          >
            {(() => {
              const desktopLayout = config.wheelScreen.desktopLayout || "desktop-left-right";
              const mobileLayout = config.wheelScreen.mobileLayout || "mobile-vertical";
              const currentLayoutType = viewMode === "desktop" ? desktopLayout : mobileLayout;

              // Wheel component
              const WheelBlock = () => {
                // Adapter les segments pour SmartWheel
                const adaptedSegments = config.segments.map(seg => ({
                  ...seg,
                  value: seg.label
                }));

                return (
                  <div
                    className="flex items-center justify-center"
                    style={{ 
                      width: viewMode === 'desktop' ? '450px' : '320px',
                      height: viewMode === 'desktop' ? '450px' : '320px',
                      maxWidth: '100%',
                      flexShrink: 0
                    }}
                  >
                    <SmartWheel
                      segments={adaptedSegments}
                      onComplete={(winnerSegment) => {
                        setIsSpinning(false);
                        setWonPrize(winnerSegment);
                        setTimeout(() => onNext(), 1000);
                      }}
                      brandColors={{ primary: theme.systemColor, secondary: theme.accentColor }}
                      size={viewMode === 'desktop' ? 380 : 280}
                    />
                  </div>
                );
              };

              // Text content component  
              const TextContent = ({ centered = false, noSpacing = false }: { centered?: boolean; noSpacing?: boolean }) => (
                <div className={centered && viewMode === 'desktop' ? 'text-center' : ''}>
                  <div className="relative">
                    {editingField === 'wheel-title' && (
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
                        marginBottom: noSpacing ? '12px' : `${(config.wheelScreen.blockSpacing || 1) * 24}px`,
                        outline: editingField === 'wheel-title' ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
                        padding: '4px',
                        marginTop: '-4px',
                        marginLeft: '-4px',
                        marginRight: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('wheel-title')}
                      onBlur={(e) => {
                        const value = e.currentTarget.textContent || '';
                        if (value.trim()) {
                          // Pour l'instant, le titre est hardcodé. On pourrait ajouter un state pour le gérer
                          console.log('Wheel title updated:', value);
                        }
                        setEditingField(null);
                      }}
                    >
                      Tournez la roue !
                    </h1>
                  </div>
                  
                  <div className="relative">
                    {editingField === 'wheel-subtitle' && (
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
                        marginBottom: noSpacing ? '0' : `${(config.wheelScreen.blockSpacing || 1) * 32}px`,
                        outline: editingField === 'wheel-subtitle' ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
                        padding: '4px',
                        marginTop: '-4px',
                        marginLeft: '-4px',
                        marginRight: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('wheel-subtitle')}
                      onBlur={(e) => {
                        const value = e.currentTarget.textContent || '';
                        if (value.trim()) {
                          console.log('Wheel subtitle updated:', value);
                        }
                        setEditingField(null);
                      }}
                    >
                      Tentez votre chance et découvrez votre prix
                    </p>
                  </div>
                </div>
              );

              // Desktop layouts
              if (viewMode === 'desktop') {
                if (desktopLayout === 'desktop-left-right') {
                  return (
                    <div className="w-full h-full flex items-center justify-center px-24">
                      <div className="flex flex-col items-center gap-10">
                        <div className="max-w-[700px] text-center">
                          <div className="relative">
                            {editingField === 'wheel-title-center' && (
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
                              className="text-4xl md:text-5xl font-bold mb-4 cursor-text hover:opacity-80 transition-opacity" 
                              style={{ 
                                color: '#F5CA3C',
                                outline: editingField === 'wheel-title-center' ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
                                padding: '4px',
                                marginTop: '-4px',
                                marginLeft: '-4px',
                                marginRight: '-4px',
                                borderRadius: '4px'
                              }}
                              contentEditable
                              suppressContentEditableWarning
                              onFocus={() => setEditingField('wheel-title-center')}
                              onBlur={(e) => {
                                const value = e.currentTarget.textContent || '';
                                if (value.trim()) {
                                  console.log('Wheel title center updated:', value);
                                }
                                setEditingField(null);
                              }}
                            >
                              Tournez la roue !
                            </h1>
                          </div>
                          
                          <div className="relative">
                            {editingField === 'wheel-subtitle-center' && (
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
                              className="text-base mb-8 cursor-text hover:opacity-80 transition-opacity" 
                              style={{ 
                                color: '#B8A892',
                                outline: editingField === 'wheel-subtitle-center' ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
                                padding: '4px',
                                marginTop: '-4px',
                                marginLeft: '-4px',
                                marginRight: '-4px',
                                borderRadius: '4px'
                              }}
                              contentEditable
                              suppressContentEditableWarning
                              onFocus={() => setEditingField('wheel-subtitle-center')}
                              onBlur={(e) => {
                                const value = e.currentTarget.textContent || '';
                                if (value.trim()) {
                                  console.log('Wheel subtitle center updated:', value);
                                }
                                setEditingField(null);
                              }}
                            >
                              Tentez votre chance et découvrez votre prix
                            </p>
                          </div>
                        </div>
                        <div
                          className="flex-shrink-0 flex items-center justify-center"
                          style={{ 
                            width: '350px',
                            height: '350px',
                          }}
                        >
                        <SmartWheel
                          segments={config.segments.map(seg => ({ ...seg, value: seg.label }))}
                          onComplete={(winnerSegment) => {
                            setIsSpinning(false);
                            setWonPrize(winnerSegment);
                            setTimeout(() => onNext(), 1000);
                          }}
                          brandColors={{ primary: theme.systemColor, secondary: theme.accentColor }}
                          size={280}
                        />
                      </div>
                      </div>
                    </div>
                  );
                } else if (desktopLayout === 'desktop-right-left') {
                  return (
                    <div 
                      className="w-full h-full flex items-center px-24"
                      style={{ gap: `${(config.wheelScreen.blockSpacing || 1) * 4}rem` }}
                    >
                      <div className="flex-1">
                        <TextContent noSpacing />
                      </div>
                      <WheelBlock />
                    </div>
                  );
                } else if (desktopLayout === 'desktop-centered') {
                  return (
                    <div 
                      className="w-full h-full flex items-center px-24"
                      style={{ gap: `${(config.wheelScreen.blockSpacing || 1) * 4}rem` }}
                    >
                      <WheelBlock />
                      <div className="flex-1">
                        <TextContent noSpacing />
                      </div>
                    </div>
                  );
                } else if (desktopLayout === 'desktop-split') {
                  return (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
                      <div className="relative z-10 flex items-center justify-center h-full px-16">
                        <div className="max-w-[700px] text-center flex flex-col items-center gap-8">
                          <TextContent centered />
                          <WheelBlock />
                        </div>
                      </div>
                    </div>
                  );
                 } else if (desktopLayout === 'desktop-card') {
                  return (
                    <div 
                      className="relative w-full h-full flex items-center justify-center"
                      style={{ 
                        gap: `${(config.wheelScreen.blockSpacing || 1) * 4}rem`,
                      }}
                    >
                      <div className="flex-1 max-w-[500px]">
                        <TextContent noSpacing />
                      </div>
                      <WheelBlock />
                    </div>
                  );
                 } else if (desktopLayout === 'desktop-panel') {
                  return (
                    <div 
                      className="relative w-full h-full flex items-center justify-center"
                      style={{ 
                        gap: `${(config.wheelScreen.blockSpacing || 1) * 4}rem`,
                      }}
                    >
                      <WheelBlock />
                      <div className="flex-1 max-w-[500px]">
                        <TextContent noSpacing />
                      </div>
                    </div>
                  );
                }
              }

              // Mobile layouts
              if (mobileLayout === 'mobile-vertical') {
                return (
                  <div className="w-full h-full flex items-center justify-center px-5">
                    <div className="flex flex-col items-center gap-8 max-w-[700px]">
                      <TextContent centered />
                      <WheelBlock />
                    </div>
                  </div>
                );
              } else if (mobileLayout === 'mobile-centered') {
                return (
                  <div className="flex flex-col w-full h-full">
                    <div className="w-full relative flex items-center justify-center" style={{ height: '40%', minHeight: '250px' }}>
                      <WheelBlock />
                    </div>
                    <div className="flex-1 flex items-center justify-center py-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
                      <div className="w-full max-w-[700px]">
                        <TextContent />
                      </div>
                    </div>
                  </div>
                );
              } else if (mobileLayout === 'mobile-minimal') {
                return (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
                    <div className="relative z-10 flex items-center justify-center h-full px-8">
                      <div className="w-full max-w-[700px] text-center flex flex-col items-center gap-6">
                        <TextContent centered />
                        <WheelBlock />
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })()}
          </div>
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
            socialLinks={config.endingScreen.socialLinks}
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
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
