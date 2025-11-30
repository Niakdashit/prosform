import { supabase } from '@/integrations/supabase/client';
import type { Campaign, CampaignCreate, CampaignUpdate, CampaignStatus, CampaignMode } from '@/types/campaign';

// Helpers de mapping entre le schéma de la base et le type Campaign du front
// La table `campaigns` côté backend ne contient que les colonnes "simples"
// (title, type, status, config, starts_at, ends_at, ...).
// Tout le reste (mode, prizes, theme, dates, etc.) est stocké dans `config`.

type DbCampaign = {
  id: string;
  title: string;
  type: Campaign['type'];
  status: string | null;
  config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  public_url_slug: string | null;
  thumbnail_url: string | null;
};

function mapFromDb(row: DbCampaign): Campaign {
  const cfg = (row.config || {}) as Record<string, unknown>;

  return {
    id: row.id,
    title: row.title,
    type: row.type,
    mode: (cfg.mode as CampaignMode) || 'fullscreen',
    status: (row.status as CampaignStatus) || 'draft',
    config: cfg,
    prizes: (cfg.prizes as Record<string, unknown>[]) || [],
    theme: (cfg.theme as Record<string, unknown>) || {},
    slug: row.public_url_slug || undefined,
    thumbnail_url: row.thumbnail_url || undefined,
    start_date: row.starts_at || undefined,
    end_date: row.ends_at || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at || undefined,
  };
}

function mapToDb(partial: Partial<Campaign>): Partial<DbCampaign> & { config?: Record<string, unknown> } {
  const db: Partial<DbCampaign> & { config?: Record<string, unknown> } = {};

  if (partial.title !== undefined) db.title = partial.title;
  if (partial.type !== undefined) db.type = partial.type;
  if (partial.status !== undefined) db.status = partial.status;
  if (partial.start_date !== undefined) db.starts_at = partial.start_date ?? null;
  if (partial.end_date !== undefined) db.ends_at = partial.end_date ?? null;

  // On reconstruit le config à partir de ce que le front connaît
  const baseConfig = (partial.config as Record<string, unknown>) || {};

  const extendedConfig: Record<string, unknown> = {
    ...baseConfig,
  };

  if (partial.mode !== undefined) {
    extendedConfig.mode = partial.mode;
  }

  if (partial.prizes !== undefined) {
    extendedConfig.prizes = partial.prizes;
  }

  if (partial.theme !== undefined) {
    extendedConfig.theme = partial.theme;
  }

  db.config = extendedConfig;

  return db;
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

    const rows = (data || []) as DbCampaign[];
    return rows.map(mapFromDb);
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

    if (!data) return null;

    return mapFromDb(data as DbCampaign);
  },

  /**
   * Créer une nouvelle campagne
   */
  async create(campaign: CampaignCreate): Promise<Campaign> {
    const payload = mapToDb(campaign);

    const { data, error } = await supabase
      .from('campaigns')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('❌ [CampaignService] create error:', error);
      throw error;
    }

    console.log('✅ [CampaignService] Campaign created:', (data as DbCampaign).id);
    return mapFromDb(data as DbCampaign);
  },

  /**
   * Mettre à jour une campagne
   */
  async update(id: string, updates: CampaignUpdate): Promise<Campaign> {
    const payload = mapToDb(updates);

    const { data, error } = await supabase
      .from('campaigns')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [CampaignService] update error:', error);
      throw error;
    }

    console.log('✅ [CampaignService] Campaign updated:', id);
    return mapFromDb(data as DbCampaign);
  },

  /**
   * Sauvegarder une campagne (create ou update)
   */
  async save(campaign: Partial<Campaign> & { title: string; type: Campaign['type'] }): Promise<Campaign> {
    if (campaign.id) {
      const { id, created_at, updated_at, ...updates } = campaign as Campaign;
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
    } as CampaignUpdate);
  },

  /**
   * Mettre en pause une campagne
   */
  async pause(id: string): Promise<Campaign> {
    return this.update(id, { status: 'paused' } as CampaignUpdate);
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
      title: `${campaignData.title} (copie)`,
      status: 'draft',
    });
  },
};
