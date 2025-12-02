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
          <div className="flex-1 flex items-start justify-center px-4 py-12 md:px-8 md:py-16">
            <div className={containerClass}>
              {/* Catalog Header */}
              <div className="mb-12 text-center">
                <h1
                  className="text-4xl md:text-5xl font-bold mb-3 tracking-tight"
                  style={{ 
                    color: theme.textColor,
                    fontFamily: theme.fontFamily 
                  }}
                >
                  {config.catalogTitle}
                </h1>
                <p
                  className="text-lg md:text-xl"
                  style={{ 
                    color: theme.textColor, 
                    opacity: 0.85,
                    fontFamily: theme.fontFamily 
                  }}
                >
                  {config.catalogSubtitle}
                </p>
              </div>

              {/* Active campaigns grid */}
              <div className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} gap-8 mb-16`}>
                {config.items.filter(item => !item.isComingSoon).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => !isReadOnly && onSelectItem(item.id)}
                    className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
                      !isReadOnly ? "cursor-pointer hover:-translate-y-2 hover:shadow-2xl" : ""
                    } ${
                      selectedItemId === item.id && !isReadOnly ? "ring-4 ring-primary ring-offset-2" : "shadow-xl"
                    }`}
                  >
                    {/* Image */}
                    <div
                      className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden"
                      style={item.image ? { 
                        backgroundImage: `url(${item.image})`, 
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      } : {}}
                    >
                      {!item.image && (
                        <span className="text-gray-400 text-sm font-medium">Image de campagne</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed min-h-[3rem]">
                        {item.description}
                      </p>

                      {/* Button */}
                      <button
                        className="w-full py-3.5 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          ...unifiedButtonStyles,
                          fontSize: '15px',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {item.buttonText}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coming Soon Section */}
              {config.items.some(item => item.isComingSoon) && (
                <div className="mt-16">
                  <h2 
                    className="text-3xl md:text-4xl font-bold mb-8 text-center"
                    style={{ 
                      color: theme.textColor,
                      opacity: 0.7,
                      fontFamily: theme.fontFamily 
                    }}
                  >
                    Prochainement...
                  </h2>
                  
                  <div className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} gap-8`}>
                    {config.items.filter(item => item.isComingSoon).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => !isReadOnly && onSelectItem(item.id)}
                        className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 opacity-60 ${
                          !isReadOnly ? "cursor-pointer hover:opacity-75" : ""
                        } ${
                          selectedItemId === item.id && !isReadOnly ? "ring-4 ring-primary ring-offset-2" : "shadow-lg"
                        }`}
                      >
                        {/* Image with overlay */}
                        <div
                          className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden"
                          style={item.image ? { 
                            backgroundImage: `url(${item.image})`, 
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "grayscale(100%)"
                          } : { filter: "grayscale(100%)" }}
                        >
                          {!item.image && (
                            <span className="text-gray-400 text-sm font-medium">Image de campagne</span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed min-h-[3rem]">
                            {item.description}
                          </p>

                          {/* Coming soon info */}
                          {item.comingSoonDate && (
                            <div className="flex items-center justify-center gap-2 mb-4 text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-medium">Commence le {item.comingSoonDate}</span>
                            </div>
                          )}

                          {/* Button */}
                          <button
                            className="w-full py-3.5 rounded-lg font-bold text-white transition-all duration-300 cursor-not-allowed"
                            style={{
                              background: "#9ca3af",
                              fontSize: '15px',
                              letterSpacing: '0.5px'
                            }}
                            disabled
                          >
                            {item.buttonText}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
