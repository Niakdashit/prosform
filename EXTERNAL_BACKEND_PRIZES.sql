-- ============================================================================
-- SYSTÈME DE GESTION DES GAINS & TIRAGES AU SORT
-- À exécuter dans votre backend externe Supabase
-- ============================================================================

-- ============================================================================
-- TABLES DE BASE
-- ============================================================================

-- Table pour les tirages au sort
CREATE TABLE IF NOT EXISTS public.prize_draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  draw_name text NOT NULL,
  draw_date timestamp with time zone DEFAULT now(),
  winners_count integer NOT NULL,
  total_participants integer DEFAULT 0,
  winners jsonb DEFAULT '[]'::jsonb,
  selection_criteria jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prize_draws_campaign_id ON prize_draws(campaign_id);
CREATE INDEX IF NOT EXISTS idx_prize_draws_draw_date ON prize_draws(draw_date DESC);

-- Table pour les lots d'instant gagnant
CREATE TABLE IF NOT EXISTS public.instant_win_prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  prize_name text NOT NULL,
  prize_description text,
  prize_image_url text,
  prize_value numeric,
  total_quantity integer DEFAULT 1,
  remaining_quantity integer DEFAULT 1,
  win_probability numeric,
  active_from timestamp with time zone,
  active_until timestamp with time zone,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instant_win_prizes_campaign_id ON instant_win_prizes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_instant_win_prizes_active ON instant_win_prizes(is_active, remaining_quantity);

-- ============================================================================
-- FONCTIONS POUR LES TIRAGES AU SORT
-- ============================================================================

-- Fonction pour effectuer un tirage au sort
CREATE OR REPLACE FUNCTION perform_prize_draw(
  p_campaign_id uuid,
  p_draw_name text,
  p_winners_count integer,
  p_filters jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_participants jsonb;
  v_total_count integer;
  v_winners jsonb;
  v_draw_id uuid;
BEGIN
  -- Construire la requête des participants selon les filtres
  WITH filtered_participants AS (
    SELECT 
      id,
      email,
      created_at,
      prize_won,
      participation_data
    FROM campaign_participants
    WHERE campaign_id = p_campaign_id
      AND completed_at IS NOT NULL
      AND email IS NOT NULL
      -- Filtres optionnels
      AND (
        (p_filters->>'only_winners' IS NULL OR p_filters->>'only_winners' = 'false')
        OR (p_filters->>'only_winners' = 'true' AND prize_won IS NOT NULL)
      )
      AND (
        (p_filters->>'only_non_winners' IS NULL OR p_filters->>'only_non_winners' = 'false')
        OR (p_filters->>'only_non_winners' = 'true' AND prize_won IS NULL)
      )
      AND (
        (p_filters->>'date_from' IS NULL)
        OR (created_at >= (p_filters->>'date_from')::timestamp)
      )
      AND (
        (p_filters->>'date_to' IS NULL)
        OR (created_at <= (p_filters->>'date_to')::timestamp)
      )
  ),
  random_winners AS (
    SELECT 
      id::text,
      email,
      created_at,
      prize_won
    FROM filtered_participants
    ORDER BY RANDOM()
    LIMIT p_winners_count
  )
  SELECT 
    COUNT(*)::integer,
    jsonb_agg(row_to_json(random_winners))
  INTO v_total_count, v_winners
  FROM random_winners;

  -- Créer l'enregistrement du tirage
  INSERT INTO prize_draws (
    campaign_id,
    draw_name,
    winners_count,
    total_participants,
    winners,
    selection_criteria
  ) VALUES (
    p_campaign_id,
    p_draw_name,
    p_winners_count,
    v_total_count,
    COALESCE(v_winners, '[]'::jsonb),
    p_filters
  ) RETURNING id INTO v_draw_id;

  RETURN jsonb_build_object(
    'draw_id', v_draw_id,
    'total_participants', v_total_count,
    'winners_selected', COALESCE(jsonb_array_length(v_winners), 0),
    'winners', COALESCE(v_winners, '[]'::jsonb)
  );
END;
$$;

-- Fonction pour obtenir l'historique des tirages
CREATE OR REPLACE FUNCTION get_prize_draws_history(
  p_campaign_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  campaign_id uuid,
  campaign_name text,
  draw_name text,
  draw_date timestamp with time zone,
  winners_count integer,
  total_participants integer,
  winners jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pd.id,
    pd.campaign_id,
    c.app_title as campaign_name,
    pd.draw_name,
    pd.draw_date,
    pd.winners_count,
    pd.total_participants,
    pd.winners,
    pd.created_at
  FROM prize_draws pd
  JOIN campaigns c ON c.id = pd.campaign_id
  WHERE (p_campaign_id IS NULL OR pd.campaign_id = p_campaign_id)
  ORDER BY pd.draw_date DESC, pd.created_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- FONCTIONS POUR LES INSTANTS GAGNANTS
-- ============================================================================

-- Fonction pour obtenir les gagnants d'instant win
CREATE OR REPLACE FUNCTION get_instant_win_winners(
  p_campaign_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS TABLE (
  participant_id uuid,
  email text,
  prize_name text,
  prize_value numeric,
  won_at timestamp with time zone,
  claimed boolean,
  claimed_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id as participant_id,
    cp.email,
    (cp.prize_won->>'name')::text as prize_name,
    (cp.prize_won->>'value')::numeric as prize_value,
    cp.completed_at as won_at,
    COALESCE(cp.prize_claimed, false) as claimed,
    cp.prize_claimed_at
  FROM campaign_participants cp
  WHERE (p_campaign_id IS NULL OR cp.campaign_id = p_campaign_id)
    AND cp.prize_won IS NOT NULL
  ORDER BY cp.completed_at DESC
  LIMIT p_limit;
END;
$$;

-- Fonction pour obtenir le statut des lots
CREATE OR REPLACE FUNCTION get_prizes_status(p_campaign_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', iwp.id,
      'prize_name', iwp.prize_name,
      'prize_description', iwp.prize_description,
      'prize_value', iwp.prize_value,
      'total_quantity', iwp.total_quantity,
      'remaining_quantity', iwp.remaining_quantity,
      'distributed', iwp.total_quantity - iwp.remaining_quantity,
      'distribution_rate', 
        CASE 
          WHEN iwp.total_quantity > 0 
          THEN ROUND(((iwp.total_quantity - iwp.remaining_quantity)::numeric / iwp.total_quantity * 100), 1)
          ELSE 0 
        END,
      'is_active', iwp.is_active,
      'win_probability', iwp.win_probability,
      'active_from', iwp.active_from,
      'active_until', iwp.active_until
    )
    ORDER BY iwp.display_order, iwp.prize_value DESC
  ) INTO v_result
  FROM instant_win_prizes iwp
  WHERE iwp.campaign_id = p_campaign_id;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Fonction pour obtenir la timeline des gains
CREATE OR REPLACE FUNCTION get_prizes_timeline(
  p_campaign_id uuid DEFAULT NULL,
  p_days integer DEFAULT 30
)
RETURNS TABLE (
  date date,
  total_winners bigint,
  total_prize_value numeric,
  prizes_detail jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(cp.completed_at) as date,
    COUNT(*) as total_winners,
    SUM(COALESCE((cp.prize_won->>'value')::numeric, 0)) as total_prize_value,
    jsonb_agg(
      jsonb_build_object(
        'prize_name', cp.prize_won->>'name',
        'prize_value', (cp.prize_won->>'value')::numeric,
        'email', cp.email
      )
    ) as prizes_detail
  FROM campaign_participants cp
  WHERE (p_campaign_id IS NULL OR cp.campaign_id = p_campaign_id)
    AND cp.prize_won IS NOT NULL
    AND cp.completed_at >= now() - (p_days || ' days')::interval
  GROUP BY DATE(cp.completed_at)
  ORDER BY date DESC;
END;
$$;

-- Fonction pour mettre à jour le statut de réclamation d'un lot
CREATE OR REPLACE FUNCTION update_prize_claim_status(
  p_participant_id uuid,
  p_claimed boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE campaign_participants
  SET 
    prize_claimed = p_claimed,
    prize_claimed_at = CASE WHEN p_claimed THEN now() ELSE NULL END
  WHERE id = p_participant_id
    AND prize_won IS NOT NULL;
  
  RETURN FOUND;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger pour mettre à jour updated_at sur instant_win_prizes
CREATE OR REPLACE FUNCTION update_instant_win_prizes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_instant_win_prizes_updated_at ON instant_win_prizes;
CREATE TRIGGER trigger_instant_win_prizes_updated_at
  BEFORE UPDATE ON instant_win_prizes
  FOR EACH ROW
  EXECUTE FUNCTION update_instant_win_prizes_updated_at();

-- ============================================================================
-- PERMISSIONS RLS
-- ============================================================================

-- RLS pour prize_draws
ALTER TABLE prize_draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on prize_draws"
  ON prize_draws
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS pour instant_win_prizes
ALTER TABLE instant_win_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on instant_win_prizes"
  ON instant_win_prizes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

/*
EXEMPLES D'UTILISATION:

1. Effectuer un tirage au sort:
   SELECT perform_prize_draw(
     'campaign-uuid',
     'Tirage de Noël',
     10,
     '{"only_non_winners": "true", "date_from": "2024-12-01"}'::jsonb
   );

2. Obtenir l'historique des tirages:
   SELECT * FROM get_prize_draws_history('campaign-uuid', 20);

3. Obtenir les gagnants d'instant win:
   SELECT * FROM get_instant_win_winners('campaign-uuid', 50);

4. Obtenir le statut des lots:
   SELECT get_prizes_status('campaign-uuid');

5. Obtenir la timeline des gains:
   SELECT * FROM get_prizes_timeline('campaign-uuid', 30);

6. Marquer un lot comme réclamé:
   SELECT update_prize_claim_status('participant-uuid', true);
*/
