import { supabase } from '@/integrations/supabase/client';

export interface PublishResponse {
  success: boolean;
  slug?: string;
  publicUrl?: string;
  message?: string;
  error?: string;
}

/**
 * Service pour gérer la publication des campagnes
 */
export const PublishService = {
  /**
   * Publier une campagne
   */
  async publish(campaignId: string): Promise<PublishResponse> {
    try {
      // Récupérer la campagne pour vérifier son état actuel
      const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (fetchError || !campaign) {
        console.error('❌ [PublishService] Fetch error:', fetchError);
        return {
          success: false,
          error: 'Campagne introuvable ou accès refusé',
        };
      }

      // Si déjà publiée, on renvoie directement les infos
      if (campaign.is_published && campaign.public_url_slug) {
        const publicUrl = `${window.location.origin}/p/${campaign.public_url_slug}`;
        return {
          success: true,
          slug: campaign.public_url_slug,
          publicUrl,
          message: 'Campagne déjà publiée',
        };
      }

      if (!campaign.title || campaign.title.trim() === '') {
        return {
          success: false,
          error: 'La campagne doit avoir un titre pour être publiée',
        };
      }

      // Générer un slug unique via la fonction SQL sécurisée
      const { data: slugData, error: slugError } = await supabase.rpc(
        'generate_campaign_slug',
        {
          campaign_title: campaign.title,
          campaign_id: campaignId,
        }
      );

      if (slugError || !slugData) {
        console.error('❌ [PublishService] Slug error:', slugError);
        return {
          success: false,
          error: 'Impossible de générer une URL publique',
        };
      }

      const slug = slugData as string;
      const publicUrl = `${window.location.origin}/p/${slug}`;

      // Mettre à jour la campagne
      const { data: updatedCampaign, error: updateError } = await supabase
        .from('campaigns')
        .update({
          is_published: true,
          status: 'online',
          published_at: new Date().toISOString(),
          public_url_slug: slug,
          published_url: publicUrl,
          last_edited_at: new Date().toISOString(),
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [PublishService] Update error:', updateError);
        return {
          success: false,
          error: "Erreur lors de la mise à jour de la campagne",
        };
      }

      // Initialiser les analytics si besoin (upsert sur la clé campaign_id)
      const { error: analyticsError } = await supabase
        .from('campaign_analytics')
        .upsert(
          {
            campaign_id: campaignId,
            total_views: 0,
            total_participations: 0,
            total_completions: 0,
            avg_time_spent: 0,
          },
          {
            onConflict: 'campaign_id',
          }
        );

      if (analyticsError) {
        console.warn('⚠️ [PublishService] Analytics init warning:', analyticsError);
      }

      console.log('✅ [PublishService] Campaign published:', publicUrl);
      return {
        success: true,
        campaign: updatedCampaign,
        slug,
        publicUrl,
        message: 'Campagne publiée avec succès',
      } as any;
    } catch (error) {
      console.error('❌ [PublishService] Publish error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish campaign',
      };
    }
  },

  /**
   * Dépublier une campagne
   */
  async unpublish(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          is_published: false,
          status: 'draft',
        })
        .eq('id', campaignId);

      if (error) {
        console.error('❌ [PublishService] Unpublish error:', error);
        return false;
      }

      console.log('✅ [PublishService] Campaign unpublished');
      return true;
    } catch (error) {
      console.error('❌ [PublishService] Unpublish error:', error);
      return false;
    }
  },
};
