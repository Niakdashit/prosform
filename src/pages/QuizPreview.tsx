import { useEffect, useState, useMemo } from "react";
import { QuizConfig } from "@/components/QuizBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { QuizPreview } from "@/components/QuizPreview";
import { supabase } from "@/integrations/supabase/client";
import { useStepTracking } from "@/hooks/useStepTracking";
import { ParticipationService } from "@/services/ParticipationService";

const QuizPreviewContent = () => {
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'question' | 'result'>('welcome');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactData, setContactData] = useState<Record<string, string>>({});

  // Récupérer le campaignId depuis l'URL
  const campaignId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('id');
  }, []);

  // Convertir activeView pour le tracking
  const trackingStep = useMemo(() => {
    if (activeView === 'question') return 'game';
    if (activeView === 'result') return 'ending';
    return activeView as 'welcome' | 'contact';
  }, [activeView]);

  // Hook de tracking des étapes
  useStepTracking(campaignId || '', trackingStep, !!campaignId && !!config);

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

          if (campaign?.config) {
            setConfig(campaign.config as QuizConfig);
          } else {
            setError('Configuration de campagne invalide');
          }
        } catch (err) {
          console.error('Error loading campaign:', err);
          setError('Erreur de chargement');
        }
      } else {
        const savedConfig = localStorage.getItem('quiz-config');
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
        }
        
        const savedViewMode = localStorage.getItem('quiz-viewMode');
        if (savedViewMode && !isMobileDevice) {
          setViewMode(savedViewMode as 'desktop' | 'mobile');
        }
      }
      
      setIsLoading(false);
    };

    loadConfig();
  }, [campaignId]);

  // Enregistrer la participation quand on arrive au résultat
  useEffect(() => {
    const recordResult = async () => {
      if (activeView === 'result' && campaignId) {
        try {
          // Helper pour trouver une valeur par plusieurs clés possibles
          const findValue = (...keys: string[]) => {
            for (const key of keys) {
              if (contactData[key]) return contactData[key];
            }
            // Fallback: chercher par clé partielle (insensible à la casse)
            for (const key of keys) {
              const found = Object.entries(contactData).find(([k]) => 
                k.toLowerCase().replace(/[_\s-]/g, '').includes(key.toLowerCase().replace(/[_\s-]/g, ''))
              );
              if (found) return found[1];
            }
            return undefined;
          };

          // Pas de conversion - on envoie la valeur telle quelle (Homme, Femme, Non-binaire)
          const convertSalutation = (value?: string) => value;

          // Convertir genre français vers format standard
          const convertGender = (value?: string) => {
            if (!value) return undefined;
            const lower = value.toLowerCase();
            if (lower === 'homme' || lower === 'masculin' || lower === 'male' || lower === 'm') return 'male';
            if (lower === 'femme' || lower === 'féminin' || lower === 'female' || lower === 'f') return 'female';
            if (lower === 'non-binaire' || lower === 'non binaire' || lower === 'autre' || lower === 'other') return 'other';
            return value;
          };

          const email = findValue('email');
          const rawSalutation = findValue('salutation', 'civilite', 'civilité', 'title', 'titre', 'Civilité');
          const rawGender = findValue('gender', 'sexe', 'genre');
          
          await ParticipationService.recordParticipation({
            campaignId,
            email,
            contactData: {
              // Champs de base
              firstName: findValue('firstName', 'prenom', 'prénom', 'first_name', 'Prénom'),
              lastName: findValue('lastName', 'nom', 'last_name', 'Nom'),
              name: contactData.name || `${findValue('firstName', 'prenom', 'Prénom') || ''} ${findValue('lastName', 'nom', 'Nom') || ''}`.trim(),
              email,
              phone: findValue('phone', 'telephone', 'téléphone', 'tel', 'mobile', 'Téléphone'),
              // Champs d'adresse
              address: findValue('address', 'adresse', 'rue', 'street', 'Adresse'),
              city: findValue('city', 'ville', 'town', 'Ville'),
              postalCode: findValue('postalCode', 'codePostal', 'code_postal', 'cp', 'zip', 'zipcode', 'Code Postal', 'Code postal'),
              country: findValue('country', 'pays', 'Pays'),
              // Champs professionnels
              company: findValue('company', 'entreprise', 'societe', 'société', 'Entreprise'),
              jobTitle: findValue('jobTitle', 'poste', 'fonction', 'job_title', 'job', 'Poste'),
              industry: findValue('industry', 'secteur', 'secteur_activite', 'Secteur', 'Secteur d\'activité'),
              companySize: findValue('companySize', 'company_size', 'taille_entreprise', 'Taille entreprise', 'Effectif'),
              website: findValue('website', 'site_web', 'siteweb', 'Site web', 'URL'),
              linkedin: findValue('linkedin', 'linkedIn', 'LinkedIn'),
              // Champs personnels
              birthdate: findValue('birthdate', 'dateNaissance', 'date_naissance', 'birthday', 'dob', 'Date de naissance'),
              salutation: convertSalutation(rawSalutation),
              gender: convertGender(rawGender),
              nationality: findValue('nationality', 'nationalite', 'nationalité', 'Nationalité'),
              language: findValue('language', 'langue', 'Langue', 'langue_preferee', 'Langue préférée'),
              maritalStatus: findValue('maritalStatus', 'situation_familiale', 'Situation familiale', 'statut_marital'),
              // Champs marketing
              leadSource: findValue('leadSource', 'source', 'lead_source', 'Source', 'Comment nous avez-vous connu'),
              gdprConsent: findValue('gdprConsent', 'rgpd', 'consentement', 'consent', 'newsletter', 'optin', 'opt_in'),
              interests: findValue('interests', 'interets', 'intérêts', 'centres_interet', 'Centre d\'intérêts'),
              // Champs e-commerce / fidélité
              customerId: findValue('customerId', 'customer_id', 'numero_client', 'Numéro client', 'ID client'),
              loyaltyCard: findValue('loyaltyCard', 'loyalty_card', 'carte_fidelite', 'Carte fidélité', 'Programme fidélité'),
              preferredStore: findValue('preferredStore', 'preferred_store', 'magasin_prefere', 'Magasin préféré', 'Magasin'),
              ...contactData, // Inclure tous les autres champs personnalisés
            },
            result: { type: 'win' }, // Quiz completed = win
          });
        } catch (error) {
          console.error('Failed to record participation', error);
        }
      }
    };
    recordResult();
  }, [activeView, campaignId, contactData]);

  if (isLoading) {
    return <div className="fixed inset-0" style={{ backgroundColor: '#1a1a2e' }} />;
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p className="text-white">{error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <p className="text-white">Aucune configuration trouvée</p>
      </div>
    );
  }

  const handleNext = () => {
    if (activeView === 'welcome') {
      if (config.contactScreen?.enabled) {
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
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <QuizPreview
        config={config}
        activeView={activeView}
        activeQuestionIndex={activeQuestionIndex}
        onUpdateConfig={() => {}}
        viewMode={viewMode}
        onToggleViewMode={() => {}}
        isMobileResponsive={true}
        isReadOnly={true}
        onNext={handleNext}
        onContactDataChange={setContactData}
      />
    </div>
  );
};

const QuizPreviewPage = () => {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
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
            setTheme(campaign.theme as ThemeSettings);
          }
        } catch (err) {
          console.error('Error loading theme:', err);
        }
      } else {
        const savedTheme = localStorage.getItem('quiz-theme');
        if (savedTheme) {
          setTheme(JSON.parse(savedTheme));
        }
      }
      
      setIsLoading(false);
    };

    loadTheme();
  }, []);

  if (isLoading) {
    return <div className="fixed inset-0" style={{ backgroundColor: '#1a1a2e' }} />;
  }

  return (
    <ThemeProvider initialTheme={theme}>
      <QuizPreviewContent />
    </ThemeProvider>
  );
};

export default QuizPreviewPage;
