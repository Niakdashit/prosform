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

    console.log("🔄 Brevo sync for:", participation.email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Brevo credentials
    const { data: integration, error: intError } = await supabase
      .from("organization_integrations")
      .select("credentials")
      .eq("organization_id", participation.organization_id)
      .eq("provider", "brevo")
      .eq("status", "connected")
      .single();

    if (intError || !integration) {
      console.log("No Brevo integration found");
      return new Response(
        JSON.stringify({ success: false, error: "Brevo not connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = integration.credentials as Record<string, string>;
    const apiKey = credentials.api_key || credentials.apiKey;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "No API key found" }),
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

    // Prepare Brevo contact attributes
    // Brevo uses "attributes" object for custom fields
    const attributes: Record<string, string | number | boolean> = {};
    
    // Champs de base
    if (participation.first_name) attributes.PRENOM = participation.first_name;
    if (participation.last_name) attributes.NOM = participation.last_name;
    if (participation.phone) attributes.SMS = participation.phone;
    
    // Champs d'adresse
    if (participation.address) attributes.ADRESSE = participation.address;
    if (participation.city) attributes.VILLE = participation.city;
    if (participation.postal_code) attributes.CODE_POSTAL = participation.postal_code;
    if (participation.country) attributes.PAYS = participation.country;
    
    // Champs professionnels
    if (participation.company) attributes.ENTREPRISE = participation.company;
    if (participation.job_title) attributes.POSTE = participation.job_title;
    if (participation.industry) attributes.SECTEUR = participation.industry;
    if (participation.company_size) attributes.TAILLE_ENTREPRISE = participation.company_size;
    if (participation.website) attributes.SITE_WEB = participation.website;
    if (participation.linkedin) attributes.LINKEDIN = participation.linkedin;
    
    // Champs personnels
    if (participation.birthdate) attributes.DATE_NAISSANCE = participation.birthdate;
    if (participation.salutation) attributes.CIVILITE = participation.salutation;
    if (participation.gender) attributes.GENRE = participation.gender;
    if (participation.nationality) attributes.NATIONALITE = participation.nationality;
    if (participation.language) attributes.LANGUE = participation.language;
    if (participation.marital_status) attributes.SITUATION_FAMILIALE = participation.marital_status;
    
    // Champs marketing
    if (participation.lead_source) attributes.SOURCE = participation.lead_source;
    if (participation.gdpr_consent) attributes.RGPD_CONSENT = participation.gdpr_consent === 'true';
    if (participation.interests) attributes.INTERETS = participation.interests;
    
    // Champs e-commerce / fidélité
    if (participation.customer_id) attributes.NUMERO_CLIENT = participation.customer_id;
    if (participation.loyalty_card) attributes.CARTE_FIDELITE = participation.loyalty_card;
    if (participation.preferred_store) attributes.MAGASIN_PREFERE = participation.preferred_store;
    
    // Champs campagne
    if (campaignName) attributes.DERNIERE_CAMPAGNE = campaignName;
    if (participation.campaign_type) attributes.TYPE_CAMPAGNE = participation.campaign_type;
    if (participation.prize_won) attributes.DERNIER_GAIN = participation.prize_won;
    if (participation.points_earned) attributes.POINTS = participation.points_earned;
    attributes.DATE_PARTICIPATION = participation.created_at || new Date().toISOString();

    const contactData = {
      email: participation.email,
      attributes,
      updateEnabled: true, // Update if contact exists
    };

    console.log("📤 Creating/updating contact in Brevo...");

    // Brevo API - Create or update contact
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    if (response.ok || response.status === 201) {
      const result = await response.json().catch(() => ({}));
      console.log(`✅ Contact ${participation.email} created/updated in Brevo`);
      return new Response(
        JSON.stringify({ success: true, action: "created", contactId: result.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (response.status === 204) {
      // Contact updated (no content returned)
      console.log(`✅ Contact ${participation.email} updated in Brevo`);
      return new Response(
        JSON.stringify({ success: true, action: "updated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
      console.error("Brevo API error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: errorData.message || "Brevo API error" }),
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
