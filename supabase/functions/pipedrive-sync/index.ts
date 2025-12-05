import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParticipationData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  company?: string;
  job_title?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  linkedin?: string;
  birthdate?: string;
  salutation?: string;
  gender?: string;
  nationality?: string;
  language?: string;
  marital_status?: string;
  lead_source?: string;
  gdpr_consent?: string;
  interests?: string;
  customer_id?: string;
  loyalty_card?: string;
  preferred_store?: string;
  organization_id: string;
  campaign_id: string;
  campaign_type?: string;
  prize_won?: string | null;
  points_earned?: number;
  created_at?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { participation } = await req.json() as { participation: ParticipationData };

    if (!participation || !participation.email || !participation.organization_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🔄 Pipedrive sync for:", participation.email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Pipedrive credentials
    const { data: integration, error: intError } = await supabase
      .from("organization_integrations")
      .select("credentials")
      .eq("organization_id", participation.organization_id)
      .eq("provider", "pipedrive")
      .eq("status", "connected")
      .single();

    if (intError || !integration) {
      console.log("No Pipedrive integration found");
      return new Response(
        JSON.stringify({ success: false, error: "Pipedrive not connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = integration.credentials as Record<string, string>;
    const apiToken = credentials.api_token || credentials.apiToken || credentials.api_key;
    const companyDomain = credentials.company_domain || credentials.domain;

    if (!apiToken) {
      return new Response(
        JSON.stringify({ success: false, error: "No API token found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseUrl = companyDomain 
      ? `https://${companyDomain}.pipedrive.com/api/v1`
      : "https://api.pipedrive.com/v1";

    // Get campaign name
    let campaignName = "";
    if (participation.campaign_id) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("name")
        .eq("id", participation.campaign_id)
        .single();
      campaignName = campaign?.name || "";
    }

    // Build person name
    const name = [participation.first_name, participation.last_name].filter(Boolean).join(" ") 
      || participation.email.split("@")[0];

    // Prepare Pipedrive Person data
    const personData: Record<string, unknown> = {
      name,
      email: [{ value: participation.email, primary: true }],
    };
    
    if (participation.phone) {
      personData.phone = [{ value: participation.phone, primary: true }];
    }
    
    // Note with all additional info
    const noteContent = [
      participation.salutation ? `Civilité: ${participation.salutation}` : "",
      participation.address ? `Adresse: ${participation.address}` : "",
      participation.city ? `Ville: ${participation.city}` : "",
      participation.postal_code ? `Code postal: ${participation.postal_code}` : "",
      participation.country ? `Pays: ${participation.country}` : "",
      participation.company ? `Entreprise: ${participation.company}` : "",
      participation.job_title ? `Poste: ${participation.job_title}` : "",
      participation.industry ? `Secteur: ${participation.industry}` : "",
      participation.birthdate ? `Date de naissance: ${participation.birthdate}` : "",
      participation.lead_source ? `Source: ${participation.lead_source}` : "",
      participation.interests ? `Intérêts: ${participation.interests}` : "",
      participation.customer_id ? `N° Client: ${participation.customer_id}` : "",
      participation.loyalty_card ? `Carte fidélité: ${participation.loyalty_card}` : "",
      participation.preferred_store ? `Magasin préféré: ${participation.preferred_store}` : "",
      "---",
      campaignName ? `🎯 Campagne: ${campaignName}` : "",
      participation.campaign_type ? `Type: ${participation.campaign_type}` : "",
      participation.prize_won ? `🎁 Prix gagné: ${participation.prize_won}` : "❌ Pas de gain",
      participation.points_earned ? `⭐ Points: ${participation.points_earned}` : "",
      `📅 Date: ${participation.created_at || new Date().toISOString()}`,
    ].filter(Boolean).join("\n");

    console.log("📤 Creating/updating Person in Pipedrive...");

    // Search for existing person by email
    const searchUrl = `${baseUrl}/persons/search?term=${encodeURIComponent(participation.email)}&fields=email&api_token=${apiToken}`;
    const searchResponse = await fetch(searchUrl);
    
    let personId: number | null = null;
    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.data?.items?.length > 0) {
        personId = searchResult.data.items[0].item.id;
      }
    }

    let response;
    let action: string;

    if (personId) {
      // Update existing person
      response = await fetch(`${baseUrl}/persons/${personId}?api_token=${apiToken}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personData),
      });
      action = "updated";
    } else {
      // Create new person
      response = await fetch(`${baseUrl}/persons?api_token=${apiToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personData),
      });
      action = "created";
    }

    if (response.ok) {
      const result = await response.json();
      const finalPersonId = result.data?.id || personId;
      
      // Add a note with campaign info
      if (finalPersonId && noteContent) {
        await fetch(`${baseUrl}/notes?api_token=${apiToken}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: noteContent,
            person_id: finalPersonId,
          }),
        });
      }
      
      console.log(`✅ Person ${participation.email} ${action} in Pipedrive`);
      return new Response(
        JSON.stringify({ success: true, action, personId: finalPersonId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("Pipedrive API error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: errorData.error || "Pipedrive API error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
