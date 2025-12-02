import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { QuestionSidebar } from "./QuestionSidebar";
import { FormPreview } from "./FormPreview";
import { SettingsPanel } from "./SettingsPanel";
import { TopToolbar } from "./TopToolbar";
import { AddContentModal } from "./AddContentModal";
import { WorkflowBuilder } from "./workflow/WorkflowBuilder";
import { TemplateLibrary } from "./templates";
import { FloatingToolbar } from "./FloatingToolbar";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
// TextStyle type for text formatting
export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

export interface Question {
  id: string;
  type: "welcome" | "text" | "short-text" | "long-text" | "rating" | "choice" | "ending" | "email" | "phone" | "number" | "date" | "dropdown" | "yesno" | "file" | "statement" | "picture-choice" | "website" | "video" | "checkbox";
  title: string;
  titleHtml?: string; // HTML version of title with inline styles
  subtitle?: string;
  subtitleHtml?: string; // HTML version of subtitle with inline styles
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
  choiceDisplayStyle?: 'pills' | 'list' | 'grid' | 'cards';
  // Display styles for different question types
  textDisplayStyle?: 'default' | 'underline' | 'boxed' | 'minimal';
  ratingDisplayStyle?: 'stars' | 'numbers' | 'emojis' | 'hearts' | 'slider';
  yesnoDisplayStyle?: 'buttons' | 'toggle' | 'cards' | 'icons';
  dateDisplayStyle?: 'calendar' | 'dropdowns' | 'input';
  fileDisplayStyle?: 'dropzone' | 'button' | 'minimal';
  welcomeDisplayStyle?: 'centered' | 'left' | 'split' | 'fullscreen' | 'center' | 'right';
  endingDisplayStyle?: 'centered' | 'confetti' | 'minimal' | 'redirect';
  dropdownDisplayStyle?: 'select' | 'searchable' | 'buttons';
  websiteDisplayStyle?: 'default' | 'card' | 'minimal';
  videoDisplayStyle?: 'dropzone' | 'button' | 'embed';
  checkboxDisplayStyle?: 'square' | 'round' | 'toggle';
  // Style customization options
  styleCustomization?: {
    borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    buttonColor?: string;
    buttonTextColor?: string;
    borderColor?: string;
    backgroundColor?: string;
    hoverColor?: string;
  };
  // Image uploadée pour cette question
  image?: string;
  imageSettings?: {
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    rotation: number;
  };
  // Overlay opacity for wallpaper layouts
  overlayOpacity?: number;
  // Background images
  backgroundImage?: string;
  backgroundImageMobile?: string;
  applyBackgroundToAll?: boolean;
  // Text styling for title, subtitle, description
  titleStyle?: {
    fontFamily?: string;
    fontSize?: number;
    textColor?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    textAlign?: 'left' | 'center' | 'right';
  };
  subtitleStyle?: {
    fontFamily?: string;
    fontSize?: number;
    textColor?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    textAlign?: 'left' | 'center' | 'right';
  };
  buttonStyle?: {
    fontFamily?: string;
    fontSize?: number;
    textColor?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    textAlign?: 'left' | 'center' | 'right';
  };
  // Width settings for text blocks (for manual resizing)
  titleWidth?: number; // percentage (10-100)
  subtitleWidth?: number; // percentage (10-100)
}

const defaultQuestions: Question[] = [
  {
    id: "welcome",
    type: "welcome",
    title: "Ajouter un titre",
    subtitle: "Ajouter une description pour votre formulaire",
    buttonText: "Commencer",
    icon: "greeting"
  },
  {
    id: "q1",
    type: "text",
    title: "Ajouter votre question ici",
    icon: "user",
    number: 1,
    variant: "short",
    placeholder: "Tapez votre réponse..."
  },
  {
    id: "q2",
    type: "email",
    title: "Ajouter votre question ici",
    icon: "mail",
    number: 2,
    placeholder: "nom@exemple.com"
  },
  {
    id: "ending",
    type: "ending",
    title: "Merci pour votre participation !",
    subtitle: "Ajouter un message de fin personnalisé",
    icon: "check"
  }
];

// Preview area component with TextToolbar integration - REFACTORED (no context, direct state)
interface FormBuilderPreviewAreaProps {
  viewMode: 'desktop' | 'mobile';
  setViewMode: React.Dispatch<React.SetStateAction<'desktop' | 'mobile'>>;
  activeQuestion: Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  questions: Question[];
  activeQuestionId: string;
  setActiveQuestionId: (id: string) => void;
  templateMeta: any;
  // New: editing state passed from parent
  editingField: string | null;
  setEditingField: (field: string | null) => void;
}

const FormBuilderPreviewArea = ({
  viewMode,
  setViewMode,
  activeQuestion,
  updateQuestion,
  questions,
  activeQuestionId,
  setActiveQuestionId,
  templateMeta,
  editingField,
  setEditingField,
}: FormBuilderPreviewAreaProps) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
      {/* Top bar: TextToolbar centered (only when editing), view toggle on the right */}
      <div className="flex items-center px-4 pt-6 pb-1 bg-gray-100 relative z-10">
        {/* Left spacer */}
        <div className="w-[120px] flex-shrink-0" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* ViewMode Toggle Button à droite */}
        <button
          onClick={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 flex-shrink-0"
          style={{ backgroundColor: '#F5B800', color: '#3D3731' }}
        >
          {viewMode === 'desktop' ? (
            <><Monitor className="w-4 h-4" /><span className="text-xs font-medium">Desktop</span></>
          ) : (
            <><Smartphone className="w-4 h-4" /><span className="text-xs font-medium">Mobile</span></>
          )}
        </button>
      </div>
      
      {/* FormPreview */}
      <div className={`flex-1 flex items-center justify-center overflow-hidden ${viewMode === 'desktop' ? '-mt-10' : ''}`}>
        <FormPreview
          question={activeQuestion}
          onUpdateQuestion={updateQuestion}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
          isMobileResponsive={false}
          allQuestions={questions}
          editingField={editingField}
          setEditingField={setEditingField}
          templateMeta={templateMeta}
          onNext={() => {
            const currentIndex = questions.findIndex(q => q.id === activeQuestionId);
            if (currentIndex < questions.length - 1) {
              setActiveQuestionId(questions[currentIndex + 1].id);
            }
          }}
        />
      </div>
    </div>
  );
};

export const FormBuilder = () => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [activeQuestionId, setActiveQuestionId] = useState("welcome");
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'workflow' | 'templates'>('content');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [templateMeta, setTemplateMeta] = useState<{
    layoutStyle?: string;
    brandName?: string;
    backgroundImages?: string[];
    backgroundColor?: string;
    gradientStart?: string;
    gradientEnd?: string;
    gradientAngle?: number;
    buttonStyle?: string;
    fontStyle?: string;
    accentColor?: string;
    pictureChoiceImages?: string[];
    desktopLayout?: string;
    mobileLayout?: string;
  } | null>(null);

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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-purple-950 to-black overflow-hidden">
      <TopToolbar 
        onAddContent={() => setIsAddContentModalOpen(true)}
        onPreview={() => {
          // Stocker les questions, le viewMode et le thème dans localStorage
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          try {
            localStorage.setItem('preview-questions', JSON.stringify(questions));
            localStorage.setItem('preview-viewMode', targetViewMode);
            localStorage.setItem('preview-theme', JSON.stringify(theme));
            // Ouvrir dans un nouvel onglet
            window.open('/preview', '_blank');
          } catch (e) {
            // Si localStorage est plein (images trop grandes), essayer sans les images
            console.warn('localStorage full, trying without images:', e);
            const questionsWithoutImages = questions.map(q => ({
              ...q,
              image: undefined,
              imageSettings: undefined
            }));
            try {
              localStorage.setItem('preview-questions', JSON.stringify(questionsWithoutImages));
              localStorage.setItem('preview-viewMode', targetViewMode);
              localStorage.setItem('preview-theme', JSON.stringify(theme));
              window.open('/preview', '_blank');
            } catch (e2) {
              toast.error('Impossible d\'ouvrir la preview - données trop volumineuses');
            }
          }
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
        
        <div className="flex flex-1 overflow-hidden relative p-6">
          <div className="flex flex-1 overflow-hidden rounded-2xl border border-border/20 backdrop-blur-xl bg-background/30 shadow-2xl">
        {activeTab === 'templates' ? (
          <TemplateLibrary 
            onSelectTemplate={(newQuestions, meta) => {
              setQuestions(newQuestions);
              setActiveQuestionId(newQuestions[0]?.id || "welcome");
              setTemplateMeta(meta || null);
              setActiveTab('content');
              toast.success("Template applied successfully!");
            }}
          />
        ) : activeTab === 'workflow' ? (
          <WorkflowBuilder questions={questions} />
        ) : isMobile ? (
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
              templateMeta={templateMeta}
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
            
            {/* Preview area with TextToolbar */}
            <FormBuilderPreviewArea
              viewMode={viewMode}
              setViewMode={setViewMode}
              activeQuestion={activeQuestion}
              updateQuestion={updateQuestion}
              questions={questions}
              activeQuestionId={activeQuestionId}
              setActiveQuestionId={setActiveQuestionId}
              templateMeta={templateMeta}
              editingField={editingField}
              setEditingField={setEditingField}
            />
            
            <SettingsPanel 
              question={activeQuestion} 
              onUpdateQuestion={updateQuestion}
              onViewModeChange={setViewMode}
            />
          </>
        )}
          </div>
        </div>

        <AddContentModal
        isOpen={isAddContentModalOpen}
        onClose={() => setIsAddContentModalOpen(false)}
        onSelectElement={handleAddElement}
      />

      {/* Floating Toolbar for text selection */}
      <FloatingToolbar />
    </div>
  );
};
