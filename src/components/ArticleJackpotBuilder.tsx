import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { JackpotSidebar } from "./JackpotSidebar";
import { ArticleJackpotPreview } from "./ArticleJackpotPreview";
import { JackpotSettingsPanel } from "./JackpotSettingsPanel";
import { ArticleJackpotSettingsPanel } from "./ArticleJackpotSettingsPanel";
import { JackpotTopToolbar } from "./JackpotTopToolbar";
import { FloatingToolbar } from "./FloatingToolbar";
import { ChatToCreate } from "./ChatToCreate";
import { createAIActionHandler } from "@/utils/aiActionHandler";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { useCampaign } from "@/hooks/useCampaign";
import { JackpotConfig, JackpotSymbol, JackpotPrize } from "./JackpotBuilder";

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
    { id: '6', emoji: '💎', label: 'Diamant' }
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

export const ArticleJackpotBuilder = () => {
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
    title: campaignName,
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
    setTitle,
    setStartDate,
    setStartTime,
    setEndDate,
    setEndTime,
  } = useCampaign(
    { campaignId, type: 'jackpot', mode: 'article', defaultName: 'Nouvelle campagne jackpot (article)' },
    { ...defaultJackpotConfig, articleConfig: defaultArticleConfig },
    themeContext
  );

  // Article config is stored inside config.articleConfig
  const articleConfig: ArticleConfig = (config as any).articleConfig || defaultArticleConfig;

  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'campaign' | 'templates'>('design');

  useEffect(() => {
    if (isMobile) setViewMode('mobile');
  }, [isMobile]);

  // Sauvegarder et mettre à jour l'URL avec l'ID
  const handleSave = async () => {
    const saved = await save();
    if (saved && !campaignId) {
      navigate(`/article-jackpot?id=${saved.id}`, { replace: true });
    }
  };

  // Publier et mettre à jour l'URL
  const handlePublish = async () => {
    const published = await publish();
    if (published && !campaignId) {
      navigate(`/article-jackpot?id=${published.id}`, { replace: true });
    }
  };

  useEffect(() => {
    localStorage.setItem('article-jackpot-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('article-jackpot-article-config', JSON.stringify(articleConfig));
  }, [articleConfig]);

  useEffect(() => {
    localStorage.setItem('article-jackpot-theme', JSON.stringify(theme));
  }, [theme]);

  const updateConfig = (updates: Partial<JackpotConfig>) => {
    setConfig((prev: any) => ({ ...prev, ...updates }));
  };

  const updateArticleConfig = (updates: Partial<ArticleConfig>) => {
    setConfig((prev: any) => ({ 
      ...prev, 
      articleConfig: { ...(prev.articleConfig || defaultArticleConfig), ...updates } 
    }));
  };

  const updateSymbol = (id: string, updates: Partial<JackpotSymbol>) => {
    setConfig((prev: any) => ({
      ...prev,
      symbols: prev.symbols.map((s: JackpotSymbol) => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const addSymbol = () => {
    const newSymbol: JackpotSymbol = {
      id: String(Date.now()),
      emoji: '🎁',
      label: 'Nouveau symbole'
    };
    setConfig((prev: any) => ({ ...prev, symbols: [...prev.symbols, newSymbol] }));
    toast.success("Symbole ajouté");
  };

  const deleteSymbol = (id: string) => {
    if ((config as any).symbols?.length <= 3) {
      toast.error("Le jackpot doit avoir au moins 3 symboles");
      return;
    }
    setConfig((prev: any) => ({ ...prev, symbols: prev.symbols.filter((s: JackpotSymbol) => s.id !== id) }));
    toast.success("Symbole supprimé");
  };

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <JackpotTopToolbar 
        onPreview={() => {
          try {
            localStorage.setItem('article-jackpot-config', JSON.stringify(config));
            localStorage.setItem('article-jackpot-article-config', JSON.stringify(articleConfig));
            localStorage.setItem('article-jackpot-theme', JSON.stringify(theme));
            window.open('/article-jackpot-preview', '_blank');
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
        
      <div className="flex flex-1 overflow-hidden relative">
        {isMobile ? (
          <>
            <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <JackpotSidebar
                  config={config}
                  activeView={activeView}
                  onViewSelect={(view) => { setActiveView(view); setLeftDrawerOpen(false); }}
                  onUpdateSymbol={updateSymbol}
                  onAddSymbol={addSymbol}
                  onDeleteSymbol={deleteSymbol}
                  onGoToDotation={() => {}}
                  onUpdateConfig={updateConfig}
                />
              </DrawerContent>
            </Drawer>

            <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <ArticleJackpotSettingsPanel 
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

            <ArticleJackpotPreview
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
            <JackpotSidebar
              config={config}
              activeView={activeView}
              onViewSelect={setActiveView}
              onUpdateSymbol={updateSymbol}
              onAddSymbol={addSymbol}
              onDeleteSymbol={deleteSymbol}
              onGoToDotation={() => {}}
              onUpdateConfig={updateConfig}
            />
            
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 relative">
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
              
              <div className="flex-1 overflow-auto">
                <ArticleJackpotPreview
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
                context={`Type: Jackpot (Article). Vue active: ${activeView}. Titre: ${(config as any).welcomeScreen?.title || ''}`}
                onApplyActions={createAIActionHandler(config, (updates) => setConfig({ ...config, ...updates }), {
                  welcome: 'welcomeScreen',
                  contact: 'contactForm',
                  jackpot: 'jackpotScreen',
                  'ending-win': 'endingWin',
                  'ending-lose': 'endingLose'
                })}
              />
            </div>
            
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <JackpotSettingsPanel 
                  config={config}
                  activeView={activeView}
                  onUpdateConfig={updateConfig}
                />
                
                {activeView === 'welcome' && (
                  <div className="px-4 pb-4">
                    <ArticleJackpotSettingsPanel 
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

      <FloatingToolbar />
    </div>
  );
};

export default ArticleJackpotBuilder;
