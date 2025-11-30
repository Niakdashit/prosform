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
    console.log('🚀 Starting data migration...');

    // New backend (Lovable Cloud)
    const newSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Old backend
    const oldSupabase = createClient(
      'https://wnnurvxtuhbjixjeuagd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubnVydnh0dWhiaml4amV1YWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI5MTU1MywiZXhwIjoyMDc5ODY3NTUzfQ.QrGJSr_tM3B4hx3cPUt1O-xQpLmr_OxpF7OLZoQePQA'
    );

    // 1. Migrate campaigns
    console.log('📋 Fetching campaigns from old backend...');
    const { data: oldCampaigns, error: fetchError } = await oldSupabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching campaigns:', fetchError);
      throw fetchError;
    }

    console.log(`✅ Found ${oldCampaigns?.length || 0} campaigns to migrate`);

    let migratedCount = 0;
    const errors = [];

    for (const campaign of oldCampaigns || []) {
      console.log(`   Migrating campaign: ${campaign.app_title} (${campaign.id})`);
      
      const { error: insertError } = await newSupabase
        .from('campaigns')
        .insert({
          id: campaign.id,
          app_title: campaign.app_title,
          title: campaign.title,
          user_id: campaign.user_id,
          type: campaign.type,
          config: campaign.config,
          status: campaign.status,
          is_published: campaign.is_published,
          published_at: campaign.published_at,
          public_url_slug: campaign.public_url_slug,
          published_url: campaign.published_url,
          participation_limit: campaign.participation_limit,
          participation_count: campaign.participation_count,
          starts_at: campaign.starts_at,
          ends_at: campaign.ends_at,
          thumbnail_url: campaign.thumbnail_url,
          created_at: campaign.created_at,
          updated_at: campaign.updated_at,
          last_edited_at: campaign.last_edited_at,
        });

      if (insertError) {
        console.error(`   ❌ Error migrating campaign ${campaign.id}:`, insertError.message);
        errors.push({ campaign: campaign.app_title, error: insertError.message });
      } else {
        migratedCount++;
        console.log(`   ✅ Migrated campaign ${campaign.app_title}`);
      }
    }

    // 2. Migrate campaign_analytics
    console.log('📊 Fetching analytics from old backend...');
    const { data: oldAnalytics } = await oldSupabase
      .from('campaign_analytics')
      .select('*');

    if (oldAnalytics && oldAnalytics.length > 0) {
      console.log(`   Found ${oldAnalytics.length} analytics records`);
      
      for (const analytics of oldAnalytics) {
        const { error: insertError } = await newSupabase
          .from('campaign_analytics')
          .insert(analytics);

        if (insertError && !insertError.message.includes('duplicate')) {
          console.error(`   ❌ Error migrating analytics for ${analytics.campaign_id}:`, insertError.message);
        }
      }
    }

    // 3. Migrate campaign_participants
    console.log('👥 Fetching participants from old backend...');
    const { data: oldParticipants } = await oldSupabase
      .from('campaign_participants')
      .select('*');

    if (oldParticipants && oldParticipants.length > 0) {
      console.log(`   Found ${oldParticipants.length} participants`);
      
      for (const participant of oldParticipants) {
        const { error: insertError } = await newSupabase
          .from('campaign_participants')
          .insert(participant);

        if (insertError && !insertError.message.includes('duplicate')) {
          console.error(`   ❌ Error migrating participant ${participant.id}:`, insertError.message);
        }
      }
    }

    console.log('✅ Migration completed!');

    return new Response(
      JSON.stringify({
        success: true,
        migratedCampaigns: migratedCount,
        totalCampaigns: oldCampaigns?.length || 0,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Migration failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Check the function logs for more information'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
