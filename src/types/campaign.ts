// Types de campagnes
export type CampaignType = 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'form';
export type CampaignMode = 'fullscreen' | 'article' | 'embed' | 'popup';
export type CampaignStatus = 'draft' | 'online' | 'paused' | 'ended';

// Interface principale pour une campagne
export interface Campaign {
  id: string;
  title: string;
  type: CampaignType;
  mode: CampaignMode;
  status: CampaignStatus;
  config: Record<string, unknown>;
  prizes: Record<string, unknown>[];
  theme: Record<string, unknown>;
  slug?: string;
  thumbnail_url?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Type pour créer une nouvelle campagne (sans id ni timestamps)
export type CampaignCreate = Omit<Campaign, 'id' | 'created_at' | 'updated_at'>;

// Type pour mettre à jour une campagne
export type CampaignUpdate = Partial<Omit<Campaign, 'id' | 'created_at'>>;
