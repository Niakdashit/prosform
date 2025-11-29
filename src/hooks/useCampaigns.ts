import { useState, useEffect, useCallback } from 'react';
import { CampaignService } from '@/services/CampaignService';
import type { Campaign } from '@/types/campaign';

interface UseCampaignsReturn {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteCampaign: (id: string) => Promise<boolean>;
  duplicateCampaign: (id: string) => Promise<Campaign | null>;
}

export function useCampaigns(): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await CampaignService.getAll();
      setCampaigns(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const deleteCampaign = useCallback(async (id: string): Promise<boolean> => {
    try {
      await CampaignService.delete(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  }, []);

  const duplicateCampaign = useCallback(async (id: string): Promise<Campaign | null> => {
    try {
      const duplicated = await CampaignService.duplicate(id);
      setCampaigns(prev => [duplicated, ...prev]);
      return duplicated;
    } catch (err) {
      console.error('Duplicate error:', err);
      return null;
    }
  }, []);

  return {
    campaigns,
    isLoading,
    error,
    refetch: fetchCampaigns,
    deleteCampaign,
    duplicateCampaign,
  };
}
