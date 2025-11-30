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
  
  /**
   * Récupère les statistiques globales
   */
  async getGlobalStats(): Promise<GlobalStats> {
    // Récupérer toutes les analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('campaign_analytics')
      .select('total_views, total_participations, total_completions, avg_time_spent');
    
    if (analyticsError) throw analyticsError;
    
    // Compter les campagnes
    const { count: campaignCount, error: campaignError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });
    
    if (campaignError) throw campaignError;
    
    // Calculer les totaux
    const totals = (analytics || []).reduce((acc, item) => ({
      total_views: acc.total_views + (item.total_views || 0),
      total_participations: acc.total_participations + (item.total_participations || 0),
      total_completions: acc.total_completions + (item.total_completions || 0),
      avg_time_spent: acc.avg_time_spent + (item.avg_time_spent || 0),
    }), {
      total_views: 0,
      total_participations: 0,
      total_completions: 0,
      avg_time_spent: 0,
    });
    
    const conversion_rate = totals.total_participations > 0
      ? (totals.total_completions / totals.total_participations) * 100
      : 0;
    
    const avg_time_spent = analytics?.length 
      ? totals.avg_time_spent / analytics.length
      : 0;
    
    return {
      ...totals,
      total_campaigns: campaignCount || 0,
      total_winners: totals.total_completions,
      conversion_rate: Math.round(conversion_rate),
      avg_time_spent: Math.round(avg_time_spent),
    };
  },
  
  /**
   * Récupère les analytics par campagne
   */
  async getCampaignAnalytics(): Promise<CampaignAnalytics[]> {
    const { data, error } = await supabase
      .from('campaign_analytics')
      .select(`
        *,
        campaigns!inner(app_title, type)
      `)
      .order('total_participations', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      campaign_id: item.campaign_id,
      campaign_name: (item.campaigns as any)?.app_title || 'Sans nom',
      campaign_type: (item.campaigns as any)?.type || 'unknown',
      total_views: item.total_views || 0,
      total_participations: item.total_participations || 0,
      total_completions: item.total_completions || 0,
      conversion_rate: item.total_participations > 0
        ? Math.round((item.total_completions / item.total_participations) * 100)
        : 0,
      avg_time_spent: Math.round(item.avg_time_spent || 0),
      last_participation_at: item.last_participation_at,
    }));
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
