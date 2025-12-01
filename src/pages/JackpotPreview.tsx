import { useEffect, useState, useMemo } from "react";
import { JackpotConfig } from "@/components/JackpotBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { JackpotPreview } from "@/components/JackpotPreview";
import { supabase } from "@/integrations/supabase/client";
import { useStepTracking } from "@/hooks/useStepTracking";
import { ParticipationService } from "@/services/ParticipationService";

const JackpotPreviewContent = () => {
  const [config, setConfig] = useState<JackpotConfig | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose'>('welcome');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactData, setContactData] = useState<Record<string, string>>({});

  // Récupérer le campaignId depuis l'URL
  const campaignId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('id');
  }, []);

  // Convertir activeView pour le tracking
  const trackingStep = useMemo(() => {
    if (activeView === 'jackpot') return 'game';
    if (activeView === 'ending-win' || activeView === 'ending-lose') return 'ending';
    return activeView as 'welcome' | 'contact';
  }, [activeView]);

  // Hook de tracking des étapes
  useStepTracking(campaignId || '', trackingStep, !!campaignId && !!config);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      setError(null);
      
      const isMobileDevice = window.innerWidth < 768;
      if (isMobileDevice) {
        setViewMode('mobile');
      }

      if (campaignId) {
        try {
          const { data: campaign, error: fetchError } = await supabase
            .from('campaigns')
            .select('config, theme')
            .eq('id', campaignId)
            .single();

          if (fetchError) {
            console.error('Error fetching campaign:', fetchError);
            setError('Campagne non trouvée');
            setIsLoading(false);
            return;
          }

          if (campaign?.config) {
            setConfig(campaign.config as JackpotConfig);
          } else {
            setError('Configuration de campagne invalide');
          }
        } catch (err) {
          console.error('Error loading campaign:', err);
          setError('Erreur de chargement');
        }
      } else {
        const savedConfig = localStorage.getItem('jackpot-config');
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
        }
        
        const savedViewMode = localStorage.getItem('jackpot-viewMode');
        if (savedViewMode && !isMobileDevice) {
          setViewMode(savedViewMode as 'desktop' | 'mobile');
        }
      }
      
      setIsLoading(false);
    };

    loadConfig();
  }, [campaignId]);

  if (isLoading) {
    return <div className="fixed inset-0" style={{ backgroundColor: '#1a1a2e' }} />;
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p className="text-white">{error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p className="text-white">Aucune configuration trouvée</p>
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

  const handleGoToEnding = async (isWin: boolean) => {
    setActiveView(isWin ? 'ending-win' : 'ending-lose');

    if (campaignId) {
      try {
        // Extraire l'email du contactData
        const email = contactData.email || Object.entries(contactData).find(([key]) => key.toLowerCase().includes('email'))?.[1];
        
        await ParticipationService.recordParticipation({
          campaignId,
          email,
          contactData: {
            name: contactData.name || contactData.nom || contactData.prenom,
            email,
            phone: contactData.phone || contactData.telephone || contactData.tel,
            ...contactData,
          },
          result: { type: isWin ? 'win' : 'lose' },
        });
      } catch (error) {
        console.error('Failed to record participation', error);
      }
    }
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
        onContactDataChange={setContactData}
        prizes={[]}
      />
    </div>
  );
};

const JackpotPreviewPage = () => {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const campaignId = new URLSearchParams(window.location.search).get('id');
      
      if (campaignId) {
        try {
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('theme')
            .eq('id', campaignId)
            .single();

          if (campaign?.theme) {
            setTheme(campaign.theme as ThemeSettings);
          }
        } catch (err) {
          console.error('Error loading theme:', err);
        }
      } else {
        const savedTheme = localStorage.getItem('jackpot-theme');
        if (savedTheme) {
          setTheme(JSON.parse(savedTheme));
        }
      }
      
      setIsLoading(false);
    };

    loadTheme();
  }, []);

  if (isLoading) {
    return <div className="fixed inset-0" style={{ backgroundColor: '#1a1a2e' }} />;
  }

  return (
    <ThemeProvider initialTheme={theme}>
      <JackpotPreviewContent />
    </ThemeProvider>
  );
};

export default JackpotPreviewPage;
