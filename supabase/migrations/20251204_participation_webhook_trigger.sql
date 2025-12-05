-- ============================================
-- TRIGGER: Webhook temps réel pour les participations
-- ============================================
-- Appelle automatiquement le webhook quand un participant joue

-- Fonction qui appelle le webhook
CREATE OR REPLACE FUNCTION notify_participation_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  payload JSONB;
  campaign_record RECORD;
BEGIN
  -- Récupérer les infos de la campagne
  SELECT id, name, type, organization_id 
  INTO campaign_record
  FROM campaigns 
  WHERE id = NEW.campaign_id;

  -- Construire le payload
  payload := jsonb_build_object(
    'type', CASE 
      WHEN TG_OP = 'INSERT' THEN 'participation.created'
      ELSE 'participation.updated'
    END,
    'data', jsonb_build_object(
      'id', NEW.id,
      'email', NEW.email,
      'first_name', NEW.first_name,
      'last_name', NEW.last_name,
      'phone', NEW.phone,
      'organization_id', COALESCE(NEW.organization_id, campaign_record.organization_id),
      'campaign_id', NEW.campaign_id,
      'campaign_type', campaign_record.type,
      'points_earned', NEW.points_earned,
      'prize_won', NEW.prize_won,
      'created_at', NEW.created_at
    )
  );

  -- Appeler le webhook de manière asynchrone via pg_net
  -- Note: pg_net doit être activé dans Supabase
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/webhook-participation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ne pas bloquer l'insertion si le webhook échoue
    RAISE WARNING 'Webhook notification failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table campaign_participations
DROP TRIGGER IF EXISTS trigger_participation_webhook ON campaign_participations;

CREATE TRIGGER trigger_participation_webhook
  AFTER INSERT OR UPDATE ON campaign_participations
  FOR EACH ROW
  EXECUTE FUNCTION notify_participation_webhook();

-- ============================================
-- CONFIGURATION: Activer/désactiver le webhook par organisation
-- ============================================
-- Ajouter une colonne pour contrôler le webhook temps réel
ALTER TABLE organization_integrations 
ADD COLUMN IF NOT EXISTS realtime_sync_enabled BOOLEAN DEFAULT false;

-- Mettre à jour la fonction pour vérifier si le realtime est activé
CREATE OR REPLACE FUNCTION notify_participation_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  payload JSONB;
  campaign_record RECORD;
  has_realtime_integration BOOLEAN;
BEGIN
  -- Récupérer les infos de la campagne
  SELECT id, name, type, organization_id 
  INTO campaign_record
  FROM campaigns 
  WHERE id = NEW.campaign_id;

  -- Vérifier s'il y a des intégrations avec realtime activé
  SELECT EXISTS(
    SELECT 1 FROM organization_integrations
    WHERE organization_id = COALESCE(NEW.organization_id, campaign_record.organization_id)
    AND status = 'connected'
    AND realtime_sync_enabled = true
  ) INTO has_realtime_integration;

  -- Si pas d'intégration realtime, ne rien faire
  IF NOT has_realtime_integration THEN
    RETURN NEW;
  END IF;

  -- Construire le payload
  payload := jsonb_build_object(
    'type', CASE 
      WHEN TG_OP = 'INSERT' THEN 'participation.created'
      ELSE 'participation.updated'
    END,
    'data', jsonb_build_object(
      'id', NEW.id,
      'email', NEW.email,
      'first_name', NEW.first_name,
      'last_name', NEW.last_name,
      'phone', NEW.phone,
      'organization_id', COALESCE(NEW.organization_id, campaign_record.organization_id),
      'campaign_id', NEW.campaign_id,
      'campaign_type', campaign_record.type,
      'points_earned', NEW.points_earned,
      'prize_won', NEW.prize_won,
      'created_at', NEW.created_at
    )
  );

  -- Appeler le webhook de manière asynchrone via pg_net
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/webhook-participation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ne pas bloquer l'insertion si le webhook échoue
    RAISE WARNING 'Webhook notification failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTAIRES
-- ============================================
COMMENT ON FUNCTION notify_participation_webhook() IS 
  'Appelle le webhook de synchronisation CRM quand un participant joue';
COMMENT ON COLUMN organization_integrations.realtime_sync_enabled IS 
  'Active la synchronisation temps réel vers les CRM connectés';
