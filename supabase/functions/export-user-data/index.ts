import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Exporting data for user:', user.id);

    // Gather all user data
    const [profileData, campaignsData, participationsData, consentsData] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('campaigns').select('*').eq('user_id', user.id),
      supabase.from('campaign_participants').select('*').eq('email', user.email),
      supabase.from('user_consents').select('*').eq('user_id', user.id)
    ]);

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profileData.data,
      campaigns: campaignsData.data || [],
      participations: participationsData.data || [],
      consents: consentsData.data || [],
      exported_at: new Date().toISOString()
    };

    // Log export request
    const { error: logError } = await supabase
      .from('gdpr_exports')
      .insert({
        user_id: user.id,
        export_type: 'full_export',
        status: 'completed',
        completed_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging export:', logError);
    }

    return new Response(
      JSON.stringify(exportData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="user-data-${user.id}.json"`
        } 
      }
    );

  } catch (error) {
    console.error('Error exporting data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: errorMessage === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
