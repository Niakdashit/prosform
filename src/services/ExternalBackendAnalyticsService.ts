import { externalSupabase } from '@/integrations/supabase/externalClient';

/**
 * Service pour les analytics avancées utilisant les fonctions SQL du backend externe
 */

export interface CampaignStatsAdvanced {
  total_views: number;
  total_participations: number;
  total_completions: number;
  conversion_rate: number;
  completion_rate: number;
  avg_time_spent: number;
  last_participation_at: string | null;
  unique_participants: number;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  countries: Record<string, number>;
  utm_sources: Record<string, number>;
}

export interface ParticipationByDay {
  date: string;
  participations: number;
  completions: number;
  unique_emails: number;
}

export interface ConversionFunnelStep {
  label: string;
  value: number;
  percent: number;
}

export interface ConversionFunnel {
  steps: ConversionFunnelStep[];
}

export interface BlockedParticipant {
  id: string;
  campaign_id: string;
  ip_address: string | null;
  email: string | null;
  device_fingerprint: string | null;
  block_reason: string;
  blocked_at: string;
  metadata: any;
}

export const ExternalBackendAnalyticsService = {
  /**
   * Récupère les stats complètes d'une campagne
   */
  async getCampaignStats(campaignId: string): Promise<CampaignStatsAdvanced | null> {
    try {
      const { data, error } = await externalSupabase.rpc('get_campaign_stats', {
        p_campaign_id: campaignId,
      });

      if (error) {
        console.error('Error fetching campaign stats:', error);
        return null;
      }

      return data as CampaignStatsAdvanced;
    } catch (error) {
      console.error('Error in getCampaignStats:', error);
      return null;
    }
  },

  /**
   * Récupère les participations par jour pour une campagne
   */
  async getParticipationsByDay(
    campaignId: string,
    days: number = 30
  ): Promise<ParticipationByDay[]> {
    try {
      const { data, error } = await externalSupabase.rpc('get_participations_by_day', {
        p_campaign_id: campaignId,
        p_days: days,
      });

      if (error) {
        console.error('Error fetching participations by day:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        date: row.date,
        participations: Number(row.participations),
        completions: Number(row.completions),
        unique_emails: Number(row.unique_emails),
      }));
    } catch (error) {
      console.error('Error in getParticipationsByDay:', error);
      return [];
    }
  },

  /**
   * Récupère le funnel de conversion d'une campagne
   */
  async getConversionFunnel(campaignId: string): Promise<ConversionFunnel | null> {
    try {
      const { data, error } = await externalSupabase.rpc('get_conversion_funnel', {
        p_campaign_id: campaignId,
      });

      if (error) {
        console.error('Error fetching conversion funnel:', error);
        return null;
      }

      return data as ConversionFunnel;
    } catch (error) {
      console.error('Error in getConversionFunnel:', error);
      return null;
    }
  },

  /**
   * Vérifie le rate limit avant une participation
   */
  async checkRateLimit(
    identifier: string,
    identifierType: 'ip' | 'email' | 'device',
    campaignId: string,
    maxAttempts: number = 5,
    windowMinutes: number = 60
  ): Promise<{
    allowed: boolean;
    attempts?: number;
    max_attempts?: number;
    blocked_until?: string;
    reason?: string;
  }> {
    try {
      const { data, error } = await externalSupabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_identifier_type: identifierType,
        p_campaign_id: campaignId,
        p_max_attempts: maxAttempts,
        p_window_minutes: windowMinutes,
      });

      if (error) {
        console.error('Error checking rate limit:', error);
        return { allowed: true }; // Fallback: autoriser en cas d'erreur
      }

      return data;
    } catch (error) {
      console.error('Error in checkRateLimit:', error);
      return { allowed: true };
    }
  },

  /**
   * Vérifie si un participant est bloqué
   */
  async isParticipantBlocked(
    campaignId: string,
    ipAddress?: string,
    email?: string,
    deviceFingerprint?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await externalSupabase.rpc('is_participant_blocked', {
        p_campaign_id: campaignId,
        p_ip_address: ipAddress || null,
        p_email: email || null,
        p_device_fingerprint: deviceFingerprint || null,
      });

      if (error) {
        console.error('Error checking if participant is blocked:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in isParticipantBlocked:', error);
      return false;
    }
  },

  /**
   * Récupère la liste des participants bloqués pour une campagne
   */
  async getBlockedParticipants(campaignId?: string): Promise<BlockedParticipant[]> {
    try {
      let query = externalSupabase
        .from('blocked_participations')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching blocked participants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBlockedParticipants:', error);
      return [];
    }
  },

  /**
   * Débloque un participant
   */
  async unblockParticipant(blockedParticipantId: string): Promise<boolean> {
    try {
      const { error } = await externalSupabase
        .from('blocked_participations')
        .delete()
        .eq('id', blockedParticipantId);

      if (error) {
        console.error('Error unblocking participant:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in unblockParticipant:', error);
      return false;
    }
  },
};
