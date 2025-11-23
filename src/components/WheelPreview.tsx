import { motion, AnimatePresence } from "framer-motion";
import { WheelConfig } from "./WheelBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Smartphone } from "lucide-react";
import { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import SmartWheel from "./SmartWheel/SmartWheel";
import { LayoutWrapper } from "./layouts/LayoutWrapper";
import { WelcomeLayouts } from "./layouts/WelcomeLayouts";
import { ContactLayouts } from "./layouts/ContactLayouts";
import { WheelLayouts } from "./layouts/WheelLayouts";
import { EndingLayouts } from "./layouts/EndingLayouts";

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
  const { theme } = useTheme();

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
          <WelcomeLayouts
            layout={currentLayout}
            viewMode={viewMode}
            title={config.welcomeScreen.title}
            subtitle={config.welcomeScreen.subtitle}
            buttonText={config.welcomeScreen.buttonText}
            onButtonClick={onNext}
            backgroundColor={theme.backgroundColor}
            textColor={theme.textColor}
            buttonColor={theme.buttonColor}
            editingField={editingField}
            onEditTitle={() => setEditingField('welcome-title')}
            onEditSubtitle={() => setEditingField('welcome-subtitle')}
            onTitleChange={(value) => onUpdateConfig({ 
              welcomeScreen: { ...config.welcomeScreen, title: value } 
            })}
            onSubtitleChange={(value) => onUpdateConfig({ 
              welcomeScreen: { ...config.welcomeScreen, subtitle: value } 
            })}
            onBlur={() => setEditingField(null)}
          />
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
          />
        );

      case 'wheel':
        return (
          <WheelLayouts
            layout={currentLayout}
            viewMode={viewMode}
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
            onRestart={() => {
              // Reset state - navigation handled by parent
              setWonPrize(null);
              setContactData({ name: '', email: '', phone: '' });
            }}
          />
        );
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100">
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
