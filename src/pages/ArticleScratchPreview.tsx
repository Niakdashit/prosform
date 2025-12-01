import { useEffect, useState } from "react";
import { ScratchConfig } from "@/components/ScratchBuilder";
import { ArticleConfig } from "@/components/ArticleWheelBuilder";
import { ThemeSettings, GOOGLE_FONTS } from "@/contexts/ThemeContext";
import SmartScratch from "@/components/SmartScratch/SmartScratch";

const ArticleScratchPreview = () => {
  const [config, setConfig] = useState<ScratchConfig | null>(null);
  const [articleConfig, setArticleConfig] = useState<ArticleConfig | null>(null);
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    // Load configs from localStorage
    const savedConfig = localStorage.getItem('article-scratch-config');
    const savedArticleConfig = localStorage.getItem('article-scratch-article-config');
    const savedTheme = localStorage.getItem('article-scratch-theme');
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    if (savedArticleConfig) {
      setArticleConfig(JSON.parse(savedArticleConfig));
    }
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }

    // Detect mobile device
    const isMobileDevice = window.innerWidth < 768;
    if (isMobileDevice) {
      setViewMode('mobile');
    }
  }, []);

  // Get font family CSS value
  const getFontFamily = (fontValue: string) => {
    const font = GOOGLE_FONTS.find(f => f.value === fontValue);
    return font ? `'${font.label}', ${font.category}` : 'Inter, sans-serif';
  };

  if (!config || !articleConfig) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#3d3731' }}>
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  const handleNext = () => {
    if (activeView === 'welcome') {
      if (config.contactForm?.enabled) {
        setActiveView('contact');
      } else {
        setActiveView('scratch');
      }
    } else if (activeView === 'contact') {
      setActiveView('scratch');
    }
  };

  const handleScratchComplete = (isWin: boolean) => {
    setActiveView(isWin ? 'ending-win' : 'ending-lose');
  };

  const canvasWidth = viewMode === 'mobile' ? 375 : articleConfig.frameWidth;

  // Theme-based styles
  const themeStyles = theme ? {
    fontFamily: getFontFamily(theme.fontFamily),
    headingFontFamily: getFontFamily(theme.headingFontFamily),
    primaryColor: theme.primaryColor,
    textColor: theme.textColor,
    buttonColor: theme.buttonColor || theme.primaryColor,
    backgroundColor: theme.backgroundColor,
    borderRadius: theme.borderRadius,
  } : {
    fontFamily: 'Inter, sans-serif',
    headingFontFamily: 'Inter, sans-serif',
    primaryColor: '#3d3731',
    textColor: '#1f2937',
    buttonColor: '#000000',
    backgroundColor: '#ffffff',
    borderRadius: 8,
  };

  const renderContent = () => {
    switch (activeView) {
      case 'welcome':
        return (
          <div className="p-6" style={{ fontFamily: themeStyles.fontFamily }}>
            <div 
              style={{ 
                fontSize: '16px', 
                lineHeight: '1.6',
                color: themeStyles.textColor,
              }}
              dangerouslySetInnerHTML={{
                __html: config.welcomeScreen.subtitleHtml || '<p>Décrivez votre contenu ici...</p>'
              }}
            />
            <div className="flex justify-center mt-6">
              <button
                onClick={handleNext}
                className="px-8 py-3 font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: theme?.buttonColor || articleConfig.ctaBackgroundColor,
                  color: articleConfig.ctaTextColor,
                  borderRadius: `${theme?.borderRadius || articleConfig.ctaBorderRadius}px`,
                  fontFamily: themeStyles.fontFamily,
                }}
              >
                {config.welcomeScreen.buttonText || 'Commencer à gratter'}
              </button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-6" style={{ fontFamily: themeStyles.fontFamily }}>
            {config.contactForm.title && (
              <h2 
                className={`text-xl font-semibold text-center ${config.contactForm.subtitle ? 'mb-2' : 'mb-6'}`}
                style={{ 
                  fontFamily: themeStyles.headingFontFamily,
                  color: themeStyles.textColor,
                }}
              >
                {config.contactForm.title}
              </h2>
            )}
            {config.contactForm.subtitle && (
              <p className="text-center mb-6" style={{ color: theme?.textSecondaryColor || '#6b7280' }}>
                {config.contactForm.subtitle}
              </p>
            )}
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
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleNext}
                  className="px-8 py-3 font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: theme?.buttonColor || articleConfig.ctaBackgroundColor,
                    color: articleConfig.ctaTextColor,
                    borderRadius: `${theme?.borderRadius || articleConfig.ctaBorderRadius}px`,
                    fontFamily: themeStyles.fontFamily,
                  }}
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        );

      case 'scratch':
        return (
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            <SmartScratch
              width={config.scratchScreen.cardWidth}
              height={config.scratchScreen.cardHeight}
              scratchColor={config.scratchScreen.scratchColor}
              scratchImage={config.scratchScreen.scratchImage}
              borderRadius={config.scratchScreen.cardBorderRadius}
              borderWidth={config.scratchScreen.cardBorderWidth}
              borderColor={config.scratchScreen.cardBorderColor}
              revealText="🎉 Félicitations !"
              threshold={config.scratchScreen.threshold}
              brushSize={config.scratchScreen.brushSize}
              onComplete={(percentage) => {
                // Simulate win/lose based on random
                const isWin = Math.random() > 0.3;
                setTimeout(() => handleScratchComplete(isWin), 500);
              }}
            />
          </div>
        );

      case 'ending-win':
        return (
          <div className="p-6 text-center" style={{ fontFamily: themeStyles.fontFamily }}>
            <div 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: themeStyles.headingFontFamily,
                color: theme?.primaryColor || '#16a34a',
              }}
              dangerouslySetInnerHTML={{
                __html: config.endingWin.titleHtml || config.endingWin.title,
              }}
            />
            <div 
              style={{ color: theme?.textSecondaryColor || '#6b7280' }}
              dangerouslySetInnerHTML={{
                __html: config.endingWin.subtitleHtml || config.endingWin.subtitle,
              }}
            />
          </div>
        );

      case 'ending-lose':
        return (
          <div className="p-6 text-center" style={{ fontFamily: themeStyles.fontFamily }}>
            <div 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: themeStyles.headingFontFamily,
                color: themeStyles.textColor,
              }}
              dangerouslySetInnerHTML={{
                __html: config.endingLose.titleHtml || config.endingLose.title,
              }}
            />
            <div 
              style={{ color: theme?.textSecondaryColor || '#6b7280' }}
              dangerouslySetInnerHTML={{
                __html: config.endingLose.subtitleHtml || config.endingLose.subtitle,
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: articleConfig.pageBackgroundColor || '#3d3731' }}
    >
      <div
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
              borderTopLeftRadius: `${articleConfig.frameBorderRadius}px`,
              borderTopRightRadius: `${articleConfig.frameBorderRadius}px`,
            }}
          />
        )}

        {/* Banner */}
        {articleConfig.banner?.imageUrl && (
          <img
            src={articleConfig.banner.imageUrl}
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
              borderBottomLeftRadius: `${articleConfig.frameBorderRadius}px`,
              borderBottomRightRadius: `${articleConfig.frameBorderRadius}px`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ArticleScratchPreview;
