import { Button } from "@/components/ui/button";
import { Eye, Share2, Settings, Palette, Smartphone, RotateCcw, Gift, Home, Save, Globe } from "lucide-react";
import { SaveIndicator } from "./ui/SaveIndicator";

interface ScratchTopToolbarProps {
  onPreview: () => void;
  activeTab: 'design' | 'campaign' | 'templates';
  onTabChange: (tab: 'design' | 'campaign' | 'templates') => void;
  onBackToDashboard?: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export const ScratchTopToolbar = ({ 
  onPreview, 
  activeTab, 
  onTabChange,
  onBackToDashboard,
  onSave,
  onPublish,
  isSaving,
  lastSaved
}: ScratchTopToolbarProps) => {
  const getSaveStatus = () => {
    if (isSaving) return 'saving';
    if (lastSaved) return 'saved';
    return 'idle';
  };

  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-3">
      {/* Left: Back button */}
      <div className="flex items-center gap-2">
        {onBackToDashboard && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1.5 text-xs px-2.5"
            onClick={onBackToDashboard}
          >
            <Home className="w-3.5 h-3.5" />
            Dashboard
          </Button>
        )}
        {(isSaving !== undefined || lastSaved !== undefined) && (
          <SaveIndicator status={getSaveStatus()} />
        )}
      </div>
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

      {/* Right: Action buttons */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onPreview}>
          <Eye className="w-3.5 h-3.5" />
        </Button>
        {onSave && (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs px-2.5" onClick={onSave}>
            <Save className="w-3.5 h-3.5" />
            Sauvegarder
          </Button>
        )}
        {onPublish && (
          <Button variant="default" size="sm" className="h-8 gap-1.5 text-xs px-2.5" onClick={onPublish}>
            <Globe className="w-3.5 h-3.5" />
            Publier
          </Button>
        )}
      </div>
    </div>
  );
};
