import { useState } from "react";
import { CatalogConfig, CatalogItem } from "./CatalogBuilder";
import { useTheme, getButtonStyles, GOOGLE_FONTS } from "@/contexts/ThemeContext";
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
  onUpdateConfig,
  viewMode,
  selectedItemId,
  onSelectItem,
  onUpdateItem,
  isReadOnly = false,
}: CatalogPreviewProps) => {
  const { theme } = useTheme();
  const buttonStyles = getButtonStyles(theme, viewMode);
  const [editingField, setEditingField] = useState<string | null>(null);

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

  // Inline editable text component
  const EditableText = ({ 
    value, 
    fieldId, 
    onSave,
    style,
    className = "",
    multiline = false,
  }: { 
    value: string; 
    fieldId: string; 
    onSave: (value: string) => void;
    style?: React.CSSProperties;
    className?: string;
    multiline?: boolean;
  }) => {
    const isEditing = editingField === fieldId;
    
    if (isReadOnly) {
      return multiline ? (
        <p style={style} className={className}>{value}</p>
      ) : (
        <span style={style} className={className}>{value}</span>
      );
    }

    if (isEditing) {
      return multiline ? (
        <textarea
          autoFocus
          defaultValue={value}
          className={`bg-transparent border-none outline-none resize-none w-full ${className}`}
          style={{ ...style, minHeight: '60px' }}
          onBlur={(e) => {
            onSave(e.target.value);
            setEditingField(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditingField(null);
            }
          }}
        />
      ) : (
        <input
          autoFocus
          defaultValue={value}
          className={`bg-transparent border-none outline-none w-full ${className}`}
          style={style}
          onBlur={(e) => {
            onSave(e.target.value);
            setEditingField(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              if (e.key === 'Enter') {
                onSave((e.target as HTMLInputElement).value);
              }
              setEditingField(null);
            }
          }}
        />
      );
    }

    return multiline ? (
      <p 
        style={style} 
        className={`${className} cursor-text hover:ring-2 hover:ring-primary/30 rounded px-1 -mx-1 transition-all`}
        onClick={(e) => {
          e.stopPropagation();
          setEditingField(fieldId);
        }}
      >
        {value}
      </p>
    ) : (
      <span 
        style={style} 
        className={`${className} cursor-text hover:ring-2 hover:ring-primary/30 rounded px-1 -mx-1 transition-all inline-block`}
        onClick={(e) => {
          e.stopPropagation();
          setEditingField(fieldId);
        }}
      >
        {value}
      </span>
    );
  };

  // Render catalog item card
  const renderCatalogCard = (item: CatalogItem, isComingSoon: boolean = false) => (
    <div
      key={item.id}
      onClick={() => !isReadOnly && !editingField && onSelectItem(item.id)}
      className={`overflow-hidden transition-all ${
        !isReadOnly ? "cursor-pointer" : ""
      } ${isComingSoon ? "opacity-60" : ""}`}
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
        className={`w-full h-48 flex items-center justify-center ${isComingSoon ? "grayscale" : ""}`}
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
            color: isComingSoon ? theme.textSecondaryColor : theme.textColor,
            marginBottom: '8px',
          }}
        >
          <EditableText
            value={item.title}
            fieldId={`item-title-${item.id}`}
            onSave={(value) => onUpdateItem(item.id, { title: value })}
            style={{
              fontSize: `${theme.bodySize}px`,
              fontWeight: 700,
              color: isComingSoon ? theme.textSecondaryColor : theme.textColor,
            }}
          />
        </h3>
        <EditableText
          value={item.description}
          fieldId={`item-desc-${item.id}`}
          onSave={(value) => onUpdateItem(item.id, { description: value })}
          multiline
          style={{
            fontSize: `${theme.captionSize}px`,
            color: isComingSoon ? theme.textMutedColor : theme.textSecondaryColor,
            marginBottom: '16px',
            lineHeight: theme.lineHeight,
            display: 'block',
          }}
        />

        {/* Button or Coming soon date */}
        {isComingSoon && item.comingSoonDate ? (
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
        ) : !isComingSoon && (
          <button
            className="w-full uppercase transition-opacity hover:opacity-90"
            style={{
              ...buttonStyles,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <EditableText
              value={item.buttonText}
              fieldId={`item-btn-${item.id}`}
              onSave={(value) => onUpdateItem(item.id, { buttonText: value })}
              style={{ color: 'inherit', fontWeight: 'inherit' }}
            />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={viewMode === 'mobile' ? "w-full h-full flex items-center justify-center" : "w-full h-full overflow-auto"}>
      <div 
        className="relative overflow-auto transition-all duration-300 flex flex-col scrollbar-hide"
        style={{
          backgroundColor: theme.backgroundColor,
          fontFamily: getFontFamily(theme.fontFamily),
          width: viewMode === 'desktop' ? '100%' : '375px',
          minWidth: viewMode === 'desktop' ? undefined : '375px',
          maxWidth: viewMode === 'desktop' ? undefined : '375px',
          height: viewMode === 'mobile' ? '667px' : undefined,
          minHeight: viewMode === 'mobile' ? '667px' : '100%',
          maxHeight: viewMode === 'mobile' ? '667px' : undefined,
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
                  <EditableText
                    value={config.catalogTitle}
                    fieldId="catalog-title"
                    onSave={(value) => onUpdateConfig({ catalogTitle: value })}
                    style={{
                      fontFamily: getFontFamily(theme.headingFontFamily),
                      fontSize: `${theme.headingSize}px`,
                      fontWeight: theme.headingWeight === 'extrabold' ? 800 : theme.headingWeight === 'bold' ? 700 : theme.headingWeight === 'semibold' ? 600 : 500,
                      color: theme.primaryColor,
                      lineHeight: theme.lineHeight,
                      letterSpacing: `${theme.letterSpacing}px`,
                    }}
                  />
                </h1>
                <EditableText
                  value={config.catalogSubtitle}
                  fieldId="catalog-subtitle"
                  onSave={(value) => onUpdateConfig({ catalogSubtitle: value })}
                  multiline
                  style={{
                    fontSize: `${theme.subheadingSize}px`,
                    color: theme.textSecondaryColor,
                    lineHeight: theme.lineHeight,
                    display: 'block',
                  }}
                />
              </div>

              {/* Active campaigns */}
              <div 
                className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} mb-12`}
                style={{ gap: `${theme.questionSpacing * 24}px` }}
              >
                {config.items.filter(item => !item.isComingSoon).map((item) => renderCatalogCard(item, false))}
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
                    {config.items.filter(item => item.isComingSoon).map((item) => renderCatalogCard(item, true))}
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
  );
};
