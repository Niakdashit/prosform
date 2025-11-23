import { useEffect, useState } from "react";
import { FormPreview } from "@/components/FormPreview";
import { Question } from "@/components/FormBuilder";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Preview = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    // Load questions from localStorage
    const savedQuestions = localStorage.getItem('preview-questions');
    const savedViewMode = localStorage.getItem('preview-viewMode');
    
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
    
    if (savedViewMode) {
      setViewMode(savedViewMode as 'desktop' | 'mobile');
    }
  }, []);

  if (questions.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">No preview data available</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <FormPreview
        question={questions[currentIndex]}
        onUpdateQuestion={() => {}} // No editing in public preview
        viewMode={viewMode}
        onToggleViewMode={() => {}} // No toggle in public preview
        isMobileResponsive={true}
        allQuestions={questions}
        isPublicPreview={true}
        onNext={() => {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
          }
        }}
      />
    </ThemeProvider>
  );
};

export default Preview;
