import { supabase } from '@/integrations/supabase/client';

export interface ParticipationData {
  campaignId: string;
  email?: string;
  contactData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  result: {
    type: 'win' | 'lose';
    prize?: string;
    score?: number;
    answers?: any;
  };
}

/**
 * Service pour enregistrer les participations aux campagnes
 */
export const ParticipationService = {
  /**
   * Enregistre une participation dans la base de données
   */
  async recordParticipation(data: ParticipationData): Promise<void> {
    try {
      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: data.campaignId,
          email: data.email || data.contactData?.email,
          participation_data: {
            contactData: data.contactData,
            result: data.result,
            timestamp: new Date().toISOString(),
          },
          completed_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error recording participation:', error);
        throw error;
      }

      // Mettre à jour les analytics de la campagne (table campaign_analytics)
      const { data: existingAnalytics, error: fetchError } = await supabase
        .from('campaign_analytics')
        .select('id, total_views, total_participations, total_completions')
        .eq('campaign_id', data.campaignId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching campaign analytics:', fetchError);
        return;
      }

      const isWin = data.result.type === 'win';

      if (!existingAnalytics) {
        const { error: insertAnalyticsError } = await supabase
          .from('campaign_analytics')
          .insert({
            campaign_id: data.campaignId,
            total_views: 1,
            total_participations: 1,
            total_completions: isWin ? 1 : 0,
            last_participation_at: new Date().toISOString(),
          });

        if (insertAnalyticsError) {
          console.error('Error inserting campaign analytics:', insertAnalyticsError);
        }
      } else {
        const { error: updateAnalyticsError } = await supabase
          .from('campaign_analytics')
          .update({
            total_views: (existingAnalytics.total_views || 0) + 1,
            total_participations: (existingAnalytics.total_participations || 0) + 1,
            total_completions: (existingAnalytics.total_completions || 0) + (isWin ? 1 : 0),
            last_participation_at: new Date().toISOString(),
          })
          .eq('id', existingAnalytics.id);

        if (updateAnalyticsError) {
          console.error('Error updating campaign analytics:', updateAnalyticsError);
        }
      }
    } catch (err) {
      console.error('Failed to record participation:', err);
      // Ne pas bloquer l'expérience utilisateur si l'enregistrement échoue
    }
  },
};
