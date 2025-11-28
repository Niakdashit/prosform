-- Add publication fields to campaigns
ALTER TABLE public.campaigns 
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_url_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS participation_limit INTEGER,
  ADD COLUMN IF NOT EXISTS participation_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

-- Index for public URL lookup
CREATE INDEX idx_campaigns_public_url ON public.campaigns(public_url_slug) WHERE is_published = true;

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_campaign_slug(campaign_title TEXT, campaign_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title
  base_slug := lower(regexp_replace(campaign_title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := substring(base_slug from 1 for 50);
  
  -- Add random suffix
  final_slug := base_slug || '-' || substring(campaign_id::text from 1 for 8);
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM campaigns WHERE public_url_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || substring(campaign_id::text from 1 for 8) || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- RLS policy for public campaign access
CREATE POLICY "Anyone can view published campaigns"
  ON public.campaigns FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

-- Update existing policy name to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;

-- Re-create the user policy with new name
CREATE POLICY "Campaign owners can view their campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);