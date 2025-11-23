import { useEffect, useState } from "react";
import { WheelConfig } from "@/components/WheelBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { WheelPreview } from "@/components/WheelPreview";

const WheelPreviewContent = () => {
  const [config, setConfig] = useState<WheelConfig | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'wheel' | 'ending'>('welcome');

  useEffect(() => {
    const savedConfig = localStorage.getItem('wheel-config');
    const savedViewMode = localStorage.getItem('wheel-viewMode');
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    if (savedViewMode) {
      setViewMode(savedViewMode as 'desktop' | 'mobile');
    }
  }, []);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <WheelPreview
      config={config}
      activeView={activeView}
      onUpdateConfig={(updates) => setConfig(prev => prev ? { ...prev, ...updates } : null)}
      viewMode={viewMode}
      onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
      isMobileResponsive={true}
      onNext={() => {
        const views: Array<'welcome' | 'contact' | 'wheel' | 'ending'> = ['welcome', 'contact', 'wheel', 'ending'];
        const currentIndex = views.indexOf(activeView);
        if (currentIndex < views.length - 1) {
          setActiveView(views[currentIndex + 1]);
        }
      }}
    />
  );
};

const WheelPreviewPage = () => {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('wheel-theme');
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
  }, []);

  return (
    <ThemeProvider initialTheme={theme}>
      <WheelPreviewContent />
    </ThemeProvider>
  );
};

export default WheelPreviewPage;
