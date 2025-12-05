-- Fix RLS policies for organization_integrations
-- Allow authenticated users to insert/update their organization's integrations

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their organization integrations" ON organization_integrations;
DROP POLICY IF EXISTS "Admins can manage integrations" ON organization_integrations;

-- Create more permissive policies
-- SELECT: Members can view their organization's integrations
CREATE POLICY "org_integrations_select"
ON organization_integrations FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Members can create integrations for their organization
CREATE POLICY "org_integrations_insert"
ON organization_integrations FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- UPDATE: Members can update their organization's integrations
CREATE POLICY "org_integrations_update"
ON organization_integrations FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- DELETE: Only admins/owners can delete integrations
CREATE POLICY "org_integrations_delete"
ON organization_integrations FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Also fix integration_sync_logs policies
DROP POLICY IF EXISTS "Users can view sync logs" ON integration_sync_logs;

CREATE POLICY "sync_logs_insert"
ON integration_sync_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "sync_logs_select"
ON integration_sync_logs FOR SELECT
USING (
  integration_id IN (
    SELECT id FROM organization_integrations 
    WHERE organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  )
);
