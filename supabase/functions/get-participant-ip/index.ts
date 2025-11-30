import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer l'IP réelle depuis les headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare
    
    // Priorité: cf-connecting-ip > x-real-ip > x-forwarded-for (première IP)
    let ipAddress = cfConnectingIp || realIp;
    
    if (!ipAddress && forwardedFor) {
      // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules
      // La première est l'IP du client original
      ipAddress = forwardedFor.split(',')[0].trim();
    }
    
    // Fallback si aucune IP n'est trouvée
    if (!ipAddress) {
      ipAddress = 'unknown';
    }

    console.log('IP detected:', ipAddress);

    return new Response(
      JSON.stringify({ 
        ip_address: ipAddress,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in get-participant-ip function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        ip_address: 'unknown'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
