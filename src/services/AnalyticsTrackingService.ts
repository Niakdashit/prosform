import { externalSupabase } from '@/integrations/supabase/externalClient';

/**
 * Service pour tracker les vues par étape dans les campagnes
 * Option 2 : Chaque écran (welcome, contact, jeu, ending) = +1 vue
 */

export const AnalyticsTrackingService = {
  /**
   * Track une vue pour une étape spécifique
   * @param campaignId ID de la campagne
   * @param step Type d'étape vue (welcome, contact, game, ending)
   */
  async trackStepView(campaignId: string, step: 'welcome' | 'contact' | 'game' | 'ending'): Promise<void> {
    try {
      console.log(`📊 Tracking view: ${step} for campaign ${campaignId}`);
      
      // Vérifier si une entrée existe déjà pour cette campagne
      const { data: existing } = await externalSupabase
        .from('campaign_analytics')
        .select('id, total_views')
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (existing) {
        // Incrémenter le compteur de vues
        const { error } = await externalSupabase
          .from('campaign_analytics')
          .update({
            total_views: (existing.total_views || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating view count:', error);
        }
      } else {
        // Créer une nouvelle entrée
        const { error } = await externalSupabase
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
      const { data: existing } = await externalSupabase
        .from('campaign_analytics')
        .select('id, total_views')
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (existing) {
        await externalSupabase
          .from('campaign_analytics')
          .update({
            total_views: (existing.total_views || 0) + count,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await externalSupabase
          .from('campaign_analytics')
          .insert({
            campaign_id: campaignId,
            total_views: count,
            total_participations: 0,
            total_completions: 0,
            avg_time_spent: 0,
          });
      }
    } catch (error) {
      console.error('Error in trackMultipleViews:', error);
    }
  }
};
