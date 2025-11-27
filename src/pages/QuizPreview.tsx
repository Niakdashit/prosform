import { useEffect, useState } from "react";
import { QuizConfig } from "@/components/QuizBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { QuizPreview } from "@/components/QuizPreview";

const QuizPreviewContent = () => {
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'question' | 'result'>('welcome');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    const savedConfig = localStorage.getItem('quiz-config');
    
    // Détecter si on est sur mobile (largeur < 768px)
    const isMobileDevice = window.innerWidth < 768;
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    
    // Forcer le mode mobile si on est sur un appareil mobile
    if (isMobileDevice) {
      setViewMode('mobile');
    } else {
      const savedViewMode = localStorage.getItem('quiz-viewMode');
      if (savedViewMode) {
        setViewMode(savedViewMode as 'desktop' | 'mobile');
      }
    }
  }, []);

  if (!config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
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
        setActiveQuestionIndex(0);
      }
    } else if (activeView === 'contact') {
      setActiveView('question');
      setActiveQuestionIndex(0);
    } else if (activeView === 'question') {
      if (activeQuestionIndex < config.questions.length - 1) {
        setActiveQuestionIndex(activeQuestionIndex + 1);
      } else {
        setActiveView('result');
      }
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <QuizPreview
        config={config}
        activeView={activeView}
        activeQuestionIndex={activeQuestionIndex}
        onUpdateConfig={() => {}}
        viewMode={viewMode}
        onToggleViewMode={() => {}}
        isMobileResponsive={true}
        isReadOnly={true}
        onNext={handleNext}
      />
    </div>
  );
};

const QuizPreviewPage = () => {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('quiz-theme');
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={theme}>
      <QuizPreviewContent />
    </ThemeProvider>
  );
};

export default QuizPreviewPage;
