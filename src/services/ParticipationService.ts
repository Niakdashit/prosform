import { supabase } from '@/integrations/supabase/client';
import { emailSchema, phoneSchema, nameSchema } from '@/schemas/participation.schema';
import { ExternalBackendAnalyticsService, CampaignSettings } from './ExternalBackendAnalyticsService';
import { StepDurationStorage } from '@/utils/stepDurationStorage';
import { AnalyticsTrackingService } from './AnalyticsTrackingService';
import { z } from 'zod';

export interface ParticipationData {
  campaignId: string;
  email?: string;
  contactData?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    company?: string;
    jobTitle?: string;
    birthdate?: string;
    // Champs personnalisés
    [key: string]: string | undefined;
  };
  result: {
    type: 'win' | 'lose' | 'pending'; // pending = participation enregistrée au spin, résultat pas encore connu
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
        // Silently ignore IP fetch errors
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

      
      // TEMPORAIREMENT DÉSACTIVÉ POUR TEST HUBSPOT
      // TODO: Réactiver après les tests
      const SKIP_ANTISPAM = true;
      
      if (!SKIP_ANTISPAM) {
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
      } // Fin du if (!SKIP_ANTISPAM)

      // ===== FIN VÉRIFICATIONS ANTI-SPAM =====

      // Récupérer les durées stockées en sessionStorage si disponibles
      let stepDurations: Record<string, number> = {};
      try {
        const stored = sessionStorage.getItem(`step_durations_${data.campaignId}`);
        if (stored) {
          stepDurations = JSON.parse(stored);
        }
      } catch (e) {
        // Silently ignore sessionStorage errors
      }

      // Données de base (toujours présentes)
      const baseData: any = {
        campaign_id: data.campaignId,
        email: data.email || contactData.email,
        participation_data: {
          contactData: contactData,
          result: data.result,
          timestamp: new Date().toISOString(),
          stepDurations, // Ajouter les durées par étape
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
      // Note: total_views et total_completions sont gérés par AnalyticsTrackingService.trackStepView()
      // Ici on ne met à jour que total_participations et last_participation_at
      const { data: existingAnalytics, error: fetchError } = await supabase
        .from('campaign_analytics')
        .select('id, total_participations')
        .eq('campaign_id', data.campaignId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching campaign analytics (external):', fetchError);
        return;
      }

      if (!existingAnalytics) {
        // Créer une entrée si elle n'existe pas encore
        // (normalement elle devrait déjà exister grâce à trackStepView)
        const { error: insertAnalyticsError } = await supabase
          .from('campaign_analytics')
          .insert({
            campaign_id: data.campaignId,
            total_views: 0, // Sera mis à jour par trackStepView
            total_participations: 1,
            total_completions: 0, // Sera mis à jour par trackStepView quand ending est vu
            last_participation_at: new Date().toISOString(),
          });

        if (insertAnalyticsError) {
          console.error('Error inserting campaign analytics (external):', insertAnalyticsError);
        }
      } else {
        // Incrémenter uniquement total_participations
        const { error: updateAnalyticsError } = await supabase
          .from('campaign_analytics')
          .update({
            total_participations: (existingAnalytics.total_participations || 0) + 1,
            last_participation_at: new Date().toISOString(),
          })
          .eq('id', existingAnalytics.id);

        if (updateAnalyticsError) {
          console.error('Error updating campaign analytics (external):', updateAnalyticsError);
        }
      }
      
      // Mettre à jour daily_analytics pour les séries temporelles réelles
      await AnalyticsTrackingService.updateDailyAnalytics(data.campaignId, {
        participations: 1,
      });

      // Nettoyer les durées stockées maintenant que la participation est enregistrée
      StepDurationStorage.clearStepDurations(data.campaignId);

      // ===== SYNCHRONISATION CRM =====
      // Synchroniser vers les CRM connectés (HubSpot, etc.) en arrière-plan
      ParticipationService.syncToCRMs(data, contactData).catch((err) => {
        console.error('CRM sync error (non-blocking):', err);
      });

    } catch (err) {
      console.error('Failed to record participation:', err);
      // Ne pas bloquer l'expérience utilisateur si l'enregistrement échoue
    }
  },

  /**
   * Synchronise une participation vers tous les CRM connectés
   */
  async syncToCRMs(data: ParticipationData, contactData: ParticipationData['contactData']): Promise<void> {
    try {
      // Récupérer l'organization_id de la campagne
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('organization_id, type, name')
        .eq('id', data.campaignId)
        .single();

      if (campaignError || !campaign?.organization_id) {
        console.log('Could not get organization for CRM sync');
        return;
      }

      // Récupérer les intégrations actives
      const { data: integrations, error: intError } = await supabase
        .from('organization_integrations')
        .select('id, provider, credentials, config')
        .eq('organization_id', campaign.organization_id)
        .eq('status', 'connected');

      if (intError || !integrations || integrations.length === 0) {
        console.log('No active CRM integrations for sync');
        return;
      }

      const email = data.email || contactData.email;
      if (!email) {
        console.log('No email for CRM sync');
        return;
      }

      // Préparer les données de participation pour le CRM
      // Debug: afficher les données reçues
      console.log('📤 [ParticipationService] contactData received:', JSON.stringify(contactData, null, 2));
      
      // Extraire prénom/nom - priorité aux champs explicites firstName/lastName
      const firstName = contactData.firstName || contactData.name?.split(' ')[0] || '';
      const lastName = contactData.lastName || contactData.name?.split(' ').slice(1).join(' ') || '';
      
      console.log('📤 [ParticipationService] Extracted - firstName:', firstName, 'lastName:', lastName);
      console.log('📤 [ParticipationService] salutation:', contactData.salutation);
      
      const participationForCRM = {
        id: crypto.randomUUID(),
        email,
        first_name: firstName,
        last_name: lastName,
        phone: contactData.phone,
        // Champs d'adresse
        address: contactData.address,
        city: contactData.city,
        postal_code: contactData.postalCode,
        country: contactData.country,
        // Champs professionnels
        company: contactData.company,
        job_title: contactData.jobTitle,
        industry: contactData.industry,
        company_size: contactData.companySize,
        website: contactData.website,
        linkedin: contactData.linkedin,
        // Champs personnels
        birthdate: contactData.birthdate,
        salutation: contactData.salutation,
        gender: contactData.gender,
        nationality: contactData.nationality,
        language: contactData.language,
        marital_status: contactData.maritalStatus,
        // Champs marketing
        lead_source: contactData.leadSource,
        gdpr_consent: contactData.gdprConsent,
        interests: contactData.interests,
        // Champs e-commerce / fidélité
        customer_id: contactData.customerId,
        loyalty_card: contactData.loyaltyCard,
        preferred_store: contactData.preferredStore,
        // Infos campagne
        organization_id: campaign.organization_id,
        campaign_id: data.campaignId,
        campaign_type: campaign.type,
        prize_won: data.result.prize,
        points_earned: data.result.score || 0,
        created_at: new Date().toISOString(),
      };

      // Synchroniser vers chaque CRM
      for (const integration of integrations) {
        try {
          // Map provider to Edge Function name
          const edgeFunctionMap: Record<string, string> = {
            'hubspot': 'hubspot-sync',
            'brevo': 'brevo-sync',
            'sendinblue': 'brevo-sync', // Alias - sendinblue is now brevo
            'mailchimp': 'mailchimp-sync',
            'salesforce': 'salesforce-sync',
            'pipedrive': 'pipedrive-sync',
            'zoho': 'zoho-sync',
            'zoho_crm': 'zoho-sync', // Alias
            'activecampaign': 'activecampaign-sync',
          };

          const edgeFunction = edgeFunctionMap[integration.provider];
          
          if (edgeFunction) {
            console.log(`🔄 Syncing to ${integration.provider} via Edge Function...`);
            const { data: result, error: syncError } = await supabase.functions.invoke(edgeFunction, {
              body: { participation: participationForCRM },
            });
            if (syncError) {
              console.error(`❌ ${integration.provider} sync failed:`, syncError.message);
              await ParticipationService.logCRMSync(integration.id, data.campaignId, 'error', syncError.message);
            } else {
              console.log(`✅ ${integration.provider} sync successful:`, result);
              await ParticipationService.logCRMSync(integration.id, data.campaignId, 'success');
            }
          } else {
            console.log(`CRM sync for ${integration.provider} not implemented yet`);
          }
        } catch (err) {
          console.error(`Sync to ${integration.provider} failed:`, err);
          await ParticipationService.logCRMSync(integration.id, data.campaignId, 'error', (err as Error).message);
        }
      }
    } catch (err) {
      console.error('CRM sync error:', err);
    }
  },

  /**
   * Log une synchronisation CRM
   */
  async logCRMSync(integrationId: string, campaignId: string, status: 'success' | 'error', errorMessage?: string): Promise<void> {
    try {
      await supabase.from('integration_sync_logs').insert({
        integration_id: integrationId,
        action_type: 'participation_sync',
        status,
        request_data: { campaign_id: campaignId },
        error_message: errorMessage,
        records_processed: 1,
        records_success: status === 'success' ? 1 : 0,
        records_failed: status === 'error' ? 1 : 0,
      });
    } catch (err) {
      console.error('Error logging CRM sync:', err);
    }
  },
};
