import { useEffect, useState, useMemo } from "react";
import { WheelConfig } from "@/components/WheelBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { WheelPreview } from "@/components/WheelPreview";
import { ParticipationService } from "@/services/ParticipationService";
import { useStepTracking } from "@/hooks/useStepTracking";
import { supabase } from "@/integrations/supabase/client";

const WheelPreviewContent = () => {
  const [config, setConfig] = useState<WheelConfig | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'>('welcome');
  const [assetsReady, setAssetsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactData, setContactData] = useState<Record<string, string>>({});

  // Récupérer le campaignId depuis l'URL
  const campaignId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('id');
  }, []);

  // Convertir activeView pour le tracking (wheel -> game, ending-win/ending-lose -> ending)
  const trackingStep = useMemo(() => {
    if (activeView === 'wheel') return 'game';
    if (activeView === 'ending-win' || activeView === 'ending-lose') return 'ending';
    return activeView as 'welcome' | 'contact';
  }, [activeView]);

  // Hook de tracking des étapes
  useStepTracking(campaignId || '', trackingStep, !!campaignId && !!config);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      setError(null);
      
      // Détecter si on est sur mobile (largeur < 768px)
      const isMobileDevice = window.innerWidth < 768;
      if (isMobileDevice) {
        setViewMode('mobile');
      }

      // Si on a un campaignId, charger depuis Supabase
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
            setConfig(campaign.config as WheelConfig);
          } else {
            setError('Configuration de campagne invalide');
          }
        } catch (err) {
          console.error('Error loading campaign:', err);
          setError('Erreur de chargement');
        }
      } else {
        // Sinon, charger depuis localStorage (mode preview depuis le builder)
        const savedConfig = localStorage.getItem('wheel-config');
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
        }
        
        const savedViewMode = localStorage.getItem('wheel-viewMode');
        if (savedViewMode && !isMobileDevice) {
          setViewMode(savedViewMode as 'desktop' | 'mobile');
        }
      }
      
      setIsLoading(false);
    };

    loadConfig();
  }, [campaignId]);

  if (isLoading) {
    return <div className="fixed inset-0 bg-background" />;
  }

  if (error) {
    return <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">{error}</p>
      </div>
    </div>;
  }

  if (!config) {
    return <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Aucune configuration trouvée</p>
      </div>
    </div>;
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

  // Appelé quand l'utilisateur clique sur "Faire tourner" - enregistre la participation
  const handleSpin = async () => {
    if (campaignId) {
      try {
        // Extraire l'email du contactData (peut être dans 'email' ou dans un champ avec id contenant 'email')
        const email = contactData.email || Object.entries(contactData).find(([key]) => key.toLowerCase().includes('email'))?.[1];
        
        await ParticipationService.recordParticipation({
          campaignId,
          email,
          contactData: {
            name: contactData.name || contactData.nom || contactData.prenom,
            email,
            phone: contactData.phone || contactData.telephone || contactData.tel,
            ...contactData, // Inclure tous les autres champs
          },
          result: {
            type: 'pending', // Le résultat sera mis à jour à l'ending
          },
        });
      } catch (error) {
        console.error('Failed to record participation at spin', error);
      }
    }
  };

  // Appelé quand le résultat est affiché (ending)
  const handleGoToEnding = async (isWin: boolean) => {
    setActiveView(isWin ? 'ending-win' : 'ending-lose');
    // La completion est trackée automatiquement par useStepTracking quand on arrive à l'ending
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
        onSpin={handleSpin}
        onContactDataChange={setContactData}
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
    const loadTheme = async () => {
      const campaignId = new URLSearchParams(window.location.search).get('id');
      
      if (campaignId) {
        // Charger le thème depuis Supabase
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
        // Charger depuis localStorage (mode preview depuis le builder)
        const savedTheme = localStorage.getItem('wheel-theme');
        if (savedTheme) {
          setTheme(JSON.parse(savedTheme));
        }
      }
      
      setIsLoading(false);
    };

    loadTheme();
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
