import { supabase } from '@/integrations/supabase/client';

export interface GeoStats {
  country: string;
  count: number;
  percentage: number;
}

export interface DeviceStats {
  device_type: string;
  count: number;
  percentage: number;
}

export interface TrafficSource {
  source: string;
  count: number;
  percentage: number;
}

export interface PeakHour {
  hour: number;
  count: number;
}

export interface PeakDay {
  day: string;
  count: number;
}

export interface EmailCollectionStats {
  total_participations: number;
  emails_collected: number;
  collection_rate: number;
  marketing_opt_ins: number;
  legal_opt_ins: number;
  partner_opt_ins: number;
}

export interface FraudStats {
  total_participations: number;
  duplicate_ips: number;
  duplicate_fingerprints: number;
  duplicate_emails: number;
  fraud_rate: number;
}

export const AdvancedAnalyticsService = {
  // Statistiques géographiques
  async getGeoStats(campaignId?: string): Promise<GeoStats[]> {
    try {
      let query = supabase
        .from('campaign_participants')
        .select('country');

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Compter par pays
      const countryMap = new Map<string, number>();
      let total = 0;

      data?.forEach(p => {
        if (p.country) {
          countryMap.set(p.country, (countryMap.get(p.country) || 0) + 1);
          total++;
        }
      });

      // Convertir en array et calculer les pourcentages
      return Array.from(countryMap.entries())
        .map(([country, count]) => ({
          country,
          count,
          percentage: (count / total) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 pays
    } catch (error) {
      console.error('Error fetching geo stats:', error);
      return [];
    }
  },

  // Statistiques par device
  async getDeviceStats(campaignId?: string, dateRange?: { from: Date | undefined; to: Date | undefined }): Promise<DeviceStats[]> {
    try {
      let query = supabase
        .from('campaign_participants')
        .select('participation_data');

      if (campaignId) query = query.eq('campaign_id', campaignId);
      if (dateRange && dateRange.from && dateRange.to) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Device stats query failed, returning empty data');
        return [];
      }

      const deviceMap = new Map<string, number>();
      let total = 0;

      data?.forEach(p => {
        const pData = (p as any).participation_data || {};
        const type = pData.device_type || 'Inconnu';
        deviceMap.set(type, (deviceMap.get(type) || 0) + 1);
        total++;
      });

      return Array.from(deviceMap.entries()).map(([device_type, count]) => ({
        device_type,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }));
    } catch (error) {
      console.error('Error fetching device stats:', error);
      return [];
    }
  },

  // Sources de trafic
  async getTrafficSources(campaignId?: string, dateRange?: { from: Date | undefined; to: Date | undefined }): Promise<TrafficSource[]> {
    try {
      let query = supabase
        .from('campaign_participants')
        .select('participation_data');

      if (campaignId) query = query.eq('campaign_id', campaignId);
      if (dateRange && dateRange.from && dateRange.to) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Traffic sources query failed, returning empty data');
        return [];
      }

      const sourceMap = new Map<string, number>();
      let total = 0;

      data?.forEach(p => {
        const pData = (p as any).participation_data || {};
        let source = 'Direct';

        if (pData.utm_source) {
          source = `UTM: ${pData.utm_source}`;
        } else if (pData.referrer) {
          try {
            const url = new URL(pData.referrer);
            source = `Referral: ${url.hostname}`;
          } catch {
            source = 'Referral';
          }
        }

        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
        total++;
      });

      return Array.from(sourceMap.entries())
        .map(([source, count]) => ({
          source,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
      return [];
    }
  },

  // Heures de pic
  async getPeakHours(campaignId?: string): Promise<PeakHour[]> {
    try {
      let query = supabase
        .from('campaign_participants')
        .select('created_at');

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const hourMap = new Map<number, number>();

      data?.forEach(p => {
        const hour = new Date(p.created_at).getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      });

      return Array.from(hourMap.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour);
    } catch (error) {
      console.error('Error fetching peak hours:', error);
      return [];
    }
  },

  // Jours de pic
  async getPeakDays(campaignId?: string): Promise<PeakDay[]> {
    try {
      let query = supabase
        .from('campaign_participants')
        .select('created_at');

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const dayMap = new Map<string, number>();
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

      data?.forEach(p => {
        const dayIndex = new Date(p.created_at).getDay();
        const dayName = days[dayIndex];
        dayMap.set(dayName, (dayMap.get(dayName) || 0) + 1);
      });

      return days.map(day => ({
        day,
        count: dayMap.get(day) || 0,
      }));
    } catch (error) {
      console.error('Error fetching peak days:', error);
      return [];
    }
  },

  // Participations uniques par IP (avec fallback email / device)
  async getUniqueParticipationsByIP(campaignId?: string, dateRange?: { from: Date | undefined; to: Date | undefined }): Promise<number> {
    try {
      let query = supabase
        .from('campaign_participants')
        .select('ip_address, device_fingerprint, email');

      if (campaignId) query = query.eq('campaign_id', campaignId);
      if (dateRange && dateRange.from && dateRange.to) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      const uniqueKeys = new Set<string>();

      data?.forEach(p => {
        const row = p as any;
        const ip = row.ip_address as string | null;
        const fingerprint = row.device_fingerprint as string | null;
        const email = row.email as string | null;

        // Construire une clé de fallback: IP > fingerprint > email
        const key = ip || fingerprint || email;
        if (key) {
          uniqueKeys.add(key);
        }
      });

      return uniqueKeys.size;
    } catch (error) {
      console.error('Error fetching unique participations by IP:', error);
      return 0;
    }
  },

  // Taux de collecte email
  async getEmailCollectionStats(campaignId?: string): Promise<EmailCollectionStats> {
    try {
      let query = supabase
        .from('campaign_participants')
        .select('email, participation_data');

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const total_participations = data?.length || 0;
      const emails_collected = data?.filter(p => p.email).length || 0;
      const collection_rate = total_participations > 0
        ? (emails_collected / total_participations) * 100
        : 0;

      // Count opt-ins from participation_data
      let marketing_opt_ins = 0;
      let legal_opt_ins = 0;
      let partner_opt_ins = 0;

      data?.forEach(p => {
        const pData = p.participation_data as any;
        if (pData) {
          // Marketing opt-ins
          if (pData.newsletter === true || pData.marketing === true) {
            marketing_opt_ins++;
          }
          // Legal opt-ins
          if (pData.legal === true || pData.rules === true || pData.terms === true) {
            legal_opt_ins++;
          }
          // Partner opt-ins
          if (pData.partner === true || pData.partners === true) {
            partner_opt_ins++;
          }
        }
      });

      return {
        total_participations,
        emails_collected,
        collection_rate,
        marketing_opt_ins,
        legal_opt_ins,
        partner_opt_ins,
      };
    } catch (error) {
      console.error('Error fetching email collection stats:', error);
      return { 
        total_participations: 0, 
        emails_collected: 0, 
        collection_rate: 0,
        marketing_opt_ins: 0,
        legal_opt_ins: 0,
        partner_opt_ins: 0,
      };
    }
  },

  // Détection de fraude
  async getFraudStats(campaignId?: string): Promise<FraudStats> {
    try {
      let query = supabase
        .from('campaign_participants')
        .select('ip_address, device_fingerprint, email');

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const total_participations = data?.length || 0;

      // Détecter les doublons
      const ipSet = new Set<string>();
      const fingerprintSet = new Set<string>();
      const emailSet = new Set<string>();

      let duplicate_ips = 0;
      let duplicate_fingerprints = 0;
      let duplicate_emails = 0;

      data?.forEach(p => {
        if (p.ip_address) {
          if (ipSet.has(p.ip_address)) {
            duplicate_ips++;
          }
          ipSet.add(p.ip_address);
        }

        if (p.device_fingerprint) {
          if (fingerprintSet.has(p.device_fingerprint)) {
            duplicate_fingerprints++;
          }
          fingerprintSet.add(p.device_fingerprint);
        }

        if (p.email) {
          if (emailSet.has(p.email)) {
            duplicate_emails++;
          }
          emailSet.add(p.email);
        }
      });

      // Le taux de fraude = nombre de participations en doublon / total
      // On prend le max des doublons (pas la somme) pour éviter de dépasser 100%
      const max_duplicates = Math.max(duplicate_ips, duplicate_fingerprints, duplicate_emails);
      const fraud_rate = total_participations > 0
        ? (max_duplicates / total_participations) * 100
        : 0;

      return {
        total_participations,
        duplicate_ips,
        duplicate_fingerprints,
        duplicate_emails,
        fraud_rate,
      };
    } catch (error) {
      console.error('Error fetching fraud stats:', error);
      return {
        total_participations: 0,
        duplicate_ips: 0,
        duplicate_fingerprints: 0,
        duplicate_emails: 0,
        fraud_rate: 0,
      };
    }
  },

  // Export CSV
  async exportToCSV(campaignId?: string): Promise<string> {
    try {
      let query = supabase
        .from('campaign_participants')
        .select('*');

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        return '';
      }

      // Créer le CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => 
        Object.values(row).map(val => 
          typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(',')
      );

      return [headers, ...rows].join('\n');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  },

  // Nouveaux participants (qui n'avaient jamais participé avant la période)
  async getNewParticipantsCount(campaignId?: string, dateRange?: { from: Date | undefined; to: Date | undefined }): Promise<number> {
    try {
      // Si pas de date range, on considère les 7 derniers jours par défaut
      const periodStart = dateRange?.from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const periodEnd = dateRange?.to || new Date();

      // Helper pour extraire l'email d'un participant (colonne email ou participation_data)
      const extractEmail = (p: any): string | null => {
        if (p.email) return p.email;
        const pData = p.participation_data as any;
        if (pData?.contactData?.email) return pData.contactData.email;
        return null;
      };

      // 1. Récupérer les emails qui ont participé AVANT la période (anciens participants)
      let oldParticipantsQuery = supabase
        .from('campaign_participants')
        .select('email, participation_data')
        .lt('created_at', periodStart.toISOString());

      if (campaignId) oldParticipantsQuery = oldParticipantsQuery.eq('campaign_id', campaignId);

      const { data: oldData } = await oldParticipantsQuery;
      const oldEmails = new Set(
        (oldData || []).map(extractEmail).filter(Boolean) as string[]
      );

      // 2. Récupérer les emails qui ont participé PENDANT la période
      let periodQuery = supabase
        .from('campaign_participants')
        .select('email, participation_data')
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', periodEnd.toISOString());

      if (campaignId) periodQuery = periodQuery.eq('campaign_id', campaignId);

      const { data: periodData } = await periodQuery;
      const periodEmails = (periodData || []).map(extractEmail).filter(Boolean) as string[];

      // 3. Compter les emails de la période qui ne sont PAS dans les anciens
      const newEmails = new Set(
        periodEmails.filter(email => !oldEmails.has(email))
      );

      return newEmails.size;
    } catch (error) {
      console.error('Error fetching new participants count:', error);
      return 0;
    }
  },

  // Top campagnes par métrique
  async getTopCampaigns(
    metric: 'participations' | 'participants' | 'new_participants' | 'opt_ins',
    limit: number = 10,
    dateRange?: { from: Date | undefined; to: Date | undefined }
  ) {
    try {
      let query = supabase
        .from('campaign_participants')
        .select('campaign_id, campaigns!inner(name), email, participation_data');

      if (dateRange && dateRange.from && dateRange.to) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data } = await query;
      if (!data) return [];

      const campaignStats = new Map<string, {
        id: string;
        title: string;
        participations: number;
        participants: Set<string>;
        optIns: number;
      }>();

      data.forEach((p: any) => {
        const campaignId = p.campaign_id;
        const campaignTitle = p.campaigns?.name || 'Sans nom';
        
        if (!campaignStats.has(campaignId)) {
          campaignStats.set(campaignId, {
            id: campaignId,
            title: campaignTitle,
            participations: 0,
            participants: new Set(),
            optIns: 0,
          });
        }

        const stats = campaignStats.get(campaignId)!;
        stats.participations++;
        if (p.email) stats.participants.add(p.email);
        
        const participationData = p.participation_data as any;
        if (participationData?.optIn || participationData?.newsletter) stats.optIns++;
      });

      const campaigns = Array.from(campaignStats.values()).map(c => ({
        id: c.id,
        title: c.title,
        participations: c.participations,
        participants: c.participants.size,
        new_participants: c.participants.size,
        opt_ins: c.optIns,
      }));

      const sorted = campaigns.sort((a, b) => b[metric] - a[metric]);
      return sorted.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top campaigns:', error);
      return [];
    }
  },

  // Séries temporelles des opt-ins
  async getTimeSeriesOptIns(
    dateRange: { from: Date | undefined; to: Date | undefined },
    campaignId?: string
  ) {
    try {
      if (!dateRange.from || !dateRange.to) {
        return { dates: [], newsletter: [], others: [], partners: [] };
      }

      let query = supabase
        .from('campaign_participants')
        .select('created_at, participation_data')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at');

      if (campaignId) query = query.eq('campaign_id', campaignId);

      const { data } = await query;
      if (!data) return { dates: [], newsletter: [], others: [], partners: [] };

      const dailyStats = new Map<string, { newsletter: number; others: number; partners: number }>();

      data.forEach((p: any) => {
        const date = new Date(p.created_at).toISOString().split('T')[0];
        if (!dailyStats.has(date)) {
          dailyStats.set(date, { newsletter: 0, others: 0, partners: 0 });
        }

        const stats = dailyStats.get(date)!;
        const participationData = p.participation_data as any;
        
        if (participationData?.optIn || participationData?.newsletter) {
          stats.newsletter++;
        }
        if (participationData?.partners) {
          stats.partners++;
        }
      });

      const sorted = Array.from(dailyStats.entries()).sort();
      return {
        dates: sorted.map(([date]) => date),
        newsletter: sorted.map(([, stats]) => stats.newsletter),
        others: sorted.map(([, stats]) => stats.others),
        partners: sorted.map(([, stats]) => stats.partners),
      };
    } catch (error) {
      console.error('Error fetching time series opt-ins:', error);
      return { dates: [], newsletter: [], others: [], partners: [] };
    }
  },
};
