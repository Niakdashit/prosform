import { useState, useEffect, useCallback, useRef } from 'react';
import { CampaignService } from '@/services/CampaignService';
import type { Campaign, CampaignType } from '@/types/campaign';
import { toast } from 'sonner';

interface UseCampaignOptions {
  campaignId?: string | null;
  type: CampaignType;
  defaultName?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useCampaign(
  options: UseCampaignOptions,
  defaultConfig: any
) {
  const { campaignId, type, defaultName = 'Nouvelle campagne', autoSave = false, autoSaveDelay = 3000 } = options;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [config, setConfigState] = useState<any>(defaultConfig);
  const [prizes, setPrizesState] = useState<any[]>([]);
  const [name, setName] = useState(defaultName);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const hasChanges = useRef(false);

  // Charger la campagne si ID fourni
  useEffect(() => {
    if (!campaignId) return;

    const loadCampaign = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await CampaignService.getById(campaignId);
        if (data) {
          setCampaign(data);
          setConfigState(data.config);
          setPrizesState(data.prizes || []);
          setName(data.name);
          console.log('✅ Campaign loaded:', data.id);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(message);
        toast.error('Erreur lors du chargement de la campagne');
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [campaignId]);

  // Auto-save avec debounce
  useEffect(() => {
    if (!autoSave || !hasChanges.current || !campaign?.id) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      save();
      hasChanges.current = false;
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [config, prizes, autoSave, autoSaveDelay]);

  // Setter pour config avec tracking des changements
  const setConfig = useCallback((updater: any) => {
    setConfigState((prev: any) => {
      const newConfig = typeof updater === 'function' ? updater(prev) : updater;
      hasChanges.current = true;
      return newConfig;
    });
  }, []);

  // Setter pour prizes
  const setPrizes = useCallback((updater: any) => {
    setPrizesState((prev: any[]) => {
      const newPrizes = typeof updater === 'function' ? updater(prev) : updater;
      hasChanges.current = true;
      return newPrizes;
    });
  }, []);

  // Sauvegarder la campagne
  const save = useCallback(async (): Promise<Campaign | null> => {
    setIsSaving(true);
    setError(null);

    try {
      const savedCampaign = await CampaignService.save({
        id: campaign?.id,
        name,
        type,
        mode: campaign?.mode || 'fullscreen',
        status: campaign?.status || 'draft',
        config,
        prizes,
        theme: campaign?.theme || {},
      });

      setCampaign(savedCampaign);
      hasChanges.current = false;
      toast.success('Campagne sauvegardée !');
      return savedCampaign;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de sauvegarde';
      setError(message);
      toast.error('Erreur lors de la sauvegarde');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [campaign, name, type, config, prizes]);

  // Publier la campagne
  const publish = useCallback(async (): Promise<Campaign | null> => {
    // D'abord sauvegarder
    const saved = await save();
    if (!saved) return null;

    setIsSaving(true);
    try {
      const published = await CampaignService.publish(saved.id);
      setCampaign(published);
      toast.success('Campagne publiée !');
      return published;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de publication';
      setError(message);
      toast.error('Erreur lors de la publication');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [save]);

  return {
    campaign,
    config,
    prizes,
    isLoading,
    isSaving,
    error,
    setConfig,
    setPrizes,
    save,
    publish,
    setName,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
