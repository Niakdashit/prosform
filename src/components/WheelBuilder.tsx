import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WheelSidebar } from "./WheelSidebar";
import { WheelPreview } from "./WheelPreview";
import { WheelSettingsPanel } from "./WheelSettingsPanel";
import { WheelTopToolbar } from "./WheelTopToolbar";
import { SegmentsModal } from "./SegmentsModal";
import { CampaignSettings } from "./CampaignSettings";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  probability?: number;
  icon?: string;
}

export interface ContactField {
  type: 'name' | 'email' | 'phone';
  required: boolean;
  label: string;
}

export interface WheelConfig {
  welcomeScreen: {
    title: string;
    subtitle: string;
    buttonText: string;
    blockSpacing: number;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
  };
  contactForm: {
    enabled: boolean;
    title: string;
    subtitle: string;
    blockSpacing: number;
    fields: ContactField[];
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
  };
  wheelScreen: {
    blockSpacing: number;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
  };
  segments: WheelSegment[];
  endingScreen: {
    title: string;
    subtitle: string;
    blockSpacing: number;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
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
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  },
  segments: [
    { id: '1', label: '10% de réduction', color: '#FF6B6B', probability: 20 },
    { id: '2', label: 'Livraison gratuite', color: '#4ECDC4', probability: 25 },
    { id: '3', label: '20% de réduction', color: '#45B7D1', probability: 15 },
    { id: '4', label: 'Cadeau surprise', color: '#FFA07A', probability: 10 },
    { id: '5', label: '15% de réduction', color: '#98D8C8', probability: 20 },
    { id: '6', label: 'Réessayez', color: '#F7DC6F', probability: 10 }
  ],
  endingScreen: {
    title: "Félicitations !",
    subtitle: "Vous avez gagné {{prize}}",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  }
};

export const WheelBuilder = () => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [config, setConfig] = useState<WheelConfig>(defaultWheelConfig);
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'wheel' | 'ending'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [segmentsModalOpen, setSegmentsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'campaign'>('design');

  useEffect(() => {
    if (isMobile) {
      setViewMode('mobile');
    }
  }, [isMobile]);

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

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <WheelTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          localStorage.setItem('wheel-config', JSON.stringify(config));
          localStorage.setItem('wheel-viewMode', targetViewMode);
          localStorage.setItem('wheel-theme', JSON.stringify(theme));
          window.open('/wheel-preview', '_blank');
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
        
      {activeTab === 'campaign' ? (
        <CampaignSettings />
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
                const views: Array<'welcome' | 'contact' | 'wheel' | 'ending'> = ['welcome', 'contact', 'wheel', 'ending'];
                const currentIndex = views.indexOf(activeView);
                if (currentIndex < views.length - 1) {
                  setActiveView(views[currentIndex + 1]);
                }
              }}
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
            />
            
            <WheelPreview
              config={config}
              activeView={activeView}
              onUpdateConfig={updateConfig}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
              isMobileResponsive={false}
              onNext={() => {
                const views: Array<'welcome' | 'contact' | 'wheel' | 'ending'> = ['welcome', 'contact', 'wheel', 'ending'];
                const currentIndex = views.indexOf(activeView);
                if (currentIndex < views.length - 1) {
                  setActiveView(views[currentIndex + 1]);
                }
              }}
            />
            
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
      />
    </div>
  );
};
