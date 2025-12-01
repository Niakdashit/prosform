import { motion, AnimatePresence } from "framer-motion";
import { JackpotConfig } from "./JackpotBuilder";
import { useState, useEffect } from "react";
import { useTheme, getButtonStyles } from "@/contexts/ThemeContext";
import SmartJackpot from "./SmartJackpot/SmartJackpot";
import { ParticipationService } from "@/services/ParticipationService";
import { useStepTracking } from "@/hooks/useStepTracking";

interface ParticipantJackpotRenderProps {
  config: JackpotConfig;
  campaignId: string;
}

export const ParticipantJackpotRender = ({ config, campaignId }: ParticipantJackpotRenderProps) => {
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose'>('welcome');
  const [contactData, setContactData] = useState({ name: "", email: "", phone: "" });
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const { theme } = useTheme();
  const buttonStyles = getButtonStyles(theme);

  // Déterminer l'étape actuelle pour le tracking
  const getCurrentStep = (): 'welcome' | 'contact' | 'game' | 'ending' => {
    if (activeView === 'welcome') return 'welcome';
    if (activeView === 'contact') return 'contact';
    if (activeView === 'jackpot') return 'game';
    return 'ending';
  };

  // Track automatiquement le temps passé par étape
  useStepTracking(campaignId, getCurrentStep());

  const handleNext = () => {
    if (activeView === 'welcome') {
      if (config.contactForm?.enabled) {
        setActiveView('contact');
      } else {
        setActiveView('jackpot');
      }
    } else if (activeView === 'contact') {
      setActiveView('jackpot');
    }
  };

  const handleSpinComplete = async (isWin: boolean, prize?: string) => {
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

  const renderJackpot = () => {
    // Convert symbols to string array for SmartJackpot
    const symbolEmojis = config.symbols.map(s => s.emoji);

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
            {config.jackpotScreen.title}
          </h2>
          <p 
            className="text-lg mb-8 opacity-80"
            style={{ color: theme.textSecondaryColor }}
          >
            {config.jackpotScreen.subtitle}
          </p>
          
          {/* Jackpot Machine */}
          <div className="flex justify-center mb-8">
            <SmartJackpot
              symbols={symbolEmojis}
              template={config.jackpotScreen.template}
              spinDuration={config.jackpotScreen.spinDuration}
              onWin={(result) => {
                setWonPrize(result.join(' '));
                setTimeout(() => setActiveView('ending-win'), 1500);
              }}
              onLose={() => {
                setTimeout(() => setActiveView('ending-lose'), 1500);
              }}
            />
          </div>
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
              setActiveView('welcome');
              setWonPrize(null);
              setHasPlayed(false);
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
          {activeView === 'jackpot' && renderJackpot()}
          {activeView === 'ending-win' && renderEnding(true)}
          {activeView === 'ending-lose' && renderEnding(false)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
