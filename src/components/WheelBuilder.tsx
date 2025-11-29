import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { WheelSidebar } from "./WheelSidebar";
import { WheelPreview } from "./WheelPreview";
import { WheelSettingsPanel } from "./WheelSettingsPanel";
import { WheelTopToolbar } from "./WheelTopToolbar";
import { SegmentsModal } from "./SegmentsModal";
import { CampaignSettings } from "./CampaignSettings";
import { FloatingToolbar } from "./FloatingToolbar";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { useCampaign } from "@/hooks/useCampaign";

export interface Prize {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  remaining: number;
  value?: string;
  attributionMethod: 'probability' | 'calendar';
  // Champs pour méthode probabilité
  winProbability?: number; // Probabilité de gain en pourcentage (0-100)
  // Champs pour méthode calendrier
  calendarDate?: string;
  calendarTime?: string;
  timeWindow?: number;
  assignedSegments?: string[];
  priority?: number;
  maxWinsPerIP?: number;
  maxWinsPerEmail?: number;
  maxWinsPerDevice?: number;
  verificationPeriod?: number;
  notifyAdminOnWin?: boolean;
  notifyAdminOnDepletion?: boolean;
  // Champs spécifiques Scratch (contenu révélé sous la carte)
  scratchWinText?: string;
  scratchLoseText?: string;
  scratchWinImage?: string;
  scratchLoseImage?: string;
  status: 'active' | 'depleted' | 'scheduled';
}

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  probability?: number;
  icon?: string;
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

export interface WheelConfig {
  welcomeScreen: {
    title: string;
    titleHtml?: string;
    titleStyle?: TextStyle;
    titleWidth?: number; // percentage 20-100
    subtitle: string;
    subtitleHtml?: string;
    subtitleStyle?: TextStyle;
    subtitleWidth?: number; // percentage 20-100
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
  wheelScreen: {
    title: string;
    titleHtml?: string;
    titleStyle?: TextStyle;
    titleWidth?: number;
    subtitle: string;
    subtitleHtml?: string;
    subtitleStyle?: TextStyle;
    subtitleWidth?: number;
    blockSpacing: number;
    wheelSize?: number;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
  };
  segments: WheelSegment[];
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

const defaultWheelConfig: WheelConfig = {
  welcomeScreen: {
    title: "Tentez votre chance !",
    subtitle: "Tournez la roue et gagnez des prix incroyables",
    buttonText: "Tourner la roue",
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
  wheelScreen: {
    title: "Tournez la roue !",
    subtitle: "Tentez votre chance et découvrez votre lot",
    blockSpacing: 1,
    wheelSize: 100,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  },
  segments: [
    { id: '1', label: 'Segment 1', color: '#FF6B6B', probability: 16.67 },
    { id: '2', label: 'Segment 2', color: '#4ECDC4', probability: 16.67 },
    { id: '3', label: 'Segment 3', color: '#45B7D1', probability: 16.67 },
    { id: '4', label: 'Segment 4', color: '#FFA07A', probability: 16.67 },
    { id: '5', label: 'Segment 5', color: '#98D8C8', probability: 16.67 },
    { id: '6', label: 'Segment 6', color: '#F7DC6F', probability: 16.65 }
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

export const WheelBuilder = () => {
  const isMobile = useIsMobile();
  const themeContext = useTheme();
  const { theme } = themeContext;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const campaignId = searchParams.get('id');

  // Hook de persistance Supabase (avec theme)
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
    { campaignId, type: 'wheel', defaultName: 'Nouvelle campagne roue' },
    defaultWheelConfig,
    themeContext // Pass theme context for save/restore
  );

  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [segmentsModalOpen, setSegmentsModalOpen] = useState(false);
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
      navigate(`/wheel?id=${saved.id}`, { replace: true });
    }
  };

  // Publier et mettre à jour l'URL
  const handlePublish = async () => {
    const published = await publish();
    if (published && !campaignId) {
      navigate(`/wheel?id=${published.id}`, { replace: true });
    }
  };

  const updateConfig = (updates: Partial<WheelConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateSegment = (id: string, updates: Partial<WheelSegment>) => {
    setConfig(prev => ({
      ...prev,
      segments: prev.segments.map(s => 
        s.id === id ? { ...s, ...updates } : s
      )
    }));
  };

  const addSegment = () => {
    const newSegment: WheelSegment = {
      id: `segment-${Date.now()}`,
      label: 'Nouveau lot',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      probability: 10
    };
    setConfig(prev => ({
      ...prev,
      segments: [...prev.segments, newSegment]
    }));
    toast.success("Segment ajouté");
  };

  const duplicateSegment = (id: string) => {
    setConfig(prev => {
      const segmentIndex = prev.segments.findIndex(s => s.id === id);
      if (segmentIndex === -1) return prev;
      
      const segmentToDuplicate = prev.segments[segmentIndex];
      const newSegment = {
        ...segmentToDuplicate,
        id: `segment-${Date.now()}`,
        label: `${segmentToDuplicate.label} (copie)`,
      };
      
      const newSegments = [...prev.segments];
      newSegments.splice(segmentIndex + 1, 0, newSegment);
      
      return { ...prev, segments: newSegments };
    });
    toast.success("Segment dupliqué");
  };

  const reorderSegments = (startIndex: number, endIndex: number) => {
    setConfig(prev => {
      const newSegments = Array.from(prev.segments);
      const [removed] = newSegments.splice(startIndex, 1);
      newSegments.splice(endIndex, 0, removed);
      return { ...prev, segments: newSegments };
    });
  };

  const deleteSegment = (id: string) => {
    if (config.segments.length <= 2) {
      toast.error("La roue doit avoir au moins 2 segments");
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      segments: prev.segments.filter(s => s.id !== id)
    }));
    toast.success("Segment supprimé");
  };

  const handleAddPrize = () => {
    // Cette fonction sera appelée depuis CampaignSettings
  };

  const handleSavePrize = (prize: Prize) => {
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

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <WheelTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          // Clear old preview data first to free up space
          try {
            localStorage.removeItem('wheel-config');
            localStorage.removeItem('wheel-viewMode');
            localStorage.removeItem('wheel-theme');
          } catch (e) {
            // Ignore cleanup errors
          }
          
          try {
            localStorage.setItem('wheel-config', JSON.stringify(config));
            localStorage.setItem('wheel-viewMode', targetViewMode);
            localStorage.setItem('wheel-theme', JSON.stringify(theme));
            window.open('/wheel-preview', '_blank');
          } catch (e) {
            console.warn('localStorage full, trying without images:', e);
            // Remove all background images to reduce size
            const configWithoutImages = {
              ...config,
              welcomeScreen: { 
                ...config.welcomeScreen, 
                image: undefined, 
                imageSettings: undefined,
                backgroundImage: undefined,
                backgroundImageMobile: undefined,
                wallpaperImage: undefined
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
              localStorage.setItem('wheel-config', JSON.stringify(configWithoutImages));
              localStorage.setItem('wheel-viewMode', targetViewMode);
              localStorage.setItem('wheel-theme', JSON.stringify(theme));
              window.open('/wheel-preview', '_blank');
              toast.warning('Preview ouverte sans images (images trop volumineuses)');
            } catch (e2) {
              toast.error('Impossible d\'ouvrir la preview - données trop volumineuses');
            }
          }
        }}
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={isSaving}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
        
      {activeTab === 'campaign' ? (
        <CampaignSettings 
          defaultTab={campaignDefaultTab}
          prizes={prizes}
          onSavePrize={handleSavePrize}
          onDeletePrize={handleDeletePrize}
          gameType="wheel"
          segments={config.segments.map(s => ({ id: s.id, label: s.label }))}
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
          campaignUrl={campaign?.id ? `${window.location.origin}/wheel-preview?id=${campaign.id}` : ''}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
        {isMobile ? (
          <>
            <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <WheelSidebar
                  config={config}
                  activeView={activeView}
                  onViewSelect={(view) => {
                    setActiveView(view);
                    setLeftDrawerOpen(false);
                  }}
                  onOpenSegmentsModal={() => {
                    setSegmentsModalOpen(true);
                    setLeftDrawerOpen(false);
                  }}
                  onDuplicateSegment={duplicateSegment}
                  onReorderSegments={reorderSegments}
                  onDeleteSegment={deleteSegment}
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
                <WheelSettingsPanel 
                  config={config}
                  activeView={activeView}
                  onUpdateConfig={updateConfig}
                  onUpdateSegment={updateSegment}
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

            <WheelPreview
              config={config}
              activeView={activeView}
              onUpdateConfig={updateConfig}
              viewMode="mobile"
              onToggleViewMode={() => {}}
              isMobileResponsive={true}
              onNext={() => {
                const views: Array<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'> = ['welcome', 'contact', 'wheel', 'ending-win', 'ending-lose'];
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
            <WheelSidebar
              config={config}
              activeView={activeView}
              onViewSelect={setActiveView}
              onOpenSegmentsModal={() => setSegmentsModalOpen(true)}
              onDuplicateSegment={duplicateSegment}
              onReorderSegments={reorderSegments}
              onDeleteSegment={deleteSegment}
              onGoToDotation={() => {
                setActiveTab('campaign');
                setCampaignDefaultTab('dotation');
              }}
              prizes={prizes}
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
              
              {/* WheelPreview - Scaled screenshot */}
              <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
                <div 
                  className="relative"
                  style={{
                    width: viewMode === 'desktop' ? 'min(100%, calc((100vh - 180px) * 16 / 9))' : 'min(100%, calc((100vh - 180px) * 9 / 16))',
                    height: viewMode === 'desktop' ? 'min(100%, calc((100vw - 400px) * 9 / 16))' : 'min(100%, calc((100vw - 400px) * 16 / 9))',
                    maxWidth: viewMode === 'desktop' ? '100%' : '375px',
                    maxHeight: 'calc(100vh - 180px)',
                    aspectRatio: viewMode === 'desktop' ? '16/9' : '9/16',
                  }}
                >
                  <div className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl">
                    <WheelPreview
                      config={config}
                      activeView={activeView}
                      onUpdateConfig={updateConfig}
                      viewMode={viewMode}
                      onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
                      isMobileResponsive={false}
                      onNext={() => {
                        const views: Array<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'> = ['welcome', 'contact', 'wheel', 'ending-win', 'ending-lose'];
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
              </div>
            </div>
            
            <WheelSettingsPanel 
              config={config}
              activeView={activeView}
              onUpdateConfig={updateConfig}
              onUpdateSegment={updateSegment}
              onViewModeChange={setViewMode}
            />
          </>
        )}
      </div>
      )}

      <SegmentsModal
        open={segmentsModalOpen}
        onOpenChange={setSegmentsModalOpen}
        segments={config.segments}
        onUpdateSegment={updateSegment}
        onAddSegment={addSegment}
        onDeleteSegment={deleteSegment}
        prizes={prizes}
      />
      <FloatingToolbar />
    </div>
  );
};
