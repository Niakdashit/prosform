import { motion, AnimatePresence } from "framer-motion";
import { WheelConfig, WheelSegment } from "./WheelBuilder";
import { useState, useEffect } from "react";
import { useTheme, getButtonStyles, ThemeSettings } from "@/contexts/ThemeContext";
import { SmartWheel } from "./SmartWheel";
import { ParticipationService } from "@/services/ParticipationService";
import { AnalyticsTrackingService } from "@/services/AnalyticsTrackingService";
import { useStepTracking } from "@/hooks/useStepTracking";
import { CampaignHeader, CampaignFooter } from "./campaign";

interface ParticipantWheelRenderProps {
  config: WheelConfig;
  campaignId: string;
  campaignTheme?: ThemeSettings;
}

export const ParticipantWheelRender = ({ config, campaignId, campaignTheme }: ParticipantWheelRenderProps) => {
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'>('welcome');
  const [contactData, setContactData] = useState<Record<string, string>>({});
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const { theme: contextTheme } = useTheme();
  
  // Use campaign theme if provided, otherwise fallback to context theme
  const theme = campaignTheme || contextTheme;
  const buttonStyles = getButtonStyles(theme, viewMode);

  // Detect viewport size
  useEffect(() => {
    const checkViewMode = () => {
      setViewMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };
    checkViewMode();
    window.addEventListener('resize', checkViewMode);
    return () => window.removeEventListener('resize', checkViewMode);
  }, []);

  // Track step duration
  const getCurrentStep = (): 'welcome' | 'contact' | 'game' | 'ending' => {
    if (activeView === 'welcome') return 'welcome';
    if (activeView === 'contact') return 'contact';
    if (activeView === 'wheel') return 'game';
    return 'ending';
  };
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
    const isWin = segment.prizeId !== undefined || segment.label.toLowerCase().includes('gagn');
    setWonPrize(segment.label);
    
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
    let result = text;
    result = result.replace(/\{\{prize\}\}/g, wonPrize || 'votre lot');
    if (contactData.name) result = result.replace(/\{\{first_name\}\}/g, contactData.name);
    if (contactData.email) result = result.replace(/\{\{email\}\}/g, contactData.email);
    return result;
  };

  // Get current layout based on view and viewport
  const getCurrentLayout = () => {
    const layoutKey = viewMode === 'desktop' ? 'desktopLayout' : 'mobileLayout';
    switch (activeView) {
      case 'welcome':
        return config.welcomeScreen[layoutKey] || (viewMode === 'desktop' ? 'desktop-left-right' : 'mobile-vertical');
      case 'contact':
        return config.contactForm[layoutKey] || (viewMode === 'desktop' ? 'desktop-centered' : 'mobile-vertical');
      case 'wheel':
        return config.wheelScreen[layoutKey] || (viewMode === 'desktop' ? 'desktop-centered' : 'mobile-vertical');
      case 'ending-win':
        return config.endingWin[layoutKey] || (viewMode === 'desktop' ? 'desktop-centered' : 'mobile-vertical');
      case 'ending-lose':
        return config.endingLose[layoutKey] || (viewMode === 'desktop' ? 'desktop-centered' : 'mobile-vertical');
      default:
        return viewMode === 'desktop' ? 'desktop-centered' : 'mobile-vertical';
    }
  };

  const currentLayout = getCurrentLayout();
  const isSplitLayout = ['desktop-split', 'desktop-left-right', 'desktop-right-left'].includes(currentLayout);

  // Wheel size based on viewport
  const wheelSize = viewMode === 'mobile' ? (theme.wheelSizeMobile || 320) : (theme.wheelSizeDesktop || 400);

  // Get background style for current screen
  const getBackgroundStyle = (screenConfig: any) => {
    const bgImage = viewMode === 'mobile' ? screenConfig.backgroundImageMobile : screenConfig.backgroundImage;
    const wallpaper = screenConfig.wallpaperImage;
    
    if (wallpaper) {
      return {
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (bgImage) {
      return {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { backgroundColor: theme.backgroundColor };
  };

  // Render welcome screen with layout
  const renderWelcome = () => {
    const bgStyle = getBackgroundStyle(config.welcomeScreen);
    const hasWallpaper = config.welcomeScreen.wallpaperImage || config.welcomeScreen.backgroundImage;
    const overlayOpacity = config.welcomeScreen.overlayOpacity ?? 40;

    // Check if it's a split layout with image
    if (isSplitLayout && config.welcomeScreen.image) {
      const isRightLayout = currentLayout === 'desktop-right-left';
      
      return (
        <div className="w-full h-full flex" style={bgStyle}>
          {hasWallpaper && <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity / 100 }} />}
          
          {/* Image side */}
          <div 
            className={`relative w-1/2 h-full ${isRightLayout ? 'order-2' : 'order-1'}`}
            style={{ overflow: 'hidden' }}
          >
            <img 
              src={config.welcomeScreen.image} 
              alt="Welcome" 
              className="w-full h-full object-cover"
              style={{
                borderRadius: config.welcomeScreen.imageSettings?.borderRadius || 0,
                transform: `rotate(${config.welcomeScreen.imageSettings?.rotation || 0}deg)`,
              }}
            />
          </div>

          {/* Content side */}
          <div 
            className={`relative z-10 w-1/2 h-full flex flex-col items-center justify-center p-8 ${isRightLayout ? 'order-1' : 'order-2'}`}
            style={{ backgroundColor: theme.backgroundColor }}
          >
            <div className="max-w-lg text-center space-y-6">
              <h1 
                className="text-4xl md:text-5xl font-bold"
                style={{ color: theme.textColor }}
                dangerouslySetInnerHTML={{ __html: config.welcomeScreen.titleHtml || config.welcomeScreen.title }}
              />
              <p 
                className="text-lg md:text-xl opacity-80"
                style={{ color: theme.textSecondaryColor || theme.textColor }}
                dangerouslySetInnerHTML={{ __html: config.welcomeScreen.subtitleHtml || config.welcomeScreen.subtitle }}
              />
              <button
                onClick={handleNext}
                className="px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
                style={buttonStyles}
              >
                {config.welcomeScreen.buttonText || "Commencer"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Centered layout (default)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 relative" style={bgStyle}>
        {hasWallpaper && <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity / 100 }} />}
        <div className="relative z-10 max-w-2xl text-center space-y-6">
          <h1 
            className="text-4xl md:text-5xl font-bold"
            style={{ color: theme.textColor }}
            dangerouslySetInnerHTML={{ __html: config.welcomeScreen.titleHtml || config.welcomeScreen.title }}
          />
          <p 
            className="text-lg md:text-xl opacity-80"
            style={{ color: theme.textSecondaryColor || theme.textColor }}
            dangerouslySetInnerHTML={{ __html: config.welcomeScreen.subtitleHtml || config.welcomeScreen.subtitle }}
          />
          <button
            onClick={handleNext}
            className="px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            {config.welcomeScreen.buttonText || "Commencer"}
          </button>
        </div>
      </div>
    );
  };

  // Render contact screen
  const renderContact = () => {
    const bgStyle = getBackgroundStyle(config.contactForm);
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8" style={bgStyle}>
        <div className="max-w-md w-full space-y-6">
          <h2 
            className="text-3xl font-bold text-center"
            style={{ color: theme.textColor }}
          >
            {config.contactForm.title || "Vos coordonnées"}
          </h2>
          <p 
            className="text-lg text-center opacity-80"
            style={{ color: theme.textSecondaryColor || theme.textColor }}
          >
            {config.contactForm.subtitle || "Pour recevoir votre gain"}
          </p>
          
          <div className="space-y-4">
            {config.contactForm.fields?.map((field, index) => {
              if (field.type === 'select' && field.options) {
                return (
                  <div key={index}>
                    <label className="block mb-2" style={{ color: theme.textColor }}>{field.label}</label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border-2"
                      style={{ 
                        borderColor: theme.accentColor + '40',
                        backgroundColor: theme.backgroundColor,
                        color: theme.textColor
                      }}
                      onChange={(e) => setContactData(prev => ({ ...prev, [field.id]: e.target.value }))}
                      required={field.required}
                    >
                      <option value="">Sélectionnez</option>
                      {field.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              
              if (field.type === 'checkbox') {
                return (
                  <label key={index} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5"
                      style={{ accentColor: theme.accentColor }}
                      onChange={(e) => setContactData(prev => ({ ...prev, [field.id]: e.target.checked ? 'true' : 'false' }))}
                      required={field.required}
                    />
                    <span style={{ color: theme.textColor }}>{field.label}</span>
                  </label>
                );
              }
              
              return (
                <div key={index}>
                  <label className="block mb-2" style={{ color: theme.textColor }}>{field.label}</label>
                  <input
                    type={field.type === 'email' ? 'email' : field.type === 'phone' || field.type === 'tel' ? 'tel' : 'text'}
                    className="w-full px-4 py-3 rounded-lg border-2"
                    style={{ 
                      borderColor: theme.accentColor + '40',
                      backgroundColor: theme.backgroundColor,
                      color: theme.textColor
                    }}
                    onChange={(e) => setContactData(prev => ({ ...prev, [field.id]: e.target.value }))}
                    required={field.required}
                  />
                </div>
              );
            })}
          </div>
          
          <button
            onClick={handleNext}
            className="w-full px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            Continuer
          </button>
        </div>
      </div>
    );
  };

  // Render wheel screen
  const renderWheel = () => {
    const bgStyle = getBackgroundStyle(config.wheelScreen);
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8" style={bgStyle}>
        <div className="max-w-2xl w-full text-center space-y-6">
          <h2 
            className="text-3xl md:text-4xl font-bold"
            style={{ color: theme.textColor }}
          >
            {config.wheelScreen.title}
          </h2>
          <p 
            className="text-lg opacity-80"
            style={{ color: theme.textSecondaryColor || theme.textColor }}
          >
            {config.wheelScreen.subtitle}
          </p>
          
          <div className="flex justify-center">
            <SmartWheel
              segments={config.segments.map(s => ({ ...s, value: s.label }))}
              onSpin={() => setIsSpinning(true)}
              onResult={(segment) => handleSpinComplete(config.segments.find(s => s.id === segment.id) || config.segments[0])}
              size={wheelSize}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render ending screen
  const renderEnding = (isWin: boolean) => {
    const endingConfig = isWin ? config.endingWin : config.endingLose;
    const bgStyle = getBackgroundStyle(endingConfig);
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8" style={bgStyle}>
        <div className="max-w-lg text-center space-y-6">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto text-5xl"
            style={{ backgroundColor: isWin ? theme.accentColor + '20' : '#f8717120' }}
          >
            {isWin ? '🎉' : '😢'}
          </div>

          <h2 
            className="text-3xl md:text-4xl font-bold"
            style={{ color: theme.textColor }}
          >
            {replaceVariables(endingConfig.title)}
          </h2>
          <p 
            className="text-lg opacity-80"
            style={{ color: theme.textSecondaryColor || theme.textColor }}
          >
            {replaceVariables(endingConfig.subtitle)}
          </p>

          <button
            onClick={() => {
              AnalyticsTrackingService.resetSessionTracking(campaignId);
              setActiveView('welcome');
              setWonPrize(null);
              setIsSpinning(false);
            }}
            className="px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            Rejouer
          </button>
        </div>
      </div>
    );
  };

  // Check if header/footer should be shown
  const headerConfig = config.layout?.header;
  const footerConfig = config.layout?.footer;
  const showHeader = headerConfig?.enabled !== false;
  const showFooter = footerConfig?.enabled !== false;

  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Header */}
      {showHeader && headerConfig && (
        <CampaignHeader config={headerConfig} />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
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
      {showFooter && footerConfig && (
        <CampaignFooter config={footerConfig} />
      )}
    </div>
  );
};
