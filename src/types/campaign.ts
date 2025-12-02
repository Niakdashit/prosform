// Types de campagnes
export type CampaignType = 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'form' | 'catalog';
export type CampaignMode = 'fullscreen' | 'article' | 'embed' | 'popup';
export type CampaignStatus = 'draft' | 'online' | 'paused' | 'ended';

// Interface principale pour une campagne (alignée avec la structure Supabase)
export interface Campaign {
  id: string;
  name: string; // Alias pour app_title pour compatibilité
  app_title?: string; // Nom réel dans la base
  title?: string; // Titre optionnel
  type: CampaignType;
  mode: CampaignMode;
  status: CampaignStatus;
  config: Record<string, unknown>;
  prizes: Record<string, unknown>[];
  theme: Record<string, unknown>;
  public_url_slug?: string;
  published_url?: string;
  thumbnail_url?: string;
  starts_at?: string;
  ends_at?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  last_edited_at: string;
  participation_count?: number;
  participation_limit?: number;
  user_id: string;
}

// Type pour créer une nouvelle campagne (sans id ni timestamps)
export type CampaignCreate = Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'last_edited_at'>;

// Type pour mettre à jour une campagne
export type CampaignUpdate = Partial<Omit<Campaign, 'id' | 'created_at'>>;
