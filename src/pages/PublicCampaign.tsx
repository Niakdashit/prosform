import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Campaign } from '@/types/campaign';
import { Loader2 } from 'lucide-react';
import { PublicCampaignRenderer } from '@/components/PublicCampaignRenderer';

/**
 * Page publique pour les campagnes accessibles via /p/[slug]
 * Charge et affiche une campagne publiée pour permettre la participation
 */
export default function PublicCampaign() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Lien invalide');
      setLoading(false);
      return;
    }

    loadCampaign(slug);
  }, [slug]);

  const loadCampaign = async (campaignSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      // Charger la campagne depuis le slug public
      const { data, error: supabaseError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('public_url_slug', campaignSlug)
        .eq('is_published', true) // Seulement les campagnes publiées
        .single();

      if (supabaseError) {
        console.error('Error loading campaign:', supabaseError);
        if (supabaseError.code === 'PGRST116') {
          setError('Cette campagne n\'existe pas ou n\'est plus disponible.');
        } else {
          setError('Erreur lors du chargement de la campagne.');
        }
        setLoading(false);
        return;
      }

      if (!data) {
        setError('Cette campagne n\'existe pas ou n\'est plus disponible.');
        setLoading(false);
        return;
      }

      // Vérifier les dates de validité
      const now = new Date();
      if (data.starts_at && new Date(data.starts_at) > now) {
        setError('Cette campagne n\'a pas encore démarré.');
        setLoading(false);
        return;
      }

      if (data.ends_at && new Date(data.ends_at) < now) {
        setError('Cette campagne est terminée.');
        setLoading(false);
        return;
      }

      // Vérifier la limite de participations
      if (data.participation_limit && data.participation_count >= data.participation_limit) {
        setError('Cette campagne a atteint sa limite de participations.');
        setLoading(false);
        return;
      }

      // Transformer les données pour avoir le bon format
      const transformedCampaign: Campaign = {
        ...data,
        name: data.name || data.app_title || 'Campagne',
      };

      setCampaign(transformedCampaign);
      
      // TODO Phase 3: Enregistrer une vue dans campaign_analytics
      
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Une erreur inattendue s\'est produite.');
    } finally {
      setLoading(false);
    }
  };

  // État de chargement
  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  // État d'erreur
  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">😕</div>
          <h1 className="text-2xl font-bold text-foreground">{error || 'Campagne introuvable'}</h1>
          <p className="text-muted-foreground">
            Cette campagne n'est pas disponible. Elle a peut-être été supprimée ou n'est plus active.
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

  // Afficher la campagne
  return (
    <div className="min-h-screen bg-background">
      <PublicCampaignRenderer campaign={campaign} />
    </div>
  );
}
