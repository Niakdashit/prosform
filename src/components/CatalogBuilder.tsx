import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CatalogSidebar } from "./CatalogSidebar";
import { CatalogPreview } from "./CatalogPreview";
import { CatalogSettingsPanel } from "./CatalogSettingsPanel";
import { CatalogTopToolbar } from "./CatalogTopToolbar";
import { CampaignSettings } from "./CampaignSettings";
import { ChatToCreate } from "./ChatToCreate";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";
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
import { TemplateLibrary } from "./templates";

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  link: string;
  isComingSoon: boolean;
  comingSoonDate?: string;
}

export interface CatalogConfig {
  catalogTitle: string;
  catalogSubtitle: string;
  items: CatalogItem[];
  mobileLayout: MobileLayoutType;
  desktopLayout: DesktopLayoutType;
  containerWidth: number; // percentage 50-100
  layout: {
    header: HeaderConfig;
    footer: FooterConfig;
  };
}

const defaultCatalogConfig: CatalogConfig = {
  catalogTitle: "Inspiration, astuces, concours...",
  catalogSubtitle: "...et de nombreux prix à gagner !",
  items: [
    {
      id: '1',
      title: "Des idées recette pour toute la semaine",
      description: "En manque d'inspiration ? Aucun souci grâce à nos 10 recettes !",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
    },
    {
      id: '2',
      title: "Partagez vos photos de cocktails",
      description: "Participez et partagez vos photos avec vos amis !",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
    },
    {
      id: '3',
      title: "Remportez un dîner dans un restaurant !",
      description: "Tentez votre chance pour un repas dans votre restaurant préféré",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
    },
    {
      id: '4',
      title: "Découvrez le jus adapté à vos besoins !",
      description: "Faites notre quiz et pour le savoir !",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
    },
    {
      id: '5',
      title: "Quel type de machine à café êtes-vous ?",
      description: "Faites notre quiz et pour le savoir !",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
    },
    {
      id: '6',
      title: "Des réductions dans votre magasin local !",
      description: "Des réductions allant jusqu'à 50% !",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
    },
    {
      id: '7',
      title: "Des bons cadeaux à gagner !",
      description: "Profitez de votre nourriture préférée grâce à des bons cadeaux jusqu'à 50% !",
      image: "",
      buttonText: "BIENTÔT",
      link: "",
      isComingSoon: true,
      comingSoonDate: "20 juin",
    },
    {
      id: '8',
      title: "Guide cadeaux de Noël",
      description: "Il n'est jamais trop tôt pour réfléchir aux cadeaux de Noël",
      image: "",
      buttonText: "BIENTÔT",
      link: "",
      isComingSoon: true,
      comingSoonDate: "21 juin",
    },
    {
      id: '9',
      title: "Gagnez un city trip !",
      description: "Tentez votre chance de découvrir une nouvelle ville",
      image: "",
      buttonText: "BIENTÔT",
      link: "",
      isComingSoon: true,
      comingSoonDate: "23 juin",
    },
  ],
  mobileLayout: "mobile-vertical",
  desktopLayout: "desktop-centered",
  containerWidth: 1200,
  layout: {
    header: { ...defaultHeaderConfig, enabled: false },
    footer: { ...defaultFooterConfig, enabled: false },
  }
};

export const CatalogBuilder = () => {
  const isMobile = useIsMobile();
  const themeContext = useTheme();
  const { theme } = themeContext;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const campaignId = searchParams.get('id');

  // Hook de persistance Supabase
  const {
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
    { campaignId, type: 'catalog', defaultName: 'Nouveau catalogue' },
    defaultCatalogConfig,
    themeContext
  );

  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'campaign' | 'templates'>('design');
  const [campaignDefaultTab, setCampaignDefaultTab] = useState<string>('canaux');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isMobile) {
      setViewMode('mobile');
    }
  }, [isMobile]);

  const handleSave = async () => {
    const saved = await save();
    if (saved && !campaignId) {
      navigate(`/catalog?id=${saved.id}`, { replace: true });
    }
  };

  const handlePublish = async () => {
    const published = await publish();
    if (published && !campaignId) {
      navigate(`/catalog?id=${published.id}`, { replace: true });
    }
  };

  const handlePreview = () => {
    const targetViewMode = isMobile ? 'mobile' : 'desktop';
    try {
      localStorage.removeItem('catalog-config');
      localStorage.removeItem('catalog-viewMode');
      localStorage.removeItem('catalog-theme');
    } catch (e) {
      // Ignore cleanup errors
    }
    
    try {
      localStorage.setItem('catalog-config', JSON.stringify(config));
      localStorage.setItem('catalog-viewMode', targetViewMode);
      localStorage.setItem('catalog-theme', JSON.stringify(theme));
      window.open('/catalog-preview', '_blank');
    } catch (e) {
      console.error('Preview error:', e);
    }
  };

  const updateConfig = (updates: Partial<CatalogConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateItem = (id: string, updates: Partial<CatalogItem>) => {
    setConfig(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

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
          Chargement du catalogue...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <CatalogTopToolbar 
        onPreview={handlePreview}
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Desktop only) */}
        {!isMobile && activeTab === 'design' && (
          <CatalogSidebar
            config={config}
            onUpdateConfig={updateConfig}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
          />
        )}

        {/* Mobile Left Drawer */}
        {isMobile && (
          <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
            <DrawerContent className="w-[280px] p-0">
              <CatalogSidebar
                config={config}
                onUpdateConfig={updateConfig}
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
              />
            </DrawerContent>
          </Drawer>
        )}

        {/* Preview Area */}
        {activeTab === 'design' ? (
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
            
            {/* CatalogPreview */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <CatalogPreview
                config={config}
                onUpdateConfig={updateConfig}
                viewMode={viewMode}
                onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
                onUpdateItem={updateItem}
              />
            </div>
            
            <ChatToCreate 
              context={`Type: Catalogue. Titre: ${config.catalogTitle}. ${config.items.length} campagnes`}
              onApplyActions={(actions) => {
                // Handle AI actions for catalog
                console.log('AI Actions:', actions);
              }}
            />
          </div>
        ) : activeTab === 'campaign' ? (
          <div className="flex-1 overflow-auto bg-muted/30">
            <CampaignSettings
              campaignName={campaignName}
              onCampaignNameChange={setName}
              prizes={prizes}
              onSavePrize={(prize) => {
                const existing = prizes.find(p => p.id === prize.id);
                if (existing) {
                  setPrizes(prizes.map(p => p.id === prize.id ? prize : p));
                } else {
                  setPrizes([...prizes, prize]);
                }
              }}
              onDeletePrize={(id) => setPrizes(prizes.filter(p => p.id !== id))}
              startDate={startDate}
              onStartDateChange={setStartDate}
              startTime={startTime}
              onStartTimeChange={setStartTime}
              endDate={endDate}
              onEndDateChange={setEndDate}
              endTime={endTime}
              onEndTimeChange={setEndTime}
              segments={[]}
              defaultTab={campaignDefaultTab}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-muted/30">
            <TemplateLibrary onSelectTemplate={() => {}} />
          </div>
        )}

        {/* Right Sidebar (Desktop only) */}
        {!isMobile && activeTab === 'design' && (
          <CatalogSettingsPanel
            config={config}
            selectedItemId={selectedItemId}
            onUpdateConfig={updateConfig}
            onUpdateItem={updateItem}
            viewMode={viewMode}
          />
        )}

        {/* Mobile Right Drawer */}
        {isMobile && (
          <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
            <DrawerContent className="w-[280px] p-0">
              <CatalogSettingsPanel
                config={config}
                selectedItemId={selectedItemId}
                onUpdateConfig={updateConfig}
                onUpdateItem={updateItem}
                viewMode={viewMode}
              />
            </DrawerContent>
          </Drawer>
        )}

        {/* Mobile Toggle Buttons */}
        {isMobile && activeTab === 'design' && (
          <>
            <Button
              size="icon"
              variant="outline"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-16 rounded-r-lg bg-background shadow-md z-10"
              onClick={() => setLeftDrawerOpen(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-16 rounded-l-lg bg-background shadow-md z-10"
              onClick={() => setRightDrawerOpen(true)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
