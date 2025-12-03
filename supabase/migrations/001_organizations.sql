-- ============================================
-- MIGRATION: Système Multi-Organisations
-- ============================================

-- 1. Table des organisations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  plan_expires_at TIMESTAMPTZ,
  max_members INTEGER DEFAULT 1,
  max_campaigns INTEGER DEFAULT 5,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des membres d'organisation
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- 3. Table des invitations en attente
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_super_admin BOOLEAN DEFAULT FALSE,
  current_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ajouter les colonnes à la table campaigns existante
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'organization_id') THEN
    ALTER TABLE campaigns ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'created_by') THEN
    ALTER TABLE campaigns ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_org ON user_profiles(current_organization_id);

-- 7. Fonction pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convertir en slug (minuscules, remplacer espaces par tirets, supprimer caractères spéciaux)
  base_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := substring(base_slug from 1 for 50);
  
  final_slug := base_slug;
  
  -- Vérifier l'unicité et ajouter un suffixe si nécessaire
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 8. Fonction pour créer une organisation avec son owner
CREATE OR REPLACE FUNCTION create_organization_with_owner(
  org_name TEXT,
  owner_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
BEGIN
  -- Générer le slug
  org_slug := generate_unique_slug(org_name);
  
  -- Créer l'organisation
  INSERT INTO organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO new_org_id;
  
  -- Ajouter l'utilisateur comme owner
  INSERT INTO organization_members (organization_id, user_id, role, joined_at)
  VALUES (new_org_id, owner_user_id, 'owner', NOW());
  
  -- Mettre à jour le profil utilisateur avec l'organisation courante
  INSERT INTO user_profiles (id, current_organization_id)
  VALUES (owner_user_id, new_org_id)
  ON CONFLICT (id) DO UPDATE SET current_organization_id = new_org_id;
  
  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Fonction trigger pour créer un profil utilisateur à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_name TEXT;
BEGIN
  -- Récupérer le nom de l'utilisateur
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Créer le profil utilisateur
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    user_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Créer une organisation personnelle pour l'utilisateur
  new_org_id := create_organization_with_owner(
    user_name || '''s Organization',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 11. Fonction pour vérifier les permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_organization_id UUID,
  p_required_roles TEXT[]
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super admin a toutes les permissions
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id AND is_super_admin = TRUE) THEN
    RETURN TRUE;
  END IF;
  
  -- Vérifier le rôle dans l'organisation
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = p_user_id
    AND organization_id = p_organization_id
    AND role = ANY(p_required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Fonction pour obtenir l'organisation courante d'un utilisateur
CREATE OR REPLACE FUNCTION get_current_organization(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Récupérer l'organisation courante du profil
  SELECT current_organization_id INTO org_id
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Si pas d'organisation courante, prendre la première
  IF org_id IS NULL THEN
    SELECT organization_id INTO org_id
    FROM organization_members
    WHERE user_id = p_user_id
    ORDER BY joined_at ASC
    LIMIT 1;
    
    -- Mettre à jour le profil
    IF org_id IS NOT NULL THEN
      UPDATE user_profiles SET current_organization_id = org_id WHERE id = p_user_id;
    END IF;
  END IF;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Activer RLS sur les nouvelles tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Policies pour organizations
CREATE POLICY "Users can view their organizations"
ON organizations FOR SELECT
USING (
  id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
);

CREATE POLICY "Owners can update their organization"
ON organizations FOR UPDATE
USING (
  check_user_permission(auth.uid(), id, ARRAY['owner'])
);

CREATE POLICY "Super admins can insert organizations"
ON organizations FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
);

CREATE POLICY "Owners can delete their organization"
ON organizations FOR DELETE
USING (
  check_user_permission(auth.uid(), id, ARRAY['owner'])
);

-- Policies pour organization_members
CREATE POLICY "Members can view their organization members"
ON organization_members FOR SELECT
USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
);

CREATE POLICY "Admins can manage members"
ON organization_members FOR INSERT
WITH CHECK (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin'])
);

CREATE POLICY "Admins can update members"
ON organization_members FOR UPDATE
USING (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin'])
  AND (
    -- Ne peut pas modifier un owner sauf si on est owner
    role != 'owner' OR check_user_permission(auth.uid(), organization_id, ARRAY['owner'])
  )
);

CREATE POLICY "Admins can remove members"
ON organization_members FOR DELETE
USING (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin'])
  AND role != 'owner' -- Ne peut pas supprimer un owner
);

-- Policies pour organization_invitations
CREATE POLICY "Admins can view invitations"
ON organization_invitations FOR SELECT
USING (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin'])
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins can create invitations"
ON organization_invitations FOR INSERT
WITH CHECK (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin'])
);

CREATE POLICY "Admins can delete invitations"
ON organization_invitations FOR DELETE
USING (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin'])
);

-- Policies pour user_profiles
CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (
  id = auth.uid()
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
);

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND (is_super_admin = FALSE OR is_super_admin = (SELECT is_super_admin FROM user_profiles WHERE id = auth.uid()))
);

CREATE POLICY "System can insert profiles"
ON user_profiles FOR INSERT
WITH CHECK (TRUE);

-- Policies pour campaigns (mise à jour)
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can view published campaigns" ON campaigns;

CREATE POLICY "Members can view organization campaigns"
ON campaigns FOR SELECT
USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  OR status = 'online' -- Campagnes publiées visibles publiquement
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
);

CREATE POLICY "Members can create campaigns"
ON campaigns FOR INSERT
WITH CHECK (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin', 'member'])
);

CREATE POLICY "Members can update organization campaigns"
ON campaigns FOR UPDATE
USING (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin', 'member'])
);

CREATE POLICY "Admins can delete campaigns"
ON campaigns FOR DELETE
USING (
  check_user_permission(auth.uid(), organization_id, ARRAY['owner', 'admin'])
);

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Créer ton compte super admin (à exécuter après ton inscription)
-- UPDATE user_profiles SET is_super_admin = TRUE WHERE id = 'TON_USER_ID';
