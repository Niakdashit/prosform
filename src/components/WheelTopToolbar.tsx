import { Button } from "@/components/ui/button";
import { Eye, Share2, Settings } from "lucide-react";

interface WheelTopToolbarProps {
  onPreview: () => void;
}

export const WheelTopToolbar = ({ onPreview }: WheelTopToolbarProps) => {
  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Éditeur de roue de la fortune</span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onPreview}>
          <Eye className="w-3.5 h-3.5" />
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
