/**
 * Utilitaires pour stocker et récupérer les durées par étape dans sessionStorage
 */

export const StepDurationStorage = {
  /**
   * Enregistrer la durée d'une étape
   */
  setStepDuration(
    campaignId: string,
    step: 'welcome' | 'contact' | 'game' | 'ending',
    durationSeconds: number
  ): void {
    try {
      const key = `step_durations_${campaignId}`;
      const existing = this.getStepDurations(campaignId);
      
      existing[step] = durationSeconds;
      
      sessionStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Error storing step duration:', error);
    }
  },

  /**
   * Récupérer toutes les durées enregistrées pour une campagne
   */
  getStepDurations(campaignId: string): Record<string, number> {
    try {
      const key = `step_durations_${campaignId}`;
      const stored = sessionStorage.getItem(key);
      
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error retrieving step durations:', error);
    }
    
    return {};
  },

  /**
   * Nettoyer les durées pour une campagne (après participation)
   */
  clearStepDurations(campaignId: string): void {
    try {
      const key = `step_durations_${campaignId}`;
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing step durations:', error);
    }
  },

  /**
   * Calculer le temps total passé
   */
  getTotalDuration(campaignId: string): number {
    const durations = this.getStepDurations(campaignId);
    const values = Object.values(durations) as number[];
    return values.reduce((sum, duration) => sum + duration, 0);
  }
};
