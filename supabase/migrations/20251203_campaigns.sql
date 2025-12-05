-- ============================================
-- TABLE: Campagnes de gamification - AJOUT DE COLONNES
-- ============================================
-- Ajoute les colonnes manquantes à la table campaigns existante

-- Ajouter les colonnes si elles n'existent pas
DO $$ 
BEGIN
  -- game_config
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'game_config') THEN
    ALTER TABLE campaigns ADD COLUMN game_config JSONB DEFAULT '{}';
  END IF;
  
  -- design_config
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'design_config') THEN
    ALTER TABLE campaigns ADD COLUMN design_config JSONB DEFAULT '{}';
  END IF;
  
  -- form_config
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'form_config') THEN
    ALTER TABLE campaigns ADD COLUMN form_config JSONB DEFAULT '{}';
  END IF;
  
  -- prizes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'prizes') THEN
    ALTER TABLE campaigns ADD COLUMN prizes JSONB DEFAULT '[]';
  END IF;
  
  -- rules
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'rules') THEN
    ALTER TABLE campaigns ADD COLUMN rules JSONB DEFAULT '{}';
  END IF;
  
  -- max_participations_per_user
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'max_participations_per_user') THEN
    ALTER TABLE campaigns ADD COLUMN max_participations_per_user INTEGER;
  END IF;
  
  -- max_total_participations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'max_total_participations') THEN
    ALTER TABLE campaigns ADD COLUMN max_total_participations INTEGER;
  END IF;
  
  -- total_participations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'total_participations') THEN
    ALTER TABLE campaigns ADD COLUMN total_participations INTEGER DEFAULT 0;
  END IF;
  
  -- total_prizes_won
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'total_prizes_won') THEN
    ALTER TABLE campaigns ADD COLUMN total_prizes_won INTEGER DEFAULT 0;
  END IF;
  
  -- meta_title
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'meta_title') THEN
    ALTER TABLE campaigns ADD COLUMN meta_title TEXT;
  END IF;
  
  -- meta_description
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'meta_description') THEN
    ALTER TABLE campaigns ADD COLUMN meta_description TEXT;
  END IF;
  
  -- og_image
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'og_image') THEN
    ALTER TABLE campaigns ADD COLUMN og_image TEXT;
  END IF;
  
  -- webhook_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'webhook_url') THEN
    ALTER TABLE campaigns ADD COLUMN webhook_url TEXT;
  END IF;
  
  -- redirect_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'redirect_url') THEN
    ALTER TABLE campaigns ADD COLUMN redirect_url TEXT;
  END IF;
  
  -- published_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'published_at') THEN
    ALTER TABLE campaigns ADD COLUMN published_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================
-- INDEX (créer seulement s'ils n'existent pas)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);

-- ============================================
-- TRIGGER: Mise à jour automatique de updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_campaign_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_campaign_updated_at ON campaigns;
CREATE TRIGGER trigger_campaign_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_updated_at();

-- ============================================
-- TRIGGER: Générer un slug unique
-- ============================================
CREATE OR REPLACE FUNCTION generate_campaign_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Générer le slug de base à partir du nom
  base_slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Si pas de slug fourni, en générer un
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    final_slug := base_slug;
    
    -- Vérifier l'unicité et ajouter un suffixe si nécessaire
    WHILE EXISTS (SELECT 1 FROM campaigns WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_campaign_slug ON campaigns;
CREATE TRIGGER trigger_campaign_slug
  BEFORE INSERT OR UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION generate_campaign_slug();

-- ============================================
-- RLS: Row Level Security (DROP IF EXISTS puis CREATE)
-- ============================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes avant de les recréer
DROP POLICY IF EXISTS "Users can view own organization campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns for own organization" ON campaigns;
DROP POLICY IF EXISTS "Users can update own organization campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete own organization campaigns" ON campaigns;

-- Les utilisateurs peuvent voir les campagnes de leur organisation
CREATE POLICY "Users can view own organization campaigns"
  ON campaigns
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
    OR status = 'active' -- Les campagnes actives sont publiques
  );

-- Les utilisateurs peuvent créer des campagnes pour leur organisation
CREATE POLICY "Users can create campaigns for own organization"
  ON campaigns
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent modifier les campagnes de leur organisation
CREATE POLICY "Users can update own organization campaigns"
  ON campaigns
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent supprimer les campagnes de leur organisation
CREATE POLICY "Users can delete own organization campaigns"
  ON campaigns
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- COMMENTAIRES (seulement si les colonnes existent)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'game_config') THEN
    COMMENT ON COLUMN campaigns.game_config IS 'Configuration du jeu (segments, probabilités, etc.)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'design_config') THEN
    COMMENT ON COLUMN campaigns.design_config IS 'Configuration visuelle (couleurs, images, etc.)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'form_config') THEN
    COMMENT ON COLUMN campaigns.form_config IS 'Configuration du formulaire de participation';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'prizes') THEN
    COMMENT ON COLUMN campaigns.prizes IS 'Liste des lots avec leurs probabilités';
  END IF;
END $$;
