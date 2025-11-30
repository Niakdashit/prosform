-- ============================================================================
-- TABLE CAMPAIGN_SETTINGS POUR CONFIGURATION PAR CAMPAGNE
-- ============================================================================
-- À exécuter dans votre backend externe Supabase
-- ============================================================================

-- Table pour stocker les paramètres de configuration par campagne
CREATE TABLE IF NOT EXISTS public.campaign_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL UNIQUE REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Rate limiting settings
  ip_max_attempts integer DEFAULT 5 NOT NULL,
  ip_window_minutes integer DEFAULT 60 NOT NULL,
  
  email_max_attempts integer DEFAULT 3 NOT NULL,
  email_window_minutes integer DEFAULT 60 NOT NULL,
  
  device_max_attempts integer DEFAULT 5 NOT NULL,
  device_window_minutes integer DEFAULT 60 NOT NULL,
  
  -- Blocage automatique
  auto_block_enabled boolean DEFAULT true NOT NULL,
  block_duration_hours integer DEFAULT 24 NOT NULL,
  
  -- Métadonnées
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_campaign_settings_campaign_id ON campaign_settings(campaign_id);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_campaign_settings_updated_at ON campaign_settings;
CREATE TRIGGER update_campaign_settings_updated_at
  BEFORE UPDATE ON campaign_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE campaign_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage campaign settings"
  ON campaign_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FONCTION POUR OBTENIR LES SETTINGS D'UNE CAMPAGNE (avec fallback)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_campaign_settings(p_campaign_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings jsonb;
BEGIN
  -- Récupérer les settings ou retourner les valeurs par défaut
  SELECT jsonb_build_object(
    'ip_max_attempts', COALESCE(ip_max_attempts, 5),
    'ip_window_minutes', COALESCE(ip_window_minutes, 60),
    'email_max_attempts', COALESCE(email_max_attempts, 3),
    'email_window_minutes', COALESCE(email_window_minutes, 60),
    'device_max_attempts', COALESCE(device_max_attempts, 5),
    'device_window_minutes', COALESCE(device_window_minutes, 60),
    'auto_block_enabled', COALESCE(auto_block_enabled, true),
    'block_duration_hours', COALESCE(block_duration_hours, 24)
  ) INTO v_settings
  FROM campaign_settings
  WHERE campaign_id = p_campaign_id;

  -- Si pas de settings, retourner les valeurs par défaut
  IF v_settings IS NULL THEN
    RETURN jsonb_build_object(
      'ip_max_attempts', 5,
      'ip_window_minutes', 60,
      'email_max_attempts', 3,
      'email_window_minutes', 60,
      'device_max_attempts', 5,
      'device_window_minutes', 60,
      'auto_block_enabled', true,
      'block_duration_hours', 24
    );
  END IF;

  RETURN v_settings;
END;
$$;

-- ============================================================================
-- FONCTION POUR METTRE À JOUR LES SETTINGS
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_campaign_settings(
  p_campaign_id uuid,
  p_ip_max_attempts integer DEFAULT NULL,
  p_ip_window_minutes integer DEFAULT NULL,
  p_email_max_attempts integer DEFAULT NULL,
  p_email_window_minutes integer DEFAULT NULL,
  p_device_max_attempts integer DEFAULT NULL,
  p_device_window_minutes integer DEFAULT NULL,
  p_auto_block_enabled boolean DEFAULT NULL,
  p_block_duration_hours integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Upsert les settings
  INSERT INTO campaign_settings (
    campaign_id,
    ip_max_attempts,
    ip_window_minutes,
    email_max_attempts,
    email_window_minutes,
    device_max_attempts,
    device_window_minutes,
    auto_block_enabled,
    block_duration_hours
  ) VALUES (
    p_campaign_id,
    COALESCE(p_ip_max_attempts, 5),
    COALESCE(p_ip_window_minutes, 60),
    COALESCE(p_email_max_attempts, 3),
    COALESCE(p_email_window_minutes, 60),
    COALESCE(p_device_max_attempts, 5),
    COALESCE(p_device_window_minutes, 60),
    COALESCE(p_auto_block_enabled, true),
    COALESCE(p_block_duration_hours, 24)
  )
  ON CONFLICT (campaign_id)
  DO UPDATE SET
    ip_max_attempts = COALESCE(p_ip_max_attempts, campaign_settings.ip_max_attempts),
    ip_window_minutes = COALESCE(p_ip_window_minutes, campaign_settings.ip_window_minutes),
    email_max_attempts = COALESCE(p_email_max_attempts, campaign_settings.email_max_attempts),
    email_window_minutes = COALESCE(p_email_window_minutes, campaign_settings.email_window_minutes),
    device_max_attempts = COALESCE(p_device_max_attempts, campaign_settings.device_max_attempts),
    device_window_minutes = COALESCE(p_device_window_minutes, campaign_settings.device_window_minutes),
    auto_block_enabled = COALESCE(p_auto_block_enabled, campaign_settings.auto_block_enabled),
    block_duration_hours = COALESCE(p_block_duration_hours, campaign_settings.block_duration_hours),
    updated_at = now()
  RETURNING jsonb_build_object(
    'id', id::text,
    'campaign_id', campaign_id::text,
    'ip_max_attempts', ip_max_attempts,
    'ip_window_minutes', ip_window_minutes,
    'email_max_attempts', email_max_attempts,
    'email_window_minutes', email_window_minutes,
    'device_max_attempts', device_max_attempts,
    'device_window_minutes', device_window_minutes,
    'auto_block_enabled', auto_block_enabled,
    'block_duration_hours', block_duration_hours
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

/*
EXEMPLES:

1. Obtenir les settings d'une campagne:
   SELECT get_campaign_settings('campaign-uuid');

2. Créer/Mettre à jour les settings:
   SELECT upsert_campaign_settings(
     'campaign-uuid',
     10,  -- ip_max_attempts
     30,  -- ip_window_minutes
     5,   -- email_max_attempts
     60,  -- email_window_minutes
     8,   -- device_max_attempts
     45,  -- device_window_minutes
     true, -- auto_block_enabled
     48   -- block_duration_hours
   );

3. Mettre à jour seulement certains champs (les autres gardent leur valeur):
   SELECT upsert_campaign_settings(
     'campaign-uuid',
     p_ip_max_attempts := 15,
     p_email_max_attempts := 10
   );
*/
