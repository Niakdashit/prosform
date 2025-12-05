-- ============================================
-- MIGRATION: Système d'Intégrations CRM & Marketing
-- ============================================

-- 1. Types d'intégrations supportées (créer seulement si n'existe pas)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_provider') THEN
    CREATE TYPE integration_provider AS ENUM (
      'hubspot', 'salesforce', 'pipedrive', 'zoho_crm', 'freshsales', 'copper', 'close', 'insightly',
      'mailchimp', 'klaviyo', 'activecampaign', 'sendinblue', 'convertkit', 'drip',
      'shopify', 'woocommerce', 'bigcommerce', 'magento',
      'intercom', 'zendesk', 'freshdesk', 'crisp',
      'segment', 'mixpanel', 'amplitude', 'google_analytics',
      'zapier', 'make', 'n8n', 'webhook', 'api'
    );
  END IF;
END $$;

-- 2. Statut de connexion (créer seulement si n'existe pas)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_status') THEN
    CREATE TYPE integration_status AS ENUM (
      'pending', 'connected', 'disconnected', 'error', 'expired'
    );
  END IF;
END $$;

-- 3. Table principale des intégrations par organisation
CREATE TABLE IF NOT EXISTS organization_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider integration_provider NOT NULL,
  name VARCHAR(255) NOT NULL,
  status integration_status DEFAULT 'pending',
  
  -- Credentials (chiffrés)
  credentials JSONB DEFAULT '{}', -- access_token, refresh_token, api_key, etc.
  
  -- Configuration spécifique au provider
  config JSONB DEFAULT '{}', -- portal_id, instance_url, etc.
  
  -- Métadonnées
  connected_by UUID REFERENCES auth.users(id),
  connected_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  expires_at TIMESTAMPTZ, -- Pour les tokens OAuth
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Une seule intégration par provider par organisation
  UNIQUE(organization_id, provider)
);

-- 4. Table des mappings de champs (pour synchroniser les données)
CREATE TABLE IF NOT EXISTS integration_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  
  -- Champ source (notre système)
  source_field VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- 'form_field', 'participant', 'campaign', 'prize'
  
  -- Champ destination (CRM)
  destination_field VARCHAR(255) NOT NULL,
  destination_object VARCHAR(100) NOT NULL, -- 'contact', 'deal', 'lead', 'company'
  
  -- Transformation optionnelle
  transform_type VARCHAR(50), -- 'direct', 'format_date', 'uppercase', 'lowercase', 'custom'
  transform_config JSONB DEFAULT '{}',
  
  -- Ordre et activation
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table des actions d'intégration par campagne
CREATE TABLE IF NOT EXISTS campaign_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  
  -- Type d'action
  action_type VARCHAR(50) NOT NULL, -- 'create_contact', 'update_contact', 'create_deal', 'add_to_list', 'trigger_workflow'
  
  -- Quand déclencher
  trigger_event VARCHAR(50) NOT NULL, -- 'on_submit', 'on_win', 'on_lose', 'on_complete', 'on_optin'
  
  -- Configuration de l'action
  action_config JSONB DEFAULT '{}', -- list_id, pipeline_id, workflow_id, tags, etc.
  
  -- Conditions optionnelles
  conditions JSONB DEFAULT '[]', -- Conditions pour déclencher l'action
  
  -- Activation
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table des logs de synchronisation
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Détails de la sync
  action_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'partial'
  
  -- Données envoyées/reçues
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  
  -- Métriques
  records_processed INTEGER DEFAULT 0,
  records_success INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  duration_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table des webhooks personnalisés
CREATE TABLE IF NOT EXISTS custom_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  method VARCHAR(10) DEFAULT 'POST',
  
  -- Headers personnalisés
  headers JSONB DEFAULT '{}',
  
  -- Authentification
  auth_type VARCHAR(20), -- 'none', 'basic', 'bearer', 'api_key', 'hmac'
  auth_config JSONB DEFAULT '{}',
  
  -- Payload template
  payload_template JSONB,
  
  -- Événements déclencheurs
  trigger_events TEXT[] DEFAULT ARRAY['on_submit'],
  
  -- Retry configuration
  retry_count INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  
  -- Statut
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  last_status VARCHAR(20),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table des tokens OAuth (pour le flow OAuth)
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider integration_provider NOT NULL,
  state VARCHAR(255) UNIQUE NOT NULL,
  redirect_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEX POUR LES PERFORMANCES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_org_integrations_org ON organization_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_integrations_provider ON organization_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_org_integrations_status ON organization_integrations(status);
CREATE INDEX IF NOT EXISTS idx_field_mappings_integration ON integration_field_mappings(integration_id);
CREATE INDEX IF NOT EXISTS idx_campaign_integrations_campaign ON campaign_integrations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_integrations_integration ON campaign_integrations(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration ON integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON integration_sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_org ON custom_webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_campaign ON custom_webhooks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour vérifier si une intégration est connectée
CREATE OR REPLACE FUNCTION is_integration_connected(
  p_organization_id UUID,
  p_provider integration_provider
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_integrations
    WHERE organization_id = p_organization_id
    AND provider = p_provider
    AND status = 'connected'
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les intégrations actives d'une campagne
CREATE OR REPLACE FUNCTION get_campaign_active_integrations(p_campaign_id UUID)
RETURNS TABLE (
  integration_id UUID,
  provider integration_provider,
  action_type VARCHAR,
  trigger_event VARCHAR,
  action_config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.integration_id,
    oi.provider,
    ci.action_type,
    ci.trigger_event,
    ci.action_config
  FROM campaign_integrations ci
  JOIN organization_integrations oi ON ci.integration_id = oi.id
  WHERE ci.campaign_id = p_campaign_id
  AND ci.is_active = TRUE
  AND oi.status = 'connected';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organization_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their organization integrations" ON organization_integrations;
DROP POLICY IF EXISTS "Admins can manage integrations" ON organization_integrations;
DROP POLICY IF EXISTS "Users can view field mappings" ON integration_field_mappings;
DROP POLICY IF EXISTS "Admins can manage field mappings" ON integration_field_mappings;
DROP POLICY IF EXISTS "Users can view campaign integrations" ON campaign_integrations;
DROP POLICY IF EXISTS "Admins can manage campaign integrations" ON campaign_integrations;
DROP POLICY IF EXISTS "Users can view sync logs" ON integration_sync_logs;
DROP POLICY IF EXISTS "Users can view webhooks" ON custom_webhooks;
DROP POLICY IF EXISTS "Admins can manage webhooks" ON custom_webhooks;
DROP POLICY IF EXISTS "Users can manage their oauth states" ON oauth_states;

-- Policies pour organization_integrations
CREATE POLICY "Users can view their organization integrations"
ON organization_integrations FOR SELECT
USING (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin', 'member'])
);

CREATE POLICY "Admins can manage integrations"
ON organization_integrations FOR ALL
USING (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin'])
);

-- Policies pour integration_field_mappings
CREATE POLICY "Users can view field mappings"
ON integration_field_mappings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_integrations oi
    WHERE oi.id = integration_field_mappings.integration_id
    AND check_user_permission(auth.uid(), oi.organization_id, ARRAY['owner', 'admin', 'member'])
  )
);

CREATE POLICY "Admins can manage field mappings"
ON integration_field_mappings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM organization_integrations oi
    WHERE oi.id = integration_field_mappings.integration_id
    AND check_user_permission(auth.uid(), oi.organization_id, ARRAY['owner', 'admin'])
  )
);

-- Policies pour campaign_integrations
CREATE POLICY "Users can view campaign integrations"
ON campaign_integrations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.id = campaign_integrations.campaign_id
    AND check_user_permission(auth.uid(), c.organization_id, ARRAY['owner', 'admin', 'member'])
  )
);

CREATE POLICY "Admins can manage campaign integrations"
ON campaign_integrations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.id = campaign_integrations.campaign_id
    AND check_user_permission(auth.uid(), c.organization_id, ARRAY['owner', 'admin'])
  )
);

-- Policies pour integration_sync_logs
CREATE POLICY "Users can view sync logs"
ON integration_sync_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_integrations oi
    WHERE oi.id = integration_sync_logs.integration_id
    AND check_user_permission(auth.uid(), oi.organization_id, ARRAY['owner', 'admin', 'member'])
  )
);

-- Policies pour custom_webhooks
CREATE POLICY "Users can view webhooks"
ON custom_webhooks FOR SELECT
USING (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin', 'member'])
);

CREATE POLICY "Admins can manage webhooks"
ON custom_webhooks FOR ALL
USING (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin'])
);

-- Policies pour oauth_states
CREATE POLICY "Users can manage their oauth states"
ON oauth_states FOR ALL
USING (user_id = auth.uid());

-- ============================================
-- TRIGGER POUR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_org_integrations_updated_at ON organization_integrations;
CREATE TRIGGER trigger_org_integrations_updated_at
  BEFORE UPDATE ON organization_integrations
  FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at();

DROP TRIGGER IF EXISTS trigger_field_mappings_updated_at ON integration_field_mappings;
CREATE TRIGGER trigger_field_mappings_updated_at
  BEFORE UPDATE ON integration_field_mappings
  FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at();

DROP TRIGGER IF EXISTS trigger_campaign_integrations_updated_at ON campaign_integrations;
CREATE TRIGGER trigger_campaign_integrations_updated_at
  BEFORE UPDATE ON campaign_integrations
  FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at();

DROP TRIGGER IF EXISTS trigger_webhooks_updated_at ON custom_webhooks;
CREATE TRIGGER trigger_webhooks_updated_at
  BEFORE UPDATE ON custom_webhooks
  FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at();
