import { Button } from "@/components/ui/button";
import { Eye, Save, Globe, Loader2 } from "lucide-react";

interface QuizTopToolbarProps {
  onPreview: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
}

export const QuizTopToolbar = ({ onPreview, onSave, onPublish, isSaving }: QuizTopToolbarProps) => {
  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-end px-3">
      <div className="flex items-center gap-2">
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
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
        <Button 
          size="sm" 
          className="gap-2 h-8 px-4 text-xs font-medium"
          style={{ 
            backgroundColor: '#f5ca3c', 
            color: '#3d3731',
            border: 'none',
          }}
          onClick={onPublish}
          disabled={isSaving}
        >
          <Globe className="w-4 h-4" />
          Publier
        </Button>
      </div>
    </div>
  );
};
