import { useEffect, useState } from "react";
import { WheelConfig } from "@/components/WheelBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { WheelPreview } from "@/components/WheelPreview";
import { ParticipationService } from "@/services/ParticipationService";

const WheelPreviewContent = () => {
  const [config, setConfig] = useState<WheelConfig | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'>('welcome');
  const [assetsReady, setAssetsReady] = useState(false);

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

  // Sécurité : ne jamais laisser l'overlay plus de 700ms
  useEffect(() => {
    if (activeView !== 'wheel') return;
    setAssetsReady(false);
    const timeout = setTimeout(() => {
      setAssetsReady(true);
    }, 700);
    return () => clearTimeout(timeout);
  }, [activeView]);

  if (!config) {
    return <div className="fixed inset-0 bg-background" />;
  }

  const campaignId = new URLSearchParams(window.location.search).get('id');

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

  const handleGoToEnding = async (isWin: boolean) => {
    setActiveView(isWin ? 'ending-win' : 'ending-lose');

    if (campaignId) {
      try {
        await ParticipationService.recordParticipation({
          campaignId,
          result: {
            type: isWin ? 'win' : 'lose',
          },
        });
      } catch (error) {
        console.error('Failed to record preview participation', error);
      }
    }
  };
  
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
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
        onAssetsReady={() => setAssetsReady(true)}
      />
      
      {/* Overlay blanc tant que les assets ne sont pas chargés - au-dessus de tout */}
      {activeView === 'wheel' && !assetsReady && (
        <div className="fixed inset-0 bg-background z-[9999]" />
      )}
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
    return <div className="fixed inset-0 bg-background" />;
  }

  return (
    <ThemeProvider initialTheme={theme}>
      <WheelPreviewContent />
    </ThemeProvider>
  );
};

export default WheelPreviewPage;
