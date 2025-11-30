-- Force PostgREST schema cache refresh by adding comments to date columns
COMMENT ON COLUMN public.campaigns.starts_at IS 'Campaign start date and time';
COMMENT ON COLUMN public.campaigns.ends_at IS 'Campaign end date and time';

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';