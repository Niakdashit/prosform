import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { ScratchSidebar } from "./ScratchSidebar";
import { ScratchPreview } from "./ScratchPreview";
import { ScratchSettingsPanel } from "./ScratchSettingsPanel";
import { ScratchTopToolbar } from "./ScratchTopToolbar";
import { CampaignSettings } from "./CampaignSettings";
import { FloatingToolbar } from "./FloatingToolbar";
import { PublishModal } from "./PublishModal";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { useCampaignAutoSave } from "@/hooks/useCampaignAutoSave";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";

export interface ScratchPrize {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  remaining: number;
  value?: string;
  attributionMethod: 'probability' | 'calendar';
  // Champs pour méthode probabilité
  winProbability?: number;
  // Champs pour méthode calendrier
  calendarDate?: string;
  calendarTime?: string;
  timeWindow?: number;
  // Contenu révélé sous la carte Scratch
  scratchWinText?: string;
  scratchLoseText?: string;
  scratchWinImage?: string;
  scratchLoseImage?: string;
  status: 'active' | 'depleted' | 'scheduled';
}

export interface ScratchCard {
  id: string;
  revealText: string;
  revealImage?: string;
  isWinning: boolean;
  prizeId?: string;
  probability: number;
}

export interface ContactField {
  type: 'name' | 'email' | 'phone';
  required: boolean;
  label: string;
}

export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

export interface ScratchConfig {
  welcomeScreen: {
    title: string;
    titleHtml?: string;
    titleStyle?: TextStyle;
    titleWidth?: number;
    subtitle: string;
    subtitleHtml?: string;
    subtitleStyle?: TextStyle;
    subtitleWidth?: number;
    buttonText: string;
    blockSpacing: number;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
    applyBackgroundToAll?: boolean;
    showImage?: boolean;
    splitAlignment?: 'left' | 'center' | 'right';
    alignment?: 'left' | 'center' | 'right';
    image?: string;
    imageSettings?: {
      borderRadius: number;
      borderWidth: number;
      borderColor: string;
      rotation: number;
    };
  };
  contactForm: {
    enabled: boolean;
    title: string;
    titleHtml?: string;
    titleStyle?: TextStyle;
    titleWidth?: number;
    subtitle: string;
    subtitleHtml?: string;
    subtitleStyle?: TextStyle;
    subtitleWidth?: number;
    blockSpacing: number;
    fields: ContactField[];
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
  };
  scratchScreen: {
    title: string;
    titleHtml?: string;
    titleStyle?: TextStyle;
    titleWidth?: number;
    subtitle: string;
    subtitleHtml?: string;
    subtitleStyle?: TextStyle;
    subtitleWidth?: number;
    blockSpacing: number;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
    scratchColor: string;
    cardWidth: number;
    cardHeight: number;
    threshold: number;
    brushSize: number;
  };
  cards: ScratchCard[];
  endingWin: {
    title: string;
    titleHtml?: string;
    titleStyle?: TextStyle;
    titleWidth?: number;
    subtitle: string;
    subtitleHtml?: string;
    subtitleStyle?: TextStyle;
    subtitleWidth?: number;
    blockSpacing: number;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
  };
  endingLose: {
    title: string;
    titleHtml?: string;
    titleStyle?: TextStyle;
    titleWidth?: number;
    subtitle: string;
    subtitleHtml?: string;
    subtitleStyle?: TextStyle;
    subtitleWidth?: number;
    blockSpacing: number;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
  };
}

const defaultScratchConfig: ScratchConfig = {
  welcomeScreen: {
    title: "Grattez et gagnez !",
    subtitle: "Découvrez votre lot en grattant la carte",
    buttonText: "Commencer à gratter",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-left-right"
  },
  contactForm: {
    enabled: true,
    title: "Vos coordonnées",
    subtitle: "Pour vous envoyer votre gain",
    blockSpacing: 1,
    fields: [
      { type: 'name', required: true, label: 'Nom complet' },
      { type: 'email', required: true, label: 'Email' },
      { type: 'phone', required: false, label: 'Téléphone' }
    ],
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  },
  scratchScreen: {
    title: "Grattez pour gagner !",
    subtitle: "Découvrez votre lot en grattant la carte",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered",
    scratchColor: "#C0C0C0",
    cardWidth: 200,
    cardHeight: 220,
    threshold: 70,
    brushSize: 40
  },
  cards: [
    { id: '1', revealText: '🎉 Gagné !', isWinning: true, probability: 30 },
    { id: '2', revealText: '😢 Perdu', isWinning: false, probability: 70 }
  ],
  endingWin: {
    title: "Félicitations !",
    subtitle: "Vous avez gagné {{prize}}",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  },
  endingLose: {
    title: "Dommage !",
    subtitle: "Vous n'avez pas gagné cette fois-ci",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  }
};

export const ScratchBuilder = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [config, setConfig] = useState<ScratchConfig>(defaultScratchConfig);
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'campaign' | 'templates'>('design');
  const [campaignDefaultTab, setCampaignDefaultTab] = useState<string>('canaux');
  const [prizes, setPrizes] = useState<ScratchPrize[]>([]);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const { campaignId, isSaving, lastSaved, isLoading, isPublished, saveCampaign } = useCampaignAutoSave({
    campaignType: 'scratch',
    title: config.welcomeScreen.title || 'Scratch sans titre',
    config: { ...config, prizes },
    enabled: true,
    onConfigLoaded: (loadedConfig) => {
      if (loadedConfig) {
        setConfig(loadedConfig);
        if (loadedConfig.prizes) {
          setPrizes(loadedConfig.prizes);
        }
      }
    }
  });

  useEffect(() => {
    if (isMobile) {
      setViewMode('mobile');
    }
  }, [isMobile]);

  const updateConfig = (updates: Partial<ScratchConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateCard = (id: string, updates: Partial<ScratchCard>) => {
    setConfig(prev => ({
      ...prev,
      cards: prev.cards.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    }));
  };

  const addCard = () => {
    const newCard: ScratchCard = {
      id: `card-${Date.now()}`,
      revealText: 'Nouveau lot',
      isWinning: false,
      probability: 10
    };
    setConfig(prev => ({
      ...prev,
      cards: [...prev.cards, newCard]
    }));
    toast.success("Carte ajoutée");
  };

  const deleteCard = (id: string) => {
    if (config.cards.length <= 1) {
      toast.error("Il doit y avoir au moins 1 carte");
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      cards: prev.cards.filter(c => c.id !== id)
    }));
    toast.success("Carte supprimée");
  };

  const handleSavePrize = (prize: ScratchPrize) => {
    const existingPrize = prizes.find(p => p.id === prize.id);

    if (existingPrize) {
      // Nombre déjà attribué sur l'ancien lot
      const used = Math.max(0, existingPrize.quantity - existingPrize.remaining);
      // Nouveau remaining en fonction de la nouvelle quantité
      const newRemaining = Math.max(0, (prize.quantity ?? existingPrize.quantity) - used);

      setPrizes(prizes.map(p => 
        p.id === prize.id 
          ? { 
              ...p, 
              ...prize, 
              remaining: newRemaining,
              status: newRemaining === 0 ? 'depleted' : p.status,
            }
          : p
      ));
    } else {
      setPrizes([
        ...prizes, 
        { 
          ...prize, 
          remaining: prize.quantity, 
          status: 'active' as const 
        }
      ]);
    }

    toast.success("Lot enregistré");
  };

  const handleDeletePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
    toast.success("Lot supprimé");
  };

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <ScratchTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          const fullConfig = { ...config, prizes };
          try {
            localStorage.setItem('scratch-config', JSON.stringify(fullConfig));
            localStorage.setItem('scratch-viewMode', targetViewMode);
            localStorage.setItem('scratch-theme', JSON.stringify(theme));
            window.open('/scratch-preview', '_blank');
          } catch (e) {
            console.warn('localStorage full, trying without images:', e);
            const configWithoutImages = { ...config, prizes };
            try {
              localStorage.setItem('scratch-config', JSON.stringify(configWithoutImages));
              localStorage.setItem('scratch-viewMode', targetViewMode);
              localStorage.setItem('scratch-theme', JSON.stringify(theme));
              window.open('/scratch-preview', '_blank');
              toast.warning('Preview opened without images (images too large)');
            } catch (e2) {
              toast.error('Unable to open preview - data too large');
            }
          }
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBackToDashboard={() => navigate('/dashboard')}
        onSave={saveCampaign}
        onPublish={() => setPublishModalOpen(true)}
        isSaving={isSaving}
        lastSaved={lastSaved}
        isPublished={isPublished}
      />
        
      {activeTab === 'campaign' ? (
        <CampaignSettings 
          defaultTab={campaignDefaultTab}
          prizes={prizes as any}
          onSavePrize={handleSavePrize as any}
          onDeletePrize={handleDeletePrize}
          gameType="scratch"
          segments={[]}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
        {isMobile ? (
          <>
            <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <ScratchSidebar
                  config={config}
                  activeView={activeView}
                  onViewSelect={(view) => {
                    setActiveView(view);
                    setLeftDrawerOpen(false);
                  }}
                  onUpdateCard={updateCard}
                  onAddCard={addCard}
                  onDeleteCard={deleteCard}
                  onGoToDotation={() => {
                    setActiveTab('campaign');
                    setCampaignDefaultTab('dotation');
                    setLeftDrawerOpen(false);
                  }}
                />
              </DrawerContent>
            </Drawer>

            <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <ScratchSettingsPanel 
                  config={config}
                  activeView={activeView}
                  onUpdateConfig={updateConfig}
                  onViewModeChange={setViewMode}
                />
              </DrawerContent>
            </Drawer>

            <Button
              onClick={() => setLeftDrawerOpen(true)}
              className="fixed left-2 top-1/2 -translate-y-1/2 z-50 h-12 w-10 p-0 shadow-lg"
              variant="default"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Button
              onClick={() => setRightDrawerOpen(true)}
              className="fixed right-2 top-1/2 -translate-y-1/2 z-50 h-12 w-10 p-0 shadow-lg"
              variant="default"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <ScratchPreview
              config={config}
              activeView={activeView}
              onUpdateConfig={updateConfig}
              viewMode="mobile"
              onToggleViewMode={() => {}}
              isMobileResponsive={true}
              onNext={() => {
                const views: Array<'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose'> = ['welcome', 'contact', 'scratch', 'ending-win', 'ending-lose'];
                const currentIndex = views.indexOf(activeView);
                if (currentIndex < views.length - 1) {
                  setActiveView(views[currentIndex + 1]);
                }
              }}
              onGoToEnding={(isWin) => setActiveView(isWin ? 'ending-win' : 'ending-lose')}
              prizes={prizes}
              onUpdatePrize={(updatedPrize) => setPrizes(prev => prev.map(p => p.id === updatedPrize.id ? updatedPrize : p))}
            />
          </>
        ) : (
          <>
            <ScratchSidebar
              config={config}
              activeView={activeView}
              onViewSelect={setActiveView}
              onUpdateCard={updateCard}
              onAddCard={addCard}
              onDeleteCard={deleteCard}
              onGoToDotation={() => {
                setActiveTab('campaign');
                setCampaignDefaultTab('dotation');
              }}
            />
            
            {/* Preview area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
              {/* Top bar: view toggle on the right */}
              <div className="flex items-center justify-end px-4 pt-6 pb-1 bg-gray-100">
                <button
                  onClick={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 flex-shrink-0"
                  style={{ backgroundColor: '#F5B800', color: '#3D3731' }}
                >
                  {viewMode === 'desktop' ? (
                    <><Monitor className="w-4 h-4" /><span className="text-xs font-medium">Desktop</span></>
                  ) : (
                    <><Smartphone className="w-4 h-4" /><span className="text-xs font-medium">Mobile</span></>
                  )}
                </button>
              </div>
              
              {/* ScratchPreview */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <ScratchPreview
                  config={config}
                  activeView={activeView}
                  onUpdateConfig={updateConfig}
                  viewMode={viewMode}
                  onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
                  isMobileResponsive={false}
                  onNext={() => {
                    const views: Array<'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose'> = ['welcome', 'contact', 'scratch', 'ending-win', 'ending-lose'];
                    const currentIndex = views.indexOf(activeView);
                    if (currentIndex < views.length - 1) {
                      setActiveView(views[currentIndex + 1]);
                    }
                  }}
                  onGoToEnding={(isWin) => setActiveView(isWin ? 'ending-win' : 'ending-lose')}
                  prizes={prizes}
                  onUpdatePrize={(updatedPrize) => setPrizes(prev => prev.map(p => p.id === updatedPrize.id ? updatedPrize : p))}
                />
              </div>
            </div>
            
            <ScratchSettingsPanel 
              config={config}
              activeView={activeView}
              onUpdateConfig={updateConfig}
              onViewModeChange={setViewMode}
            />
          </>
        )}
      </div>
      )}
      <FloatingToolbar />
      {campaignId && (
        <PublishModal
          isOpen={publishModalOpen}
          onClose={() => setPublishModalOpen(false)}
          campaignId={campaignId}
          campaignTitle={config.welcomeScreen.title || 'Scratch sans titre'}
        />
      )}
    </div>
  );
};
