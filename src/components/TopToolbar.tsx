import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Palette, 
  Smartphone, 
  Eye, 
  RotateCcw,
  Settings,
  Share2,
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
          variant="default"
          size="sm" 
          className="gap-1.5 h-8 text-xs px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground"
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

      <div className="flex items-center gap-1 absolute right-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Smartphone className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onPreview}>
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Share2 className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
