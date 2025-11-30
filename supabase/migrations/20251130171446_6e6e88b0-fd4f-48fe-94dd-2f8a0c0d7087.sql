-- Phase 1: Secure Foundations - Indexes et optimisations

-- Index pour améliorer les performances des requêtes publiques
CREATE INDEX IF NOT EXISTS idx_campaigns_public_slug ON public.campaigns(public_url_slug) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON public.campaigns(user_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_email ON public.campaign_participants(campaign_id, email);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_device ON public.campaign_participants(campaign_id, device_fingerprint);

-- Contrainte pour éviter les doublons de slug
ALTER TABLE public.campaigns 
ADD CONSTRAINT unique_public_url_slug UNIQUE (public_url_slug);