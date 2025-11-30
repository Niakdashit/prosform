-- Enrichir la table campaign_participants avec plus de tracking
ALTER TABLE campaign_participants 
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT;

-- Créer des index pour améliorer les performances des requêtes analytics
CREATE INDEX IF NOT EXISTS idx_participants_country ON campaign_participants(country);
CREATE INDEX IF NOT EXISTS idx_participants_city ON campaign_participants(city);
CREATE INDEX IF NOT EXISTS idx_participants_device_type ON campaign_participants(device_type);
CREATE INDEX IF NOT EXISTS idx_participants_utm_source ON campaign_participants(utm_source);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON campaign_participants(created_at);
CREATE INDEX IF NOT EXISTS idx_participants_email ON campaign_participants(email) WHERE email IS NOT NULL;