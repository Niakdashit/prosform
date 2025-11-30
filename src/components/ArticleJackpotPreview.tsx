import React, { useCallback } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { JackpotConfig, JackpotPrize } from './JackpotBuilder';
import { ArticleConfig } from './ArticleJackpotBuilder';
import { useTheme, GOOGLE_FONTS, getButtonStyles } from '@/contexts/ThemeContext';
import SmartJackpot from './SmartJackpot/SmartJackpot';

interface ArticleJackpotPreviewProps {
  config: JackpotConfig;
  articleConfig: ArticleConfig;
  activeView: 'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose';
  onUpdateConfig: (updates: Partial<JackpotConfig>) => void;
  onUpdateArticleConfig: (updates: Partial<ArticleConfig>) => void;
  viewMode: 'desktop' | 'mobile';
  onViewChange: (view: 'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose') => void;
  prizes: JackpotPrize[];
}

export const ArticleJackpotPreview: React.FC<ArticleJackpotPreviewProps> = ({
  config,
  articleConfig,
  activeView,
  onUpdateConfig,
  onUpdateArticleConfig,
  viewMode,
  onViewChange,
  prizes,
}) => {
  const { theme } = useTheme();
  const unifiedButtonStyles = getButtonStyles(theme, viewMode);

  const getFontFamily = (fontValue: string) => {
    const font = GOOGLE_FONTS.find(f => f.value === fontValue);
    return font ? `'${font.label}', ${font.category}` : 'Inter, sans-serif';
  };

  const themeStyles = {
    fontFamily: getFontFamily(theme.fontFamily),
    headingFontFamily: getFontFamily(theme.headingFontFamily),
    primaryColor: theme.primaryColor,
    textColor: theme.textColor,
    buttonColor: theme.buttonColor || theme.primaryColor,
    backgroundColor: theme.backgroundColor,
    borderRadius: theme.borderRadius,
  };

  const bannerImage = articleConfig.banner?.imageUrl;

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'welcome':
        return (
          <div className="p-6">
            <div className="flex items-center gap-1 p-2 mb-4 rounded-lg bg-white border border-gray-200 flex-wrap">
              <select 
                className="h-8 px-2 text-sm border border-gray-200 rounded bg-white"
                onChange={(e) => exec('fontSize', e.target.value)}
              >
                <option value="3">Taille ▾</option>
                <option value="1">Petit</option>
                <option value="3">Normal</option>
                <option value="5">Grand</option>
                <option value="7">Très grand</option>
              </select>
              
              <div className="w-px h-6 bg-gray-200 mx-1" />
              
              <button onClick={() => exec('bold')} className="p-2 hover:bg-gray-100 rounded" title="Gras">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => exec('italic')} className="p-2 hover:bg-gray-100 rounded" title="Italique">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => exec('underline')} className="p-2 hover:bg-gray-100 rounded" title="Souligné">
                <Underline className="w-4 h-4" />
              </button>
              
              <div className="w-px h-6 bg-gray-200 mx-1" />
              
              <button onClick={() => exec('justifyLeft')} className="p-2 hover:bg-gray-100 rounded" title="Gauche">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button onClick={() => exec('justifyCenter')} className="p-2 hover:bg-gray-100 rounded" title="Centre">
                <AlignCenter className="w-4 h-4" />
              </button>
              <button onClick={() => exec('justifyRight')} className="p-2 hover:bg-gray-100 rounded" title="Droite">
                <AlignRight className="w-4 h-4" />
              </button>
              
              <div className="flex-1" />
              
              <button className="px-3 py-1 text-sm hover:bg-gray-100 rounded border border-gray-200">
                Source
              </button>
            </div>

            <div
              contentEditable
              suppressContentEditableWarning
              className="outline-none min-h-[100px]"
              style={{ fontSize: '16px', lineHeight: '1.6', color: themeStyles.textColor, fontFamily: themeStyles.fontFamily }}
              dangerouslySetInnerHTML={{
                __html: config.welcomeScreen.subtitleHtml || config.welcomeScreen.subtitle || '<p>Décrivez votre jeu ici...</p>'
              }}
              onBlur={(e) => {
                onUpdateConfig({
                  welcomeScreen: {
                    ...config.welcomeScreen,
                    subtitle: e.currentTarget.textContent || '',
                    subtitleHtml: e.currentTarget.innerHTML,
                  }
                });
              }}
            />

            <div className="flex justify-center mt-6">
              <button className="font-semibold transition-all hover:opacity-90 hover:scale-105" style={unifiedButtonStyles}>
                {config.welcomeScreen.buttonText}
              </button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-6" style={{ fontFamily: themeStyles.fontFamily }}>
            {config.contactForm.enabled && (
              <div className="max-w-md mx-auto">
                {config.contactForm.title && (
                  <h2 className="text-xl font-semibold text-center mb-2" style={{ fontFamily: themeStyles.headingFontFamily, color: themeStyles.textColor }}>
                    {config.contactForm.title}
                  </h2>
                )}
                {config.contactForm.subtitle && (
                  <p className="text-center mb-6" style={{ color: theme.textSecondaryColor }}>
                    {config.contactForm.subtitle}
                  </p>
                )}
                
                <div className="space-y-4">
                  {config.contactForm.fields.map((field, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium mb-1" style={{ color: themeStyles.textColor }}>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center pt-4">
                  <button className="font-semibold transition-all hover:opacity-90 hover:scale-105" style={unifiedButtonStyles}>
                    Valider
                  </button>
                </div>
              </div>
            )}
            
            {!config.contactForm.enabled && (
              <p className="text-center text-gray-500 italic">Formulaire de contact désactivé</p>
            )}
          </div>
        );

      case 'jackpot':
        return (
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            {config.jackpotScreen.title && (
              <h2 
                className="text-2xl font-bold mb-6 text-center"
                style={{ fontFamily: themeStyles.headingFontFamily, color: theme.primaryColor }}
                dangerouslySetInnerHTML={{ __html: config.jackpotScreen.titleHtml || config.jackpotScreen.title }}
              />
            )}
            
            <div style={{ transform: viewMode === 'mobile' ? 'scale(0.7)' : 'scale(0.85)', transformOrigin: 'center center' }}>
              <SmartJackpot
                symbols={config.symbols.map(s => s.emoji)}
                onWin={(result) => console.log('Jackpot win:', result)}
                onLose={() => console.log('Jackpot lose')}
                spinDuration={config.jackpotScreen.spinDuration}
              />
            </div>
          </div>
        );

      case 'ending-win':
      case 'ending-lose':
        const isWin = activeView === 'ending-win';
        const endingConfig = isWin ? config.endingWin : config.endingLose;
        const endingKey = isWin ? 'endingWin' : 'endingLose';
        
        return (
          <div className="p-6" style={{ fontFamily: themeStyles.fontFamily }}>
            <div className="flex items-center gap-1 p-2 mb-4 rounded-lg bg-white border border-gray-200 flex-wrap">
              <select className="h-8 px-2 text-sm border border-gray-200 rounded bg-white" onChange={(e) => exec('fontSize', e.target.value)}>
                <option value="3">Taille ▾</option>
                <option value="1">Petit</option>
                <option value="3">Normal</option>
                <option value="5">Grand</option>
                <option value="7">Très grand</option>
              </select>

              <div className="w-px h-6 bg-gray-200 mx-1" />

              <button onClick={() => exec('bold')} className="p-2 hover:bg-gray-100 rounded" title="Gras">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => exec('italic')} className="p-2 hover:bg-gray-100 rounded" title="Italique">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => exec('underline')} className="p-2 hover:bg-gray-100 rounded" title="Souligné">
                <Underline className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-200 mx-1" />

              <button onClick={() => exec('justifyLeft')} className="p-2 hover:bg-gray-100 rounded" title="Gauche">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button onClick={() => exec('justifyCenter')} className="p-2 hover:bg-gray-100 rounded" title="Centre">
                <AlignCenter className="w-4 h-4" />
              </button>
              <button onClick={() => exec('justifyRight')} className="p-2 hover:bg-gray-100 rounded" title="Droite">
                <AlignRight className="w-4 h-4" />
              </button>

              <div className="flex-1" />

              <button className="px-3 py-1 text-sm hover:bg-gray-100 rounded border border-gray-200">Source</button>
            </div>

            <div
              contentEditable
              suppressContentEditableWarning
              className="text-2xl font-bold mb-4 outline-none"
              style={{ fontFamily: themeStyles.headingFontFamily, color: theme.primaryColor }}
              dangerouslySetInnerHTML={{ __html: endingConfig.titleHtml || endingConfig.title }}
              onBlur={(e) => {
                onUpdateConfig({
                  [endingKey]: { ...endingConfig, title: e.currentTarget.textContent || '', titleHtml: e.currentTarget.innerHTML }
                });
              }}
            />

            <div
              contentEditable
              suppressContentEditableWarning
              className="outline-none"
              style={{ color: theme.textSecondaryColor, fontFamily: themeStyles.fontFamily }}
              dangerouslySetInnerHTML={{ __html: endingConfig.subtitleHtml || endingConfig.subtitle }}
              onBlur={(e) => {
                onUpdateConfig({
                  [endingKey]: { ...endingConfig, subtitle: e.currentTarget.textContent || '', subtitleHtml: e.currentTarget.innerHTML }
                });
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const canvasWidth = viewMode === 'mobile' ? 375 : articleConfig.frameWidth;

  return (
    <div className="flex-1 flex items-start justify-center p-6 overflow-auto bg-gray-100">
      <div
        style={{
          width: `${canvasWidth}px`,
          backgroundColor: articleConfig.frameColor,
          borderRadius: `${articleConfig.frameBorderRadius}px`,
          borderWidth: `${articleConfig.frameBorderWidth}px`,
          borderColor: articleConfig.frameBorderColor,
          borderStyle: 'solid',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {articleConfig.headerImage && (
          <img src={articleConfig.headerImage} alt="Header" className="w-full" style={{ objectFit: articleConfig.headerFitMode === 'fit' ? 'contain' : 'cover', maxHeight: '150px' }} />
        )}

        {bannerImage && (
          <img src={bannerImage} alt="Banner" className="w-full" style={{ height: 'auto', display: 'block' }} />
        )}

        {renderContent()}

        {articleConfig.footerImage && (
          <img src={articleConfig.footerImage} alt="Footer" className="w-full" style={{ objectFit: articleConfig.footerFitMode === 'fit' ? 'contain' : 'cover', maxHeight: '150px' }} />
        )}
      </div>
    </div>
  );
};

export default ArticleJackpotPreview;
