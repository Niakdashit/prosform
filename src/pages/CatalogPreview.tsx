import { useEffect, useState, useMemo } from "react";
import { CatalogConfig } from "@/components/CatalogBuilder";
import { ThemeProvider, ThemeSettings } from "@/contexts/ThemeContext";
import { CatalogPreview } from "@/components/CatalogPreview";
import { supabase } from "@/integrations/supabase/client";

const CatalogPreviewContent = () => {
  const [config, setConfig] = useState<CatalogConfig | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const campaignId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('id');
  }, []);

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
            setError('Catalogue non trouvé');
            setIsLoading(false);
            return;
          }

          if (campaign?.config) {
            setConfig(campaign.config as CatalogConfig);
          } else {
            setError('Configuration de catalogue invalide');
          }
        } catch (err) {
          console.error('Error loading campaign:', err);
          setError('Erreur de chargement');
        }
      } else {
        const savedConfig = localStorage.getItem('catalog-config');
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
        }
        
        const savedViewMode = localStorage.getItem('catalog-viewMode');
        if (savedViewMode && !isMobileDevice) {
          setViewMode(savedViewMode as 'desktop' | 'mobile');
        }
      }
      
      setIsLoading(false);
    };

    loadConfig();
  }, [campaignId]);

  if (isLoading) {
    return <div className="fixed inset-0 bg-background" />;
  }

  if (error) {
    return <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">{error}</p>
      </div>
    </div>;
  }

  if (!config) {
    return <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Aucune configuration trouvée</p>
      </div>
    </div>;
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <CatalogPreview
        config={config}
        onUpdateConfig={() => {}}
        viewMode={viewMode}
        onToggleViewMode={() => {}}
        selectedItemId={null}
        onSelectItem={() => {}}
        onUpdateItem={() => {}}
        isReadOnly={true}
      />
    </div>
  );
};

const CatalogPreviewPage = () => {
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
        const savedTheme = localStorage.getItem('catalog-theme');
        if (savedTheme) {
          setTheme(JSON.parse(savedTheme));
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
    <ThemeProvider initialTheme={theme}>
      <CatalogPreviewContent />
    </ThemeProvider>
  );
};

export default CatalogPreviewPage;
