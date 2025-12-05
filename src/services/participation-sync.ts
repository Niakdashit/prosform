/**
 * Service de synchronisation des participations vers les CRM
 * Appelle le webhook pour synchroniser en temps réel
 */

import { supabase } from "@/integrations/supabase/client";

interface ParticipationData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  organization_id: string;
  campaign_id: string;
  campaign_type?: string;
  points_earned?: number;
  prize_won?: string;
  created_at?: string;
}

export interface ParticipationForSync {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  organization_id: string;
  campaign_id: string;
  campaign_type?: string;
  prize_won?: string | null;
  points_earned?: number;
  created_at: string;
}

/**
 * Synchronise une participation vers les CRM connectés
 */
export async function syncParticipationToCRM(
  participation: ParticipationData,
  eventType: "participation.created" | "participation.updated" = "participation.created"
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier s'il y a des intégrations actives pour cette organisation
    const { data: integrations, error: intError } = await supabase
      .from("organization_integrations")
      .select("id, provider")
      .eq("organization_id", participation.organization_id)
      .eq("status", "connected");

    if (intError) {
      console.error("Error fetching integrations:", intError);
      return { success: false, error: intError.message };
    }

    // Si aucune intégration, pas besoin de sync
    if (!integrations || integrations.length === 0) {
      console.log("No active integrations for this organization");
      return { success: true };
    }

    console.log(`Syncing participation to ${integrations.length} integration(s)...`);

    // Appeler l'Edge Function webhook-participation
    const { data, error } = await supabase.functions.invoke("webhook-participation", {
      body: {
        type: eventType,
        data: participation,
      },
    });

    if (error) {
      console.error("Webhook error:", error);
      return { success: false, error: error.message };
    }

    console.log("Sync result:", data);
    return { success: true };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Synchronise directement vers HubSpot (sans passer par l'Edge Function)
 * Utile pour les tests ou si l'Edge Function n'est pas déployée
 */
export async function syncToHubSpotDirect(
  participation: ParticipationData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer les credentials HubSpot
    const { data: integration, error: intError } = await supabase
      .from("organization_integrations")
      .select("credentials")
      .eq("organization_id", participation.organization_id)
      .eq("provider", "hubspot")
      .eq("status", "connected")
      .single();

    if (intError || !integration) {
      return { success: false, error: "HubSpot not connected" };
    }

    const credentials = integration.credentials as Record<string, string>;
    const accessToken = credentials.access_token || credentials.api_key || credentials.token;

    if (!accessToken) {
      return { success: false, error: "No access token found" };
    }

    // Créer ou mettre à jour le contact
    const properties = {
      email: participation.email,
      firstname: participation.first_name || "",
      lastname: participation.last_name || "",
      phone: participation.phone || "",
    };

    // Essayer de créer le contact
    const createResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    });

    if (createResponse.status === 409) {
      // Contact existe, le mettre à jour via recherche
      const searchResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: "email",
              operator: "EQ",
              value: participation.email,
            }],
          }],
        }),
      });

      const searchResult = await searchResponse.json();
      const contactId = searchResult.results?.[0]?.id;

      if (contactId) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties }),
        });
      }
    } else if (!createResponse.ok) {
      const errorData = await createResponse.json();
      return { success: false, error: errorData.message || "HubSpot API error" };
    }

    console.log(`✅ HubSpot: Contact ${participation.email} synced`);
    return { success: true };
  } catch (error) {
    console.error("HubSpot sync error:", error);
    return { success: false, error: (error as Error).message };
  }
}
