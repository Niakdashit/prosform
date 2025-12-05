-- ============================================
-- CRON JOB: Synchronisation HubSpot
-- ============================================
-- Ce job s'exécute toutes les 15 minutes pour synchroniser
-- les participants vers HubSpot pour toutes les organisations connectées

-- Activer l'extension pg_cron si pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Créer le cron job pour la sync HubSpot
-- Note: Ce job appelle l'Edge Function sync-hubspot
SELECT cron.schedule(
  'sync-hubspot-job',           -- nom du job
  '*/15 * * * *',               -- toutes les 15 minutes
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/sync-hubspot',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================
-- TABLE: Historique des jobs de sync
-- ============================================
CREATE TABLE IF NOT EXISTS sync_job_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed
  stats JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_sync_job_history_job_name ON sync_job_history(job_name);
CREATE INDEX IF NOT EXISTS idx_sync_job_history_started_at ON sync_job_history(started_at DESC);

-- ============================================
-- FONCTION: Nettoyer l'historique des jobs (garder 30 jours)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_sync_job_history()
RETURNS void AS $$
BEGIN
  DELETE FROM sync_job_history
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Cron job pour nettoyer l'historique tous les jours à 3h du matin
SELECT cron.schedule(
  'cleanup-sync-history',
  '0 3 * * *',
  'SELECT cleanup_sync_job_history();'
);

-- ============================================
-- COMMENTAIRES
-- ============================================
COMMENT ON TABLE sync_job_history IS 'Historique des exécutions des jobs de synchronisation';
