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

/**
 * Service pour enregistrer les participations aux campagnes
 */
export const ParticipationService = {
  /**
   * Enregistre une participation dans la base de données
   */
  async recordParticipation(data: ParticipationData): Promise<void> {
    try {
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
        });

      if (error) {
        console.error('Error recording participation:', error);
        throw error;
      }
    } catch (err) {
      console.error('Failed to record participation:', err);
      // Ne pas bloquer l'expérience utilisateur si l'enregistrement échoue
    }
  },
};
