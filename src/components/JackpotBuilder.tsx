import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Monitor, Smartphone, Loader2 } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { JackpotSidebar } from "./JackpotSidebar";
import { JackpotPreview } from "./JackpotPreview";
import { JackpotSettingsPanel } from "./JackpotSettingsPanel";
import { JackpotTopToolbar } from "./JackpotTopToolbar";
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
import { JackpotSymbolPickerModal } from "./JackpotSymbolPickerModal";
import { useCampaign } from "@/hooks/useCampaign";
import { 
  HeaderConfig, 
  FooterConfig, 
  defaultHeaderConfig, 
  defaultFooterConfig,
} from "./campaign";
import { TemplateLibraryPanel } from "./templates/TemplateLibraryPanel";

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
  id: string; // Identifiant unique du champ (ex: 'civilite', 'prenom', 'nom')
  type: 'text' | 'email' | 'phone' | 'tel' | 'select' | 'textarea' | 'checkbox' | 'date'; // Type de champ
  required: boolean;
  label: string;
  placeholder?: string; // Placeholder pour les champs de texte
  options?: string[]; // Pour les champs select
  helpText?: string; // Texte d'aide pour les checkboxes (opt-ins)
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

export interface ExtraTextBlock {
  id: string;
  content: string;
  contentHtml?: string;
  style?: TextStyle;
  width?: number;
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
    overlayEnabled?: boolean;
    overlayColor?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
    applyBackgroundToAll?: boolean;
    showImage?: boolean;
    splitAlignment?: 'left' | 'center' | 'right';
    alignment?: 'left' | 'center' | 'right';
    image?: string;
    imageSettings?: {
      size: number;
      borderRadius: number;
      borderWidth: number;
      borderColor: string;
      rotation: number;
      flipH: boolean;
      flipV: boolean;
    };
    extraTextBlocks?: ExtraTextBlock[];
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
    overlayEnabled?: boolean;
    overlayColor?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
    image?: string;
    imageMobile?: string;
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
    overlayEnabled?: boolean;
    overlayColor?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
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
    overlayEnabled?: boolean;
    overlayColor?: string;
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
    overlayEnabled?: boolean;
    overlayColor?: string;
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

const defaultJackpotConfig: JackpotConfig = {
  welcomeScreen: {
    title: "Tentez votre chance !",
    subtitle: "Faites tourner le jackpot et gagnez des prix incroyables",
    buttonText: "Jouer au jackpot",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-right-left",
    showImage: true,
    imageSettings: {
      size: 150,
      borderRadius: 5,
      borderWidth: 0,
      borderColor: '#F5B800',
      rotation: 0,
      flipH: false,
      flipV: false
    }
  },
  contactForm: {
    enabled: true,
    title: "Vos coordonnées",
    subtitle: "Pour vous envoyer votre gain",
    blockSpacing: 1,
    fields: [
      { id: 'name', type: 'text', required: true, label: 'Nom complet' },
      { id: 'email', type: 'email', required: true, label: 'Email' },
      { id: 'phone', type: 'phone', required: false, label: 'Téléphone' }
    ],
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-right-left"
  },
  jackpotScreen: {
    title: "Tournez le jackpot !",
    subtitle: "Alignez 3 symboles identiques pour gagner",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-right-left",
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
    desktopLayout: "desktop-right-left"
  },
  endingLose: {
    title: "Dommage !",
    subtitle: "Vous n'avez pas gagné cette fois-ci",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-right-left"
  },
  layout: {
    header: { ...defaultHeaderConfig, enabled: false },
    footer: { ...defaultFooterConfig, enabled: false },
  }
};

export const JackpotBuilder = () => {
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
    { campaignId, type: 'jackpot', defaultName: 'Nouvelle campagne jackpot' },
    defaultJackpotConfig,
    themeContext
  );

  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose'>('welcome');
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
      navigate(`/jackpot?id=${saved.id}`, { replace: true });
    }
  };

  // Publier et mettre à jour l'URL
  const handlePublish = async () => {
    const published = await publish();
    if (published && !campaignId) {
      navigate(`/jackpot?id=${published.id}`, { replace: true });
    }
  };

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
      <JackpotTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';

          // Si la campagne est déjà sauvegardée, on passe par l'ID (aucune limite de taille)
          if (campaignId && campaign?.id) {
            try {
              localStorage.setItem('jackpot-viewMode', targetViewMode);
              localStorage.setItem('jackpot-theme', JSON.stringify(theme));
            } catch (e) {
              console.warn('Unable to store preview settings in localStorage:', e);
            }
            window.open(`/jackpot-preview?id=${campaign.id}`, '_blank');
            return;
          }

          // Sinon, fallback localStorage comme avant (campagne non encore sauvegardée)
          // Clear old data first to make room
          localStorage.removeItem('jackpot-config');
          localStorage.removeItem('jackpot-viewMode');
          localStorage.removeItem('jackpot-theme');
          try {
            localStorage.setItem('jackpot-config', JSON.stringify(config));
            localStorage.setItem('jackpot-viewMode', targetViewMode);
            localStorage.setItem('jackpot-theme', JSON.stringify(theme));
            window.open('/jackpot-preview', '_blank');
          } catch (e) {
            console.warn('localStorage full, trying without images:', e);
            const configWithoutImages = {
              ...config,
              welcomeScreen: { 
                ...config.welcomeScreen,
                backgroundImage: undefined,
                backgroundImageMobile: undefined,
                wallpaperImage: undefined,
              },
              contactForm: {
                ...config.contactForm,
                backgroundImage: undefined,
                backgroundImageMobile: undefined
              },
              jackpotScreen: {
                ...config.jackpotScreen,
                backgroundImage: undefined,
                backgroundImageMobile: undefined
              },
              endingWin: {
                ...config.endingWin,
                backgroundImage: undefined,
                backgroundImageMobile: undefined
              },
              endingLose: {
                ...config.endingLose,
                backgroundImage: undefined,
                backgroundImageMobile: undefined
              }
            };
            try {
              localStorage.setItem('jackpot-config', JSON.stringify(configWithoutImages));
              localStorage.setItem('jackpot-viewMode', targetViewMode);
              localStorage.setItem('jackpot-theme', JSON.stringify(theme));
              window.open('/jackpot-preview', '_blank');
            } catch (e2) {
              console.warn('Unable to persist jackpot preview data, opening preview without local config:', e2);
              window.open('/jackpot-preview', '_blank');
            }
          }
        }}
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
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
          campaignUrl={campaign?.id ? `${window.location.origin}/jackpot-preview?id=${campaign.id}` : ''}
          editorType="jackpot"
          editorMode="fullscreen"
          campaignId={campaign?.id || ''}
          publicSlug={campaign?.public_url_slug || ''}
          publishedUrl={campaign?.published_url || ''}
        />
      ) : activeTab === 'templates' ? (
        <TemplateLibraryPanel 
          onSelectTemplate={(templateConfig, templateMeta) => {
            // Appliquer la config du template
            setConfig(prev => ({
              ...prev,
              ...templateConfig,
              welcomeScreen: {
                ...prev.welcomeScreen,
                ...templateConfig.welcomeScreen,
                backgroundImage: templateMeta.backgroundImage || templateConfig.welcomeScreen?.backgroundImage,
              },
              contactForm: {
                ...prev.contactForm,
                ...templateConfig.contactForm,
              },
              jackpotScreen: {
                ...prev.jackpotScreen,
                ...templateConfig.jackpotScreen,
              },
              endingWin: {
                ...prev.endingWin,
                ...templateConfig.endingWin,
              },
              endingLose: {
                ...prev.endingLose,
                ...templateConfig.endingLose,
              },
              symbols: templateConfig.symbols || prev.symbols,
            }));
            
            // Appliquer le thème (couleurs + typo) via le contexte
            themeContext.updateTheme({
              primaryColor: templateMeta.colorPalette.secondary,
              buttonColor: templateMeta.colorPalette.secondary,
              buttonTextColor: templateMeta.colorPalette.primary,
              backgroundColor: templateMeta.colorPalette.primary,
              textColor: templateMeta.colorPalette.tertiary,
              fontFamily: templateMeta.typography.body.toLowerCase().replace(/\s+/g, '-'),
              headingFontFamily: templateMeta.typography.heading.toLowerCase().replace(/\s+/g, '-'),
            });
            
            toast.success("Template appliqué avec succès !");
            setActiveTab('design');
          }}
          currentConfig={config}
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
                  onUpdateConfig={updateConfig}
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
              
              <ChatToCreate 
                context={`Type: Jackpot/Machine à sous. Vue active: ${activeView}. Titre: ${config.welcomeScreen.title}. Symboles: ${config.symbols.map(s => s.label).join(', ')}`}
                onApplyActions={createAIActionHandler(config, updateConfig, {
                  welcome: 'welcomeScreen',
                  contact: 'contactForm',
                  jackpot: 'jackpotScreen',
                  'ending-win': 'endingWin',
                  'ending-lose': 'endingLose'
                }, {
                  onUpdateSymbols: (symbols) => {
                    updateConfig({ symbols: symbols.map((s, i) => ({
                      ...config.symbols[i] || {},
                      id: s.id || `sym_${i}`,
                      label: s.label,
                      image: s.image || config.symbols[i]?.image || '/gamification/neo/cherry.svg',
                      value: s.value ?? 10,
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
                    // Pas de couleurs spécifiques pour jackpot mais on pourrait changer le template
                    console.log(`Template ${template} appliqué`);
                  }
                })}
              />
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
