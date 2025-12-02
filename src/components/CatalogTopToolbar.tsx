import { Monitor, Smartphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/ui/SaveIndicator";

interface CatalogTopToolbarProps {
  viewMode: "desktop" | "mobile";
  onViewModeChange: (mode: "desktop" | "mobile") => void;
  status: 'idle' | 'saving' | 'saved' | 'error';
  onPublish: () => void;
}

export const CatalogTopToolbar = ({
  viewMode,
  onViewModeChange,
  status,
  onPublish,
}: CatalogTopToolbarProps) => {
  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">Créateur de Catalogue</h1>
        <SaveIndicator status={status} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => onViewModeChange("desktop")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
              viewMode === "desktop"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="text-sm font-medium">Desktop</span>
          </button>
          <button
            onClick={() => onViewModeChange("mobile")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
              viewMode === "mobile"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium">Mobile</span>
          </button>
        </div>

        <Button 
          size="sm" 
          className="gap-2 h-8 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onPublish}
          disabled={status === 'saving'}
        >
          <Globe className="w-4 h-4" />
          Publier
        </Button>
      </div>
    </div>
  );
};
