-- Force PostgREST schema cache refresh for campaigns.title
COMMENT ON COLUMN public.campaigns.title IS 'Campaign title';

-- Also touch status to be safe
COMMENT ON COLUMN public.campaigns.status IS 'Campaign status';

-- Ask PostgREST to reload schema
NOTIFY pgrst, 'reload schema';