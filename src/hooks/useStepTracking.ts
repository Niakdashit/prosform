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
  const isTracking = useRef<boolean>(false); // Éviter les appels concurrents
  const endingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endingDurationTracked = useRef<boolean>(false);

  useEffect(() => {
    if (!isEnabled || !campaignId) return;
    
    // Éviter les appels concurrents (React StrictMode peut appeler 2 fois)
    if (isTracking.current) return;

    const now = Date.now();

    // Si on change d'étape, calculer la durée de l'étape précédente
    if (previousStep.current && previousStep.current !== currentStep) {
      const duration = Math.round((now - stepStartTime.current) / 1000); // en secondes
      
      // Track l'étape précédente avec sa durée (le service gère le double-comptage)
      AnalyticsTrackingService.trackStepView(
        campaignId,
        previousStep.current,
        duration
      );
      
      // Track la nouvelle étape (sans durée car elle commence maintenant)
      AnalyticsTrackingService.trackStepView(campaignId, currentStep);
      
      // Nettoyer le timeout de l'ending précédent si on change d'étape
      if (endingTimeoutRef.current) {
        clearTimeout(endingTimeoutRef.current);
        endingTimeoutRef.current = null;
      }
    }

    // Si c'est la première fois, tracker la vue initiale
    if (!previousStep.current) {
      isTracking.current = true;
      AnalyticsTrackingService.trackStepView(campaignId, currentStep).finally(() => {
        isTracking.current = false;
      });
    }
    
    // Reset le timer pour la nouvelle étape si changement
    if (!previousStep.current || previousStep.current !== currentStep) {
      stepStartTime.current = now;
      previousStep.current = currentStep;
      endingDurationTracked.current = false;
    }
    
    // Si on arrive sur l'ending, programmer un tracking automatique après 5 secondes
    // (l'utilisateur reste généralement sur cette page sans naviguer ailleurs)
    if (currentStep === 'ending' && !endingDurationTracked.current) {
      endingTimeoutRef.current = setTimeout(() => {
        if (previousStep.current === 'ending' && !endingDurationTracked.current) {
          const duration = Math.round((Date.now() - stepStartTime.current) / 1000);
          AnalyticsTrackingService.trackStepDuration(campaignId, 'ending', duration);
          endingDurationTracked.current = true;
        }
      }, 5000); // 5 secondes sur l'ending
    }
  }, [campaignId, currentStep, isEnabled]);

  // Cleanup au démontage du composant
  useEffect(() => {
    return () => {
      // Nettoyer le timeout
      if (endingTimeoutRef.current) {
        clearTimeout(endingTimeoutRef.current);
      }
      
      if (!isEnabled || !campaignId || !previousStep.current) return;
      
      // Ne tracker que si pas déjà fait
      if (!endingDurationTracked.current) {
        const duration = Math.round((Date.now() - stepStartTime.current) / 1000);
        AnalyticsTrackingService.trackStepDuration(
          campaignId,
          previousStep.current,
          duration
        );
      }
    };
  }, [campaignId, isEnabled]);

  return {
    getCurrentStepDuration: () => Math.round((Date.now() - stepStartTime.current) / 1000)
  };
};
