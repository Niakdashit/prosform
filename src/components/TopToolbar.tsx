import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Palette, 
  Eye, 
  Save,
  Globe,
  Workflow,
  LayoutTemplate
} from "lucide-react";

interface TopToolbarProps {
  onAddContent: () => void;
  onPreview: () => void;
  activeTab?: 'content' | 'design' | 'workflow' | 'templates';
  onTabChange?: (tab: 'content' | 'design' | 'workflow' | 'templates') => void;
}

export const TopToolbar = ({ 
  onAddContent, 
  onPreview,
  activeTab = 'content',
  onTabChange
}: TopToolbarProps) => {
  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-center px-3">
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
