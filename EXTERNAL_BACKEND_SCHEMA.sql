-- ============================================================================
-- SCHÉMA REQUIS POUR VOTRE BACKEND EXTERNE SUPABASE
-- ============================================================================
-- Ce fichier liste toutes les colonnes nécessaires pour que votre application
-- fonctionne correctement avec votre backend externe.
-- Exécutez ces commandes dans votre Supabase externe si les colonnes manquent.
-- ============================================================================

-- COLONNES AVANCÉES POUR LA TABLE campaign_participants
-- ============================================================================
-- Ces colonnes permettent le tracking avancé et les analytics détaillées

-- Vérifiez si ces colonnes existent déjà dans votre table campaign_participants :
-- - user_agent (text)
-- - referrer (text)
-- - utm_source (text)
-- - utm_medium (text)
-- - utm_campaign (text)
-- - device_type (text)
-- - browser (text)
-- - os (text)

-- Si elles n'existent pas, exécutez ces commandes :

ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS device_type text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS browser text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS os text;

-- ============================================================================
-- NOTE IMPORTANTE
-- ============================================================================
-- Votre application fonctionne DÉJÀ avec ou sans ces colonnes grâce au système
-- de fallback implémenté. Si les colonnes manquent, les données sont stockées
-- dans le champ JSONB "participation_data".
--
-- Cependant, pour de meilleures performances et des requêtes SQL plus simples,
-- il est recommandé d'ajouter ces colonnes à votre backend externe.
-- ============================================================================

-- LOVABLE CLOUD
-- ============================================================================
-- Lovable Cloud reste disponible mais vide. Aucune donnée n'y sera stockée
-- tant que votre application pointe vers votre backend externe.
-- ============================================================================
