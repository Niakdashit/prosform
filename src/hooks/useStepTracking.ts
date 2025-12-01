import { useEffect, useRef } from 'react';
import { AnalyticsTrackingService } from '@/services/AnalyticsTrackingService';

/**
 * Hook pour tracker le temps passé sur chaque étape
 * Enregistre automatiquement le timestamp d'entrée et calcule la durée au changement d'étape
 */
export const useStepTracking = (
  campaignId: string,
  currentStep: 'welcome' | 'contact' | 'game' | 'ending',
  isEnabled: boolean = true
) => {
  const stepStartTime = useRef<number>(Date.now());
  const previousStep = useRef<typeof currentStep | null>(null);

  useEffect(() => {
    if (!isEnabled || !campaignId) return;

    const now = Date.now();

    // Si on change d'étape, calculer la durée de l'étape précédente
    if (previousStep.current && previousStep.current !== currentStep) {
      const duration = Math.round((now - stepStartTime.current) / 1000); // en secondes
      
      // Track l'étape précédente avec sa durée
      AnalyticsTrackingService.trackStepView(
        campaignId,
        previousStep.current,
        duration
      );
    }

    // Si c'est la première fois ou un changement d'étape, tracker la nouvelle vue
    if (!previousStep.current || previousStep.current !== currentStep) {
      // On ne track pas encore la durée pour la nouvelle étape (elle commence maintenant)
      if (!previousStep.current) {
        // Premier rendu uniquement
        AnalyticsTrackingService.trackStepView(campaignId, currentStep);
      }
      
      // Reset le timer pour la nouvelle étape
      stepStartTime.current = now;
      previousStep.current = currentStep;
    }
  }, [campaignId, currentStep, isEnabled]);

  // Cleanup au démontage du composant
  useEffect(() => {
    return () => {
      if (!isEnabled || !campaignId || !previousStep.current) return;
      
      const duration = Math.round((Date.now() - stepStartTime.current) / 1000);
      AnalyticsTrackingService.trackStepView(
        campaignId,
        previousStep.current,
        duration
      );
    };
  }, [campaignId, isEnabled]);

  return {
    getCurrentStepDuration: () => Math.round((Date.now() - stepStartTime.current) / 1000)
  };
};
