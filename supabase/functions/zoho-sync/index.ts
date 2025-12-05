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

    console.log("🔄 Zoho CRM sync for:", participation.email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Zoho credentials
    const { data: integration, error: intError } = await supabase
      .from("organization_integrations")
      .select("credentials")
      .eq("organization_id", participation.organization_id)
      .eq("provider", "zoho")
      .eq("status", "connected")
      .single();

    if (intError || !integration) {
      console.log("No Zoho CRM integration found");
      return new Response(
        JSON.stringify({ success: false, error: "Zoho CRM not connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = integration.credentials as Record<string, string>;
    const accessToken = credentials.access_token;
    const apiDomain = credentials.api_domain || "https://www.zohoapis.eu"; // EU by default

    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: "No access token found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Prepare Zoho Lead data
    const leadData: Record<string, unknown> = {
      Email: participation.email,
    };
    
    // Champs de base
    if (participation.first_name) leadData.First_Name = participation.first_name;
    if (participation.last_name) leadData.Last_Name = participation.last_name;
    if (participation.phone) leadData.Phone = participation.phone;
    
    // Champs d'adresse
    if (participation.address) leadData.Street = participation.address;
    if (participation.city) leadData.City = participation.city;
    if (participation.postal_code) leadData.Zip_Code = participation.postal_code;
    if (participation.country) leadData.Country = participation.country;
    
    // Champs professionnels
    if (participation.company) leadData.Company = participation.company;
    if (participation.job_title) leadData.Designation = participation.job_title;
    if (participation.industry) leadData.Industry = participation.industry;
    if (participation.company_size) leadData.No_of_Employees = parseInt(participation.company_size) || 0;
    if (participation.website) leadData.Website = participation.website;
    
    // Champs personnels
    if (participation.salutation) leadData.Salutation = participation.salutation;
    
    // Champs marketing
    if (participation.lead_source) {
      leadData.Lead_Source = participation.lead_source;
    } else if (campaignName) {
      leadData.Lead_Source = "Jeu concours";
    }
    
    // Description avec infos campagne
    const description = [
      campaignName ? `Campagne: ${campaignName}` : "",
      participation.campaign_type ? `Type: ${participation.campaign_type}` : "",
      participation.prize_won ? `Prix gagné: ${participation.prize_won}` : "Pas de gain",
      participation.points_earned ? `Points: ${participation.points_earned}` : "",
      participation.interests ? `Intérêts: ${participation.interests}` : "",
      participation.customer_id ? `N° Client: ${participation.customer_id}` : "",
      participation.loyalty_card ? `Carte fidélité: ${participation.loyalty_card}` : "",
      `Date: ${participation.created_at || new Date().toISOString()}`,
    ].filter(Boolean).join("\n");
    leadData.Description = description;

    // Ensure Last_Name is set (required in Zoho)
    if (!leadData.Last_Name) {
      leadData.Last_Name = participation.email.split("@")[0];
    }

    console.log("📤 Creating/updating Lead in Zoho CRM...");

    // Search for existing lead by email
    const searchUrl = `${apiDomain}/crm/v3/Leads/search?email=${encodeURIComponent(participation.email)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    });

    let leadId: string | null = null;
    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.data && searchResult.data.length > 0) {
        leadId = searchResult.data[0].id;
      }
    }

    let response;
    let action: string;

    if (leadId) {
      // Update existing lead
      response = await fetch(`${apiDomain}/crm/v3/Leads`, {
        method: "PUT",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [{ ...leadData, id: leadId }],
        }),
      });
      action = "updated";
    } else {
      // Create new lead
      response = await fetch(`${apiDomain}/crm/v3/Leads`, {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [leadData],
        }),
      });
      action = "created";
    }

    if (response.ok) {
      const result = await response.json();
      const finalLeadId = result.data?.[0]?.details?.id || leadId;
      console.log(`✅ Lead ${participation.email} ${action} in Zoho CRM`);
      return new Response(
        JSON.stringify({ success: true, action, leadId: finalLeadId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
      console.error("Zoho CRM API error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: errorData.message || "Zoho CRM API error" }),
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
