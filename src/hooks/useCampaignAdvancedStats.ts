import { useState, useEffect } from 'react';
import { ExternalBackendAnalyticsService } from '@/services/ExternalBackendAnalyticsService';
import type { 
  CampaignStatsAdvanced, 
  ParticipationByDay, 
  ConversionFunnel 
} from '@/services/ExternalBackendAnalyticsService';

interface UseCampaignAdvancedStatsOptions {
  campaignId: string | null;
  days?: number;
  enabled?: boolean;
}

export function useCampaignAdvancedStats({
  campaignId,
  days = 30,
  enabled = true,
}: UseCampaignAdvancedStatsOptions) {
  const [stats, setStats] = useState<CampaignStatsAdvanced | null>(null);
  const [participationsByDay, setParticipationsByDay] = useState<ParticipationByDay[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !campaignId) {
      setIsLoading(false);
      return;
    }

    const loadAdvancedStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [statsData, participationsData, funnelData] = await Promise.all([
          ExternalBackendAnalyticsService.getCampaignStats(campaignId),
          ExternalBackendAnalyticsService.getParticipationsByDay(campaignId, days),
          ExternalBackendAnalyticsService.getConversionFunnel(campaignId),
        ]);

        setStats(statsData);
        setParticipationsByDay(participationsData);
        setConversionFunnel(funnelData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(message);
        console.error('Error loading advanced stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdvancedStats();
  }, [campaignId, days, enabled]);

  return {
    stats,
    participationsByDay,
    conversionFunnel,
    isLoading,
    error,
  };
}
