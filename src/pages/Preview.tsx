import { useEffect, useState } from "react";
import { FormPreview } from "@/components/FormPreview";
import { Question } from "@/components/FormBuilder";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

const PreviewContent = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const { updateTheme } = useTheme();


  useEffect(() => {
    // Load initial questions from localStorage
    const loadData = () => {
      const savedQuestions = localStorage.getItem('preview-questions');
      const savedViewMode = localStorage.getItem('preview-viewMode');
      
      if (savedQuestions) {
        setQuestions(JSON.parse(savedQuestions));
      }
      
      if (savedViewMode) {
        setViewMode(savedViewMode as 'desktop' | 'mobile');
      }
    };

    loadData();

    // Use BroadcastChannel for real-time sync (works in same tab AND other tabs)
    const previewChannel = new BroadcastChannel('form-preview-sync');
    const themeChannel = new BroadcastChannel('form-theme-sync');
    
    previewChannel.onmessage = (event) => {
      if (event.data.questions) {
        setQuestions(event.data.questions);
      }
      if (event.data.viewMode) {
        setViewMode(event.data.viewMode);
      }
    };

    themeChannel.onmessage = (event) => {
      updateTheme(event.data);
    };

    // Also listen for storage changes (for other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preview-questions' && e.newValue) {
        setQuestions(JSON.parse(e.newValue));
      }
      if (e.key === 'preview-viewMode' && e.newValue) {
        setViewMode(e.newValue as 'desktop' | 'mobile');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      previewChannel.close();
      themeChannel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateTheme]);

  if (questions.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">No preview data available</p>
      </div>
    );
  }

  return (
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
  );
};

const Preview = () => {
  return (
    <ThemeProvider>
      <PreviewContent />
    </ThemeProvider>
  );
};

export default Preview;
