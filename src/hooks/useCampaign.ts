import { useState, useEffect, useCallback, useRef } from 'react';
import { CampaignService } from '@/services/CampaignService';
import type { Campaign, CampaignType, CampaignMode } from '@/types/campaign';
import { toast } from 'sonner';

// Deep merge utility function
function deepMerge<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        source[key] !== null &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] !== null &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key as keyof T] = deepMerge(target[key], source[key]);
      } else {
        result[key as keyof T] = source[key];
      }
    }
  }
  
  return result;
}

interface UseCampaignOptions {
  campaignId?: string | null;
  type: CampaignType;
  mode?: CampaignMode;
  defaultName?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useCampaign(
  options: UseCampaignOptions,
  defaultConfig: any,
  themeContext?: { theme: any; updateTheme: (updates: any) => void }
) {
  const { campaignId, type, mode = 'fullscreen', defaultName = 'Nouvelle campagne', autoSave = false, autoSaveDelay = 3000 } = options;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [config, setConfigState] = useState<any>(defaultConfig);
  const [prizes, setPrizesState] = useState<any[]>([]);
  const [name, setName] = useState(defaultName);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  // Initialiser isLoading à true si on a un campaignId pour éviter le flash du contenu par défaut
  const [isLoading, setIsLoading] = useState(!!campaignId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
          // Merge deep: defaultConfig + data.config pour garder les valeurs par défaut
          const mergedConfig = deepMerge(defaultConfig, data.config || {});
          setConfigState(mergedConfig);
          setPrizesState(data.prizes || []);
          setName(data.name);
          
          // Restore theme if saved and themeContext provided
          if (data.theme && Object.keys(data.theme).length > 0 && themeContext) {
            themeContext.updateTheme(data.theme);
          }
          
          // Restore dates
          if (data.starts_at) {
            const startDateTime = new Date(data.starts_at);
            setStartDate(startDateTime.toISOString().split('T')[0]);
            setStartTime(startDateTime.toTimeString().slice(0, 5));
          }
          if (data.ends_at) {
            const endDateTime = new Date(data.ends_at);
            setEndDate(endDateTime.toISOString().split('T')[0]);
            setEndTime(endDateTime.toTimeString().slice(0, 5));
          }
          
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
    if (!autoSave || !hasUnsavedChanges || !campaign?.id) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      save();
      setHasUnsavedChanges(false);
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
      setHasUnsavedChanges(true);
      return newConfig;
    });
  }, []);

  // Setter pour prizes
  const setPrizes = useCallback((updater: any) => {
    setPrizesState((prev: any[]) => {
      const newPrizes = typeof updater === 'function' ? updater(prev) : updater;
      setHasUnsavedChanges(true);
      return newPrizes;
    });
  }, []);

  // Sauvegarder la campagne
  const save = useCallback(async (): Promise<Campaign | null> => {
    setIsSaving(true);
    setError(null);

    // Build starts_at and ends_at from date + time
    let starts_at: string | undefined;
    let ends_at: string | undefined;
    
    if (startDate) {
      starts_at = startTime 
        ? new Date(`${startDate}T${startTime}`).toISOString()
        : new Date(`${startDate}T00:00`).toISOString();
    }
    if (endDate) {
      ends_at = endTime 
        ? new Date(`${endDate}T${endTime}`).toISOString()
        : new Date(`${endDate}T23:59`).toISOString();
    }

    try {
      const savedCampaign = await CampaignService.save({
        id: campaign?.id,
        name,
        type,
        mode: campaign?.mode || mode,
        status: campaign?.status || 'draft',
        config,
        prizes,
        theme: themeContext?.theme || campaign?.theme || {},
        starts_at,
        ends_at,
      });

      setCampaign(savedCampaign);
      setHasUnsavedChanges(false);
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
  }, [campaign, name, type, config, prizes, startDate, startTime, endDate, endTime, themeContext]);

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
    name,
    startDate,
    startTime,
    endDate,
    endTime,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    setConfig,
    setPrizes,
    save,
    publish,
    setName,
    setStartDate,
    setStartTime,
    setEndDate,
    setEndTime,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
