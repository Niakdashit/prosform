import { supabase } from '@/integrations/supabase/client';

export interface PublishResponse {
  success: boolean;
  slug?: string;
  publicUrl?: string;
  message?: string;
  error?: string;
}

/**
 * Service pour gérer la publication des campagnes
 */
export const PublishService = {
  /**
   * Publier une campagne
   */
  async publish(campaignId: string): Promise<PublishResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('publish-campaign', {
        body: { campaignId },
      });

      if (error) {
        console.error('❌ [PublishService] Error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to publish campaign');
      }

      console.log('✅ [PublishService] Campaign published:', data.publicUrl);
      return data;
    } catch (error) {
      console.error('❌ [PublishService] Publish error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish campaign',
      };
    }
  },

  /**
   * Dépublier une campagne
   */
  async unpublish(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          is_published: false,
          status: 'draft',
        })
        .eq('id', campaignId);

      if (error) {
        console.error('❌ [PublishService] Unpublish error:', error);
        return false;
      }

      console.log('✅ [PublishService] Campaign unpublished');
      return true;
    } catch (error) {
      console.error('❌ [PublishService] Unpublish error:', error);
      return false;
    }
  },
};
