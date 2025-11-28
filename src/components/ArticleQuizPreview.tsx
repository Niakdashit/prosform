import React, { useRef, useCallback } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { QuizConfig } from './QuizBuilder';
import { ArticleConfig } from './ArticleQuizBuilder';
import { useTheme, GOOGLE_FONTS, getButtonStyles } from '@/contexts/ThemeContext';

interface ArticleQuizPreviewProps {
  config: QuizConfig;
  articleConfig: ArticleConfig;
  activeView: 'welcome' | 'contact' | 'question' | 'result';
  onUpdateConfig: (updates: Partial<QuizConfig>) => void;
  onUpdateArticleConfig: (updates: Partial<ArticleConfig>) => void;
  viewMode: 'desktop' | 'mobile';
  onViewChange: (view: 'welcome' | 'contact' | 'question' | 'result') => void;
  currentQuestionIndex: number;
  onQuestionIndexChange: (index: number) => void;
}

export const ArticleQuizPreview: React.FC<ArticleQuizPreviewProps> = ({
  config,
  articleConfig,
  activeView,
  onUpdateConfig,
  onUpdateArticleConfig,
  viewMode,
  onViewChange,
  currentQuestionIndex,
  onQuestionIndexChange,
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
            {/* Rich text toolbar */}
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

            {/* Editable content */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="outline-none min-h-[100px]"
              style={{ 
                fontSize: '16px', 
                lineHeight: '1.6',
                color: themeStyles.textColor,
                fontFamily: themeStyles.fontFamily,
              }}
              dangerouslySetInnerHTML={{
                __html: config.welcomeScreen.subtitleHtml || config.welcomeScreen.subtitle || '<p>Décrivez votre quiz ici...</p>'
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

            {/* CTA Button */}
            <div className="flex justify-center mt-6">
              <button
                className="font-semibold transition-all hover:opacity-90 hover:scale-105"
                style={unifiedButtonStyles}
              >
                {config.welcomeScreen.buttonText}
              </button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-6" style={{ fontFamily: themeStyles.fontFamily }}>
            {config.contactScreen.enabled && (
              <div className="max-w-md mx-auto">
                {config.contactScreen.title && (
                  <h2 
                    className="text-xl font-semibold text-center mb-2"
                    style={{ fontFamily: themeStyles.headingFontFamily, color: themeStyles.textColor }}
                  >
                    {config.contactScreen.title}
                  </h2>
                )}
                {config.contactScreen.subtitle && (
                  <p className="text-center mb-6" style={{ color: theme.textSecondaryColor }}>
                    {config.contactScreen.subtitle}
                  </p>
                )}
                
                <div className="space-y-4">
                  {config.contactScreen.fields.map((field, i) => (
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
                  <button
                    className="font-semibold transition-all hover:opacity-90 hover:scale-105"
                    style={unifiedButtonStyles}
                  >
                    {config.contactScreen.buttonText}
                  </button>
                </div>
              </div>
            )}
            
            {!config.contactScreen.enabled && (
              <p className="text-center text-gray-500 italic">
                Formulaire de contact désactivé
              </p>
            )}
          </div>
        );

      case 'question':
        const currentQuestion = config.questions[currentQuestionIndex];
        
        return (
          <div className="p-6" style={{ fontFamily: themeStyles.fontFamily }}>
            {/* Progress bar */}
            {config.settings.showProgressBar && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2" style={{ color: themeStyles.textColor }}>
                  <span>Question {currentQuestionIndex + 1} / {config.questions.length}</span>
                  <span>{currentQuestion?.points || 0} pts</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${((currentQuestionIndex + 1) / config.questions.length) * 100}%`,
                      backgroundColor: themeStyles.primaryColor
                    }}
                  />
                </div>
              </div>
            )}

            {currentQuestion && (
              <>
                {/* Question */}
                <h2 
                  className="text-xl font-semibold mb-6 text-center"
                  style={{ fontFamily: themeStyles.headingFontFamily, color: themeStyles.textColor }}
                >
                  {currentQuestion.question}
                </h2>

                {/* Answers */}
                <div className="space-y-3 max-w-lg mx-auto">
                  {currentQuestion.answers.map((answer, i) => (
                    <button
                      key={answer.id}
                      className="w-full p-4 text-left border-2 rounded-lg transition-all hover:border-gray-400"
                      style={{ 
                        borderColor: answer.isCorrect ? themeStyles.primaryColor : '#e5e7eb',
                        backgroundColor: answer.isCorrect ? `${themeStyles.primaryColor}10` : 'white'
                      }}
                    >
                      <span style={{ color: themeStyles.textColor }}>{answer.text}</span>
                      {answer.isCorrect && (
                        <span className="ml-2 text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                          ✓ Correct
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-center gap-4 mt-6">
                  {currentQuestionIndex > 0 && (
                    <button
                      onClick={() => onQuestionIndexChange(currentQuestionIndex - 1)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                  )}
                  {currentQuestionIndex < config.questions.length - 1 ? (
                    <button
                      onClick={() => onQuestionIndexChange(currentQuestionIndex + 1)}
                      className="font-semibold transition-all hover:opacity-90"
                      style={unifiedButtonStyles}
                    >
                      Suivant
                    </button>
                  ) : (
                    <button
                      className="font-semibold transition-all hover:opacity-90"
                      style={unifiedButtonStyles}
                    >
                      Terminer
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case 'result':
        return (
          <div className="p-6 text-center" style={{ fontFamily: themeStyles.fontFamily }}>
            {/* Rich text toolbar */}
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

            {/* Editable Title */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="text-2xl font-bold mb-4 outline-none"
              style={{
                fontFamily: themeStyles.headingFontFamily,
                color: theme.primaryColor,
              }}
              dangerouslySetInnerHTML={{
                __html: config.resultScreen.titleHtml || config.resultScreen.title,
              }}
              onBlur={(e) => {
                onUpdateConfig({
                  resultScreen: {
                    ...config.resultScreen,
                    title: e.currentTarget.textContent || '',
                    titleHtml: e.currentTarget.innerHTML,
                  },
                });
              }}
            />

            {/* Editable Subtitle */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="outline-none"
              style={{
                color: theme.textSecondaryColor,
                fontFamily: themeStyles.fontFamily,
              }}
              dangerouslySetInnerHTML={{
                __html: config.resultScreen.subtitleHtml || config.resultScreen.subtitle,
              }}
              onBlur={(e) => {
                onUpdateConfig({
                  resultScreen: {
                    ...config.resultScreen,
                    subtitle: e.currentTarget.textContent || '',
                    subtitleHtml: e.currentTarget.innerHTML,
                  },
                });
              }}
            />

            {/* Score display */}
            {config.resultScreen.showScore && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl font-bold" style={{ color: themeStyles.primaryColor }}>
                  80%
                </div>
                <p className="text-sm text-gray-500 mt-2">Score de démonstration</p>
              </div>
            )}
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
        {/* Header Image */}
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

        {/* Footer Image */}
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

export default ArticleQuizPreview;
