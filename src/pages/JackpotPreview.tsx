import { useEffect, useState } from "react";
import { JackpotConfig } from "@/components/JackpotBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { JackpotPreview } from "@/components/JackpotPreview";

const JackpotPreviewContent = () => {
  const [config, setConfig] = useState<JackpotConfig | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose'>('welcome');

  useEffect(() => {
    const savedConfig = localStorage.getItem('jackpot-config');
    
    // Détecter si on est sur mobile (largeur < 768px)
    const isMobileDevice = window.innerWidth < 768;
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    
    // Forcer le mode mobile si on est sur un appareil mobile
    if (isMobileDevice) {
      setViewMode('mobile');
    } else {
      const savedViewMode = localStorage.getItem('jackpot-viewMode');
      if (savedViewMode) {
        setViewMode(savedViewMode as 'desktop' | 'mobile');
      }
    }
  }, []);

  if (!config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

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

  const handleGoToEnding = (isWin: boolean) => {
    setActiveView(isWin ? 'ending-win' : 'ending-lose');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <JackpotPreview
        config={config}
        activeView={activeView}
        onUpdateConfig={() => {}}
        viewMode={viewMode}
        onToggleViewMode={() => {}}
        isMobileResponsive={true}
        isReadOnly={true}
        onNext={handleNext}
        onGoToEnding={handleGoToEnding}
        prizes={[]}
      />
    </div>
  );
};

const JackpotPreviewPage = () => {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('jackpot-theme');
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={theme}>
      <JackpotPreviewContent />
    </ThemeProvider>
  );
};

export default JackpotPreviewPage;
