-- Optimisations de la table campaigns pour performances et sécurité

-- 1. Rendre status NOT NULL avec une valeur par défaut
ALTER TABLE public.campaigns
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'draft';

-- 2. Rendre is_published NOT NULL avec valeur par défaut
ALTER TABLE public.campaigns
  ALTER COLUMN is_published SET NOT NULL,
  ALTER COLUMN is_published SET DEFAULT false;

-- 3. Index sur public_url_slug pour recherches publiques rapides (UNIQUE car slug unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_public_url_slug 
  ON public.campaigns(public_url_slug) 
  WHERE public_url_slug IS NOT NULL;

-- 4. Index sur user_id pour requêtes utilisateur
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id 
  ON public.campaigns(user_id);

-- 5. Index sur status pour filtrer les campagnes
CREATE INDEX IF NOT EXISTS idx_campaigns_status 
  ON public.campaigns(status);

-- 6. Index composite sur user_id + status pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status 
  ON public.campaigns(user_id, status);

-- 7. Ajouter un index sur campaign_participants.campaign_id pour performance des analytics
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign_id 
  ON public.campaign_participants(campaign_id);

-- 8. Index sur email pour détection anti-spam/duplicates
CREATE INDEX IF NOT EXISTS idx_campaign_participants_email 
  ON public.campaign_participants(email) 
  WHERE email IS NOT NULL;

-- Force PostgREST à recharger le schéma
NOTIFY pgrst, 'reload schema';