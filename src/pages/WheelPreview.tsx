import { useEffect, useState } from "react";
import { WheelConfig } from "@/components/WheelBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { WheelPreview } from "@/components/WheelPreview";

const WheelPreviewContent = () => {
  const [config, setConfig] = useState<WheelConfig | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'>('welcome');

  useEffect(() => {
    const savedConfig = localStorage.getItem('wheel-config');
    
    // Détecter si on est sur mobile (largeur < 768px)
    const isMobileDevice = window.innerWidth < 768;
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    
    // Forcer le mode mobile si on est sur un appareil mobile
    if (isMobileDevice) {
      setViewMode('mobile');
    } else {
      const savedViewMode = localStorage.getItem('wheel-viewMode');
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
        setActiveView('wheel');
      }
    } else if (activeView === 'contact') {
      setActiveView('wheel');
    }
  };

  const handleGoToEnding = (isWin: boolean) => {
    setActiveView(isWin ? 'ending-win' : 'ending-lose');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center">
      <div 
        className="relative"
        style={{
          width: viewMode === 'desktop' ? '100%' : '375px',
          maxWidth: viewMode === 'desktop' ? '1400px' : '375px',
          height: '100%',
          maxHeight: viewMode === 'desktop' ? '800px' : '100%',
        }}
      >
        <WheelPreview
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
    </div>
  );
};

const WheelPreviewPage = () => {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('wheel-theme');
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
      <WheelPreviewContent />
    </ThemeProvider>
  );
};

export default WheelPreviewPage;
