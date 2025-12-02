import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { QuizSidebar } from "./QuizSidebar";
import { ArticleQuizPreview } from "./ArticleQuizPreview";
import { QuizSettingsPanel } from "./QuizSettingsPanel";
import { ArticleQuizSettingsPanel } from "./ArticleQuizSettingsPanel";
import { QuizTopToolbar } from "./QuizTopToolbar";
import { FloatingToolbar } from "./FloatingToolbar";
import { ChatToCreate } from "./ChatToCreate";
import { CampaignSettings } from "./CampaignSettings";
import { createAIActionHandler } from "@/utils/aiActionHandler";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { useCampaign } from "@/hooks/useCampaign";
import { QuizConfig, QuizQuestion } from "./QuizBuilder";

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
    subtitle: "Laissez vos informations pour recevoir vos résultats.",
    buttonText: "Commencer le quiz",
    blockSpacing: 1,
    fields: [
      { id: 'name', type: 'text', required: true, label: 'Nom complet' },
      { id: 'email', type: 'email', required: true, label: 'Email' },
      { id: 'phone', type: 'phone', required: false, label: 'Téléphone' }
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
      points: 10
    }
  ],
  resultScreen: {
    title: "Résultats",
    subtitle: "Voici votre score !",
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
    allowReview: false,
    passingScore: 50
  }
};

export interface ArticleConfig {
  banner?: { imageUrl?: string; aspectRatio?: string; };
  frameWidth: number;
  frameHeight?: number;
  frameColor: string;
  frameBorderRadius: number;
  frameBorderWidth: number;
  frameBorderColor: string;
  ctaBackgroundColor: string;
  ctaTextColor: string;
  ctaBorderRadius: number;
  pageBackgroundColor?: string;
  pageBackgroundImage?: string;
  headerImage?: string;
  headerFitMode?: 'fill' | 'fit';
  footerImage?: string;
  footerFitMode?: 'fill' | 'fit';
}

const defaultArticleConfig: ArticleConfig = {
  frameWidth: 810,
  frameHeight: undefined,
  frameColor: '#ffffff',
  frameBorderRadius: 0,
  frameBorderWidth: 0,
  frameBorderColor: '#e5e7eb',
  ctaBackgroundColor: '#000000',
  ctaTextColor: '#ffffff',
  ctaBorderRadius: 9999,
  pageBackgroundColor: '#f3f4f6',
};

export const ArticleQuizBuilder = () => {
  const isMobile = useIsMobile();
  const themeContext = useTheme();
  const { theme } = themeContext;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const campaignId = searchParams.get('id');

  // Hook de persistance Supabase
  const {
    campaign,
    config,
    name: campaignName,
    startDate,
    startTime,
    endDate,
    endTime,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    setConfig,
    save,
    publish,
    setName,
    setStartDate,
    setStartTime,
    setEndDate,
    setEndTime,
  } = useCampaign(
    { campaignId, type: 'quiz', mode: 'article', defaultName: 'Nouveau quiz (article)' },
    { ...defaultQuizConfig, articleConfig: defaultArticleConfig },
    themeContext
  );

  // Article config is stored inside config.articleConfig
  const articleConfig: ArticleConfig = (config as any).articleConfig || defaultArticleConfig;

  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'question' | 'result'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'design' | 'campaign' | 'templates'>('design');

  useEffect(() => {
    if (isMobile) setViewMode('mobile');
  }, [isMobile]);

  // Sauvegarder et mettre à jour l'URL avec l'ID
  const handleSave = async () => {
    const saved = await save();
    if (saved && !campaignId) {
      navigate(`/article-quiz?id=${saved.id}`, { replace: true });
    }
  };

  // Publier et mettre à jour l'URL
  const handlePublish = async () => {
    const published = await publish();
    if (published && !campaignId) {
      navigate(`/article-quiz?id=${published.id}`, { replace: true });
    }
  };

  useEffect(() => {
    localStorage.setItem('article-quiz-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('article-quiz-article-config', JSON.stringify(articleConfig));
  }, [articleConfig]);

  useEffect(() => {
    localStorage.setItem('article-quiz-theme', JSON.stringify(theme));
  }, [theme]);

  const updateConfig = (updates: Partial<QuizConfig>) => {
    setConfig((prev: any) => ({ ...prev, ...updates }));
  };

  const updateArticleConfig = (updates: Partial<ArticleConfig>) => {
    setConfig((prev: any) => ({ 
      ...prev, 
      articleConfig: { ...(prev.articleConfig || defaultArticleConfig), ...updates } 
    }));
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: String(Date.now()),
      question: 'Nouvelle question',
      answers: [
        { id: `${Date.now()}-a1`, text: 'Réponse 1', isCorrect: true },
        { id: `${Date.now()}-a2`, text: 'Réponse 2', isCorrect: false },
      ],
      points: 10
    };
    setConfig((prev: any) => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    toast.success("Question ajoutée");
  };

  const deleteQuestion = (index: number) => {
    if ((config as any).questions?.length <= 1) {
      toast.error("Il doit y avoir au moins 1 question");
      return;
    }
    setConfig((prev: any) => ({ ...prev, questions: prev.questions.filter((_: any, i: number) => i !== index) }));
    toast.success("Question supprimée");
  };

  const duplicateQuestion = (index: number) => {
    const q = (config as any).questions?.[index];
    if (q) {
      const newQ: QuizQuestion = {
        ...q,
        id: String(Date.now()),
        answers: q.answers.map((a: any) => ({ ...a, id: `${Date.now()}-${a.id}` }))
      };
      const newQuestions = [...(config as any).questions];
      newQuestions.splice(index + 1, 0, newQ);
      setConfig((prev: any) => ({ ...prev, questions: newQuestions }));
      toast.success("Question dupliquée");
    }
  };

  const reorderQuestions = (startIndex: number, endIndex: number) => {
    const newQuestions = [...(config as any).questions];
    const [removed] = newQuestions.splice(startIndex, 1);
    newQuestions.splice(endIndex, 0, removed);
    setConfig((prev: any) => ({ ...prev, questions: newQuestions }));
  };

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <QuizTopToolbar 
        onPreview={() => {
          const targetViewMode = isMobile ? 'mobile' : 'desktop';
          try {
            localStorage.setItem('article-quiz-config', JSON.stringify(config));
            localStorage.setItem('article-quiz-article-config', JSON.stringify(articleConfig));
            localStorage.setItem('article-quiz-viewMode', targetViewMode);
            localStorage.setItem('article-quiz-theme', JSON.stringify(theme));
            window.open('/article-quiz-preview', '_blank');
          } catch (e) {
            toast.error('Unable to open preview - data too large');
          }
        }}
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
        
      <div className="flex flex-1 overflow-hidden relative">
        {activeTab === 'campaign' ? (
          <CampaignSettings
            campaignName={campaignName}
            onCampaignNameChange={setName}
            startDate={startDate}
            onStartDateChange={setStartDate}
            startTime={startTime}
            onStartTimeChange={setStartTime}
            endDate={endDate}
            onEndDateChange={setEndDate}
            endTime={endTime}
            onEndTimeChange={setEndTime}
            campaignUrl={campaign?.published_url || ''}
            prizes={[]}
            onSavePrize={() => {}}
            onDeletePrize={() => {}}
            gameType="wheel"
            segments={[]}
            campaignType="quiz"
            campaignId={campaign?.id}
            campaignMode="article"
          />
        ) : activeTab === 'templates' ? (
          <div className="flex-1 flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Templates à venir</p>
          </div>
        ) : isMobile ? (
          <>
            <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <QuizSidebar
                  config={config}
                  activeView={activeView}
                  activeQuestionIndex={currentQuestionIndex}
                  onViewSelect={(view) => { setActiveView(view); setLeftDrawerOpen(false); }}
                  onQuestionSelect={(index) => { setCurrentQuestionIndex(index); setActiveView('question'); }}
                  onAddQuestion={addQuestion}
                  onDuplicateQuestion={duplicateQuestion}
                  onReorderQuestions={reorderQuestions}
                  onDeleteQuestion={deleteQuestion}
                  onUpdateConfig={updateConfig}
                />
              </DrawerContent>
            </Drawer>

            <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
              <DrawerContent className="h-[85vh]">
                <ArticleQuizSettingsPanel 
                  articleConfig={articleConfig}
                  onUpdateArticleConfig={updateArticleConfig}
                />
              </DrawerContent>
            </Drawer>

            <Button onClick={() => setLeftDrawerOpen(true)} className="fixed left-2 top-1/2 -translate-y-1/2 z-50 h-12 w-10 p-0 shadow-lg" variant="default">
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Button onClick={() => setRightDrawerOpen(true)} className="fixed right-2 top-1/2 -translate-y-1/2 z-50 h-12 w-10 p-0 shadow-lg" variant="default">
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <ArticleQuizPreview
              config={config}
              articleConfig={articleConfig}
              activeView={activeView}
              onUpdateConfig={updateConfig}
              onUpdateArticleConfig={updateArticleConfig}
              viewMode="mobile"
              onViewChange={setActiveView}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionIndexChange={setCurrentQuestionIndex}
            />
          </>
        ) : (
          <>
            <QuizSidebar
              config={config}
              activeView={activeView}
              activeQuestionIndex={currentQuestionIndex}
              onViewSelect={setActiveView}
              onQuestionSelect={(index) => { setCurrentQuestionIndex(index); setActiveView('question'); }}
              onAddQuestion={addQuestion}
              onDuplicateQuestion={duplicateQuestion}
              onReorderQuestions={reorderQuestions}
              onDeleteQuestion={deleteQuestion}
              onUpdateConfig={updateConfig}
            />
            
            {/* Preview area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 relative">
              {/* Top bar: view toggle on the right */}
              <div className="flex items-center justify-end px-4 pt-6 pb-1 bg-gray-100">
                <button
                  onClick={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {viewMode === 'desktop' ? (
                    <><Monitor className="w-4 h-4" /><span className="text-xs font-medium">Desktop</span></>
                  ) : (
                    <><Smartphone className="w-4 h-4" /><span className="text-xs font-medium">Mobile</span></>
                  )}
                </button>
              </div>
              
              {/* ArticleQuizPreview */}
              <div className="flex-1 overflow-auto">
                <ArticleQuizPreview
                  config={config}
                  articleConfig={articleConfig}
                  activeView={activeView}
                  onUpdateConfig={updateConfig}
                  onUpdateArticleConfig={updateArticleConfig}
                  viewMode={viewMode}
                  onViewChange={setActiveView}
                  currentQuestionIndex={currentQuestionIndex}
                  onQuestionIndexChange={setCurrentQuestionIndex}
                />
              </div>
              
              <ChatToCreate 
                context={`Type: Quiz (Article). Vue active: ${activeView}. Titre: ${(config as any).welcomeScreen?.title || ''}`}
                onApplyActions={createAIActionHandler(config, (updates) => setConfig({ ...config, ...updates }), {
                  welcome: 'welcomeScreen',
                  contact: 'contactScreen',
                  result: 'resultScreen'
                })}
              />
            </div>
            
            {/* Right sidebar - View content settings + Article settings */}
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                {/* View-specific settings */}
                <QuizSettingsPanel 
                  config={config}
                  activeView={activeView}
                  activeQuestionIndex={currentQuestionIndex}
                  onUpdateConfig={updateConfig}
                  onUpdateQuestion={(index, updates) => {
                    setConfig(prev => ({
                      ...prev,
                      questions: prev.questions.map((q, i) => i === index ? { ...q, ...updates } : q)
                    }));
                  }}
                />
                
                {/* Article-specific settings - Only on Welcome */}
                {activeView === 'welcome' && (
                  <div className="px-4 pb-4">
                    <ArticleQuizSettingsPanel 
                      articleConfig={articleConfig}
                      onUpdateArticleConfig={updateArticleConfig}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <FloatingToolbar />
    </div>
  );
};

export default ArticleQuizBuilder;
