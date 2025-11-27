import { motion, AnimatePresence } from "framer-motion";
import { WheelConfig, WheelSegment } from "./WheelBuilder";
import { useState } from "react";
import { useTheme, getButtonStyles } from "@/contexts/ThemeContext";
import { SmartWheel } from "./SmartWheel";

interface ParticipantWheelRenderProps {
  config: WheelConfig;
}

export const ParticipantWheelRender = ({ config }: ParticipantWheelRenderProps) => {
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'>('welcome');
  const [contactData, setContactData] = useState({ name: "", email: "", phone: "" });
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const { theme } = useTheme();
  const buttonStyles = getButtonStyles(theme);

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

  const handleSpinComplete = (segment: WheelSegment) => {
    // Determine if it's a win or lose based on segment
    const isWin = segment.prizeId !== undefined || segment.label.toLowerCase().includes('gagn');
    setWonPrize(segment.label);
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
              <input
                key={index}
                type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                placeholder={field.label}
                className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                style={{ 
                  borderColor: theme.accentColor + '40',
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor
                }}
                onChange={(e) => setContactData(prev => ({ ...prev, [field.type]: e.target.value }))}
              />
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

  const renderWheel = () => {
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
            {config.wheelScreen.title}
          </h2>
          <p 
            className="text-lg mb-8 opacity-80"
            style={{ color: theme.textSecondaryColor }}
          >
            {config.wheelScreen.subtitle}
          </p>
          
          {/* Wheel */}
          <div className="flex justify-center mb-8">
            <SmartWheel
              segments={config.segments.map(s => ({ ...s, value: s.label }))}
              onSpin={() => setIsSpinning(true)}
              onResult={(segment) => handleSpinComplete(config.segments.find(s => s.id === segment.id) || config.segments[0])}
              size={Math.min(400, window.innerWidth - 64)}
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
              setIsSpinning(false);
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
          {activeView === 'wheel' && renderWheel()}
          {activeView === 'ending-win' && renderEnding(true)}
          {activeView === 'ending-lose' && renderEnding(false)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
