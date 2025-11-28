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
}

export const useCampaignAutoSave = ({
  campaignType,
  title,
  config,
  enabled = true,
  debounceMs = 2000,
}: AutoSaveOptions) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaignId, setCampaignId] = useState<string | null>(
    searchParams.get("id")
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
    if (campaignId && userId) {
      loadCampaign();
    }
  }, [campaignId, userId]);

  const loadCampaign = async () => {
    if (!campaignId || !userId) return;

    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      // Campaign loaded - config will be applied by parent component
      return data;
    } catch (error) {
      console.error("Error loading campaign:", error);
      toast.error("Erreur lors du chargement de la campagne");
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (!enabled || !userId) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
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
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving campaign:", error);
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
    saveCampaign: manualSave,
    loadCampaign,
  };
};
