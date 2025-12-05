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

    console.log("🔄 ActiveCampaign sync for:", participation.email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get ActiveCampaign credentials
    const { data: integration, error: intError } = await supabase
      .from("organization_integrations")
      .select("credentials")
      .eq("organization_id", participation.organization_id)
      .eq("provider", "activecampaign")
      .eq("status", "connected")
      .single();

    if (intError || !integration) {
      console.log("No ActiveCampaign integration found");
      return new Response(
        JSON.stringify({ success: false, error: "ActiveCampaign not connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = integration.credentials as Record<string, string>;
    const apiKey = credentials.api_key || credentials.apiKey;
    const apiUrl = credentials.api_url || credentials.apiUrl || credentials.account_url;

    if (!apiKey || !apiUrl) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing ActiveCampaign credentials (api_key or api_url)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize API URL
    const baseUrl = apiUrl.endsWith("/api/3") ? apiUrl : `${apiUrl}/api/3`;

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

    // Prepare ActiveCampaign contact data
    const contactData: Record<string, unknown> = {
      email: participation.email,
    };
    
    // Champs de base
    if (participation.first_name) contactData.firstName = participation.first_name;
    if (participation.last_name) contactData.lastName = participation.last_name;
    if (participation.phone) contactData.phone = participation.phone;

    // Custom fields will be added as fieldValues
    const fieldValues: Array<{ field: string; value: string }> = [];
    
    // Champs d'adresse
    if (participation.address) fieldValues.push({ field: "ADRESSE", value: participation.address });
    if (participation.city) fieldValues.push({ field: "VILLE", value: participation.city });
    if (participation.postal_code) fieldValues.push({ field: "CODE_POSTAL", value: participation.postal_code });
    if (participation.country) fieldValues.push({ field: "PAYS", value: participation.country });
    
    // Champs professionnels
    if (participation.company) fieldValues.push({ field: "ENTREPRISE", value: participation.company });
    if (participation.job_title) fieldValues.push({ field: "POSTE", value: participation.job_title });
    if (participation.industry) fieldValues.push({ field: "SECTEUR", value: participation.industry });
    if (participation.website) fieldValues.push({ field: "SITE_WEB", value: participation.website });
    
    // Champs personnels
    if (participation.birthdate) fieldValues.push({ field: "DATE_NAISSANCE", value: participation.birthdate });
    if (participation.salutation) fieldValues.push({ field: "CIVILITE", value: participation.salutation });
    if (participation.gender) fieldValues.push({ field: "GENRE", value: participation.gender });
    if (participation.language) fieldValues.push({ field: "LANGUE", value: participation.language });
    
    // Champs marketing
    if (participation.lead_source) fieldValues.push({ field: "SOURCE", value: participation.lead_source });
    if (participation.interests) fieldValues.push({ field: "INTERETS", value: participation.interests });
    
    // Champs e-commerce / fidélité
    if (participation.customer_id) fieldValues.push({ field: "NUMERO_CLIENT", value: participation.customer_id });
    if (participation.loyalty_card) fieldValues.push({ field: "CARTE_FIDELITE", value: participation.loyalty_card });
    if (participation.preferred_store) fieldValues.push({ field: "MAGASIN_PREFERE", value: participation.preferred_store });
    
    // Champs campagne
    if (campaignName) fieldValues.push({ field: "DERNIERE_CAMPAGNE", value: campaignName });
    if (participation.campaign_type) fieldValues.push({ field: "TYPE_CAMPAGNE", value: participation.campaign_type });
    if (participation.prize_won) fieldValues.push({ field: "DERNIER_GAIN", value: participation.prize_won });
    if (participation.points_earned) fieldValues.push({ field: "POINTS", value: String(participation.points_earned) });

    console.log("📤 Creating/updating contact in ActiveCampaign...");

    // ActiveCampaign uses sync endpoint for create/update
    const response = await fetch(`${baseUrl}/contact/sync`, {
      method: "POST",
      headers: {
        "Api-Token": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contact: contactData }),
    });

    if (response.ok) {
      const result = await response.json();
      const contactId = result.contact?.id;
      
      // Add custom field values if contact was created/updated
      if (contactId && fieldValues.length > 0) {
        // Note: In production, you'd need to map field names to field IDs
        // This is a simplified version - field IDs would need to be fetched first
        console.log(`📝 Contact ${contactId} created, custom fields would be added here`);
      }
      
      console.log(`✅ Contact ${participation.email} synced in ActiveCampaign`);
      return new Response(
        JSON.stringify({ success: true, action: "synced", contactId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
      console.error("ActiveCampaign API error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: errorData.message || "ActiveCampaign API error" }),
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
