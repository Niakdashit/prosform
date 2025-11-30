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

// Générer un device fingerprint basé sur les caractéristiques du navigateur
function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let hash = '';
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    hash = canvas.toDataURL().slice(-50);
  }
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    hash
  ];
  
  // Simple hash function
  let fingerprint = 0;
  const str = components.join('###');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    fingerprint = ((fingerprint << 5) - fingerprint) + char;
    fingerprint = fingerprint & fingerprint;
  }
  
  return Math.abs(fingerprint).toString(36);
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
      // Récupérer l'IP réelle via edge function
      let realIpAddress = null;
      try {
        const ipResponse = await supabase.functions.invoke('get-participant-ip');
        if (ipResponse.data?.ip_address && ipResponse.data.ip_address !== 'unknown') {
          realIpAddress = ipResponse.data.ip_address;
        }
      } catch (ipError) {
        console.log('Could not fetch IP address:', ipError);
      }

      // Données de base (toujours présentes)
      const baseData: any = {
        campaign_id: data.campaignId,
        email: data.email || data.contactData?.email,
        participation_data: {
          contactData: data.contactData,
          result: data.result,
          timestamp: new Date().toISOString(),
        },
        completed_at: new Date().toISOString(),
      };
      
      // Essayer d'abord avec toutes les colonnes avancées
      try {
        const userAgent = navigator.userAgent;
        const { device_type, browser, os } = parseUserAgent(userAgent);
        const language = navigator.language || (navigator as any).userLanguage || '';
        const country = language.includes('-') ? language.split('-')[1]?.toUpperCase() : null;
        const utmParams = extractUTMParams();
        const referrer = document.referrer || undefined;
        const deviceFingerprint = generateDeviceFingerprint();
        
        // Enrichir participation_data avec les données de tracking
        baseData.participation_data = {
          ...baseData.participation_data,
          device_type,
          browser,
          os,
          country,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          referrer,
          user_agent: userAgent,
          device_fingerprint: deviceFingerprint,
          ip_address: realIpAddress,
        };
        
        const { error: insertError } = await supabase
          .from('campaign_participants')
          .insert({
            ...baseData,
            user_agent: userAgent,
            referrer: referrer,
            device_type,
            browser,
            os,
            country,
            device_fingerprint: deviceFingerprint,
            ip_address: realIpAddress,
            utm_source: utmParams.utm_source,
            utm_medium: utmParams.utm_medium,
            utm_campaign: utmParams.utm_campaign,
          });

        if (insertError) {
          // Si erreur de colonne manquante, réessayer avec données de base uniquement
          if (insertError.message?.includes('column') || insertError.code === '42703') {
            console.warn('Advanced columns not available, using basic insert with enriched participation_data');
            const { error: basicError } = await supabase
              .from('campaign_participants')
              .insert(baseData);
            
            if (basicError) {
              console.error('Error recording participation (basic):', basicError);
              throw basicError;
            }
          } else {
            throw insertError;
          }
        }
      } catch (advancedError: any) {
        // Fallback: insertion basique si l'insertion avancée échoue
        console.warn('Fallback to basic participation recording:', advancedError);
        const { error: basicError } = await supabase
          .from('campaign_participants')
          .insert(baseData);
        
        if (basicError) {
          console.error('Error recording participation (fallback):', basicError);
          throw basicError;
        }
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
