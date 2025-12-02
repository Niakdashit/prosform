import { useState, useRef, useEffect } from "react";
import { CatalogConfig, CatalogItem, CatalogCategory } from "./CatalogBuilder";
import { useTheme, getButtonStyles, GOOGLE_FONTS } from "@/contexts/ThemeContext";
import { CampaignHeader, CampaignFooter } from "./campaign";
import { EditableTextBlock } from "./EditableTextBlock";
import { FloatingToolbar } from "./FloatingToolbar";
import { ImageUploadModal } from "./ImageUploadModal";
import { ImagePlus, Trash2 } from "lucide-react";

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
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [uploadingImageForItem, setUploadingImageForItem] = useState<string | null>(null);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Custom font sizes for inline editing
  const [customFontSizes, setCustomFontSizes] = useState<Record<string, number>>({});

  // Listen for FloatingToolbar style events
  useEffect(() => {
    if (isReadOnly) return;

    const handleToolbarStyle = (e: CustomEvent) => {
      const { field, updates } = e.detail;
      
      if (updates.fontSize) {
        setCustomFontSizes(prev => ({
          ...prev,
          [field]: updates.fontSize
        }));
      }
    };

    document.addEventListener('floatingToolbarStyle', handleToolbarStyle as EventListener);
    return () => {
      document.removeEventListener('floatingToolbarStyle', handleToolbarStyle as EventListener);
    };
  }, [isReadOnly]);

  // Update category title
  const updateCategoryTitle = (categoryId: string, newTitle: string) => {
    const updatedCategories = config.categories.map(cat =>
      cat.id === categoryId ? { ...cat, title: newTitle } : cat
    );
    onUpdateConfig({ categories: updatedCategories });
  };

  const containerClass = "w-full";

  // Filter items by category
  const getFilteredItems = () => {
    if (!selectedCategoryId) {
      return config.items;
    }
    return config.items.filter(item => item.categoryId === selectedCategoryId);
  };

  const filteredItems = getFilteredItems();

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

  // Render catalog item card
  const renderCatalogCard = (item: CatalogItem, isComingSoon: boolean = false) => (
    <div
      key={item.id}
      onClick={() => !isReadOnly && !editingField && onSelectItem(item.id)}
      className={`overflow-hidden transition-all flex flex-col ${
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
        className={`relative w-full h-48 flex items-center justify-center flex-shrink-0 ${isComingSoon ? "grayscale" : ""}`}
        style={{
          backgroundColor: theme.backgroundSecondaryColor,
          ...(item.image ? { 
            backgroundImage: `url(${item.image})`, 
            backgroundSize: "cover", 
            backgroundPosition: "center" 
          } : {}),
        }}
        onMouseEnter={() => !isReadOnly && setHoveredImageId(item.id)}
        onMouseLeave={() => setHoveredImageId(null)}
      >
        {!item.image && (
          <span style={{ color: theme.textMutedColor, fontSize: `${theme.captionSize}px` }}>Image</span>
        )}
        
        {/* Image hover actions */}
        {!isReadOnly && hoveredImageId === item.id && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUploadingImageForItem(item.id);
              }}
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
            >
              <ImagePlus className="w-5 h-5 text-gray-700" />
            </button>
            {item.image && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateItem(item.id, { image: '' });
                }}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div 
        className="flex flex-col flex-1"
        style={{ padding: `${theme.inputPadding + 8}px` }}
      >
        {/* Text area with fixed height and scroll if needed */}
        <div className="flex-1 min-h-[100px] max-h-[120px] overflow-x-hidden overflow-y-auto scrollbar-hide">
          <div style={{ marginBottom: '8px' }}>
            <EditableTextBlock
              value={item.title}
              onChange={(value) => onUpdateItem(item.id, { title: value })}
              isEditing={editingField === `item-title-${item.id}`}
              isReadOnly={isReadOnly}
              onFocus={() => setEditingField(`item-title-${item.id}`)}
              onBlur={() => setEditingField(null)}
              fieldType="title"
              showSparkles={false}
              showClear={false}
              style={{
                fontSize: `${theme.bodySize}px`,
                fontWeight: 700,
                color: isComingSoon ? theme.textSecondaryColor : theme.textColor,
              }}
            />
          </div>
          <EditableTextBlock
            value={item.description}
            onChange={(value) => onUpdateItem(item.id, { description: value })}
            isEditing={editingField === `item-desc-${item.id}`}
            isReadOnly={isReadOnly}
            onFocus={() => setEditingField(`item-desc-${item.id}`)}
            onBlur={() => setEditingField(null)}
            fieldType="subtitle"
            showSparkles={false}
            showClear={false}
            style={{
              fontSize: `${theme.captionSize}px`,
              color: isComingSoon ? theme.textMutedColor : theme.textSecondaryColor,
              lineHeight: theme.lineHeight,
            }}
          />
        </div>

        {/* Button or Coming soon date - always at bottom */}
        <div className="mt-4 flex-shrink-0">
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
              <EditableTextBlock
                value={item.buttonText}
                onChange={(value) => onUpdateItem(item.id, { buttonText: value })}
                isEditing={editingField === `item-btn-${item.id}`}
                isReadOnly={isReadOnly}
                onFocus={() => setEditingField(`item-btn-${item.id}`)}
                onBlur={() => setEditingField(null)}
                fieldType="button"
                showSparkles={false}
                showClear={false}
                style={{ color: 'inherit', fontWeight: 'inherit' }}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={viewMode === 'mobile' ? "w-full h-full flex items-center justify-center" : "w-full h-full flex items-start justify-center overflow-auto"}>
      <div 
        ref={previewContainerRef}
        className="relative overflow-auto transition-all duration-300 flex flex-col scrollbar-hide"
        style={{
          backgroundColor: theme.backgroundColor,
          fontFamily: getFontFamily(theme.fontFamily),
          width: viewMode === 'desktop' ? `${config.containerWidth || 1200}px` : '375px',
          maxWidth: viewMode === 'desktop' ? '100%' : '375px',
          minWidth: viewMode === 'desktop' ? undefined : '375px',
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

        {/* Category Navigation */}
        {config.showCategoryNav && config.categories && config.categories.length > 0 && (
          <div 
            className="flex items-center justify-center gap-6 py-3 border-b overflow-x-auto scrollbar-hide"
            style={{ 
              backgroundColor: theme.surfaceColor,
              borderColor: theme.borderColor,
            }}
          >
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-sm font-medium whitespace-nowrap transition-colors"
              style={{ 
                color: selectedCategoryId === null ? theme.primaryColor : theme.textSecondaryColor,
                borderBottom: selectedCategoryId === null ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                paddingBottom: '4px',
              }}
            >
              Tout
            </button>
            {config.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className="text-sm font-medium whitespace-nowrap transition-colors"
                style={{ 
                  color: selectedCategoryId === cat.id ? theme.primaryColor : theme.textSecondaryColor,
                  borderBottom: selectedCategoryId === cat.id ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                  paddingBottom: '4px',
                }}
              >
                {cat.title}
              </button>
            ))}
          </div>
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
                <div style={{ marginBottom: '8px' }}>
                  <EditableTextBlock
                    value={config.catalogTitle}
                    onChange={(value) => onUpdateConfig({ catalogTitle: value })}
                    isEditing={editingField === 'catalog-title'}
                    isReadOnly={isReadOnly}
                    onFocus={() => setEditingField('catalog-title')}
                    onBlur={() => setEditingField(null)}
                    fieldType="title"
                    showSparkles={false}
                    showClear={false}
                    style={{
                      fontFamily: getFontFamily(theme.headingFontFamily),
                      fontSize: `${customFontSizes['title'] || theme.headingSize}px`,
                      fontWeight: theme.headingWeight === 'extrabold' ? 800 : theme.headingWeight === 'bold' ? 700 : theme.headingWeight === 'semibold' ? 600 : 500,
                      color: theme.primaryColor,
                      lineHeight: theme.lineHeight,
                      letterSpacing: `${theme.letterSpacing}px`,
                    }}
                  />
                </div>
                <EditableTextBlock
                  value={config.catalogSubtitle}
                  onChange={(value) => onUpdateConfig({ catalogSubtitle: value })}
                  isEditing={editingField === 'catalog-subtitle'}
                  isReadOnly={isReadOnly}
                  onFocus={() => setEditingField('catalog-subtitle')}
                  onBlur={() => setEditingField(null)}
                  fieldType="subtitle"
                  showSparkles={false}
                  showClear={false}
                  style={{
                    fontSize: `${customFontSizes['subtitle'] || theme.subheadingSize}px`,
                    color: theme.textSecondaryColor,
                    lineHeight: theme.lineHeight,
                  }}
                />
              </div>

              {/* Render items grouped by category */}
              {config.categories && config.categories.length > 0 ? (
                config.categories.map((category) => {
                  const categoryItems = filteredItems.filter(item => item.categoryId === category.id);
                  if (categoryItems.length === 0) return null;
                  
                  // Check if this is a "coming soon" type category
                  const isComingSoonCategory = category.title.toLowerCase().includes('prochainement');
                  
                  return (
                    <div key={category.id} className="mb-12">
                      <div className="mb-6">
                        <EditableTextBlock
                          value={category.title}
                          onChange={(value) => updateCategoryTitle(category.id, value)}
                          isEditing={editingField === `category-${category.id}`}
                          isReadOnly={isReadOnly}
                          onFocus={() => setEditingField(`category-${category.id}`)}
                          onBlur={() => setEditingField(null)}
                          fieldType="title"
                          showSparkles={false}
                          showClear={false}
                          style={{
                            fontFamily: getFontFamily(theme.headingFontFamily),
                            fontSize: `${theme.subheadingSize + 4}px`,
                            fontWeight: theme.headingWeight === 'extrabold' ? 800 : theme.headingWeight === 'bold' ? 700 : 600,
                            color: theme.primaryColor,
                          }}
                        />
                      </div>
                      <div 
                        className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"}`}
                        style={{ gap: `${theme.questionSpacing * 24}px` }}
                      >
                        {categoryItems.map((item) => renderCatalogCard(item, isComingSoonCategory || item.isComingSoon))}
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback: render without categories */
                <div 
                  className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} mb-12`}
                  style={{ gap: `${theme.questionSpacing * 24}px` }}
                >
                  {filteredItems.map((item) => renderCatalogCard(item, item.isComingSoon))}
                </div>
              )}
              
              {/* Items without category */}
              {config.categories && config.categories.length > 0 && filteredItems.filter(item => !item.categoryId).length > 0 && (
                <div className="mb-12">
                  <div 
                    className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"}`}
                    style={{ gap: `${theme.questionSpacing * 24}px` }}
                  >
                    {filteredItems.filter(item => !item.categoryId).map((item) => renderCatalogCard(item, item.isComingSoon))}
                  </div>
                </div>
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

        {/* Floating Toolbar */}
        {!isReadOnly && (
          <FloatingToolbar 
            containerRef={previewContainerRef}
            onUpdateStyle={() => {}}
          />
        )}
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        open={uploadingImageForItem !== null}
        onOpenChange={(open) => !open && setUploadingImageForItem(null)}
        onImageSelect={(imageData) => {
          if (uploadingImageForItem) {
            onUpdateItem(uploadingImageForItem, { image: imageData });
            setUploadingImageForItem(null);
          }
        }}
      />
    </div>
  );
};
