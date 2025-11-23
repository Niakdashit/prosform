import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuestionSidebar } from "./QuestionSidebar";
import { FormPreview } from "./FormPreview";
import { SettingsPanel } from "./SettingsPanel";
import { TopToolbar } from "./TopToolbar";
import { AddContentModal } from "./AddContentModal";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

export interface Question {
  id: string;
  type: "welcome" | "text" | "rating" | "choice" | "ending" | "email" | "phone" | "number" | "date" | "dropdown" | "yesno" | "file" | "statement" | "picture-choice";
  title: string;
  subtitle?: string;
  icon?: string;
  number?: number;
  variant?: string;
  choices?: string[];
  required?: boolean;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  dateFormat?: string;
  fileTypes?: string[];
  maxFileSize?: number;
  multipleFiles?: boolean;
  phoneFormat?: string;
  phoneCountry?: string;
  placeholder?: string;
  buttonText?: string;
  ratingCount?: number;
  ratingType?: string;
  mobileLayout?: string;
  desktopLayout?: string;
  splitAlignment?: 'left' | 'center' | 'right';
  blockSpacing?: number;
}

const defaultQuestions: Question[] = [
  {
    id: "welcome",
    type: "welcome",
    title: "How are we doing?",
    subtitle: "Your feedback helps us build an even better place to work.",
    buttonText: "Give feedback",
    icon: "greeting"
  },
  {
    id: "q1",
    type: "text",
    title: "First, what's your full name?",
    icon: "user",
    number: 1,
    variant: "short",
    placeholder: "Type your answer here..."
  },
  {
    id: "q2",
    type: "email",
    title: "What's your email address?",
    icon: "mail",
    number: 2,
    placeholder: "name@example.com"
  },
  {
    id: "q3",
    type: "phone",
    title: "What's your phone number?",
    icon: "phone",
    number: 3,
    placeholder: "+1 (555) 000-0000",
    phoneCountry: "US"
  },
  {
    id: "q4",
    type: "number",
    title: "How many years have you been here?",
    icon: "hash",
    number: 4,
    placeholder: "Enter a number",
    minValue: 0,
    maxValue: 50
  },
  {
    id: "q5",
    type: "date",
    title: "When did you start?",
    icon: "calendar",
    number: 5,
    dateFormat: "ddmmyyyy"
  },
  {
    id: "q6",
    type: "rating",
    title: "How do you rate the company culture?",
    icon: "star",
    number: 6,
    variant: "stars",
    ratingCount: 5,
    ratingType: "stars"
  },
  {
    id: "q7",
    type: "choice",
    title: "Which department do you work in?",
    icon: "building",
    number: 7,
    choices: ["Marketing", "Sales", "Engineering", "Other"]
  },
  {
    id: "q8",
    type: "dropdown",
    title: "Select your location",
    icon: "map",
    number: 8,
    choices: ["New York", "London", "Paris", "Tokyo"]
  },
  {
    id: "q9",
    type: "yesno",
    title: "Do you feel valued?",
    icon: "check",
    number: 9
  },
  {
    id: "q10",
    type: "picture-choice",
    title: "Choose your preferred workspace",
    icon: "image",
    number: 10,
    choices: ["Open space", "Private office", "Hybrid"]
  },
  {
    id: "q11",
    type: "file",
    title: "Upload any supporting documents",
    icon: "upload",
    number: 11,
    maxFileSize: 10,
    fileTypes: ["PDF", "DOC", "JPG"]
  },
  {
    id: "q12",
    type: "statement",
    title: "Thank you for your time!",
    subtitle: "Your responses will help us improve",
    icon: "info",
    number: 12
  },
  {
    id: "q13",
    type: "text",
    title: "Any additional comments?",
    icon: "message",
    number: 13,
    variant: "long",
    maxLength: 500
  },
  {
    id: "ending",
    type: "ending",
    title: "Thanks for your feedback, {{first_name}}!",
    icon: "check"
  }
];

export const FormBuilder = () => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [activeQuestionId, setActiveQuestionId] = useState("welcome");
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [isCapturingPreview, setIsCapturingPreview] = useState(false);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);

  // Force mobile view mode on mobile devices
  useEffect(() => {
    if (isMobile) {
      setViewMode('mobile');
    }
  }, [isMobile]);

  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const reorderQuestions = (startIndex: number, endIndex: number) => {
    setQuestions(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Update question numbers for non-welcome/ending questions
      return result.map((q, index) => {
        if (q.type !== "welcome" && q.type !== "ending") {
          const regularQuestions = result.filter(r => r.type !== "welcome" && r.type !== "ending");
          const newNumber = regularQuestions.indexOf(q) + 1;
          return { ...q, number: newNumber };
        }
        return q;
      });
    });
  };

  const duplicateQuestion = (id: string) => {
    setQuestions(prev => {
      const questionIndex = prev.findIndex(q => q.id === id);
      if (questionIndex === -1) return prev;
      
      const questionToDuplicate = prev[questionIndex];
      const newQuestion = {
        ...questionToDuplicate,
        id: `question-${Date.now()}`,
        title: `${questionToDuplicate.title} (copy)`,
      };
      
      const result = Array.from(prev);
      result.splice(questionIndex + 1, 0, newQuestion);
      
      // Update question numbers for non-welcome/ending questions
      return result.map((q, index) => {
        if (q.type !== "welcome" && q.type !== "ending") {
          const regularQuestions = result.filter(r => r.type !== "welcome" && r.type !== "ending");
          const newNumber = regularQuestions.indexOf(q) + 1;
          return { ...q, number: newNumber };
        }
        return q;
      });
    });
    toast.success("Question duplicated");
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => {
      const questionToDelete = prev.find(q => q.id === id);
      if (!questionToDelete) return prev;
      
      // Prevent deletion of welcome and ending screens
      if (questionToDelete.type === "welcome" || questionToDelete.type === "ending") {
        toast.error("Cannot delete Welcome or Ending screen");
        return prev;
      }
      
      const result = prev.filter(q => q.id !== id);
      
      // Update question numbers for non-welcome/ending questions
      const updated = result.map((q, index) => {
        if (q.type !== "welcome" && q.type !== "ending") {
          const regularQuestions = result.filter(r => r.type !== "welcome" && r.type !== "ending");
          const newNumber = regularQuestions.indexOf(q) + 1;
          return { ...q, number: newNumber };
        }
        return q;
      });
      
      // If the deleted question was active, switch to the first question
      if (id === activeQuestionId && updated.length > 0) {
        setActiveQuestionId(updated[0].id);
      }
      
      toast.success("Question deleted");
      return updated;
    });
  };

  const handleAddElement = (elementType: string) => {
    // Map element types to question types and variants
    const typeMap: { [key: string]: { type: Question["type"], variant?: string } } = {
      "short-text": { type: "text", variant: "short" },
      "long-text": { type: "text", variant: "long" },
      "multiple-choice": { type: "choice", variant: "multiple" },
      "dropdown": { type: "dropdown" },
      "yes-no": { type: "yesno" },
      "rating": { type: "rating", variant: "stars" },
      "opinion-scale": { type: "rating", variant: "scale" },
      "ranking": { type: "rating", variant: "ranking" },
      "number": { type: "number" },
      "date": { type: "date" },
      "checkbox": { type: "choice", variant: "checkbox" },
      "video": { type: "text", variant: "video" },
      "email": { type: "email" },
      "phone": { type: "phone" },
      "file-upload": { type: "file" },
      "statement": { type: "statement" },
      "picture-choice": { type: "picture-choice" },
    };

    const mapping = typeMap[elementType] || { type: "text", variant: "short" };
    
    // Update the active question's type
    if (activeQuestion) {
      if (activeQuestion.type === "welcome" || activeQuestion.type === "ending") {
        toast.error("Cannot change Welcome or Ending screen type");
        return;
      }
      updateQuestion(activeQuestion.id, { 
        type: mapping.type,
        variant: mapping.variant 
      });
      toast.success(`Changed to ${elementType.replace('-', ' ')}`);
    }
  };

  const handlePreview = () => {
    const targetViewMode = isMobile ? 'mobile' : 'desktop';
    
    // Créer une page HTML complète avec le formulaire
    const previewHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prévisualisation du formulaire</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${theme.fontFamily === 'inter' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : theme.fontFamily};
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      position: relative;
    }
    
    .close-button {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 1000;
      padding: 12px 16px;
      border-radius: 8px;
      background-color: #4A4138;
      border: 1px solid rgba(245, 184, 0, 0.3);
      color: #F5CA3C;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 500;
      transition: transform 0.2s;
    }
    
    .close-button:hover {
      transform: scale(1.05);
    }
    
    .form-container {
      background: ${theme.backgroundColor};
      width: ${targetViewMode === 'desktop' ? '1100px' : '375px'};
      height: ${targetViewMode === 'desktop' ? '620px' : '667px'};
      position: relative;
      overflow: hidden;
    }
    
    .logo {
      position: absolute;
      top: 32px;
      left: 32px;
      display: grid;
      grid-template-columns: repeat(2, 14px);
      gap: 4px;
    }
    
    .logo-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #F5CA3C;
    }
    
    .content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: ${targetViewMode === 'desktop' ? '0 64px' : '24px 20px'};
    }
    
    .text-content {
      text-align: center;
      max-width: 600px;
    }
    
    h1 {
      font-size: ${targetViewMode === 'desktop' ? '48px' : '32px'};
      color: ${theme.textColor};
      margin-bottom: 16px;
      font-weight: 700;
    }
    
    p {
      font-size: ${targetViewMode === 'desktop' ? '18px' : '16px'};
      color: ${theme.textColor};
      opacity: 0.9;
      margin-bottom: 32px;
    }
    
    button {
      background: ${theme.systemColor};
      color: ${theme.backgroundColor};
      padding: 16px 32px;
      border-radius: ${theme.buttonStyle === 'pill' ? '999px' : theme.buttonStyle === 'rounded' ? '12px' : '4px'};
      border: none;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    button:hover {
      transform: scale(1.05);
    }
    
    .image-container {
      width: ${targetViewMode === 'desktop' ? '420px' : '280px'};
      height: ${targetViewMode === 'desktop' ? '420px' : '280px'};
      border-radius: 36px;
      overflow: hidden;
      margin: 0 auto ${targetViewMode === 'desktop' ? '48px' : '32px'};
    }
    
    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <button class="close-button" onclick="window.close()">
    ← Fermer
  </button>
  
  <div class="form-container">
    <div class="logo">
      <div class="logo-dot"></div>
      <div class="logo-dot"></div>
      <div class="logo-dot"></div>
      <div class="logo-dot"></div>
    </div>
    
    <div class="content">
      <div class="text-content">
        ${questions[0].icon ? `<div class="image-container"><img src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=500" alt="Welcome" /></div>` : ''}
        <h1>${questions[0].title || 'Welcome'}</h1>
        <p>${questions[0].subtitle || ''}</p>
        <button>${questions[0].buttonText || 'Start'}</button>
      </div>
    </div>
  </div>
</body>
</html>
    `;
    
    // Ouvrir dans un nouvel onglet avec le HTML
    const blob = new Blob([previewHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Nettoyer l'URL après un court délai
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <TopToolbar 
        onAddContent={() => setIsAddContentModalOpen(true)}
        onPreview={handlePreview}
      />
        
        <div className="flex flex-1 overflow-hidden relative">
        {isMobile ? (
          <>
            {/* Mobile: Drawers with trigger buttons */}
            <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <QuestionSidebar
                  questions={questions}
                  activeQuestionId={activeQuestionId}
                  onQuestionSelect={(id) => {
                    setActiveQuestionId(id);
                    setLeftDrawerOpen(false);
                  }}
                  onReorderQuestions={reorderQuestions}
                  onDuplicateQuestion={duplicateQuestion}
                  onDeleteQuestion={deleteQuestion}
                />
              </DrawerContent>
            </Drawer>

            <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <SettingsPanel 
                  question={activeQuestion} 
                  onUpdateQuestion={updateQuestion}
                  onViewModeChange={setViewMode}
                />
              </DrawerContent>
            </Drawer>

            {/* Left drawer trigger button */}
            <Button
              onClick={() => setLeftDrawerOpen(true)}
              className="fixed left-2 top-1/2 -translate-y-1/2 z-50 h-12 w-10 p-0 shadow-lg"
              variant="default"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Right drawer trigger button */}
            <Button
              onClick={() => setRightDrawerOpen(true)}
              className="fixed right-2 top-1/2 -translate-y-1/2 z-50 h-12 w-10 p-0 shadow-lg"
              variant="default"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Full screen preview */}
            <FormPreview
              question={activeQuestion}
              onUpdateQuestion={updateQuestion}
              viewMode="mobile"
              onToggleViewMode={() => {}} // No toggle on mobile
              isMobileResponsive={true}
              allQuestions={questions}
              onNext={() => {
                const currentIndex = questions.findIndex(q => q.id === activeQuestionId);
                if (currentIndex < questions.length - 1) {
                  setActiveQuestionId(questions[currentIndex + 1].id);
                }
              }}
            />
          </>
        ) : (
          <>
            {/* Desktop: Side panels */}
            <QuestionSidebar
              questions={questions}
              activeQuestionId={activeQuestionId}
              onQuestionSelect={setActiveQuestionId}
              onReorderQuestions={reorderQuestions}
              onDuplicateQuestion={duplicateQuestion}
              onDeleteQuestion={deleteQuestion}
            />
            
            <FormPreview
              question={activeQuestion}
              onUpdateQuestion={updateQuestion}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
              isMobileResponsive={false}
              allQuestions={questions}
              onNext={() => {
                const currentIndex = questions.findIndex(q => q.id === activeQuestionId);
                if (currentIndex < questions.length - 1) {
                  setActiveQuestionId(questions[currentIndex + 1].id);
                }
              }}
            />
            
            <SettingsPanel 
              question={activeQuestion} 
              onUpdateQuestion={updateQuestion}
              onViewModeChange={setViewMode}
            />
          </>
        )}
        </div>

        <AddContentModal
        isOpen={isAddContentModalOpen}
        onClose={() => setIsAddContentModalOpen(false)}
        onSelectElement={handleAddElement}
      />
    </div>
  );
};
