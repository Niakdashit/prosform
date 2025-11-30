-- Trigger pour auto-incrémenter participation_count dans campaigns
-- Lorsqu'une participation est insérée dans campaign_participants

CREATE OR REPLACE FUNCTION increment_participation_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter le compteur de participations pour la campagne
  UPDATE campaigns
  SET participation_count = COALESCE(participation_count, 0) + 1
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger
CREATE TRIGGER on_participation_inserted
  AFTER INSERT ON campaign_participants
  FOR EACH ROW
  EXECUTE FUNCTION increment_participation_count();