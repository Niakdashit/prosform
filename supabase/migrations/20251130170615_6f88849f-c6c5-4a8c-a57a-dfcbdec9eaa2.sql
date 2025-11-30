-- Force PostgREST schema cache reload for app_title column
COMMENT ON COLUMN public.campaigns.app_title IS 'Application-facing campaign title (updated)';

-- Force PostgREST to reload schema immediately
NOTIFY pgrst, 'reload schema';