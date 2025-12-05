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
  // Champs d'adresse
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  // Champs professionnels
  company?: string;
  job_title?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  linkedin?: string;
  // Champs personnels
  birthdate?: string;
  salutation?: string; // Civilité (Homme, Femme, Non-binaire)
  gender?: string;
  nationality?: string;
  language?: string;
  marital_status?: string;
  // Champs marketing
  lead_source?: string;
  gdpr_consent?: string;
  interests?: string;
  // Champs e-commerce / fidélité
  customer_id?: string;
  loyalty_card?: string;
  preferred_store?: string;
  // Infos campagne
  organization_id: string;
  campaign_id: string;
  campaign_type?: string;
  prize_won?: string | null;
  points_earned?: number;
  created_at?: string;
}

serve(async (req) => {
  // Handle CORS preflight
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

    console.log("🔄 HubSpot sync for:", participation.email);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get HubSpot credentials
    const { data: integration, error: intError } = await supabase
      .from("organization_integrations")
      .select("credentials")
      .eq("organization_id", participation.organization_id)
      .eq("provider", "hubspot")
      .eq("status", "connected")
      .single();

    if (intError || !integration) {
      console.log("No HubSpot integration found");
      return new Response(
        JSON.stringify({ success: false, error: "HubSpot not connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = integration.credentials as Record<string, string>;
    const accessToken = credentials.access_token || credentials.api_key || credentials.token;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: "No access token found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get campaign name for context
    let campaignName = "";
    if (participation.campaign_id) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("name")
        .eq("id", participation.campaign_id)
        .single();
      campaignName = campaign?.name || "";
    }

    // Prepare contact properties - all form data
    const properties: Record<string, string> = {
      email: participation.email,
    };

    // Champs de base
    if (participation.first_name) properties.firstname = participation.first_name;
    if (participation.last_name) properties.lastname = participation.last_name;
    if (participation.phone) properties.phone = participation.phone;
    
    // Champs d'adresse (propriétés HubSpot standard)
    if (participation.address) properties.address = participation.address;
    if (participation.city) properties.city = participation.city;
    if (participation.postal_code) properties.zip = participation.postal_code;
    if (participation.country) properties.country = participation.country;
    
    // Champs professionnels
    if (participation.company) properties.company = participation.company;
    if (participation.job_title) properties.jobtitle = participation.job_title;
    if (participation.industry) properties.industry = participation.industry;
    if (participation.company_size) properties.numberofemployees = participation.company_size;
    if (participation.website) properties.website = participation.website;
    if (participation.linkedin) properties.linkedinbio = participation.linkedin;
    
    // Champs personnels
    if (participation.birthdate) properties.date_of_birth = participation.birthdate;
    if (participation.salutation) {
      properties.salutation = participation.salutation;
      properties.civilite = participation.salutation;
    }
    if (participation.gender) properties.gender = participation.gender;
    if (participation.nationality) properties.nationalite = participation.nationality;
    if (participation.language) properties.hs_language = participation.language;
    if (participation.marital_status) properties.maritalstatus = participation.marital_status;
    
    // Champs marketing
    if (participation.lead_source) properties.hs_lead_source = participation.lead_source;
    if (participation.gdpr_consent) properties.hs_legal_basis = participation.gdpr_consent === 'true' ? 'Freely given consent from contact' : '';
    if (participation.interests) properties.interets = participation.interests;
    
    // Champs e-commerce / fidélité (propriétés custom)
    if (participation.customer_id) properties.numero_client = participation.customer_id;
    if (participation.loyalty_card) properties.carte_fidelite = participation.loyalty_card;
    if (participation.preferred_store) properties.magasin_prefere = participation.preferred_store;
    
    // Statut du lead
    properties.hs_lead_status = "NEW";
    
    // Store campaign info in notes/description
    const notes = [
      campaignName ? `🎯 Campagne: ${campaignName}` : "",
      participation.campaign_type ? `Type: ${participation.campaign_type}` : "",
      participation.prize_won ? `🎁 Prix gagné: ${participation.prize_won}` : "❌ Pas de gain",
      participation.points_earned ? `⭐ Points: ${participation.points_earned}` : "",
      `📅 Date: ${participation.created_at || new Date().toISOString()}`,
    ].filter(Boolean).join(" | ");

    console.log("📤 Creating/updating contact in HubSpot...");

    // Try to create the contact
    const createResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    });

    if (createResponse.status === 409) {
      // Contact exists, update it
      console.log("Contact exists, updating...");
      
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
        const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties }),
        });

        if (updateResponse.ok) {
          console.log(`✅ Contact ${participation.email} updated`);
          return new Response(
            JSON.stringify({ success: true, action: "updated", contactId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } else if (createResponse.ok) {
      const result = await createResponse.json();
      console.log(`✅ Contact ${participation.email} created with ID: ${result.id}`);
      return new Response(
        JSON.stringify({ success: true, action: "created", contactId: result.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorData = await createResponse.json();
      console.error("HubSpot API error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: errorData.message || "HubSpot API error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
