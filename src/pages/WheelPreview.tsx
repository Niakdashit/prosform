import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { WheelConfig } from "@/components/WheelBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { WheelPreview } from "@/components/WheelPreview";
import { CampaignService } from "@/services/CampaignService";

interface PreviewData {
  config: WheelConfig;
  theme: ThemeSettings | null;
  viewMode: 'desktop' | 'mobile';
}

const WheelPreviewContent = ({ config, viewMode: initialViewMode }: { config: WheelConfig; viewMode: 'desktop' | 'mobile' }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(initialViewMode);
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'>('welcome');

  useEffect(() => {
    // Détecter si on est sur mobile (largeur < 768px)
    const isMobileDevice = window.innerWidth < 768;
    if (isMobileDevice) {
      setViewMode('mobile');
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
      />
    </div>
  );
};

const WheelPreviewPage = () => {
  const [searchParams] = useSearchParams();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreviewData = async () => {
      const campaignId = searchParams.get('id');
      const modeParam = searchParams.get('mode') as 'desktop' | 'mobile' | null;
      
      // Si on a un ID, charger depuis Supabase
      if (campaignId) {
        try {
          const campaign = await CampaignService.getById(campaignId);
          if (campaign) {
            setPreviewData({
              config: campaign.config as unknown as WheelConfig,
              theme: campaign.theme as unknown as ThemeSettings | null,
              viewMode: modeParam || 'desktop',
            });
          } else {
            setError('Campagne non trouvée');
          }
        } catch (err) {
          console.error('Error loading campaign:', err);
          setError('Erreur de chargement');
        }
      } else {
        // Sinon, charger depuis localStorage
        const savedConfig = localStorage.getItem('wheel-config');
        const savedTheme = localStorage.getItem('wheel-theme');
        const savedViewMode = localStorage.getItem('wheel-viewMode');
        
        if (savedConfig) {
          setPreviewData({
            config: JSON.parse(savedConfig),
            theme: savedTheme ? JSON.parse(savedTheme) : null,
            viewMode: (savedViewMode as 'desktop' | 'mobile') || 'desktop',
          });
        } else {
          setError('Aucune configuration trouvée');
        }
      }
      
      setIsLoading(false);
    };
    
    loadPreviewData();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  if (error || !previewData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p className="text-white">{error || 'Erreur de chargement'}</p>
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={previewData.theme}>
      <WheelPreviewContent config={previewData.config} viewMode={previewData.viewMode} />
    </ThemeProvider>
  );
};

export default WheelPreviewPage;
