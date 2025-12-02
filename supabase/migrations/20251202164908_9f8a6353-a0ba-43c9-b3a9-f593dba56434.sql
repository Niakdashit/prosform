-- Add 'catalog' to the campaign_type enum
ALTER TYPE public.campaign_type ADD VALUE IF NOT EXISTS 'catalog';