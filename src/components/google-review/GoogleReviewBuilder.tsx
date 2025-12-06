import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Monitor, Smartphone, Loader2 } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GoogleReviewSidebar } from "./GoogleReviewSidebar";
import { GoogleReviewSettingsPanel } from "./GoogleReviewSettingsPanel";
import { GoogleReviewTopToolbar } from "./GoogleReviewTopToolbar";
import { GoogleReviewPreviewComponent } from "./GoogleReviewPreviewComponent";
import { QRCodesPanel } from "./QRCodesPanel";
import { CampaignSettings } from "@/components/CampaignSettings";
import { SegmentsModal } from "@/components/SegmentsModal";
import { FloatingToolbar } from "@/components/FloatingToolbar";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { useCampaign } from "@/hooks/useCampaign";
import type { GoogleReviewConfig, GoogleReviewPrize, WheelSegment } from './types';
import { defaultGoogleReviewConfig } from './types';

export type EditorView = 'instructions' | 'review' | 'game' | 'ending-win' | 'ending-lose';

export const GoogleReviewBuilder = () => {
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
    shortSlug,
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
    setShortSlug,
  } = useCampaign(
    { campaignId, type: 'wheel', defaultName: 'Google Review - Nouvelle campagne' },
    defaultGoogleReviewConfig,
    themeContext
  );

  const [activeView, setActiveView] = useState<EditorView>('instructions');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'campaign' | 'qrcodes'>('design');
  const [segmentsModalOpen, setSegmentsModalOpen] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setViewMode('mobile');
    }
  }, [isMobile]);

  // Cast du config vers GoogleReviewConfig
  const googleReviewConfig = config as GoogleReviewConfig;

  // Sauvegarder et mettre à jour l'URL avec l'ID
  const handleSave = async () => {
    const saved = await save();
    if (saved && !campaignId) {
      navigate(`/google-review?id=${saved.id}`, { replace: true });
    }
  };

  // Publier et mettre à jour l'URL
  const handlePublish = async () => {
    const published = await publish();
    if (published && !campaignId) {
      navigate(`/google-review?id=${published.id}`, { replace: true });
    }
  };

  const updateConfig = (updates: Partial<GoogleReviewConfig>) => {
    setConfig((prev: GoogleReviewConfig) => ({ ...prev, ...updates }));
  };

  const handleSavePrize = (prize: GoogleReviewPrize) => {
    const existingPrize = googleReviewConfig.prizes.find(p => p.id === prize.id);

    if (existingPrize) {
      updateConfig({
        prizes: googleReviewConfig.prizes.map(p => 
          p.id === prize.id ? prize : p
        )
      });
    } else {
      updateConfig({
        prizes: [...googleReviewConfig.prizes, prize]
      });
    }

    toast.success("Lot enregistré");
  };

  const handleDeletePrize = (id: string) => {
    updateConfig({
      prizes: googleReviewConfig.prizes.filter(p => p.id !== id)
    });
    toast.success("Lot supprimé");
  };

  // Gestion des segments
  const segments = googleReviewConfig.wheelConfig?.segments || [];

  const handleAddSegment = () => {
    const newSegment: WheelSegment = {
      id: `seg-${Date.now()}`,
      label: 'Nouveau segment',
      color: '#F5B800',
      textColor: '#FFFFFF',
    };
    const newSegments = [...segments, newSegment];
    updateConfig({
      wheelConfig: {
        ...googleReviewConfig.wheelConfig,
        segments: newSegments,
      }
    });
  };

  const handleUpdateSegment = (id: string, updates: Partial<WheelSegment>) => {
    const newSegments = segments.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    updateConfig({
      wheelConfig: {
        ...googleReviewConfig.wheelConfig,
        segments: newSegments,
      }
    });
  };

  const handleDuplicateSegment = (id: string) => {
    const segment = segments.find(s => s.id === id);
    if (segment) {
      const newSegment = {
        ...segment,
        id: `seg-${Date.now()}`,
        label: `${segment.label} (copie)`,
      };
      updateConfig({
        wheelConfig: {
          ...googleReviewConfig.wheelConfig,
          segments: [...segments, newSegment],
        }
      });
      toast.success("Segment dupliqué");
    }
  };

  const handleDeleteSegment = (id: string) => {
    if (segments.length <= 2) {
      toast.error("La roue doit avoir au moins 2 segments");
      return;
    }
    updateConfig({
      wheelConfig: {
        ...googleReviewConfig.wheelConfig,
        segments: segments.filter(s => s.id !== id),
      }
    });
    toast.success("Segment supprimé");
  };

  const handleReorderSegments = (startIndex: number, endIndex: number) => {
    const newSegments = [...segments];
    const [removed] = newSegments.splice(startIndex, 1);
    newSegments.splice(endIndex, 0, removed);
    updateConfig({
      wheelConfig: {
        ...googleReviewConfig.wheelConfig,
        segments: newSegments,
      }
    });
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
      <GoogleReviewTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          try {
            localStorage.setItem('google-review-config', JSON.stringify(googleReviewConfig));
            localStorage.setItem('google-review-viewMode', targetViewMode);
            localStorage.setItem('google-review-theme', JSON.stringify(theme));
            if (campaign?.id) {
              localStorage.setItem('google-review-campaignId', campaign.id);
            }
            const previewUrl = campaign?.id 
              ? `/google-review-preview?id=${campaign.id}` 
              : '/google-review-preview';
            window.open(previewUrl, '_blank');
          } catch (e) {
            console.warn('localStorage full:', e);
            toast.error('Impossible d\'ouvrir la preview');
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
          prizes={prizes.map(p => ({
            ...p,
            attributionMethod: 'probability' as const,
            status: 'active' as const,
          }))}
          onSavePrize={(prize) => {
            // Convertir le prize standard en GoogleReviewPrize
            const grPrize: GoogleReviewPrize = {
              id: prize.id,
              name: prize.name,
              description: prize.description,
              quantity: prize.quantity,
              remaining: prize.remaining,
              probability: prize.winProbability || 10,
              qrCodes: [],
              status: prize.status === 'scheduled' ? 'active' : prize.status,
            };
            handleSavePrize(grPrize);
          }}
          onDeletePrize={handleDeletePrize}
          gameType="wheel"
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
          campaignUrl={campaign?.id ? `${window.location.origin}/google-review-preview?id=${campaign.id}` : ''}
          editorType="wheel"
          editorMode="fullscreen"
          campaignId={campaign?.id || ''}
          publicSlug={campaign?.public_url_slug || ''}
          publishedUrl={campaign?.published_url || ''}
          shortSlug={shortSlug}
          onShortSlugChange={setShortSlug}
        />
      ) : activeTab === 'qrcodes' ? (
        <QRCodesPanel 
          config={googleReviewConfig}
          onUpdateConfig={updateConfig}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
          {isMobile ? (
            <>
              <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
                <DrawerContent className="h-[85vh]">
                  <GoogleReviewSidebar
                    config={googleReviewConfig}
                    activeView={activeView}
                    onViewSelect={(view) => {
                      setActiveView(view);
                      setLeftDrawerOpen(false);
                    }}
                    onOpenPrizesModal={() => {
                      setActiveTab('campaign');
                      setLeftDrawerOpen(false);
                    }}
                    onOpenQRCodesModal={() => {
                      setActiveTab('qrcodes');
                      setLeftDrawerOpen(false);
                    }}
                    onOpenSegmentsModal={() => {
                      setSegmentsModalOpen(true);
                      setLeftDrawerOpen(false);
                    }}
                    onDuplicateSegment={handleDuplicateSegment}
                    onDeleteSegment={handleDeleteSegment}
                    onReorderSegments={handleReorderSegments}
                    onUpdateConfig={updateConfig}
                  />
                </DrawerContent>
              </Drawer>

              <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
                <DrawerContent className="h-[85vh]">
                  <GoogleReviewSettingsPanel 
                    config={googleReviewConfig}
                    activeView={activeView}
                    onUpdateConfig={updateConfig}
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

              {/* Preview mobile */}
              <GoogleReviewPreviewComponent
                config={googleReviewConfig}
                activeView={activeView}
                viewMode="mobile"
                isMobileResponsive={true}
                onUpdateConfig={updateConfig}
              />
            </>
          ) : (
            <>
              <GoogleReviewSidebar
                config={googleReviewConfig}
                activeView={activeView}
                onViewSelect={setActiveView}
                onOpenPrizesModal={() => setActiveTab('campaign')}
                onOpenQRCodesModal={() => setActiveTab('qrcodes')}
                onOpenSegmentsModal={() => setSegmentsModalOpen(true)}
                onDuplicateSegment={handleDuplicateSegment}
                onDeleteSegment={handleDeleteSegment}
                onReorderSegments={handleReorderSegments}
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
                
                {/* Preview - même pattern que WheelBuilder */}
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <GoogleReviewPreviewComponent
                    config={googleReviewConfig}
                    activeView={activeView}
                    viewMode={viewMode}
                    isMobileResponsive={false}
                    onUpdateConfig={updateConfig}
                  />
                </div>
              </div>
              
              <GoogleReviewSettingsPanel 
                config={googleReviewConfig}
                activeView={activeView}
                onUpdateConfig={updateConfig}
              />
            </>
          )}
        </div>
      )}

      <FloatingToolbar />

      {/* Modal de configuration des segments */}
      <SegmentsModal
        open={segmentsModalOpen}
        onOpenChange={setSegmentsModalOpen}
        segments={segments}
        onAddSegment={handleAddSegment}
        onUpdateSegment={handleUpdateSegment}
        onDeleteSegment={handleDeleteSegment}
        prizes={[]}
      />
    </div>
  );
};
