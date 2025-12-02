import { CatalogConfig, CatalogItem } from "./CatalogBuilder";
import { useTheme, getButtonStyles } from "@/contexts/ThemeContext";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignHeader, CampaignFooter } from "./campaign";

interface CatalogPreviewProps {
  config: CatalogConfig;
  onUpdateConfig: (updates: Partial<CatalogConfig>) => void;
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: () => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<CatalogItem>) => void;
  isReadOnly?: boolean;
}

export const CatalogPreview = ({
  config,
  viewMode,
  onToggleViewMode,
  selectedItemId,
  onSelectItem,
  isReadOnly = false,
}: CatalogPreviewProps) => {
  const { theme } = useTheme();
  const unifiedButtonStyles = getButtonStyles(theme, viewMode);

  const containerClass = viewMode === "desktop"
    ? "w-full max-w-6xl mx-auto"
    : "w-[375px] mx-auto";

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Preview Mode Toggle */}
      {!isReadOnly && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-1">
          <button
            onClick={() => onToggleViewMode()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
              viewMode === "desktop"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="text-sm font-medium">Desktop</span>
          </button>
          <button
            onClick={() => onToggleViewMode()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
              viewMode === "mobile"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium">Mobile</span>
          </button>
        </div>
      )}

      {/* Scrollable content */}
      <div className="w-full h-full overflow-auto">
        <div 
          className="min-h-full flex flex-col"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          {/* Header */}
          {config.layout?.header?.enabled && (
            <CampaignHeader 
              config={config.layout.header}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 flex items-start justify-center p-8">
            <div className={`${containerClass} rounded-2xl overflow-hidden`}>
              <div className="p-8">
                {/* Catalog Header */}
                <div className="mb-8 text-center">
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: theme.textColor }}
                  >
                    {config.catalogTitle}
                  </h1>
                  <p
                    className="text-lg"
                    style={{ color: theme.textColor, opacity: 0.8 }}
                  >
                    {config.catalogSubtitle}
                  </p>
                </div>

                {/* Grid of items */}
                <div className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} gap-6`}>
                  {config.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => !isReadOnly && onSelectItem(item.id)}
                      className={`bg-white rounded-xl overflow-hidden shadow-lg transition-all ${
                        !isReadOnly ? "cursor-pointer hover:scale-105" : ""
                      } ${
                        item.isComingSoon ? "opacity-60" : ""
                      } ${
                        selectedItemId === item.id && !isReadOnly ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      {/* Image placeholder */}
                      <div
                        className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                        style={item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: "cover" } : {}}
                      >
                        {!item.image && (
                          <span className="text-gray-400 text-sm">Image</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {item.description}
                        </p>

                        {/* Button */}
                        <button
                          className="w-full py-2.5 rounded-lg font-semibold text-white transition-colors"
                          style={{
                            ...unifiedButtonStyles,
                            background: item.isComingSoon ? "#9ca3af" : unifiedButtonStyles.background,
                            opacity: item.isComingSoon ? 0.7 : 1,
                          }}
                          disabled={item.isComingSoon}
                        >
                          {item.buttonText}
                        </button>

                        {/* Coming soon date */}
                        {item.isComingSoon && item.comingSoonDate && (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Commence le {item.comingSoonDate}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          {config.layout?.footer?.enabled && (
            <CampaignFooter 
              config={config.layout.footer}
            />
          )}
        </div>
      </div>
    </div>
  );
};
