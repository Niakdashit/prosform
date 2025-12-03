import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  BarChart3,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Shield,
  Crown,
  Loader2,
  Plus,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  member_count?: number;
  campaign_count?: number;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_super_admin: boolean;
  created_at: string;
  organizations?: { name: string; role: string }[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: isOrgLoading } = useOrganization();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchOrg, setSearchOrg] = useState('');
  const [searchUser, setSearchUser] = useState('');
  
  // Dialog states
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState('free');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Attendre que le contexte ait fini de charger
    if (isOrgLoading) return;
    
    if (!isSuperAdmin) {
      navigate('/campaigns');
      toast.error('Accès réservé aux Super Admins');
      return;
    }
    loadData();
  }, [isSuperAdmin, isOrgLoading, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Charger les organisations avec stats
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsData) {
        // Enrichir avec le nombre de membres et campagnes
        const enrichedOrgs = await Promise.all(
          orgsData.map(async (org) => {
            const { count: memberCount } = await supabase
              .from('organization_members')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id);
            
            const { count: campaignCount } = await supabase
              .from('campaigns')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id);

            return {
              ...org,
              member_count: memberCount || 0,
              campaign_count: campaignCount || 0,
            };
          })
        );
        setOrganizations(enrichedOrgs);
      }

      // Charger les utilisateurs
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) {
        // Enrichir avec les organisations
        const enrichedUsers = await Promise.all(
          usersData.map(async (user) => {
            const { data: memberships } = await supabase
              .from('organization_members')
              .select('role, organization:organizations(name)')
              .eq('user_id', user.id);

            // Récupérer l'email depuis auth.users via une fonction
            const { data: authUser } = await supabase.rpc('get_user_email', { user_id: user.id });

            return {
              ...user,
              email: authUser || 'Email non disponible',
              organizations: memberships?.map((m: any) => ({
                name: m.organization?.name,
                role: m.role,
              })) || [],
            };
          })
        );
        setUsers(enrichedUsers);
      }

      // Calculer les stats
      const { count: totalCampaigns } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true });

      const { count: activeCampaigns } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'online');

      setStats({
        totalOrgs: orgsData?.length || 0,
        totalUsers: usersData?.length || 0,
        totalCampaigns: totalCampaigns || 0,
        activeCampaigns: activeCampaigns || 0,
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      toast.error('Veuillez entrer un nom');
      return;
    }

    setIsCreating(true);
    try {
      const slug = newOrgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName,
          slug: slug + '-' + Date.now().toString(36),
          plan: newOrgPlan,
        });

      if (error) throw error;

      toast.success('Organisation créée');
      setShowCreateOrgDialog(false);
      setNewOrgName('');
      setNewOrgPlan('free');
      loadData();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm('Supprimer cette organisation et toutes ses données ?')) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      toast.success('Organisation supprimée');
      loadData();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleSuperAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_super_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(currentStatus ? 'Droits Super Admin retirés' : 'Droits Super Admin accordés');
      loadData();
    } catch (error) {
      console.error('Error updating super admin status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchOrg.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchOrg.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'pro': return 'secondary';
      case 'starter': return 'outline';
      default: return 'outline';
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Administration
            </h1>
            <p className="text-muted-foreground">
              Gérez toutes les organisations et utilisateurs
            </p>
          </div>
          <Badge variant="destructive" className="gap-1">
            <Crown className="w-3 h-3" />
            Super Admin
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organisations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrgs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campagnes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En ligne</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="organizations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="organizations" className="gap-2">
              <Building2 className="w-4 h-4" />
              Organisations
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Utilisateurs
            </TabsTrigger>
          </TabsList>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une organisation..."
                  value={searchOrg}
                  onChange={(e) => setSearchOrg(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowCreateOrgDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle organisation
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Membres</TableHead>
                    <TableHead>Campagnes</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrgs.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-sm text-muted-foreground">{org.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPlanBadgeVariant(org.plan)} className="capitalize">
                          {org.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>{org.member_count}</TableCell>
                      <TableCell>{org.campaign_count}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(org.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/organizations/${org.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteOrganization(org.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrgs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Aucune organisation trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Organisations</TableHead>
                    <TableHead>Rôle global</TableHead>
                    <TableHead>Inscrit le</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(user.full_name, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || 'Sans nom'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.organizations?.map((org, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {org.name} ({org.role})
                            </Badge>
                          ))}
                          {(!user.organizations || user.organizations.length === 0) && (
                            <span className="text-muted-foreground text-sm">Aucune</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_super_admin ? (
                          <Badge variant="destructive" className="gap-1">
                            <Crown className="w-3 h-3" />
                            Super Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">Utilisateur</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleToggleSuperAdmin(user.id, user.is_super_admin)}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {user.is_super_admin ? 'Retirer Super Admin' : 'Promouvoir Super Admin'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateOrgDialog} onOpenChange={setShowCreateOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une organisation</DialogTitle>
            <DialogDescription>
              Créez une nouvelle organisation pour un client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l'organisation</label>
              <Input
                placeholder="Acme Inc."
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select value={newOrgPlan} onValueChange={setNewOrgPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateOrgDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateOrganization} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
