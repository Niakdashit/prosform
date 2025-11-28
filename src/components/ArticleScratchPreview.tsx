import React, { useRef, useCallback } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Image, Table } from 'lucide-react';
import { ScratchConfig, ScratchPrize } from './ScratchBuilder';
import { ArticleConfig } from './ArticleScratchBuilder';
import { SmartScratch } from './SmartScratch/SmartScratch';
import { useTheme, GOOGLE_FONTS, getButtonStyles } from '@/contexts/ThemeContext';

interface ArticleScratchPreviewProps {
  config: ScratchConfig;
  articleConfig: ArticleConfig;
  activeView: 'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose';
  onUpdateConfig: (updates: Partial<ScratchConfig>) => void;
  onUpdateArticleConfig: (updates: Partial<ArticleConfig>) => void;
  viewMode: 'desktop' | 'mobile';
  onViewChange: (view: 'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose') => void;
  prizes: ScratchPrize[];
}

/**
 * ArticleScratchPreview - Canvas rectangulaire pour le mode Article Scratch
 * Affiche le contenu dans un cadre avec bordures
 */
export const ArticleScratchPreview: React.FC<ArticleScratchPreviewProps> = ({
  config,
  articleConfig,
  activeView,
  onUpdateConfig,
  onUpdateArticleConfig,
  viewMode,
  onViewChange,
  prizes,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Get unified button styles from theme (same as WheelPreview)
  const unifiedButtonStyles = getButtonStyles(theme, viewMode);

  // Get font family CSS value
  const getFontFamily = (fontValue: string) => {
    const font = GOOGLE_FONTS.find(f => f.value === fontValue);
    return font ? `'${font.label}', ${font.category}` : 'Inter, sans-serif';
  };

  // Theme-based styles
  const themeStyles = {
    fontFamily: getFontFamily(theme.fontFamily),
    headingFontFamily: getFontFamily(theme.headingFontFamily),
    primaryColor: theme.primaryColor,
    textColor: theme.textColor,
    buttonColor: theme.buttonColor || theme.primaryColor,
    backgroundColor: theme.backgroundColor,
    borderRadius: theme.borderRadius,
  };

  // Get banner image from config
  const bannerImage = articleConfig.banner?.imageUrl;

  // Execute formatting command
  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
  }, []);

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'welcome':
        return (
          <div className="p-6">
            {/* Rich text toolbar */}
            <div 
              className="flex items-center gap-1 p-2 mb-4 rounded-lg bg-white border border-gray-200 flex-wrap"
            >
              <select className="h-8 px-2 text-sm border border-gray-200 rounded bg-white">
                <option>Taille ▾</option>
              </select>
              
              <div className="w-px h-6 bg-gray-200 mx-1" />
              
              <button onClick={() => exec('bold')} className="p-2 hover:bg-gray-100 rounded">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => exec('italic')} className="p-2 hover:bg-gray-100 rounded">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => exec('underline')} className="p-2 hover:bg-gray-100 rounded">
                <Underline className="w-4 h-4" />
              </button>
              
              <div className="w-px h-6 bg-gray-200 mx-1" />
              
              <button onClick={() => exec('insertUnorderedList')} className="p-2 hover:bg-gray-100 rounded">
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => exec('insertOrderedList')} className="p-2 hover:bg-gray-100 rounded">
                <ListOrdered className="w-4 h-4" />
              </button>
              
              <div className="w-px h-6 bg-gray-200 mx-1" />
              
              <button onClick={() => exec('justifyLeft')} className="p-2 hover:bg-gray-100 rounded">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button onClick={() => exec('justifyCenter')} className="p-2 hover:bg-gray-100 rounded">
                <AlignCenter className="w-4 h-4" />
              </button>
              <button onClick={() => exec('justifyRight')} className="p-2 hover:bg-gray-100 rounded">
                <AlignRight className="w-4 h-4" />
              </button>
              
              <div className="w-px h-6 bg-gray-200 mx-1" />
              
              <button onClick={() => exec('createLink', prompt('URL:') || '')} className="p-2 hover:bg-gray-100 rounded">
                <Link className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Image className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Table className="w-4 h-4" />
              </button>
              
              <div className="flex-1" />
              
              <button className="px-3 py-1 text-sm hover:bg-gray-100 rounded border border-gray-200">
                Source
              </button>
            </div>

            {/* Editable content */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="outline-none"
              style={{ 
                fontSize: '16px', 
                lineHeight: '1.6',
                fontFamily: themeStyles.fontFamily,
                color: themeStyles.textColor,
              }}
              dangerouslySetInnerHTML={{
                __html: config.welcomeScreen.subtitleHtml || 
                  `<p>Décrivez votre contenu ici...</p>`,
              }}
              onBlur={(e) => {
                onUpdateConfig({
                  welcomeScreen: {
                    ...config.welcomeScreen,
                    subtitleHtml: e.currentTarget.innerHTML,
                  },
                });
              }}
            />

            {/* CTA Button */}
            <div className="flex justify-center mt-6">
              <button
                className="font-semibold transition-all hover:opacity-90 hover:scale-105"
                style={unifiedButtonStyles}
              >
                {config.welcomeScreen.buttonText || 'Gratter'}
              </button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-6" style={{ fontFamily: themeStyles.fontFamily }}>
            {/* Form Title */}
            {config.contactForm.title && (
              <h2 
                className={`text-xl font-semibold text-center ${config.contactForm.subtitle ? 'mb-2' : 'mb-6'}`}
                style={{ 
                  fontFamily: themeStyles.headingFontFamily,
                  color: theme.primaryColor,
                }}
              >
                {config.contactForm.title}
              </h2>
            )}
            
            {/* Form Subtitle */}
            {config.contactForm.subtitle && (
              <p className="text-center mb-6" style={{ color: theme.textSecondaryColor }}>
                {config.contactForm.subtitle}
              </p>
            )}
            
            {/* Form Fields */}
            {config.contactForm.enabled && (
              <div className="max-w-md mx-auto space-y-4">
                {config.contactForm.fields.map((field, i) => (
                  <div key={i}>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: themeStyles.textColor }}
                    >
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                      className="w-full h-10 px-3 border border-gray-300 focus:outline-none focus:ring-2"
                      style={{ 
                        borderRadius: `${themeStyles.borderRadius}px`,
                        fontFamily: themeStyles.fontFamily,
                      }}
                    />
                  </div>
                ))}
                
                <div className="flex justify-center pt-4">
                  <button
                    className="font-semibold transition-all hover:opacity-90 hover:scale-105"
                    style={unifiedButtonStyles}
                  >
                    Valider
                  </button>
                </div>
              </div>
            )}
            
            {/* Form disabled message */}
            {!config.contactForm.enabled && (
              <p className="text-center text-gray-500 italic">
                Formulaire de contact désactivé
              </p>
            )}
          </div>
        );

      case 'scratch':
        return (
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            <h2 
              className="text-xl font-bold text-center mb-4"
              style={{ 
                fontFamily: themeStyles.headingFontFamily,
                color: theme.primaryColor,
              }}
            >
              {config.scratchScreen.title}
            </h2>
            <p className="text-center mb-6" style={{ color: theme.textSecondaryColor }}>
              {config.scratchScreen.subtitle}
            </p>
            
            <div 
              className="relative"
              style={{ 
                transform: viewMode === 'mobile' ? 'scale(0.8)' : 'scale(1)',
                transformOrigin: 'center center',
              }}
            >
              <SmartScratch
                width={config.scratchScreen.cardWidth}
                height={config.scratchScreen.cardHeight}
                scratchColor={config.scratchScreen.scratchColor}
                revealText="🎉 Félicitations !"
                threshold={config.scratchScreen.threshold}
                brushSize={config.scratchScreen.brushSize}
                onComplete={(percentage) => {
                  console.log('Scratch completed:', percentage);
                }}
              />
            </div>
          </div>
        );

      case 'ending-win':
      case 'ending-lose':
        const isWin = activeView === 'ending-win';
        const endingConfig = isWin ? config.endingWin : config.endingLose;
        
        return (
          <div className="p-6" style={{ fontFamily: themeStyles.fontFamily }}>
            {/* Rich text toolbar */}
            <div 
              className="flex items-center gap-1 p-2 mb-4 rounded-lg bg-white border border-gray-200 flex-wrap"
            >
              <select className="h-8 px-2 text-sm border border-gray-200 rounded bg-white">
                <option>Taille ▾</option>
              </select>
              
              <div className="w-px h-6 bg-gray-200 mx-1" />
              
              <button onClick={() => exec('bold')} className="p-2 hover:bg-gray-100 rounded">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => exec('italic')} className="p-2 hover:bg-gray-100 rounded">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => exec('underline')} className="p-2 hover:bg-gray-100 rounded">
                <Underline className="w-4 h-4" />
              </button>
              
              <div className="w-px h-6 bg-gray-200 mx-1" />
              
              <button onClick={() => exec('justifyLeft')} className="p-2 hover:bg-gray-100 rounded">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button onClick={() => exec('justifyCenter')} className="p-2 hover:bg-gray-100 rounded">
                <AlignCenter className="w-4 h-4" />
              </button>
              <button onClick={() => exec('justifyRight')} className="p-2 hover:bg-gray-100 rounded">
                <AlignRight className="w-4 h-4" />
              </button>
              
              <div className="flex-1" />
              
              <button className="px-3 py-1 text-sm hover:bg-gray-100 rounded border border-gray-200">
                Source
              </button>
            </div>

            {/* Title with theme color */}
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: themeStyles.headingFontFamily,
                color: theme.primaryColor,
              }}
            >
              {endingConfig.title}
            </h2>
            
            {/* Subtitle with theme color */}
            <p style={{ color: theme.textSecondaryColor }}>
              {endingConfig.subtitle}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Calculate canvas width based on viewMode
  const canvasWidth = viewMode === 'mobile' ? 375 : articleConfig.frameWidth;

  return (
    <div 
      className="min-h-full flex items-start justify-center p-8"
      style={{ 
        backgroundColor: articleConfig.pageBackgroundColor || '#f3f4f6',
        backgroundImage: articleConfig.pageBackgroundImage ? `url(${articleConfig.pageBackgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Article Canvas */}
      <div
        className="relative"
        style={{
          width: `${canvasWidth}px`,
          backgroundColor: articleConfig.frameColor,
          borderRadius: `${articleConfig.frameBorderRadius}px`,
          borderWidth: `${articleConfig.frameBorderWidth}px`,
          borderColor: articleConfig.frameBorderColor,
          borderStyle: 'solid',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        {articleConfig.headerImage && (
          <img
            src={articleConfig.headerImage}
            alt="Header"
            className="w-full"
            style={{ 
              objectFit: articleConfig.headerFitMode === 'fit' ? 'contain' : 'cover',
              maxHeight: '150px',
            }}
          />
        )}

        {/* Banner */}
        {bannerImage && (
          <img
            src={bannerImage}
            alt="Banner"
            className="w-full"
            style={{ height: 'auto', display: 'block' }}
          />
        )}

        {/* Content */}
        {renderContent()}

        {/* Footer */}
        {articleConfig.footerImage && (
          <img
            src={articleConfig.footerImage}
            alt="Footer"
            className="w-full"
            style={{ 
              objectFit: articleConfig.footerFitMode === 'fit' ? 'contain' : 'cover',
              maxHeight: '150px',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ArticleScratchPreview;
