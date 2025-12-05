/**
 * Edge Function: webhook-participation
 * 
 * Webhook appelé en temps réel quand un participant joue à une campagne.
 * Synchronise immédiatement le contact vers les CRM connectés (HubSpot, etc.)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParticipationEvent {
  type: "participation.created" | "participation.updated";
  data: {
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
    created_at: string;
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const event: ParticipationEvent = await req.json();
    const { data } = event;

    console.log(`Processing ${event.type} for ${data.email}`);

    // Récupérer les intégrations actives pour cette organisation
    const { data: integrations, error: intError } = await supabase
      .from("organization_integrations")
      .select("provider, credentials, settings")
      .eq("organization_id", data.organization_id)
      .eq("status", "connected");

    if (intError) {
      throw new Error(`Failed to fetch integrations: ${intError.message}`);
    }

    const results: Record<string, { success: boolean; error?: string }> = {};

    // Synchroniser vers chaque CRM connecté
    for (const integration of integrations || []) {
      try {
        switch (integration.provider) {
          case "hubspot":
            results.hubspot = await syncToHubSpot(
              supabase,
              data,
              integration.credentials as { access_token: string }
            );
            break;

          case "salesforce":
            results.salesforce = await syncToSalesforce(
              data,
              integration.credentials as { 
                instance_url: string;
                access_token: string;
              }
            );
            break;

          case "pipedrive":
            results.pipedrive = await syncToPipedrive(
              data,
              integration.credentials as { api_token: string }
            );
            break;

          // Ajouter d'autres CRM ici...
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results[integration.provider] = { success: false, error: errorMessage };
        console.error(`Sync to ${integration.provider} failed:`, error);
      }
    }

    // Logger l'événement
    await supabase.from("integration_sync_logs").insert({
      organization_id: data.organization_id,
      provider: "webhook",
      sync_type: "realtime",
      record_id: data.id,
      status: Object.values(results).every((r) => r.success) ? "success" : "partial",
      metadata: { event: event.type, results },
      synced_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Sync vers HubSpot
 */
async function syncToHubSpot(
  supabase: ReturnType<typeof createClient>,
  data: ParticipationEvent["data"],
  credentials: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  // Le token peut être stocké sous différentes clés
  const accessToken = credentials.access_token || credentials.api_key || credentials.token;
  
  if (!accessToken) {
    throw new Error("No access token found in credentials");
  }

  // Récupérer les stats agrégées du participant
  const { data: stats } = await supabase
    .from("campaign_participations")
    .select("id, created_at, points_earned, prize_won")
    .eq("email", data.email)
    .eq("organization_id", data.organization_id);

  const totalParticipations = stats?.length || 1;
  const totalPoints = stats?.reduce((sum, s) => sum + (s.points_earned || 0), 0) || 0;
  const totalPrizes = stats?.filter(s => s.prize_won).length || 0;

  // Propriétés de base HubSpot
  const properties: Record<string, string | number> = {
    email: data.email,
    firstname: data.first_name || "",
    lastname: data.last_name || "",
    phone: data.phone || "",
  };

  // Essayer d'ajouter les propriétés personnalisées Prosplay
  // Note: Ces propriétés doivent être créées dans HubSpot au préalable
  // Si elles n'existent pas, on les ignore
  const customProperties: Record<string, string | number> = {
    prosplay_total_participations: String(totalParticipations),
    prosplay_total_points: String(totalPoints),
    prosplay_total_prizes: String(totalPrizes),
    prosplay_last_participation: new Date().toISOString().split("T")[0],
    prosplay_last_campaign_type: data.campaign_type || "",
    prosplay_last_prize: data.prize_won || "",
  };

  // D'abord, essayer de créer/mettre à jour avec les propriétés de base
  const response = await fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    }
  );

  // Si le contact existe déjà (409 Conflict), on le met à jour
  if (response.status === 409) {
    // Rechercher le contact par email
    const searchResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/search`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: "email",
              operator: "EQ",
              value: data.email,
            }],
          }],
        }),
      }
    );

    const searchResult = await searchResponse.json();
    const contactId = searchResult.results?.[0]?.id;

    if (contactId) {
      // Mettre à jour le contact existant
      const updateResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties: { ...properties } }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        console.error("HubSpot update error:", errorData);
        throw new Error(errorData.message || `HTTP ${updateResponse.status}`);
      }
    }
  } else if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("HubSpot create error:", errorData);
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  console.log(`✅ HubSpot: Contact ${data.email} synced successfully`);
  return { success: true };
}

/**
 * Sync vers Salesforce
 */
async function syncToSalesforce(
  data: ParticipationEvent["data"],
  credentials: { instance_url: string; access_token: string }
): Promise<{ success: boolean; error?: string }> {
  // Rechercher le contact existant
  const searchResponse = await fetch(
    `${credentials.instance_url}/services/data/v58.0/query?q=SELECT+Id+FROM+Contact+WHERE+Email='${encodeURIComponent(data.email)}'`,
    {
      headers: {
        "Authorization": `Bearer ${credentials.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const searchResult = await searchResponse.json();
  const existingId = searchResult.records?.[0]?.Id;

  const contactData = {
    Email: data.email,
    FirstName: data.first_name || "",
    LastName: data.last_name || "Unknown",
    Phone: data.phone || "",
    Prosplay_User_ID__c: data.id,
    Prosplay_Last_Participation__c: new Date().toISOString().split("T")[0],
  };

  const method = existingId ? "PATCH" : "POST";
  const url = existingId
    ? `${credentials.instance_url}/services/data/v58.0/sobjects/Contact/${existingId}`
    : `${credentials.instance_url}/services/data/v58.0/sobjects/Contact`;

  const response = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${credentials.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData[0]?.message || `HTTP ${response.status}`);
  }

  return { success: true };
}

/**
 * Sync vers Pipedrive
 */
async function syncToPipedrive(
  data: ParticipationEvent["data"],
  credentials: { api_token: string }
): Promise<{ success: boolean; error?: string }> {
  // Rechercher la personne existante
  const searchResponse = await fetch(
    `https://api.pipedrive.com/v1/persons/search?term=${encodeURIComponent(data.email)}&api_token=${credentials.api_token}`,
    { method: "GET" }
  );

  const searchResult = await searchResponse.json();
  const existingId = searchResult.data?.items?.[0]?.item?.id;

  const personData = {
    name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email,
    email: [{ value: data.email, primary: true }],
    phone: data.phone ? [{ value: data.phone, primary: true }] : undefined,
  };

  const method = existingId ? "PUT" : "POST";
  const url = existingId
    ? `https://api.pipedrive.com/v1/persons/${existingId}?api_token=${credentials.api_token}`
    : `https://api.pipedrive.com/v1/persons?api_token=${credentials.api_token}`;

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(personData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return { success: true };
}
