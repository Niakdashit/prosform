import { motion, AnimatePresence } from "framer-motion";
import { WheelConfig, WheelSegment } from "./WheelBuilder";
import { useState, useEffect } from "react";
import { useTheme, getButtonStyles, getFontFamily } from "@/contexts/ThemeContext";
import { SmartWheel } from "./SmartWheel";
import { ParticipationService } from "@/services/ParticipationService";
import { AnalyticsTrackingService } from "@/services/AnalyticsTrackingService";
import { useStepTracking } from "@/hooks/useStepTracking";
import { CampaignHeader, CampaignFooter } from "./campaign";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";

interface ParticipantWheelRenderProps {
  config: WheelConfig;
  campaignId: string;
}

export const ParticipantWheelRender = ({ config, campaignId }: ParticipantWheelRenderProps) => {
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'>('welcome');
  const [contactData, setContactData] = useState<Record<string, string>>({});
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme } = useTheme();
  const buttonStyles = getButtonStyles(theme);

  // Detect mobile/desktop
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current layout based on view and device
  const getCurrentLayout = () => {
    const layoutKey = isMobile ? 'mobileLayout' : 'desktopLayout';
    switch (activeView) {
      case 'welcome':
        return config.welcomeScreen?.[layoutKey] || (isMobile ? 'mobile-vertical' : 'desktop-left-right');
      case 'contact':
        return config.contactForm?.[layoutKey] || (isMobile ? 'mobile-vertical' : 'desktop-centered');
      case 'wheel':
        return config.wheelScreen?.[layoutKey] || (isMobile ? 'mobile-centered' : 'desktop-centered');
      case 'ending-win':
        return config.endingWin?.[layoutKey] || (isMobile ? 'mobile-centered' : 'desktop-centered');
      case 'ending-lose':
        return config.endingLose?.[layoutKey] || (isMobile ? 'mobile-centered' : 'desktop-centered');
      default:
        return isMobile ? 'mobile-vertical' : 'desktop-centered';
    }
  };

  const viewMode = isMobile ? 'mobile' : 'desktop';

  // Déterminer l'étape actuelle pour le tracking
  const getCurrentStep = (): 'welcome' | 'contact' | 'game' | 'ending' => {
    if (activeView === 'welcome') return 'welcome';
    if (activeView === 'contact') return 'contact';
    if (activeView === 'wheel') return 'game';
    return 'ending';
  };

  // Track automatiquement le temps passé par étape
  useStepTracking(campaignId, getCurrentStep());

  const handleNext = () => {
    if (activeView === 'welcome') {
      if (config.contactForm?.enabled) {
        setActiveView('contact');
      } else {
        setActiveView('wheel');
      }
    } else if (activeView === 'contact') {
      setActiveView('wheel');
    }
  };

  const handleSpinComplete = async (segment: WheelSegment) => {
    // Determine if it's a win or lose based on segment
    const isWin = segment.prizeId !== undefined || segment.label.toLowerCase().includes('gagn');
    setWonPrize(segment.label);
    
    // Enregistrer la participation
    await ParticipationService.recordParticipation({
      campaignId,
      contactData,
      result: {
        type: isWin ? 'win' : 'lose',
        prize: isWin ? segment.label : undefined,
      },
    });
    
    setTimeout(() => {
      setActiveView(isWin ? 'ending-win' : 'ending-lose');
    }, 1500);
  };

  const replaceVariables = (text: string) => {
    return text.replace(/\{\{prize\}\}/g, wonPrize || 'votre lot');
  };

  // Helper to get background image for current screen
  const getScreenBackground = () => {
    const applyToAll = config.welcomeScreen?.applyBackgroundToAll;
    const welcomeDesktop = config.welcomeScreen?.backgroundImage;
    const welcomeMobile = config.welcomeScreen?.backgroundImageMobile;
    
    if (applyToAll && (welcomeDesktop || welcomeMobile)) {
      return isMobile && welcomeMobile ? welcomeMobile : welcomeDesktop;
    }
    
    switch (activeView) {
      case 'welcome':
        return isMobile && welcomeMobile ? welcomeMobile : welcomeDesktop;
      case 'contact':
        return isMobile && config.contactForm?.backgroundImageMobile 
          ? config.contactForm.backgroundImageMobile 
          : config.contactForm?.backgroundImage;
      case 'wheel':
        return isMobile && config.wheelScreen?.backgroundImageMobile 
          ? config.wheelScreen.backgroundImageMobile 
          : config.wheelScreen?.backgroundImage;
      case 'ending-win':
        return isMobile && config.endingWin?.backgroundImageMobile 
          ? config.endingWin.backgroundImageMobile 
          : config.endingWin?.backgroundImage;
      case 'ending-lose':
        return isMobile && config.endingLose?.backgroundImageMobile 
          ? config.endingLose.backgroundImageMobile 
          : config.endingLose?.backgroundImage;
      default:
        return undefined;
    }
  };

  // Text content component for welcome
  const WelcomeTextContent = () => {
    const alignment = config.welcomeScreen?.alignment || 'center';
    const alignmentClass = alignment === 'center' ? 'text-center items-center' : alignment === 'right' ? 'text-right items-end' : 'text-left items-start';
    
    return (
      <div className={`flex flex-col ${alignmentClass}`}>
        {config.welcomeScreen?.title && (
          <h1 
            className="font-bold mb-4"
            style={{ 
              color: config.welcomeScreen?.titleStyle?.textColor || theme.textColor, 
              fontFamily: config.welcomeScreen?.titleStyle?.fontFamily || getFontFamily(theme.headingFontFamily),
              fontWeight: config.welcomeScreen?.titleStyle?.isBold ? 'bold' : undefined,
              fontStyle: config.welcomeScreen?.titleStyle?.isItalic ? 'italic' : undefined,
              textDecoration: config.welcomeScreen?.titleStyle?.isUnderline ? 'underline' : undefined,
              textAlign: config.welcomeScreen?.titleStyle?.textAlign || alignment,
              fontSize: config.welcomeScreen?.titleStyle?.fontSize ? `${Math.round(config.welcomeScreen.titleStyle.fontSize * 1.35)}px` : (isMobile ? '38px' : '57px'),
              lineHeight: '1.2'
            }}
          >
            {config.welcomeScreen.title}
          </h1>
        )}
        
        {config.welcomeScreen?.subtitle && (
          <p 
            className="mb-8"
            style={{ 
              color: config.welcomeScreen?.subtitleStyle?.textColor || theme.textSecondaryColor, 
              fontFamily: config.welcomeScreen?.subtitleStyle?.fontFamily || getFontFamily(theme.fontFamily),
              fontWeight: config.welcomeScreen?.subtitleStyle?.isBold ? 'bold' : undefined,
              fontStyle: config.welcomeScreen?.subtitleStyle?.isItalic ? 'italic' : undefined,
              textDecoration: config.welcomeScreen?.subtitleStyle?.isUnderline ? 'underline' : undefined,
              textAlign: config.welcomeScreen?.subtitleStyle?.textAlign || alignment,
              opacity: 0.9, 
              fontSize: config.welcomeScreen?.subtitleStyle?.fontSize ? `${Math.round(config.welcomeScreen.subtitleStyle.fontSize * 1.35)}px` : (isMobile ? '19px' : '24px'),
              lineHeight: '1.4'
            }}
          >
            {config.welcomeScreen.subtitle}
          </p>
        )}

        <button
          onClick={handleNext}
          className="font-medium transition-all hover:opacity-90"
          style={buttonStyles}
        >
          {config.welcomeScreen?.buttonText || "Commencer"}
        </button>
      </div>
    );
  };

  // Image block for welcome
  const WelcomeImageBlock = () => {
    const uploadedImage = config.welcomeScreen?.image;
    const imageSettings = config.welcomeScreen?.imageSettings as {
      size?: number;
      borderRadius?: number;
      borderWidth?: number;
      borderColor?: string;
      rotation?: number;
      flipH?: boolean;
      flipV?: boolean;
    } | undefined;
    
    if (!uploadedImage && config.welcomeScreen?.showImage === false) return null;
    
    // Taille augmentée de 35% pour le preview
    const baseSize = isMobile ? 280 : 432; // 320 * 1.35 = 432
    const scaledSize = baseSize * ((imageSettings?.size || 100) / 100);
    
    return (
      <div
        className="overflow-hidden"
        style={{ 
          borderRadius: `${imageSettings?.borderRadius || 0}px`,
          width: `${scaledSize}px`,
          height: `${scaledSize}px`,
          maxWidth: '100%',
          flexShrink: 0,
          border: (imageSettings?.borderWidth || 0) > 0 ? `${imageSettings?.borderWidth}px solid ${imageSettings?.borderColor || '#000'}` : 'none',
        }}
      >
        {uploadedImage ? (
          <img
            src={uploadedImage}
            alt=""
            className="w-full h-full object-cover"
            style={{
              transform: `rotate(${imageSettings?.rotation || 0}deg) scaleX(${imageSettings?.flipH ? -1 : 1}) scaleY(${imageSettings?.flipV ? -1 : 1})`,
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <span className="text-6xl">🎡</span>
          </div>
        )}
      </div>
    );
  };

  const renderWelcome = () => {
    const currentLayout = getCurrentLayout();
    const alignment = config.welcomeScreen?.alignment || 'center';
    const horizontalAlign = alignment === 'center' ? 'items-center' : alignment === 'right' ? 'items-end' : 'items-start';

    // Desktop layouts
    if (!isMobile) {
      if (currentLayout === 'desktop-left-right') {
        const align = config.welcomeScreen?.splitAlignment || 'left';
        const alignmentClass = align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start';
        const justifyClass = config.welcomeScreen?.showImage === false ? 'justify-center' : 'justify-start';
        const textContainerClass = align === 'center' ? 'max-w-[700px] mx-auto' : align === 'right' ? 'max-w-[700px] ml-auto' : 'max-w-[700px]';

        return (
          <div className={`w-full h-full flex flex-col ${horizontalAlign} ${justifyClass} gap-10 overflow-y-auto`} style={{ padding: '35px 75px' }}>
            {config.welcomeScreen?.showImage !== false && <WelcomeImageBlock />}
            <div className={textContainerClass}>
              <WelcomeTextContent />
            </div>
          </div>
        );
      } else if (currentLayout === 'desktop-right-left') {
        // Texte à gauche, image à droite - utilise tout l'espace disponible
        const blockGap = (config.welcomeScreen?.blockSpacing || 1) * 40;
        return (
          <div className="w-full h-full flex justify-between items-center px-16" style={{ gap: `${blockGap}px` }}>
            <div className="max-w-[600px]">
              <WelcomeTextContent />
            </div>
            <WelcomeImageBlock />
          </div>
        );
      } else if (currentLayout === 'desktop-centered') {
        // Image à gauche, texte à droite - utilise tout l'espace disponible
        const blockGap = (config.welcomeScreen?.blockSpacing || 1) * 40;
        return (
          <div className="w-full h-full flex justify-between items-center px-16" style={{ gap: `${blockGap}px` }}>
            <WelcomeImageBlock />
            <div className="max-w-[600px]">
              <WelcomeTextContent />
            </div>
          </div>
        );
      } else if (currentLayout === 'desktop-split') {
        const bgImage = config.welcomeScreen?.wallpaperImage || config.welcomeScreen?.backgroundImage;
        const justifyContent = alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start';
        return (
          <div className="absolute inset-0">
            {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            <div className={`relative z-10 flex ${justifyContent} items-center h-full px-16`}>
              <div className="max-w-[700px]">
                <WelcomeTextContent />
              </div>
            </div>
          </div>
        );
      } else if (currentLayout === 'desktop-card') {
        const uploadedImage = config.welcomeScreen?.image;
        const justifyContent = alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start';
        return (
          <div className="relative w-full h-full flex">
            <div className={`w-1/2 flex ${justifyContent} items-center px-24 z-10`}>
              <div className="max-w-[500px]">
                <WelcomeTextContent />
              </div>
            </div>
            <div className="absolute right-0 top-0 w-1/2 h-full">
              {uploadedImage ? (
                <img src={uploadedImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                  <span className="text-8xl">🎡</span>
                </div>
              )}
            </div>
          </div>
        );
      } else if (currentLayout === 'desktop-panel') {
        const uploadedImage = config.welcomeScreen?.image;
        return (
          <div className="relative w-full h-full flex">
            <div className="absolute left-0 top-0 w-1/2 h-full">
              {uploadedImage ? (
                <img src={uploadedImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                  <span className="text-8xl">🎡</span>
                </div>
              )}
            </div>
            <div className="w-1/2 ml-auto flex items-center justify-center px-24 z-10">
              <div className="max-w-[500px]">
                <WelcomeTextContent />
              </div>
            </div>
          </div>
        );
      }
    }

    // Mobile layouts
    if (currentLayout === 'mobile-vertical') {
      return (
        <div className="flex flex-col gap-6 w-full h-full overflow-y-auto" style={{ padding: '35px' }}>
          <WelcomeImageBlock />
          <WelcomeTextContent />
        </div>
      );
    } else if (currentLayout === 'mobile-centered') {
      const uploadedImage = config.welcomeScreen?.image;
      return (
        <div className="flex flex-col w-full h-full">
          <div className="w-full relative" style={{ height: '40%', minHeight: '250px' }}>
            {uploadedImage ? (
              <img src={uploadedImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                <span className="text-6xl">🎡</span>
              </div>
            )}
          </div>
          <div className="flex-1 flex items-start justify-center pt-6 pb-24" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            <div className="w-full max-w-[700px]">
              <WelcomeTextContent />
            </div>
          </div>
        </div>
      );
    } else if (currentLayout === 'mobile-minimal') {
      const bgImage = config.welcomeScreen?.wallpaperImage || config.welcomeScreen?.backgroundImage || config.welcomeScreen?.backgroundImageMobile;
      return (
        <div className="absolute inset-0">
          {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="relative z-10 flex items-center justify-center h-full px-8">
            <div className="w-full max-w-[700px] text-center">
              <WelcomeTextContent />
            </div>
          </div>
        </div>
      );
    }

    // Fallback
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <WelcomeTextContent />
        </div>
      </div>
    );
  };

  // Contact form component
  const ContactFormContent = () => (
    <div className="w-full max-w-md text-center px-4">
      <h2 
        className="font-bold mb-4"
        style={{ 
          color: config.contactForm?.titleStyle?.textColor || theme.textColor,
          fontFamily: config.contactForm?.titleStyle?.fontFamily || 'inherit',
          fontSize: config.contactForm?.titleStyle?.fontSize ? `${config.contactForm.titleStyle.fontSize}px` : (isMobile ? '28px' : '42px'),
          lineHeight: '1.2',
        }}
      >
        {config.contactForm?.title || "Vos coordonnées"}
      </h2>
      <p 
        className="mb-8"
        style={{ 
          color: config.contactForm?.subtitleStyle?.textColor || theme.textSecondaryColor,
          fontFamily: config.contactForm?.subtitleStyle?.fontFamily || 'inherit',
          fontSize: config.contactForm?.subtitleStyle?.fontSize ? `${config.contactForm.subtitleStyle.fontSize}px` : (isMobile ? '14px' : '18px'),
          lineHeight: '1.4',
          opacity: 0.8,
        }}
      >
        {config.contactForm?.subtitle || "Pour recevoir votre gain"}
      </p>
      
      <div className="space-y-4">
        {config.contactForm?.fields?.map((field, index) => {
          if (field.type === 'select' && field.options) {
            return (
              <div key={index} className="text-left">
                <label className="block mb-2 text-sm font-normal" style={{ color: theme.textColor }}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  className="w-full h-10 text-sm px-3"
                  style={{ 
                    backgroundColor: '#ffffff',
                    borderColor: theme.textColor,
                    borderWidth: '1px',
                    color: '#333333',
                    borderRadius: theme.buttonStyle === 'square' ? '0px' : '8px',
                  }}
                  onChange={(e) => setContactData(prev => ({ ...prev, [field.id || field.type]: e.target.value }))}
                  required={field.required}
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
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  className="w-full text-sm px-3 py-2 min-h-[80px] resize-none"
                  style={{ 
                    backgroundColor: '#ffffff',
                    borderColor: theme.textColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: '#333333',
                    borderRadius: theme.buttonStyle === 'square' ? '0px' : '8px',
                  }}
                  onChange={(e) => setContactData(prev => ({ ...prev, [field.id || field.type]: e.target.value }))}
                  required={field.required}
                />
              </div>
            );
          }

          if (field.type === 'checkbox') {
            return (
              <label key={index} className="flex items-start gap-3 cursor-pointer text-left">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-2 transition-colors flex-shrink-0"
                  style={{ accentColor: theme.buttonColor, borderColor: theme.textColor }}
                  onChange={(e) => setContactData(prev => ({ ...prev, [field.id || field.type]: e.target.checked ? 'true' : 'false' }))}
                  required={field.required}
                />
                <span className="text-sm" style={{ color: theme.textColor }}>
                  {field.label}
                  {field.helpText && <span className="block text-xs opacity-70 mt-1">{field.helpText}</span>}
                </span>
              </label>
            );
          }
          
          return (
            <div key={index} className="text-left">
              <label className="block mb-2 text-sm font-normal" style={{ color: theme.textColor }}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={field.type === 'email' ? 'email' : (field.type === 'phone' || field.type === 'tel') ? 'tel' : field.type === 'date' ? 'date' : 'text'}
                className="w-full h-10 text-sm px-3"
                style={{ 
                  backgroundColor: '#ffffff',
                  borderColor: theme.textColor,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  color: '#333333',
                  borderRadius: theme.buttonStyle === 'square' ? '0px' : '8px',
                }}
                placeholder={field.placeholder}
                onChange={(e) => setContactData(prev => ({ ...prev, [field.id || field.type]: e.target.value }))}
                required={field.required}
              />
            </div>
          );
        })}
        
        <button 
          onClick={handleNext}
          className="w-full flex items-center justify-center font-medium transition-all hover:opacity-90"
          style={buttonStyles}
        >
          Continuer
        </button>
      </div>
    </div>
  );

  const renderContact = () => {
    const currentLayout = getCurrentLayout();
    
    // Desktop layouts with split image
    if (!isMobile) {
      if (currentLayout === 'desktop-card') {
        const contactImageDesktop = config.contactForm?.image;
        return (
          <div className="relative w-full h-full flex">
            {/* Zone formulaire scrollable */}
            <div className="w-1/2 h-full overflow-y-auto z-10">
              <div className="min-h-full flex items-center justify-center px-12 py-8">
                <div className="max-w-[500px] w-full">
                  <ContactFormContent />
                </div>
              </div>
            </div>
            {/* Zone image fixe */}
            <div className="absolute right-0 top-0 w-1/2 h-full">
              {contactImageDesktop ? (
                <img src={contactImageDesktop} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                  <span className="text-8xl">📝</span>
                </div>
              )}
            </div>
          </div>
        );
      } else if (currentLayout === 'desktop-panel') {
        const contactImageDesktop = config.contactForm?.image;
        return (
          <div className="relative w-full h-full flex">
            {/* Zone image fixe */}
            <div className="absolute left-0 top-0 w-1/2 h-full">
              {contactImageDesktop ? (
                <img src={contactImageDesktop} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                  <span className="text-8xl">📝</span>
                </div>
              )}
            </div>
            {/* Zone formulaire scrollable */}
            <div className="w-1/2 ml-auto h-full overflow-y-auto z-10">
              <div className="min-h-full flex items-center justify-center px-12 py-8">
                <div className="max-w-[500px] w-full">
                  <ContactFormContent />
                </div>
              </div>
            </div>
          </div>
        );
      } else if (currentLayout === 'desktop-split') {
        const bgImage = config.contactForm?.backgroundImage;
        return (
          <div className="absolute inset-0">
            {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="relative z-10 flex justify-center items-center h-full px-16 overflow-y-auto">
              <div className="max-w-[500px]">
                <ContactFormContent />
              </div>
            </div>
          </div>
        );
      }
      
      // Default desktop centered
      return (
        <div className="w-full h-full flex items-center justify-center p-12 overflow-y-auto">
          <ContactFormContent />
        </div>
      );
    }
    
    // Mobile layouts
    if (currentLayout === 'mobile-centered') {
      const contactBannerImage = config.contactForm?.imageMobile || config.contactForm?.image;
      return (
        <div className="flex flex-col w-full h-full">
          {/* Bannière - même taille que Welcome */}
          <div className="w-full relative" style={{ height: '40%', minHeight: '250px' }}>
            {contactBannerImage ? (
              <img src={contactBannerImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                <span className="text-6xl">📝</span>
              </div>
            )}
          </div>
          {/* Zone formulaire - même style que Welcome */}
          <div className="flex-1 flex items-start justify-center pt-6 pb-24" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            <div className="w-full max-w-[700px]">
              <ContactFormContent />
            </div>
          </div>
        </div>
      );
    } else if (currentLayout === 'mobile-minimal') {
      const bgImage = config.contactForm?.backgroundImageMobile || config.contactForm?.backgroundImage;
      return (
        <div className="absolute inset-0">
          {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="relative z-10 flex items-center justify-center h-full px-8 overflow-y-auto">
            <div className="w-full max-w-[500px]">
              <ContactFormContent />
            </div>
          </div>
        </div>
      );
    }
    
    // Default mobile vertical
    return (
      <div className="flex flex-col w-full h-full items-center py-6 overflow-y-auto" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
        <div className="w-full flex-shrink-0">
          <ContactFormContent />
        </div>
      </div>
    );
  };

  const renderWheel = () => {
    const wheelSize = isMobile ? theme.wheelSizeMobile : theme.wheelSizeDesktop;
    const containerSize = wheelSize + 70;
    
    // Wheel content component
    const WheelContent = () => (
      <div className="flex flex-col items-center text-center">
        {config.wheelScreen?.title && (
          <h2 
            className="font-bold mb-4"
            style={{ 
              color: config.wheelScreen?.titleStyle?.textColor || theme.textColor,
              fontFamily: config.wheelScreen?.titleStyle?.fontFamily || 'inherit',
              fontSize: config.wheelScreen?.titleStyle?.fontSize ? `${config.wheelScreen.titleStyle.fontSize}px` : (isMobile ? '24px' : '36px'),
              lineHeight: '1.2',
            }}
          >
            {config.wheelScreen.title}
          </h2>
        )}
        {config.wheelScreen?.subtitle && (
          <p 
            className="mb-6"
            style={{ 
              color: config.wheelScreen?.subtitleStyle?.textColor || theme.textSecondaryColor,
              fontFamily: config.wheelScreen?.subtitleStyle?.fontFamily || 'inherit',
              fontSize: config.wheelScreen?.subtitleStyle?.fontSize ? `${config.wheelScreen.subtitleStyle.fontSize}px` : (isMobile ? '14px' : '18px'),
              lineHeight: '1.4',
              opacity: 0.8,
            }}
          >
            {config.wheelScreen.subtitle}
          </p>
        )}
        
        <div
          className="flex items-center justify-center"
          style={{ 
            width: `${containerSize}px`,
            height: `${containerSize}px`,
            maxWidth: '100%',
            flexShrink: 0
          }}
        >
          <SmartWheel
            segments={config.segments.map(s => ({ ...s, value: s.label }))}
            onSpin={() => setIsSpinning(true)}
            onResult={(segment) => handleSpinComplete(config.segments.find(s => s.id === segment.id) || config.segments[0])}
            size={wheelSize}
            borderStyle={theme.wheelBorderStyle === 'gold' ? 'goldRing' : theme.wheelBorderStyle === 'silver' ? 'silverRing' : theme.wheelBorderStyle}
            customBorderColor={theme.wheelBorderStyle === 'custom' ? theme.wheelBorderCustomColor : undefined}
            showBulbs={true}
          />
        </div>
      </div>
    );
    
    // The wheel view is always centered for simplicity
    return (
      <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
        <WheelContent />
      </div>
    );
  };

  const renderEnding = (isWin: boolean) => {
    const endingConfig = isWin ? config.endingWin : config.endingLose;
    
    // Ending content component
    const EndingContent = () => (
      <div className="w-full max-w-[700px] text-center">
        <h2 
          className="font-bold"
          style={{ 
            color: endingConfig?.titleStyle?.textColor || theme.textColor,
            fontFamily: endingConfig?.titleStyle?.fontFamily || 'inherit',
            fontWeight: endingConfig?.titleStyle?.isBold ? 'bold' : 700,
            fontStyle: endingConfig?.titleStyle?.isItalic ? 'italic' : undefined,
            textDecoration: endingConfig?.titleStyle?.isUnderline ? 'underline' : undefined,
            textAlign: endingConfig?.titleStyle?.textAlign || 'center',
            fontSize: endingConfig?.titleStyle?.fontSize ? `${endingConfig.titleStyle.fontSize}px` : (isMobile ? '28px' : '42px'),
            lineHeight: 1.2,
            marginBottom: isMobile ? '8px' : '16px',
          }}
        >
          {replaceVariables(endingConfig?.title || (isWin ? 'Félicitations !' : 'Dommage...'))}
        </h2>
        <p 
          style={{ 
            color: endingConfig?.subtitleStyle?.textColor || theme.textSecondaryColor, 
            fontFamily: endingConfig?.subtitleStyle?.fontFamily || 'inherit',
            fontWeight: endingConfig?.subtitleStyle?.isBold ? 'bold' : 400,
            fontStyle: endingConfig?.subtitleStyle?.isItalic ? 'italic' : undefined,
            textDecoration: endingConfig?.subtitleStyle?.isUnderline ? 'underline' : undefined,
            textAlign: endingConfig?.subtitleStyle?.textAlign || 'center',
            fontSize: endingConfig?.subtitleStyle?.fontSize ? `${endingConfig.subtitleStyle.fontSize}px` : (isMobile ? '14px' : '18px'),
            lineHeight: 1.5,
            opacity: 0.8,
            marginBottom: isMobile ? '32px' : '48px',
          }}
        >
          {replaceVariables(endingConfig?.subtitle || (isWin ? 'Vous avez gagné {{prize}} !' : 'Tentez à nouveau votre chance.'))}
        </p>
        
        <button
          onClick={() => {
            AnalyticsTrackingService.resetSessionTracking(campaignId);
            setActiveView('welcome');
            setWonPrize(null);
            setIsSpinning(false);
          }}
          className="font-semibold transition-opacity hover:opacity-90"
          style={buttonStyles}
        >
          Rejouer
        </button>
      </div>
    );

    // Render based on layout
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ padding: isMobile ? '24px' : '35px 75px' }}>
        <EndingContent />
      </div>
    );
  };

  // Get background image for current view
  const bgImage = getScreenBackground();
  const hasBackgroundImage = !!bgImage;

  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: hasBackgroundImage ? 'transparent' : theme.backgroundColor }}
    >
      {/* Background image layer */}
      {bgImage && (
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
      )}

      {/* Header */}
      {config.layout?.header?.enabled && (
        <div className="relative z-20 flex-shrink-0">
          <CampaignHeader config={config.layout.header} isPreview={false} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 relative z-10 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {activeView === 'welcome' && renderWelcome()}
            {activeView === 'contact' && renderContact()}
            {activeView === 'wheel' && renderWheel()}
            {activeView === 'ending-win' && renderEnding(true)}
            {activeView === 'ending-lose' && renderEnding(false)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      {config.layout?.footer?.enabled && (
        <div className="relative z-10 flex-shrink-0">
          <CampaignFooter config={config.layout.footer} isPreview={false} />
        </div>
      )}
    </div>
  );
};
