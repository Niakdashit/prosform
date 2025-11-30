import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { WheelSidebar } from "./WheelSidebar";
import { ArticleWheelPreview } from "./ArticleWheelPreview";
import { WheelSettingsPanel } from "./WheelSettingsPanel";
import { ArticleWheelSettingsPanel } from "./ArticleWheelSettingsPanel";
import { WheelTopToolbar } from "./WheelTopToolbar";
import { SegmentsModal } from "./SegmentsModal";
import { CampaignSettings } from "./CampaignSettings";
import { FloatingToolbar } from "./FloatingToolbar";
import { ChatToCreate } from "./ChatToCreate";
import { createAIActionHandler } from "@/utils/aiActionHandler";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { useCampaign } from "@/hooks/useCampaign";
import { Prize, WheelSegment, WheelConfig } from "./WheelBuilder";

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
    title: "Merci de compléter ce formulaire afin de valider votre participation :",
    subtitle: "",
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

// Article-specific config
export interface ArticleConfig {
  banner?: {
    imageUrl?: string;
    aspectRatio?: string;
  };
  frameWidth: number;
  frameHeight?: number;
  frameColor: string;
  frameBorderRadius: number;
  frameBorderWidth: number;
  frameBorderColor: string;
  ctaBackgroundColor: string;
  ctaTextColor: string;
  ctaBorderRadius: number;
  // Page appearance
  pageBackgroundColor?: string;
  pageBackgroundImage?: string;
  // Header & Footer
  headerImage?: string;
  headerFitMode?: 'fill' | 'fit';
  footerImage?: string;
  footerFitMode?: 'fill' | 'fit';
}

const defaultArticleConfig: ArticleConfig = {
  frameWidth: 810,
  frameHeight: undefined, // Auto height based on content
  frameColor: '#ffffff',
  frameBorderRadius: 0,
  frameBorderWidth: 0,
  frameBorderColor: '#e5e7eb',
  ctaBackgroundColor: '#000000',
  ctaTextColor: '#ffffff',
  ctaBorderRadius: 9999,
  pageBackgroundColor: '#f3f4f6',
};

export const ArticleWheelBuilder = () => {
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
    { campaignId, type: 'wheel', mode: 'article', defaultName: 'Nouvelle campagne roue (article)' },
    { ...defaultWheelConfig, articleConfig: defaultArticleConfig },
    themeContext
  );

  // Article config is stored inside config.articleConfig
  const articleConfig: ArticleConfig = (config as any).articleConfig || defaultArticleConfig;

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
      navigate(`/article-wheel?id=${saved.id}`, { replace: true });
    }
  };

  // Publier et mettre à jour l'URL
  const handlePublish = async () => {
    const published = await publish();
    if (published && !campaignId) {
      navigate(`/article-wheel?id=${published.id}`, { replace: true });
    }
  };

  // Save configs to localStorage for preview
  useEffect(() => {
    localStorage.setItem('article-wheel-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('article-wheel-article-config', JSON.stringify(articleConfig));
  }, [articleConfig]);

  // Save theme to localStorage for preview
  useEffect(() => {
    localStorage.setItem('article-wheel-theme', JSON.stringify(theme));
  }, [theme]);

  const updateConfig = (updates: Partial<WheelConfig>) => {
    setConfig((prev: any) => ({ ...prev, ...updates }));
  };

  const updateArticleConfig = (updates: Partial<ArticleConfig>) => {
    setConfig((prev: any) => ({ 
      ...prev, 
      articleConfig: { ...(prev.articleConfig || defaultArticleConfig), ...updates } 
    }));
  };

  const updateSegment = (id: string, updates: Partial<WheelSegment>) => {
    setConfig((prev: any) => ({
      ...prev,
      segments: prev.segments.map((s: WheelSegment) => 
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
    setConfig((prev: any) => ({
      ...prev,
      segments: [...prev.segments, newSegment]
    }));
    toast.success("Segment ajouté");
  };

  const duplicateSegment = (id: string) => {
    setConfig((prev: any) => {
      const segmentIndex = prev.segments.findIndex((s: WheelSegment) => s.id === id);
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
    setConfig((prev: any) => {
      const newSegments = Array.from(prev.segments);
      const [removed] = newSegments.splice(startIndex, 1);
      newSegments.splice(endIndex, 0, removed);
      return { ...prev, segments: newSegments };
    });
  };

  const deleteSegment = (id: string) => {
    if ((config as any).segments?.length <= 2) {
      toast.error("La roue doit avoir au moins 2 segments");
      return;
    }
    
    setConfig((prev: any) => ({
      ...prev,
      segments: prev.segments.filter((s: WheelSegment) => s.id !== id)
    }));
    toast.success("Segment supprimé");
  };

  const handleSavePrize = (prize: Prize) => {
    const existingPrize = (prizes as Prize[]).find(p => p.id === prize.id);

    if (existingPrize) {
      const used = Math.max(0, existingPrize.quantity - existingPrize.remaining);
      const newRemaining = Math.max(0, (prize.quantity ?? existingPrize.quantity) - used);

      setPrizes((prizes as Prize[]).map(p => 
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
        ...(prizes as Prize[]),
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
    setPrizes((prizes as Prize[]).filter(p => p.id !== id));
    toast.success("Lot supprimé");
  };

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <WheelTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          try {
            localStorage.setItem('article-wheel-config', JSON.stringify(config));
            localStorage.setItem('article-wheel-article-config', JSON.stringify(articleConfig));
            localStorage.setItem('article-wheel-viewMode', targetViewMode);
            localStorage.setItem('article-wheel-theme', JSON.stringify(theme));
            window.open('/article-wheel-preview', '_blank');
          } catch (e) {
            toast.error('Unable to open preview - data too large');
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
          prizes={prizes}
          onSavePrize={handleSavePrize}
          onDeletePrize={handleDeletePrize}
          gameType="wheel"
          segments={(config as any).segments?.map((s: any) => ({ id: s.id, label: s.label })) || []}
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
                  onUpdateConfig={updateConfig}
                  prizes={prizes}
                />
              </DrawerContent>
            </Drawer>

            <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <ArticleWheelSettingsPanel 
                  articleConfig={articleConfig}
                  onUpdateArticleConfig={updateArticleConfig}
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

            <ArticleWheelPreview
              config={config}
              articleConfig={articleConfig}
              activeView={activeView}
              onUpdateConfig={updateConfig}
              onUpdateArticleConfig={updateArticleConfig}
              viewMode="mobile"
              onViewChange={setActiveView}
              prizes={prizes}
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
              
              {/* ArticleWheelPreview */}
              <div className="flex-1 overflow-auto">
                <ArticleWheelPreview
                  config={config}
                  articleConfig={articleConfig}
                  activeView={activeView}
                  onUpdateConfig={updateConfig}
                  onUpdateArticleConfig={updateArticleConfig}
                  viewMode={viewMode}
                  onViewChange={setActiveView}
                  prizes={prizes}
                />
              </div>
              
              <ChatToCreate 
                context={`Type: Roue de la fortune (Article). Vue active: ${activeView}. Titre: ${(config as any).welcomeScreen?.title || ''}`}
                onApplyActions={createAIActionHandler(config, (updates) => setConfig({ ...config, ...updates }), {
                  welcome: 'welcomeScreen',
                  contact: 'contactForm',
                  wheel: 'wheelScreen',
                  'ending-win': 'endingWin',
                  'ending-lose': 'endingLose'
                })}
              />
            </div>
            
            {/* Right sidebar - View content settings + Article settings */}
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                {/* View-specific settings (Welcome, Contact, Wheel, Ending) */}
                <WheelSettingsPanel 
                  config={config}
                  activeView={activeView}
                  onUpdateConfig={updateConfig}
                  onUpdateSegment={updateSegment}
                  onViewModeChange={setViewMode}
                  hideSpacingAndBackground={true}
                  hideLayoutAndAlignment={true}
                />
                
                {/* Article-specific settings (Banner, Frame, Header, Footer) - Only on Welcome */}
                {activeView === 'welcome' && (
                  <div className="px-4 pb-4">
                    <ArticleWheelSettingsPanel 
                      articleConfig={articleConfig}
                      onUpdateArticleConfig={updateArticleConfig}
                    />
                  </div>
                )}
              </div>
            </div>
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
