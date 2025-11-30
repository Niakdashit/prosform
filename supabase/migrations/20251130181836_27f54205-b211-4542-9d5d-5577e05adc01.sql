-- Relax RLS on campaigns to allow anonymous usage from the builder while keeping existing behavior for authenticated users
ALTER POLICY "Users can insert their own campaigns"
ON public.campaigns
TO public
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

ALTER POLICY "Users can update their own campaigns"
ON public.campaigns
TO public
USING (auth.uid() = user_id OR auth.uid() IS NULL);
