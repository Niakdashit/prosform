import { DesktopLayoutType, MobileLayoutType, DESKTOP_LAYOUTS, MOBILE_LAYOUTS } from "@/types/layouts";
import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";

interface LayoutSelectorProps {
  desktopLayout: DesktopLayoutType;
  mobileLayout: MobileLayoutType;
  onDesktopLayoutChange: (layout: DesktopLayoutType) => void;
  onMobileLayoutChange: (layout: MobileLayoutType) => void;
}

export const LayoutSelector = ({
  desktopLayout,
  mobileLayout,
  onDesktopLayoutChange,
  onMobileLayoutChange
}: LayoutSelectorProps) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="space-y-2">
      <div className="flex gap-1 border-b border-border/50">
        <button
          onClick={() => setActiveTab('desktop')}
          className={`flex items-center gap-1.5 px-2 py-1 border-b-2 transition-colors ${
            activeTab === 'desktop'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Monitor className="w-3 h-3" />
          <span className="text-xs font-medium">Desktop</span>
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          className={`flex items-center gap-1.5 px-2 py-1 border-b-2 transition-colors ${
            activeTab === 'mobile'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Smartphone className="w-3 h-3" />
          <span className="text-xs font-medium">Mobile</span>
        </button>
      </div>

      {activeTab === 'desktop' ? (
        <div className="grid grid-cols-2 gap-2">
          {DESKTOP_LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onDesktopLayoutChange(layout.id)}
              className={`p-2 rounded border transition-all ${
                desktopLayout === layout.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="aspect-video bg-muted rounded mb-1.5 overflow-hidden flex items-center justify-center">
                <img 
                  src={layout.preview} 
                  alt={layout.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[10px] font-medium text-center leading-tight">{layout.name}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {MOBILE_LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onMobileLayoutChange(layout.id)}
              className={`p-2 rounded border transition-all ${
                mobileLayout === layout.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="aspect-[9/16] bg-muted rounded mb-1.5 overflow-hidden flex items-center justify-center max-h-24">
                <img 
                  src={layout.preview} 
                  alt={layout.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[10px] font-medium text-center leading-tight">{layout.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
