import { CatalogConfig, CatalogItem } from "./CatalogBuilder";
import { useTheme, getButtonStyles, GOOGLE_FONTS } from "@/contexts/ThemeContext";
import { Monitor, Smartphone } from "lucide-react";
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
  const buttonStyles = getButtonStyles(theme, viewMode);

  const containerClass = "w-full";

  // Font family helper
  const getFontFamily = (fontValue: string) => {
    const font = GOOGLE_FONTS.find(f => f.value === fontValue);
    return font ? `"${font.label}", ${font.category}` : fontValue;
  };

  // Shadow helper based on intensity
  const getCardShadow = () => {
    const intensity = theme.shadowIntensity / 100;
    return `0 4px 16px rgba(0,0,0,${intensity * 0.15})`;
  };

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
      <div className="w-full h-full flex items-center justify-center overflow-auto">
        <div 
          className={`min-h-full flex flex-col ${
            viewMode === 'mobile' 
              ? 'w-[375px] h-[667px] rounded-[40px] shadow-[0_0_60px_rgba(0,0,0,0.3)] border-[8px] border-gray-800 overflow-hidden flex-shrink-0' 
              : 'w-full'
          }`}
          style={{ 
            backgroundColor: theme.backgroundColor,
            fontFamily: getFontFamily(theme.fontFamily),
          }}
        >
          {/* Header */}
          {config.layout?.header?.enabled && (
            <CampaignHeader 
              config={config.layout.header}
            />
          )}

          {/* Main Content */}
          <div 
            className="flex-1 flex items-start justify-center"
            style={{ padding: `${theme.pageMargins}px` }}
          >
            <div className={`${containerClass} rounded-2xl overflow-hidden`}>
              <div style={{ padding: `${theme.cardPadding}px` }}>
                {/* Catalog Header */}
                <div className="mb-8">
                  <h1 
                    style={{
                      fontFamily: getFontFamily(theme.headingFontFamily),
                      fontSize: `${theme.headingSize}px`,
                      fontWeight: theme.headingWeight === 'extrabold' ? 800 : theme.headingWeight === 'bold' ? 700 : theme.headingWeight === 'semibold' ? 600 : 500,
                      color: theme.primaryColor,
                      marginBottom: '8px',
                      lineHeight: theme.lineHeight,
                      letterSpacing: `${theme.letterSpacing}px`,
                    }}
                  >
                    {config.catalogTitle}
                  </h1>
                  <p 
                    style={{
                      fontSize: `${theme.subheadingSize}px`,
                      color: theme.textSecondaryColor,
                      lineHeight: theme.lineHeight,
                    }}
                  >
                    {config.catalogSubtitle}
                  </p>
                </div>

                {/* Active campaigns */}
                <div 
                  className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} mb-12`}
                  style={{ gap: `${theme.questionSpacing * 24}px` }}
                >
                  {config.items.filter(item => !item.isComingSoon).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => !isReadOnly && onSelectItem(item.id)}
                      className={`overflow-hidden transition-all ${
                        !isReadOnly ? "cursor-pointer" : ""
                      }`}
                      style={{
                        backgroundColor: theme.surfaceColor,
                        borderRadius: `${theme.cardRadius}px`,
                        boxShadow: getCardShadow(),
                        border: theme.borderWidth > 0 ? `${theme.borderWidth}px solid ${theme.borderColor}` : 'none',
                        ...(selectedItemId === item.id && !isReadOnly ? {
                          boxShadow: `0 0 0 2px ${theme.primaryColor}`,
                        } : {}),
                      }}
                    >
                      {/* Image */}
                      <div
                        className="w-full h-48 flex items-center justify-center"
                        style={{
                          backgroundColor: theme.backgroundSecondaryColor,
                          ...(item.image ? { 
                            backgroundImage: `url(${item.image})`, 
                            backgroundSize: "cover", 
                            backgroundPosition: "center" 
                          } : {}),
                        }}
                      >
                        {!item.image && (
                          <span style={{ color: theme.textMutedColor, fontSize: `${theme.captionSize}px` }}>Image</span>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ padding: `${theme.inputPadding + 8}px` }}>
                        <h3 
                          style={{
                            fontSize: `${theme.bodySize}px`,
                            fontWeight: 700,
                            color: theme.textColor,
                            marginBottom: '8px',
                          }}
                        >
                          {item.title}
                        </h3>
                        <p 
                          style={{
                            fontSize: `${theme.captionSize}px`,
                            color: theme.textSecondaryColor,
                            marginBottom: '16px',
                            lineHeight: theme.lineHeight,
                          }}
                        >
                          {item.description}
                        </p>

                        {/* Button */}
                        <button
                          className="w-full uppercase transition-opacity hover:opacity-90"
                          style={{
                            ...buttonStyles,
                            width: '100%',
                          }}
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
                    <h2 
                      className="mb-6"
                      style={{
                        fontFamily: getFontFamily(theme.headingFontFamily),
                        fontSize: `${theme.subheadingSize + 8}px`,
                        fontWeight: theme.headingWeight === 'extrabold' ? 800 : theme.headingWeight === 'bold' ? 700 : 600,
                        color: theme.primaryColor,
                      }}
                    >
                      Prochainement...
                    </h2>
                    <div 
                      className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"}`}
                      style={{ gap: `${theme.questionSpacing * 24}px` }}
                    >
                      {config.items.filter(item => item.isComingSoon).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => !isReadOnly && onSelectItem(item.id)}
                          className={`overflow-hidden opacity-60 ${
                            !isReadOnly ? "cursor-pointer" : ""
                          }`}
                          style={{
                            backgroundColor: theme.surfaceColor,
                            borderRadius: `${theme.cardRadius}px`,
                            boxShadow: getCardShadow(),
                            border: theme.borderWidth > 0 ? `${theme.borderWidth}px solid ${theme.borderColor}` : 'none',
                            ...(selectedItemId === item.id && !isReadOnly ? {
                              boxShadow: `0 0 0 2px ${theme.primaryColor}`,
                            } : {}),
                          }}
                        >
                          {/* Image */}
                          <div
                            className="w-full h-48 flex items-center justify-center grayscale"
                            style={{
                              backgroundColor: theme.backgroundSecondaryColor,
                              ...(item.image ? { 
                                backgroundImage: `url(${item.image})`, 
                                backgroundSize: "cover", 
                                backgroundPosition: "center" 
                              } : {}),
                            }}
                          >
                            {!item.image && (
                              <span style={{ color: theme.textMutedColor, fontSize: `${theme.captionSize}px` }}>Image</span>
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ padding: `${theme.inputPadding + 8}px` }}>
                            <h3 
                              style={{
                                fontSize: `${theme.bodySize}px`,
                                fontWeight: 700,
                                color: theme.textSecondaryColor,
                                marginBottom: '8px',
                              }}
                            >
                              {item.title}
                            </h3>
                            <p 
                              style={{
                                fontSize: `${theme.captionSize}px`,
                                color: theme.textMutedColor,
                                marginBottom: '16px',
                                lineHeight: theme.lineHeight,
                              }}
                            >
                              {item.description}
                            </p>

                            {/* Coming soon date */}
                            {item.comingSoonDate && (
                              <p 
                                className="flex items-center gap-2"
                                style={{
                                  fontSize: `${theme.captionSize}px`,
                                  color: theme.textSecondaryColor,
                                }}
                              >
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
