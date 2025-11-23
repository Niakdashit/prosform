import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Palette, 
  Smartphone, 
  Play, 
  Clock, 
  RotateCcw, 
  Languages,
  Settings
} from "lucide-react";

export const TopToolbar = ({ onAddContent }: { onAddContent: () => void }) => {
  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-center px-3">
      <div className="flex items-center gap-1.5">
        <Button 
          variant="default" 
          size="sm" 
          className="gap-1.5 h-8 text-xs px-2.5 bg-secondary hover:bg-secondary/90"
          onClick={onAddContent}
        >
          <Plus className="w-3.5 h-3.5" />
          Add content
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs px-2.5">
          <Palette className="w-3.5 h-3.5" />
          Design
        </Button>
      </div>

      <div className="flex items-center gap-1 absolute right-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Smartphone className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Play className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Clock className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Languages className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
