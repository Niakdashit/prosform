import { supabase } from '@/integrations/supabase/client';

export interface CampaignAnalytics {
  campaign_id: string;
  campaign_name: string;
  campaign_type: string;
  total_views: number;
  total_participations: number;
  total_completions: number;
  conversion_rate: number;
  avg_time_spent: number;
  last_participation_at: string | null;
}

export interface TimeSeriesData {
  date: string;
  views: number;
  participations: number;
  conversions: number;
}

export interface TypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface GlobalStats {
  total_views: number;
  total_participations: number;
  total_completions: number;
  total_campaigns: number;
  total_winners: number;
  conversion_rate: number;
  avg_time_spent: number;
}

/**
 * Service pour récupérer et analyser les données d'analytics
 */
export const AnalyticsService = {
  
  async getGlobalStats(): Promise<GlobalStats> {
    // Utiliser les participations comme source de vérité
    const { data: participants, error: participantsError } = await supabase
      .from('campaign_participants')
      .select('completed_at, participation_data');

    if (participantsError) throw participantsError;

    // Compter les campagnes
    const { count: campaignCount, error: campaignError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    if (campaignError) throw campaignError;

    const totals = (participants || []).reduce(
      (acc, participant: any) => {
        acc.total_views += 1; // 1 vue par participation (simplifié)
        acc.total_participations += 1;

        const isWin =
          !!participant.completed_at ||
          participant.participation_data?.result?.type === 'win';

        if (isWin) {
          acc.total_completions += 1;
        }

        return acc;
      },
      {
        total_views: 0,
        total_participations: 0,
        total_completions: 0,
        avg_time_spent: 0,
      }
    );

    const conversion_rate = totals.total_participations > 0
      ? (totals.total_completions / totals.total_participations) * 100
      : 0;

    // Pour l'instant nous ne traquons pas le temps passé précisément
    const avg_time_spent = 0;

    return {
      ...totals,
      total_campaigns: campaignCount || 0,
      total_winners: totals.total_completions,
      conversion_rate: Math.round(conversion_rate),
      avg_time_spent,
    };
  },
  
  async getCampaignAnalytics(): Promise<CampaignAnalytics[]> {
    // Récupérer toutes les campagnes
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, type');

    if (campaignsError) throw campaignsError;

    // Récupérer toutes les participations
    const { data: participants, error: participantsError } = await supabase
      .from('campaign_participants')
      .select('campaign_id, completed_at, participation_data');

    if (participantsError) throw participantsError;

    const statsByCampaign = new Map<string, {
      total_views: number;
      total_participations: number;
      total_completions: number;
      last_participation_at: string | null;
    }>();

    (participants || []).forEach((participant: any) => {
      const id = participant.campaign_id as string;
      const current = statsByCampaign.get(id) || {
        total_views: 0,
        total_participations: 0,
        total_completions: 0,
        last_participation_at: null,
      };

      current.total_views += 1;
      current.total_participations += 1;

      const isWin =
        !!participant.completed_at ||
        participant.participation_data?.result?.type === 'win';

      if (isWin) {
        current.total_completions += 1;
      }

      const createdAt = (participant as any).created_at as string | undefined;
      if (createdAt && (!current.last_participation_at || createdAt > current.last_participation_at)) {
        current.last_participation_at = createdAt;
      }

      statsByCampaign.set(id, current);
    });

    return (campaigns || []).map(campaign => {
      const stats = statsByCampaign.get(campaign.id) || {
        total_views: 0,
        total_participations: 0,
        total_completions: 0,
        last_participation_at: null,
      };

      const conversion_rate = stats.total_participations > 0
        ? Math.round((stats.total_completions / stats.total_participations) * 100)
        : 0;

      return {
        campaign_id: campaign.id,
        campaign_name: (campaign as any).name || (campaign as any).title || 'Sans nom',
        campaign_type: (campaign as any).type || 'unknown',
        total_views: stats.total_views,
        total_participations: stats.total_participations,
        total_completions: stats.total_completions,
        conversion_rate,
        avg_time_spent: 0,
        last_participation_at: stats.last_participation_at,
      };
    });
  },

  async getCampaignAnalyticsById(campaignId: string): Promise<CampaignAnalytics | null> {
    // Récupérer la campagne
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, type')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Error fetching campaign:', campaignError);
      return null;
    }

    // Récupérer les participations de cette campagne
    const { data: participants, error: participantsError } = await supabase
      .from('campaign_participants')
      .select('created_at, completed_at, participation_data')
      .eq('campaign_id', campaignId);

    if (participantsError) {
      console.error('Error fetching campaign participants:', participantsError);
      return null;
    }

    const totals = (participants || []).reduce(
      (acc, participant: any) => {
        acc.total_views += 1;
        acc.total_participations += 1;

        const isWin =
          !!participant.completed_at ||
          participant.participation_data?.result?.type === 'win';

        if (isWin) {
          acc.total_completions += 1;
        }

        const createdAt = participant.created_at as string | undefined;
        if (createdAt && (!acc.last_participation_at || createdAt > acc.last_participation_at)) {
          acc.last_participation_at = createdAt;
        }

        return acc;
      },
      {
        total_views: 0,
        total_participations: 0,
        total_completions: 0,
        last_participation_at: null as string | null,
      }
    );

    const conversion_rate = totals.total_participations > 0
      ? Math.round((totals.total_completions / totals.total_participations) * 100)
      : 0;

    return {
      campaign_id: campaign.id,
      campaign_name: (campaign as any).name || (campaign as any).title || 'Sans nom',
      campaign_type: (campaign as any).type || 'unknown',
      total_views: totals.total_views,
      total_participations: totals.total_participations,
      total_completions: totals.total_completions,
      conversion_rate,
      avg_time_spent: 0,
      last_participation_at: totals.last_participation_at,
    };
  },
  
  /**
   * Récupère les données de séries temporelles (7 derniers jours)
   */
  async getTimeSeriesData(days: number = 7): Promise<TimeSeriesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('campaign_participants')
      .select('created_at, completed_at')
      .gte('created_at', startDate.toISOString());
    
    if (error) throw error;
    
    // Grouper par jour
    const groupedByDay = new Map<string, { views: number; participations: number; conversions: number }>();
    
    // Initialiser tous les jours
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      groupedByDay.set(dateKey, { views: 0, participations: 0, conversions: 0 });
    }
    
    // Remplir avec les vraies données
    (data || []).forEach(participant => {
      const dateKey = participant.created_at.split('T')[0];
      const dayData = groupedByDay.get(dateKey);
      
      if (dayData) {
        dayData.participations += 1;
        if (participant.completed_at) {
          dayData.conversions += 1;
        }
        // Pour l'instant, views = participations * 2.5 (estimation)
        dayData.views = Math.round(dayData.participations * 2.5);
      }
    });
    
    return Array.from(groupedByDay.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  },

  /**
   * Récupère les données de séries temporelles pour une campagne spécifique
   */
  async getTimeSeriesDataByCampaign(campaignId: string, days: number = 7): Promise<TimeSeriesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('campaign_participants')
      .select('created_at, completed_at')
      .eq('campaign_id', campaignId)
      .gte('created_at', startDate.toISOString());
    
    if (error) {
      console.error('Error fetching time series data:', error);
      return [];
    }
    
    // Grouper par jour
    const groupedByDay = new Map<string, { views: number; participations: number; conversions: number }>();
    
    // Initialiser tous les jours
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      groupedByDay.set(dateKey, { views: 0, participations: 0, conversions: 0 });
    }
    
    // Remplir avec les vraies données
    (data || []).forEach(participant => {
      const date = new Date(participant.created_at);
      const dateKey = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const dayData = groupedByDay.get(dateKey);
      
      if (dayData) {
        dayData.participations += 1;
        if (participant.completed_at) {
          dayData.conversions += 1;
        }
        // Pour l'instant, views = participations * 2.5 (estimation)
        dayData.views = Math.round(dayData.participations * 2.5);
      }
    });
    
    return Array.from(groupedByDay.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  },
  
  /**
   * Récupère la distribution par type de campagne
   */
  async getTypeDistribution(): Promise<TypeDistribution[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('type');
    
    if (error) throw error;
    
    const typeCounts = new Map<string, number>();
    const total = data?.length || 0;
    
    (data || []).forEach(campaign => {
      const count = typeCounts.get(campaign.type) || 0;
      typeCounts.set(campaign.type, count + 1);
    });
    
    return Array.from(typeCounts.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  },
};
