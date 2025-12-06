-- Migration pour les tables Google Review
-- Créée le 2024-12-06

-- Table pour stocker les avis Google (positifs/négatifs)
CREATE TABLE IF NOT EXISTS google_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    participant_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_google_redirect BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Métadonnées
    user_agent TEXT,
    ip_address INET
);

-- Table pour stocker les QR codes pré-générés
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    prize_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    qr_image TEXT, -- Base64 ou URL de l'image QR
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    used_by TEXT, -- ID du participant
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index pour les recherches rapides
    CONSTRAINT qr_codes_code_unique UNIQUE (campaign_id, code)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_google_reviews_campaign ON google_reviews(campaign_id);
CREATE INDEX IF NOT EXISTS idx_google_reviews_created ON google_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_codes_campaign ON qr_codes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_prize ON qr_codes(prize_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_used ON qr_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);

-- Politiques RLS pour google_reviews
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent voir les avis de leurs campagnes
CREATE POLICY "Users can view reviews for their campaigns" ON google_reviews
    FOR SELECT
    USING (
        campaign_id IN (
            SELECT id FROM campaigns 
            WHERE user_id = auth.uid()
            OR organization_id IN (
                SELECT organization_id FROM organization_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Tout le monde peut créer un avis (participants publics)
CREATE POLICY "Anyone can create reviews" ON google_reviews
    FOR INSERT
    WITH CHECK (true);

-- Politiques RLS pour qr_codes
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent gérer les QR codes de leurs campagnes
CREATE POLICY "Users can manage QR codes for their campaigns" ON qr_codes
    FOR ALL
    USING (
        campaign_id IN (
            SELECT id FROM campaigns 
            WHERE user_id = auth.uid()
            OR organization_id IN (
                SELECT organization_id FROM organization_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Tout le monde peut lire les QR codes (pour vérification)
CREATE POLICY "Anyone can verify QR codes" ON qr_codes
    FOR SELECT
    USING (true);

-- Fonction pour vérifier et utiliser un QR code
CREATE OR REPLACE FUNCTION verify_and_use_qr_code(
    p_campaign_id UUID,
    p_code TEXT,
    p_participant_id TEXT
) RETURNS JSONB AS $$
DECLARE
    v_qr_code RECORD;
    v_result JSONB;
BEGIN
    -- Chercher le QR code
    SELECT * INTO v_qr_code 
    FROM qr_codes 
    WHERE campaign_id = p_campaign_id AND code = p_code;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'QR code non trouvé'
        );
    END IF;
    
    IF v_qr_code.is_used THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'QR code déjà utilisé',
            'used_at', v_qr_code.used_at,
            'used_by', v_qr_code.used_by
        );
    END IF;
    
    -- Marquer comme utilisé
    UPDATE qr_codes 
    SET is_used = true, used_at = NOW(), used_by = p_participant_id
    WHERE id = v_qr_code.id;
    
    RETURN jsonb_build_object(
        'success', true,
        'prize_id', v_qr_code.prize_id,
        'code', v_qr_code.code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour les statistiques des avis
CREATE OR REPLACE VIEW google_review_stats AS
SELECT 
    campaign_id,
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE is_google_redirect = true) as google_redirects,
    COUNT(*) FILTER (WHERE is_google_redirect = false) as internal_reviews,
    AVG(rating)::NUMERIC(3,2) as average_rating,
    COUNT(*) FILTER (WHERE rating <= 2) as negative_reviews,
    COUNT(*) FILTER (WHERE rating >= 4) as positive_reviews,
    MIN(created_at) as first_review_at,
    MAX(created_at) as last_review_at
FROM google_reviews
GROUP BY campaign_id;

-- Vue pour les statistiques des QR codes
CREATE OR REPLACE VIEW qr_code_stats AS
SELECT 
    campaign_id,
    prize_id,
    COUNT(*) as total_codes,
    COUNT(*) FILTER (WHERE is_used = true) as used_codes,
    COUNT(*) FILTER (WHERE is_used = false) as available_codes,
    MIN(created_at) as first_created_at,
    MAX(used_at) as last_used_at
FROM qr_codes
GROUP BY campaign_id, prize_id;

-- Commentaires pour la documentation
COMMENT ON TABLE google_reviews IS 'Stocke les avis Google Review (positifs redirigés vers Google, négatifs gardés en interne)';
COMMENT ON TABLE qr_codes IS 'QR codes pré-générés pour les lots du parcours Google Review';
COMMENT ON FUNCTION verify_and_use_qr_code IS 'Vérifie un QR code et le marque comme utilisé si valide';
