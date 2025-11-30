import { supabase } from '@/integrations/supabase/client';
import type { Campaign, CampaignCreate, CampaignUpdate } from '@/types/campaign';
// NOTE: We purposely avoid using the generated Database types here because
// the runtime database schema for campaigns may differ (external backend).
// Using `any` keeps the service compatible while we align schemas.
type DbCampaign = any;
type DbCampaignInsert = any;
type DbCampaignUpdate = any;

function dbToAppCampaign(dbCampaign: DbCampaign): Campaign {
  const cfg = (dbCampaign && (dbCampaign as any).config) || {};
  const configData = (cfg || {}) as any;

  return {
    id: (dbCampaign as any).id,
    // Support both legacy `title` and newer `app_title` columns
    name:
      (dbCampaign as any).app_title ??
      (dbCampaign as any).title ??
      '',
    type: (dbCampaign as any).type as Campaign['type'],
    mode: (configData.mode as Campaign['mode']) || 'fullscreen',
    status: ((dbCampaign as any).status as Campaign['status']) || 'draft',
    config: (configData.config || configData || {}) as Record<string, unknown>,
    prizes: (configData.prizes || []) as Record<string, unknown>[],
    theme: (configData.theme || {}) as Record<string, unknown>,
    slug: (dbCampaign as any).public_url_slug || undefined,
    thumbnail_url: (dbCampaign as any).thumbnail_url || undefined,
    start_date: (dbCampaign as any).starts_at || undefined,
    end_date: (dbCampaign as any).ends_at || undefined,
    created_at: (dbCampaign as any).created_at,
    updated_at: (dbCampaign as any).updated_at,
    published_at: (dbCampaign as any).published_at || undefined,
  };
}

function appToDbCampaign(
  campaign: Partial<Campaign> & { name: string; type: Campaign['type'] },
  user_id: string,
): DbCampaignInsert {
  return {
    // Backend actuel : on utilise uniquement les colonnes sûres
    // (title, user_id, type, status, public_url_slug, thumbnail_url, config).
    title: campaign.name,
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
  } as DbCampaignInsert;
}

function appToDbUpdate(updates: Partial<Campaign>): DbCampaignUpdate {
  const dbUpdate: DbCampaignUpdate = {} as DbCampaignUpdate;

  if (updates.name !== undefined) (dbUpdate as any).title = updates.name;
  if (updates.status !== undefined) (dbUpdate as any).status = updates.status;
  if (updates.slug !== undefined)
    (dbUpdate as any).public_url_slug = updates.slug;
  if (updates.thumbnail_url !== undefined)
    (dbUpdate as any).thumbnail_url = updates.thumbnail_url;

  // Emballer mode, prizes, theme, config dans le JSON config
  if (
    updates.mode !== undefined ||
    updates.prizes !== undefined ||
    updates.theme !== undefined ||
    updates.config !== undefined
  ) {
    (dbUpdate as any).config = {
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
