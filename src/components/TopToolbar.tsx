import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  Plus, 
  Palette, 
  Smartphone, 
  Play, 
  Clock, 
  RotateCcw, 
  Languages,
  Settings
} from "lucide-react";

export const TopToolbar = () => {
  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-3">
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs px-2.5">
          <span>Universal mode</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
        <Button variant="default" size="sm" className="gap-1.5 h-8 text-xs px-2.5 bg-secondary hover:bg-secondary/90">
          <Plus className="w-3.5 h-3.5" />
          Add content
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs px-2.5">
          <Palette className="w-3.5 h-3.5" />
          Design
        </Button>
      </div>

      <div className="flex items-center gap-1">
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
