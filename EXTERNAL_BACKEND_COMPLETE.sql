-- ============================================================================
-- SQL COMPLET POUR VOTRE BACKEND EXTERNE SUPABASE
-- ============================================================================
-- Exécutez ces commandes dans l'ordre dans votre Supabase externe
-- ============================================================================

-- ============================================================================
-- PHASE 1: FONDATIONS SÉCURISÉES
-- ============================================================================

-- 1.1 Colonnes avancées pour campaign_participants (si pas déjà fait)
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS device_type text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS browser text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS os text;
ALTER TABLE campaign_participants ADD COLUMN IF NOT EXISTS ip_address text;

-- 1.2 Index pour performances
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign_id ON campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_email ON campaign_participants(email);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_device_fingerprint ON campaign_participants(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_ip_address ON campaign_participants(ip_address);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_created_at ON campaign_participants(created_at DESC);

-- ============================================================================
-- PHASE 2: ANTI-ABUSE & RATE LIMITING
-- ============================================================================

-- 2.1 Table pour rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP, email, ou device_fingerprint
  identifier_type text NOT NULL, -- 'ip', 'email', 'device'
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  attempt_count integer DEFAULT 1,
  first_attempt_at timestamp with time zone DEFAULT now(),
  last_attempt_at timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, identifier_type, campaign_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON rate_limits(blocked_until);

-- 2.2 Fonction pour vérifier le rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier text,
  p_identifier_type text,
  p_campaign_id uuid,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 60
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record record;
  v_is_blocked boolean := false;
  v_attempts integer := 0;
BEGIN
  -- Chercher un enregistrement existant
  SELECT * INTO v_record
  FROM rate_limits
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND campaign_id = p_campaign_id
    AND first_attempt_at > now() - (p_window_minutes || ' minutes')::interval;

  -- Si bloqué et encore dans la période de blocage
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > now() THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', v_record.blocked_until,
      'reason', 'rate_limit_exceeded'
    );
  END IF;

  -- Si pas d'enregistrement ou fenêtre expirée, créer nouveau
  IF v_record IS NULL THEN
    INSERT INTO rate_limits (identifier, identifier_type, campaign_id, attempt_count)
    VALUES (p_identifier, p_identifier_type, p_campaign_id, 1);
    
    RETURN jsonb_build_object('allowed', true, 'attempts', 1, 'max_attempts', p_max_attempts);
  END IF;

  -- Incrémenter le compteur
  v_attempts := v_record.attempt_count + 1;

  -- Si dépassement du seuil, bloquer
  IF v_attempts > p_max_attempts THEN
    UPDATE rate_limits
    SET 
      attempt_count = v_attempts,
      last_attempt_at = now(),
      blocked_until = now() + interval '1 hour'
    WHERE id = v_record.id;

    -- Ajouter à la table blocked_participations
    INSERT INTO blocked_participations (
      campaign_id,
      ip_address,
      email,
      device_fingerprint,
      block_reason,
      metadata
    ) VALUES (
      p_campaign_id,
      CASE WHEN p_identifier_type = 'ip' THEN p_identifier ELSE NULL END,
      CASE WHEN p_identifier_type = 'email' THEN p_identifier ELSE NULL END,
      CASE WHEN p_identifier_type = 'device' THEN p_identifier ELSE NULL END,
      'rate_limit_exceeded',
      jsonb_build_object('attempts', v_attempts, 'max_attempts', p_max_attempts)
    );

    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', now() + interval '1 hour',
      'reason', 'rate_limit_exceeded',
      'attempts', v_attempts
    );
  END IF;

  -- Sinon, juste incrémenter
  UPDATE rate_limits
  SET 
    attempt_count = v_attempts,
    last_attempt_at = now()
  WHERE id = v_record.id;

  RETURN jsonb_build_object(
    'allowed', true,
    'attempts', v_attempts,
    'max_attempts', p_max_attempts
  );
END;
$$;

-- 2.3 Fonction pour vérifier si un participant est bloqué
CREATE OR REPLACE FUNCTION is_participant_blocked(
  p_campaign_id uuid,
  p_ip_address text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_device_fingerprint text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM blocked_participations
    WHERE campaign_id = p_campaign_id
      AND (
        (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
        OR (p_email IS NOT NULL AND email = p_email)
        OR (p_device_fingerprint IS NOT NULL AND device_fingerprint = p_device_fingerprint)
      )
      AND blocked_at > now() - interval '24 hours' -- Blocage pour 24h
  );
END;
$$;

-- ============================================================================
-- PHASE 3: ANALYTICS AVANCÉES
-- ============================================================================

-- 3.1 Fonction pour obtenir les stats d'une campagne
CREATE OR REPLACE FUNCTION get_campaign_stats(p_campaign_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_views', COALESCE(ca.total_views, 0),
    'total_participations', COALESCE(ca.total_participations, 0),
    'total_completions', COALESCE(ca.total_completions, 0),
    'conversion_rate', 
      CASE 
        WHEN COALESCE(ca.total_views, 0) > 0 
        THEN ROUND((COALESCE(ca.total_participations, 0)::numeric / ca.total_views * 100), 2)
        ELSE 0 
      END,
    'completion_rate',
      CASE 
        WHEN COALESCE(ca.total_participations, 0) > 0 
        THEN ROUND((COALESCE(ca.total_completions, 0)::numeric / ca.total_participations * 100), 2)
        ELSE 0 
      END,
    'avg_time_spent', COALESCE(ca.avg_time_spent, 0),
    'last_participation_at', ca.last_participation_at,
    'unique_participants', (
      SELECT COUNT(DISTINCT email)
      FROM campaign_participants
      WHERE campaign_id = p_campaign_id AND email IS NOT NULL
    ),
    'devices', (
      SELECT jsonb_object_agg(device_type, count)
      FROM (
        SELECT device_type, COUNT(*) as count
        FROM campaign_participants
        WHERE campaign_id = p_campaign_id AND device_type IS NOT NULL
        GROUP BY device_type
      ) sub
    ),
    'browsers', (
      SELECT jsonb_object_agg(browser, count)
      FROM (
        SELECT browser, COUNT(*) as count
        FROM campaign_participants
        WHERE campaign_id = p_campaign_id AND browser IS NOT NULL
        GROUP BY browser
        ORDER BY count DESC
        LIMIT 5
      ) sub
    ),
    'countries', (
      SELECT jsonb_object_agg(country, count)
      FROM (
        SELECT country, COUNT(*) as count
        FROM campaign_participants
        WHERE campaign_id = p_campaign_id AND country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
      ) sub
    ),
    'utm_sources', (
      SELECT jsonb_object_agg(utm_source, count)
      FROM (
        SELECT utm_source, COUNT(*) as count
        FROM campaign_participants
        WHERE campaign_id = p_campaign_id AND utm_source IS NOT NULL
        GROUP BY utm_source
        ORDER BY count DESC
        LIMIT 5
      ) sub
    )
  ) INTO v_result
  FROM campaign_analytics ca
  WHERE ca.campaign_id = p_campaign_id;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- 3.2 Fonction pour obtenir les participations par jour
CREATE OR REPLACE FUNCTION get_participations_by_day(
  p_campaign_id uuid,
  p_days integer DEFAULT 30
)
RETURNS TABLE (
  date date,
  participations bigint,
  completions bigint,
  unique_emails bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(cp.created_at) as date,
    COUNT(*) as participations,
    COUNT(cp.completed_at) as completions,
    COUNT(DISTINCT cp.email) FILTER (WHERE cp.email IS NOT NULL) as unique_emails
  FROM campaign_participants cp
  WHERE cp.campaign_id = p_campaign_id
    AND cp.created_at > now() - (p_days || ' days')::interval
  GROUP BY DATE(cp.created_at)
  ORDER BY date DESC;
END;
$$;

-- 3.3 Fonction pour obtenir le funnel de conversion
CREATE OR REPLACE FUNCTION get_conversion_funnel(p_campaign_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_views integer;
  v_participations integer;
  v_completions integer;
  v_with_email integer;
BEGIN
  -- Récupérer les métriques
  SELECT 
    COALESCE(total_views, 0),
    COALESCE(total_participations, 0),
    COALESCE(total_completions, 0)
  INTO v_views, v_participations, v_completions
  FROM campaign_analytics
  WHERE campaign_id = p_campaign_id;

  -- Compter les participations avec email
  SELECT COUNT(*) INTO v_with_email
  FROM campaign_participants
  WHERE campaign_id = p_campaign_id AND email IS NOT NULL;

  RETURN jsonb_build_object(
    'steps', jsonb_build_array(
      jsonb_build_object('label', 'Vues', 'value', v_views, 'percent', 100),
      jsonb_build_object(
        'label', 'Participations', 
        'value', v_participations,
        'percent', CASE WHEN v_views > 0 THEN ROUND((v_participations::numeric / v_views * 100), 1) ELSE 0 END
      ),
      jsonb_build_object(
        'label', 'Email fourni',
        'value', v_with_email,
        'percent', CASE WHEN v_participations > 0 THEN ROUND((v_with_email::numeric / v_participations * 100), 1) ELSE 0 END
      ),
      jsonb_build_object(
        'label', 'Complétions',
        'value', v_completions,
        'percent', CASE WHEN v_participations > 0 THEN ROUND((v_completions::numeric / v_participations * 100), 1) ELSE 0 END
      )
    )
  );
END;
$$;

-- ============================================================================
-- PHASE 4: EXPORTS & RAPPORTS
-- ============================================================================

-- 4.1 Vue pour export complet des participants
CREATE OR REPLACE VIEW participant_export_view AS
SELECT 
  COALESCE(c.title, c.app_title, c.id::text) as campaign_name,
  c.type as campaign_type,
  cp.email,
  cp.created_at,
  cp.completed_at,
  cp.device_type,
  cp.browser,
  cp.os,
  cp.country,
  cp.city,
  cp.utm_source,
  cp.utm_medium,
  cp.utm_campaign,
  cp.referrer,
  cp.participation_data
FROM campaign_participants cp
JOIN campaigns c ON c.id = cp.campaign_id;

-- 4.2 Fonction pour nettoyer les anciennes données de rate limiting
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer les enregistrements de plus de 7 jours
  DELETE FROM rate_limits
  WHERE created_at < now() - interval '7 days';
  
  -- Supprimer les blocages de plus de 30 jours
  DELETE FROM blocked_participations
  WHERE blocked_at < now() - interval '30 days';
END;
$$;

-- ============================================================================
-- TRIGGERS & AUTOMATION
-- ============================================================================

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger si pas déjà fait
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_analytics_updated_at ON campaign_analytics;
CREATE TRIGGER update_campaign_analytics_updated_at
  BEFORE UPDATE ON campaign_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PERMISSIONS RLS (Row Level Security)
-- ============================================================================

-- Note: Ces policies supposent que vous avez déjà l'authentification configurée
-- Adaptez les selon votre setup existant

-- Policy pour rate_limits (système uniquement)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits"
  ON rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CONFIGURATION RECOMMANDÉE
-- ============================================================================

-- Créer un cron job pour nettoyer les anciennes données (si pg_cron est activé)
-- SELECT cron.schedule('cleanup-rate-limits', '0 2 * * *', 'SELECT cleanup_old_rate_limits()');

-- ============================================================================
-- NOTES D'IMPLÉMENTATION
-- ============================================================================

/*
UTILISATION DES FONCTIONS:

1. Vérifier le rate limit avant d'enregistrer une participation:
   SELECT check_rate_limit('192.168.1.1', 'ip', 'campaign-uuid', 5, 60);

2. Vérifier si un participant est bloqué:
   SELECT is_participant_blocked('campaign-uuid', '192.168.1.1', 'user@example.com', 'fingerprint123');

3. Obtenir les stats d'une campagne:
   SELECT get_campaign_stats('campaign-uuid');

4. Obtenir les participations par jour:
   SELECT * FROM get_participations_by_day('campaign-uuid', 30);

5. Obtenir le funnel de conversion:
   SELECT get_conversion_funnel('campaign-uuid');

6. Nettoyer les anciennes données:
   SELECT cleanup_old_rate_limits();
*/
