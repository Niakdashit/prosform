import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AutoSaveOptions {
  campaignType: "form" | "wheel" | "quiz" | "jackpot" | "scratch";
  title: string;
  config: any;
  enabled?: boolean;
  debounceMs?: number;
  onConfigLoaded?: (config: any) => void;
}

export const useCampaignAutoSave = ({
  campaignType,
  title,
  config,
  enabled = true,
  debounceMs = 2000,
  onConfigLoaded,
}: AutoSaveOptions) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaignId, setCampaignId] = useState<string | null>(
    searchParams.get("id")
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  // Load existing campaign if ID provided
  useEffect(() => {
    if (campaignId && userId && !hasLoadedRef.current && onConfigLoaded) {
      loadCampaign();
    }
  }, [campaignId, userId]);

  const loadCampaign = async () => {
    if (!campaignId || !userId || hasLoadedRef.current) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data && onConfigLoaded) {
        hasLoadedRef.current = true;
        onConfigLoaded(data.config);
        setLastSaved(new Date(data.last_edited_at));
        setIsPublished(data.is_published || false);
      }
      return data;
    } catch (error) {
      console.error("Error loading campaign:", error);
      toast.error("Erreur lors du chargement de la campagne");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (!enabled || !userId || !hasLoadedRef.current) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Auto-saving campaign...', { config, title });
      saveCampaign();
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [config, title, enabled, userId]);

  const saveCampaign = async () => {
    if (!userId) {
      console.log("No user logged in, skipping auto-save");
      return;
    }

    setIsSaving(true);

    try {
      if (campaignId) {
        // Update existing campaign
        const { error } = await supabase
          .from("campaigns")
          .update({
            title,
            config,
            last_edited_at: new Date().toISOString(),
          })
          .eq("id", campaignId)
          .eq("user_id", userId);

        if (error) throw error;
        console.log('✅ Campaign saved successfully', { campaignId, configKeys: Object.keys(config) });
      } else {
        // Create new campaign
        const { data, error } = await supabase
          .from("campaigns")
          .insert({
            user_id: userId,
            title,
            type: campaignType,
            config,
          })
          .select()
          .single();

        if (error) throw error;

        // Update URL with campaign ID
        setCampaignId(data.id);
        setSearchParams({ id: data.id });
        console.log('✅ New campaign created', { campaignId: data.id });
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("❌ Error saving campaign:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const manualSave = async () => {
    await saveCampaign();
    toast.success("Campagne sauvegardée");
  };

  return {
    campaignId,
    isSaving,
    lastSaved,
    isLoading,
    isPublished,
    saveCampaign: manualSave,
    loadCampaign,
  };
};
