import { motion, AnimatePresence } from "framer-motion";
import { ScratchConfig, ScratchCard } from "./ScratchBuilder";
import { useState, useMemo, useEffect } from "react";
import { useTheme, getButtonStyles } from "@/contexts/ThemeContext";
import { SmartScratch } from "./SmartScratch/SmartScratch";
import { ParticipationService } from "@/services/ParticipationService";
import { AnalyticsTrackingService } from "@/services/AnalyticsTrackingService";
import { useStepTracking } from "@/hooks/useStepTracking";

interface ParticipantScratchRenderProps {
  config: ScratchConfig;
  campaignId: string;
}

export const ParticipantScratchRender = ({ config, campaignId }: ParticipantScratchRenderProps) => {
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose'>('welcome');
  const [contactData, setContactData] = useState({ name: "", email: "", phone: "" });
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [hasScratched, setHasScratched] = useState(false);
  const { theme } = useTheme();
  const buttonStyles = getButtonStyles(theme);

  // Déterminer l'étape actuelle pour le tracking
  const getCurrentStep = (): 'welcome' | 'contact' | 'game' | 'ending' => {
    if (activeView === 'welcome') return 'welcome';
    if (activeView === 'contact') return 'contact';
    if (activeView === 'scratch') return 'game';
    return 'ending';
  };

  // Track automatiquement le temps passé par étape
  useStepTracking(campaignId, getCurrentStep());

  // Determine the winning card once when entering scratch view
  const selectedCard = useMemo(() => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const card of config.cards) {
      cumulative += card.probability || 0;
      if (random <= cumulative) {
        return card;
      }
    }
    return config.cards[0];
  }, [activeView === 'scratch']);

  const handleNext = () => {
    if (activeView === 'welcome') {
      if (config.contactForm?.enabled) {
        setActiveView('contact');
      } else {
        setActiveView('scratch');
      }
    } else if (activeView === 'contact') {
      setActiveView('scratch');
    }
  };

  const handleScratchComplete = async (isWin: boolean, prize?: string) => {
    setHasScratched(true);
    setWonPrize(prize || null);
    
    // Enregistrer la participation
    await ParticipationService.recordParticipation({
      campaignId,
      contactData,
      result: {
        type: isWin ? 'win' : 'lose',
        prize: isWin ? prize : undefined,
      },
    });
    
    setTimeout(() => {
      setActiveView(isWin ? 'ending-win' : 'ending-lose');
    }, 1500);
  };

  const replaceVariables = (text: string) => {
    return text.replace(/\{\{prize\}\}/g, wonPrize || 'votre lot');
  };

  const renderWelcome = () => {
    const bgStyle = config.welcomeScreen.wallpaperImage 
      ? { backgroundImage: `url(${config.welcomeScreen.wallpaperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: theme.backgroundColor };

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 relative" style={bgStyle}>
        {config.welcomeScreen.wallpaperImage && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        <div className="relative z-10 max-w-2xl text-center">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: theme.textColor }}
          >
            {config.welcomeScreen.title}
          </h1>
          <p 
            className="text-lg md:text-xl mb-10 opacity-80"
            style={{ color: theme.textSecondaryColor }}
          >
            {config.welcomeScreen.subtitle}
          </p>
          <button
            onClick={handleNext}
            className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            {config.welcomeScreen.buttonText || "Commencer"}
          </button>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="max-w-md w-full">
          <h2 
            className="text-3xl font-bold mb-4 text-center"
            style={{ color: theme.textColor }}
          >
            {config.contactForm.title || "Vos coordonnées"}
          </h2>
          <p 
            className="text-lg mb-8 text-center opacity-80"
            style={{ color: theme.textSecondaryColor }}
          >
            {config.contactForm.subtitle || "Pour recevoir votre gain"}
          </p>
          
          <div className="space-y-4">
            {config.contactForm.fields?.map((field, index) => (
              <div key={index}>
                <label 
                  className="block mb-2 text-base font-normal"
                  style={{ color: theme.textColor }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                  style={{ 
                    borderColor: theme.accentColor + '40',
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor
                  }}
                  onChange={(e) => setContactData(prev => ({ ...prev, [field.type]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="w-full mt-8 px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            Continuer
          </button>
        </div>
      </div>
    );
  };

  const renderScratch = () => {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="max-w-2xl w-full text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: theme.textColor }}
          >
            {config.scratchScreen.title}
          </h2>
          <p 
            className="text-lg mb-8 opacity-80"
            style={{ color: theme.textSecondaryColor }}
          >
            {config.scratchScreen.subtitle}
          </p>
          
          {/* Scratch Card */}
          <div className="flex justify-center mb-8">
            <SmartScratch
              width={config.scratchScreen.cardWidth || 280}
              height={config.scratchScreen.cardHeight || 200}
              scratchColor={config.scratchScreen.scratchColor || "#C0C0C0"}
              scratchImage={config.scratchScreen.scratchImage}
              borderRadius={config.scratchScreen.cardBorderRadius || 16}
              borderWidth={config.scratchScreen.cardBorderWidth || 0}
              borderColor={config.scratchScreen.cardBorderColor || "#000000"}
              revealContent={
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold p-4">
                  {selectedCard.revealText}
                </div>
              }
              threshold={config.scratchScreen.threshold || 70}
              brushSize={config.scratchScreen.brushSize || 40}
              onComplete={() => handleScratchComplete(selectedCard.isWinning, selectedCard.revealText)}
            />
          </div>
          
          <p 
            className="text-sm opacity-60"
            style={{ color: theme.textSecondaryColor }}
          >
            Grattez la carte pour découvrir votre lot
          </p>
        </div>
      </div>
    );
  };

  const renderEnding = (isWin: boolean) => {
    const endingConfig = isWin ? config.endingWin : config.endingLose;
    
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="max-w-lg text-center">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl"
            style={{ backgroundColor: isWin ? theme.accentColor + '20' : '#f8717120' }}
          >
            {isWin ? '🎉' : '😢'}
          </div>

          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: theme.textColor }}
          >
            {replaceVariables(endingConfig.title)}
          </h2>
          <p 
            className="text-lg mb-8 opacity-80"
            style={{ color: theme.textSecondaryColor }}
          >
            {replaceVariables(endingConfig.subtitle)}
          </p>

          <button
            onClick={() => {
              // Reset session tracking pour permettre un nouveau comptage
              AnalyticsTrackingService.resetSessionTracking(campaignId);
              setActiveView('welcome');
              setWonPrize(null);
              setHasScratched(false);
            }}
            className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            Rejouer
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      style={{ backgroundColor: theme.backgroundColor }}
    >
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
          {activeView === 'scratch' && renderScratch()}
          {activeView === 'ending-win' && renderEnding(true)}
          {activeView === 'ending-lose' && renderEnding(false)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
