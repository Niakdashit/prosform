import { supabase } from '@/integrations/supabase/client';

export interface ParticipationData {
  campaignId: string;
  email?: string;
  contactData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  result: {
    type: 'win' | 'lose';
    prize?: string;
    score?: number;
    answers?: any;
  };
}

// Helper pour parser le user agent
function parseUserAgent(ua: string) {
  const mobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const tablet = /tablet|ipad/i.test(ua);
  const device_type = tablet ? 'tablet' : mobile ? 'mobile' : 'desktop';
  
  let browser = 'Other';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  let os = 'Other';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return { device_type, browser, os };
}

// Helper pour extraire les UTM params de l'URL
function extractUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
}

/**
 * Service pour enregistrer les participations aux campagnes
 */
export const ParticipationService = {
  /**
   * Enregistre une participation dans la base de données
   */
  async recordParticipation(data: ParticipationData): Promise<void> {
    try {
      // Parser le user agent
      const userAgent = navigator.userAgent;
      const { device_type, browser, os } = parseUserAgent(userAgent);
      
      // Estimation simple du pays à partir de la langue du navigateur
      const language = navigator.language || (navigator as any).userLanguage || '';
      const country = language.includes('-') ? language.split('-')[1]?.toUpperCase() : null;
      
      // Extraire les UTM params
      const utmParams = extractUTMParams();
      
      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: data.campaignId,
          email: data.email || data.contactData?.email,
          participation_data: {
            contactData: data.contactData,
            result: data.result,
            timestamp: new Date().toISOString(),
          },
          completed_at: new Date().toISOString(),
          user_agent: userAgent,
          referrer: document.referrer || undefined,
          device_type,
          browser,
          os,
          country,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
        });

      if (error) {
        console.error('Error recording participation:', error);
        throw error;
      }

      // Mettre à jour les analytics de la campagne (table campaign_analytics)
      const { data: existingAnalytics, error: fetchError } = await supabase
        .from('campaign_analytics')
        .select('id, total_views, total_participations, total_completions')
        .eq('campaign_id', data.campaignId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching campaign analytics:', fetchError);
        return;
      }

      const isWin = data.result.type === 'win';

      if (!existingAnalytics) {
        const { error: insertAnalyticsError } = await supabase
          .from('campaign_analytics')
          .insert({
            campaign_id: data.campaignId,
            total_views: 1,
            total_participations: 1,
            total_completions: isWin ? 1 : 0,
            last_participation_at: new Date().toISOString(),
          });

        if (insertAnalyticsError) {
          console.error('Error inserting campaign analytics:', insertAnalyticsError);
        }
      } else {
        const { error: updateAnalyticsError } = await supabase
          .from('campaign_analytics')
          .update({
            total_views: (existingAnalytics.total_views || 0) + 1,
            total_participations: (existingAnalytics.total_participations || 0) + 1,
            total_completions: (existingAnalytics.total_completions || 0) + (isWin ? 1 : 0),
            last_participation_at: new Date().toISOString(),
          })
          .eq('id', existingAnalytics.id);

        if (updateAnalyticsError) {
          console.error('Error updating campaign analytics:', updateAnalyticsError);
        }
      }
    } catch (err) {
      console.error('Failed to record participation:', err);
      // Ne pas bloquer l'expérience utilisateur si l'enregistrement échoue
    }
  },
};
