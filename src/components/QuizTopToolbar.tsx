import { Button } from "@/components/ui/button";
import { Eye, Share2, Settings, Palette, Smartphone, RotateCcw, HelpCircle } from "lucide-react";

interface QuizTopToolbarProps {
  onPreview: () => void;
  activeTab: 'design' | 'campaign' | 'templates';
  onTabChange: (tab: 'design' | 'campaign' | 'templates') => void;
}

export const QuizTopToolbar = ({ onPreview, activeTab, onTabChange }: QuizTopToolbarProps) => {
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
          <HelpCircle className="w-3.5 h-3.5" />
          Paramètres du quiz
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
