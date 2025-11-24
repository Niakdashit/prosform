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
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('desktop')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'desktop'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span className="text-sm font-medium">Desktop</span>
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'mobile'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-sm font-medium">Mobile</span>
        </button>
      </div>

      {activeTab === 'desktop' ? (
        <div className="grid grid-cols-2 gap-3">
          {DESKTOP_LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onDesktopLayoutChange(layout.id)}
              className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                desktopLayout === layout.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="aspect-video bg-muted rounded mb-2 overflow-hidden flex items-center justify-center">
                <img 
                  src={layout.preview} 
                  alt={layout.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-xs font-medium text-center">{layout.name}</div>
              <div className="text-[10px] text-muted-foreground text-center mt-1">
                {layout.description}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {MOBILE_LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onMobileLayoutChange(layout.id)}
              className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                mobileLayout === layout.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="aspect-[9/16] bg-muted rounded mb-2 overflow-hidden flex items-center justify-center max-h-32">
                <img 
                  src={layout.preview} 
                  alt={layout.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-xs font-medium text-center">{layout.name}</div>
              <div className="text-[10px] text-muted-foreground text-center mt-1">
                {layout.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
