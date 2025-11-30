-- Ajouter les colonnes manquantes pour le tracking avancé dans campaign_participants

-- Colonnes pour le device tracking
ALTER TABLE public.campaign_participants 
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT;

-- Note: device_type existe déjà dans le schéma

-- Colonnes pour le tracking UTM
ALTER TABLE public.campaign_participants
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Note: referrer existe déjà dans le schéma
-- Note: user_agent existe déjà dans le schéma
-- Note: country existe déjà dans le schéma
-- Note: device_fingerprint existe déjà dans le schéma
-- Note: ip_address existe déjà dans le schéma

-- Créer des index pour améliorer les performances des requêtes analytics
CREATE INDEX IF NOT EXISTS idx_campaign_participants_device_type ON public.campaign_participants(device_type);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_browser ON public.campaign_participants(browser);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_os ON public.campaign_participants(os);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_country ON public.campaign_participants(country);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_utm_source ON public.campaign_participants(utm_source);