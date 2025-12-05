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

    console.log("🔄 Salesforce sync for:", participation.email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Salesforce credentials
    const { data: integration, error: intError } = await supabase
      .from("organization_integrations")
      .select("credentials")
      .eq("organization_id", participation.organization_id)
      .eq("provider", "salesforce")
      .eq("status", "connected")
      .single();

    if (intError || !integration) {
      console.log("No Salesforce integration found");
      return new Response(
        JSON.stringify({ success: false, error: "Salesforce not connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = integration.credentials as Record<string, string>;
    const accessToken = credentials.access_token;
    const instanceUrl = credentials.instance_url;

    if (!accessToken || !instanceUrl) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing Salesforce credentials" }),
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

    // Prepare Salesforce Lead/Contact data
    // Using Lead object (can be changed to Contact if preferred)
    const leadData: Record<string, string | number | boolean> = {
      Email: participation.email,
    };
    
    // Champs de base
    if (participation.first_name) leadData.FirstName = participation.first_name;
    if (participation.last_name) leadData.LastName = participation.last_name;
    if (participation.phone) leadData.Phone = participation.phone;
    
    // Champs d'adresse
    if (participation.address) leadData.Street = participation.address;
    if (participation.city) leadData.City = participation.city;
    if (participation.postal_code) leadData.PostalCode = participation.postal_code;
    if (participation.country) leadData.Country = participation.country;
    
    // Champs professionnels
    if (participation.company) leadData.Company = participation.company;
    if (participation.job_title) leadData.Title = participation.job_title;
    if (participation.industry) leadData.Industry = participation.industry;
    if (participation.company_size) leadData.NumberOfEmployees = parseInt(participation.company_size) || 0;
    if (participation.website) leadData.Website = participation.website;
    
    // Champs personnels
    if (participation.salutation) leadData.Salutation = participation.salutation;
    
    // Champs marketing
    if (participation.lead_source) {
      leadData.LeadSource = participation.lead_source;
    } else if (campaignName) {
      leadData.LeadSource = `Campagne: ${campaignName}`;
    } else {
      leadData.LeadSource = "Jeu concours";
    }
    
    // Description avec infos campagne
    const description = [
      campaignName ? `Campagne: ${campaignName}` : "",
      participation.campaign_type ? `Type: ${participation.campaign_type}` : "",
      participation.prize_won ? `Prix gagné: ${participation.prize_won}` : "Pas de gain",
      participation.points_earned ? `Points: ${participation.points_earned}` : "",
      `Date: ${participation.created_at || new Date().toISOString()}`,
    ].filter(Boolean).join("\n");
    leadData.Description = description;

    // Ensure LastName is set (required in Salesforce)
    if (!leadData.LastName) {
      leadData.LastName = participation.email.split("@")[0];
    }
    
    // Ensure Company is set (required for Lead in Salesforce)
    if (!leadData.Company) {
      leadData.Company = "Non spécifié";
    }

    console.log("📤 Creating/updating Lead in Salesforce...");

    // First, try to find existing lead by email
    const searchUrl = `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(`SELECT Id FROM Lead WHERE Email = '${participation.email}' LIMIT 1`)}`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    let leadId: string | null = null;
    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.records && searchResult.records.length > 0) {
        leadId = searchResult.records[0].Id;
      }
    }

    let response;
    let action: string;

    if (leadId) {
      // Update existing lead
      response = await fetch(`${instanceUrl}/services/data/v58.0/sobjects/Lead/${leadId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      });
      action = "updated";
    } else {
      // Create new lead
      response = await fetch(`${instanceUrl}/services/data/v58.0/sobjects/Lead`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      });
      action = "created";
    }

    if (response.ok || response.status === 201 || response.status === 204) {
      const result = await response.json().catch(() => ({ id: leadId }));
      console.log(`✅ Lead ${participation.email} ${action} in Salesforce`);
      return new Response(
        JSON.stringify({ success: true, action, leadId: result.id || leadId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorData = await response.json().catch(() => [{ message: "Unknown error" }]);
      console.error("Salesforce API error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: errorData[0]?.message || "Salesforce API error" }),
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
