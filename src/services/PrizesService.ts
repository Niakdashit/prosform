import { externalSupabase } from '@/integrations/supabase/externalClient';

export interface PrizeDrawFilters {
  only_winners?: boolean;
  only_non_winners?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface PrizeDrawResult {
  draw_id: string;
  total_participants: number;
  winners_selected: number;
  winners: WinnerInfo[];
}

export interface WinnerInfo {
  id: string;
  email: string;
  created_at: string;
  prize_won?: any;
}

export interface PrizeDrawHistory {
  id: string;
  campaign_id: string;
  campaign_name: string;
  draw_name: string;
  draw_date: string;
  winners_count: number;
  total_participants: number;
  winners: WinnerInfo[];
  created_at: string;
}

export interface InstantWinWinner {
  participant_id: string;
  email: string;
  prize_name: string;
  prize_value: number;
  won_at: string;
  claimed: boolean;
  claimed_at: string | null;
}

export interface PrizeStatus {
  id: string;
  prize_name: string;
  prize_description: string | null;
  prize_value: number | null;
  total_quantity: number;
  remaining_quantity: number;
  distributed: number;
  distribution_rate: number;
  is_active: boolean;
  win_probability: number | null;
  active_from: string | null;
  active_until: string | null;
}

export interface PrizeTimelineDay {
  date: string;
  total_winners: number;
  total_prize_value: number;
  prizes_detail: Array<{
    prize_name: string;
    prize_value: number;
    email: string;
  }>;
}

export const PrizesService = {
  /**
   * Effectuer un tirage au sort
   */
  async performDraw(
    campaignId: string,
    drawName: string,
    winnersCount: number,
    filters: PrizeDrawFilters = {}
  ): Promise<PrizeDrawResult | null> {
    try {
      const { data, error } = await externalSupabase.rpc('perform_prize_draw', {
        p_campaign_id: campaignId,
        p_draw_name: drawName,
        p_winners_count: winnersCount,
        p_filters: filters,
      });

      if (error) {
        console.error('Error performing draw:', error);
        return null;
      }

      return data as PrizeDrawResult;
    } catch (error) {
      console.error('Error in performDraw:', error);
      return null;
    }
  },

  /**
   * Obtenir l'historique des tirages
   */
  async getDrawsHistory(
    campaignId?: string,
    limit: number = 50
  ): Promise<PrizeDrawHistory[]> {
    try {
      const { data, error } = await externalSupabase.rpc('get_prize_draws_history', {
        p_campaign_id: campaignId || null,
        p_limit: limit,
      });

      if (error) {
        console.error('Error fetching draws history:', error);
        return [];
      }

      return (data || []) as PrizeDrawHistory[];
    } catch (error) {
      console.error('Error in getDrawsHistory:', error);
      return [];
    }
  },

  /**
   * Obtenir les gagnants d'instant win
   */
  async getInstantWinWinners(
    campaignId?: string,
    limit: number = 100
  ): Promise<InstantWinWinner[]> {
    try {
      const { data, error } = await externalSupabase.rpc('get_instant_win_winners', {
        p_campaign_id: campaignId || null,
        p_limit: limit,
      });

      if (error) {
        console.error('Error fetching instant win winners:', error);
        return [];
      }

      return (data || []) as InstantWinWinner[];
    } catch (error) {
      console.error('Error in getInstantWinWinners:', error);
      return [];
    }
  },

  /**
   * Obtenir le statut des lots
   */
  async getPrizesStatus(campaignId: string): Promise<PrizeStatus[]> {
    try {
      const { data, error } = await externalSupabase.rpc('get_prizes_status', {
        p_campaign_id: campaignId,
      });

      if (error) {
        console.error('Error fetching prizes status:', error);
        return [];
      }

      return (data || []) as PrizeStatus[];
    } catch (error) {
      console.error('Error in getPrizesStatus:', error);
      return [];
    }
  },

  /**
   * Obtenir la timeline des gains
   */
  async getPrizesTimeline(
    campaignId?: string,
    days: number = 30
  ): Promise<PrizeTimelineDay[]> {
    try {
      const { data, error } = await externalSupabase.rpc('get_prizes_timeline', {
        p_campaign_id: campaignId || null,
        p_days: days,
      });

      if (error) {
        console.error('Error fetching prizes timeline:', error);
        return [];
      }

      return (data || []) as PrizeTimelineDay[];
    } catch (error) {
      console.error('Error in getPrizesTimeline:', error);
      return [];
    }
  },

  /**
   * Mettre à jour le statut de réclamation
   */
  async updateClaimStatus(
    participantId: string,
    claimed: boolean
  ): Promise<boolean> {
    try {
      const { data, error } = await externalSupabase.rpc('update_prize_claim_status', {
        p_participant_id: participantId,
        p_claimed: claimed,
      });

      if (error) {
        console.error('Error updating claim status:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in updateClaimStatus:', error);
      return false;
    }
  },

  /**
   * Exporter les gagnants en CSV
   */
  exportWinnersToCSV(winners: InstantWinWinner[], filename: string = 'gagnants.csv'): void {
    const headers = ['Email', 'Lot', 'Valeur', 'Date de gain', 'Réclamé'];
    const rows = winners.map(w => [
      w.email,
      w.prize_name,
      w.prize_value?.toString() || '',
      new Date(w.won_at).toLocaleString('fr-FR'),
      w.claimed ? 'Oui' : 'Non',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  },
};
