import { supabase } from '@/integrations/supabase/client';
import { StepDurationStorage } from '@/utils/stepDurationStorage';

/**
 * Service pour tracker les vues par étape dans les campagnes
 * Option 2 : Chaque écran (welcome, contact, jeu, ending) = +1 vue
 * 
 * Définitions:
 * - total_views: nombre total d'étapes vues (progression réelle)
 * - total_participations: nombre de jeux joués/formulaires validés (géré par ParticipationService)
 * - total_completions: nombre d'endings vus (win OU lose)
 * - avg_time_spent: moyenne pondérée du temps par étape
 * 
 * Stockage:
 * - campaign_analytics: agrégats globaux par campagne
 * - daily_analytics: données journalières pour les séries temporelles
 */

// Helper pour obtenir la date du jour au format YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Clé pour éviter le double comptage dans la même session
const getSessionKey = (campaignId: string, step: string) => 
  `tracked_step_${campaignId}_${step}`;

export const AnalyticsTrackingService = {
  /**
   * Vérifie si une étape a déjà été trackée dans cette session
   */
  isStepAlreadyTracked(campaignId: string, step: string): boolean {
    try {
      return sessionStorage.getItem(getSessionKey(campaignId, step)) === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Marque une étape comme trackée dans cette session
   */
  markStepAsTracked(campaignId: string, step: string): void {
    try {
      sessionStorage.setItem(getSessionKey(campaignId, step), 'true');
    } catch {
      // Ignore sessionStorage errors
    }
  },

  /**
   * Réinitialise le tracking de session (pour "Rejouer")
   */
  resetSessionTracking(campaignId: string): void {
    try {
      ['welcome', 'contact', 'game', 'ending'].forEach(step => {
        sessionStorage.removeItem(getSessionKey(campaignId, step));
      });
    } catch {
      // Ignore sessionStorage errors
    }
  },

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
      // Éviter le double comptage dans la même session
      const isFirstTimeThisSession = !this.isStepAlreadyTracked(campaignId, step);
      
      // Stocker la durée dans sessionStorage pour la récupérer lors de la participation
      if (durationSeconds !== undefined && durationSeconds > 0) {
        StepDurationStorage.setStepDuration(campaignId, step, durationSeconds);
      }

      // Si déjà tracké dans cette session, ne pas incrémenter les compteurs
      if (!isFirstTimeThisSession) {
        return;
      }
      
      // Marquer comme tracké
      this.markStepAsTracked(campaignId, step);
      
      // Vérifier si une entrée existe déjà pour cette campagne
      const { data: existing, error: fetchError } = await supabase
        .from('campaign_analytics')
        .select('id, total_views, total_completions, avg_time_spent')
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

        // Si c'est l'étape "ending", incrémenter total_completions
        if (step === 'ending') {
          updateData.total_completions = (existing.total_completions || 0) + 1;
        }

        // Si une durée est fournie, recalculer avg_time_spent avec moyenne mobile
        if (durationSeconds !== undefined && durationSeconds > 0) {
          // Moyenne mobile pondérée : 70% ancien, 30% nouveau
          const currentAvg = existing.avg_time_spent || 0;
          const newAvg = currentAvg > 0 
            ? Math.round(currentAvg * 0.7 + durationSeconds * 0.3)
            : durationSeconds;
          updateData.avg_time_spent = newAvg;
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
            total_completions: step === 'ending' ? 1 : 0,
            avg_time_spent: durationSeconds || 0,
          });

        if (error) {
          console.error('Error creating analytics entry:', error);
        }
      }
      
      // Mettre à jour daily_analytics pour les séries temporelles réelles
      await this.updateDailyAnalytics(campaignId, {
        views: 1,
        completions: step === 'ending' ? 1 : 0,
        timeSpent: durationSeconds,
      });
    } catch (error) {
      // Ne pas bloquer l'expérience utilisateur en cas d'erreur de tracking
      console.error('Error in trackStepView:', error);
    }
  },
  
  /**
   * Met à jour les analytics journalières (pour les séries temporelles réelles)
   */
  async updateDailyAnalytics(
    campaignId: string,
    data: { views?: number; participations?: number; completions?: number; timeSpent?: number }
  ): Promise<void> {
    try {
      const today = getTodayDate();
      
      // Vérifier si une entrée existe pour aujourd'hui
      const { data: existing, error: fetchError } = await supabase
        .from('daily_analytics')
        .select('id, views, participations, completions, avg_time_spent, time_spent_count')
        .eq('campaign_id', campaignId)
        .eq('date', today)
        .maybeSingle();

      if (fetchError) {
        // Table n'existe peut-être pas encore, ignorer silencieusement
        return;
      }

      if (existing) {
        // Mettre à jour l'entrée existante
        const updateData: any = {
          updated_at: new Date().toISOString(),
        };
        
        if (data.views) updateData.views = (existing.views || 0) + data.views;
        if (data.participations) updateData.participations = (existing.participations || 0) + data.participations;
        if (data.completions) updateData.completions = (existing.completions || 0) + data.completions;
        
        // Calcul de la vraie moyenne avec compteur
        if (data.timeSpent && data.timeSpent > 0) {
          const newCount = (existing.time_spent_count || 0) + 1;
          const totalTime = (existing.avg_time_spent || 0) * (existing.time_spent_count || 0) + data.timeSpent;
          updateData.avg_time_spent = Math.round(totalTime / newCount);
          updateData.time_spent_count = newCount;
        }

        await supabase
          .from('daily_analytics')
          .update(updateData)
          .eq('id', existing.id);
      } else {
        // Créer une nouvelle entrée pour aujourd'hui
        await supabase
          .from('daily_analytics')
          .insert({
            campaign_id: campaignId,
            date: today,
            views: data.views || 0,
            participations: data.participations || 0,
            completions: data.completions || 0,
            avg_time_spent: data.timeSpent || 0,
            time_spent_count: data.timeSpent && data.timeSpent > 0 ? 1 : 0,
          });
      }
    } catch (error) {
      // Ignorer silencieusement - la table n'existe peut-être pas encore
    }
  },

  /**
   * Track uniquement la durée d'une étape (sans incrémenter les compteurs)
   * Utilisé pour le tracking de l'ending après un délai
   */
  async trackStepDuration(
    campaignId: string,
    step: 'welcome' | 'contact' | 'game' | 'ending',
    durationSeconds: number
  ): Promise<void> {
    try {
      if (durationSeconds <= 0) return;
      
      // Stocker la durée dans sessionStorage
      StepDurationStorage.setStepDuration(campaignId, step, durationSeconds);
      
      // Mettre à jour avg_time_spent sans incrémenter les compteurs
      const { data: existing, error: fetchError } = await supabase
        .from('campaign_analytics')
        .select('id, avg_time_spent, total_views')
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (fetchError || !existing) {
        return; // Pas d'entrée existante, rien à mettre à jour
      }

      // Moyenne mobile pondérée : 70% ancien, 30% nouveau
      const currentAvg = existing.avg_time_spent || 0;
      const newAvg = currentAvg > 0 
        ? Math.round(currentAvg * 0.7 + durationSeconds * 0.3)
        : durationSeconds;

      await supabase
        .from('campaign_analytics')
        .update({
          avg_time_spent: newAvg,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } catch (error) {
      console.error('Error in trackStepDuration:', error);
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
