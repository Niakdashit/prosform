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
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-2">
          <span>Universal mode</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
        <Button variant="default" size="sm" className="gap-2 bg-secondary hover:bg-secondary/90">
          <Plus className="w-4 h-4" />
          Add content
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <Palette className="w-4 h-4" />
          Design
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Smartphone className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Play className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Clock className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Languages className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
