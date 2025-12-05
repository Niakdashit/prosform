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

// Helper to get MD5 hash for Mailchimp subscriber ID
async function md5(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.toLowerCase());
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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

    console.log("🔄 Mailchimp sync for:", participation.email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Mailchimp credentials
    const { data: integration, error: intError } = await supabase
      .from("organization_integrations")
      .select("credentials")
      .eq("organization_id", participation.organization_id)
      .eq("provider", "mailchimp")
      .eq("status", "connected")
      .single();

    if (intError || !integration) {
      console.log("No Mailchimp integration found");
      return new Response(
        JSON.stringify({ success: false, error: "Mailchimp not connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = integration.credentials as Record<string, string>;
    const apiKey = credentials.api_key || credentials.apiKey;
    const listId = credentials.list_id || credentials.listId || credentials.audience_id;
    const serverPrefix = credentials.server_prefix || credentials.dc || apiKey?.split("-").pop();

    if (!apiKey || !listId || !serverPrefix) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing Mailchimp credentials (api_key, list_id, or server_prefix)" }),
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

    // Prepare Mailchimp merge fields
    const mergeFields: Record<string, string | number> = {};
    
    // Champs de base (Mailchimp standard merge fields)
    if (participation.first_name) mergeFields.FNAME = participation.first_name;
    if (participation.last_name) mergeFields.LNAME = participation.last_name;
    if (participation.phone) mergeFields.PHONE = participation.phone;
    
    // Champs d'adresse (Mailchimp address format)
    if (participation.address || participation.city || participation.postal_code || participation.country) {
      mergeFields.ADDRESS = JSON.stringify({
        addr1: participation.address || "",
        city: participation.city || "",
        zip: participation.postal_code || "",
        country: participation.country || "",
      });
    }
    
    // Champs professionnels
    if (participation.company) mergeFields.COMPANY = participation.company;
    if (participation.job_title) mergeFields.JOBTITLE = participation.job_title;
    if (participation.industry) mergeFields.INDUSTRY = participation.industry;
    if (participation.website) mergeFields.WEBSITE = participation.website;
    
    // Champs personnels
    if (participation.birthdate) mergeFields.BIRTHDAY = participation.birthdate;
    if (participation.salutation) mergeFields.CIVILITE = participation.salutation;
    if (participation.gender) mergeFields.GENDER = participation.gender;
    if (participation.language) mergeFields.LANGUAGE = participation.language;
    
    // Champs marketing
    if (participation.lead_source) mergeFields.SOURCE = participation.lead_source;
    if (participation.interests) mergeFields.INTERESTS = participation.interests;
    
    // Champs e-commerce / fidélité
    if (participation.customer_id) mergeFields.CUSTID = participation.customer_id;
    if (participation.loyalty_card) mergeFields.LOYALTY = participation.loyalty_card;
    if (participation.preferred_store) mergeFields.STORE = participation.preferred_store;
    
    // Champs campagne
    if (campaignName) mergeFields.CAMPAIGN = campaignName;
    if (participation.prize_won) mergeFields.PRIZE = participation.prize_won;
    if (participation.points_earned) mergeFields.POINTS = participation.points_earned;

    const subscriberHash = await md5(participation.email);
    const baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`;

    const memberData = {
      email_address: participation.email,
      status_if_new: "subscribed",
      merge_fields: mergeFields,
    };

    console.log("📤 Creating/updating member in Mailchimp...");

    // Use PUT to create or update (upsert)
    const response = await fetch(`${baseUrl}/lists/${listId}/members/${subscriberHash}`, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memberData),
    });

    if (response.ok) {
      const result = await response.json();
      const action = result.status === "subscribed" ? "updated" : "created";
      console.log(`✅ Member ${participation.email} ${action} in Mailchimp`);
      return new Response(
        JSON.stringify({ success: true, action, memberId: result.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      console.error("Mailchimp API error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: errorData.detail || errorData.title || "Mailchimp API error" }),
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
