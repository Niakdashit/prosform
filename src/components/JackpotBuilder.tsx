import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { JackpotSidebar } from "./JackpotSidebar";
import { JackpotPreview } from "./JackpotPreview";
import { JackpotSettingsPanel } from "./JackpotSettingsPanel";
import { JackpotTopToolbar } from "./JackpotTopToolbar";
import { CampaignSettings } from "./CampaignSettings";
import { FloatingToolbar } from "./FloatingToolbar";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { JackpotSymbolPickerModal } from "./JackpotSymbolPickerModal";

export interface JackpotPrize {
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
  assignedSymbols?: string[];
  priority?: number;
  // Champs spécifiques Scratch (pour compatibilité avec Prize)
  scratchWinText?: string;
  scratchLoseText?: string;
  scratchWinImage?: string;
  scratchLoseImage?: string;
  status: 'active' | 'depleted' | 'scheduled';
}

export interface JackpotSymbol {
  id: string;
  emoji: string;
  label: string;
  prizeId?: string;
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

export interface JackpotConfig {
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
    showImage?: boolean;
    splitAlignment?: 'left' | 'center' | 'right';
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
  };
  jackpotScreen: {
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
    template: string;
    spinDuration: number;
  };
  symbols: JackpotSymbol[];
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
  };
}

const defaultJackpotConfig: JackpotConfig = {
  welcomeScreen: {
    title: "Tentez votre chance !",
    subtitle: "Faites tourner le jackpot et gagnez des prix incroyables",
    buttonText: "Jouer au jackpot",
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
  jackpotScreen: {
    title: "Tournez le jackpot !",
    subtitle: "Alignez 3 symboles identiques pour gagner",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered",
    template: "jackpot-11",
    spinDuration: 2000
  },
  symbols: [
    { id: '1', emoji: '🍒', label: 'Cerise' },
    { id: '2', emoji: '🍋', label: 'Citron' },
    { id: '3', emoji: '🍊', label: 'Orange' },
    { id: '4', emoji: '🍇', label: 'Raisin' },
    { id: '5', emoji: '⭐', label: 'Étoile' },
    { id: '6', emoji: '💎', label: 'Diamant' },
    { id: '7', emoji: '🔔', label: 'Cloche' },
    { id: '8', emoji: '7️⃣', label: 'Sept' }
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

export const JackpotBuilder = () => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [config, setConfig] = useState<JackpotConfig>(defaultJackpotConfig);
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'campaign' | 'templates'>('design');
  const [campaignDefaultTab, setCampaignDefaultTab] = useState<string>('canaux');
  const [prizes, setPrizes] = useState<JackpotPrize[]>([]);

  useEffect(() => {
    if (isMobile) {
      setViewMode('mobile');
    }
  }, [isMobile]);

  const updateConfig = (updates: Partial<JackpotConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateSymbol = (id: string, updates: Partial<JackpotSymbol>) => {
    setConfig(prev => ({
      ...prev,
      symbols: prev.symbols.map(s => 
        s.id === id ? { ...s, ...updates } : s
      )
    }));
  };

  const addSymbol = () => {
    setIsSymbolPickerOpen(true);
  };

  const deleteSymbol = (id: string) => {
    if (config.symbols.length <= 3) {
      toast.error("Le jackpot doit avoir au moins 3 symboles");
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      symbols: prev.symbols.filter(s => s.id !== id)
    }));
    toast.success("Symbole supprimé");
  };

  const handleSavePrize = (prize: JackpotPrize) => {
    const existingPrize = prizes.find(p => p.id === prize.id);

    if (existingPrize) {
      const used = Math.max(0, existingPrize.quantity - existingPrize.remaining);
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
          status: 'active' as const,
        },
      ]);
    }

    toast.success("Lot enregistré");
  };

  const handleDeletePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
    toast.success("Lot supprimé");
  };

  const [isSymbolPickerOpen, setIsSymbolPickerOpen] = useState(false);

  const addSymbolFromEmoji = (value: string) => {
    const newSymbol: JackpotSymbol = {
      id: `symbol-${Date.now()}`,
      emoji: value,
      label: 'Nouveau symbole'
    };
    setConfig(prev => ({
      ...prev,
      symbols: [...prev.symbols, newSymbol]
    }));
    toast.success("Symbole ajouté");
  };

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <JackpotTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          try {
            localStorage.setItem('jackpot-config', JSON.stringify(config));
            localStorage.setItem('jackpot-viewMode', targetViewMode);
            localStorage.setItem('jackpot-theme', JSON.stringify(theme));
            window.open('/jackpot-preview', '_blank');
          } catch (e) {
            console.warn('localStorage full, trying without images:', e);
            const configWithoutImages = {
              ...config,
              welcomeScreen: { ...config.welcomeScreen, image: undefined, imageSettings: undefined }
            };
            try {
              localStorage.setItem('jackpot-config', JSON.stringify(configWithoutImages));
              localStorage.setItem('jackpot-viewMode', targetViewMode);
              localStorage.setItem('jackpot-theme', JSON.stringify(theme));
              window.open('/jackpot-preview', '_blank');
              toast.warning('Preview opened without images (images too large)');
            } catch (e2) {
              toast.error('Unable to open preview - data too large');
            }
          }
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
        
      {activeTab === 'campaign' ? (
        <CampaignSettings 
          defaultTab={campaignDefaultTab}
          prizes={prizes as any}
          onSavePrize={handleSavePrize as any}
          onDeletePrize={handleDeletePrize}
          gameType="jackpot"
          segments={config.symbols.map(s => ({ id: s.id, label: s.emoji }))}
          symbols={config.symbols}
          onAddSymbol={(emoji: string) => {
            const newSymbol: JackpotSymbol = {
              id: `symbol-${Date.now()}`,
              emoji: emoji,
              label: 'Symbole'
            };
            setConfig(prev => ({
              ...prev,
              symbols: [...prev.symbols, newSymbol]
            }));
          }}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
        {isMobile ? (
          <>
            <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <JackpotSidebar
                  config={config}
                  activeView={activeView}
                  onViewSelect={(view) => {
                    setActiveView(view);
                    setLeftDrawerOpen(false);
                  }}
                  onUpdateSymbol={updateSymbol}
                  onAddSymbol={() => setIsSymbolPickerOpen(true)}
                  onDeleteSymbol={deleteSymbol}
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
                <JackpotSettingsPanel 
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

            <JackpotPreview
              config={config}
              activeView={activeView}
              onUpdateConfig={updateConfig}
              viewMode="mobile"
              onToggleViewMode={() => {}}
              isMobileResponsive={true}
              onNext={() => {
                const views: Array<'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose'> = ['welcome', 'contact', 'jackpot', 'ending-win', 'ending-lose'];
                const currentIndex = views.indexOf(activeView);
                if (currentIndex < views.length - 1) {
                  setActiveView(views[currentIndex + 1]);
                }
              }}
              onGoToEnding={(isWin) => setActiveView(isWin ? 'ending-win' : 'ending-lose')}
              prizes={prizes}
              onUpdatePrize={handleSavePrize}
            />
          </>
        ) : (
          <>
            <JackpotSidebar
              config={config}
              activeView={activeView}
              onViewSelect={setActiveView}
              onUpdateSymbol={updateSymbol}
              onAddSymbol={() => setIsSymbolPickerOpen(true)}
              onDeleteSymbol={deleteSymbol}
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
              
              {/* JackpotPreview */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <JackpotPreview
                  config={config}
                  activeView={activeView}
                  onUpdateConfig={updateConfig}
                  viewMode={viewMode}
                  onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
                  isMobileResponsive={false}
                  onNext={() => {
                    const views: Array<'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose'> = ['welcome', 'contact', 'jackpot', 'ending-win', 'ending-lose'];
                    const currentIndex = views.indexOf(activeView);
                    if (currentIndex < views.length - 1) {
                      setActiveView(views[currentIndex + 1]);
                    }
                  }}
                  onGoToEnding={(isWin) => setActiveView(isWin ? 'ending-win' : 'ending-lose')}
                  prizes={prizes}
                  onUpdatePrize={handleSavePrize}
                />
              </div>
            </div>
            
            <JackpotSettingsPanel 
              config={config}
              activeView={activeView}
              onUpdateConfig={updateConfig}
              onViewModeChange={setViewMode}
            />
          </>
        )}
        <JackpotSymbolPickerModal
          open={isSymbolPickerOpen}
          onOpenChange={setIsSymbolPickerOpen}
          onSelectSymbol={addSymbolFromEmoji}
        />
      </div>
      )}
      <FloatingToolbar />
    </div>
  );
};
