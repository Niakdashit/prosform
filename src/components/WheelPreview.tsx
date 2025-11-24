import { motion, AnimatePresence } from "framer-motion";
import { WheelConfig } from "./WheelBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Smartphone, Sparkles } from "lucide-react";
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
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [variableTarget, setVariableTarget] = useState<'title' | 'subtitle' | null>(null);
  const [menuView, setMenuView] = useState<'main' | 'variables'>('main');
  const { theme } = useTheme();

  const availableVariables = [
    { key: 'first_name', label: 'First name', description: "User's first name" },
    { key: 'email', label: 'Email', description: "User's email address" },
    { key: 'prize', label: 'Prize', description: "Won prize" },
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
            onFocusTitle={() => setEditingField('welcome-title')}
            onFocusSubtitle={() => setEditingField('welcome-subtitle')}
            onBlurTitle={(value) => handleTitleBlur('welcome-title', value)}
            onBlurSubtitle={(value) => handleSubtitleBlur('welcome-subtitle', value)}
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
