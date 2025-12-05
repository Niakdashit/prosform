/**
 * Edge Function: sync-hubspot
 * 
 * Synchronise les participants Prosplay vers HubSpot
 * - Appelé par cron job (toutes les 15 minutes)
 * - Ou manuellement via l'UI
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HubSpotCredentials {
  access_token: string;
}

interface SyncStats {
  total: number;
  synced: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer l'organization_id depuis le body ou les params
    const { organization_id, force_full_sync } = await req.json().catch(() => ({}));

    // Si organization_id fourni, sync uniquement cette org
    // Sinon, sync toutes les orgs avec HubSpot connecté
    let query = supabase
      .from("organization_integrations")
      .select("organization_id, credentials, last_sync_at")
      .eq("provider", "hubspot")
      .eq("status", "connected");

    if (organization_id) {
      query = query.eq("organization_id", organization_id);
    }

    const { data: integrations, error: intError } = await query;

    if (intError) {
      throw new Error(`Failed to fetch integrations: ${intError.message}`);
    }

    const results: Record<string, SyncStats> = {};

    for (const integration of integrations || []) {
      const orgId = integration.organization_id;
      const credentials = integration.credentials as HubSpotCredentials;
      const lastSync = force_full_sync ? null : integration.last_sync_at;

      console.log(`Syncing organization ${orgId}...`);

      try {
        const stats = await syncOrganization(
          supabase,
          orgId,
          credentials.access_token,
          lastSync
        );
        results[orgId] = stats;

        // Mettre à jour le timestamp de dernière sync
        await supabase
          .from("organization_integrations")
          .update({
            last_sync_at: new Date().toISOString(),
            sync_stats: stats,
            last_error: stats.failed > 0 ? `${stats.failed} contacts failed` : null,
          })
          .eq("organization_id", orgId)
          .eq("provider", "hubspot");

      } catch (error) {
        console.error(`Sync failed for org ${orgId}:`, error);
        results[orgId] = {
          total: 0,
          synced: 0,
          failed: 1,
          errors: [{ email: "sync", error: error.message }],
        };

        // Log l'erreur
        await supabase
          .from("organization_integrations")
          .update({ last_error: error.message })
          .eq("organization_id", orgId)
          .eq("provider", "hubspot");
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Synchronise une organisation vers HubSpot
 */
async function syncOrganization(
  supabase: any,
  organizationId: string,
  accessToken: string,
  lastSyncAt: string | null
): Promise<SyncStats> {
  // Récupérer les participations à synchroniser
  let query = supabase
    .from("campaign_participations")
    .select(`
      id,
      email,
      first_name,
      last_name,
      phone,
      created_at,
      updated_at,
      campaign:campaigns(id, name, type)
    `)
    .eq("organization_id", organizationId);

  if (lastSyncAt) {
    query = query.gte("updated_at", lastSyncAt);
  }

  const { data: participations, error } = await query.limit(1000);

  if (error) {
    throw new Error(`Failed to fetch participations: ${error.message}`);
  }

  if (!participations || participations.length === 0) {
    return { total: 0, synced: 0, failed: 0, errors: [] };
  }

  // Agréger par email
  const contactMap = new Map<string, any>();

  for (const p of participations) {
    const existing = contactMap.get(p.email);
    
    if (existing) {
      existing.prosplay_total_participations += 1;
      if (p.created_at > existing.prosplay_last_participation_date) {
        existing.prosplay_last_participation_date = p.created_at.split("T")[0];
      }
    } else {
      contactMap.set(p.email, {
        email: p.email,
        firstname: p.first_name || "",
        lastname: p.last_name || "",
        phone: p.phone || "",
        prosplay_user_id: p.id,
        prosplay_organization_id: organizationId,
        prosplay_total_participations: 1,
        prosplay_last_participation_date: p.created_at?.split("T")[0] || "",
        prosplay_favorite_campaign_type: p.campaign?.type || "",
      });
    }
  }

  const contacts = Array.from(contactMap.values());
  
  // Envoyer à HubSpot par batch de 100
  const stats: SyncStats = {
    total: contacts.length,
    synced: 0,
    failed: 0,
    errors: [],
  };

  const batches = chunkArray(contacts, 100);

  for (const batch of batches) {
    try {
      const response = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: batch.map((contact) => ({
              idProperty: "email",
              id: contact.email,
              properties: contact,
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      stats.synced += result.results?.length || batch.length;

    } catch (error) {
      stats.failed += batch.length;
      for (const contact of batch) {
        stats.errors.push({
          email: contact.email,
          error: error.message,
        });
      }
    }
  }

  // Log les syncs dans la table de logs
  for (const contact of contacts) {
    const isSuccess = !stats.errors.find((e) => e.email === contact.email);
    await supabase.from("integration_sync_logs").insert({
      organization_id: organizationId,
      provider: "hubspot",
      sync_type: "contact",
      record_id: contact.prosplay_user_id,
      status: isSuccess ? "success" : "error",
      error_message: stats.errors.find((e) => e.email === contact.email)?.error,
      synced_at: new Date().toISOString(),
    });
  }

  return stats;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
