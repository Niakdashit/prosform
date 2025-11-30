import { supabase } from '@/integrations/supabase/client';
import type { Campaign, CampaignCreate, CampaignUpdate } from '@/types/campaign';
import type { Database } from '@/integrations/supabase/types';

type DbCampaign = Database['public']['Tables']['campaigns']['Row'];
type DbCampaignInsert = Database['public']['Tables']['campaigns']['Insert'];
type DbCampaignUpdate = Database['public']['Tables']['campaigns']['Update'];

/**
 * Convertit une campagne DB en type Campaign TypeScript
 */
function dbToAppCampaign(dbCampaign: DbCampaign): Campaign {
  const configData = (dbCampaign.config || {}) as any;
  return {
    id: dbCampaign.id,
    name: dbCampaign.app_title,
    type: dbCampaign.type as Campaign['type'],
    mode: (configData.mode as Campaign['mode']) || 'fullscreen',
    status: (dbCampaign.status as Campaign['status']) || 'draft',
    config: (configData.config || configData || {}) as Record<string, unknown>,
    prizes: (configData.prizes || []) as Record<string, unknown>[],
    theme: (configData.theme || {}) as Record<string, unknown>,
    slug: dbCampaign.public_url_slug || undefined,
    thumbnail_url: dbCampaign.thumbnail_url || undefined,
    start_date: dbCampaign.starts_at || undefined,
    end_date: dbCampaign.ends_at || undefined,
    created_at: dbCampaign.created_at,
    updated_at: dbCampaign.updated_at,
    published_at: dbCampaign.published_at || undefined,
  };
}

/**
 * Convertit un type Campaign en structure DB pour insertion
 */
function appToDbCampaign(campaign: Partial<Campaign> & { name: string; type: Campaign['type'] }, user_id: string): DbCampaignInsert {
  return {
    app_title: campaign.name,
    user_id,
    type: campaign.type,
    config: {
      mode: campaign.mode,
      prizes: campaign.prizes,
      theme: campaign.theme,
      config: campaign.config,
    } as any,
    status: campaign.status || 'draft',
    public_url_slug: campaign.slug || null,
    thumbnail_url: campaign.thumbnail_url || null,
    starts_at: campaign.start_date || null,
    ends_at: campaign.end_date || null,
    is_published: campaign.status === 'online',
    published_at: campaign.published_at || null,
  };
}

/**
 * Convertit un type Campaign en structure DB pour mise à jour
 */
function appToDbUpdate(updates: Partial<Campaign>): DbCampaignUpdate {
  const dbUpdate: DbCampaignUpdate = {};
  
  if (updates.name !== undefined) dbUpdate.app_title = updates.name;
  if (updates.status !== undefined) dbUpdate.status = updates.status;
  if (updates.slug !== undefined) dbUpdate.public_url_slug = updates.slug;
  if (updates.thumbnail_url !== undefined) dbUpdate.thumbnail_url = updates.thumbnail_url;
  if (updates.start_date !== undefined) dbUpdate.starts_at = updates.start_date;
  if (updates.end_date !== undefined) dbUpdate.ends_at = updates.end_date;
  if (updates.published_at !== undefined) dbUpdate.published_at = updates.published_at;
  
  // Emballer mode, prizes, theme, config dans le JSON config
  if (updates.mode !== undefined || updates.prizes !== undefined || updates.theme !== undefined || updates.config !== undefined) {
    dbUpdate.config = {
      mode: updates.mode,
      prizes: updates.prizes,
      theme: updates.theme,
      config: updates.config,
    } as any;
  }
  
  return dbUpdate;
}

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

    return (data || []).map(dbToAppCampaign);
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

    return data ? dbToAppCampaign(data) : null;
  },

  /**
   * Créer une nouvelle campagne
   */
  async create(campaign: CampaignCreate): Promise<Campaign> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dbCampaign = appToDbCampaign(
      { ...campaign, name: campaign.name, type: campaign.type },
      user.id
    );

    const { data, error } = await supabase
      .from('campaigns')
      .insert([dbCampaign])
      .select()
      .single();

    if (error) {
      console.error('❌ [CampaignService] create error:', error);
      throw error;
    }

    console.log('✅ [CampaignService] Campaign created:', data.id);
    return dbToAppCampaign(data);
  },

  /**
   * Mettre à jour une campagne
   */
  async update(id: string, updates: CampaignUpdate): Promise<Campaign> {
    const dbUpdate = appToDbUpdate(updates);

    const { data, error } = await supabase
      .from('campaigns')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [CampaignService] update error:', error);
      throw error;
    }

    console.log('✅ [CampaignService] Campaign updated:', id);
    return dbToAppCampaign(data);
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
      } as CampaignCreate);
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
