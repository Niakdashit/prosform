import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  campaignId: string;
  email?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  city?: string;
  country?: string;
}

interface ValidationResult {
  allowed: boolean;
  reason?: string;
  blockReason?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      campaignId, 
      email, 
      ipAddress, 
      deviceFingerprint,
      city,
      country 
    } = await req.json() as ValidationRequest;

    console.log('Validating participation:', { campaignId, email, ipAddress, deviceFingerprint });

    // Check if already blocked
    const { data: blockedData, error: blockedError } = await supabase
      .from('blocked_participations')
      .select('*')
      .eq('campaign_id', campaignId)
      .or(`email.eq.${email},ip_address.eq.${ipAddress},device_fingerprint.eq.${deviceFingerprint}`)
      .limit(1);

    if (blockedError) {
      console.error('Error checking blocked participations:', blockedError);
    }

    if (blockedData && blockedData.length > 0) {
      console.log('Participation already blocked:', blockedData[0]);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'blocked',
          blockReason: blockedData[0].block_reason 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate participations
    const { data: existingParticipations, error: participationError } = await supabase
      .from('campaign_participants')
      .select('*')
      .eq('campaign_id', campaignId);

    if (participationError) {
      console.error('Error checking participations:', participationError);
      throw participationError;
    }

    let blockReason: string | null = null;

    // Check email duplicate
    if (email) {
      const emailDuplicates = existingParticipations.filter(p => p.email === email);
      if (emailDuplicates.length >= 1) {
        blockReason = 'duplicate_email';
        console.log('Duplicate email detected:', email);
      }
    }

    // Check IP duplicate (allow up to 3 from same IP)
    if (ipAddress && !blockReason) {
      const ipDuplicates = existingParticipations.filter(p => p.ip_address === ipAddress);
      if (ipDuplicates.length >= 3) {
        blockReason = 'duplicate_ip';
        console.log('Too many participations from IP:', ipAddress);
      }
    }

    // Check device fingerprint duplicate
    if (deviceFingerprint && !blockReason) {
      const deviceDuplicates = existingParticipations.filter(p => p.device_fingerprint === deviceFingerprint);
      if (deviceDuplicates.length >= 1) {
        blockReason = 'duplicate_device';
        console.log('Duplicate device detected:', deviceFingerprint);
      }
    }

    // If blocked, store in blocked_participations table
    if (blockReason) {
      const { error: insertError } = await supabase
        .from('blocked_participations')
        .insert({
          campaign_id: campaignId,
          email,
          ip_address: ipAddress,
          device_fingerprint: deviceFingerprint,
          block_reason: blockReason,
          metadata: { city, country }
        });

      if (insertError) {
        console.error('Error inserting blocked participation:', insertError);
      }

      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'duplicate',
          blockReason 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Participation allowed
    console.log('Participation allowed');
    return new Response(
      JSON.stringify({ allowed: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error validating participation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
