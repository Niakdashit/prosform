import { useEffect, useState } from "react";
import { ScratchConfig } from "@/components/ScratchBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { ScratchPreview } from "@/components/ScratchPreview";

const ScratchPreviewContent = () => {
  const [config, setConfig] = useState<ScratchConfig | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose'>('welcome');

  useEffect(() => {
    const savedConfig = localStorage.getItem('scratch-config');
    
    // Détecter si on est sur mobile (largeur < 768px)
    const isMobileDevice = window.innerWidth < 768;
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    
    // Forcer le mode mobile si on est sur un appareil mobile
    if (isMobileDevice) {
      setViewMode('mobile');
    } else {
      const savedViewMode = localStorage.getItem('scratch-viewMode');
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
        setActiveView('scratch');
      }
    } else if (activeView === 'contact') {
      setActiveView('scratch');
    }
  };

  const handleGoToEnding = (isWin: boolean) => {
    setActiveView(isWin ? 'ending-win' : 'ending-lose');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <ScratchPreview
        config={config}
        activeView={activeView}
        onUpdateConfig={() => {}}
        viewMode={viewMode}
        onToggleViewMode={() => {}}
        isMobileResponsive={true}
        isReadOnly={true}
        onNext={handleNext}
        onGoToEnding={handleGoToEnding}
        prizes={(config as any).prizes || []}
      />
    </div>
  );
};

const ScratchPreviewPage = () => {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('scratch-theme');
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
      <ScratchPreviewContent />
    </ThemeProvider>
  );
};

export default ScratchPreviewPage;
