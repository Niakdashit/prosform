-- Allow builder (public client) to create and update campaigns without being authenticated
CREATE POLICY "Builder can insert campaigns"
ON public.campaigns
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Builder can update campaigns"
ON public.campaigns
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);