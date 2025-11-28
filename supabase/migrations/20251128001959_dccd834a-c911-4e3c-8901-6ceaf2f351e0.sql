-- Table pour les participations bloquées (anti-fraude)
CREATE TABLE public.blocked_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  email TEXT,
  ip_address TEXT,
  device_fingerprint TEXT,
  block_reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Index pour recherche rapide
CREATE INDEX idx_blocked_participations_campaign ON public.blocked_participations(campaign_id);
CREATE INDEX idx_blocked_participations_email ON public.blocked_participations(email);
CREATE INDEX idx_blocked_participations_ip ON public.blocked_participations(ip_address);
CREATE INDEX idx_blocked_participations_fingerprint ON public.blocked_participations(device_fingerprint);

-- Table pour les logs d'export RGPD
CREATE TABLE public.gdpr_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  export_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  file_url TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Table pour les consentements RGPD
CREATE TABLE public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  participant_email TEXT,
  analytics_cookies BOOLEAN DEFAULT false,
  marketing_cookies BOOLEAN DEFAULT false,
  functional_cookies BOOLEAN DEFAULT true,
  consent_given_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.blocked_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_participations
CREATE POLICY "Campaign owners can view blocked participations"
  ON public.blocked_participations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = blocked_participations.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert blocked participations"
  ON public.blocked_participations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for gdpr_exports
CREATE POLICY "Users can view their own exports"
  ON public.gdpr_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can request their own exports"
  ON public.gdpr_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_consents
CREATE POLICY "Anyone can insert consent"
  ON public.user_consents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own consents"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id OR participant_email = auth.jwt()->>'email');

-- Create trigger for campaigns table
CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_user_consents_email ON public.user_consents(participant_email);
CREATE INDEX idx_gdpr_exports_user ON public.gdpr_exports(user_id);