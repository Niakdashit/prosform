import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Monitor, Smartphone, Loader2 } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ScratchSidebar } from "./ScratchSidebar";
import { ScratchPreview } from "./ScratchPreview";
import { ScratchSettingsPanel } from "./ScratchSettingsPanel";
import { ScratchTopToolbar } from "./ScratchTopToolbar";
import { CampaignSettings } from "./CampaignSettings";
import { FloatingToolbar } from "./FloatingToolbar";
import { ChatToCreate } from "./ChatToCreate";
import { createAIActionHandler } from "@/utils/aiActionHandler";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { useCampaign } from "@/hooks/useCampaign";
import { 
  HeaderConfig, 
  FooterConfig, 
  defaultHeaderConfig, 
  defaultFooterConfig,
} from "./campaign";

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
  // Layout global
  layout?: {
    header: HeaderConfig;
    footer: FooterConfig;
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
  },
  layout: {
    header: { ...defaultHeaderConfig, enabled: false },
    footer: { ...defaultFooterConfig, enabled: false },
  }
};

export const ScratchBuilder = () => {
  const isMobile = useIsMobile();
  const themeContext = useTheme();
  const { theme } = themeContext;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const campaignId = searchParams.get('id');

  // Hook de persistance Supabase
  const {
    campaign,
    config,
    prizes,
    name: campaignName,
    startDate,
    startTime,
    endDate,
    endTime,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    setConfig,
    setPrizes,
    save,
    publish,
    setName,
    setStartDate,
    setStartTime,
    setEndDate,
    setEndTime,
  } = useCampaign(
    { campaignId, type: 'scratch', defaultName: 'Nouvelle campagne scratch' },
    defaultScratchConfig,
    themeContext
  );

  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'campaign' | 'templates'>('design');
  const [campaignDefaultTab, setCampaignDefaultTab] = useState<string>('canaux');

  useEffect(() => {
    if (isMobile) {
      setViewMode('mobile');
    }
  }, [isMobile]);

  // Sauvegarder et mettre à jour l'URL avec l'ID
  const handleSave = async () => {
    const saved = await save();
    if (saved && !campaignId) {
      navigate(`/scratch?id=${saved.id}`, { replace: true });
    }
  };

  // Publier et mettre à jour l'URL
  const handlePublish = async () => {
    const published = await publish();
    if (published && !campaignId) {
      navigate(`/scratch?id=${published.id}`, { replace: true });
    }
  };

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

  // Afficher un spinner plein page pendant le chargement d'une campagne existante
  if (isLoading && campaignId) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-screen"
        style={{ 
          fontFamily: "'DM Sans', sans-serif",
          backgroundColor: '#f3f4f6',
        }}
      >
        <Loader2 
          className="w-10 h-10 animate-spin mb-4" 
          style={{ color: '#f5ca3c' }} 
        />
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Chargement de la campagne...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <ScratchTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          try {
            localStorage.setItem('scratch-config', JSON.stringify(config));
            localStorage.setItem('scratch-viewMode', targetViewMode);
            localStorage.setItem('scratch-theme', JSON.stringify(theme));
            window.open('/scratch-preview', '_blank');
          } catch (e) {
            console.warn('localStorage full, trying without images:', e);
            const configWithoutImages = {
              ...config,
              welcomeScreen: { ...config.welcomeScreen, image: undefined, imageSettings: undefined }
            };
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
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        campaignId={campaign?.id}
      />
        
      {activeTab === 'campaign' ? (
        <CampaignSettings 
          defaultTab={campaignDefaultTab}
          prizes={prizes as any}
          onSavePrize={handleSavePrize as any}
          onDeletePrize={handleDeletePrize}
          gameType="scratch"
          segments={[]}
          campaignName={campaignName}
          onCampaignNameChange={setName}
          startDate={startDate}
          onStartDateChange={setStartDate}
          startTime={startTime}
          onStartTimeChange={setStartTime}
          endDate={endDate}
          onEndDateChange={setEndDate}
          endTime={endTime}
          onEndTimeChange={setEndTime}
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
                  onUpdateConfig={updateConfig}
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
              onUpdateConfig={updateConfig}
            />
            
            {/* Preview area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 relative">
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
              
              <ChatToCreate 
                context={`Type: Scratch Card. Vue active: ${activeView}. Titre: ${config.welcomeScreen.title}. Cartes: ${config.cards.map(c => c.label).join(', ')}`}
                onApplyActions={createAIActionHandler(config, updateConfig, {
                  welcome: 'welcomeScreen',
                  contact: 'contactForm',
                  scratch: 'scratchScreen',
                  'ending-win': 'endingWin',
                  'ending-lose': 'endingLose'
                }, {
                  onUpdateCards: (cards) => {
                    updateConfig({ cards: cards.map((c, i) => ({
                      ...config.cards[i] || {},
                      id: c.id || `card_${i}`,
                      label: c.label,
                      isWinning: c.isWinning ?? true,
                      probability: c.probability ?? 10,
                    })) });
                  },
                  onUpdatePrizes: (newPrizes) => {
                    setPrizes(newPrizes.map((p, i) => ({
                      id: p.id || `prize_${i}`,
                      name: p.name,
                      description: p.description || '',
                      code: p.code || '',
                      probability: 10,
                      quantity: p.quantity ?? 100,
                      image: p.image || '',
                      isActive: true,
                    })));
                  },
                  onApplyTemplate: (template, colors) => {
                    if (colors) {
                      updateConfig({ scratchScreen: { ...config.scratchScreen, scratchColor: colors.primary } });
                    }
                  }
                })}
              />
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
    </div>
  );
};
