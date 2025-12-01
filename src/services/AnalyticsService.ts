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
    // Récupérer les stats agrégées depuis campaign_analytics (backend externe)
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('campaign_analytics')
      .select('total_views, total_completions, total_participations, avg_time_spent');

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
    }

    // Agréger les stats de toutes les campagnes
    const globalViews = (analyticsData || []).reduce((sum, item: any) => sum + (item.total_views || 0), 0);
    const globalCompletions = (analyticsData || []).reduce((sum, item: any) => sum + (item.total_completions || 0), 0);
    const globalParticipations = (analyticsData || []).reduce((sum, item: any) => sum + (item.total_participations || 0), 0);
    const avgTimeSpent = (analyticsData || []).reduce((sum, item: any) => sum + (item.avg_time_spent || 0), 0) / Math.max((analyticsData || []).length, 1);

    // Compter les campagnes
    const { count: campaignCount, error: campaignError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    if (campaignError) throw campaignError;

    // Compter les gagnants depuis les participants (pour total_winners)
    const { data: winners, error: winnersError } = await supabase
      .from('campaign_participants')
      .select('id')
      .not('participation_data->result->type', 'neq', 'win');

    const totalWinners = winners?.length || 0;

    // Taux de conversion = completions / vues
    const conversion_rate = globalViews > 0
      ? (globalCompletions / globalViews) * 100
      : 0;

    return {
      total_views: globalViews,
      total_participations: globalParticipations,
      total_completions: globalCompletions,
      total_campaigns: campaignCount || 0,
      total_winners: totalWinners,
      conversion_rate: Math.round(conversion_rate),
      avg_time_spent: Math.round(avgTimeSpent),
    };
  },
  
  async getCampaignAnalytics(): Promise<CampaignAnalytics[]> {
    // Récupérer toutes les campagnes
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, type, name');

    if (campaignsError) throw campaignsError;

    // Récupérer les analytics de toutes les campagnes (backend externe)
    // total_views, total_completions, total_participations viennent de campaign_analytics
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('campaign_analytics')
      .select('campaign_id, total_views, total_completions, total_participations, avg_time_spent, last_participation_at');

    if (analyticsError) {
      console.error('Error fetching campaign analytics:', analyticsError);
    }

    // Créer une map pour accès rapide aux analytics
    const analyticsMap = new Map<string, { 
      total_views: number; 
      total_completions: number;
      total_participations: number;
      avg_time_spent: number;
      last_participation_at: string | null;
    }>();
    (analyticsData || []).forEach((analytics: any) => {
      analyticsMap.set(analytics.campaign_id, {
        total_views: analytics.total_views || 0,
        total_completions: analytics.total_completions || 0,
        total_participations: analytics.total_participations || 0,
        avg_time_spent: analytics.avg_time_spent || 0,
        last_participation_at: analytics.last_participation_at || null,
      });
    });

    return (campaigns || []).map(campaign => {
      const analytics = analyticsMap.get(campaign.id) || {
        total_views: 0,
        total_completions: 0,
        total_participations: 0,
        avg_time_spent: 0,
        last_participation_at: null,
      };

      // Taux de conversion = completions / vues
      const conversion_rate = analytics.total_views > 0
        ? Math.round((analytics.total_completions / analytics.total_views) * 100)
        : 0;

      return {
        campaign_id: campaign.id,
        campaign_name: (campaign as any).name || 'Sans nom',
        campaign_type: (campaign as any).type || 'unknown',
        total_views: analytics.total_views,
        total_participations: analytics.total_participations,
        total_completions: analytics.total_completions,
        conversion_rate,
        avg_time_spent: analytics.avg_time_spent,
        last_participation_at: analytics.last_participation_at,
      };
    });
  },

  async getCampaignAnalyticsById(campaignId: string): Promise<CampaignAnalytics | null> {
    // Récupérer la campagne
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, type, name')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Error fetching campaign:', campaignError);
      return null;
    }

    // Récupérer les analytics de cette campagne (backend externe)
    // total_views et total_completions viennent de campaign_analytics (trackés par étape)
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('campaign_analytics')
      .select('total_views, total_completions, avg_time_spent')
      .eq('campaign_id', campaignId)
      .maybeSingle();

    if (analyticsError) {
      console.error('Error fetching campaign analytics:', analyticsError);
    }

    const analytics = analyticsData || { total_views: 0, total_completions: 0, avg_time_spent: 0 };

    // Récupérer les participations de cette campagne pour total_participations
    const { data: participants, error: participantsError } = await supabase
      .from('campaign_participants')
      .select('created_at')
      .eq('campaign_id', campaignId);

    if (participantsError) {
      console.error('Error fetching campaign participants:', participantsError);
      return null;
    }

    const total_participations = participants?.length || 0;
    const last_participation_at = participants?.length 
      ? participants.reduce((latest, p) => {
          const createdAt = p.created_at as string;
          return !latest || createdAt > latest ? createdAt : latest;
        }, '' as string)
      : null;

    // Taux de conversion = completions / vues (pas participations)
    const conversion_rate = analytics.total_views > 0
      ? Math.round((analytics.total_completions / analytics.total_views) * 100)
      : 0;

    return {
      campaign_id: campaign.id,
      campaign_name: (campaign as any).name || 'Sans nom',
      campaign_type: (campaign as any).type || 'unknown',
      total_views: analytics.total_views,
      total_participations,
      total_completions: analytics.total_completions, // Maintenant depuis campaign_analytics
      conversion_rate,
      avg_time_spent: analytics.avg_time_spent,
      last_participation_at,
    };
  },
  
  /**
   * Récupère les données de séries temporelles globales
   * Utilise daily_analytics si disponible, sinon fallback sur les estimations
   */
  async getTimeSeriesData(days: number = 7): Promise<TimeSeriesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Essayer d'abord daily_analytics pour les vraies données
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_analytics')
      .select('date, views, participations, completions')
      .gte('date', startDateStr)
      .order('date', { ascending: true });
    
    // Initialiser tous les jours
    const groupedByDay = new Map<string, { views: number; participations: number; conversions: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      groupedByDay.set(dateKey, { views: 0, participations: 0, conversions: 0 });
    }
    
    // Si daily_analytics a des données, les utiliser
    if (!dailyError && dailyData && dailyData.length > 0) {
      dailyData.forEach(day => {
        const existing = groupedByDay.get(day.date);
        if (existing) {
          existing.views += day.views || 0;
          existing.participations += day.participations || 0;
          existing.conversions += day.completions || 0;
        }
      });
    } else {
      // Fallback: utiliser campaign_participants avec estimation
      const { data, error } = await supabase
        .from('campaign_participants')
        .select('created_at, completed_at')
        .gte('created_at', startDate.toISOString());
      
      if (!error && data) {
        data.forEach(participant => {
          const dateKey = participant.created_at.split('T')[0];
          const dayData = groupedByDay.get(dateKey);
          
          if (dayData) {
            dayData.participations += 1;
            if (participant.completed_at) {
              dayData.conversions += 1;
            }
            // Estimation basée sur le funnel moyen (4 étapes)
            dayData.views = Math.round(dayData.participations * 4);
          }
        });
      }
    }
    
    return Array.from(groupedByDay.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  },

  /**
   * Récupère les données de séries temporelles pour une campagne spécifique
   * Utilise daily_analytics si disponible, sinon fallback sur les estimations
   */
  async getTimeSeriesDataByCampaign(campaignId: string, days: number = 7): Promise<TimeSeriesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Initialiser tous les jours avec le format d'affichage
    const groupedByDay = new Map<string, { views: number; participations: number; conversions: number; isoDate: string }>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const isoDate = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      groupedByDay.set(displayDate, { views: 0, participations: 0, conversions: 0, isoDate });
    }
    
    // Essayer d'abord daily_analytics pour les vraies données
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_analytics')
      .select('date, views, participations, completions')
      .eq('campaign_id', campaignId)
      .gte('date', startDateStr)
      .order('date', { ascending: true });
    
    // Si daily_analytics a des données, les utiliser
    if (!dailyError && dailyData && dailyData.length > 0) {
      dailyData.forEach(day => {
        const date = new Date(day.date);
        const displayDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        const existing = groupedByDay.get(displayDate);
        if (existing) {
          existing.views = day.views || 0;
          existing.participations = day.participations || 0;
          existing.conversions = day.completions || 0;
        }
      });
    } else {
      // Fallback: utiliser campaign_participants avec estimation
      const { data, error } = await supabase
        .from('campaign_participants')
        .select('created_at, completed_at')
        .eq('campaign_id', campaignId)
        .gte('created_at', startDate.toISOString());
      
      if (!error && data) {
        data.forEach(participant => {
          const date = new Date(participant.created_at);
          const displayDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
          const dayData = groupedByDay.get(displayDate);
          
          if (dayData) {
            dayData.participations += 1;
            if (participant.completed_at) {
              dayData.conversions += 1;
            }
            // Estimation basée sur le funnel moyen (4 étapes)
            dayData.views = Math.round(dayData.participations * 4);
          }
        });
      }
    }
    
    return Array.from(groupedByDay.entries()).map(([date, data]) => ({
      date,
      views: data.views,
      participations: data.participations,
      conversions: data.conversions,
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
