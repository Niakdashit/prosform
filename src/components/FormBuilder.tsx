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
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [activeQuestionId, setActiveQuestionId] = useState("welcome");
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

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

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <TopToolbar onAddContent={() => setIsAddContentModalOpen(true)} />
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
            />
            
            <FormPreview
              question={activeQuestion}
              onUpdateQuestion={updateQuestion}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
              isMobileResponsive={false}
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
