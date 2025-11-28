import { useEffect, useState } from "react";
import { QuizConfig } from "@/components/QuizBuilder";
import { ArticleConfig } from "@/components/ArticleQuizBuilder";
import { ThemeSettings, GOOGLE_FONTS } from "@/contexts/ThemeContext";

const ArticleQuizPreview = () => {
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [articleConfig, setArticleConfig] = useState<ArticleConfig | null>(null);
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'question' | 'result'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedConfig = localStorage.getItem('article-quiz-config');
    const savedArticleConfig = localStorage.getItem('article-quiz-article-config');
    const savedTheme = localStorage.getItem('article-quiz-theme');
    
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedArticleConfig) setArticleConfig(JSON.parse(savedArticleConfig));
    if (savedTheme) setTheme(JSON.parse(savedTheme));

    const isMobileDevice = window.innerWidth < 768;
    if (isMobileDevice) setViewMode('mobile');
  }, []);

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
      if (config.contactScreen?.enabled) {
        setActiveView('contact');
      } else {
        setActiveView('question');
      }
    } else if (activeView === 'contact') {
      setActiveView('question');
    }
  };

  const handleAnswer = (answerId: string) => {
    const currentQuestion = config.questions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerId }));
    
    const selectedAnswer = currentQuestion.answers.find(a => a.id === answerId);
    if (selectedAnswer?.isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }

    if (currentQuestionIndex < config.questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 500);
    } else {
      setTimeout(() => setActiveView('result'), 500);
    }
  };

  const canvasWidth = viewMode === 'mobile' ? 375 : articleConfig.frameWidth;

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
              style={{ fontSize: '16px', lineHeight: '1.6', color: themeStyles.textColor }}
              dangerouslySetInnerHTML={{
                __html: config.welcomeScreen.subtitleHtml || config.welcomeScreen.subtitle || '<p>Décrivez votre quiz ici...</p>'
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
                {config.welcomeScreen.buttonText || 'Commencer le quiz'}
              </button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-6" style={{ fontFamily: themeStyles.fontFamily }}>
            {config.contactScreen.title && (
              <h2 className="text-xl font-semibold text-center mb-2" style={{ fontFamily: themeStyles.headingFontFamily, color: themeStyles.textColor }}>
                {config.contactScreen.title}
              </h2>
            )}
            {config.contactScreen.subtitle && (
              <p className="text-center mb-6" style={{ color: theme?.textSecondaryColor || '#6b7280' }}>
                {config.contactScreen.subtitle}
              </p>
            )}
            <div className="max-w-md mx-auto space-y-4">
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
                  {config.contactScreen.buttonText}
                </button>
              </div>
            </div>
          </div>
        );

      case 'question':
        const currentQuestion = config.questions[currentQuestionIndex];
        
        return (
          <div className="p-6" style={{ fontFamily: themeStyles.fontFamily }}>
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
                <h2 className="text-xl font-semibold mb-6 text-center" style={{ fontFamily: themeStyles.headingFontFamily, color: themeStyles.textColor }}>
                  {currentQuestion.question}
                </h2>

                <div className="space-y-3 max-w-lg mx-auto">
                  {currentQuestion.answers.map((answer) => (
                    <button
                      key={answer.id}
                      onClick={() => handleAnswer(answer.id)}
                      className="w-full p-4 text-left border-2 rounded-lg transition-all hover:border-gray-400"
                      style={{ 
                        borderColor: answers[currentQuestion.id] === answer.id 
                          ? (answer.isCorrect ? '#22c55e' : '#ef4444')
                          : '#e5e7eb',
                        backgroundColor: answers[currentQuestion.id] === answer.id 
                          ? (answer.isCorrect ? '#dcfce7' : '#fee2e2')
                          : 'white'
                      }}
                    >
                      <span style={{ color: themeStyles.textColor }}>{answer.text}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'result':
        const totalPoints = config.questions.reduce((sum, q) => sum + q.points, 0);
        const percentage = Math.round((score / totalPoints) * 100);
        
        return (
          <div className="p-6 text-center" style={{ fontFamily: themeStyles.fontFamily }}>
            <div 
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: themeStyles.headingFontFamily, color: theme?.primaryColor || '#16a34a' }}
              dangerouslySetInnerHTML={{
                __html: config.resultScreen.titleHtml || config.resultScreen.title,
              }}
            />
            <div 
              style={{ color: theme?.textSecondaryColor || '#6b7280' }}
              dangerouslySetInnerHTML={{
                __html: config.resultScreen.subtitleHtml || config.resultScreen.subtitle,
              }}
            />

            {config.resultScreen.showScore && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl font-bold" style={{ color: themeStyles.primaryColor }}>
                  {percentage}%
                </div>
                <p className="text-sm text-gray-500 mt-2">{score} / {totalPoints} points</p>
              </div>
            )}
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
        {articleConfig.headerImage && (
          <img
            src={articleConfig.headerImage}
            alt="Header"
            className="w-full"
            style={{ objectFit: articleConfig.headerFitMode === 'fit' ? 'contain' : 'cover', maxHeight: '150px' }}
          />
        )}

        {articleConfig.banner?.imageUrl && (
          <img src={articleConfig.banner.imageUrl} alt="Banner" className="w-full" style={{ height: 'auto', display: 'block' }} />
        )}

        {renderContent()}

        {articleConfig.footerImage && (
          <img
            src={articleConfig.footerImage}
            alt="Footer"
            className="w-full"
            style={{ objectFit: articleConfig.footerFitMode === 'fit' ? 'contain' : 'cover', maxHeight: '150px' }}
          />
        )}
      </div>
    </div>
  );
};

export default ArticleQuizPreview;
