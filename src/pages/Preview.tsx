import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormPreview } from "@/components/FormPreview";
import { Question } from "@/components/FormBuilder";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ChevronLeft } from "lucide-react";

const Preview = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    // Récupérer les données depuis localStorage
    const storedQuestions = localStorage.getItem('preview-questions');
    const storedViewMode = localStorage.getItem('preview-viewMode');
    
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }
    
    if (storedViewMode) {
      setViewMode(storedViewMode as 'desktop' | 'mobile');
    }
  }, []);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleUpdateQuestion = () => {
    // No-op dans la prévisualisation
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg text-gray-600">Chargement de la prévisualisation...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex items-center justify-center h-screen relative bg-gray-100">
        <button
          onClick={() => window.close()}
          className="absolute top-4 left-4 z-50 px-4 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2"
          style={{
            backgroundColor: '#4A4138',
            border: '1px solid rgba(245, 184, 0, 0.3)',
            color: '#F5CA3C'
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-xs font-medium">Fermer</span>
        </button>
        
        <FormPreview
          question={questions[currentIndex]}
          onUpdateQuestion={handleUpdateQuestion}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
          isMobileResponsive={false}
          allQuestions={questions}
          onNext={handleNext}
        />
      </div>
    </ThemeProvider>
  );
};

export default Preview;
