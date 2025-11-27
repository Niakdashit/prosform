import { useEffect, useState } from "react";
import { Question } from "@/components/FormBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { FormPreview } from "@/components/FormPreview";

const PreviewContent = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    const storedQuestions = localStorage.getItem('preview-questions');
    
    // Détecter si on est sur mobile (largeur < 768px)
    const isMobileDevice = window.innerWidth < 768;
    
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }
    
    // Forcer le mode mobile si on est sur un appareil mobile
    if (isMobileDevice) {
      setViewMode('mobile');
    } else {
      const storedViewMode = localStorage.getItem('preview-viewMode');
      if (storedViewMode) {
        setViewMode(storedViewMode as 'desktop' | 'mobile');
      }
    }
  }, []);

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <FormPreview
        question={questions[currentIndex]}
        onUpdateQuestion={() => {}}
        viewMode={viewMode}
        onToggleViewMode={() => {}}
        isMobileResponsive={true}
        isReadOnly={true}
        allQuestions={questions}
        onNext={handleNext}
      />
    </div>
  );
};

const Preview = () => {
  const [initialTheme, setInitialTheme] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem('preview-theme');
    if (storedTheme) {
      setInitialTheme(JSON.parse(storedTheme));
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
    <ThemeProvider initialTheme={initialTheme}>
      <PreviewContent />
    </ThemeProvider>
  );
};

export default Preview;
