import { supabase } from '@/integrations/supabase/client';
import type { Campaign, CampaignCreate, CampaignUpdate } from '@/types/campaign';

/**
 * Service centralisé pour la gestion des campagnes
 */
export const CampaignService = {
  /**
   * Récupérer toutes les campagnes
   */
  async getAll(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [CampaignService] getAll error:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Récupérer une campagne par ID
   */
  async getById(id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('❌ [CampaignService] getById error:', error);
      throw error;
    }

    return data;
  },

  /**
   * Créer une nouvelle campagne
   */
  async create(campaign: CampaignCreate): Promise<Campaign> {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ [CampaignService] User not authenticated:', userError);
      throw new Error('User not authenticated');
    }

    const dbPayload = {
      user_id: user.id,
      title: campaign.title,
      type: campaign.type,
      status: campaign.status || 'draft',
      config: campaign.config || {},
      thumbnail_url: campaign.thumbnail_url,
    };

    const { data, error } = await supabase
      .from('campaigns')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('❌ [CampaignService] create error:', error);
      throw error;
    }

    console.log('✅ [CampaignService] Campaign created:', data.id);
    return data;
  },

  /**
   * Mettre à jour une campagne
   */
  async update(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const dbPayload = {
      title: updates.title,
      type: updates.type,
      status: updates.status,
      config: updates.config,
      thumbnail_url: updates.thumbnail_url,
    };

    const { data, error } = await supabase
      .from('campaigns')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [CampaignService] update error:', error);
      throw error;
    }

    console.log('✅ [CampaignService] Campaign updated:', id);
    return data;
  },

  /**
   * Sauvegarder une campagne (create ou update)
   */
  async save(campaign: Partial<Campaign> & { title: string; type: Campaign['type'] }): Promise<Campaign> {
    if (campaign.id) {
      const { id, created_at, user_id, ...rest } = campaign;
      return this.update(id, rest);
    } else {
      const { id, created_at, updated_at, user_id, ...createData } = campaign as Campaign;
      return this.create({
        ...createData,
        mode: createData.mode || 'fullscreen',
        status: createData.status || 'draft',
        config: createData.config || {},
        prizes: createData.prizes || [],
        theme: createData.theme || {},
      });
    }
  },

  /**
   * Supprimer une campagne
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [CampaignService] delete error:', error);
      throw error;
    }

    console.log('✅ [CampaignService] Campaign deleted:', id);
  },

  /**
   * Publier une campagne
   */
  async publish(id: string): Promise<Campaign> {
    return this.update(id, {
      status: 'online',
      published_at: new Date().toISOString(),
    });
  },

  /**
   * Mettre en pause une campagne
   */
  async pause(id: string): Promise<Campaign> {
    return this.update(id, { status: 'paused' });
  },

  /**
   * Dupliquer une campagne
   */
  async duplicate(id: string): Promise<Campaign> {
    const original = await this.getById(id);
    if (!original) throw new Error('Campaign not found');

    const { id: _, created_at, updated_at, published_at, slug, user_id, ...campaignData } = original;
    
    return this.create({
      ...campaignData,
      title: `${campaignData.title} (copie)`,
      status: 'draft',
    });
  },
};
