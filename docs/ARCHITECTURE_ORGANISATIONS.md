# Architecture Multi-Organisations - Prosplay

## 🏗️ Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN (toi)                        │
│         Accès total à toutes les organisations                  │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Organisation │     │  Organisation │     │  Organisation │
│   "Acme Inc"  │     │  "TechCorp"   │     │   "StartupX"  │
└───────────────┘     └───────────────┘     └───────────────┘
        │
        ├── Owner (propriétaire)
        │     └── Accès total à l'organisation
        │
        ├── Admin (administrateur)
        │     └── Gère les membres, campagnes, paramètres
        │
        ├── Member (membre)
        │     └── Crée et édite les campagnes
        │
        └── Viewer (observateur)
              └── Lecture seule
```

## 📊 Hiérarchie des rôles

### 1. Super Admin (Niveau Global)
- **Qui** : Toi uniquement
- **Permissions** :
  - ✅ Voir toutes les organisations
  - ✅ Créer/supprimer des organisations
  - ✅ Accéder à n'importe quelle organisation
  - ✅ Gérer les abonnements et la facturation
  - ✅ Voir les statistiques globales
  - ✅ Impersonner n'importe quel utilisateur

### 2. Owner (Propriétaire d'organisation)
- **Qui** : Le client qui a créé/acheté l'abonnement
- **Permissions** :
  - ✅ Toutes les permissions Admin
  - ✅ Supprimer l'organisation
  - ✅ Transférer la propriété
  - ✅ Gérer l'abonnement de l'organisation
  - ✅ Promouvoir des Admins

### 3. Admin (Administrateur)
- **Qui** : Managers désignés par l'Owner
- **Permissions** :
  - ✅ Toutes les permissions Member
  - ✅ Inviter/supprimer des membres
  - ✅ Modifier les rôles (sauf Owner)
  - ✅ Gérer les paramètres de l'organisation
  - ✅ Voir les statistiques de l'organisation
  - ❌ Ne peut pas supprimer l'organisation

### 4. Member (Membre)
- **Qui** : Employés qui créent du contenu
- **Permissions** :
  - ✅ Créer des campagnes
  - ✅ Éditer ses propres campagnes
  - ✅ Éditer les campagnes de l'organisation (partagées)
  - ✅ Voir les statistiques des campagnes
  - ✅ Gérer les médias
  - ❌ Ne peut pas gérer les membres

### 5. Viewer (Observateur)
- **Qui** : Personnes en lecture seule (clients, partenaires)
- **Permissions** :
  - ✅ Voir les campagnes
  - ✅ Voir les statistiques
  - ❌ Ne peut rien créer ni modifier

## 🗄️ Structure de la base de données

### Tables principales

```sql
-- Organisations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  plan VARCHAR(50) DEFAULT 'free', -- free, starter, pro, enterprise
  plan_expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membres d'organisation
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Invitations en attente
CREATE TABLE organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profils utilisateurs (extension de auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_super_admin BOOLEAN DEFAULT FALSE,
  current_organization_id UUID REFERENCES organizations(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modifier la table campaigns existante
ALTER TABLE campaigns ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE campaigns ADD COLUMN created_by UUID REFERENCES auth.users(id);
```

### Index pour les performances

```sql
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX idx_invitations_email ON organization_invitations(email);
CREATE INDEX idx_invitations_token ON organization_invitations(token);
```

## 🔐 Row Level Security (RLS)

### Organisations

```sql
-- Les membres peuvent voir leur organisation
CREATE POLICY "Members can view their organization"
ON organizations FOR SELECT
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
  OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
);

-- Seuls les owners peuvent modifier leur organisation
CREATE POLICY "Owners can update their organization"
ON organizations FOR UPDATE
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role = 'owner'
  )
  OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
);
```

### Campagnes (partagées au sein de l'organisation)

```sql
-- Tous les membres voient les campagnes de leur organisation
CREATE POLICY "Members can view organization campaigns"
ON campaigns FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Members et au-dessus peuvent créer des campagnes
CREATE POLICY "Members can create campaigns"
ON campaigns FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
  )
);

-- Members et au-dessus peuvent modifier les campagnes
CREATE POLICY "Members can update organization campaigns"
ON campaigns FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
  )
);
```

## 🎯 Flux utilisateur

### Inscription d'une nouvelle organisation

1. Utilisateur s'inscrit via `/signup`
2. Création automatique d'une organisation personnelle
3. L'utilisateur devient `owner` de cette organisation
4. Redirection vers `/onboarding` pour configurer l'organisation

### Invitation d'un membre

1. Admin/Owner va dans Paramètres > Équipe
2. Entre l'email et sélectionne le rôle
3. Email d'invitation envoyé avec lien unique
4. Le destinataire clique et rejoint l'organisation

### Changement d'organisation

1. Utilisateur clique sur le sélecteur d'organisation (header)
2. Voit la liste de ses organisations
3. Sélectionne une organisation
4. Le contexte change (campagnes, stats, etc.)

## 📁 Structure des fichiers

```
src/
├── contexts/
│   ├── AuthContext.tsx          # Authentification
│   └── OrganizationContext.tsx  # Organisation courante
├── hooks/
│   ├── useOrganization.ts       # Hook organisation
│   ├── useOrganizationMembers.ts
│   └── usePermissions.ts        # Vérification des permissions
├── services/
│   ├── OrganizationService.ts
│   ├── InvitationService.ts
│   └── MemberService.ts
├── pages/
│   ├── settings/
│   │   ├── Team.tsx             # Gestion équipe
│   │   ├── Organization.tsx     # Paramètres org
│   │   └── Billing.tsx          # Abonnement
│   └── admin/                   # Super Admin uniquement
│       ├── Organizations.tsx
│       └── Users.tsx
├── components/
│   ├── OrganizationSwitcher.tsx # Sélecteur d'org
│   ├── InviteMemberModal.tsx
│   ├── MembersList.tsx
│   └── RoleBadge.tsx
└── types/
    └── organization.ts
```

## 🚀 Prochaines étapes

1. **Phase 1** : Créer les tables SQL dans Supabase
2. **Phase 2** : Créer le contexte OrganizationContext
3. **Phase 3** : Modifier les requêtes pour filtrer par organisation
4. **Phase 4** : Créer les pages de gestion d'équipe
5. **Phase 5** : Implémenter le système d'invitations
6. **Phase 6** : Créer le dashboard Super Admin
