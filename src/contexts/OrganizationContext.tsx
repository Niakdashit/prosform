import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import type { 
  Organization, 
  OrganizationMember, 
  UserProfile, 
  MemberRole,
  ROLE_PERMISSIONS 
} from '@/types/organization';
import { hasPermission } from '@/types/organization';

interface OrganizationContextType {
  // État
  currentOrganization: Organization | null;
  organizations: Organization[];
  members: OrganizationMember[];
  userProfile: UserProfile | null;
  userRole: MemberRole | null;
  isLoading: boolean;
  
  // Actions
  switchOrganization: (organizationId: string) => Promise<void>;
  createOrganization: (name: string) => Promise<Organization | null>;
  updateOrganization: (updates: Partial<Organization>) => Promise<boolean>;
  inviteMember: (email: string, role: MemberRole) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  updateMemberRole: (memberId: string, newRole: MemberRole) => Promise<boolean>;
  refreshOrganization: () => Promise<void>;
  
  // Permissions
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<MemberRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le profil utilisateur et ses organisations
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      resetState();
    }
  }, [user]);

  const resetState = () => {
    setCurrentOrganization(null);
    setOrganizations([]);
    setMembers([]);
    setUserProfile(null);
    setUserRole(null);
    setIsLoading(false);
  };

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Charger le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('🔍 Profile loaded:', profile, 'Error:', profileError);
      
      if (profile) {
        setUserProfile(profile as UserProfile);
        console.log('✅ isSuperAdmin:', profile.is_super_admin);
      }
      
      // Charger les organisations de l'utilisateur
      const { data: memberships } = await supabase
        .from('organization_members')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user.id);
      
      if (memberships && memberships.length > 0) {
        const orgs = memberships
          .map(m => m.organization)
          .filter(Boolean) as Organization[];
        
        setOrganizations(orgs);
        
        // Définir l'organisation courante
        const currentOrgId = profile?.current_organization_id || orgs[0]?.id;
        const currentOrg = orgs.find(o => o.id === currentOrgId) || orgs[0];
        
        if (currentOrg) {
          setCurrentOrganization(currentOrg);
          
          // Trouver le rôle de l'utilisateur dans cette organisation
          const membership = memberships.find(m => m.organization_id === currentOrg.id);
          setUserRole(membership?.role as MemberRole || null);
          
          // Charger les membres de l'organisation courante
          await loadOrganizationMembers(currentOrg.id);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrganizationMembers = async (organizationId: string) => {
    const { data } = await supabase
      .from('organization_members')
      .select(`
        *,
        user:user_profiles(*)
      `)
      .eq('organization_id', organizationId);
    
    if (data) {
      setMembers(data as OrganizationMember[]);
    }
  };

  const switchOrganization = async (organizationId: string) => {
    if (!user) return;
    
    const org = organizations.find(o => o.id === organizationId);
    if (!org) return;
    
    // Mettre à jour le profil utilisateur
    await supabase
      .from('user_profiles')
      .update({ current_organization_id: organizationId })
      .eq('id', user.id);
    
    setCurrentOrganization(org);
    
    // Mettre à jour le rôle
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();
    
    setUserRole(membership?.role as MemberRole || null);
    
    // Charger les membres
    await loadOrganizationMembers(organizationId);
  };

  const createOrganization = async (name: string): Promise<Organization | null> => {
    if (!user) return null;
    
    try {
      // Appeler la fonction SQL pour créer l'organisation
      const { data, error } = await supabase
        .rpc('create_organization_with_owner', {
          org_name: name,
          owner_user_id: user.id
        });
      
      if (error) throw error;
      
      // Recharger les données
      await loadUserData();
      
      // Retourner la nouvelle organisation
      const { data: newOrg } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', data)
        .single();
      
      return newOrg as Organization;
    } catch (error) {
      console.error('Error creating organization:', error);
      return null;
    }
  };

  const updateOrganization = async (updates: Partial<Organization>): Promise<boolean> => {
    if (!currentOrganization) return false;
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', currentOrganization.id);
      
      if (error) throw error;
      
      setCurrentOrganization({ ...currentOrganization, ...updates });
      return true;
    } catch (error) {
      console.error('Error updating organization:', error);
      return false;
    }
  };

  const inviteMember = async (email: string, role: MemberRole): Promise<boolean> => {
    if (!currentOrganization || !user) return false;
    
    try {
      // Générer un token unique
      const token = crypto.randomUUID();
      
      const { error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: currentOrganization.id,
          email,
          role,
          token,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
        });
      
      if (error) throw error;
      
      // TODO: Envoyer l'email d'invitation
      
      return true;
    } catch (error) {
      console.error('Error inviting member:', error);
      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      
      setMembers(members.filter(m => m.id !== memberId));
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  };

  const updateMemberRole = async (memberId: string, newRole: MemberRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);
      
      if (error) throw error;
      
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      return false;
    }
  };

  const refreshOrganization = async () => {
    await loadUserData();
  };

  // Vérifier une permission
  const checkPermission = (permission: string): boolean => {
    if (userProfile?.is_super_admin) return true;
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    members,
    userProfile,
    userRole,
    isLoading,
    switchOrganization,
    createOrganization,
    updateOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
    refreshOrganization,
    hasPermission: checkPermission,
    isSuperAdmin: userProfile?.is_super_admin ?? false,
    isOwner: userRole === 'owner',
    isAdmin: userRole === 'owner' || userRole === 'admin',
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
