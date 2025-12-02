import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * Redirects short URLs (/c/:shortId and /s/:shortId) to the full campaign URL
 */
export default function ShortRedirect() {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortId) {
      setError('Lien invalide');
      return;
    }

    findAndRedirect(shortId);
  }, [shortId]);

  const findAndRedirect = async (id: string) => {
    try {
      // Search for campaign where ID starts with the short ID
      const { data, error: supabaseError } = await supabase
        .from('campaigns')
        .select('id, type, is_published, public_url_slug')
        .ilike('id', `${id}%`)
        .limit(1)
        .maybeSingle();

      if (supabaseError) {
        console.error('Error finding campaign:', supabaseError);
        setError('Erreur lors de la recherche de la campagne');
        return;
      }

      if (!data) {
        setError('Campagne introuvable');
        return;
      }

      // If campaign is published and has a public slug, redirect to public URL
      if (data.is_published && data.public_url_slug) {
        navigate(`/p/${data.public_url_slug}`, { replace: true });
        return;
      }

      // Otherwise redirect to the preview page based on type
      const previewRoutes: Record<string, string> = {
        wheel: '/wheel-preview',
        jackpot: '/jackpot-preview',
        quiz: '/quiz-preview',
        scratch: '/scratch-preview',
        form: '/preview',
        catalog: '/catalog-preview'
      };

      const route = previewRoutes[data.type] || '/preview';
      navigate(`${route}?id=${data.id}`, { replace: true });
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Une erreur inattendue s\'est produite');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">😕</div>
          <h1 className="text-2xl font-bold text-foreground">{error}</h1>
          <p className="text-muted-foreground">
            Ce lien ne semble pas être valide ou la campagne n'existe plus.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirection en cours...</p>
      </div>
    </div>
  );
}

