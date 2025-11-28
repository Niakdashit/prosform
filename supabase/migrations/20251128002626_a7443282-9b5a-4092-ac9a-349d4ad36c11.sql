-- Fix search_path for generate_campaign_slug function
CREATE OR REPLACE FUNCTION generate_campaign_slug(campaign_title TEXT, campaign_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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