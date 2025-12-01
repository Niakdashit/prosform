import { supabase } from '@/integrations/supabase/client';
import type { Campaign, CampaignCreate, CampaignUpdate } from '@/types/campaign';
import { campaignCreateSchema, campaignUpdateSchema, publishCampaignSchema } from '@/schemas/campaign.schema';

/**
 * Transforme les données Supabase en format Campaign
 */
function transformCampaign(data: any): Campaign {
  return {
    ...data,
    name: data.app_title || data.title || data.name,
  };
}

/**
 * Prépare les données pour l'insertion/mise à jour Supabase
 */
function prepareCampaignData(campaign: Partial<Campaign>, isUpdate: boolean = false): any {
  // Champs à exclure (lecture seule ou gérés automatiquement)
  const excludedFields = [
    'id',
    'created_at',
    'updated_at',
  ];

  // Pour compatibilité avec l'ancien schéma, on ne met à jour que ces colonnes
  const allowedFields = ['name', 'type', 'mode', 'status', 'config'];
  
  // Si c'est une mise à jour, ne pas modifier user_id
  if (isUpdate) {
    excludedFields.push('user_id');
  }
  
  const result: any = {};
  
  for (const [key, value] of Object.entries(campaign)) {
    if (!excludedFields.includes(key) && allowedFields.includes(key) && value !== undefined) {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Service centralisé pour la gestion des campagnes avec validation et sécurité
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

    return (data || []).map(transformCampaign);
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

    return transformCampaign(data);
  },

  /**
   * Créer une nouvelle campagne (avec validation)
   */
  async create(campaign: CampaignCreate): Promise<Campaign> {
    // Validation des données
    const validatedData = campaignCreateSchema.parse(campaign);
    
    // Préparer les données pour Supabase (compat schéma ancien)
    const supabaseData = prepareCampaignData(validatedData, false);

    const { data, error } = await supabase
      .from('campaigns')
      .insert([supabaseData])
      .select()
      .single();

    if (error) {
      console.error('❌ [CampaignService] create error:', error);
      throw error;
    }

    return transformCampaign(data);
  },

  /**
   * Mettre à jour une campagne (avec validation)
   */
  async update(id: string, updates: CampaignUpdate): Promise<Campaign> {
    // Validation des données
    const validatedData = campaignUpdateSchema.parse(updates);
    
    // Préparer les données pour Supabase (isUpdate = true pour filtrer user_id et rester compatible avec l'ancien schéma)
    const supabaseData = prepareCampaignData(validatedData, true);

    const { data, error } = await supabase
      .from('campaigns')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [CampaignService] update error:', error);
      throw error;
    }

    return transformCampaign(data);
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

  },

  /**
   * Publier une campagne avec génération de slug et URL publique
   */
  async publish(id: string): Promise<Campaign> {
    // Récupérer la campagne pour validation
    const campaign = await this.getById(id);
    if (!campaign) throw new Error('Campaign not found');
    
    // Validation avant publication
    publishCampaignSchema.parse({ id, name: campaign.name });
    
    // Générer le slug si pas déjà présent
    let publicSlug = campaign.public_url_slug;
    if (!publicSlug) {
      // Import dynamique pour éviter les dépendances circulaires
      const { generateSlug } = await import('@/utils/inputValidation');
      publicSlug = generateSlug(campaign.name, id);
      
      // Vérifier l'unicité du slug
      let counter = 0;
      let finalSlug = publicSlug;
      while (true) {
        const { data: existing } = await supabase
          .from('campaigns')
          .select('id')
          .eq('public_url_slug', finalSlug)
          .single();
        
        if (!existing) break;
        
        counter++;
        finalSlug = `${publicSlug}-${counter}`;
      }
      
      publicSlug = finalSlug;
    }
    
    // URL publique complète
    const publicUrl = `${window.location.origin}/p/${publicSlug}`;
    
    return this.update(id, {
      status: 'online',
      is_published: true,
      published_at: new Date().toISOString(),
      public_url_slug: publicSlug,
      published_url: publicUrl,
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
