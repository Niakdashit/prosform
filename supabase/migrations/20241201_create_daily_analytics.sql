-- Migration: Create daily_analytics table for real time series data
-- This replaces the estimated views calculation with actual tracked data

-- Create daily_analytics table
CREATE TABLE IF NOT EXISTS public.daily_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    participations INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_spent INTEGER DEFAULT 0,
    time_spent_count INTEGER DEFAULT 0, -- Counter for calculating real average
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint on campaign_id + date
    UNIQUE(campaign_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_analytics_campaign_date 
ON public.daily_analytics(campaign_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_analytics_date 
ON public.daily_analytics(date DESC);

-- Enable RLS
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (same as other analytics tables)
CREATE POLICY "Allow all operations for authenticated users" 
ON public.daily_analytics 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create policy for anon users (for public campaign access)
CREATE POLICY "Allow insert for anon users" 
ON public.daily_analytics 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow update for anon users" 
ON public.daily_analytics 
FOR UPDATE 
TO anon 
USING (true) 
WITH CHECK (true);

-- Function to increment daily analytics
CREATE OR REPLACE FUNCTION increment_daily_analytics(
    p_campaign_id UUID,
    p_views INTEGER DEFAULT 0,
    p_participations INTEGER DEFAULT 0,
    p_completions INTEGER DEFAULT 0,
    p_time_spent INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    today DATE := CURRENT_DATE;
BEGIN
    INSERT INTO public.daily_analytics (campaign_id, date, views, participations, completions, avg_time_spent, time_spent_count)
    VALUES (p_campaign_id, today, p_views, p_participations, p_completions, p_time_spent, CASE WHEN p_time_spent > 0 THEN 1 ELSE 0 END)
    ON CONFLICT (campaign_id, date)
    DO UPDATE SET
        views = daily_analytics.views + EXCLUDED.views,
        participations = daily_analytics.participations + EXCLUDED.participations,
        completions = daily_analytics.completions + EXCLUDED.completions,
        time_spent_count = daily_analytics.time_spent_count + CASE WHEN p_time_spent > 0 THEN 1 ELSE 0 END,
        avg_time_spent = CASE 
            WHEN daily_analytics.time_spent_count + CASE WHEN p_time_spent > 0 THEN 1 ELSE 0 END > 0 
            THEN ((daily_analytics.avg_time_spent * daily_analytics.time_spent_count) + p_time_spent) / 
                 (daily_analytics.time_spent_count + CASE WHEN p_time_spent > 0 THEN 1 ELSE 0 END)
            ELSE daily_analytics.avg_time_spent
        END,
        updated_at = NOW();
END;
$$;

-- Comment on table
COMMENT ON TABLE public.daily_analytics IS 'Daily aggregated analytics for campaigns - stores real tracked data instead of estimates';
