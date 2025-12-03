import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  UserMinus,
  Crown,
  Users,
  Loader2
} from 'lucide-react';
import { 
  MemberRole, 
  ROLE_LABELS, 
  ROLE_DESCRIPTIONS,
  canManageRole 
} from '@/types/organization';

export default function Team() {
  const { 
    currentOrganization,
    members,
    userRole,
    isAdmin,
    inviteMember,
    removeMember,
    updateMemberRole,
    hasPermission
  } = useOrganization();

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Veuillez entrer une adresse email');
      return;
    }

    setIsInviting(true);
    const success = await inviteMember(inviteEmail.trim(), inviteRole);
    setIsInviting(false);

    if (success) {
      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('member');
    } else {
      toast.error('Erreur lors de l\'envoi de l\'invitation');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    const success = await removeMember(memberToRemove);
    setIsRemoving(false);

    if (success) {
      toast.success('Membre retiré de l\'organisation');
    } else {
      toast.error('Erreur lors de la suppression du membre');
    }
    setMemberToRemove(null);
  };

  const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
    const success = await updateMemberRole(memberId, newRole);
    if (success) {
      toast.success('Rôle mis à jour');
    } else {
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const getInitials = (name: string | null | undefined, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  const getRoleBadgeVariant = (role: MemberRole) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'member': return 'outline';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3" />;
      case 'admin': return <Shield className="h-3 w-3" />;
      default: return null;
    }
  };

  const canInvite = hasPermission('members:invite');
  const canManageMembers = hasPermission('members:remove');

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Équipe</h1>
            <p className="text-muted-foreground">
              Gérez les membres de {currentOrganization?.name || 'votre organisation'}
            </p>
          </div>
          {canInvite && (
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Inviter un membre
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inviter un membre</DialogTitle>
                  <DialogDescription>
                    Envoyez une invitation par email pour rejoindre votre organisation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="collegue@entreprise.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MemberRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {userRole && canManageRole(userRole, 'admin') && (
                          <SelectItem value="admin">
                            <div className="flex flex-col">
                              <span>{ROLE_LABELS.admin}</span>
                              <span className="text-xs text-muted-foreground">
                                {ROLE_DESCRIPTIONS.admin}
                              </span>
                            </div>
                          </SelectItem>
                        )}
                        <SelectItem value="member">
                          <div className="flex flex-col">
                            <span>{ROLE_LABELS.member}</span>
                            <span className="text-xs text-muted-foreground">
                              {ROLE_DESCRIPTIONS.member}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="viewer">
                          <div className="flex flex-col">
                            <span>{ROLE_LABELS.viewer}</span>
                            <span className="text-xs text-muted-foreground">
                              {ROLE_DESCRIPTIONS.viewer}
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleInvite} disabled={isInviting}>
                    {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Envoyer l'invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total membres</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                sur {currentOrganization?.max_members === -1 ? '∞' : currentOrganization?.max_members} max
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter(m => m.role === 'owner' || m.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {currentOrganization?.plan || 'Free'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members list */}
        <Card>
          <CardHeader>
            <CardTitle>Membres</CardTitle>
            <CardDescription>
              Liste des membres de votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Rejoint le</TableHead>
                  {canManageMembers && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user?.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(member.user?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.user?.full_name || 'Utilisateur'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {/* Email would come from auth.users join */}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                        {getRoleIcon(member.role)}
                        {ROLE_LABELS[member.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.joined_at 
                        ? new Date(member.joined_at).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </TableCell>
                    {canManageMembers && (
                      <TableCell>
                        {member.role !== 'owner' && userRole && canManageRole(userRole, member.role) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {userRole === 'owner' && member.role !== 'admin' && (
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(member.id, 'admin')}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Promouvoir admin
                                </DropdownMenuItem>
                              )}
                              {member.role === 'admin' && userRole === 'owner' && (
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(member.id, 'member')}
                                >
                                  Rétrograder en membre
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setMemberToRemove(member.id)}
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Retirer de l'organisation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Roles explanation */}
        <Card>
          <CardHeader>
            <CardTitle>Rôles et permissions</CardTitle>
            <CardDescription>
              Comprendre les différents niveaux d'accès
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {(['owner', 'admin', 'member', 'viewer'] as MemberRole[]).map((role) => (
                <div key={role} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge variant={getRoleBadgeVariant(role)} className="mt-0.5 gap-1">
                    {getRoleIcon(role)}
                    {ROLE_LABELS[role]}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {ROLE_DESCRIPTIONS[role]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Remove member confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette personne n'aura plus accès à l'organisation et à ses campagnes.
              Cette action peut être annulée en réinvitant la personne.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRemoving}
            >
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
