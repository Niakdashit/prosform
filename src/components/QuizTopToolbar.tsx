import { Button } from "@/components/ui/button";
import { Eye, Share2, Settings, Smartphone, RotateCcw } from "lucide-react";

interface QuizTopToolbarProps {
  onPreview: () => void;
}

export const QuizTopToolbar = ({ onPreview }: QuizTopToolbarProps) => {
  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-end px-3">
      <div className="flex items-center gap-1">
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
