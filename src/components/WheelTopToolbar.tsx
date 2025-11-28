import { Button } from "@/components/ui/button";
import { Eye, Save, Globe, Palette, Gift } from "lucide-react";

interface WheelTopToolbarProps {
  onPreview: () => void;
  activeTab: 'design' | 'campaign' | 'templates';
  onTabChange: (tab: 'design' | 'campaign' | 'templates') => void;
}

export const WheelTopToolbar = ({ onPreview, activeTab, onTabChange }: WheelTopToolbarProps) => {
  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-center px-3">
      <div className="flex items-center gap-1.5">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-1.5 h-8 text-xs px-2.5 ${activeTab === 'design' ? 'bg-accent' : ''}`}
          onClick={() => onTabChange('design')}
        >
          <Palette className="w-3.5 h-3.5" />
          Campagne
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-1.5 h-8 text-xs px-2.5 ${activeTab === 'campaign' ? 'bg-accent' : ''}`}
          onClick={() => onTabChange('campaign')}
        >
          <Gift className="w-3.5 h-3.5" />
          Paramètres et dotations
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-1.5 h-8 text-xs px-2.5 ${activeTab === 'templates' ? 'bg-accent' : ''}`}
          onClick={() => onTabChange('templates')}
        >
          <Palette className="w-3.5 h-3.5" />
          Templates
        </Button>
      </div>

      <div className="flex items-center gap-2 absolute right-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={onPreview}
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 h-8 px-3 text-xs font-medium"
        >
          <Save className="w-4 h-4" />
          Sauvegarder
        </Button>
        <Button 
          size="sm" 
          className="gap-2 h-8 px-4 text-xs font-medium"
          style={{ 
            backgroundColor: '#f5ca3c', 
            color: '#3d3731',
            border: 'none',
          }}
        >
          <Globe className="w-4 h-4" />
          Publier
        </Button>
      </div>
    </div>
  );
};
