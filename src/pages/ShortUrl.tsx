import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * Page pour les Short URLs (/c/:shortId)
 * Redirige vers la preview avec l'ID en paramètre
 */
export default function ShortUrl() {
  const { shortId } = useParams<{ shortId: string }>();
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shortId) {
      setError('Lien invalide');
      setLoading(false);
      return;
    }

    findCampaign(shortId);
  }, [shortId]);

  const findCampaign = async (id: string) => {
    try {
      // Chercher toutes les campagnes
      const { data: campaigns, error: supabaseError } = await supabase
        .from('campaigns')
        .select('id, type, config')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('Error loading campaigns:', supabaseError);
        setError('Erreur lors du chargement');
        setLoading(false);
        return;
      }

      // D'abord chercher par shortSlug personnalisé dans la config
      let found = campaigns?.find(c => 
        (c.config as any)?.shortSlug === id
      );

      // Sinon chercher par ID qui commence par ce shortId
      if (!found) {
        found = campaigns?.find(c => 
          c.id.replace(/-/g, '').startsWith(id)
        );
      }

      if (!found) {
        setError('Campagne introuvable');
        setLoading(false);
        return;
      }

      // Construire l'URL de redirection
      const isArticle = (found.config as any)?.mode === 'article';
      const previewPath = isArticle 
        ? `article-${found.type}-preview`
        : `${found.type}-preview`;
      
      setRedirectUrl(`/${previewPath}?id=${found.id}`);
      setLoading(false);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Une erreur inattendue s\'est produite');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">😕</div>
          <h1 className="text-2xl font-bold text-foreground">Lien invalide</h1>
          <p className="text-muted-foreground">{error}</p>
          <a
            href="/"
            className="mt-4 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  // Rediriger vers la preview
  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace />;
  }

  return null;
}
