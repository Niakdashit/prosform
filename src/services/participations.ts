/**
 * Service de gestion des participations
 * Sauvegarde les participations et synchronise vers les CRM
 */

import { supabase } from "@/integrations/supabase/client";
import { syncToHubSpotDirect } from "./participation-sync";

export interface ParticipationInput {
  campaign_id: string;
  organization_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  game_result?: Record<string, unknown>;
  prize_won?: string;
  prize_value?: number;
  points_earned?: number;
  marketing_consent?: boolean;
  custom_fields?: Record<string, unknown>;
  source?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface Participation extends ParticipationInput {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class ParticipationsService {
  /**
   * Crée une nouvelle participation et synchronise vers les CRM
   */
  async createParticipation(input: ParticipationInput): Promise<Participation> {
    // 1. Sauvegarder la participation en base
    const { data, error } = await supabase
      .from("campaign_participations")
      .insert({
        campaign_id: input.campaign_id,
        organization_id: input.organization_id,
        email: input.email,
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone,
        game_result: input.game_result,
        prize_won: input.prize_won,
        prize_value: input.prize_value,
        points_earned: input.points_earned || 0,
        marketing_consent: input.marketing_consent || false,
        custom_fields: input.custom_fields || {},
        source: input.source || "direct",
        referrer: input.referrer,
        utm_source: input.utm_source,
        utm_medium: input.utm_medium,
        utm_campaign: input.utm_campaign,
        status: "completed",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating participation:", error);
      throw error;
    }

    // 2. Synchroniser vers les CRM en arrière-plan (ne pas bloquer)
    this.syncToCRMs(data as Participation).catch((err) => {
      console.error("CRM sync error (non-blocking):", err);
    });

    return data as Participation;
  }

  /**
   * Synchronise une participation vers tous les CRM connectés
   */
  private async syncToCRMs(participation: Participation): Promise<void> {
    // Récupérer les intégrations actives
    const { data: integrations, error } = await supabase
      .from("organization_integrations")
      .select("id, provider, credentials, config")
      .eq("organization_id", participation.organization_id)
      .eq("status", "connected");

    if (error || !integrations || integrations.length === 0) {
      console.log("No active integrations for sync");
      return;
    }

    // Récupérer le type de campagne
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("type, name")
      .eq("id", participation.campaign_id)
      .single();

    const participationData = {
      ...participation,
      campaign_type: campaign?.type,
      campaign_name: campaign?.name,
    };

    // Synchroniser vers chaque CRM
    for (const integration of integrations) {
      try {
        switch (integration.provider) {
          case "hubspot":
            await syncToHubSpotDirect(participationData);
            break;
          // Ajouter d'autres CRM ici
          default:
            console.log(`Sync to ${integration.provider} not implemented yet`);
        }

        // Logger le succès
        await this.logSync(integration.id, participation.id, "success");
      } catch (err) {
        console.error(`Sync to ${integration.provider} failed:`, err);
        await this.logSync(integration.id, participation.id, "error", (err as Error).message);
      }
    }
  }

  /**
   * Log une synchronisation
   */
  private async logSync(
    integrationId: string,
    participationId: string,
    status: "success" | "error",
    errorMessage?: string
  ): Promise<void> {
    try {
      await supabase.from("integration_sync_logs").insert({
        integration_id: integrationId,
        action_type: "participation_sync",
        status,
        request_data: { participation_id: participationId },
        error_message: errorMessage,
        records_processed: 1,
        records_success: status === "success" ? 1 : 0,
        records_failed: status === "error" ? 1 : 0,
      });
    } catch (err) {
      console.error("Error logging sync:", err);
    }
  }

  /**
   * Récupère les participations d'une campagne
   */
  async getCampaignParticipations(campaignId: string): Promise<Participation[]> {
    const { data, error } = await supabase
      .from("campaign_participations")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Participation[];
  }

  /**
   * Récupère les stats d'une campagne
   */
  async getCampaignStats(campaignId: string): Promise<{
    total: number;
    unique: number;
    prizes: number;
    points: number;
  }> {
    const { data, error } = await supabase
      .from("campaign_participations")
      .select("email, prize_won, points_earned")
      .eq("campaign_id", campaignId);

    if (error) throw error;

    const participations = data || [];
    const uniqueEmails = new Set(participations.map((p) => p.email));

    return {
      total: participations.length,
      unique: uniqueEmails.size,
      prizes: participations.filter((p) => p.prize_won).length,
      points: participations.reduce((sum, p) => sum + (p.points_earned || 0), 0),
    };
  }
}

export const participationsService = new ParticipationsService();
export default participationsService;
