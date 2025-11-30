-- Add separate application title to avoid schema cache issues with `title`
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS app_title text;

-- Backfill app_title from existing title
UPDATE public.campaigns
SET app_title = title
WHERE app_title IS NULL;

-- Ensure app_title is required going forward
ALTER TABLE public.campaigns
  ALTER COLUMN app_title SET NOT NULL;

-- Relax constraints on legacy `title` so we can stop sending it from the app
ALTER TABLE public.campaigns
  ALTER COLUMN title DROP NOT NULL,
  ALTER COLUMN title SET DEFAULT '';

-- Refresh PostgREST schema cache
COMMENT ON COLUMN public.campaigns.app_title IS 'Application-facing campaign title';
NOTIFY pgrst, 'reload schema';