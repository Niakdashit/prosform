import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Palette, 
  Eye,
  Workflow,
  LayoutTemplate,
  Home,
  Save,
  Globe
} from "lucide-react";
import { SaveIndicator } from "./ui/SaveIndicator";
import { PublicationBadge } from "./ui/PublicationBadge";

interface TopToolbarProps {
  onAddContent: () => void;
  onPreview: () => void;
  activeTab?: 'content' | 'design' | 'workflow' | 'templates';
  onTabChange?: (tab: 'content' | 'design' | 'workflow' | 'templates') => void;
  onBackToDashboard?: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
  isPublished?: boolean;
}

export const TopToolbar = ({ 
  onAddContent, 
  onPreview,
  activeTab = 'content',
  onTabChange,
  onBackToDashboard,
  onSave,
  onPublish,
  isSaving,
  lastSaved,
  isPublished = false
}: TopToolbarProps) => {
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
        <PublicationBadge isPublished={isPublished} />
      </div>

      {/* Center: Tab buttons */}
      <div className="flex items-center gap-1.5">
        <Button 
          variant={activeTab === 'content' ? 'default' : 'ghost'}
          size="sm" 
          className="gap-1.5 h-8 text-xs px-2.5"
          onClick={() => {
            onTabChange?.('content');
            onAddContent();
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add content
        </Button>
        <Button 
          variant={activeTab === 'design' ? 'default' : 'ghost'}
          size="sm" 
          className="gap-1.5 h-8 text-xs px-2.5"
          onClick={() => onTabChange?.('design')}
        >
          <Palette className="w-3.5 h-3.5" />
          Campagne
        </Button>
        <Button 
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          size="sm" 
          className="gap-1.5 h-8 text-xs px-2.5"
          onClick={() => onTabChange?.('templates')}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          Templates
        </Button>
        <Button 
          variant={activeTab === 'workflow' ? 'default' : 'ghost'}
          size="sm" 
          className="gap-1.5 h-8 text-xs px-2.5"
          onClick={() => onTabChange?.('workflow')}
        >
          <Workflow className="w-3.5 h-3.5" />
          Workflow
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
