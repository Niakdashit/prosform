import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function OrganizationSwitcher() {
  const { 
    currentOrganization, 
    organizations, 
    switchOrganization,
    createOrganization,
    isLoading 
  } = useOrganization();
  
  const [open, setOpen] = useState(false);
  const [showNewOrgDialog, setShowNewOrgDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      toast.error('Veuillez entrer un nom pour l\'organisation');
      return;
    }
    
    setIsCreating(true);
    const org = await createOrganization(newOrgName.trim());
    setIsCreating(false);
    
    if (org) {
      toast.success('Organisation créée avec succès');
      setShowNewOrgDialog(false);
      setNewOrgName('');
    } else {
      toast.error('Erreur lors de la création de l\'organisation');
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[200px] justify-between" disabled>
        <span className="truncate">Chargement...</span>
      </Button>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Sélectionner une organisation"
            className="w-[200px] justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {currentOrganization?.name || 'Sélectionner...'}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Rechercher..." />
            <CommandList>
              <CommandEmpty>Aucune organisation trouvée.</CommandEmpty>
              <CommandGroup heading="Organisations">
                {organizations.map((org) => (
                  <CommandItem
                    key={org.id}
                    onSelect={() => {
                      switchOrganization(org.id);
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span className="truncate">{org.name}</span>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        currentOrganization?.id === org.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowNewOrgDialog(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une organisation
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showNewOrgDialog} onOpenChange={setShowNewOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une organisation</DialogTitle>
            <DialogDescription>
              Créez une nouvelle organisation pour collaborer avec votre équipe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Nom de l'organisation</Label>
              <Input
                id="org-name"
                placeholder="Mon entreprise"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateOrganization();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewOrgDialog(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateOrganization} disabled={isCreating}>
              {isCreating ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
