// Types pour le système multi-organisations

export type OrganizationPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: OrganizationPlan;
  plan_expires_at: string | null;
  max_members: number;
  max_campaigns: number;
  settings: OrganizationSettings;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  branding?: {
    primary_color?: string;
    logo_url?: string;
  };
  features?: {
    custom_domain?: boolean;
    white_label?: boolean;
    api_access?: boolean;
  };
  notifications?: {
    email_reports?: boolean;
    slack_webhook?: string;
  };
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  invited_by: string | null;
  invited_at: string;
  joined_at: string | null;
  created_at: string;
  // Relations
  user?: UserProfile;
  organization?: Organization;
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: Exclude<MemberRole, 'owner'>;
  token: string;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  // Relations
  organization?: Organization;
  inviter?: UserProfile;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  current_organization_id: string | null;
  settings: UserSettings;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  current_organization?: Organization;
  memberships?: OrganizationMember[];
}

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
}

// Permissions par rôle
export const ROLE_PERMISSIONS: Record<MemberRole, string[]> = {
  owner: [
    'organization:delete',
    'organization:update',
    'organization:transfer',
    'billing:manage',
    'members:invite',
    'members:remove',
    'members:update_role',
    'campaigns:create',
    'campaigns:update',
    'campaigns:delete',
    'campaigns:publish',
    'stats:view',
    'settings:update',
  ],
  admin: [
    'organization:update',
    'members:invite',
    'members:remove',
    'members:update_role',
    'campaigns:create',
    'campaigns:update',
    'campaigns:delete',
    'campaigns:publish',
    'stats:view',
    'settings:update',
  ],
  member: [
    'campaigns:create',
    'campaigns:update',
    'campaigns:publish',
    'stats:view',
  ],
  viewer: [
    'campaigns:view',
    'stats:view',
  ],
};

// Limites par plan
export const PLAN_LIMITS: Record<OrganizationPlan, { members: number; campaigns: number; features: string[] }> = {
  free: {
    members: 1,
    campaigns: 5,
    features: ['basic_campaigns', 'basic_stats'],
  },
  starter: {
    members: 5,
    campaigns: 25,
    features: ['basic_campaigns', 'basic_stats', 'custom_branding', 'email_support'],
  },
  pro: {
    members: 20,
    campaigns: 100,
    features: ['all_campaigns', 'advanced_stats', 'custom_branding', 'priority_support', 'api_access'],
  },
  enterprise: {
    members: -1, // Illimité
    campaigns: -1, // Illimité
    features: ['all_campaigns', 'advanced_stats', 'custom_branding', 'dedicated_support', 'api_access', 'white_label', 'custom_domain', 'sso'],
  },
};

// Helper pour vérifier une permission
export function hasPermission(role: MemberRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Helper pour vérifier si un rôle peut modifier un autre rôle
export function canManageRole(managerRole: MemberRole, targetRole: MemberRole): boolean {
  const hierarchy: Record<MemberRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };
  
  // Un owner peut tout gérer
  if (managerRole === 'owner') return true;
  
  // Un admin peut gérer member et viewer
  if (managerRole === 'admin') {
    return hierarchy[targetRole] < hierarchy.admin;
  }
  
  return false;
}

// Labels français pour les rôles
export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  member: 'Membre',
  viewer: 'Observateur',
};

// Descriptions des rôles
export const ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  owner: 'Accès total à l\'organisation, gestion de l\'abonnement',
  admin: 'Gestion des membres et des campagnes',
  member: 'Création et modification des campagnes',
  viewer: 'Consultation uniquement',
};
