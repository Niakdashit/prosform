import { supabase } from '@/integrations/supabase/client';
import { StepDurationStorage } from '@/utils/stepDurationStorage';

/**
 * Service pour tracker les vues par étape dans les campagnes
 * Option 2 : Chaque écran (welcome, contact, jeu, ending) = +1 vue
 */

export const AnalyticsTrackingService = {
  /**
   * Track une vue pour une étape spécifique avec durée optionnelle
   * @param campaignId ID de la campagne
   * @param step Type d'étape vue (welcome, contact, game, ending)
   * @param durationSeconds Durée passée sur l'étape (en secondes), optionnel
   */
  async trackStepView(
    campaignId: string, 
    step: 'welcome' | 'contact' | 'game' | 'ending',
    durationSeconds?: number
  ): Promise<void> {
    try {
      console.log(`📊 Tracking view: ${step} for campaign ${campaignId}${durationSeconds ? ` (duration: ${durationSeconds}s)` : ''}`);
      
      // Stocker la durée dans sessionStorage pour la récupérer lors de la participation
      if (durationSeconds !== undefined && durationSeconds > 0) {
        StepDurationStorage.setStepDuration(campaignId, step, durationSeconds);
      }
      
      // Vérifier si une entrée existe déjà pour cette campagne
      const { data: existing, error: fetchError } = await supabase
        .from('campaign_analytics')
        .select('id, total_views, avg_time_spent')
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching analytics for view tracking:', fetchError);
        return;
      }

      if (existing) {
        // Incrémenter total_views à chaque étape vue
        const updateData: any = {
          total_views: (existing.total_views || 0) + 1,
          updated_at: new Date().toISOString(),
        };

        // Si une durée est fournie, recalculer avg_time_spent
        if (durationSeconds !== undefined && durationSeconds > 0) {
          const currentTotalTime = (existing.avg_time_spent || 0) * (existing.total_views || 0);
          const newTotalViews = (existing.total_views || 0) + 1;
          const newAvgTime = (currentTotalTime + durationSeconds) / newTotalViews;
          updateData.avg_time_spent = Math.round(newAvgTime);
        }

        const { error } = await supabase
          .from('campaign_analytics')
          .update(updateData)
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating view count:', error);
        }
      } else {
        // Créer une nouvelle entrée avec 1 vue
        const { error } = await supabase
          .from('campaign_analytics')
          .insert({
            campaign_id: campaignId,
            total_views: 1,
            total_participations: 0,
            total_completions: 0,
            avg_time_spent: 0,
          });

        if (error) {
          console.error('Error creating analytics entry:', error);
        }
      }
    } catch (error) {
      // Ne pas bloquer l'expérience utilisateur en cas d'erreur de tracking
      console.error('Error in trackStepView:', error);
    }
  },

  /**
   * Track plusieurs vues d'un coup (pour des cas spéciaux)
   */
  async trackMultipleViews(campaignId: string, count: number): Promise<void> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('campaign_analytics')
        .select('id, total_views')
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching analytics for multiple view tracking:', fetchError);
        return;
      }

      if (existing) {
        const { error } = await supabase
          .from('campaign_analytics')
          .update({
            total_views: (existing.total_views || 0) + count,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating multiple view count:', error);
        }
      } else {
        const { error } = await supabase
          .from('campaign_analytics')
          .insert({
            campaign_id: campaignId,
            total_views: count,
            total_participations: 0,
            total_completions: 0,
            avg_time_spent: 0,
          });

        if (error) {
          console.error('Error creating analytics entry for multiple views:', error);
        }
      }
    } catch (error) {
      console.error('Error in trackMultipleViews:', error);
    }
  }
};
