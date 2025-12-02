import { motion, AnimatePresence } from "framer-motion";
import { WheelConfig, WheelSegment } from "./WheelBuilder";
import { useState, useEffect } from "react";
import { useTheme, getButtonStyles, ThemeSettings } from "@/contexts/ThemeContext";
import { ParticipationService } from "@/services/ParticipationService";
import { AnalyticsTrackingService } from "@/services/AnalyticsTrackingService";
import { useStepTracking } from "@/hooks/useStepTracking";
import { CampaignHeader, CampaignFooter } from "./campaign";
import { WelcomeLayouts } from "./layouts/WelcomeLayouts";
import { ContactLayouts } from "./layouts/ContactLayouts";
import { WheelLayouts } from "./layouts/WheelLayouts";
import { EndingLayouts } from "./layouts/EndingLayouts";

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

  // Determine if current layout is a split layout
  const isSplitLayout = () => {
    const splitLayouts = ['desktop-split', 'desktop-card', 'desktop-panel', 'desktop-left-right', 'desktop-right-left'];
    return splitLayouts.includes(currentLayout);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'welcome':
        return (
          <WelcomeLayouts
            layout={currentLayout as any}
            viewMode={viewMode}
            title={config.welcomeScreen.title}
            subtitle={config.welcomeScreen.subtitle}
            buttonText={config.welcomeScreen.buttonText || "Commencer"}
            onButtonClick={handleNext}
            backgroundColor={theme.backgroundColor}
            textColor={theme.textColor}
            buttonColor={theme.buttonColor}
            backgroundImage={config.welcomeScreen.backgroundImage}
          />
        );

      case 'contact':
        return (
          <ContactLayouts
            layout={currentLayout as any}
            viewMode={viewMode}
            title={config.contactForm.title || "Vos coordonnées"}
            subtitle={config.contactForm.subtitle || "Pour recevoir votre gain"}
            fields={config.contactForm.fields || []}
            contactData={contactData}
            onFieldChange={(type, value) => setContactData(prev => ({ ...prev, [type]: value }))}
            onSubmit={handleNext}
            backgroundColor={theme.backgroundColor}
            textColor={theme.textColor}
            buttonColor={theme.buttonColor}
            isReadOnly={true}
          />
        );

      case 'wheel':
        return (
          <WheelLayouts
            layout={currentLayout as any}
            viewMode={viewMode}
            title={config.wheelScreen.title}
            subtitle={config.wheelScreen.subtitle}
            segments={config.segments}
            isSpinning={isSpinning}
            onSpin={() => setIsSpinning(true)}
            onResult={(segment) => {
              const foundSegment = config.segments.find(s => s.id === segment.id);
              if (foundSegment) {
                handleSpinComplete(foundSegment);
              }
            }}
            onComplete={() => {}}
            backgroundColor={theme.backgroundColor}
            textColor={theme.textColor}
            buttonColor={theme.buttonColor}
          />
        );

      case 'ending-win':
      case 'ending-lose':
        const isWin = activeView === 'ending-win';
        const endingConfig = isWin ? config.endingWin : config.endingLose;
        return (
          <EndingLayouts
            layout={currentLayout as any}
            viewMode={viewMode}
            title={replaceVariables(endingConfig.title)}
            subtitle={replaceVariables(endingConfig.subtitle)}
            wonPrize={wonPrize}
            backgroundColor={theme.backgroundColor}
            textColor={theme.textColor}
            buttonColor={theme.buttonColor}
            onRestart={() => {
              AnalyticsTrackingService.resetSessionTracking(campaignId);
              setActiveView('welcome');
              setWonPrize(null);
              setIsSpinning(false);
            }}
          />
        );

      default:
        return null;
    }
  };

  // Get background style for current view
  const getCurrentBackgroundStyle = () => {
    switch (activeView) {
      case 'welcome':
        return getBackgroundStyle(config.welcomeScreen);
      case 'contact':
        return getBackgroundStyle(config.contactForm);
      case 'wheel':
        return getBackgroundStyle(config.wheelScreen);
      case 'ending-win':
        return getBackgroundStyle(config.endingWin);
      case 'ending-lose':
        return getBackgroundStyle(config.endingLose);
      default:
        return { backgroundColor: theme.backgroundColor };
    }
  };

  // Get current screen config for overlay
  const getCurrentScreenConfig = () => {
    switch (activeView) {
      case 'welcome': return config.welcomeScreen;
      case 'contact': return config.contactForm;
      case 'wheel': return config.wheelScreen;
      case 'ending-win': return config.endingWin;
      case 'ending-lose': return config.endingLose;
      default: return config.welcomeScreen;
    }
  };

  // Check if header/footer should be shown
  const headerConfig = config.layout?.header;
  const footerConfig = config.layout?.footer;
  const showHeader = headerConfig?.enabled !== false;
  const showFooter = footerConfig?.enabled !== false;

  const currentScreenConfig = getCurrentScreenConfig() as any;

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
      <div 
        className="flex-1 overflow-auto relative"
        style={getCurrentBackgroundStyle()}
      >
        {/* Overlay for wallpaper */}
        {currentScreenConfig?.wallpaperImage && (
          <div 
            className="absolute inset-0 bg-black pointer-events-none" 
            style={{ opacity: (currentScreenConfig?.overlayOpacity ?? 40) / 100 }} 
          />
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={`w-full h-full relative z-10 ${
              isSplitLayout() && viewMode === 'desktop'
                ? 'grid grid-cols-2'
                : 'flex items-center justify-center'
            }`}
          >
            {renderContent()}
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