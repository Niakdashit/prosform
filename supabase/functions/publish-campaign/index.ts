import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface PublishRequest {
  campaignId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client with the user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('❌ Authentication error:', userError);
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { campaignId }: PublishRequest = await req.json();

    if (!campaignId) {
      throw new Error('Campaign ID is required');
    }

    console.log(`📤 Publishing campaign ${campaignId} for user ${user.id}`);

    // Fetch campaign to verify ownership and get details
    const { data: campaign, error: fetchError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !campaign) {
      console.error('❌ Campaign fetch error:', fetchError);
      throw new Error('Campaign not found or access denied');
    }

    // Validate campaign has required data
    if (!campaign.title || campaign.title.trim() === '') {
      throw new Error('Campaign must have a title to be published');
    }

    // Check if campaign is already published
    if (campaign.is_published && campaign.public_url_slug) {
      console.log(`✅ Campaign already published with slug: ${campaign.public_url_slug}`);
      
      const publicUrl = `${req.headers.get('origin')}/p/${campaign.public_url_slug}`;
      
      return new Response(
        JSON.stringify({
          success: true,
          slug: campaign.public_url_slug,
          publicUrl,
          message: 'Campaign is already published',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Generate unique slug using database function
    const { data: slugData, error: slugError } = await supabaseClient.rpc(
      'generate_campaign_slug',
      {
        campaign_title: campaign.title,
        campaign_id: campaignId,
      }
    );

    if (slugError || !slugData) {
      console.error('❌ Slug generation error:', slugError);
      throw new Error('Failed to generate unique URL');
    }

    const slug = slugData as string;
    const publicUrl = `${req.headers.get('origin')}/p/${slug}`;

    console.log(`🔗 Generated slug: ${slug}`);

    // Update campaign with publication details
    const { data: updatedCampaign, error: updateError } = await supabaseClient
      .from('campaigns')
      .update({
        is_published: true,
        status: 'online',
        published_at: new Date().toISOString(),
        public_url_slug: slug,
        published_url: publicUrl,
        last_edited_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update error:', updateError);
      throw new Error('Failed to publish campaign');
    }

    // Initialize analytics record if it doesn't exist
    const { error: analyticsError } = await supabaseClient
      .from('campaign_analytics')
      .upsert(
        {
          campaign_id: campaignId,
          total_views: 0,
          total_participations: 0,
          total_completions: 0,
          avg_time_spent: 0,
        },
        {
          onConflict: 'campaign_id',
        }
      );

    if (analyticsError) {
      console.warn('⚠️ Analytics initialization warning:', analyticsError);
    }

    console.log(`✅ Campaign published successfully: ${publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        campaign: updatedCampaign,
        slug,
        publicUrl,
        message: 'Campaign published successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Publish campaign error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to publish campaign';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
