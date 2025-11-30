-- Activer le realtime sur la table campaign_participants pour le live dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_participants;

-- Créer une vue matérialisée pour les stats en temps réel (refresh toutes les 5 secondes côté client)
CREATE OR REPLACE VIEW realtime_stats AS
SELECT 
  COUNT(*) as total_participations,
  COUNT(DISTINCT campaign_id) as active_campaigns,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h
FROM campaign_participants;