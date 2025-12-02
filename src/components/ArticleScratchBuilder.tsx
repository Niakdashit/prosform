import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { ScratchSidebar } from "./ScratchSidebar";
import { ArticleScratchPreview } from "./ArticleScratchPreview";
import { ScratchSettingsPanel } from "./ScratchSettingsPanel";
import { ArticleScratchSettingsPanel } from "./ArticleScratchSettingsPanel";
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
import { useCampaign } from "@/hooks/useCampaign";
import { ScratchConfig, ScratchCard, ScratchPrize } from "./ScratchBuilder";

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
    title: "Merci de compléter ce formulaire afin de valider votre participation :",
    subtitle: "",
    blockSpacing: 1,
    fields: [
      { id: 'name', type: 'text', required: true, label: 'Nom complet' },
      { id: 'email', type: 'email', required: true, label: 'Email' },
      { id: 'phone', type: 'phone', required: false, label: 'Téléphone' }
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
    cardWidth: 300,
    cardHeight: 200,
    cardBorderRadius: 16,
    cardBorderWidth: 0,
    cardBorderColor: "#000000",
    threshold: 50,
    brushSize: 40
  },
  cards: [
    { id: '1', revealText: 'Gagné !', isWinning: true, probability: 50 },
    { id: '2', revealText: 'Perdu...', isWinning: false, probability: 50 }
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

export interface ArticleConfig {
  banner?: { imageUrl?: string; aspectRatio?: string; };
  frameWidth: number;
  frameHeight?: number;
  frameColor: string;
  frameBorderRadius: number;
  frameBorderWidth: number;
  frameBorderColor: string;
  ctaBackgroundColor: string;
  ctaTextColor: string;
  ctaBorderRadius: number;
  pageBackgroundColor?: string;
  pageBackgroundImage?: string;
  headerImage?: string;
  headerFitMode?: 'fill' | 'fit';
  footerImage?: string;
  footerFitMode?: 'fill' | 'fit';
}

const defaultArticleConfig: ArticleConfig = {
  frameWidth: 810,
  frameHeight: undefined,
  frameColor: '#ffffff',
  frameBorderRadius: 0,
  frameBorderWidth: 0,
  frameBorderColor: '#e5e7eb',
  ctaBackgroundColor: '#000000',
  ctaTextColor: '#ffffff',
  ctaBorderRadius: 9999,
  pageBackgroundColor: '#f3f4f6',
};

export const ArticleScratchBuilder = () => {
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
    { campaignId, type: 'scratch', mode: 'article', defaultName: 'Nouvelle campagne scratch (article)' },
    { ...defaultScratchConfig, articleConfig: defaultArticleConfig },
    themeContext
  );

  // Article config is stored inside config.articleConfig
  const articleConfig: ArticleConfig = (config as any).articleConfig || defaultArticleConfig;

  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'campaign' | 'templates'>('design');
  const [campaignDefaultTab, setCampaignDefaultTab] = useState<string>('canaux');

  useEffect(() => {
    if (isMobile) setViewMode('mobile');
  }, [isMobile]);

  // Sauvegarder et mettre à jour l'URL avec l'ID
  const handleSave = async () => {
    const saved = await save();
    if (saved && !campaignId) {
      navigate(`/article-scratch?id=${saved.id}`, { replace: true });
    }
  };

  // Publier et mettre à jour l'URL
  const handlePublish = async () => {
    const published = await publish();
    if (published && !campaignId) {
      navigate(`/article-scratch?id=${published.id}`, { replace: true });
    }
  };

  useEffect(() => {
    localStorage.setItem('article-scratch-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('article-scratch-article-config', JSON.stringify(articleConfig));
  }, [articleConfig]);

  useEffect(() => {
    localStorage.setItem('article-scratch-theme', JSON.stringify(theme));
  }, [theme]);

  const updateConfig = (updates: Partial<ScratchConfig>) => {
    setConfig((prev: any) => ({ ...prev, ...updates }));
  };

  const updateArticleConfig = (updates: Partial<ArticleConfig>) => {
    setConfig((prev: any) => ({ 
      ...prev, 
      articleConfig: { ...(prev.articleConfig || defaultArticleConfig), ...updates } 
    }));
  };

  const updateCard = (id: string, updates: Partial<ScratchCard>) => {
    setConfig((prev: any) => ({
      ...prev,
      cards: prev.cards.map((card: ScratchCard) => card.id === id ? { ...card, ...updates } : card)
    }));
  };

  const addCard = () => {
    const newCard: ScratchCard = {
      id: String(Date.now()),
      revealText: 'Nouveau lot',
      isWinning: false,
      probability: 10
    };
    setConfig((prev: any) => ({ ...prev, cards: [...prev.cards, newCard] }));
    toast.success("Carte ajoutée");
  };

  const deleteCard = (id: string) => {
    if ((config as any).cards?.length <= 1) {
      toast.error("Il doit y avoir au moins 1 carte");
      return;
    }
    setConfig((prev: any) => ({ ...prev, cards: prev.cards.filter((c: ScratchCard) => c.id !== id) }));
    toast.success("Carte supprimée");
  };

  const handleSavePrize = (prize: ScratchPrize) => {
    const existingPrize = (prizes as ScratchPrize[]).find(p => p.id === prize.id);
    if (existingPrize) {
      const used = Math.max(0, existingPrize.quantity - existingPrize.remaining);
      const newRemaining = Math.max(0, (prize.quantity ?? existingPrize.quantity) - used);
      setPrizes((prizes as ScratchPrize[]).map(p => p.id === prize.id ? { ...p, ...prize, remaining: newRemaining, status: newRemaining === 0 ? 'depleted' : p.status } : p));
    } else {
      setPrizes([...(prizes as ScratchPrize[]), { ...prize, remaining: prize.quantity, status: 'active' as const }]);
    }
    toast.success("Lot enregistré");
  };

  const handleDeletePrize = (id: string) => {
    setPrizes((prizes as ScratchPrize[]).filter(p => p.id !== id));
    toast.success("Lot supprimé");
  };

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <ScratchTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          try {
            localStorage.setItem('article-scratch-config', JSON.stringify(config));
            localStorage.setItem('article-scratch-article-config', JSON.stringify(articleConfig));
            localStorage.setItem('article-scratch-viewMode', targetViewMode);
            localStorage.setItem('article-scratch-theme', JSON.stringify(theme));
            window.open('/article-scratch-preview', '_blank');
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
          prizes={prizes as any}
          onSavePrize={handleSavePrize as any}
          onDeletePrize={handleDeletePrize}
          gameType="scratch"
          segments={config.cards.map(c => ({ id: c.id, label: c.revealText }))}
          campaignType="scratch"
          campaignId={campaign?.id}
          campaignMode="article"
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
                  onViewSelect={(view) => { setActiveView(view); setLeftDrawerOpen(false); }}
                  onUpdateCard={updateCard}
                  onAddCard={addCard}
                  onDeleteCard={deleteCard}
                  onGoToDotation={() => { setActiveTab('campaign'); setCampaignDefaultTab('dotation'); setLeftDrawerOpen(false); }}
                  onUpdateConfig={updateConfig}
                />
              </DrawerContent>
            </Drawer>

            <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <ArticleScratchSettingsPanel 
                  articleConfig={articleConfig}
                  onUpdateArticleConfig={updateArticleConfig}
                />
              </DrawerContent>
            </Drawer>

            <Button onClick={() => setLeftDrawerOpen(true)} className="fixed left-2 top-1/2 -translate-y-1/2 z-50 h-12 w-10 p-0 shadow-lg" variant="default">
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Button onClick={() => setRightDrawerOpen(true)} className="fixed right-2 top-1/2 -translate-y-1/2 z-50 h-12 w-10 p-0 shadow-lg" variant="default">
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <ArticleScratchPreview
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
            <ScratchSidebar
              config={config}
              activeView={activeView}
              onViewSelect={setActiveView}
              onUpdateCard={updateCard}
              onAddCard={addCard}
              onDeleteCard={deleteCard}
              onGoToDotation={() => { setActiveTab('campaign'); setCampaignDefaultTab('dotation'); }}
              onUpdateConfig={updateConfig}
            />
            
            {/* Preview area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 relative">
              {/* Top bar: view toggle on the right */}
              <div className="flex items-center justify-end px-4 pt-6 pb-1 bg-gray-100">
                <button
                  onClick={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {viewMode === 'desktop' ? (
                    <><Monitor className="w-4 h-4" /><span className="text-xs font-medium">Desktop</span></>
                  ) : (
                    <><Smartphone className="w-4 h-4" /><span className="text-xs font-medium">Mobile</span></>
                  )}
                </button>
              </div>
              
              {/* ArticleScratchPreview */}
              <div className="flex-1 overflow-auto">
                <ArticleScratchPreview
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
                context={`Type: Scratch Card (Article). Vue active: ${activeView}. Titre: ${(config as any).welcomeScreen?.title || ''}`}
                onApplyActions={createAIActionHandler(config, (updates) => setConfig({ ...config, ...updates }), {
                  welcome: 'welcomeScreen',
                  contact: 'contactForm',
                  scratch: 'scratchScreen',
                  'ending-win': 'endingWin',
                  'ending-lose': 'endingLose'
                })}
              />
            </div>
            
            {/* Right sidebar - View content settings + Article settings */}
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                {/* View-specific settings */}
                <ScratchSettingsPanel 
                  config={config}
                  activeView={activeView}
                  onUpdateConfig={updateConfig}
                  hideSpacingAndBackground={true}
                  hideLayoutAndAlignment={true}
                />
                
                {/* Article-specific settings - Only on Welcome */}
                {activeView === 'welcome' && (
                  <div className="px-4 pb-4">
                    <ArticleScratchSettingsPanel 
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

      <FloatingToolbar />
    </div>
  );
};

export default ArticleScratchBuilder;
