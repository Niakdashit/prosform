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
                <div className="mb-8">
                  <h1 className="text-4xl font-bold mb-2 text-[#4a90e2]">
                    {config.catalogTitle}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {config.catalogSubtitle}
                  </p>
                </div>

                {/* Active campaigns */}
                <div className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} gap-6 mb-12`}>
                  {config.items.filter(item => !item.isComingSoon).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => !isReadOnly && onSelectItem(item.id)}
                      className={`bg-white rounded-xl overflow-hidden shadow-md transition-all ${
                        !isReadOnly ? "cursor-pointer hover:shadow-lg" : ""
                      } ${
                        selectedItemId === item.id && !isReadOnly ? "ring-2 ring-[#4a90e2]" : ""
                      }`}
                    >
                      {/* Image */}
                      <div
                        className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                        style={item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                      >
                        {!item.image && (
                          <span className="text-gray-400 text-sm">Image</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-base font-bold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Button */}
                        <button
                          className="w-full py-2.5 px-4 rounded font-bold text-white bg-[#4a90e2] hover:bg-[#357abd] transition-colors uppercase text-sm"
                        >
                          {item.buttonText}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coming soon section */}
                {config.items.some(item => item.isComingSoon) && (
                  <>
                    <h2 className="text-3xl font-bold mb-6 text-[#4a90e2]">
                      Prochainement...
                    </h2>
                    <div className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} gap-6`}>
                      {config.items.filter(item => item.isComingSoon).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => !isReadOnly && onSelectItem(item.id)}
                          className={`bg-white rounded-xl overflow-hidden shadow-md opacity-60 ${
                            !isReadOnly ? "cursor-pointer" : ""
                          } ${
                            selectedItemId === item.id && !isReadOnly ? "ring-2 ring-[#4a90e2]" : ""
                          }`}
                        >
                          {/* Image */}
                          <div
                            className="w-full h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center grayscale"
                            style={item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                          >
                            {!item.image && (
                              <span className="text-gray-500 text-sm">Image</span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="text-base font-bold text-gray-700 mb-2">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                              {item.description}
                            </p>

                            {/* Coming soon date */}
                            {item.comingSoonDate && (
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span>📅</span>
                                <span>Commence le {item.comingSoonDate}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
