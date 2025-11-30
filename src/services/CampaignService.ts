import { supabase } from '@/integrations/supabase/client';
import type { Campaign, CampaignCreate, CampaignUpdate } from '@/types/campaign';

/**
 * Mapper les données Supabase vers le type Campaign
 */
const mapFromDB = (dbCampaign: any): Campaign => {
  const { title, ...rest } = dbCampaign;
  return {
    ...rest,
    name: title, // title (DB) → name (app)
  };
};

/**
 * Mapper le type Campaign vers les données Supabase
 */
const mapToDB = (campaign: any): any => {
  const { name, ...rest } = campaign;
  return {
    ...rest,
    title: name, // name (app) → title (DB)
  };
};

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

    return (data || []).map(mapFromDB);
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

    return data ? mapFromDB(data) : null;
  },

  /**
   * Créer une nouvelle campagne
   */
  async create(campaign: CampaignCreate): Promise<Campaign> {
    const dbData = mapToDB(campaign);
    const { data, error } = await supabase
      .from('campaigns')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('❌ [CampaignService] create error:', error);
      throw error;
    }

    console.log('✅ [CampaignService] Campaign created:', data.id);
    return mapFromDB(data);
  },

  /**
   * Mettre à jour une campagne
   */
  async update(id: string, updates: CampaignUpdate): Promise<Campaign> {
    const dbUpdates = mapToDB(updates);
    const { data, error } = await supabase
      .from('campaigns')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [CampaignService] update error:', error);
      throw error;
    }

    console.log('✅ [CampaignService] Campaign updated:', id);
    return mapFromDB(data);
  },

  /**
   * Sauvegarder une campagne (create ou update)
   */
  async save(campaign: Partial<Campaign> & { name: string; type: Campaign['type'] }): Promise<Campaign> {
    if (campaign.id) {
      const { id, created_at, ...updates } = campaign;
      return this.update(id, updates);
    } else {
      const { id, created_at, updated_at, ...createData } = campaign as Campaign;
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

    const { id: _, created_at, updated_at, published_at, slug, ...campaignData } = original;
    
    return this.create({
      ...campaignData,
      name: `${campaignData.name} (copie)`,
      status: 'draft',
    });
  },
};
