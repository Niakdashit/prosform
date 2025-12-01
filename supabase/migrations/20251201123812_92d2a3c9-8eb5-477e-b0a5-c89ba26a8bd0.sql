-- Create campaign_settings table for rate limiting configuration
CREATE TABLE IF NOT EXISTS public.campaign_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NULL,
  ip_max_attempts integer NOT NULL DEFAULT 5,
  ip_window_minutes integer NOT NULL DEFAULT 60,
  email_max_attempts integer NOT NULL DEFAULT 5,
  email_window_minutes integer NOT NULL DEFAULT 60,
  device_max_attempts integer NOT NULL DEFAULT 5,
  device_window_minutes integer NOT NULL DEFAULT 60,
  auto_block_enabled boolean NOT NULL DEFAULT true,
  block_duration_hours integer NOT NULL DEFAULT 24,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on campaign_settings
ALTER TABLE public.campaign_settings ENABLE ROW LEVEL SECURITY;

-- Policy: campaign owners can manage their settings (or global when campaign_id IS NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'campaign_settings' 
      AND policyname = 'Campaign owners can manage settings'
  ) THEN
    CREATE POLICY "Campaign owners can manage settings" ON public.campaign_settings
      FOR ALL
      USING (
        campaign_id IS NULL OR EXISTS (
          SELECT 1 FROM public.campaigns c
          WHERE c.id = campaign_settings.campaign_id
            AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        campaign_id IS NULL OR EXISTS (
          SELECT 1 FROM public.campaigns c
          WHERE c.id = campaign_settings.campaign_id
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Trigger to keep updated_at in sync for campaign_settings using existing handle_updated_at()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'campaign_settings_handle_updated_at'
  ) THEN
    CREATE TRIGGER campaign_settings_handle_updated_at
      BEFORE UPDATE ON public.campaign_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Function: get_campaign_stats
CREATE OR REPLACE FUNCTION public.get_campaign_stats(p_campaign_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats public.campaign_analytics%ROWTYPE;
  v_unique_participants integer;
  v_devices jsonb;
  v_browsers jsonb;
  v_countries jsonb;
  v_utm_sources jsonb;
  v_conversion_rate numeric;
  v_completion_rate numeric;
BEGIN
  -- Base aggregates from campaign_analytics
  SELECT * INTO v_stats
  FROM public.campaign_analytics
  WHERE campaign_id = p_campaign_id
  LIMIT 1;

  -- If no analytics row yet, default to zeros
  IF NOT FOUND THEN
    v_stats.total_views := 0;
    v_stats.total_participations := 0;
    v_stats.total_completions := 0;
    v_stats.avg_time_spent := 0;
    v_stats.last_participation_at := NULL;
  END IF;

  -- Unique participants based on email or device/ip fallback
  SELECT COUNT(DISTINCT COALESCE(email, device_fingerprint, ip_address))
  INTO v_unique_participants
  FROM public.campaign_participants
  WHERE campaign_id = p_campaign_id;

  -- Devices distribution
  SELECT COALESCE(jsonb_object_agg(device_type, cnt), '{}'::jsonb)
  INTO v_devices
  FROM (
    SELECT COALESCE(device_type, 'unknown') AS device_type, COUNT(*) AS cnt
    FROM public.campaign_participants
    WHERE campaign_id = p_campaign_id
    GROUP BY COALESCE(device_type, 'unknown')
  ) s;

  -- Browsers distribution
  SELECT COALESCE(jsonb_object_agg(browser, cnt), '{}'::jsonb)
  INTO v_browsers
  FROM (
    SELECT COALESCE(browser, 'unknown') AS browser, COUNT(*) AS cnt
    FROM public.campaign_participants
    WHERE campaign_id = p_campaign_id
    GROUP BY COALESCE(browser, 'unknown')
  ) s;

  -- Countries distribution
  SELECT COALESCE(jsonb_object_agg(country, cnt), '{}'::jsonb)
  INTO v_countries
  FROM (
    SELECT COALESCE(country, 'unknown') AS country, COUNT(*) AS cnt
    FROM public.campaign_participants
    WHERE campaign_id = p_campaign_id
    GROUP BY COALESCE(country, 'unknown')
  ) s;

  -- UTM sources distribution
  SELECT COALESCE(jsonb_object_agg(utm_source, cnt), '{}'::jsonb)
  INTO v_utm_sources
  FROM (
    SELECT COALESCE(utm_source, 'direct') AS utm_source, COUNT(*) AS cnt
    FROM public.campaign_participants
    WHERE campaign_id = p_campaign_id
    GROUP BY COALESCE(utm_source, 'direct')
  ) s;

  -- Rates
  IF COALESCE(v_stats.total_views, 0) > 0 THEN
    v_conversion_rate := ROUND( (COALESCE(v_stats.total_participations,0)::numeric * 100.0)
                                / v_stats.total_views, 2);
  ELSE
    v_conversion_rate := 0;
  END IF;

  IF COALESCE(v_stats.total_participations, 0) > 0 THEN
    v_completion_rate := ROUND( (COALESCE(v_stats.total_completions,0)::numeric * 100.0)
                                / v_stats.total_participations, 2);
  ELSE
    v_completion_rate := 0;
  END IF;

  RETURN jsonb_build_object(
    'total_views', COALESCE(v_stats.total_views, 0),
    'total_participations', COALESCE(v_stats.total_participations, 0),
    'total_completions', COALESCE(v_stats.total_completions, 0),
    'conversion_rate', COALESCE(v_conversion_rate, 0),
    'completion_rate', COALESCE(v_completion_rate, 0),
    'avg_time_spent', COALESCE(v_stats.avg_time_spent, 0),
    'last_participation_at', v_stats.last_participation_at,
    'unique_participants', COALESCE(v_unique_participants, 0),
    'devices', v_devices,
    'browsers', v_browsers,
    'countries', v_countries,
    'utm_sources', v_utm_sources
  );
END;
$$;

-- Function: get_participations_by_day
CREATE OR REPLACE FUNCTION public.get_participations_by_day(p_campaign_id uuid, p_days integer DEFAULT 30)
RETURNS TABLE(date date, participations integer, completions integer, unique_emails integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    DATE(created_at) AS date,
    COUNT(*) AS participations,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS completions,
    COUNT(DISTINCT email) AS unique_emails
  FROM public.campaign_participants
  WHERE campaign_id = p_campaign_id
    AND created_at >= now() - (p_days || ' days')::interval
  GROUP BY DATE(created_at)
  ORDER BY date ASC;
$$;

-- Function: get_conversion_funnel
CREATE OR REPLACE FUNCTION public.get_conversion_funnel(p_campaign_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_views integer := 0;
  v_participations integer := 0;
  v_completions integer := 0;
  v_steps jsonb;
BEGIN
  SELECT COALESCE(total_views, 0), COALESCE(total_participations, 0), COALESCE(total_completions, 0)
  INTO v_views, v_participations, v_completions
  FROM public.campaign_analytics
  WHERE campaign_id = p_campaign_id
  LIMIT 1;

  v_steps := jsonb_build_array(
    jsonb_build_object(
      'label', 'Vues',
      'value', v_views,
      'percent', 100
    ),
    jsonb_build_object(
      'label', 'Participations',
      'value', v_participations,
      'percent', CASE WHEN v_views > 0 THEN ROUND((v_participations::numeric * 100.0) / v_views, 2) ELSE 0 END
    ),
    jsonb_build_object(
      'label', 'Complétions',
      'value', v_completions,
      'percent', CASE WHEN v_participations > 0 THEN ROUND((v_completions::numeric * 100.0) / v_participations, 2) ELSE 0 END
    )
  );

  RETURN jsonb_build_object('steps', v_steps);
END;
$$;

-- Helper: internal function to load effective campaign settings (campaign-specific or global default)
CREATE OR REPLACE FUNCTION public._get_effective_campaign_settings(p_campaign_id uuid)
RETURNS public.campaign_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.campaign_settings%ROWTYPE;
BEGIN
  -- Try campaign-specific settings first
  SELECT * INTO v_settings
  FROM public.campaign_settings
  WHERE campaign_id = p_campaign_id
  LIMIT 1;

  -- Fallback to global settings (campaign_id IS NULL)
  IF NOT FOUND THEN
    SELECT * INTO v_settings
    FROM public.campaign_settings
    WHERE campaign_id IS NULL
    LIMIT 1;
  END IF;

  -- If still not found, return a record with defaults
  IF NOT FOUND THEN
    v_settings.id := gen_random_uuid();
    v_settings.campaign_id := NULL;
    v_settings.ip_max_attempts := 5;
    v_settings.ip_window_minutes := 60;
    v_settings.email_max_attempts := 5;
    v_settings.email_window_minutes := 60;
    v_settings.device_max_attempts := 5;
    v_settings.device_window_minutes := 60;
    v_settings.auto_block_enabled := true;
    v_settings.block_duration_hours := 24;
    v_settings.created_at := now();
    v_settings.updated_at := now();
  END IF;

  RETURN v_settings;
END;
$$;

-- Function: get_campaign_settings (public API used by frontend)
CREATE OR REPLACE FUNCTION public.get_campaign_settings(p_campaign_id uuid)
RETURNS public.campaign_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public._get_effective_campaign_settings(p_campaign_id);
END;
$$;

-- Function: upsert_campaign_settings
CREATE OR REPLACE FUNCTION public.upsert_campaign_settings(
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
RETURNS public.campaign_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.campaign_settings%ROWTYPE;
BEGIN
  SELECT * INTO v_existing
  FROM public.campaign_settings
  WHERE campaign_id IS NOT DISTINCT FROM p_campaign_id
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.campaign_settings (
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
      COALESCE(p_email_max_attempts, 5),
      COALESCE(p_email_window_minutes, 60),
      COALESCE(p_device_max_attempts, 5),
      COALESCE(p_device_window_minutes, 60),
      COALESCE(p_auto_block_enabled, true),
      COALESCE(p_block_duration_hours, 24)
    ) RETURNING * INTO v_existing;
  ELSE
    UPDATE public.campaign_settings
    SET
      ip_max_attempts = COALESCE(p_ip_max_attempts, v_existing.ip_max_attempts),
      ip_window_minutes = COALESCE(p_ip_window_minutes, v_existing.ip_window_minutes),
      email_max_attempts = COALESCE(p_email_max_attempts, v_existing.email_max_attempts),
      email_window_minutes = COALESCE(p_email_window_minutes, v_existing.email_window_minutes),
      device_max_attempts = COALESCE(p_device_max_attempts, v_existing.device_max_attempts),
      device_window_minutes = COALESCE(p_device_window_minutes, v_existing.device_window_minutes),
      auto_block_enabled = COALESCE(p_auto_block_enabled, v_existing.auto_block_enabled),
      block_duration_hours = COALESCE(p_block_duration_hours, v_existing.block_duration_hours)
    WHERE id = v_existing.id
    RETURNING * INTO v_existing;
  END IF;

  RETURN v_existing;
END;
$$;

-- Function: is_participant_blocked
CREATE OR REPLACE FUNCTION public.is_participant_blocked(
  p_campaign_id uuid,
  p_ip_address text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_device_fingerprint text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.campaign_settings%ROWTYPE;
  v_now timestamptz := now();
  v_blocked boolean := false;
BEGIN
  v_settings := public._get_effective_campaign_settings(p_campaign_id);

  IF NOT v_settings.auto_block_enabled THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.blocked_participations bp
    WHERE bp.campaign_id = p_campaign_id
      AND (
        (p_ip_address IS NOT NULL AND bp.ip_address = p_ip_address) OR
        (p_email IS NOT NULL AND bp.email = p_email) OR
        (p_device_fingerprint IS NOT NULL AND bp.device_fingerprint = p_device_fingerprint)
      )
      AND bp.blocked_at + (v_settings.block_duration_hours || ' hours')::interval > v_now
  ) THEN
    v_blocked := true;
  END IF;

  RETURN v_blocked;
END;
$$;

-- Function: check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_identifier_type text,
  p_campaign_id uuid,
  p_max_attempts integer,
  p_window_minutes integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.campaign_settings%ROWTYPE;
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_attempts integer := 0;
  v_max integer;
  v_blocked_until timestamptz := NULL;
  v_reason text := NULL;
  v_allowed boolean := true;
BEGIN
  v_settings := public._get_effective_campaign_settings(p_campaign_id);

  IF p_identifier_type = 'ip' THEN
    v_max := COALESCE(p_max_attempts, v_settings.ip_max_attempts);
    v_window_start := v_now - (COALESCE(p_window_minutes, v_settings.ip_window_minutes) || ' minutes')::interval;
  ELSIF p_identifier_type = 'email' THEN
    v_max := COALESCE(p_max_attempts, v_settings.email_max_attempts);
    v_window_start := v_now - (COALESCE(p_window_minutes, v_settings.email_window_minutes) || ' minutes')::interval;
  ELSE
    v_max := COALESCE(p_max_attempts, v_settings.device_max_attempts);
    v_window_start := v_now - (COALESCE(p_window_minutes, v_settings.device_window_minutes) || ' minutes')::interval;
  END IF;

  -- Count attempts in window
  SELECT COUNT(*) INTO v_attempts
  FROM public.campaign_participants cp
  WHERE cp.campaign_id = p_campaign_id
    AND cp.created_at >= v_window_start
    AND (
      (p_identifier_type = 'ip' AND cp.ip_address = p_identifier) OR
      (p_identifier_type = 'email' AND cp.email = p_identifier) OR
      (p_identifier_type = 'device' AND cp.device_fingerprint = p_identifier)
    );

  -- Check if already blocked
  IF public.is_participant_blocked(p_campaign_id,
        CASE WHEN p_identifier_type = 'ip' THEN p_identifier ELSE NULL END,
        CASE WHEN p_identifier_type = 'email' THEN p_identifier ELSE NULL END,
        CASE WHEN p_identifier_type = 'device' THEN p_identifier ELSE NULL END) THEN

    v_allowed := false;
    v_reason := 'already_blocked';
    v_blocked_until := v_now + (v_settings.block_duration_hours || ' hours')::interval;
  ELSIF v_attempts >= v_max THEN
    v_allowed := false;
    v_reason := 'rate_limited';

    IF v_settings.auto_block_enabled THEN
      INSERT INTO public.blocked_participations (
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
        jsonb_build_object(
          'identifier_type', p_identifier_type,
          'attempts', v_attempts,
          'max_attempts', v_max
        )
      );

      v_blocked_until := v_now + (v_settings.block_duration_hours || ' hours')::interval;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'attempts', v_attempts,
    'max_attempts', v_max,
    'blocked_until', v_blocked_until,
    'reason', v_reason
  );
END;
$$;