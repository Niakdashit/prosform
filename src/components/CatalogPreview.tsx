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
          <div className="flex-1 flex items-start justify-center p-6 md:p-12">
            <div className={`${containerClass}`}>
              {/* Catalog Header */}
              <div className="mb-10 text-center">
                <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  {config.catalogTitle}
                </h1>
                <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
                  {config.catalogSubtitle}
                </p>
              </div>

              {/* Active campaigns */}
              <div className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} gap-5 md:gap-8 mb-14`}>
                {config.items.filter(item => !item.isComingSoon).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => !isReadOnly && onSelectItem(item.id)}
                    className={`group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 hover:border-white/20 ${
                      !isReadOnly ? "cursor-pointer" : ""
                    } ${
                      selectedItemId === item.id && !isReadOnly ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent" : ""
                    }`}
                  >
                    {/* Image */}
                    <div className="relative w-full h-44 md:h-52 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 transition-transform duration-500 group-hover:scale-110"
                        style={item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                      />
                      {!item.image && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white/30 text-sm">Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-5 md:p-6">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/60 mb-5 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {/* Button */}
                      <button
                        className="w-full py-3 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 uppercase text-sm tracking-wide shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
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
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                      Prochainement...
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                  <div className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} gap-5 md:gap-8`}>
                    {config.items.filter(item => item.isComingSoon).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => !isReadOnly && onSelectItem(item.id)}
                        className={`group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 ${
                          !isReadOnly ? "cursor-pointer hover:bg-white/10" : ""
                        } ${
                          selectedItemId === item.id && !isReadOnly ? "ring-2 ring-blue-500/50" : ""
                        }`}
                      >
                        {/* Image */}
                        <div className="relative w-full h-44 md:h-52 overflow-hidden">
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-gray-600/30 to-gray-800/30 grayscale"
                            style={item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                          />
                          {!item.image && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white/20 text-sm">Image</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="p-5 md:p-6">
                          <h3 className="text-lg font-semibold text-white/60 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-white/40 mb-4 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>

                          {/* Coming soon date */}
                          {item.comingSoonDate && (
                            <div className="flex items-center gap-2 text-sm text-blue-400/80 bg-blue-500/10 rounded-lg px-3 py-2">
                              <span>📅</span>
                              <span>Commence le {item.comingSoonDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
