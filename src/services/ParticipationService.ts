import { supabase } from '@/integrations/supabase/client';
import { emailSchema, phoneSchema, nameSchema } from '@/schemas/participation.schema';
import { ExternalBackendAnalyticsService, CampaignSettings } from './ExternalBackendAnalyticsService';
import { z } from 'zod';

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
      // Validation des données de contact avec Zod
      const contactData = data.contactData || {};
      
      // Valider l'email si présent
      if (contactData.email || data.email) {
        try {
          const emailToValidate = contactData.email || data.email;
          const validatedEmail = emailSchema.parse(emailToValidate);
          if (contactData.email) contactData.email = validatedEmail;
          if (data.email) data.email = validatedEmail;
        } catch (error) {
          console.error('Invalid email:', error);
          throw new Error('Email invalide');
        }
      }

      // Valider le téléphone si présent
      if (contactData.phone) {
        try {
          contactData.phone = phoneSchema.parse(contactData.phone);
        } catch (error) {
          console.error('Invalid phone:', error);
          throw new Error('Numéro de téléphone invalide');
        }
      }

      // Valider le nom si présent
      if (contactData.name) {
        try {
          contactData.name = nameSchema.parse(contactData.name);
        } catch (error) {
          console.error('Invalid name:', error);
          throw new Error('Nom invalide');
        }
      }

      // Récupérer l'IP réelle via edge function et le device fingerprint
      let realIpAddress = null;
      const deviceFingerprint = generateDeviceFingerprint();
      
      try {
        const ipResponse = await supabase.functions.invoke('get-participant-ip');
        if (ipResponse.data?.ip_address && ipResponse.data.ip_address !== 'unknown') {
          realIpAddress = ipResponse.data.ip_address;
        }
      } catch (ipError) {
        console.log('Could not fetch IP address:', ipError);
      }

      // ===== VÉRIFICATIONS ANTI-SPAM AVEC CONFIGURATION PAR CAMPAGNE =====
      
      // Récupérer les settings de la campagne ou utiliser les valeurs par défaut
      const settings = await ExternalBackendAnalyticsService.getCampaignSettings(data.campaignId);
      const rateLimitConfig: CampaignSettings = settings || {
        campaign_id: data.campaignId,
        ip_max_attempts: 5,
        ip_window_minutes: 60,
        email_max_attempts: 3,
        email_window_minutes: 60,
        device_max_attempts: 5,
        device_window_minutes: 60,
        auto_block_enabled: true,
        block_duration_hours: 24,
      };

      console.log('⚙️ Using rate limit config for campaign:', rateLimitConfig);
      
      // 1. Vérifier si le participant est bloqué
      const isBlocked = await ExternalBackendAnalyticsService.isParticipantBlocked(
        data.campaignId,
        realIpAddress || undefined,
        contactData.email || data.email,
        deviceFingerprint
      );

      if (isBlocked) {
        throw new Error('Vous avez été temporairement bloqué en raison de tentatives suspectes. Veuillez réessayer plus tard.');
      }

      // 2. Vérifier le rate limit par IP avec config personnalisée
      if (realIpAddress) {
        const ipRateLimit = await ExternalBackendAnalyticsService.checkRateLimit(
          realIpAddress,
          'ip',
          data.campaignId,
          rateLimitConfig.ip_max_attempts,
          rateLimitConfig.ip_window_minutes
        );

        if (!ipRateLimit.allowed) {
          const blockedUntil = ipRateLimit.blocked_until 
            ? new Date(ipRateLimit.blocked_until).toLocaleTimeString()
            : 'quelques minutes';
          throw new Error(`Trop de tentatives depuis votre connexion. Veuillez réessayer après ${blockedUntil}.`);
        }
      }

      // 3. Vérifier le rate limit par email avec config personnalisée
      if (contactData.email || data.email) {
        const emailToCheck = contactData.email || data.email;
        const emailRateLimit = await ExternalBackendAnalyticsService.checkRateLimit(
          emailToCheck!,
          'email',
          data.campaignId,
          rateLimitConfig.email_max_attempts,
          rateLimitConfig.email_window_minutes
        );

        if (!emailRateLimit.allowed) {
          const blockedUntil = emailRateLimit.blocked_until 
            ? new Date(emailRateLimit.blocked_until).toLocaleTimeString()
            : 'quelques minutes';
          throw new Error(`Cet email a déjà participé trop de fois. Veuillez réessayer après ${blockedUntil}.`);
        }
      }

      // 4. Vérifier le rate limit par device fingerprint avec config personnalisée
      const deviceRateLimit = await ExternalBackendAnalyticsService.checkRateLimit(
        deviceFingerprint,
        'device',
        data.campaignId,
        rateLimitConfig.device_max_attempts,
        rateLimitConfig.device_window_minutes
      );

      if (!deviceRateLimit.allowed) {
        const blockedUntil = deviceRateLimit.blocked_until 
          ? new Date(deviceRateLimit.blocked_until).toLocaleTimeString()
          : 'quelques minutes';
        throw new Error(`Trop de tentatives depuis cet appareil. Veuillez réessayer après ${blockedUntil}.`);
      }

      // ===== FIN VÉRIFICATIONS ANTI-SPAM =====

      // Données de base (toujours présentes)
      const baseData: any = {
        campaign_id: data.campaignId,
        email: data.email || contactData.email,
        participation_data: {
          contactData: contactData,
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

      // Mettre à jour les analytics de la campagne (table campaign_analytics sur backend externe)
      const { data: existingAnalytics, error: fetchError } = await supabase
        .from('campaign_analytics')
        .select('id, total_views, total_participations, total_completions')
        .eq('campaign_id', data.campaignId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching campaign analytics (external):', fetchError);
        return;
      }

      const isWin = data.result.type === 'win';

      if (!existingAnalytics) {
        const { error: insertAnalyticsError } = await supabase
          .from('campaign_analytics')
          .insert({
            campaign_id: data.campaignId,
            // Ne pas toucher total_views ici - c'est géré par trackStepView
            total_views: 0,
            total_participations: 1,
            total_completions: isWin ? 1 : 0,
            last_participation_at: new Date().toISOString(),
          });

        if (insertAnalyticsError) {
          console.error('Error inserting campaign analytics (external):', insertAnalyticsError);
        }
      } else {
        const { error: updateAnalyticsError } = await supabase
          .from('campaign_analytics')
          .update({
            // Ne pas toucher total_views ici - c'est géré par trackStepView
            total_participations: (existingAnalytics.total_participations || 0) + 1,
            total_completions: (existingAnalytics.total_completions || 0) + (isWin ? 1 : 0),
            last_participation_at: new Date().toISOString(),
          })
          .eq('id', existingAnalytics.id);

        if (updateAnalyticsError) {
          console.error('Error updating campaign analytics (external):', updateAnalyticsError);
        }
      }
    } catch (err) {
      console.error('Failed to record participation:', err);
      // Ne pas bloquer l'expérience utilisateur si l'enregistrement échoue
    }
  },
};
