-- Corriger la vue pour utiliser SECURITY INVOKER au lieu de SECURITY DEFINER
DROP VIEW IF EXISTS realtime_stats;

CREATE OR REPLACE VIEW realtime_stats 
WITH (security_invoker = true) AS
SELECT 
  COUNT(*) as total_participations,
  COUNT(DISTINCT campaign_id) as active_campaigns,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h
FROM campaign_participants;