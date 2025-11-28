import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ParticipantFormRender } from "@/components/ParticipantFormRender";
import { ParticipantWheelRender } from "@/components/ParticipantWheelRender";
import { ParticipantQuizRender } from "@/components/ParticipantQuizRender";
import { ParticipantJackpotRender } from "@/components/ParticipantJackpotRender";
import { ParticipantScratchRender } from "@/components/ParticipantScratchRender";
import { GDPRBanner } from "@/components/GDPRBanner";
import { Question } from "@/components/FormBuilder";

interface Campaign {
  id: string;
  title: string;
  type: "form" | "wheel" | "quiz" | "jackpot" | "scratch";
  config: any;
  participation_limit: number | null;
  participation_count: number;
  starts_at: string | null;
  ends_at: string | null;
}

export default function Participate() {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaign();
    trackView();
  }, [slug]);

  const loadCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("public_url_slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Campagne introuvable");
        return;
      }

      // Check if campaign is active
      const now = new Date();
      if (data.starts_at && new Date(data.starts_at) > now) {
        setError("Cette campagne n'a pas encore commencé");
        return;
      }
      if (data.ends_at && new Date(data.ends_at) < now) {
        setError("Cette campagne est terminée");
        return;
      }
      if (data.participation_limit && data.participation_count >= data.participation_limit) {
        setError("Cette campagne a atteint sa limite de participations");
        return;
      }

      setCampaign(data);
    } catch (error) {
      console.error("Error loading campaign:", error);
      setError("Erreur lors du chargement de la campagne");
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    if (!slug) return;

    try {
      // Get campaign ID first
      const { data: campaignData } = await supabase
        .from("campaigns")
        .select("id")
        .eq("public_url_slug", slug)
        .eq("is_published", true)
        .single();

      if (!campaignData) return;

      // Increment view count
      const { data: analyticsData } = await supabase
        .from("campaign_analytics")
        .select("*")
        .eq("campaign_id", campaignData.id)
        .single();

      if (analyticsData) {
        await supabase
          .from("campaign_analytics")
          .update({
            total_views: (analyticsData.total_views || 0) + 1
          })
          .eq("campaign_id", campaignData.id);
      } else {
        await supabase
          .from("campaign_analytics")
          .insert({
            campaign_id: campaignData.id,
            total_views: 1
          });
      }
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const validateParticipation = async (data: any) => {
    if (!campaign) return { allowed: false, reason: "No campaign" };

    try {
      // Get device fingerprint (simple version)
      const deviceFingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset()
      ].join("|");

      const { data: validationResult, error } = await supabase.functions.invoke(
        "validate-participation",
        {
          body: {
            campaignId: campaign.id,
            email: data.email,
            deviceFingerprint: btoa(deviceFingerprint),
            city: data.city,
            country: data.country
          }
        }
      );

      if (error) throw error;
      return validationResult;
    } catch (error) {
      console.error("Error validating participation:", error);
      return { allowed: true }; // Fail open in case of error
    }
  };

  const handleParticipation = async (data: any) => {
    if (!campaign) return;

    // Validate participation
    const validation = await validateParticipation(data);
    
    if (!validation.allowed) {
      if (validation.blockReason === "duplicate_email") {
        toast.error("Vous avez déjà participé à cette campagne avec cet email");
      } else if (validation.blockReason === "duplicate_ip") {
        toast.error("Trop de participations depuis votre connexion");
      } else if (validation.blockReason === "duplicate_device") {
        toast.error("Vous avez déjà participé depuis cet appareil");
      } else {
        toast.error("Participation non autorisée");
      }
      return;
    }

    try {
      // Get IP and location (simplified - in production use proper geolocation API)
      const deviceFingerprint = btoa([
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height
      ].join("|"));

      // Save participation
      await supabase.from("campaign_participants").insert({
        campaign_id: campaign.id,
        email: data.email,
        device_fingerprint: deviceFingerprint,
        participation_data: data,
        completed_at: new Date().toISOString()
      });

      // Update analytics
      const { data: analyticsData } = await supabase
        .from("campaign_analytics")
        .select("*")
        .eq("campaign_id", campaign.id)
        .single();

      if (analyticsData) {
        await supabase
          .from("campaign_analytics")
          .update({
            total_participations: (analyticsData.total_participations || 0) + 1,
            total_completions: (analyticsData.total_completions || 0) + 1,
            last_participation_at: new Date().toISOString()
          })
          .eq("campaign_id", campaign.id);
      } else {
        await supabase.from("campaign_analytics").insert({
          campaign_id: campaign.id,
          total_participations: 1,
          total_completions: 1,
          last_participation_at: new Date().toISOString()
        });
      }

      // Update campaign participation count
      await supabase
        .from("campaigns")
        .update({
          participation_count: (campaign.participation_count || 0) + 1
        })
        .eq("id", campaign.id);

      toast.success("Participation enregistrée !");
    } catch (error) {
      console.error("Error saving participation:", error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">😕 Oups !</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <>
      <GDPRBanner />
      
      {campaign.type === "form" && (
        <div className="min-h-screen">
          <ParticipantFormRender
            questions={campaign.config.questions || []}
          />
        </div>
      )}
      
      {campaign.type === "wheel" && (
        <div className="min-h-screen">
          <ParticipantWheelRender config={campaign.config} />
        </div>
      )}
      
      {campaign.type === "quiz" && (
        <div className="min-h-screen">
          <ParticipantQuizRender config={campaign.config} />
        </div>
      )}
      
      {campaign.type === "jackpot" && (
        <div className="min-h-screen">
          <ParticipantJackpotRender config={campaign.config} />
        </div>
      )}
      
      {campaign.type === "scratch" && (
        <div className="min-h-screen">
          <ParticipantScratchRender config={campaign.config} />
        </div>
      )}
    </>
  );
}
