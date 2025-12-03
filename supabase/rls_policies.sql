-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Execute this SQL in your Supabase SQL Editor
-- ============================================

-- Enable RLS on campaigns table
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own campaigns
CREATE POLICY "Users can insert own campaigns" ON campaigns
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own campaigns
CREATE POLICY "Users can update own campaigns" ON campaigns
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns" ON campaigns
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Anyone can view published campaigns (for public URLs)
-- Note: Using status = 'online' instead of is_published if column doesn't exist
CREATE POLICY "Anyone can view published campaigns" ON campaigns
    FOR SELECT
    USING (status = 'online');

-- ============================================
-- PARTICIPATIONS TABLE (if exists)
-- ============================================

-- Enable RLS on participations table (if it exists)
-- ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert participations (public participation)
-- CREATE POLICY "Anyone can participate" ON participations
--     FOR INSERT
--     WITH CHECK (true);

-- Policy: Campaign owners can view participations for their campaigns
-- CREATE POLICY "Owners can view participations" ON participations
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM campaigns 
--             WHERE campaigns.id = participations.campaign_id 
--             AND campaigns.user_id = auth.uid()
--         )
--     );

-- ============================================
-- CONTACTS TABLE (if exists)
-- ============================================

-- Enable RLS on contacts table (if it exists)
-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see contacts from their campaigns
-- CREATE POLICY "Users can view own contacts" ON contacts
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM campaigns 
--             WHERE campaigns.id = contacts.campaign_id 
--             AND campaigns.user_id = auth.uid()
--         )
--     );

-- ============================================
-- HELPER FUNCTION: Get current user ID
-- ============================================

-- Create a function to get the current user's ID
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS uuid 
LANGUAGE sql 
STABLE
AS $$
  SELECT auth.uid()
$$;

-- ============================================
-- STORAGE POLICIES (for media uploads)
-- ============================================

-- Create a storage bucket for campaign media (if not exists)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('campaign-media', 'campaign-media', true)
-- ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload to their own folder
-- CREATE POLICY "Users can upload own media" ON storage.objects
--     FOR INSERT
--     WITH CHECK (
--         bucket_id = 'campaign-media' 
--         AND (storage.foldername(name))[1] = auth.uid()::text
--     );

-- Policy: Users can view their own media
-- CREATE POLICY "Users can view own media" ON storage.objects
--     FOR SELECT
--     USING (
--         bucket_id = 'campaign-media' 
--         AND (storage.foldername(name))[1] = auth.uid()::text
--     );

-- Policy: Anyone can view public campaign media
-- CREATE POLICY "Public can view campaign media" ON storage.objects
--     FOR SELECT
--     USING (bucket_id = 'campaign-media');
