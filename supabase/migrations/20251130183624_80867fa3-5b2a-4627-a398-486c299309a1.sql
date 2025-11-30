-- Supprimer les anciennes policies restrictives
DROP POLICY IF EXISTS "System can insert campaign analytics" ON campaign_analytics;
DROP POLICY IF EXISTS "System can update campaign analytics" ON campaign_analytics;

-- Créer des policies permettant l'insertion et la mise à jour publiques
-- (nécessaire pour que ParticipationService fonctionne lors des participations anonymes)
CREATE POLICY "Anyone can insert campaign analytics"
ON campaign_analytics
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update campaign analytics"
ON campaign_analytics
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);