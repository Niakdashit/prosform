import { useEffect, useState, useMemo } from "react";
import { Question } from "@/components/FormBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { FormPreview } from "@/components/FormPreview";
import { supabase } from "@/integrations/supabase/client";
import { useStepTracking } from "@/hooks/useStepTracking";
import { ParticipationService } from "@/services/ParticipationService";

const PreviewContent = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer le campaignId depuis l'URL
  const campaignId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('id');
  }, []);

  // Pour le form, on track: welcome (premier), game (questions), ending (dernier)
  const trackingStep = useMemo(() => {
    if (currentIndex === 0) return 'welcome';
    if (currentIndex === questions.length - 1) return 'ending';
    return 'game';
  }, [currentIndex, questions.length]);

  // Hook de tracking des étapes
  useStepTracking(campaignId || '', trackingStep, !!campaignId && questions.length > 0);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      setError(null);
      
      const isMobileDevice = window.innerWidth < 768;
      if (isMobileDevice) {
        setViewMode('mobile');
      }

      if (campaignId) {
        try {
          const { data: campaign, error: fetchError } = await supabase
            .from('campaigns')
            .select('config, theme')
            .eq('id', campaignId)
            .single();

          if (fetchError) {
            console.error('Error fetching campaign:', fetchError);
            setError('Campagne non trouvée');
            setIsLoading(false);
            return;
          }

          if (campaign?.config?.questions) {
            setQuestions(campaign.config.questions as Question[]);
          } else {
            setError('Configuration de campagne invalide');
          }
        } catch (err) {
          console.error('Error loading campaign:', err);
          setError('Erreur de chargement');
        }
      } else {
        const storedQuestions = localStorage.getItem('preview-questions');
        if (storedQuestions) {
          setQuestions(JSON.parse(storedQuestions));
        }
        
        const storedViewMode = localStorage.getItem('preview-viewMode');
        if (storedViewMode && !isMobileDevice) {
          setViewMode(storedViewMode as 'desktop' | 'mobile');
        }
      }
      
      setIsLoading(false);
    };

    loadConfig();
  }, [campaignId]);

  // Enregistrer la participation quand on arrive à la dernière question
  useEffect(() => {
    const recordResult = async () => {
      if (currentIndex === questions.length - 1 && campaignId && questions.length > 0) {
        try {
          await ParticipationService.recordParticipation({
            campaignId,
            result: { type: 'win' }, // Form completed = win
          });
        } catch (error) {
          console.error('Failed to record participation', error);
        }
      }
    };
    recordResult();
  }, [currentIndex, questions.length, campaignId]);

  if (isLoading) {
    return <div className="fixed inset-0 bg-background" />;
  }

  if (error) {
    return <div className="fixed inset-0 bg-background flex items-center justify-center">
      <p className="text-lg text-muted-foreground">{error}</p>
    </div>;
  }

  if (questions.length === 0) {
    return <div className="fixed inset-0 bg-background flex items-center justify-center">
      <p className="text-lg text-muted-foreground">Aucune question trouvée</p>
    </div>;
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
    const loadTheme = async () => {
      const campaignId = new URLSearchParams(window.location.search).get('id');
      
      if (campaignId) {
        try {
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('theme')
            .eq('id', campaignId)
            .single();

          if (campaign?.theme) {
            setInitialTheme(campaign.theme as ThemeSettings);
          }
        } catch (err) {
          console.error('Error loading theme:', err);
        }
      } else {
        const storedTheme = localStorage.getItem('preview-theme');
        if (storedTheme) {
          setInitialTheme(JSON.parse(storedTheme));
        }
      }
      
      setIsLoading(false);
    };

    loadTheme();
  }, []);

  if (isLoading) {
    return <div className="fixed inset-0 bg-background" />;
  }

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <PreviewContent />
    </ThemeProvider>
  );
};

export default Preview;
