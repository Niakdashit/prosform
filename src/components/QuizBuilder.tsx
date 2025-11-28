import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { QuizSidebar } from "./QuizSidebar";
import { QuizPreview } from "./QuizPreview";
import { QuizSettingsPanel } from "./QuizSettingsPanel";
import { QuizTopToolbar } from "./QuizTopToolbar";
import { FloatingToolbar } from "./FloatingToolbar";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import type { ContactField } from "./WheelBuilder";

export interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: QuizAnswer[];
  explanation?: string;
  points: number;
  timeLimit?: number;
  imageUrl?: string;
}

export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

export interface QuizConfig {
  welcomeScreen: {
    title: string;
    titleHtml?: string;
    titleStyle?: TextStyle;
    titleWidth?: number;
    subtitle: string;
    subtitleHtml?: string;
    subtitleStyle?: TextStyle;
    subtitleWidth?: number;
    buttonText: string;
    blockSpacing: number;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
    applyBackgroundToAll?: boolean;
    splitAlignment?: 'left' | 'center' | 'right';
    alignment?: 'left' | 'center' | 'right';
    showImage?: boolean;
  };
  contactScreen: {
    enabled: boolean;
    title: string;
    titleHtml?: string;
    titleStyle?: TextStyle;
    titleWidth?: number;
    subtitle: string;
    subtitleHtml?: string;
    subtitleStyle?: TextStyle;
    subtitleWidth?: number;
    buttonText: string;
    blockSpacing: number;
    fields: ContactField[];
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    backgroundImage?: string;
    backgroundImageMobile?: string;
  };
  questions: QuizQuestion[];
  resultScreen: {
    title: string;
    titleHtml?: string;
    titleStyle?: TextStyle;
    titleWidth?: number;
    subtitle: string;
    subtitleHtml?: string;
    subtitleStyle?: TextStyle;
    subtitleWidth?: number;
    blockSpacing: number;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
    wallpaperImage?: string;
    overlayOpacity?: number;
    backgroundImage?: string;
    backgroundImageMobile?: string;
    showScore: boolean;
    showCorrectAnswers: boolean;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  settings: {
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    showProgressBar: boolean;
    allowReview: boolean;
    passingScore: number;
    answerStyle?: 'filled' | 'outline' | 'soft' | 'filled-square';
  };
}

const defaultQuizConfig: QuizConfig = {
  welcomeScreen: {
    title: "Testez vos connaissances !",
    subtitle: "Répondez aux questions et découvrez votre score",
    buttonText: "Commencer le quiz",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-left-right"
  },
  contactScreen: {
    enabled: true,
    title: "Vos coordonnées",
    subtitle: "Laissez vos informations pour recevoir vos résultats et récompenses.",
    buttonText: "Commencer le quiz",
    blockSpacing: 1,
    fields: [
      { type: 'name', required: true, label: 'Nom complet' },
      { type: 'email', required: true, label: 'Email' },
      { type: 'phone', required: false, label: 'Téléphone' }
    ],
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered",
  },
  questions: [
    {
      id: 'q1',
      question: 'Quelle est la capitale de la France ?',
      answers: [
        { id: 'a1', text: 'Paris', isCorrect: true },
        { id: 'a2', text: 'Londres', isCorrect: false },
        { id: 'a3', text: 'Berlin', isCorrect: false },
        { id: 'a4', text: 'Madrid', isCorrect: false }
      ],
      explanation: 'Paris est la capitale et la plus grande ville de France.',
      points: 10,
      timeLimit: 30
    },
    {
      id: 'q2',
      question: 'Combien font 2 + 2 ?',
      answers: [
        { id: 'a1', text: '3', isCorrect: false },
        { id: 'a2', text: '4', isCorrect: true },
        { id: 'a3', text: '5', isCorrect: false },
        { id: 'a4', text: '6', isCorrect: false }
      ],
      explanation: '2 + 2 = 4',
      points: 10,
      timeLimit: 20
    },
    {
      id: 'q3',
      question: 'Quel est le plus grand océan du monde ?',
      answers: [
        { id: 'a1', text: 'Océan Atlantique', isCorrect: false },
        { id: 'a2', text: 'Océan Indien', isCorrect: false },
        { id: 'a3', text: 'Océan Pacifique', isCorrect: true },
        { id: 'a4', text: 'Océan Arctique', isCorrect: false }
      ],
      explanation: "L'océan Pacifique est le plus grand et le plus profond des océans.",
      points: 10,
      timeLimit: 30
    }
  ],
  resultScreen: {
    title: "Quiz terminé !",
    subtitle: "Vous avez obtenu {{score}} points sur {{total}}",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered",
    showScore: true,
    showCorrectAnswers: true
  },
  settings: {
    shuffleQuestions: false,
    shuffleAnswers: false,
    showProgressBar: true,
    allowReview: true,
    passingScore: 70,
    answerStyle: 'filled'
  }
};

export const QuizBuilder = () => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [config, setConfig] = useState<QuizConfig>(defaultQuizConfig);
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'question' | 'result'>('welcome');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setViewMode('mobile');
    }
  }, [isMobile]);

  const updateConfig = (updates: Partial<QuizConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setConfig(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, ...updates } : q
      )
    }));
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q${Date.now()}`,
      question: 'Nouvelle question',
      answers: [
        { id: `a1-${Date.now()}`, text: 'Réponse 1', isCorrect: true },
        { id: `a2-${Date.now()}`, text: 'Réponse 2', isCorrect: false },
        { id: `a3-${Date.now()}`, text: 'Réponse 3', isCorrect: false },
        { id: `a4-${Date.now()}`, text: 'Réponse 4', isCorrect: false }
      ],
      points: 10,
      timeLimit: 30
    };
    setConfig(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    toast.success("Question ajoutée");
  };

  const duplicateQuestion = (index: number) => {
    setConfig(prev => {
      const questionToDuplicate = prev.questions[index];
      const newQuestion = {
        ...questionToDuplicate,
        id: `q${Date.now()}`,
        question: `${questionToDuplicate.question} (copie)`,
        answers: questionToDuplicate.answers.map(a => ({
          ...a,
          id: `${a.id}-${Date.now()}`
        }))
      };
      
      const newQuestions = [...prev.questions];
      newQuestions.splice(index + 1, 0, newQuestion);
      
      return { ...prev, questions: newQuestions };
    });
    toast.success("Question dupliquée");
  };

  const reorderQuestions = (startIndex: number, endIndex: number) => {
    setConfig(prev => {
      const newQuestions = Array.from(prev.questions);
      const [removed] = newQuestions.splice(startIndex, 1);
      newQuestions.splice(endIndex, 0, removed);
      return { ...prev, questions: newQuestions };
    });
  };

  const deleteQuestion = (index: number) => {
    if (config.questions.length <= 1) {
      toast.error("Le quiz doit avoir au moins 1 question");
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    
    if (activeQuestionIndex >= config.questions.length - 1) {
      setActiveQuestionIndex(Math.max(0, config.questions.length - 2));
    }
    
    toast.success("Question supprimée");
  };

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <QuizTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          localStorage.setItem('quiz-config', JSON.stringify(config));
          localStorage.setItem('quiz-viewMode', targetViewMode);
          localStorage.setItem('quiz-theme', JSON.stringify(theme));
          window.open('/quiz-preview', '_blank');
        }}
      />
        
      <div className="flex flex-1 overflow-hidden relative">
        {isMobile ? (
          <>
            <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <QuizSidebar
                  config={config}
                  activeView={activeView}
                  activeQuestionIndex={activeQuestionIndex}
                  onViewSelect={(view) => {
                    setActiveView(view);
                    setLeftDrawerOpen(false);
                  }}
                  onQuestionSelect={(index) => {
                    setActiveQuestionIndex(index);
                    setActiveView('question');
                    setLeftDrawerOpen(false);
                  }}
                  onAddQuestion={() => {
                    addQuestion();
                    setLeftDrawerOpen(false);
                  }}
                  onDuplicateQuestion={duplicateQuestion}
                  onReorderQuestions={reorderQuestions}
                  onDeleteQuestion={deleteQuestion}
                />
              </DrawerContent>
            </Drawer>

            <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <QuizSettingsPanel 
                  config={config}
                  activeView={activeView}
                  activeQuestionIndex={activeQuestionIndex}
                  onUpdateConfig={updateConfig}
                  onUpdateQuestion={updateQuestion}
                  onViewModeChange={setViewMode}
                />
              </DrawerContent>
            </Drawer>

            <Button
              onClick={() => setLeftDrawerOpen(true)}
              className="fixed left-2 top-1/2 -translate-y-1/2 z-50 h-12 w-10 p-0 shadow-lg"
              variant="default"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Button
              onClick={() => setRightDrawerOpen(true)}
              className="fixed right-2 top-1/2 -translate-y-1/2 z-50 h-12 w-10 p-0 shadow-lg"
              variant="default"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <QuizPreview
              config={config}
              activeView={activeView}
              activeQuestionIndex={activeQuestionIndex}
              onUpdateConfig={updateConfig}
              viewMode="mobile"
              onToggleViewMode={() => {}}
              isMobileResponsive={true}
              onNext={() => {
                if (activeView === 'welcome') {
                  if (config.contactScreen.enabled) {
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
              }}
            />
          </>
        ) : (
          <>
            <QuizSidebar
              config={config}
              activeView={activeView}
              activeQuestionIndex={activeQuestionIndex}
              onViewSelect={setActiveView}
              onQuestionSelect={(index) => {
                setActiveQuestionIndex(index);
                setActiveView('question');
              }}
              onAddQuestion={addQuestion}
              onDuplicateQuestion={duplicateQuestion}
              onReorderQuestions={reorderQuestions}
              onDeleteQuestion={deleteQuestion}
            />
            
            {/* Preview area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
              {/* Top bar: view toggle on the right */}
              <div className="flex items-center justify-end px-4 pt-6 pb-1 bg-gray-100">
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
              
              {/* QuizPreview */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <QuizPreview
                  config={config}
                  activeView={activeView}
                  activeQuestionIndex={activeQuestionIndex}
                  onUpdateConfig={updateConfig}
                  viewMode={viewMode}
                  onToggleViewMode={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
                  isMobileResponsive={false}
                  onNext={() => {
                    if (activeView === 'welcome') {
                      if (config.contactScreen.enabled) {
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
                  }}
                />
              </div>
            </div>
            
            <QuizSettingsPanel 
              config={config}
              activeView={activeView}
              activeQuestionIndex={activeQuestionIndex}
              onUpdateConfig={updateConfig}
              onUpdateQuestion={updateQuestion}
              onViewModeChange={setViewMode}
            />
          </>
        )}
      </div>
      <FloatingToolbar />
    </div>
  );
};
