-- ============================================
-- TABLE: Participations aux campagnes
-- ============================================
-- Stocke toutes les participations des utilisateurs aux campagnes
-- (jeux de roue, scratch, quiz, etc.)

CREATE TABLE IF NOT EXISTS campaign_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Référence à la campagne
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Informations du participant
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  
  -- Données de participation
  ip_address INET,
  user_agent TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  
  -- Résultats du jeu
  game_result JSONB, -- Résultat brut du jeu (segment gagné, etc.)
  prize_won TEXT, -- Nom du lot gagné
  prize_value DECIMAL(10,2), -- Valeur du lot
  points_earned INTEGER DEFAULT 0,
  
  -- Statut
  status TEXT DEFAULT 'completed', -- pending, completed, claimed, expired
  claimed_at TIMESTAMPTZ,
  
  -- Consentements
  marketing_consent BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT true,
  
  -- Données additionnelles (champs custom du formulaire)
  custom_fields JSONB DEFAULT '{}',
  
  -- Métadonnées
  source TEXT, -- direct, qr_code, email, social, embed
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEX pour les requêtes fréquentes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_participations_campaign ON campaign_participations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_participations_organization ON campaign_participations(organization_id);
CREATE INDEX IF NOT EXISTS idx_participations_email ON campaign_participations(email);
CREATE INDEX IF NOT EXISTS idx_participations_created_at ON campaign_participations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participations_status ON campaign_participations(status);

-- Index composite pour les requêtes de sync
CREATE INDEX IF NOT EXISTS idx_participations_org_updated 
  ON campaign_participations(organization_id, updated_at DESC);

-- ============================================
-- TRIGGER: Mise à jour automatique de updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_participation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_participation_updated_at ON campaign_participations;
CREATE TRIGGER trigger_participation_updated_at
  BEFORE UPDATE ON campaign_participations
  FOR EACH ROW
  EXECUTE FUNCTION update_participation_updated_at();

-- ============================================
-- RLS: Row Level Security
-- ============================================
ALTER TABLE campaign_participations ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes avant de les recréer
DROP POLICY IF EXISTS "Users can view own organization participations" ON campaign_participations;
DROP POLICY IF EXISTS "Users can create participations for own organization" ON campaign_participations;
DROP POLICY IF EXISTS "Users can update own organization participations" ON campaign_participations;

-- Les utilisateurs peuvent voir les participations de leur organisation
CREATE POLICY "Users can view own organization participations"
  ON campaign_participations
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer des participations pour leur organisation
CREATE POLICY "Users can create participations for own organization"
  ON campaign_participations
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
    OR 
    -- Permettre les participations publiques (via le jeu)
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_id 
      AND status = 'active'
    )
  );

-- Les utilisateurs peuvent mettre à jour les participations de leur organisation
CREATE POLICY "Users can update own organization participations"
  ON campaign_participations
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FONCTION: Statistiques de participation
-- ============================================
CREATE OR REPLACE FUNCTION get_participation_stats(p_campaign_id UUID)
RETURNS TABLE (
  total_participations BIGINT,
  unique_participants BIGINT,
  prizes_won BIGINT,
  total_points BIGINT,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_participations,
    COUNT(DISTINCT email)::BIGINT as unique_participants,
    COUNT(*) FILTER (WHERE prize_won IS NOT NULL)::BIGINT as prizes_won,
    COALESCE(SUM(points_earned), 0)::BIGINT as total_points,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE prize_won IS NOT NULL)::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM campaign_participations
  WHERE campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTAIRES
-- ============================================
COMMENT ON TABLE campaign_participations IS 'Participations des utilisateurs aux campagnes de gamification';
COMMENT ON COLUMN campaign_participations.game_result IS 'Résultat brut du jeu (JSON avec segment, score, etc.)';
COMMENT ON COLUMN campaign_participations.custom_fields IS 'Champs personnalisés du formulaire de participation';
